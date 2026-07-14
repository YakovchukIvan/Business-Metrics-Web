import { Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TransparencyPanel() {
  return (
    <Card className="mt-16 bg-gray-50/50">
      <CardContent className="p-6 text-sm text-gray-600">
        <div className="flex items-center gap-2 mb-3 font-medium text-gray-900">
          <Info className="w-4 h-4 text-gray-400" />
          What this doesn't check
        </div>
        <ul className="list-disc pl-5 space-y-1.5 mb-4 text-gray-500">
          <li>Owner responses to reviews / review velocity</li>
          <li>Posts and Q&A</li>
          <li>Products/Services section</li>
          <li>Photo freshness (upload date)</li>
          <li>NAP consistency with external sources (website, directories)</li>
        </ul>
        <p className="text-xs text-gray-400 pt-3 border-t border-gray-200">
          Note: Photo count reflects the API response limit, not the true number of photos on the profile.
        </p>
      </CardContent>
    </Card>
  );
}
