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

// Mapeamento de países para artistas/termos de busca específicos
const COUNTRY_SEARCH_TERMS: Record<string, string[]> = {
  'US': ['american pop', 'american rock', 'american hip hop', 'american country'],
  'BR': ['brazilian music', 'sertanejo', 'mpb', 'bossa nova', 'funk carioca'],
  'GB': ['british rock', 'british pop', 'uk garage', 'british indie'],
  'CA': ['canadian music', 'canadian pop', 'canadian rock'],
  'AU': ['australian music', 'australian rock', 'australian pop'],
  'DE': ['german music', 'german pop', 'german rock', 'schlager'],
  'FR': ['french music', 'french pop', 'chanson française'],
  'ES': ['spanish music', 'spanish pop', 'flamenco', 'spanish rock'],
  'IT': ['italian music', 'italian pop', 'italian rock', 'opera'],
  'SE': ['swedish music', 'swedish pop', 'swedish rock', 'abba'],
  'NO': ['norwegian music', 'norwegian pop', 'norwegian rock'],
  'KR': ['k-pop', 'korean music', 'k-rock', 'korean ballad'],
  'JP': ['j-pop', 'japanese music', 'j-rock', 'japanese ballad'],
  'MX': ['mexican music', 'mariachi', 'regional mexican', 'mexican pop'],
  'AR': ['argentine music', 'tango', 'argentine rock', 'argentine pop'],
  'CO': ['colombian music', 'vallenato', 'colombian pop', 'colombian rock'],
  'CL': ['chilean music', 'nueva canción', 'chilean rock', 'chilean pop'],
  'PE': ['peruvian music', 'cumbia peruana', 'peruvian rock'],
  'NL': ['dutch music', 'dutch pop', 'dutch rock'],
  'BE': ['belgian music', 'belgian pop'],
  'CH': ['swiss music'],
  'AT': ['austrian music'],
  'DK': ['danish music', 'danish pop'],
  'FI': ['finnish music', 'finnish rock'],
  'PL': ['polish music', 'polish pop'],
  'RU': ['russian music', 'russian pop', 'russian rock'],
  'IN': ['indian music', 'bollywood', 'indian pop'],
  'CN': ['chinese music', 'c-pop', 'mandarin pop'],
  'ZA': ['south african music', 'afrikaans'],
  'NG': ['nigerian music', 'afrobeat', 'nigerian pop'],
  'EG': ['arabic music', 'egyptian music'],
  'TR': ['turkish music', 'turkish pop'],
  'IL': ['israeli music', 'hebrew music'],
  'AE': ['arabic music', 'middle eastern music'],
  'TH': ['thai music', 'thai pop'],
  'ID': ['indonesian music'],
  'MY': ['malaysian music'],
  'SG': ['singaporean music'],
  'PH': ['filipino music', 'opm'],
  'VN': ['vietnamese music', 'v-pop'],
};

// Cache para armazenar artistas por um período
const artistsCache: { [key: string]: DeezerArtist[] } = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

async function fetchDeezerArtists(countries?: string[]): Promise<DeezerArtist[]> {
  const now = Date.now();
  const cacheKey = countries ? countries.sort().join(',') : 'global';
  
  // Verifica se o cache ainda é válido para esta combinação de países
  if (artistsCache[cacheKey] && artistsCache[cacheKey].length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return artistsCache[cacheKey];
  }

  try {
    const allArtists: DeezerArtist[] = [];
    
    // Estratégias de busca baseadas nos países selecionados
    let searchStrategies: Array<{ endpoint?: string; query?: string; limit: number }> = [];
    
    if (countries && countries.length > 0) {
      // Buscar específico por países
      countries.forEach(countryCode => {
        const terms = COUNTRY_SEARCH_TERMS[countryCode] || [];
        terms.forEach(term => {
          searchStrategies.push({ query: term, limit: 10 });
        });
      });
      
      // Adicionar algumas buscas globais também
      searchStrategies.push(
        { endpoint: 'chart/0/artists', limit: 20 },
        { query: 'pop', limit: 10 },
        { query: 'rock', limit: 10 }
      );
    } else {
      // Buscar artistas populares usando diferentes estratégias de busca para garantir diversidade
      searchStrategies = [
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
    }

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
      artistsCache[cacheKey] = allArtists.slice(0, 100);
      cacheTimestamp = now;
      return artistsCache[cacheKey];
    }
    
    throw new Error('No artists found in search results');
  } catch (error) {
    console.error('Error fetching from Deezer API:', error);
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
    const countriesParam = searchParams.get('countries');
    const countries = countriesParam ? countriesParam.split(',') : undefined;

    const deezerArtists = await fetchDeezerArtists(countries);
    
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