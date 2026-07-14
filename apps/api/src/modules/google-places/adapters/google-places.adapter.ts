import { Injectable, Inject, NotFoundException, BadGatewayException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IGooglePlacesPort } from '../interfaces/google-places-port.interface';
import type { PlaceProfile } from '../interfaces/place-profile.interface';
import type { ICacheService } from '../../cache/interfaces/cache-service.interface';
import { CACHE_SERVICE } from '../../cache/cache.constants';
import { PlaceIdResolverService } from '../place-id-resolver.service';
import { mapGooglePlaceToProfile } from '../mappers/google-place.mapper';
import type { GooglePlaceRaw } from '../types/google-place-raw.type';

@Injectable()
export class GooglePlacesAdapter implements IGooglePlacesPort {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://places.googleapis.com/v1/places';
  private readonly fieldMask = [
    'id',
    'displayName',
    'types',
    'formattedAddress',
    'internationalPhoneNumber',
    'websiteUri',
    'rating',
    'userRatingCount',
    'regularOpeningHours',
    'photos',
    'businessStatus',
    'editorialSummary',
    'delivery',
    'dineIn',
    'takeout',
    'accessibilityOptions',
  ].join(',');

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_SERVICE) private cacheService: ICacheService,
    private placeIdResolver: PlaceIdResolverService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('GOOGLE_PLACES_API_KEY');
  }

  async resolvePlaceId(input: string): Promise<string> {
    const cacheKey = `resolve:${input}`;
    const cached = await this.cacheService.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    const placeId = await this.placeIdResolver.resolvePlaceId(input);
    await this.cacheService.set(cacheKey, placeId);
    return placeId;
  }

  async getPlaceProfile(placeId: string): Promise<PlaceProfile> {
    const cacheKey = `place:${placeId}`;
    const cached = await this.cacheService.get<PlaceProfile>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.apiUrl}/${placeId}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': this.fieldMask,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException('Place not found (ZERO_RESULTS)');
      }
      if (response.status === 403 || response.status === 429) {
        throw new BadGatewayException('Google Places API quota exhausted or request denied');
      }
      if (response.status === 400) {
        throw new BadRequestException('Invalid Place ID format');
      }
      throw new BadGatewayException(`Failed to communicate with Google Places API: ${response.statusText}`);
    }

    const rawData = (await response.json()) as GooglePlaceRaw;
    if (!rawData || !rawData.id) {
      throw new NotFoundException('Place not found (ZERO_RESULTS)');
    }

    const profile = mapGooglePlaceToProfile(rawData);

    await this.cacheService.set(cacheKey, profile);

    return profile;
  }
}
