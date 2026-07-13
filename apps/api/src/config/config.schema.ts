import { z } from 'zod';

export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_HOST: z.string().default('0.0.0.0'),
  GLOBAL_PREFIX: z.string().default('api'),
  GOOGLE_PLACES_API_KEY: z.string().min(1, 'GOOGLE_PLACES_API_KEY must not be empty'),
  CACHE_TTL_SECONDS: z.coerce.number().int().nonnegative().default(3600),
  SWAGGER_TITLE: z.string().optional(),
  SWAGGER_DESCRIPTION: z.string().optional(),
  SWAGGER_VERSION: z.string().optional(),
  THROTTLER_TTL_MS: z.coerce.number().int().positive().default(60000),
  THROTTLER_LIMIT: z.coerce.number().int().positive().default(10),
});

export type Config = z.infer<typeof configSchema>;

export function validate(config: Record<string, unknown>): Config {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map((err) => `[${err.path.join('.')}] ${err.message}`).join('\n');
    throw new Error(`Configuration validation error:\n${errors}`);
  }

  return result.data;
}
