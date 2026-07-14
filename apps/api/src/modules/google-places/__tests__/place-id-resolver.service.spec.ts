import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { PlaceIdResolverService } from '../place-id-resolver.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PlaceIdResolverService', () => {
  let service: PlaceIdResolverService;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('mock_api_key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceIdResolverService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PlaceIdResolverService>(PlaceIdResolverService);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restores spied functions like global.fetch
  });

  it('should return raw Place ID directly', async () => {
    const placeId = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
    const result = await service.resolvePlaceId(placeId);
    expect(result).toBe(placeId);
  });

  it('should throw BadRequestException for invalid input', async () => {
    await expect(service.resolvePlaceId('hello world')).rejects.toThrow(BadRequestException);
  });

  it('should resolve short maps link via redirect', async () => {
    const shortLink = 'https://maps.app.goo.gl/abcd123';
    const fakeFullUrl = 'https://www.google.com/maps/place/FooPlace/?cid=12345';

    // Mock fetch to simulate redirect
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === shortLink) {
        return Promise.resolve({ url: fakeFullUrl } as Response);
      }
      if (url === 'https://places.googleapis.com/v1/places:searchText') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ places: [{ id: 'ChIJ_from_shortlink' }] }),
        } as Response);
      }
      return Promise.resolve({ ok: false } as Response);
    });

    const result = await service.resolvePlaceId(shortLink);
    expect(result).toBe('ChIJ_from_shortlink');
    expect(global.fetch).toHaveBeenCalledTimes(2); // One for HEAD, one for searchText
  });

  it('should resolve full Maps link with place name via searchText', async () => {
    const longLink = 'https://www.google.com/maps/place/Test+Business+Name/some_other_data';

    jest.spyOn(global, 'fetch').mockImplementation((url, options) => {
      expect(url).toBe('https://places.googleapis.com/v1/places:searchText');
      const body = JSON.parse((options?.body as string) || '{}') as Record<string, unknown>;
      expect(body['textQuery']).toBe('Test Business Name'); // should decode properly

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ places: [{ id: 'ChIJ_from_name' }] }),
      } as Response);
    });

    const result = await service.resolvePlaceId(longLink);
    expect(result).toBe('ChIJ_from_name');
  });

  it('should throw NotFoundException if searchText returns ZERO_RESULTS', async () => {
    const longLink = 'https://www.google.com/maps/place/NonExistent/data';

    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ places: [] }), // Empty array
      } as Response),
    );

    await expect(service.resolvePlaceId(longLink)).rejects.toThrow(NotFoundException);
  });
});
