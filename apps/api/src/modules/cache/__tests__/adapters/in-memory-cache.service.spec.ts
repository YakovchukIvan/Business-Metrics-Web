import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InMemoryCacheService } from '../../adapters/in-memory-cache.service';

describe('InMemoryCacheService', () => {
  let service: InMemoryCacheService;

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InMemoryCacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(3600), // Default TTL 1 hour
          },
        },
      ],
    }).compile();

    service = module.get<InMemoryCacheService>(InMemoryCacheService);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get a value', async () => {
    await service.set('key1', 'value1');
    const result = await service.get('key1');
    expect(result).toBe('value1');
  });

  it('should return null for non-existent key', async () => {
    const result = await service.get('missing');
    expect(result).toBeNull();
  });

  it('should delete a value', async () => {
    await service.set('key2', 'value2');
    await service.delete('key2');
    const result = await service.get('key2');
    expect(result).toBeNull();
  });

  it('should expire value after default TTL', async () => {
    await service.set('key3', 'value3');

    // Advance time by 3599 seconds (just before expiration)
    jest.advanceTimersByTime(3599 * 1000);
    let result = await service.get('key3');
    expect(result).toBe('value3');

    // Advance 1 more second to cross the 3600s boundary
    jest.advanceTimersByTime(1000);
    result = await service.get('key3');
    expect(result).toBeNull();
  });

  it('should expire value after custom TTL', async () => {
    await service.set('key4', 'value4', 5); // 5 seconds TTL

    jest.advanceTimersByTime(4000);
    let result = await service.get('key4');
    expect(result).toBe('value4');

    jest.advanceTimersByTime(1000);
    result = await service.get('key4');
    expect(result).toBeNull();
  });

  it('should override previous value and timeout on new set', async () => {
    await service.set('key5', 'valueA', 10);

    jest.advanceTimersByTime(5000);

    // Override with new value and new TTL (20s)
    await service.set('key5', 'valueB', 20);

    // Original timeout would have expired here
    jest.advanceTimersByTime(6000);

    let result = await service.get('key5');
    expect(result).toBe('valueB');

    // Wait until new timeout expires
    jest.advanceTimersByTime(14000);
    result = await service.get('key5');
    expect(result).toBeNull();
  });
});
