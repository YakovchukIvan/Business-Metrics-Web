import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ICacheService } from '../interfaces/cache-service.interface';

interface CacheEntry<T> {
  value: T;
  timeoutId: NodeJS.Timeout;
}

@Injectable()
export class InMemoryCacheService implements ICacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlSeconds: number;

  constructor(private configService: ConfigService) {
    this.defaultTtlSeconds = this.configService.get<number>('CACHE_TTL_SECONDS') ?? 3600;
  }

  get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value as T);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.clearTimeout(key);

    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    const timeoutId = setTimeout(() => {
      this.cache.delete(key);
    }, ttl * 1000);

    // Ensure the timeout doesn't block Node.js from exiting
    timeoutId.unref();

    this.cache.set(key, { value, timeoutId });
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.clearTimeout(key);
    this.cache.delete(key);
    return Promise.resolve();
  }

  private clearTimeout(key: string): void {
    const entry = this.cache.get(key);
    if (entry?.timeoutId) {
      clearTimeout(entry.timeoutId);
    }
  }
}
