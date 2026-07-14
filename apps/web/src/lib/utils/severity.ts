import type { AnalysisResult } from '../types/analysis';

export const PASS_RATIO_THRESHOLD = 0.8;
export const CRITICAL_RATIO_THRESHOLD = 0.5;

export type Severity = 'critical' | 'warning';

interface RuleScore {
  earned: number;
  max: number;
  ratio: number;
  severity: Severity;
}

export function resolveRuleScore(
  issue: AnalysisResult['issues'][number],
  breakdown: AnalysisResult['breakdown'],
): RuleScore {
  const rule = breakdown.find((r) => r.ruleId === issue.ruleId);
  const earned = rule?.score ?? 0;
  const max = rule?.weight ?? issue.potentialGain;
  const ratio = max > 0 ? earned / max : 0;
  const severity: Severity = ratio < CRITICAL_RATIO_THRESHOLD ? 'critical' : 'warning';

  return { earned, max, ratio, severity };
}
