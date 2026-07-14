export const SCORE_BANDS = [
  {
    label: 'Excellent',
    range: '90–100',
    min: 90,
    max: 100,
    color: 'bg-status-pass',
    cssVar: 'var(--color-status-pass)',
    desc: 'Profile is highly optimized and follows best practices.',
  },
  {
    label: 'Very Good',
    range: '80–89',
    min: 80,
    max: 89,
    color: 'bg-status-pass',
    cssVar: 'var(--color-status-pass)',
    desc: 'Strong profile with only minor recommendations.',
  },
  {
    label: 'Good',
    range: '65–79',
    min: 65,
    max: 79,
    color: 'bg-status-warn',
    cssVar: 'var(--color-status-warn)',
    desc: 'Well optimized with noticeable room for improvement.',
  },
  {
    label: 'Fair',
    range: '50–64',
    min: 50,
    max: 64,
    color: 'bg-status-warn',
    cssVar: 'var(--color-status-warn)',
    desc: 'Profile is functional but requires several improvements.',
  },
  {
    label: 'Poor',
    range: '25–49',
    min: 25,
    max: 49,
    color: 'bg-status-fail',
    cssVar: 'var(--color-status-fail)',
    desc: 'Basic optimization exists, but many important elements are missing.',
  },
  {
    label: 'Critical',
    range: '0–24',
    min: 0,
    max: 24,
    color: 'bg-status-fail',
    cssVar: 'var(--color-status-fail)',
    desc: 'Major optimization issues detected.',
  },
];

export const WEIGHTED_RULES = [
  {
    id: 'rating',
    rule: 'Rating & Reviews',
    weight: 30,
    priority: 'High',
    description:
      'Evaluates if your business has a high enough average rating (4.0+) and a sufficient number of reviews to build trust and rank well.',
  },
  {
    id: 'completeness',
    rule: 'Profile Completeness',
    weight: 20,
    priority: 'High',
    description:
      'Checks if core profile fields (phone, website, description, etc.) are filled out. A complete profile is favored by Google algorithms.',
  },
  {
    id: 'business-category',
    rule: 'Business Categories',
    weight: 20,
    priority: 'Medium',
    description:
      'Verifies that you have selected an accurate primary category and at least one secondary category to maximize your search visibility.',
  },
  {
    id: 'opening-hours',
    rule: 'Opening Hours',
    weight: 15,
    priority: 'Medium',
    description:
      'Ensures your regular opening hours are specified. Profiles without hours are often hidden from "open now" searches.',
  },
  {
    id: 'business-status',
    rule: 'Business Status',
    weight: 10,
    priority: 'Medium',
    description: 'Confirms your business is marked as permanently operational.',
  },
  {
    id: 'service-options',
    rule: 'Service Options',
    weight: 8,
    priority: 'Medium',
    description:
      'Checks for essential service attributes like Delivery, Dine-in, or Takeout (if applicable to your business type).',
  },
  {
    id: 'photos',
    rule: 'Photos',
    weight: 7,
    priority: 'Low',
    description:
      'Verifies that your profile has a healthy amount of photos (at least 3) to increase user engagement and CTR.',
  },
  {
    id: 'name-spam',
    rule: 'Name Optimization',
    weight: 5,
    priority: 'Low',
    description:
      'Checks if your business name is clear of spammy keywords, which can trigger Google penalties or suspensions.',
  },
  {
    id: 'attributes',
    rule: 'Attributes',
    weight: 3,
    priority: 'Low',
    description:
      'Ensures you have filled out relevant attributes (e.g. wheelchair accessibility) to capture long-tail and voice searches.',
  },
];
