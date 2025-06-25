import { NextRequest, NextResponse } from 'next/server';

// Interface para resposta de músicas da API do Deezer
interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  link: string;
  duration: number;
  rank?: number;
  preview: string;
  artist: {
    id: number;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    release_date?: string;
  };
  type: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumCover: string;
  hints: string[];
}

// Cache para armazenar músicas por artista
const songsCache = new Map<string, { songs: DeezerTrack[], timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

async function fetchArtistSongs(artistName: string): Promise<DeezerTrack[]> {
  const now = Date.now();
  const cacheKey = artistName.toLowerCase();
  
  // Verifica se o cache ainda é válido
  const cached = songsCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.songs;
  }

  try {
    // Primeiro, buscar o artista para obter o ID correto
    const artistResponse = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=5`);
    
    if (!artistResponse.ok) {
      throw new Error(`Deezer API error: ${artistResponse.status}`);
    }

    const artistData = await artistResponse.json();
    
    if (!artistData.data || !Array.isArray(artistData.data) || artistData.data.length === 0) {
      throw new Error('Artista não encontrado');
    }

    // Encontrar o artista correto (primeira correspondência mais próxima)
    const targetArtist = artistData.data.find((artist: { id: number; name: string }) => 
      artist.name.toLowerCase().includes(artistName.toLowerCase()) ||
      artistName.toLowerCase().includes(artist.name.toLowerCase())
    ) || artistData.data[0];

    // Buscar as top músicas do artista usando o endpoint específico
    const songsResponse = await fetch(`https://api.deezer.com/artist/${targetArtist.id}/top?limit=50`);
    
    if (!songsResponse.ok) {
      throw new Error(`Deezer API error: ${songsResponse.status}`);
    }

    const songsData = await songsResponse.json();
    
    if (songsData.data && Array.isArray(songsData.data)) {
      // Filtrar apenas músicas que realmente são do artista correto
      const filteredSongs = songsData.data.filter((track: DeezerTrack) => 
        track.artist.id === targetArtist.id
      );

      // Para cada música, buscar informações detalhadas do álbum se necessário
      const enhancedSongs = await Promise.all(
        filteredSongs.slice(0, 20).map(async (track: DeezerTrack) => {
          try {
            // Buscar informações detalhadas do álbum para obter a data de lançamento
            const albumResponse = await fetch(`https://api.deezer.com/album/${track.album.id}`);
            if (albumResponse.ok) {
              const albumData = await albumResponse.json();
              track.album.release_date = albumData.release_date;
            }
          } catch (err) {
            // Se não conseguir buscar dados do álbum, continuar sem a data
            console.warn(`Could not fetch album data for ${track.album.title}:`, err);
          }
          return track;
        })
      );

      // Armazenar no cache
      songsCache.set(cacheKey, { songs: enhancedSongs, timestamp: now });
      return enhancedSongs;
    }
    
    throw new Error('Invalid response format from Deezer API');
  } catch (error) {
    console.error('Error fetching songs from Deezer API:', error);
    return [];
  }
}

function convertDeezerTrackToGameSong(track: DeezerTrack): Song {
  const hints = [];
  
  // Dica sobre duração
  const minutes = Math.floor(track.duration / 60);
  const seconds = track.duration % 60;
  hints.push(`Duração: ${minutes}:${seconds.toString().padStart(2, '0')}`);
  
  // Dica sobre o ano de lançamento do álbum
  if (track.album.release_date) {
    const year = track.album.release_date.slice(0, 4);
    hints.push(`Lançado em ${year}`);
  } else {
    // Fallback baseado no ID se não tiver data
    if (track.id > 2000000000) {
      hints.push(`Lançado após 2020`);
    } else if (track.id > 1000000000) {
      hints.push(`Lançado entre 2010-2020`);
    } else if (track.id > 100000000) {
      hints.push(`Lançado entre 2000-2010`);
    } else {
      hints.push(`Lançado antes de 2000`);
    }
  }
  
  // Dica sobre popularidade baseada no rank
  if (track.rank && track.rank > 800000) {
    hints.push(`Uma das músicas mais populares do artista`);
  } else if (track.rank && track.rank > 500000) {
    hints.push(`Música popular do artista`);
  } else {
    hints.push(`Música conhecida pelos fãs`);
  }
  
  // Dica sobre gênero baseado no nome da música
  const title = track.title.toLowerCase();
  if (title.includes('love') || title.includes('heart')) {
    hints.push(`Tema romântico`);
  } else if (title.includes('party') || title.includes('dance') || title.includes('beat')) {
    hints.push(`Música para dançar`);
  } else if (title.includes('sad') || title.includes('cry') || title.includes('hurt')) {
    hints.push(`Música melancólica`);
  } else if (title.includes('rock') || title.includes('metal')) {
    hints.push(`Estilo rock/metal`);
  }

  return {
    id: `deezer-track-${track.id}`,
    title: track.title.toUpperCase(),
    artist: track.artist.name,
    album: track.album.title,
    albumCover: track.album.cover_medium || track.album.cover || track.album.cover_small,
    hints: hints
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get('artist');
    
    if (!artist) {
      return NextResponse.json(
        { error: 'Nome do artista é obrigatório' },
        { status: 400 }
      );
    }

    const deezerTracks = await fetchArtistSongs(artist);
    
    if (deezerTracks.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma música encontrada para este artista' },
        { status: 404 }
      );
    }

    // Selecionar uma música aleatória
    const randomIndex = Math.floor(Math.random() * deezerTracks.length);
    const selectedTrack = deezerTracks[randomIndex];

    const gameSong = convertDeezerTrackToGameSong(selectedTrack);

    return NextResponse.json(gameSong);
  } catch (error) {
    console.error('Error in songs API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artist } = body;
    
    if (!artist) {
      return NextResponse.json(
        { error: 'Nome do artista é obrigatório' },
        { status: 400 }
      );
    }

    const deezerTracks = await fetchArtistSongs(artist);
    
    if (deezerTracks.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma música encontrada para este artista' },
        { status: 404 }
      );
    }

    // Retornar informações sobre quantas músicas foram encontradas
    return NextResponse.json({
      artist: artist,
      songsFound: deezerTracks.length,
      message: `Encontradas ${deezerTracks.length} músicas de ${artist}`
    });
  } catch (error) {
    console.error('Error in songs API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
