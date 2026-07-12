import type { AnalysisRule } from '../interfaces/rule.interface';
import { completenessRule } from './completeness.rule';
import { ratingRule } from './rating.rule';
import { businessCategoryRule } from './business-category.rule';
import { openingHoursRule } from './opening-hours.rule';
import { businessStatusRule } from './business-status.rule';
import { photosRule } from './photos.rule';
import { attributesRule } from './attributes.rule';

export const ANALYSIS_RULES: AnalysisRule[] = [
  completenessRule,
  ratingRule,
  businessCategoryRule,
  openingHoursRule,
  businessStatusRule,
  photosRule,
  attributesRule,
];
