import { ConfigModule, ConfigService } from '@nestjs/config';
import type { ThrottlerAsyncOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const ttl = Number(config.get('THROTTLER_TTL_MS', 60000));
    const limit = Number(config.get('THROTTLER_LIMIT', 10));

    return {
      throttlers: [
        {
          ttl,
          limit,
        },
      ],
    };
  },
};
