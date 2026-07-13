'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label, PolarRadiusAxis, PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

function ScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = score / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  let color = '#22c55e'; // green-500
  if (score <= 42)
    color = '#ef4444'; // red-500
  else if (score <= 74) color = '#f59e0b'; // amber-500

  const chartData = [{ name: 'score', value: displayScore, fill: color }];

  const chartConfig = {
    score: {
      label: 'Score',
      color: color,
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square w-[180px] h-[180px]">
        <RadialBarChart data={chartData} innerRadius={70} outerRadius={85} startAngle={90} endAngle={-270} barSize={12}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: '#e5e7eb' }} cornerRadius={10} />
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
                        {chartData[0].value}
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

export function ScoreCard({ score, businessName }: { score: number; businessName: string }) {
  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <CardHeader className="px-6 py-4 border-b border-gray-300/80 shrink-0">
        <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
          Profile optimization score
          <HoverCard openDelay={200} closeDelay={200}>
            <HoverCardTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 rounded-full cursor-help">
                <AlertCircle className="w-4 h-4" />
                <span className="sr-only">Score guide</span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent side="top" align="center" className="w-96 p-5 shadow-xl border-gray-200">
              <div className="space-y-4">
                {[
                  {
                    range: '0–24',
                    color: 'bg-red-500',
                    label: 'Critical',
                    desc: 'Major optimization issues detected.',
                  },
                  {
                    range: '25–49',
                    color: 'bg-red-500',
                    label: 'Poor',
                    desc: 'Basic optimization exists, but many important elements are missing.',
                  },
                  {
                    range: '50–64',
                    color: 'bg-amber-500',
                    label: 'Fair',
                    desc: 'Profile is functional but requires several improvements.',
                  },
                  {
                    range: '65–79',
                    color: 'bg-amber-500',
                    label: 'Good',
                    desc: 'Well optimized with noticeable room for improvement.',
                  },
                  {
                    range: '80–89',
                    color: 'bg-green-500',
                    label: 'Very Good',
                    desc: 'Strong profile with only minor recommendations.',
                  },
                  {
                    range: '90–100',
                    color: 'bg-green-500',
                    label: 'Excellent',
                    desc: 'Profile is highly optimized and follows best practices.',
                  },
                ].map((band) => (
                  <div key={band.label} className="flex items-start gap-3">
                    <div className="w-16 text-right font-medium text-gray-900 shrink-0 text-sm pt-0.5 tabular-nums">
                      {band.range}
                    </div>
                    <div className={cn('w-2 h-2 rounded-full shrink-0 mt-2', band.color)} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 leading-none mb-1">{band.label}</div>
                      <div className="text-xs text-gray-500 leading-tight">{band.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
        <ScoreRing score={score} />
        <div className="mt-8 text-center">
          <div className="text-lg font-semibold text-gray-900">{businessName}</div>
          <div className="text-sm text-gray-500 mt-1">Google Business Profile</div>
        </div>
      </CardContent>
    </Card>
  );
}
