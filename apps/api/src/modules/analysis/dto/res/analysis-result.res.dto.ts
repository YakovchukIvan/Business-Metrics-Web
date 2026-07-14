import { ApiProperty } from '@nestjs/swagger';
import type { AnalysisResult, RuleBreakdown } from '../../interfaces/analysis-result.interface';
import type { RuleIssue } from '../../interfaces/rule.interface';
import type { PlaceProfile } from '../../../google-places/interfaces/place-profile.interface';

export class RuleIssueDto implements RuleIssue {
  @ApiProperty({
    description: 'Human-readable description of the issue',
    example: 'Rating and review count are average',
  })
  message!: string;

  @ApiProperty({
    description: 'Actionable recommendation to fix the issue',
    example: 'Collect more reviews to reach at least 20 reviews with a 4.5+ average rating.',
  })
  recommendation!: string;

  @ApiProperty({ description: 'ID of the rule that generated this issue', example: 'rating' })
  ruleId!: string;

  @ApiProperty({ description: 'Potential score gain if fixed', example: 15 })
  potentialGain!: number;
}

export class RuleBreakdownDto implements RuleBreakdown {
  @ApiProperty({ description: 'ID of the rule', example: 'completeness' })
  ruleId!: string;

  @ApiProperty({ description: 'Maximum possible weight for this rule', example: 20 })
  weight!: number;

  @ApiProperty({ description: 'True if the profile perfectly passed this rule', example: true })
  passed!: boolean;

  @ApiProperty({ description: 'Score achieved for this rule (0 to weight)', example: 20 })
  score!: number;

  @ApiProperty({ description: 'Whether this rule is applicable to this business type', example: true })
  applicable!: boolean;
}

export class AnalysisResultResDto implements AnalysisResult {
  @ApiProperty({ description: 'The Google Place ID', example: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
  placeId!: string;

  @ApiProperty({ description: 'Name of the analyzed business', example: 'Acme Corp' })
  businessName!: string;

  @ApiProperty({ description: 'Formatted address of the business', example: '123 Main St, NY', nullable: true })
  address!: string | null;

  @ApiProperty({ description: 'Total optimization score (0-100)', example: 85 })
  score!: number;

  @ApiProperty({ type: [RuleBreakdownDto], description: 'Detailed scoring breakdown per rule' })
  breakdown!: RuleBreakdownDto[];

  @ApiProperty({ type: [RuleIssueDto], description: 'List of all issues found' })
  issues!: RuleIssueDto[];

  @ApiProperty({ description: 'Raw Google Place Profile data used for analysis', type: Object })
  rawProfile!: PlaceProfile;
}
