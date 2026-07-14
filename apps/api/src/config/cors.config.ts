import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import type { ConfigService } from '@nestjs/config';

export const getCorsConfig = (configService: ConfigService): CorsOptions => {
  const devUrl = configService.getOrThrow<string>('FRONTEND_DEV_URL');
  const prodUrl = configService.getOrThrow<string>('FRONTEND_PROD_URL');

  return {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      // If the origin is exactly what's configured (ignoring trailing slash)
      if (origin === devUrl.replace(/\/$/, '') || origin === prodUrl.replace(/\/$/, '')) {
        return callback(null, true);
      }

      // Allow any Vercel preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow wildcard if specifically requested
      if (prodUrl === '*') {
        return callback(null, true);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  };
};
