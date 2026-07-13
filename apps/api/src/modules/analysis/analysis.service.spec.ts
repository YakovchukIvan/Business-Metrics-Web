import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AnalysisService } from './analysis.service';
import { GOOGLE_PLACES_PORT } from '../../common/constants/google-places.constants';
import { createBaseProfile } from '../../common/test-fixtures/place-profile.fixture';

describe('AnalysisService', () => {
  let service: AnalysisService;

  const mockGooglePlacesPort = {
    resolvePlaceId: jest.fn(),
    getPlaceProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: GOOGLE_PLACES_PORT,
          useValue: mockGooglePlacesPort,
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve Place ID, get profile, and calculate total score', async () => {
    const fakeId = 'ChIJ_mock';
    const fakeProfile = createBaseProfile({ id: fakeId }); // Changed placeId to id

    mockGooglePlacesPort.resolvePlaceId.mockResolvedValue(fakeId);
    mockGooglePlacesPort.getPlaceProfile.mockResolvedValue(fakeProfile);

    const result = await service.analyzeProfile('some_input_url');

    expect(mockGooglePlacesPort.resolvePlaceId).toHaveBeenCalledWith('some_input_url');
    expect(mockGooglePlacesPort.getPlaceProfile).toHaveBeenCalledWith(fakeId);

    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
    expect(result.breakdown.length).toBeGreaterThan(0);
    expect(result.breakdown.every((b) => b.passed === true)).toBe(true);
  });
});
