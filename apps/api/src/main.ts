import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { getAppConfig } from './config/app.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global components
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);
  const appConfig = getAppConfig(configService);

  app.setGlobalPrefix(appConfig.globalPrefix);
  await app.listen(appConfig.port, appConfig.host);
  new Logger('Bootstrap').log(
    `✅ Application is running on: http://${appConfig.host}:${appConfig.port}/${appConfig.globalPrefix}`,
  );
}

bootstrap().catch((error: unknown) => {
  new Logger('❌ Bootstrap').error('Failed to start application', error);
  process.exit(1);
});
