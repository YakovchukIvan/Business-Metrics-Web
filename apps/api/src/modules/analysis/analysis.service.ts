import { Injectable, Inject } from '@nestjs/common';
import type { IGooglePlacesPort } from '../google-places/interfaces/google-places-port.interface';
import { GOOGLE_PLACES_PORT } from '../../common/constants/google-places.constants';
import type { AnalysisResult } from './interfaces/analysis-result.interface';
import { ANALYSIS_RULES } from './rules';
import type { RuleIssue } from './interfaces/rule.interface';

@Injectable()
export class AnalysisService {
  constructor(@Inject(GOOGLE_PLACES_PORT) private readonly googlePlacesPort: IGooglePlacesPort) {}

  async analyzeProfile(inputUrlOrId: string): Promise<AnalysisResult> {
    const placeId = await this.googlePlacesPort.resolvePlaceId(inputUrlOrId);
    const profile = await this.googlePlacesPort.getPlaceProfile(placeId);

    const results = ANALYSIS_RULES.map((rule) => rule(profile));

    const applicableWeight = results.filter((r) => r.applicable).reduce((sum, r) => sum + r.weight, 0);

    let rawScore = 0;
    const breakdown = [];
    const rawIssues: Array<RuleIssue & { ruleId: string; rawGain: number }> = [];

    for (const result of results) {
      if (result.applicable) {
        rawScore += result.score;
      }

      breakdown.push({
        ruleId: result.ruleId,
        weight: result.weight,
        score: result.score,
        passed: result.passed,
        applicable: result.applicable,
      });

      if (result.applicable && result.issues.length > 0) {
        let remainingGain = Math.round(result.weight - result.score);
        const issuesCount = result.issues.length;

        result.issues.forEach((issue, index) => {
          const isLast = index === issuesCount - 1;
          const issueGain = isLast ? remainingGain : Math.round(remainingGain / (issuesCount - index));
          remainingGain -= issueGain;

          rawIssues.push({
            ruleId: result.ruleId,
            rawGain: issueGain,
            ...issue,
          });
        });
      }
    }

    const totalScore = applicableWeight > 0 ? Math.round((rawScore / applicableWeight) * 100) : 0;

    let remainingNormalizedGain = 100 - totalScore;
    const totalRawGain = rawIssues.reduce((sum, issue) => sum + issue.rawGain, 0);

    const allIssues = rawIssues.map((issue, index) => {
      const isLast = index === rawIssues.length - 1;
      let normalizedGain = 0;

      if (totalRawGain > 0) {
        if (isLast) {
          normalizedGain = remainingNormalizedGain;
        } else {
          // Distribute the 100-based missing points proportionally to the raw missing points
          normalizedGain = Math.round((issue.rawGain / totalRawGain) * (100 - totalScore));
          remainingNormalizedGain -= normalizedGain;
        }
      }

      return {
        ruleId: issue.ruleId,
        message: issue.message,
        recommendation: issue.recommendation,
        potentialGain: normalizedGain,
      };
    });

    return {
      placeId,
      businessName: profile.displayName,
      address: profile.formattedAddress || null,
      score: totalScore,
      breakdown,
      issues: allIssues,
      rawProfile: profile,
    };
  }
}
