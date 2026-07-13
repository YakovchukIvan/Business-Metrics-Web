export const RULE_WEIGHTS = {
  rating: 30,
  completeness: 20,
  'business-category': 15,
  'opening-hours': 15,
  'business-status': 10,
  photos: 7,
  attributes: 3,
} as const;

export const CATEGORY_TO_RELEVANT_ATTRIBUTES: Record<string, string[]> = {
  restaurant: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  cafe: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  food: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  universal: ['wheelchairAccessibleEntrance'],
};
