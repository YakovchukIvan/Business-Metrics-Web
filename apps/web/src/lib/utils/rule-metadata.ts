import { WEIGHTED_RULES } from '../constants/scoring';

const RULE_META_BY_ID = new Map(WEIGHTED_RULES.map((rule) => [rule.id, rule]));

export function formatRuleName(ruleId: string): string {
  const matched = RULE_META_BY_ID.get(ruleId);
  if (matched) return matched.rule;

  return ruleId
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatRuleDescription(ruleId: string): string {
  return RULE_META_BY_ID.get(ruleId)?.description ?? 'No description available for this rule.';
}
