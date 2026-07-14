import { ratingRule } from './rating.rule';
import { completenessRule } from './completeness.rule';
import { businessCategoryRule } from './business-category.rule';
import { openingHoursRule } from './opening-hours.rule';
import { businessStatusRule } from './business-status.rule';
import { photosRule } from './photos.rule';
import { attributesRule } from './attributes.rule';
import { nameSpamRule } from './name-spam.rule';
import { serviceOptionsRule } from './service-options.rule';

export const ANALYSIS_RULES = [
  ratingRule,
  completenessRule,
  businessCategoryRule,
  openingHoursRule,
  businessStatusRule,
  photosRule,
  attributesRule,
  nameSpamRule,
  serviceOptionsRule,
];
