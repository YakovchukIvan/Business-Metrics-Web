import { Module } from '@nestjs/common';
import { GooglePlacesModule } from '../google-places/google-places.module';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [GooglePlacesModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
