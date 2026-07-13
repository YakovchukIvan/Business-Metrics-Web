import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CACHE_SERVICE } from './cache.constants';
import { InMemoryCacheService } from './adapters/in-memory-cache.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_SERVICE,
      useClass: InMemoryCacheService,
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
