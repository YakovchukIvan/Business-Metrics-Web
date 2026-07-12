import { Module } from '@nestjs/common';
import { GooglePlacesModule } from '../google-places/google-places.module';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [GooglePlacesModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
