import { ScoreCard } from './score-card';
import { BreakdownCard, Rule } from './breakdown-card';
import { IssuesList, Problem, Recommendation } from './issues-list';
import { TransparencyPanel } from './transparency-panel';

export interface ResultsPanelProps {
  score: number;
  businessName: string;
  rules: Rule[];
  problems: Problem[];
  recommendations: Recommendation[];
}

export function ResultsPanel({ score, businessName, rules, problems, recommendations }: ResultsPanelProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid lg:grid-cols-2 gap-8 mb-12 items-start">
        <ScoreCard score={score} businessName={businessName} />
        <BreakdownCard rules={rules} />
      </div>
      <IssuesList problems={problems} recommendations={recommendations} />
      <TransparencyPanel />
    </div>
  );
}
