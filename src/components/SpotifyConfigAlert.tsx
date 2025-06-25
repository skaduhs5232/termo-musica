'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function SpotifyConfigAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasRedirectUri: boolean;
  } | null>(null);

  useEffect(() => {
    // Verificar configuração apenas em produção
    if (process.env.NODE_ENV === 'production') {
      checkSpotifyConfig();
    }
  }, []);

  const checkSpotifyConfig = async () => {
    try {
      const response = await fetch('/api/spotify/debug');
      const data = await response.json();
      
      setConfigStatus(data);
      
      if (!data.hasClientId || !data.hasClientSecret || !data.hasRedirectUri) {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Erro ao verificar configuração do Spotify:', error);
    }
  };

  if (!showAlert || !configStatus) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Configuração do Spotify Incompleta
            </h3>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              {!configStatus.hasClientId && (
                <p>❌ NEXT_PUBLIC_SPOTIFY_CLIENT_ID não configurado</p>
              )}
              {!configStatus.hasClientSecret && (
                <p>❌ SPOTIFY_CLIENT_SECRET não configurado</p>
              )}
              {!configStatus.hasRedirectUri && (
                <p>❌ NEXT_PUBLIC_SPOTIFY_REDIRECT_URI não configurado</p>
              )}
              <p className="mt-2">
                📖 Consulte o arquivo VERCEL_SETUP.md para instruções completas
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="ml-2 text-yellow-400 hover:text-yellow-600 dark:text-yellow-300 dark:hover:text-yellow-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
