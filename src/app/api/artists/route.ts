import { NextRequest, NextResponse } from 'next/server';
import { Artist } from '@/types/game';
import { spotifyService, SpotifyArtist } from '@/lib/spotify-service';

// Interface para resposta da API do Deezer
interface DeezerArtist {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  tracklist: string;
  nb_fan: number;
  position?: number;
  type: string;
}

// Cache para armazenar artistas por um período
let artistsCache: DeezerArtist[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

// Cache para artistas do Spotify do usuário
let userSpotifyArtistsCache: SpotifyArtist[] = [];
let spotifyCacheTimestamp = 0;
const SPOTIFY_CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

async function fetchDeezerArtists(): Promise<DeezerArtist[]> {
  const now = Date.now();
  
  // Verifica se o cache ainda é válido
  if (artistsCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return artistsCache;
  }

  try {
    const allArtists: DeezerArtist[] = [];
    
    // Buscar artistas populares usando diferentes estratégias de busca para garantir diversidade
    const searchStrategies = [
      // Top charts globais
      { endpoint: 'chart/0/artists', limit: 50 },
      // Buscar por gêneros populares
      { query: 'pop', limit: 20 },
      { query: 'rock', limit: 15 },
      { query: 'hip hop', limit: 15 },
      { query: 'electronic', limit: 10 },
      { query: 'r&b', limit: 10 },
      { query: 'latin', limit: 10 },
      { query: 'k-pop', limit: 15 },
      { query: 'country', limit: 10 },
      { query: 'reggaeton', limit: 10 }
    ];

    for (const strategy of searchStrategies) {
      try {
        let url: string;
        
        if (strategy.endpoint) {
          // Usar endpoint de charts
          url = `https://api.deezer.com/${strategy.endpoint}?limit=${strategy.limit}`;
        } else {
          // Buscar por gênero/termo
          url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(strategy.query!)}&limit=${strategy.limit}`;
        }
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          const artists = data.data || [];
          
          for (const artist of artists) {
            // Filtrar apenas artistas com número significativo de fãs (indicador de popularidade)
            if (artist.nb_fan > 10000 && !allArtists.find(a => a.id === artist.id)) {
              allArtists.push(artist);
            }
          }
        }
      } catch (err) {
        console.warn(`Error with search strategy:`, err);
      }
    }

    if (allArtists.length > 0) {
      // Ordenar por número de fãs para priorizar os mais populares
      allArtists.sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0));
      
      // Usar mais artistas para maior diversidade
      artistsCache = allArtists.slice(0, 100);
      cacheTimestamp = now;
      return artistsCache;
    }
    
    throw new Error('No artists found in search results');
  } catch (error) {
    console.error('Error fetching from Deezer API:', error);
    throw new Error('Unable to fetch artists from Deezer API');
  }
}

async function fetchUserSpotifyArtists(): Promise<SpotifyArtist[]> {
  const now = Date.now();
  
  // Verifica se o cache ainda é válido
  if (userSpotifyArtistsCache.length > 0 && (now - spotifyCacheTimestamp) < SPOTIFY_CACHE_DURATION) {
    return userSpotifyArtistsCache;
  }

  try {
    const artists = await spotifyService.getAllUserArtists();
    userSpotifyArtistsCache = artists;
    spotifyCacheTimestamp = now;
    return artists;
  } catch (error) {
    console.error('Erro ao buscar artistas do Spotify:', error);
    return [];
  }
}

function convertDeezerArtistToGameArtist(deezerArtist: DeezerArtist): Artist {
  // Gerar dicas baseadas nas informações disponíveis
  const hints = [
    `Artista popular internacionalmente`,
    `Tem ${deezerArtist.nb_fan ? deezerArtist.nb_fan.toLocaleString() : 'muitos'} fãs no Deezer`,
  ];

  return {
    id: `deezer-${deezerArtist.id}`,
    name: deezerArtist.name.toUpperCase(),
    hints: hints,
    photo: deezerArtist.picture_medium || deezerArtist.picture_small || deezerArtist.picture
  };
}

function convertSpotifyArtistToGameArtist(spotifyArtist: SpotifyArtist): Artist {
  return {
    id: spotifyArtist.id,
    name: spotifyArtist.name,
    photo: spotifyArtist.images?.[0]?.url || '/placeholder-artist.jpg',
    audioPreview: '', // Will be filled by song API
    hints: [`Gênero: ${spotifyArtist.genres?.[0] || 'Desconhecido'}`, `Popularidade: ${spotifyArtist.popularity}%`]
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'random';

    let selectedArtist: DeezerArtist | SpotifyArtist;

    if (type === 'daily-spotify' || type === 'random-spotify') {
      // Usar APENAS artistas do Spotify para modos Spotify específicos
      const spotifyArtists = await fetchUserSpotifyArtists();
      
      if (spotifyArtists.length === 0) {
        return NextResponse.json(
          { error: 'Nenhum artista do Spotify encontrado. Conecte sua conta e certifique-se de ter histórico de reprodução.' },
          { status: 404 }
        );
      }

      if (type === 'daily-spotify') {
        const today = new Date();
        const dayOfYear = Math.floor(
          (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        const artistIndex = dayOfYear % spotifyArtists.length;
        selectedArtist = spotifyArtists[artistIndex];
      } else {
        const randomIndex = Math.floor(Math.random() * spotifyArtists.length);
        selectedArtist = spotifyArtists[randomIndex];
      }
    } else {
      // Para modos padrão (daily e random), priorizar Spotify se disponível, fallback para Deezer
      const spotifyArtists = await fetchUserSpotifyArtists();
      const useSpotifyArtists = spotifyArtists.length > 0;
      
      if (useSpotifyArtists) {
        // Usar apenas artistas do Spotify se disponíveis
        console.log(`🎵 Usando ${spotifyArtists.length} artistas do Spotify para ${type}`);
        
        if (type === 'daily') {
          const today = new Date();
          const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          const artistIndex = dayOfYear % spotifyArtists.length;
          selectedArtist = spotifyArtists[artistIndex];
        } else {
          const randomIndex = Math.floor(Math.random() * spotifyArtists.length);
          selectedArtist = spotifyArtists[randomIndex];
        }
      } else {
        // Fallback para Deezer apenas se não há artistas do Spotify
        console.log('🎵 Fallback para artistas do Deezer - usuário não conectado ao Spotify');
        const deezerArtists = await fetchDeezerArtists();
        
        if (deezerArtists.length === 0) {
          return NextResponse.json(
            { error: 'Nenhum artista disponível' },
            { status: 500 }
          );
        }

        if (type === 'daily') {
          const today = new Date();
          const dayOfYear = Math.floor(
            (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          const artistIndex = dayOfYear % deezerArtists.length;
          selectedArtist = deezerArtists[artistIndex];
        } else {
          const randomIndex = Math.floor(Math.random() * deezerArtists.length);
          selectedArtist = deezerArtists[randomIndex];
        }
      }
    }

    // Determinar se é Deezer ou Spotify baseado nas propriedades
    const gameArtist = 'picture' in selectedArtist
      ? convertDeezerArtistToGameArtist(selectedArtist as DeezerArtist)
      : convertSpotifyArtistToGameArtist(selectedArtist as SpotifyArtist);

    return NextResponse.json(gameArtist);
  } catch (error) {
    console.error('Error in artists API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}