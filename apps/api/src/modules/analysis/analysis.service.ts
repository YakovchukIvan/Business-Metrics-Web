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

    let totalScore = 0;
    const breakdown = [];
    const allIssues: Array<RuleIssue & { ruleId: string }> = [];

    for (const rule of ANALYSIS_RULES) {
      const result = rule(profile);
      totalScore += result.score;

      breakdown.push({
        ruleId: result.ruleId,
        weight: result.weight,
        score: result.score,
        passed: result.passed,
      });

      for (const issue of result.issues) {
        allIssues.push({
          ruleId: result.ruleId,
          ...issue,
        });
      }
    }

    totalScore = Math.round(totalScore);

    return {
      score: totalScore,
      breakdown,
      issues: allIssues,
    };
  }
}
