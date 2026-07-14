import { Injectable, BadRequestException, NotFoundException, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlaceIdResolverService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('GOOGLE_PLACES_API_KEY');
  }

  async resolvePlaceId(input: string): Promise<string> {
    if (!input || typeof input !== 'string') {
      throw new BadRequestException('Input must be a valid string');
    }

    const trimmed = input.trim();

    // 1. Raw Place ID
    if (trimmed.startsWith('ChIJ') && !trimmed.includes('/')) {
      return trimmed;
    }

    // 2. Short link (maps.app.goo.gl/... or g.page/...)
    if (trimmed.includes('maps.app.goo.gl/') || trimmed.includes('g.page/')) {
      const fullUrl = await this.followRedirect(trimmed);
      return this.resolvePlaceId(fullUrl); // Recursive call to handle the resolved long URL
    }

    // 3. Long link with CID (data=!3m1!4b1!4m... or ?cid=...)
    const cidMatch = trimmed.match(/cid=(\d+)/) || trimmed.match(/1s0x[a-f0-9]+:0x([a-f0-9]+)/i);
    if (cidMatch) {
      return this.resolveViaTextSearch(trimmed);
    }

    // 4. Try text search on the raw input if it looks like a URL
    if (trimmed.startsWith('http')) {
      return this.resolveViaTextSearch(trimmed);
    }

    // 5. Short link ID directly (e.g., 9dyVwjd6L5kj3kKf7)
    if (/^[a-zA-Z0-9_-]{10,25}$/.test(trimmed)) {
      const fullUrl = await this.followRedirect(`https://maps.app.goo.gl/${trimmed}`);
      return this.resolvePlaceId(fullUrl);
    }

    throw new BadRequestException('Invalid Place ID or Google Maps URL format');
  }

  private async followRedirect(url: string): Promise<string> {
    try {
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          return location;
        }
      }

      return response.url;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new BadGatewayException(`Failed to resolve short link: ${msg}`);
    }
  }

  private async resolveViaTextSearch(query: string): Promise<string> {
    const nameMatch = query.match(/\/place\/([^/]+)/);
    const searchString = nameMatch && nameMatch[1] ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : query;

    const url = 'https://places.googleapis.com/v1/places:searchText';

    interface TextSearchRequestBody {
      textQuery: string;
      locationBias?: {
        circle: {
          center: {
            latitude: number;
            longitude: number;
          };
          radius: number;
        };
      };
    }

    const body: TextSearchRequestBody = { textQuery: searchString };

    // Extract location from URL if available to improve search accuracy (fixes ZERO_RESULTS on remote servers)
    const locationMatch = query.match(/@([0-9.-]+),([0-9.-]+)/);
    if (locationMatch && locationMatch[1] && locationMatch[2]) {
      body.locationBias = {
        circle: {
          center: {
            latitude: parseFloat(locationMatch[1]),
            longitude: parseFloat(locationMatch[2]),
          },
          radius: 5000.0, // 5km radius
        },
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new BadGatewayException('Google Places API quota exhausted or request denied');
      }
      throw new BadGatewayException('Failed to communicate with Google Places API during text search');
    }

    const data = (await response.json()) as { places?: Array<{ id: string }> };
    const firstPlace = data.places?.[0];
    if (!firstPlace) {
      throw new NotFoundException('Could not resolve URL/CID to a Place ID via text search (ZERO_RESULTS)');
    }

    return firstPlace.id;
  }
}
