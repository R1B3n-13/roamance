import { createApi } from 'unsplash-js';

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '';

const unsplashApi = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
});

export async function fetchImages(
  query: string,
  count: number = 5
): Promise<string[]> {
  try {
    const enhancedQuery = `${query} landmark travel`;

    const result = await unsplashApi.search.getPhotos({
      query: enhancedQuery,
      perPage: count,
      orientation: 'landscape',
    });

    const photoResults = result.response?.results;
    if (photoResults && photoResults.length > 0) {
      return photoResults.map((photo) => photo.urls.regular);
    }

    console.log(`No images found for ${query} on Unsplash`);
    return [];
  } catch (error) {
    console.error(`Error fetching Unsplash images for ${query}:`, error);
    return [];
  }
}

export async function fetchImage(query: string): Promise<string | undefined> {
  const images = await fetchImages(query, 1);
  return images.length > 0 ? images[0] : undefined;
}

export async function getRandomTravelImage(): Promise<string | undefined> {
  try {
    const result = await unsplashApi.photos.getRandom({
      query: 'travel landscape',
      count: 1,
    });

    if (result.response && Array.isArray(result.response)) {
      return result.response[0].urls.regular;
    } else if (result.response) {
      return (result.response as { urls: { regular: string } }).urls.regular;
    }

    return undefined;
  } catch (error) {
    console.error('Error fetching random travel image:', error);
    return undefined;
  }
}

export { unsplashApi };
