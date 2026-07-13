import type { RuleResult, RuleIssue } from './rule.interface';

export interface AnalysisResult {
  businessName: string;
  address: string | null;
  score: number;
  breakdown: Omit<RuleResult, 'issues'>[];
  issues: Array<RuleIssue & { ruleId: string; potentialGain: number }>;
}
