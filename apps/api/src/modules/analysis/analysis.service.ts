import { Injectable, Inject } from '@nestjs/common';
import type { IGooglePlacesPort } from '../google-places/interfaces/google-places-port.interface';
import { GOOGLE_PLACES_PORT } from '../../common/constants/google-places.constants';
import type { AnalysisResult, RuleBreakdown } from './interfaces/analysis-result.interface';
import { ANALYSIS_RULES } from './rules';
import type { RuleIssue } from './interfaces/rule.interface';
import { RULE_WEIGHTS } from './constants/analysis.constants';

function distributePoints(weights: Record<string, number>, totalPoints = 100): Record<string, number> {
  const totalBase = Object.values(weights).reduce((a, b) => a + b, 0);
  if (totalBase === 0) {
    return {};
  }

  const exactPoints = Object.entries(weights).map(([id, weight]) => ({
    id,
    exact: (weight / totalBase) * totalPoints,
    floor: Math.floor((weight / totalBase) * totalPoints),
  }));

  const currentTotal = exactPoints.reduce((sum, item) => sum + item.floor, 0);
  let remainder = totalPoints - currentTotal;

  exactPoints.sort((a, b) => b.exact - b.floor - (a.exact - a.floor));

  const result: Record<string, number> = {};
  for (const item of exactPoints) {
    if (remainder > 0) {
      result[item.id] = item.floor + 1;
      remainder--;
    } else {
      result[item.id] = item.floor;
    }
  }

  return result;
}

@Injectable()
export class AnalysisService {
  constructor(@Inject(GOOGLE_PLACES_PORT) private readonly googlePlacesPort: IGooglePlacesPort) {}

  async analyzeProfile(inputUrlOrId: string): Promise<AnalysisResult> {
    const placeId = await this.googlePlacesPort.resolvePlaceId(inputUrlOrId);
    const profile = await this.googlePlacesPort.getPlaceProfile(placeId);

    const results = ANALYSIS_RULES.map((rule) => rule(profile));

    const applicableBaseWeights: Record<string, number> = {};
    for (const r of results) {
      if (r.applicable) {
        const key = r.ruleId as keyof typeof RULE_WEIGHTS;
        applicableBaseWeights[r.ruleId] = RULE_WEIGHTS[key] ?? 5;
      }
    }

    const dynamicMaxWeights = distributePoints(applicableBaseWeights, 100);

    let totalScore = 0;
    const breakdown: RuleBreakdown[] = [];
    const allIssues: Array<RuleIssue & { ruleId: string; potentialGain: number }> = [];

    for (const r of results) {
      const key = r.ruleId as keyof typeof RULE_WEIGHTS;
      if (!r.applicable) {
        breakdown.push({
          ruleId: r.ruleId,
          weight: RULE_WEIGHTS[key] ?? 5,
          score: 0,
          passed: true,
          applicable: false,
        });
        continue;
      }

      const maxWeight = dynamicMaxWeights[r.ruleId] || 0;
      const earned = Math.round(r.successRatio * maxWeight);

      totalScore += earned;

      breakdown.push({
        ruleId: r.ruleId,
        weight: maxWeight,
        score: earned,
        passed: r.passed,
        applicable: true,
      });

      if (r.issues.length > 0) {
        let remainingGain = maxWeight - earned;
        const issuesCount = r.issues.length;

        r.issues.forEach((issue, index) => {
          const isLast = index === issuesCount - 1;
          const issueGain = isLast ? remainingGain : Math.round(remainingGain / (issuesCount - index));
          remainingGain -= issueGain;

          allIssues.push({
            ruleId: r.ruleId,
            potentialGain: issueGain,
            ...issue,
          });
        });
      }
    }

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
