'use client';

import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label, PolarRadiusAxis, PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { HelpTooltip } from '@/components/ui/help-tooltip';

import { SCORE_BANDS } from '@/lib/constants/scoring';
import { getScoreBand } from '@/lib/utils/scoring';

function ScoreRing({ score }: { score: number }) {
  const band = getScoreBand(score);
  const color = band?.cssVar || 'var(--color-status-fail)';

  const chartData = [{ name: 'score', value: score, fill: color }];

  const chartConfig = {
    score: {
      label: 'Score',
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square w-45 h-45">
        <RadialBarChart
          data={chartData}
          innerRadius={70}
          outerRadius={85}
          startAngle={90}
          endAngle={-270}
          barSize={12}
          className="score-ring-chart"
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="text-5xl font-bold tracking-tighter"
                        style={{ fill: color }}
                      >
                        {chartData[0]!.value}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 28}
                        className="fill-gray-500 text-xs font-medium uppercase tracking-widest"
                      >
                        out of 100
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}

type Props = { score: number; businessName: string; address?: string };

export function ScoreCard({ score, businessName, address }: Props) {
  return (
    <Card className="flex flex-col gap-0 overflow-hidden h-full">
      <CardHeader className="px-6 py-4 border-b border-card-divider shrink-0">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          Profile optimization score
          <HelpTooltip
            icon="alert"
            contentClassName="w-96 p-5"
            content={
              <div className="space-y-4">
                {SCORE_BANDS.map((band, idx, arr) => (
                  <div key={band.label}>
                    <div className="flex items-start gap-3 py-1">
                      <div className="w-16 text-right font-medium text-gray-900 shrink-0 text-sm pt-0.5 tabular-nums">
                        {band.range}
                      </div>
                      <div className={cn('w-2 h-2 rounded-full shrink-0 mt-2', band.color)} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 leading-none mb-1">{band.label}</div>
                        <div className="text-xs text-gray-500 leading-tight">{band.desc}</div>
                      </div>
                    </div>
                    {idx !== arr.length - 1 && <hr className="border-card-divider" />}
                  </div>
                ))}
              </div>
            }
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
        <ScoreRing score={score} />
        <div className="mt-8 text-center">
          <div className="text-lg font-semibold text-gray-900">{businessName}</div>
          <div className="text-sm text-gray-500 mt-1">{address || 'Google Business Profile'}</div>
        </div>
      </CardContent>
    </Card>
  );
}
