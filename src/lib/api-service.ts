import { Artist } from '@/types/game';
import { spotifyService } from './spotify-service';

// Função para verificar se o usuário está conectado ao Spotify
function isSpotifyConnected(): boolean {
  if (typeof window === 'undefined') return false;
  return spotifyService.isAuthenticated();
}

export async function getRandomArtist(): Promise<Artist> {
  try {
    // Usar endpoint com Spotify quando conectado
    const endpoint = isSpotifyConnected() ? '/api/artists?type=random-spotify' : '/api/artists?type=random';
    const response = await fetch(endpoint);
    
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
    // Usar endpoint com Spotify quando conectado
    const endpoint = isSpotifyConnected() ? '/api/artists?type=daily-spotify' : '/api/artists?type=daily';
    const response = await fetch(endpoint);
    
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
