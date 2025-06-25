import { Artist } from '@/types/game';
import { getRandomArtist as getRandomArtistFromAPI, getDailyArtist as getDailyArtistFromAPI } from '@/lib/api-service';

export const getRandomArtist = async (countries?: string[]): Promise<Artist> => {
  return await getRandomArtistFromAPI(countries);
};

export const getDailyArtist = async (countries?: string[]): Promise<Artist> => {
  return await getDailyArtistFromAPI(countries);
};
