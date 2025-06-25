import { Artist } from '@/types/game';

export async function getRandomArtist(countries?: string[]): Promise<Artist> {
  try {
    const params = new URLSearchParams({ type: 'random' });
    if (countries && countries.length > 0) {
      params.append('countries', countries.join(','));
    }
    
    const response = await fetch(`/api/artists?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const artist = await response.json();
    return artist;
  } catch (error) {
    console.error('Error fetching random artist:', error);
    throw error;
  }
}

export async function getDailyArtist(countries?: string[]): Promise<Artist> {
  try {
    const params = new URLSearchParams({ type: 'daily' });
    if (countries && countries.length > 0) {
      params.append('countries', countries.join(','));
    }
    
    const response = await fetch(`/api/artists?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const artist = await response.json();
    return artist;
  } catch (error) {
    console.error('Error fetching daily artist:', error);
    throw error;
  }
}
