import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './modules/health/health.module';
import { CacheModule } from './modules/cache/cache.module';
import { GooglePlacesModule } from './modules/google-places/google-places.module';

@Module({
  imports: [ConfigModule, HealthModule, CacheModule, GooglePlacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
