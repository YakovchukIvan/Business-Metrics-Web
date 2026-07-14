import type { RecentSearch } from '@/types/models';

const STORAGE_KEY = 'profilelens_recent_searches';
const MAX_HISTORY = 10;

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSearch[]) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(input: string, businessName: string) {
  if (typeof window === 'undefined') return;
  const current = getRecentSearches();

  // Remove existing entry for the same input to move it to the top
  const filtered = current.filter((item) => item.input !== input);

  const newEntry: RecentSearch = {
    input,
    businessName,
    cachedAt: Date.now(),
  };

  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
