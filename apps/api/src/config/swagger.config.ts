import { Logger } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { getAppConfig } from './app.config';

export function setupSwagger(app: INestApplication, appConfig: ReturnType<typeof getAppConfig>): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(appConfig.swagger.title)
    .setDescription(appConfig.swagger.description)
    .setVersion(appConfig.swagger.version)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerPath = `${appConfig.globalPrefix}/docs`;

  SwaggerModule.setup(swaggerPath, app, document);

  new Logger('Swagger').log(
    `✅ Swagger documentation is available at: http://${appConfig.host}:${appConfig.port}/${swaggerPath}`,
  );
}
