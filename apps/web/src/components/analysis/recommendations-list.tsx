import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Recommendation } from '@/types/models';

type Props = { rec: Recommendation };

export function RecommendationCard({ rec }: Props) {
  return (
    <Card className="flex flex-col justify-center h-full">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-status-pass shrink-0 mt-0.5 opacity-60" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-sm font-semibold text-gray-900">Recommended Action</span>
              <span className="text-[12px] font-bold px-2 py-1 rounded-full shrink-0 tabular-nums bg-status-pass/15 text-status-pass">
                Impact: +{rec.max - rec.earned}
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
  );
}
