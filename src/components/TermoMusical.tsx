'use client';

import { useState, useEffect } from 'react';
import { Artist, GameState, Attempt } from '@/types/game';
import { compareGuess, isValidGuess, normalizeArtistName } from '@/lib/game-logic';
import { Share2, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import GameBoard from './GameBoard';
import ImageModal from './ImageModal';
import AudioPlayer from './AudioPlayer';

interface TermoMusicalProps {
  artist: Artist;
  gameMode: 'daily' | 'practice';
  onGameEnd?: (won: boolean, attempts: number) => void;
  onNewGame?: () => void;
}

export default function TermoMusical({ artist, gameMode, onGameEnd, onNewGame }: TermoMusicalProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentArtist: artist,
    attempts: [],
    gameStatus: 'playing',
    maxAttempts: 6
  });
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [shouldFocusFirstCell, setShouldFocusFirstCell] = useState(false);

  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      currentArtist: artist,
      attempts: [],
      gameStatus: 'playing'
    }));
    setCurrentGuess('');
    setMessage('');
    setShowHint(false);
  }, [artist]);

  const handleGuessSubmit = () => {
    if (gameState.gameStatus !== 'playing') return;
    
    const trimmedGuess = currentGuess.trim();
    
    if (!trimmedGuess) {
      setMessage('Digite um nome de artista!');
      return;
    }
    
    if (!isValidGuess(trimmedGuess)) {
      setMessage('Nome inválido! Use apenas letras, números, espaços e símbolos comuns (3-60 caracteres).');
      return;
    }

    const normalizedGuess = normalizeArtistName(trimmedGuess);
    const normalizedTarget = normalizeArtistName(artist.name);
    
    const feedback = compareGuess(normalizedGuess, normalizedTarget);
    const newAttempt: Attempt = {
      guess: trimmedGuess.toUpperCase(),
      feedback
    };

    const newAttempts = [...gameState.attempts, newAttempt];
    const isWin = normalizedGuess === normalizedTarget;
    const isGameOver = isWin || newAttempts.length >= gameState.maxAttempts;
    
    let newGameStatus: 'playing' | 'won' | 'lost' = 'playing';
    if (isWin) {
      newGameStatus = 'won';
      setMessage(`🎉 Parabéns! Você acertou "${artist.name}" em ${newAttempts.length} tentativa${newAttempts.length > 1 ? 's' : ''}!`);
    } else if (isGameOver) {
      newGameStatus = 'lost';
      setMessage(`😞 Que pena! O artista era "${artist.name}". Tente novamente!`);
    } else {
      setMessage(`Tentativa ${newAttempts.length}/${gameState.maxAttempts}`);
    }

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      gameStatus: newGameStatus
    }));
    
    setCurrentGuess('');
    
    // Se o jogo continua, focar na primeira célula da próxima tentativa
    if (newGameStatus === 'playing') {
      setShouldFocusFirstCell(true);
      // Reset o flag após um pequeno delay
      setTimeout(() => setShouldFocusFirstCell(false), 200);
    }
    
    if (isGameOver && onGameEnd) {
      onGameEnd(isWin, newAttempts.length);
    }
  };

  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame();
    } else {
      // Fallback para modo interno
      setGameState(prev => ({
        ...prev,
        attempts: [],
        gameStatus: 'playing'
      }));
      setCurrentGuess('');
      setMessage('');
      setShowHint(false);
    }
  };

  const generateShareText = () => {
    const attemptCount = gameState.attempts.length;
    const maxAttempts = gameState.maxAttempts;
    const result = gameState.gameStatus === 'won' ? `${attemptCount}/${maxAttempts}` : 'X/6';
    
    let shareText = `🎵 Termo Musical ${result}\n\n`;
    
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
          title: 'Termo Musical',
          text: shareText,
        });
      } catch {
        // Fallback para clipboard
        navigator.clipboard?.writeText(shareText);
        setMessage('Resultado copiado para a área de transferência!');
      }
    } else {
      // Fallback para clipboard
      navigator.clipboard?.writeText(shareText);
      setMessage('Resultado copiado para a área de transferência!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Layout principal com dicas à esquerda */}
      <div className="grid lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Painel de Dicas - À esquerda no desktop, acima no mobile */}
        <div className="lg:col-span-1 order-1">
          <div className="lg:sticky lg:top-4 space-y-3 lg:space-y-4">
            
            {/* Informações do Artista */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎵</div>
                <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Adivinhe o artista musical!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use as dicas abaixo para ajudar
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
                {/* Preview de Áudio */}
                {artist.audioPreview && (
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2 font-medium">
                      🎧 Preview de Áudio:
                    </p>
                    <AudioPlayer src={artist.audioPreview} duration={2} />
                  </div>
                )}

                {/* Dicas em texto */}
                {artist.hints && artist.hints.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
                      💡 Dicas:
                    </p>
                    {artist.hints.map((hint, index) => (
                      <p key={index} className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                        • {hint}
                      </p>
                    ))}
                  </div>
                )}

                {/* Foto como dica (apenas após 3+ erros) */}
                {gameState.attempts.length >= 3 && artist.photo && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2 font-medium">
                      📸 Dica Visual:
                    </p>
                    <div className="flex justify-center">
                      <button
                        onClick={() => setImageModalOpen(true)}
                        className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full"
                        title="Clique para ampliar a imagem"
                      >
                        <Image
                          src={artist.photo}
                          alt="Foto do artista"
                          width={80}
                          height={80}
                          className="rounded-full object-cover cursor-pointer"
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
                {gameState.attempts.length < 3 && artist.photo && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🔒 Dica visual será liberada após 3 tentativas incorretas
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">🎵 Termo Musical</h1>
            <p className="text-gray-600 dark:text-gray-400">Adivinhe o artista em 6 tentativas!</p>
          </div>

          {/* Game Board */}
          <GameBoard
            attempts={gameState.attempts}
            maxAttempts={gameState.maxAttempts}
            currentGuess={currentGuess}
            targetLength={artist.name.length}
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
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>

              {gameMode === 'practice' && (
                <button
                  onClick={handleNewGame}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Novo Artista</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Imagem */}
      {artist.photo && (
        <ImageModal
          src={artist.photo}
          alt={`Foto do artista ${artist.name}`}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
        />
      )}
    </div>
  );
}
