import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AnalysisService } from './analysis.service';
import { ANALYSIS_ROUTES } from './routes/analysis.routes';
import { AnalyzeProfileReqDto } from './dto/req/analyze-profile.req.dto';
import { AnalysisResultResDto } from './dto/res/analysis-result.res.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ApiEnvelopeResponse } from '../../common/decorators/api-envelope-response.decorator';

@ApiTags('analysis')
@Controller(ANALYSIS_ROUTES.BASE)
@UseGuards(ThrottlerGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze a Google Business Profile' })
  @ApiEnvelopeResponse(AnalysisResultResDto, 200, 'Profile analyzed successfully')
  @ApiResponse({ status: 400, description: 'Invalid input format' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 429, description: 'Too many requests / API quota exhausted' })
  @ResponseMessage('Profile analysis completed successfully')
  async analyze(@Body() dto: AnalyzeProfileReqDto): Promise<AnalysisResultResDto> {
    return this.analysisService.analyzeProfile(dto.input);
  }
}
