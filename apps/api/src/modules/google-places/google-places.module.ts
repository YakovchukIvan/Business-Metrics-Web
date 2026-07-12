import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '../cache/cache.module';
import { GOOGLE_PLACES_PORT } from '@/common/constants/google-places.constants';
import { GooglePlacesAdapter } from './adapters/google-places.adapter';
import { PlaceIdResolverService } from './utils/place-id-resolver.service';

@Module({
  imports: [ConfigModule, CacheModule],
  providers: [
    PlaceIdResolverService,
    {
      provide: GOOGLE_PLACES_PORT,
      useClass: GooglePlacesAdapter,
    },
  ],
  exports: [GOOGLE_PLACES_PORT],
})
export class GooglePlacesModule {}
