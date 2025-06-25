'use client';

import { useState } from 'react';
import { Song, SongGameState, Attempt } from '@/types/game';
import { compareGuess, isValidGuess, normalizeArtistName } from '@/lib/game-logic';
import { Share2, RotateCcw, User } from 'lucide-react';
import Image from 'next/image';
import GameBoard from './GameBoard';
import ImageModal from './ImageModal';

interface SongGuessGameProps {
  onBack: () => void;
}

export default function SongGuessGame({ onBack }: SongGuessGameProps) {
  const [gameState, setGameState] = useState<SongGameState | null>(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [artistInput, setArtistInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentArtist, setCurrentArtist] = useState('');
  const [usedSongs, setUsedSongs] = useState<Set<string>>(new Set());
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [shouldFocusFirstCell, setShouldFocusFirstCell] = useState(false);

  const startNewGame = async () => {
    if (!artistInput.trim()) {
      setMessage('Digite o nome de um artista!');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/songs?artist=${encodeURIComponent(artistInput.trim())}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar músicas');
      }

      const song: Song = await response.json();
      
      setGameState({
        currentSong: song,
        attempts: [],
        gameStatus: 'playing',
        maxAttempts: 6
      });
      
      setCurrentGuess('');
      setMessage('');
      setShowHint(false);
      setGameStarted(true);
      setCurrentArtist(artistInput.trim());
      setUsedSongs(new Set([song.id])); // Adicionar a primeira música ao cache
    } catch (error) {
      console.error('Error starting new game:', error);
      setMessage(error instanceof Error ? error.message : 'Erro ao iniciar jogo');
    } finally {
      setIsLoading(false);
    }
  };

  const getNewSongFromSameArtist = async () => {
    if (!currentArtist) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Tentar até 5 vezes para encontrar uma música não usada
      let attempts = 0;
      let song: Song | null = null;
      
      while (attempts < 5) {
        const response = await fetch(`/api/songs?artist=${encodeURIComponent(currentArtist)}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar nova música');
        }

        const newSong: Song = await response.json();
        
        if (!usedSongs.has(newSong.id)) {
          song = newSong;
          break;
        }
        
        attempts++;
      }

      if (!song) {
        setMessage('Não foi possível encontrar uma nova música deste artista. Todas podem ter sido usadas.');
        return;
      }

      setGameState({
        currentSong: song,
        attempts: [],
        gameStatus: 'playing',
        maxAttempts: 6
      });
      
      setCurrentGuess('');
      setMessage('');
      setShowHint(false);
      setUsedSongs(prev => new Set([...prev, song!.id])); // Adicionar nova música ao cache
    } catch (error) {
      console.error('Error getting new song:', error);
      setMessage(error instanceof Error ? error.message : 'Erro ao buscar nova música');
    } finally {
      setIsLoading(false);
    }
  };

  const startWithNewArtist = () => {
    setGameState(null);
    setGameStarted(false);
    setArtistInput('');
    setCurrentGuess('');
    setMessage('');
    setShowHint(false);
    setCurrentArtist('');
    setUsedSongs(new Set()); // Limpar cache ao trocar de artista
  };

  const handleGuessSubmit = () => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    const trimmedGuess = currentGuess.trim();
    
    if (!trimmedGuess) {
      setMessage('Digite o título da música!');
      return;
    }
    
    if (!isValidGuess(trimmedGuess)) {
      setMessage('Digite um título válido (3-60 caracteres, letras, números, espaços e símbolos comuns)!');
      return;
    }

    const normalizedGuess = normalizeArtistName(trimmedGuess);
    const normalizedTarget = normalizeArtistName(gameState.currentSong.title);
    
    const feedback = compareGuess(normalizedGuess, normalizedTarget);
    const newAttempt: Attempt = { guess: normalizedGuess, feedback };
    
    const newAttempts = [...gameState.attempts, newAttempt];
    const isCorrect = normalizedGuess === normalizedTarget;
    
    setGameState(prev => prev ? {
      ...prev,
      attempts: newAttempts,
      gameStatus: isCorrect ? 'won' : newAttempts.length >= gameState.maxAttempts ? 'lost' : 'playing'
    } : null);
    
    setCurrentGuess('');
    
    // Focar na primeira célula da próxima linha se o jogo continuar
    if (!isCorrect && newAttempts.length < gameState.maxAttempts) {
      setShouldFocusFirstCell(true);
      setTimeout(() => setShouldFocusFirstCell(false), 100);
    }
    
    if (isCorrect) {
      setMessage(`🎉 Parabéns! Você acertou "${gameState.currentSong.title}" em ${newAttempts.length} tentativa${newAttempts.length > 1 ? 's' : ''}!`);
    } else if (newAttempts.length >= gameState.maxAttempts) {
      setMessage(`😔 Que pena! A música era "${gameState.currentSong.title}"`);
    } else {
      setMessage(`Tentativa ${newAttempts.length}/${gameState.maxAttempts}. Continue tentando!`);
    }
  };

  const generateShareText = () => {
    if (!gameState) return '';
    
    const attemptCount = gameState.attempts.length;
    const maxAttempts = gameState.maxAttempts;
    const result = gameState.gameStatus === 'won' ? `${attemptCount}/${maxAttempts}` : 'X/6';
    
    let shareText = `🎵 Termo Musical - Modo Música ${result}\n`;
    shareText += `🎤 Artista: ${gameState.currentSong.artist}\n\n`;
    
    gameState.attempts.forEach(attempt => {
      const line = attempt.feedback.map(fb => {
        switch (fb.status) {
          case 'correct': return '🟩';
          case 'present': return '🟨';
          case 'absent': return '⬜';
          default: return '⬜';
        }
      }).join('');
      shareText += line + '\n';
    });
    
    return shareText;
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Termo Musical - Modo Música',
          text: shareText,
        });
      } catch {
        navigator.clipboard?.writeText(shareText);
        setMessage('Resultado copiado para a área de transferência!');
      }
    } else {
      navigator.clipboard?.writeText(shareText);
      setMessage('Resultado copiado para a área de transferência!');
    }
  };

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">🎵 Modo Música</h1>
          <p className="text-gray-600 dark:text-gray-400">Digite um artista e tente adivinhar a música!</p>
        </div>

        {/* Artist Input */}
        <form onSubmit={(e) => { e.preventDefault(); startNewGame(); }} className="space-y-4">
          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Artista:
            </label>
            <input
              id="artist"
              type="text"
              value={artistInput}
              onChange={(e) => setArtistInput(e.target.value)}
              placeholder="Ex: Taylor Swift, BTS, Adele..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Buscando músicas...' : 'Iniciar Jogo'}
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
        >
          Voltar ao Menu
        </button>

        {/* Message */}
        {message && (
          <div className="text-center p-3 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700">
            {message}
          </div>
        )}
      </div>
    );
  }

  if (!gameState) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Layout principal com dicas à esquerda */}
      <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Painel de Dicas - À esquerda no desktop, acima no mobile */}
        <div className="lg:col-span-1 order-1">
          <div className="lg:sticky lg:top-4 space-y-3 lg:space-y-4">
            
            {/* Informações da Música */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎵</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Artista: {gameState.currentSong.artist}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Adivinhe o título da música!
                </p>
              </div>
            </div>

            {/* Botão de Dicas */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {showHint ? 'Ocultar Dicas 🔼' : 'Mostrar Dicas 🔽'}
            </button>

            {/* Área de Dicas */}
            {showHint && (
              <div className="space-y-3">
                {/* Dicas em texto */}
                {gameState.currentSong.hints && gameState.currentSong.hints.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                      💡 Dicas:
                    </p>
                    {gameState.currentSong.hints.map((hint, index) => (
                      <p key={index} className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                        • {hint}
                      </p>
                    ))}
                  </div>
                )}
                
                {/* Capa do álbum como dica (apenas após 3+ erros) */}
                {gameState.attempts.length >= 3 && gameState.currentSong.albumCover && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2 font-medium">
                      🎨 Capa do Álbum:
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setImageModalOpen(true)}
                        className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded"
                        title="Clique para ampliar a imagem"
                      >
                        <Image
                          src={gameState.currentSong.albumCover}
                          alt="Capa do álbum"
                          width={100}
                          height={100}
                          className="rounded object-cover cursor-pointer"
                          unoptimized
                        />
                      </button>
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center mt-1">
                      Clique na imagem para ampliar
                    </p>
                  </div>
                )}
                
                {/* Mensagem quando ainda não tem 3 erros */}
                {gameState.attempts.length < 3 && gameState.currentSong.albumCover && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🔒 Capa do álbum será liberada após 3 tentativas incorretas
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Área Principal do Jogo - À direita no desktop, abaixo no mobile */}
        <div className="lg:col-span-3 order-2">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">🎵 Modo Música</h1>
            <p className="text-gray-600 dark:text-gray-400">Adivinhe a música de {gameState.currentSong.artist}!</p>
          </div>

          {/* Game Board */}
          <GameBoard
            attempts={gameState.attempts}
            maxAttempts={gameState.maxAttempts}
            currentGuess={currentGuess}
            targetLength={gameState.currentSong.title.length}
            onGuessChange={setCurrentGuess}
            onGuessSubmit={handleGuessSubmit}
            isGameActive={gameState.gameStatus === 'playing'}
            focusOnFirstCell={shouldFocusFirstCell}
          />

          {/* Submit Button - Show only if game is active, has content and user prefers button over Enter */}
          {gameState.gameStatus === 'playing' && currentGuess.trim() && (
            <div className="text-center mb-6">
              <button
                onClick={handleGuessSubmit}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Enviar Tentativa
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Ou pressione Enter para enviar
              </p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`text-center p-3 rounded mb-6 ${
              gameState.gameStatus === 'won' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' 
                : gameState.gameStatus === 'lost'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
            }`}>
              {message}
            </div>
          )}

          {/* Game Over Actions */}
          {gameState.gameStatus !== 'playing' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={getNewSongFromSameArtist}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isLoading ? 'Carregando...' : 'Nova Música'}</span>
                </button>
                
                <button
                  onClick={startWithNewArtist}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Novo Artista</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Imagem */}
      {gameState.currentSong.albumCover && (
        <ImageModal
          src={gameState.currentSong.albumCover}
          alt={`Capa do álbum - ${gameState.currentSong.title} de ${gameState.currentSong.artist}`}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
        />
      )}
    </div>
  );
}
