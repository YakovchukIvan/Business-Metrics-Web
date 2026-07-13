import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface Rule {
  id: string;
  name: string;
  earned: number;
  max: number;
  status: 'pass' | 'warn' | 'fail';
}

export function BreakdownCard({ rules }: { rules: Rule[] }) {
  return (
    <Card className="flex flex-col overflow-hidden max-h-[400px]">
      <CardHeader className="px-6 py-4 border-b border-gray-300/80 shrink-0">
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
          Rule breakdown
          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-md text-xs">{rules.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full overflow-y-auto p-6 flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className={cn(
              'flex items-center gap-3 py-3 px-2 rounded-md',
              idx !== rules.length - 1 ? 'border-b border-gray-300/60' : '',
            )}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                rule.status === 'pass' && 'bg-green-500',
                rule.status === 'warn' && 'bg-amber-500',
                rule.status === 'fail' && 'bg-red-500',
              )}
            />
            <span className="text-sm font-medium text-gray-900 flex-1 truncate min-w-0 pr-2">{rule.name}</span>
            <Progress
              value={(rule.earned / rule.max) * 100}
              className="w-16 sm:w-24 shrink-0"
              indicatorClassName={cn(
                rule.status === 'pass' && 'bg-green-500',
                rule.status === 'warn' && 'bg-amber-500',
                rule.status === 'fail' && 'bg-red-500',
              )}
            />
            <span className="text-sm text-gray-500 tabular-nums w-16 text-right shrink-0 whitespace-nowrap">
              {rule.earned} / {rule.max}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
