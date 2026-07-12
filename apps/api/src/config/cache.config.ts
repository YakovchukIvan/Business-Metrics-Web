import { ConfigModule, ConfigService } from '@nestjs/config';
import type { CacheModuleAsyncOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const ttl = Number(config.get('CACHE_TTL_SECONDS', 3600));

    return {
      ttl,
    };
  },
};
