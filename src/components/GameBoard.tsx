'use client';

import { Attempt } from '@/types/game';
import { formatGuessForDisplay } from '@/lib/game-logic';

interface GameBoardProps {
  attempts: Attempt[];
  maxAttempts: number;
  currentGuess: string;
  targetLength: number;
}

export default function GameBoard({ attempts, maxAttempts, currentGuess, targetLength }: GameBoardProps) {
  // Criar array de tentativas preenchido com vazios
  const allAttempts = [...attempts];
  while (allAttempts.length < maxAttempts) {
    allAttempts.push({ guess: '', feedback: [] });
  }

  const getLetterStyle = (status: 'correct' | 'present' | 'absent') => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white border-green-500';
      case 'present':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'absent':
        return 'bg-gray-500 text-white border-gray-500';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100';
    }
  };

  const renderAttemptRow = (attempt: Attempt, index: number) => {
    const isCurrentRow = index === attempts.length && currentGuess;
    const displayGuess = isCurrentRow ? formatGuessForDisplay(currentGuess) : attempt.guess;
    
    // Calcular tamanho das células baseado no comprimento do título
    const isLongTitle = targetLength > 25;
    const isVeryLongTitle = targetLength > 40;
    
    // Definir quantas células por linha
    const cellsPerRow = isVeryLongTitle ? 15 : isLongTitle ? 20 : Math.min(targetLength, 15);
    const cellSize = isVeryLongTitle ? 'w-8 h-8 text-sm' : isLongTitle ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg';
    
    // Criar células para a linha
    const cells = [];
    const rows = [];
    
    for (let i = 0; i < targetLength; i++) {
      const letter = displayGuess[i] || '';
      const feedback = attempt.feedback[i];
      
      let cellStyle = `${cellSize} border-2 flex items-center justify-center font-bold uppercase rounded transition-colors`;
      
      if (isCurrentRow) {
        cellStyle += ' border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100';
      } else if (feedback) {
        cellStyle += ` ${getLetterStyle(feedback.status)}`;
      } else if (!letter) {
        cellStyle += ' bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100';
      } else {
        cellStyle += ' border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100';
      }

      cells.push(
        <div
          key={`${index}-${i}`}
          className={cellStyle}
          role="gridcell"
          aria-label={letter ? `Letra ${letter}` : 'Célula vazia'}
        >
          {letter}
        </div>
      );
    }
    
    // Quebrar em múltiplas linhas se necessário
    for (let i = 0; i < cells.length; i += cellsPerRow) {
      const rowCells = cells.slice(i, i + cellsPerRow);
      rows.push(
        <div
          key={`${index}-row-${Math.floor(i / cellsPerRow)}`}
          className={`flex justify-center ${isLongTitle ? 'space-x-0.5' : 'space-x-1'} mb-1`}
          role="row"
        >
          {rowCells}
        </div>
      );
    }

    return (
      <div
        key={index}
        className="mb-3"
        aria-label={`Tentativa ${index + 1}`}
      >
        {rows}
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col items-center py-4 overflow-x-auto"
      role="grid"
      aria-label="Grade do jogo"
    >
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
        <p className="text-gray-900 dark:text-gray-100">
          {targetLength > 25 ? 'Adivinhe o título!' : 'Adivinhe o nome do artista!'}
        </p>
        <p className="text-xs mt-1">
          <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span>
          Letra correta na posição certa
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1 ml-3"></span>
          Letra existe, posição errada
          <span className="inline-block w-3 h-3 bg-gray-500 rounded mr-1 ml-3"></span>
          Letra não existe
        </p>
        {targetLength > 25 && (
          <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
            📏 Título longo detectado - células adaptadas automaticamente
          </p>
        )}
      </div>
      
      <div className={`${targetLength > 40 ? 'max-w-full' : targetLength > 25 ? 'max-w-2xl' : 'max-w-md'} w-full`}>
        {allAttempts.map((attempt, index) => renderAttemptRow(attempt, index))}
      </div>
    </div>
  );
}
