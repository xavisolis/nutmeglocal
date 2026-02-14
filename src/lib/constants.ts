export const SITE_NAME = 'NutmegLocal';
export const SITE_DESCRIPTION = 'Discover local businesses in Greater Danbury, CT';
export const SITE_URL = 'https://nutmeglocal.com';

export const DANBURY_CENTER = {
  lat: 41.4015,
  lng: -73.4540,
};

export const GREATER_DANBURY_CITIES = [
  'Danbury',
  'Bethel',
  'Brookfield',
  'New Fairfield',
  'New Milford',
  'Newtown',
  'Redding',
  'Ridgefield',
  'Sherman',
];

export const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};
