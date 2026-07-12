import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
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
