import type { RuleResult, RuleIssue } from './rule.interface';

export interface AnalysisResult {
  score: number;
  breakdown: Omit<RuleResult, 'issues'>[];
  issues: Array<RuleIssue & { ruleId: string }>;
}
