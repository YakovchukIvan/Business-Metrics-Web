import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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

export function IssuesList({ problems, recommendations }: { problems: Problem[]; recommendations: Recommendation[] }) {
  if (problems.length === 0) return null;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-8 mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          Identified problems
          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-md text-xs font-sans">{problems.length}</span>
        </h3>
        <h3 className="text-lg font-medium text-gray-900 hidden md:flex items-center gap-2">
          Recommendations
          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-md text-xs font-sans">
            {recommendations.filter(Boolean).length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {problems.map((problem, index) => {
          const rec = recommendations[index];
          return (
            <React.Fragment key={problem.id}>
              {/* Problem Card */}
              <Card className="flex flex-col justify-center h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {problem.severity === 'critical' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-gray-900">{problem.ruleName}</span>
                        <span
                          className={cn(
                            'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full',
                            problem.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {problem.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{problem.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation Card */}
              {rec && (
                <Card className="flex flex-col justify-center h-full mt-4 md:mt-0">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 opacity-40" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-gray-900">Recommended Action</span>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            +{rec.max - rec.earned} pts
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{rec.action}</p>
                        {rec.docsUrl && (
                          <a
                            href={rec.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 mt-3 hover:underline"
                          >
                            How to fix <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
