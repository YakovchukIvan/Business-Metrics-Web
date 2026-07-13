import { ApiProperty } from '@nestjs/swagger';
import type { AnalysisResult } from '../../interfaces/analysis-result.interface';
import type { RuleResult, RuleIssue } from '../../interfaces/rule.interface';

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

export class RuleResultDto implements Omit<RuleResult, 'issues'> {
  @ApiProperty({ description: 'ID of the rule', example: 'completeness' })
  ruleId!: string;

  @ApiProperty({ description: 'Maximum possible weight for this rule', example: 20 })
  weight!: number;

  @ApiProperty({ description: 'True if the profile perfectly passed this rule', example: true })
  passed!: boolean;

  @ApiProperty({ description: 'Score achieved for this rule (0 to weight)', example: 20 })
  score!: number;
}

export class AnalysisResultResDto implements AnalysisResult {
  @ApiProperty({ description: 'Name of the analyzed business', example: 'Acme Corp' })
  businessName!: string;

  @ApiProperty({ description: 'Formatted address of the business', example: '123 Main St, NY', nullable: true })
  address!: string | null;

  @ApiProperty({ description: 'Total optimization score (0-100)', example: 85 })
  score!: number;

  @ApiProperty({ type: [RuleResultDto], description: 'Detailed breakdown of score by rule' })
  breakdown!: RuleResultDto[];

  @ApiProperty({ type: [RuleIssueDto], description: 'List of all issues found' })
  issues!: RuleIssueDto[];
}
