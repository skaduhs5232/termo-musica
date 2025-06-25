'use client';

import { useState, useEffect } from 'react';
import { spotifyService } from '@/lib/spotify-service';
import { Music } from 'lucide-react';

interface SpotifyButtonProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function SpotifyButton({ onConnectionChange }: SpotifyButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ display_name?: string } | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      const connected = spotifyService.isAuthenticated();
      setIsConnected(connected);
      if (onConnectionChange) {
        onConnectionChange(connected);
      }
    };

    const handleSpotifyCallback = async (code: string, state: string) => {
      setIsLoading(true);
      try {
        const success = await spotifyService.exchangeCodeForToken(code, state);
        if (success) {
          setIsConnected(true);
          if (onConnectionChange) {
            onConnectionChange(true);
          }
          
          // Limpar parâmetros da URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Tentar buscar informações do usuário
          await fetchUserInfo();
        }
      } catch (error) {
        console.error('Erro ao conectar com Spotify:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();

    // Verificar se voltou da autorização do Spotify
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleSpotifyCallback(code, state);
    }
  }, [onConnectionChange]);

  const fetchUserInfo = async () => {
    try {
      const user = await spotifyService.getUserProfile();
      setUserInfo(user);
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
    }
  };

  const handleConnect = () => {
    if (isConnected) {
      // Desconectar
      spotifyService.logout();
      setIsConnected(false);
      setUserInfo(null);
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } else {
      // Conectar
      setIsLoading(true);
      spotifyService.redirectToSpotifyAuth();
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        Conectando...
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleConnect}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isConnected
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        <Music className="w-5 h-5" />
        {isConnected ? 'Desconectar Spotify' : 'Conectar com Spotify'}
      </button>
      
      {isConnected && (
        <div className="text-center">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✅ Conectado ao Spotify
          </p>
          {userInfo?.display_name && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Olá, {userInfo.display_name}!
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Agora você pode jogar com seus artistas favoritos!
          </p>
        </div>
      )}
      
      {!isConnected && (
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center max-w-xs">
          Conecte sua conta do Spotify para jogar com artistas baseados no seu histórico de escuta
        </p>
      )}
    </div>
  );
}
