import { SCORE_BANDS, WEIGHTED_RULES } from '../constants/scoring';

export function getScoreBand(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min && score <= b.max) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function formatRuleName(ruleId: string): string {
  const matchedRule = WEIGHTED_RULES.find((r) => r.id === ruleId);
  if (matchedRule) return matchedRule.rule;

  return ruleId
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRuleDescription(ruleId: string): string {
  const matchedRule = WEIGHTED_RULES.find((r) => r.id === ruleId);
  if (matchedRule?.description) return matchedRule.description;
  return 'No description available for this rule.';
}
