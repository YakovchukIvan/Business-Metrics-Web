import Link from 'next/link';
import { Info, Search, Loader2, CheckCircle2, Clock, AlertCircle, AlertTriangle, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export const metadata = {
  title: 'Documentation | ProfileLens',
};

export default function DocsPage() {
  return (
    <div className="flex-1 w-[1024px] max-w-full mx-auto px-4 md:px-0 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Documentation Header */}
      <div className="mb-12 border-b border-gray-200 pb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation</h1>
          <p className="text-gray-500 text-lg">Detailed guide on the Google Business Profile audit process.</p>
        </div>
        <Link href="/">
          <Button className="text-sm font-medium px-4 py-2 bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors flex items-center gap-2">
            ← Back to Auditor
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {/* 1. How it works */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-gray-300/80 shrink-0">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-400" />
              How it works
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <p className="text-gray-600 leading-relaxed mb-8 max-w-3xl">
              ProfileLens analyzes publicly available data from Google Business Profiles to determine how well an entry
              is optimized for local search and customer trust. We evaluate your profile against 8 weighted rules to
              generate a comprehensive optimization score.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Paste Link',
                  desc: 'Input a Google Maps URL, short link, or Place ID into the analyzer.',
                  icon: <Search className="w-4 h-4" />,
                },
                {
                  step: '2',
                  title: 'Analyze',
                  desc: 'Our engine fetches and evaluates 100+ data points in real-time.',
                  icon: <Loader2 className="w-4 h-4" />,
                },
                {
                  step: '3',
                  title: 'Improve',
                  desc: 'Review identified problems and follow recommendations to boost ranking.',
                  icon: <CheckCircle2 className="w-4 h-4" />,
                },
              ].map((item) => (
                <div key={item.step} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-md flex items-center justify-center mb-4 text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2. Scoring Algorithm */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-gray-300/80 shrink-0">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Scoring Algorithm
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
              {/* Weights Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Weighted Audit Rules</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 font-semibold text-gray-600">Metric</th>
                      <th className="px-6 py-3 font-semibold text-gray-600 text-right">Max Weight</th>
                      <th className="px-6 py-3 font-semibold text-gray-600">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { rule: 'Rating', weight: 30, priority: 'High' },
                      { rule: 'Completeness', weight: 20, priority: 'High' },
                      { rule: 'Business Category', weight: 15, priority: 'Medium' },
                      { rule: 'Opening Hours', weight: 15, priority: 'Medium' },
                      { rule: 'Business Status', weight: 10, priority: 'Medium' },
                      { rule: 'Photos', weight: 7, priority: 'Low' },
                      { rule: 'Attributes', weight: 3, priority: 'Low' },
                    ].map((row) => (
                      <tr key={row.rule} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{row.rule}</td>
                        <td className="px-6 py-4 text-right tabular-nums text-gray-600">{row.weight}pt</td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
                              row.priority === 'High'
                                ? 'bg-status-pass/10 text-status-pass border-status-pass/20'
                                : row.priority === 'Medium'
                                  ? 'bg-status-warn/10 text-status-warn border-status-warn/20'
                                  : 'bg-status-fail/10 text-status-fail border-status-fail/20',
                            )}
                          >
                            {row.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Score Bands */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Score Bands</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'Excellent',
                        range: '90–100',
                        color: 'bg-status-pass',
                        desc: 'Profile is highly optimized and follows best practices.',
                      },
                      {
                        label: 'Very Good',
                        range: '80–89',
                        color: 'bg-status-pass',
                        desc: 'Strong profile with only minor recommendations.',
                      },
                      {
                        label: 'Good',
                        range: '65–79',
                        color: 'bg-status-warn',
                        desc: 'Well optimized with noticeable room for improvement.',
                      },
                      {
                        label: 'Fair',
                        range: '50–64',
                        color: 'bg-status-warn',
                        desc: 'Profile is functional but requires several improvements.',
                      },
                      {
                        label: 'Poor',
                        range: '25–49',
                        color: 'bg-status-fail',
                        desc: 'Basic optimization exists, but many important elements are missing.',
                      },
                      {
                        label: 'Critical',
                        range: '0–24',
                        color: 'bg-status-fail',
                        desc: 'Major optimization issues detected.',
                      },
                    ].map((band) => (
                      <HoverCard key={band.label}>
                        <HoverCardTrigger
                          delay={150}
                          closeDelay={150}
                          className="block bg-gray-50 border border-gray-200 p-3 rounded-md flex flex-col gap-1 cursor-help hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', band.color)} />
                            <span className="text-xs font-bold text-gray-900">{band.label}</span>
                          </div>
                          <span className="text-lg font-bold text-gray-900 ml-4 tabular-nums">{band.range}</span>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="top"
                          className="w-64 text-sm text-gray-600 p-4 shadow-lg border-gray-200"
                        >
                          <strong className="text-gray-900 block mb-1">{band.label}</strong>
                          {band.desc}
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">Algorithm Note</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    The final score is a simple sum of earned points across all rules. Each rule is calculated based on
                    presence, accuracy, and comparison against industry benchmarks (e.g., 4.5+ average rating for full
                    points).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. What is NOT analyzed */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-gray-300/80 shrink-0">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              What is NOT analyzed
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Due to Google Places API limitations and privacy restrictions, the following profile elements are not
                  included in this automated audit:
                </p>
                <ul className="space-y-3">
                  {[
                    'Owner responses to reviews / review velocity',
                    'Posts and Q&A interactions',
                    'Individual Products/Services section items',
                    'Photo freshness (exact upload dates)',
                    'NAP consistency with external sources (directories)',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Technical Caveat
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  The photo count displayed in our report reflects the number of photos returned by the Google API
                  response limit, which may differ from the total visible count on the public profile.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Technical Notes */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-gray-300/80 shrink-0">
            <CardTitle className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-gray-400" />
              Technical Notes
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Supported Input Formats</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Google Maps URL', example: 'maps.google.com/maps?cid=...' },
                    { label: 'Shortened Maps Link', example: 'maps.app.goo.gl/...' },
                    { label: 'Google Place ID', example: 'ChIJN1t_tDeuEmsR...' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 border border-gray-200 p-4 rounded-md">
                      <div className="text-xs font-bold text-gray-900 mb-1">{item.label}</div>
                      <code className="text-[10px] text-blue-600 break-all">{item.example}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Real-time Analysis</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  Analysis typically takes 3-5 seconds to resolve. During this time, ProfileLens communicates with
                  Google's upstream servers to fetch the most recent data available.
                </p>
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest bg-gray-50 border border-gray-200 p-3 rounded-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    API Status: Online
                  </div>
                  <div className="border-l border-gray-200 h-3" />
                  <div>Cache: 24h</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Docs Footer */}
      <div className="mt-20 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-400 mb-6">Can't find what you're looking for?</p>
        <Link href="/">
          <Button size="lg" className="px-8 font-bold shadow-md">
            Return to Auditor
          </Button>
        </Link>
      </div>
    </div>
  );
}
