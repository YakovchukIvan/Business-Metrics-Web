import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeProfileReqDto {
  @ApiProperty({ description: 'Google Maps URL or Place ID to analyze', example: 'https://maps.app.goo.gl/...' })
  @IsString()
  @IsNotEmpty()
  input!: string;
}
