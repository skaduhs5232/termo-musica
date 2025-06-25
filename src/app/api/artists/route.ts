import { NextRequest, NextResponse } from 'next/server';
import { Artist } from '@/types/game';

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

async function fetchDeezerArtists(): Promise<DeezerArtist[]> {
  const now = Date.now();
  
  // Verifica se o cache ainda é válido
  if (artistsCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return artistsCache;
  }

  try {
    // Lista de artistas populares para garantir diversidade e qualidade
    const popularArtists = [
      'taylor swift', 'bts', 'adele', 'drake', 'ariana grande',
      'billie eilish', 'justin bieber', 'dua lipa', 'the weeknd', 'bruno mars',
      'coldplay', 'imagine dragons', 'maroon 5', 'blackpink', 'eminem',
      'rihanna', 'beyonce', 'lady gaga', 'katy perry', 'post malone',
      'shawn mendes', 'harry styles', 'olivia rodrigo', 'doja cat', 'bad bunny',
      'twice', 'stray kids', 'newjeans', 'seventeen', 'ive',
      'michael jackson', 'queen', 'the beatles', 'elvis presley', 'madonna',
      'ed sheeran', 'sam smith', 'john legend', 'alicia keys', 'usher'
    ];

    const allArtists: DeezerArtist[] = [];
    
    // Buscar por artistas específicos para garantir que encontramos os corretos
    for (const artistName of popularArtists.slice(0, 20)) { // Limitar para não sobrecarregar
      try {
        const response = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=3`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            // Pegar o primeiro resultado (mais relevante) de cada busca
            const firstResult = data.data[0];
            // Verificar se é realmente o artista que estamos procurando (não duplicata)
            if (!allArtists.find(a => a.id === firstResult.id)) {
              allArtists.push(firstResult);
            }
          }
        }
      } catch (err) {
        console.warn(`Error searching for ${artistName}:`, err);
      }
    }

    // Se conseguimos alguns artistas, usar eles
    if (allArtists.length > 0) {
      // Ordenar por número de fãs para priorizar os mais populares
      allArtists.sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0));
      
      artistsCache = allArtists.slice(0, 30); // Limitar a 30 artistas
      cacheTimestamp = now;
      return artistsCache;
    }
    
    throw new Error('No artists found in search results');
  } catch (error) {
    console.error('Error fetching from Deezer API:', error);
    
    // Fallback apenas em caso de erro extremo
    throw new Error('Unable to fetch artists from Deezer API');
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'random';

    const deezerArtists = await fetchDeezerArtists();
    
    if (deezerArtists.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum artista disponível' },
        { status: 500 }
      );
    }

    let selectedArtist: DeezerArtist;

    if (type === 'daily') {
      // Para o artista diário, usar a data como seed para consistência
      const today = new Date();
      const dayOfYear = Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      const artistIndex = dayOfYear % deezerArtists.length;
      selectedArtist = deezerArtists[artistIndex];
    } else {
      // Para artista aleatório
      const randomIndex = Math.floor(Math.random() * deezerArtists.length);
      selectedArtist = deezerArtists[randomIndex];
    }

    const gameArtist = convertDeezerArtistToGameArtist(selectedArtist);

    return NextResponse.json(gameArtist);
  } catch (error) {
    console.error('Error in artists API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}