export interface Rule {
  id: string;
  name: string;
  earned: number;
  max: number;
  status: 'pass' | 'warn' | 'fail';
}

export interface Problem {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'warning' | 'critical';
  explanation: string;
  earned: number;
  max: number;
}

export interface Recommendation {
  id: string;
  problemId: string;
  action: string;
  severity: 'warning' | 'critical';
  earned: number;
  max: number;
  docsUrl?: string;
}

export interface RecentSearch {
  input: string;
  businessName: string;
  cachedAt: number;
}
