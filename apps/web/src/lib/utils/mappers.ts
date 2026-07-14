import type { AnalysisResult } from '../types/analysis';
import { formatRuleName, formatRuleDescription } from './rule-metadata';
import { resolveRuleScore, PASS_RATIO_THRESHOLD } from './severity';
import type { Rule, Problem, Recommendation } from '@/types/models';

export function mapRules(breakdown: AnalysisResult['breakdown']): Rule[] {
  return breakdown.map((rule) => {
    const name = formatRuleName(rule.ruleId);
    const description = formatRuleDescription(rule.ruleId);

    // Default to true for backwards-compatibility with cached data that lacks the field
    const applicable = rule.applicable !== false;
    if (!applicable) {
      return {
        id: rule.ruleId,
        name,
        description,
        earned: rule.score,
        max: rule.weight,
        status: 'na' as const,
        applicable: false,
      };
    }

    const ratio = rule.weight > 0 ? rule.score / rule.weight : 0;
    const status: Rule['status'] = rule.passed
      ? ratio >= PASS_RATIO_THRESHOLD
        ? 'pass'
        : 'warn'
      : ratio > 0
        ? 'warn'
        : 'fail';

    return { id: rule.ruleId, name, description, earned: rule.score, max: rule.weight, status, applicable: true };
  });
}

export function mapProblems(issues: AnalysisResult['issues'], breakdown: AnalysisResult['breakdown']): Problem[] {
  return issues.map((issue, idx) => {
    const { earned, max, severity } = resolveRuleScore(issue, breakdown);
    return {
      id: `p-${issue.ruleId}-${idx}`,
      ruleId: issue.ruleId,
      ruleName: formatRuleName(issue.ruleId),
      severity,
      explanation: issue.message,
      earned,
      max,
    };
  });
}

export function mapRecommendations(
  issues: AnalysisResult['issues'],
  breakdown: AnalysisResult['breakdown'],
): Recommendation[] {
  return issues.map((issue, idx) => {
    const { earned, max, severity } = resolveRuleScore(issue, breakdown);
    return {
      id: `r-${issue.ruleId}-${idx}`,
      problemId: `p-${issue.ruleId}-${idx}`,
      action: issue.recommendation,
      severity,
      earned,
      max,
      docsUrl: undefined,
    };
  });
}
