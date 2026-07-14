import React from 'react';
import { ScoreCard } from './score-card';
import { BreakdownCard } from './breakdown-card';
import { IssueCard } from './issues-list';
import { RecommendationCard } from './recommendations-list';
import { TransparencyPanel } from './transparency-panel';
import type { Rule, Problem, Recommendation } from '@/types/models';

type Props = {
  score: number;
  businessName: string;
  rules: Rule[];
  problems: Problem[];
  recommendations: Recommendation[];
};

export function ResultsPanel({ score, businessName, rules, problems, recommendations }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid lg:grid-cols-2 gap-8 mb-12 items-start">
        <ScoreCard score={score} businessName={businessName} />
        <BreakdownCard rules={rules} />
      </div>

      {problems.length > 0 && (
        <div className="mb-12">
          {/* Headers - hidden on mobile, visible on md+ */}
          <div className="hidden md:grid md:grid-cols-2 gap-8 mb-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Identified problems
              <span className="inline-flex items-center justify-center bg-foreground text-background text-[10px] font-bold leading-none size-4 rounded-full -translate-y-1 -ml-0.5">
                {problems.length}
              </span>
            </h3>
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              Recommendations
              <span className="inline-flex items-center justify-center bg-foreground text-background text-[10px] font-bold leading-none size-4 rounded-full -translate-y-1 -ml-0.5">
                {recommendations.length}
              </span>
            </h3>
          </div>

          {/* Paired Grid - alternating on mobile, side-by-side equal height rows on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {problems.map((problem, idx) => (
              <React.Fragment key={problem.id}>
                <div className="flex flex-col gap-2">
                  <div className="md:hidden">
                    <h3 className="text-lg font-medium text-foreground">Identified problem</h3>
                  </div>
                  <div className="flex-1">
                    <IssueCard problem={problem} />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-6 md:mb-0">
                  <div className="md:hidden">
                    <h3 className="text-lg font-medium text-foreground">Recommendation</h3>
                  </div>
                  <div className="flex-1">
                    <RecommendationCard rec={recommendations[idx]!} />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <TransparencyPanel />
    </div>
  );
}
