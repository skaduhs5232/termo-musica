import Cookies from 'js-cookie';

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; height: number; width: number }[];
  genres: string[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopArtistsResponse {
  items: SpotifyArtist[];
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTrack[];
}

class SpotifyService {
  private get clientId(): string {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    }
    return '';
  }
  
  private get redirectUri(): string {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || '';
    }
    return '';
  }
  
  private scopes = [
    'user-top-read',
    'user-read-recently-played',
    'user-library-read'
  ].join(' ');

  private getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scopes,
      redirect_uri: this.redirectUri,
      state: this.generateState()
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  private generateState(): string {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // Usar cookies mais seguros com configurações específicas
    Cookies.set('spotify_auth_state', state, { 
      expires: 1/24, // 1 hora
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
    // Também salvar no sessionStorage como backup
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('spotify_auth_state', state);
    }
    return state;
  }

  public redirectToSpotifyAuth(): void {
    console.log('Redirecionando para Spotify...');
    console.log('Client ID:', this.clientId ? 'Configurado' : 'NÃO CONFIGURADO');
    console.log('Redirect URI:', this.redirectUri ? this.redirectUri : 'NÃO CONFIGURADO');
    
    if (!this.clientId || !this.redirectUri) {
      const errorMsg = 'Credenciais do Spotify não configuradas. Verifique as variáveis de ambiente.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    window.location.href = this.getAuthUrl();
  }

  public async exchangeCodeForToken(code: string, state: string): Promise<boolean> {
    console.log('🔄 Iniciando troca de código por token...');
    console.log('State recebido:', state);
    
    // Verificar estado de múltiplas fontes para maior robustez
    const savedStateCookie = Cookies.get('spotify_auth_state');
    const savedStateSession = typeof window !== 'undefined' ? sessionStorage.getItem('spotify_auth_state') : null;
    
    console.log('State salvo no cookie:', savedStateCookie);
    console.log('State salvo na sessão:', savedStateSession);
    
    // Verificar se o estado bate com pelo menos uma das fontes
    if (state !== savedStateCookie && state !== savedStateSession) {
      console.error('❌ Estado não confere:');
      console.error('  - Recebido:', state);
      console.error('  - Cookie:', savedStateCookie);
      console.error('  - Sessão:', savedStateSession);
      
      // Limpar estados inválidos
      Cookies.remove('spotify_auth_state');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('spotify_auth_state');
      }
      
      throw new Error('Estado inválido - possível ataque CSRF');
    }

    console.log('✅ Estado validado com sucesso!');

    try {
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          redirect_uri: this.redirectUri
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token exchange failed:', errorData);
        
        let errorMessage = 'Falha ao obter token';
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        } else if (errorData.error) {
          errorMessage += `: ${errorData.error}`;
        }
        
        throw new Error(errorMessage);
      }

      const { access_token, refresh_token, expires_in } = await response.json();
      
      console.log('✅ Token obtido com sucesso!');
      
      // Salvar tokens nos cookies
      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + expires_in);
      
      Cookies.set('spotify_access_token', access_token, { expires: expires_in / (24 * 60 * 60) });
      Cookies.set('spotify_refresh_token', refresh_token, { expires: 30 }); // 30 dias
      
      // Limpar estados de autenticação
      Cookies.remove('spotify_auth_state');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('spotify_auth_state');
      }
      
      console.log('🧹 Estados de autenticação limpos');
      
      return true;
    } catch (error) {
      console.error('Erro ao trocar código por token:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Erro desconhecido ao conectar com Spotify');
    }
  }

  public isAuthenticated(): boolean {
    return !!Cookies.get('spotify_access_token');
  }

  public logout(): void {
    console.log('🚪 Fazendo logout do Spotify...');
    Cookies.remove('spotify_access_token');
    Cookies.remove('spotify_refresh_token');
    Cookies.remove('spotify_auth_state');
    
    // Limpar também do sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('spotify_user_artists');
    }
    
    console.log('✅ Logout realizado com sucesso');
  }

  private async getAccessToken(): Promise<string | null> {
    let accessToken = Cookies.get('spotify_access_token');
    
    if (!accessToken) {
      const refreshToken = Cookies.get('spotify_refresh_token');
      if (!refreshToken) {
        return null;
      }

      try {
        const response = await fetch('/api/spotify/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
          this.logout();
          return null;
        }

        const { access_token, expires_in } = await response.json();
        
        Cookies.set('spotify_access_token', access_token, { expires: expires_in / (24 * 60 * 60) });
        accessToken = access_token;
      } catch (error) {
        console.error('Erro ao renovar token:', error);
        this.logout();
        return null;
      }
    }

    return accessToken || null;
  }

  private async makeSpotifyRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<unknown> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Token de acesso não disponível');
    }

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
        throw new Error('Token expirado - faça login novamente');
      }
      throw new Error(`Erro na API do Spotify: ${response.status}`);
    }

    return response.json();
  }

  public async getUserTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyArtist[]> {
    try {
      const data = await this.makeSpotifyRequest(
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`
      ) as SpotifyTopArtistsResponse;
      return data.items;
    } catch (error) {
      console.error('Erro ao buscar artistas favoritos:', error);
      throw error;
    }
  }

  public async getUserTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit: number = 50): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeSpotifyRequest(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
      ) as SpotifyTopTracksResponse;
      return data.items;
    } catch (error) {
      console.error('Erro ao buscar músicas favoritas:', error);
      throw error;
    }
  }

  public async getArtistsByTracks(): Promise<SpotifyArtist[]> {
    try {
      const tracks = await this.getUserTopTracks('medium_term', 50);
      const artistsMap = new Map<string, SpotifyArtist>();
      
      tracks.forEach(track => {
        track.artists.forEach(artist => {
          if (!artistsMap.has(artist.id)) {
            artistsMap.set(artist.id, artist);
          }
        });
      });

      return Array.from(artistsMap.values());
    } catch (error) {
      console.error('Erro ao extrair artistas das músicas:', error);
      throw error;
    }
  }

  public async getAllUserArtists(): Promise<SpotifyArtist[]> {
    try {
      const [topArtists, artistsFromTracks, recentArtists] = await Promise.all([
        this.getUserTopArtists('medium_term', 50),
        this.getArtistsByTracks(),
        this.getRecentlyPlayedArtists(50)
      ]);

      // Combinar e remover duplicatas
      const artistsMap = new Map<string, SpotifyArtist>();
      
      [...topArtists, ...artistsFromTracks, ...recentArtists].forEach(artist => {
        artistsMap.set(artist.id, artist);
      });

      const allArtists = Array.from(artistsMap.values());
      
      // Ordenar por popularidade (se disponível) para ter os melhores primeiro
      return allArtists.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } catch (error) {
      console.error('Erro ao buscar todos os artistas do usuário:', error);
      throw error;
    }
  }

  // Método para buscar informações do usuário
  public async getUserProfile(): Promise<{ display_name?: string; id: string } | null> {
    try {
      const data = await this.makeSpotifyRequest('/me') as { display_name?: string; id: string };
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  // Método melhorado baseado no exemplo fornecido
  public async getTopTracksDetailed(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'long_term', limit: number = 50): Promise<SpotifyTrack[]> {
    try {
      const data = await this.makeSpotifyRequest(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
      ) as SpotifyTopTracksResponse;
      
      return data.items.map(track => ({
        ...track,
        // Garantir que temos as informações dos artistas
        artists: track.artists.map(artist => ({
          ...artist,
          name: artist.name,
          id: artist.id
        }))
      }));
    } catch (error) {
      console.error('Erro ao buscar músicas favoritas detalhadas:', error);
      throw error;
    }
  }

  // Método para buscar artistas recentes baseado nas músicas tocadas recentemente
  public async getRecentlyPlayedArtists(limit: number = 50): Promise<SpotifyArtist[]> {
    try {
      const data = await this.makeSpotifyRequest(
        `/me/player/recently-played?limit=${limit}`
      ) as { items: { track: SpotifyTrack }[] };
      
      const artistsMap = new Map<string, SpotifyArtist>();
      
      data.items.forEach(item => {
        item.track.artists.forEach(artist => {
          if (!artistsMap.has(artist.id)) {
            artistsMap.set(artist.id, artist);
          }
        });
      });

      return Array.from(artistsMap.values());
    } catch (error) {
      console.error('Erro ao buscar artistas tocados recentemente:', error);
      return [];
    }
  }

  // Método para limpar estados órfãos em caso de problemas
  public clearAuthStates(): void {
    console.log('🧹 Limpando todos os estados de autenticação...');
    
    // Limpar cookies
    Cookies.remove('spotify_auth_state');
    Cookies.remove('spotify_access_token'); 
    Cookies.remove('spotify_refresh_token');
    
    // Limpar storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('spotify_user_artists');
    }
    
    console.log('✅ Estados limpos com sucesso');
  }

  // Método para debug
  public debugAuthState(): void {
    console.log('🔍 DEBUG - Estado atual da autenticação:');
    console.log('Cookie access_token:', Cookies.get('spotify_access_token') ? 'Presente' : 'Ausente');
    console.log('Cookie refresh_token:', Cookies.get('spotify_refresh_token') ? 'Presente' : 'Ausente');
    console.log('Cookie auth_state:', Cookies.get('spotify_auth_state'));
    
    if (typeof window !== 'undefined') {
      console.log('Session auth_state:', sessionStorage.getItem('spotify_auth_state'));
      console.log('LocalStorage user_artists:', localStorage.getItem('spotify_user_artists') ? 'Presente' : 'Ausente');
    }
  }
}

export const spotifyService = new SpotifyService();
