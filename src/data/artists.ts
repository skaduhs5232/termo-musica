import { Artist } from '@/types/game';
import { getRandomArtist as getRandomArtistFromAPI, getDailyArtist as getDailyArtistFromAPI } from '@/lib/api-service';

export const getRandomArtist = async (): Promise<Artist> => {
  return await getRandomArtistFromAPI();
};

export const getDailyArtist = async (): Promise<Artist> => {
  return await getDailyArtistFromAPI();
};
