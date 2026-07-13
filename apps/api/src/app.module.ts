import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './config/config.schema';
import googlePlacesConfig from './config/google-places.config';
import { throttlerConfig } from './config/throttler.config';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from './modules/cache/cache.module';
import { GooglePlacesModule } from './modules/google-places/google-places.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { appProviders } from './app.providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [googlePlacesConfig],
      cache: true,
    }),
    ThrottlerModule.forRootAsync(throttlerConfig),
    HealthModule,
    CacheModule,
    GooglePlacesModule,
    AnalysisModule,
  ],
  providers: [...appProviders],
})
export class AppModule {}
