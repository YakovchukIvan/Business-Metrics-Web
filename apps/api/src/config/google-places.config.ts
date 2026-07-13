import { registerAs } from '@nestjs/config';

export default registerAs('googlePlaces', () => ({
  apiKey: process.env.GOOGLE_PLACES_API_KEY,
}));
