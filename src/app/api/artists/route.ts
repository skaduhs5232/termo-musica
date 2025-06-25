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
  'US': ['american pop', 'american rock', 'american hip hop', 'american country', 'usa artists', 'american music'],
  'BR': ['brazilian music', 'sertanejo', 'mpb', 'bossa nova', 'funk carioca', 'brazil artists', 'musica brasileira'],
  'GB': ['british rock', 'british pop', 'uk garage', 'british indie', 'uk artists', 'british music'],
  'CA': ['canadian music', 'canadian pop', 'canadian rock', 'canada artists'],
  'AU': ['australian music', 'australian rock', 'australian pop', 'aussie artists'],
  'DE': ['german music', 'german pop', 'german rock', 'schlager', 'deutsche musik'],
  'FR': ['french music', 'french pop', 'chanson française', 'musique française'],
  'ES': ['spanish music', 'spanish pop', 'flamenco', 'spanish rock', 'musica española'],
  'IT': ['italian music', 'italian pop', 'italian rock', 'opera', 'musica italiana'],
  'SE': ['swedish music', 'swedish pop', 'swedish rock', 'svenska artister'],
  'NO': ['norwegian music', 'norwegian pop', 'norwegian rock', 'norsk musikk'],
  'KR': ['k-pop', 'korean music', 'k-rock', 'korean ballad', 'kpop artists'],
  'JP': ['j-pop', 'japanese music', 'j-rock', 'japanese ballad', 'jpop artists'],
  'MX': ['mexican music', 'mariachi', 'regional mexican', 'mexican pop', 'musica mexicana'],
  'AR': ['argentine music', 'tango', 'argentine rock', 'argentine pop', 'musica argentina'],
  'CO': ['colombian music', 'vallenato', 'colombian pop', 'colombian rock', 'musica colombiana'],
  'CL': ['chilean music', 'nueva canción', 'chilean rock', 'chilean pop', 'musica chilena'],
  'PE': ['peruvian music', 'cumbia peruana', 'peruvian rock', 'musica peruana'],
  'NL': ['dutch music', 'dutch pop', 'dutch rock', 'nederlandse muziek'],
  'BE': ['belgian music', 'belgian pop', 'belgische muziek'],
  'CH': ['swiss music', 'schweizer musik'],
  'AT': ['austrian music', 'österreichische musik'],
  'DK': ['danish music', 'danish pop', 'dansk musik'],
  'FI': ['finnish music', 'finnish rock', 'suomalainen musiikki'],
  'PL': ['polish music', 'polish pop', 'polska muzyka'],
  'RU': ['russian music', 'russian pop', 'russian rock', 'русская музыка'],
  'IN': ['indian music', 'bollywood', 'indian pop', 'hindi music'],
  'CN': ['chinese music', 'c-pop', 'mandarin pop', 'chinese artists'],
  'ZA': ['south african music', 'afrikaans', 'south africa artists'],
  'NG': ['nigerian music', 'afrobeat', 'nigerian pop', 'naija music'],
  'EG': ['arabic music', 'egyptian music', 'arab artists'],
  'TR': ['turkish music', 'turkish pop', 'türk müziği'],
  'IL': ['israeli music', 'hebrew music', 'israel artists'],
  'AE': ['arabic music', 'middle eastern music', 'arab pop'],
  'TH': ['thai music', 'thai pop', 'เพลงไทย'],
  'ID': ['indonesian music', 'musik indonesia'],
  'MY': ['malaysian music', 'musik malaysia'],
  'SG': ['singaporean music', 'singapore artists'],
  'PH': ['filipino music', 'opm', 'philippine music'],
  'VN': ['vietnamese music', 'v-pop', 'nhạc việt'],
};

// Cache para armazenar artistas por um período
const artistsCache: { [key: string]: { artists: DeezerArtist[], timestamp: number } } = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

async function fetchDeezerArtists(countries?: string[]): Promise<DeezerArtist[]> {
  const now = Date.now();
  const cacheKey = countries ? countries.sort().join(',') : 'global';
  
  // Log para debug
  console.log('🎵 Buscando artistas para países:', countries || 'todos');
  
  // Verifica se o cache ainda é válido para esta combinação de países
  const cached = artistsCache[cacheKey];
  if (cached && cached.artists.length > 0 && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('📦 Usando cache para:', cacheKey, '- Total:', cached.artists.length);
    return cached.artists;
  }

  try {
    const allArtists: DeezerArtist[] = [];
    
    // Estratégias de busca baseadas nos países selecionados
    let searchStrategies: Array<{ endpoint?: string; query?: string; limit: number }> = [];
    
    if (countries && countries.length > 0) {
      // Buscar APENAS específico por países selecionados
      console.log('🌍 Modo específico por países:', countries);
      
      countries.forEach(countryCode => {
        const terms = COUNTRY_SEARCH_TERMS[countryCode] || [];
        console.log(`🏳️ País ${countryCode}: ${terms.length} termos de busca`);
        terms.forEach(term => {
          searchStrategies.push({ query: term, limit: 15 });
        });
      });
      
      // Se não encontrou termos específicos para os países, usar termos mais genéricos
      if (searchStrategies.length === 0) {
        console.log('⚠️ Nenhum termo específico encontrado, usando termos genéricos');
        searchStrategies.push(
          { query: 'popular music', limit: 20 },
          { query: 'top hits', limit: 15 }
        );
      }
      
      console.log(`🔍 Total de estratégias de busca: ${searchStrategies.length}`);
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
      const artistsToCache = allArtists.slice(0, 100);
      artistsCache[cacheKey] = { artists: artistsToCache, timestamp: now };
      
      console.log(`✅ Encontrados ${allArtists.length} artistas para países:`, countries || 'todos');
      console.log('🎯 Top 5 artistas encontrados:', 
        allArtists.slice(0, 5).map(a => `${a.name} (${a.nb_fan} fãs)`));
      
      return artistsToCache;
    }
    
    console.log('❌ Nenhum artista encontrado para países:', countries || 'todos');
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

    console.log(`🎤 Artista selecionado: ${gameArtist.name} (${selectedArtist.nb_fan} fãs) - Modo: ${type}`);
    console.log(`🌍 Países solicitados:`, countries || 'todos');

    return NextResponse.json(gameArtist);
  } catch (error) {
    console.error('Error in artists API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}