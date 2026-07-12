import { ApiProperty } from '@nestjs/swagger';
import type { AnalysisResult } from '../../interfaces/analysis-result.interface';
import type { RuleResult, RuleIssue } from '../../interfaces/rule.interface';

export class RuleIssueDto implements RuleIssue {
  @ApiProperty({ description: 'Human-readable description of the issue' })
  message!: string;

  @ApiProperty({ description: 'Actionable recommendation to fix the issue' })
  recommendation!: string;

  @ApiProperty({ description: 'ID of the rule that generated this issue' })
  ruleId!: string;
}

export class RuleResultDto implements Omit<RuleResult, 'issues'> {
  @ApiProperty({ description: 'ID of the rule' })
  ruleId!: string;

  @ApiProperty({ description: 'Maximum possible weight for this rule' })
  weight!: number;

  @ApiProperty({ description: 'True if the profile perfectly passed this rule' })
  passed!: boolean;

  @ApiProperty({ description: 'Score achieved for this rule (0 to weight)' })
  score!: number;
}

export class AnalysisResultResDto implements AnalysisResult {
  @ApiProperty({ description: 'Total optimization score (0-100)' })
  score!: number;

  @ApiProperty({ type: [RuleResultDto], description: 'Detailed breakdown of score by rule' })
  breakdown!: RuleResultDto[];

  @ApiProperty({ type: [RuleIssueDto], description: 'List of all issues found' })
  issues!: RuleIssueDto[];
}
