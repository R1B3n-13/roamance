export interface TouristPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  description: string;
  color: string;
  size: number;
  image?: string;
  images?: string[]; // Array of image URLs for the carousel
}
