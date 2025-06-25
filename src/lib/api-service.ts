import { Artist } from '@/types/game';

export async function getRandomArtist(): Promise<Artist> {
  try {
    const response = await fetch('/api/artists?type=random');
    
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

export async function getDailyArtist(): Promise<Artist> {
  try {
    const response = await fetch('/api/artists?type=daily');
    
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

export async function getDailySpotifyArtist(): Promise<Artist> {
  try {
    const response = await fetch('/api/artists?type=daily-spotify');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const artist = await response.json();
    return artist;
  } catch (error) {
    console.error('Error fetching daily Spotify artist:', error);
    // Fallback para artista diário normal se falhar
    return getDailyArtist();
  }
}

export async function getRandomSpotifyArtist(): Promise<Artist> {
  try {
    const response = await fetch('/api/artists?type=random-spotify');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const artist = await response.json();
    return artist;
  } catch (error) {
    console.error('Error fetching random Spotify artist:', error);
    // Fallback para artista aleatório normal se falhar
    return getRandomArtist();
  }
}
