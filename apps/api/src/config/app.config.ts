import type { ConfigService } from '@nestjs/config';

export function getAppConfig(configService: ConfigService) {
  return {
    port: Number(configService.get('PORT', 3000)),
    host: configService.get<string>('APP_HOST', '0.0.0.0'),
    globalPrefix: configService.get<string>('GLOBAL_PREFIX', 'api'),
    environment: configService.get<string>('NODE_ENV', 'development'),
    swagger: {
      title: configService.get<string>('SWAGGER_TITLE', 'API Documentation'),
      description: configService.get<string>('SWAGGER_DESCRIPTION', 'REST API interface'),
      version: configService.get<string>('SWAGGER_VERSION', '1.0'),
    },
  };
}
