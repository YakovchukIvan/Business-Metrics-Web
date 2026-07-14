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
  // Food & Drink — all consumer-facing delivery/dine-in attributes
  restaurant: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  cafe: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  coffee_shop: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  bar: ['dineIn', 'wheelchairAccessibleEntrance'],
  night_club: ['dineIn', 'wheelchairAccessibleEntrance'],
  bakery: ['delivery', 'takeout', 'wheelchairAccessibleEntrance'],
  meal_delivery: ['delivery'],
  meal_takeaway: ['takeout', 'delivery'],
  food: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  fast_food_restaurant: ['delivery', 'dineIn', 'takeout', 'wheelchairAccessibleEntrance'],
  pizza_restaurant: ['delivery', 'takeout', 'wheelchairAccessibleEntrance'],
  sandwich_shop: ['delivery', 'takeout', 'wheelchairAccessibleEntrance'],

  // Retail — accessibility only
  store: ['wheelchairAccessibleEntrance'],
  clothing_store: ['wheelchairAccessibleEntrance'],
  shoe_store: ['wheelchairAccessibleEntrance'],
  furniture_store: ['wheelchairAccessibleEntrance'],
  hardware_store: ['wheelchairAccessibleEntrance'],
  book_store: ['wheelchairAccessibleEntrance'],
  jewelry_store: ['wheelchairAccessibleEntrance'],
  pet_store: ['wheelchairAccessibleEntrance'],
  supermarket: ['delivery', 'wheelchairAccessibleEntrance'],
  grocery_or_supermarket: ['delivery', 'wheelchairAccessibleEntrance'],
  convenience_store: ['wheelchairAccessibleEntrance'],
  department_store: ['wheelchairAccessibleEntrance'],
  electronics_store: ['wheelchairAccessibleEntrance'],
  home_goods_store: ['wheelchairAccessibleEntrance'],
  florist: ['delivery', 'wheelchairAccessibleEntrance'],
  pharmacy: ['delivery', 'wheelchairAccessibleEntrance'],

  // Health & Beauty
  beauty_salon: ['wheelchairAccessibleEntrance'],
  hair_care: ['wheelchairAccessibleEntrance'],
  spa: ['wheelchairAccessibleEntrance'],
  gym: ['wheelchairAccessibleEntrance'],
  health: ['wheelchairAccessibleEntrance'],

  // Medical
  hospital: ['wheelchairAccessibleEntrance'],
  doctor: ['wheelchairAccessibleEntrance'],
  dentist: ['wheelchairAccessibleEntrance'],
  physiotherapist: ['wheelchairAccessibleEntrance'],
  veterinary_care: ['wheelchairAccessibleEntrance'],

  // Services & Finance
  bank: ['wheelchairAccessibleEntrance'],
  atm: [],
  insurance_agency: ['wheelchairAccessibleEntrance'],
  real_estate_agency: ['wheelchairAccessibleEntrance'],
  lawyer: ['wheelchairAccessibleEntrance'],
  accounting: ['wheelchairAccessibleEntrance'],

  // Automotive
  car_dealer: ['wheelchairAccessibleEntrance'],
  car_repair: ['wheelchairAccessibleEntrance'],
  car_wash: ['wheelchairAccessibleEntrance'],
  gas_station: ['wheelchairAccessibleEntrance'],
  parking: [],

  // Education
  school: ['wheelchairAccessibleEntrance'],
  university: ['wheelchairAccessibleEntrance'],
  library: ['wheelchairAccessibleEntrance'],

  // Hospitality
  hotel: ['wheelchairAccessibleEntrance'],
  lodging: ['wheelchairAccessibleEntrance'],
  motel: ['wheelchairAccessibleEntrance'],

  // Industrial / Manufacturing — no consumer attributes applicable
  food_producer: [],
  manufacturer: [],
  storage: [],
  moving_company: [],
  wholesale_food_store: [],

  // Universal fallback for unknown types
  universal: ['wheelchairAccessibleEntrance'],
};
