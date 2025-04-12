export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const ENV_VARS = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  UNSPLASH_ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
  GEONAMES_USERNAME: process.env.NEXT_PUBLIC_GEONAMES_USERNAME || 'demo',
} as const;
