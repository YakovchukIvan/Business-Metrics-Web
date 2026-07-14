import { Search, AlertTriangle } from 'lucide-react';
import type { ApiError } from '@/lib/api/errors';

interface ErrorStateProps {
  error: ApiError | null;
}

export function ErrorState({ error }: ErrorStateProps) {
  if (!error) return null;

  const isNotFoundOrInvalid = error.statusCode === 400 || error.statusCode === 404;

  return (
    <div className="max-w-lg mx-auto mt-12 text-center animate-in fade-in duration-300">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-6 border border-gray-200">
        {isNotFoundOrInvalid ? (
          <Search className="w-8 h-8 text-gray-400" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{error.title}</h3>
      <p className="text-gray-500 text-base">{error.message}</p>
    </div>
  );
}
