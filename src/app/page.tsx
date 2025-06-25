'use client';

import { useState } from 'react';
import TermoMusical from '@/components/TermoMusical';
import SongGuessGame from '@/components/SongGuessGame';
import CountrySelector from '@/components/CountrySelector';
import ThemeToggle from '@/components/ThemeToggle';
import { getRandomArtist, getDailyArtist } from '@/lib/api-service';
import { Artist, GameMode } from '@/types/game';
import { Calendar, Shuffle, Music } from 'lucide-react';

export default function Home() {
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('daily');
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'country-selector' | 'artist-game' | 'song-game'>('menu');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [pendingGameMode, setPendingGameMode] = useState<'daily' | 'practice'>('daily');
  const [isLoading, setIsLoading] = useState(false);

  const loadArtist = async (mode: 'daily' | 'practice', countries?: string[]) => {
    setIsLoading(true);
    try {
      const artist = mode === 'daily' ? await getDailyArtist(countries) : await getRandomArtist(countries);
      setCurrentArtist(artist);
    } catch (error) {
      console.error('Error loading artist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartArtistGame = async (mode: 'daily' | 'practice') => {
    setPendingGameMode(mode);
    setCurrentScreen('country-selector');
  };

  const handleCountriesSelected = async (countries: string[]) => {
    setSelectedCountries(countries);
    setGameMode(pendingGameMode);
    await loadArtist(pendingGameMode, countries);
    setCurrentScreen('artist-game');
  };

  const handleStartSongGame = () => {
    setGameMode('song-guess');
    setCurrentScreen('song-game');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setCurrentArtist(null);
    setSelectedCountries([]);
  };

  const handleBackToCountrySelector = () => {
    setCurrentScreen('country-selector');
  };



  if (currentScreen === 'country-selector') {
    return (
      <CountrySelector
        onCountriesSelected={handleCountriesSelected}
        onBack={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-end mb-6">
              <ThemeToggle />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              🎵 Termo Musical
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Escolha seu modo de jogo!
            </p>
          </div>

          {/* Game Mode Selection */}
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Artist Guessing Games */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                🎤 Adivinhe o Artista
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleStartArtistGame('daily')}
                  disabled={isLoading}
                  className="flex flex-col items-center space-y-3 p-6 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border-2 border-blue-200 dark:border-blue-700 disabled:opacity-50"
                >
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Desafio Diário</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Um novo artista todos os dias!
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleStartArtistGame('practice')}
                  disabled={isLoading}
                  className="flex flex-col items-center space-y-3 p-6 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors border-2 border-green-200 dark:border-green-700 disabled:opacity-50"
                >
                  <Shuffle className="w-8 h-8 text-green-500" />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Modo Prática</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pratique com artistas aleatórios!
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Song Guessing Game */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
                🎵 Adivinhe a Música
              </h2>
              <button
                onClick={handleStartSongGame}
                className="w-full flex flex-col items-center space-y-3 p-6 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors border-2 border-purple-200 dark:border-purple-700"
              >
                <Music className="w-8 h-8 text-purple-500" />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Modo Música</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Digite um artista e tente adivinhar a música!
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center mt-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
            <p>
              🎵 Termo Musical - Inspirado no{' '}
              <a
                href="https://term.ooo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                Termo
              </a>
            </p>
          </footer>
        </div>
      </div>
    );
  }

  if (currentScreen === 'song-game') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-end mb-6">
            <ThemeToggle />
          </div>
          <SongGuessGame onBack={handleBackToMenu} />
        </div>
      </div>
    );
  }

  if (currentScreen === 'artist-game' && currentArtist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          {/* Header com botão de voltar e tema */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleBackToCountrySelector}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                ← Voltar à Seleção de Países
              </button>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {gameMode === 'daily' ? (
                <p>🗓️ Desafio Diário - Um novo artista todos os dias!</p>
              ) : (
                <p>🎯 Modo Prática - Artistas aleatórios!</p>
              )}
            </div>
          </div>

          {/* Jogo Principal */}
          {isLoading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
            </div>
          ) : (
            <TermoMusical
              key={`${gameMode}-${currentArtist.id}`}
              artist={currentArtist}
              gameMode={gameMode as 'daily' | 'practice'}
              onGameEnd={(won, attempts) => {
                console.log(`Game ended: ${won ? 'Won' : 'Lost'} in ${attempts} attempts`);
              }}
              onNewGame={gameMode === 'practice' ? () => loadArtist('practice', selectedCountries) : undefined}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
