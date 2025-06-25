'use client';

import { useState, useEffect } from 'react';
import { Artist, GameState, Attempt } from '@/types/game';
import { compareGuess, isValidGuess, normalizeArtistName } from '@/lib/game-logic';
import { Share2, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import GameBoard from './GameBoard2';

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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">🎵 Termo Musical</h1>
        <p className="text-gray-600 dark:text-gray-400">Adivinhe o artista em 6 tentativas!</p>
      </div>

      {/* Informações do Artista */}
      <div className="text-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="text-2xl mb-2">🎵</div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          Adivinhe o artista musical!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Use as dicas abaixo para ajudar
        </p>
      </div>

      {/* Hint Button */}
      <div className="text-center">
        <button
          onClick={() => setShowHint(!showHint)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded transition-colors text-sm"
        >
          {showHint ? 'Ocultar Dica' : 'Mostrar Dica'}
        </button>
        {showHint && (
          <div className="mt-2 space-y-3">
            {/* Dicas em texto */}
            {artist.hints && artist.hints.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                {artist.hints.map((hint, index) => (
                  <p key={index} className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                    💡 {hint}
                  </p>
                ))}
              </div>
            )}
            
            {/* Foto como dica (apenas após 3+ erros) */}
            {gameState.attempts.length >= 3 && artist.photo && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  📸 Dica Visual (liberada após 3 tentativas):
                </p>
                <div className="flex justify-center">
                  <Image
                    src={artist.photo}
                    alt="Foto do artista"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
            
            {/* Mensagem quando ainda não tem 3 erros */}
            {gameState.attempts.length < 3 && artist.photo && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🔒 Dica visual será liberada após 3 tentativas incorretas
                </p>
              </div>
            )}
          </div>
        )}
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
      />

      {/* Submit Button - Show only if game is active, has content and user prefers button over Enter */}
      {gameState.gameStatus === 'playing' && currentGuess.trim() && (
        <div className="text-center">
          <button
            onClick={handleGuessSubmit}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Enviar Tentativa
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Ou pressione Enter em qualquer caixa
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`text-center p-3 rounded ${
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
        <div className="flex space-x-3">
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
  );
}
