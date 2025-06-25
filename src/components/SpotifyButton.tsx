'use client';

import { useState, useEffect } from 'react';
import { spotifyService } from '@/lib/spotify-service';
import SpotifyLogo from './SpotifyLogo';

interface SpotifyButtonProps {
  onConnectionChange?: (connected: boolean) => void;
}

export default function SpotifyButton({ onConnectionChange }: SpotifyButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ display_name?: string } | null>(null);

  const [message, setMessage] = useState('');

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
      setMessage('');
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
        } else {
          setMessage('Falha na autenticação com o Spotify');
        }
      } catch (error) {
        console.error('Erro ao conectar com Spotify:', error);
        let errorMessage = 'Erro ao conectar com Spotify';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setMessage(errorMessage);
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
      setMessage('');
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    } else {
      // Conectar
      setIsLoading(true);
      setMessage('');
      try {
        spotifyService.redirectToSpotifyAuth();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Erro ao conectar');
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="relative group">
        <button
          disabled
          className="p-2 bg-green-500 text-white rounded-full cursor-not-allowed opacity-75"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <SpotifyLogo className="w-4 h-4 animate-pulse" />
          </div>
        </button>
        <div className="spotify-tooltip">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Conectando ao Spotify...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleConnect}
        className={`p-2 rounded-full font-medium transition-all duration-200 relative group-hover:scale-105 ${
          isConnected
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
            : 'bg-gray-200 hover:bg-green-500 hover:text-white dark:bg-gray-700 dark:hover:bg-green-500 text-gray-700 dark:text-gray-300 hover:shadow-lg'
        }`}
        title={isConnected ? 'Desconectar Spotify' : 'Conectar com Spotify'}
      >
        <SpotifyLogo className="w-5 h-5" />
        {isConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-green-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          </div>
        )}
      </button>
      
      {/* Tooltip/Popup */}
      <div className="spotify-tooltip">
        {isConnected ? (
          <div className="text-center">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
              ✅ Conectado ao Spotify
            </p>
            {userInfo?.display_name && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Olá, {userInfo.display_name}!
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Jogos personalizados com seus artistas favoritos ativados!
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
              Clique para desconectar
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              🎧 Conectar Spotify
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Conecte sua conta para jogos personalizados com artistas do seu histórico
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Clique para conectar
            </p>
          </div>
        )}
        
        {message && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-center">
            <p className="text-xs text-red-600 dark:text-red-400">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
