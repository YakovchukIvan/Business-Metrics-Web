import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';
import { getCorsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = getAppConfig(configService);

  app.enableCors(getCorsConfig(configService));
  app.setGlobalPrefix(appConfig.globalPrefix);

  setupSwagger(app, appConfig);

  await app.listen(appConfig.port, appConfig.host);

  new Logger('Bootstrap').log(
    `✅ Application is running on: http://${appConfig.host}:${appConfig.port}/${appConfig.globalPrefix}`,
  );
}

bootstrap().catch((error: unknown) => {
  new Logger('Bootstrap').error('Failed to start application', error);
  process.exit(1);
});
