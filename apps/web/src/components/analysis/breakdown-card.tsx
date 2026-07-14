import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Rule } from '@/types/models';

type Props = { rules: Rule[] };

export function BreakdownCard({ rules }: Props) {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden h-full">
      <CardHeader className="px-6 py-4 border-b border-card-divider shrink-0">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          Rule breakdown
          <span className="inline-flex items-center justify-center bg-foreground text-background text-[10px] font-bold leading-none size-4 rounded-full -translate-y-1 -ml-0.5">
            {rules.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full overflow-y-auto p-6 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {rules.map((rule, idx, arr) => (
          <div key={rule.id} className="contents">
            <div className="flex items-center gap-3 py-3 px-2 rounded-md">
              <div
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  rule.status === 'pass' && 'bg-status-pass',
                  rule.status === 'warn' && 'bg-status-warn',
                  rule.status === 'fail' && 'bg-status-fail',
                  rule.status === 'na' && 'bg-gray-300',
                )}
              />
              <span className="text-sm font-medium text-gray-900 flex-1 truncate min-w-0 pr-2">{rule.name}</span>
              {rule.applicable ? (
                <>
                  <Progress
                    value={(rule.earned / rule.max) * 100}
                    className="w-16 sm:w-24 shrink-0"
                    indicatorClassName={cn(
                      rule.status === 'pass' && 'bg-status-pass',
                      rule.status === 'warn' && 'bg-status-warn',
                      rule.status === 'fail' && 'bg-status-fail',
                    )}
                  />
                  <span className="text-sm text-gray-500 tabular-nums w-16 text-right shrink-0 whitespace-nowrap">
                    {rule.earned} / {rule.max}
                  </span>
                </>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 shrink-0">
                  N/A
                </span>
              )}
            </div>
            {idx !== arr.length - 1 && <hr className="border-card-divider" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
