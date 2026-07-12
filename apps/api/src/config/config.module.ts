import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import googlePlacesConfig from './google-places.config';
import { validate } from './config.schema';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [googlePlacesConfig],
      cache: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
