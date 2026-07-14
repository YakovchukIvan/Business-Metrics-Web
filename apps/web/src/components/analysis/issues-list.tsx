import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

import type { Problem } from '@/types/models';

type Props = { problem: Problem };

export function IssueCard({ problem }: Props) {
  return (
    <Card className="flex flex-col justify-center h-full">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          {problem.severity === 'critical' ? (
            <AlertCircle className="w-5 h-5 text-severity-critical shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-severity-warning shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-gray-900">{problem.ruleName}</span>
              <span
                className={cn(
                  'text-[11px] font-bold px-2 py-1 rounded-full shrink-0 tabular-nums',
                  problem.severity === 'critical'
                    ? 'bg-severity-critical-bg text-severity-critical-text'
                    : 'bg-severity-warning-bg text-severity-warning-text',
                )}
              >
                {problem.earned}/{problem.max}pts
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{problem.explanation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
