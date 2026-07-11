import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error: any) => {
  new Logger('Bootstrap').error('Failed to start application', error);
  process.exit(1);
});
