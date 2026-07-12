import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/config.schema';
import googlePlacesConfig from './config/google-places.config';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from './modules/cache/cache.module';
import { GooglePlacesModule } from './modules/google-places/google-places.module';
import { AnalysisModule } from './modules/analysis/analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [googlePlacesConfig],
      cache: true,
    }),
    HealthModule,
    CacheModule,
    GooglePlacesModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
