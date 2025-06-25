"use client";

import { useState, useEffect, useRef } from "react";
import { Attempt } from "@/types/game";

interface GameBoardProps {
  attempts: Attempt[];
  maxAttempts: number;
  currentGuess: string;
  targetLength: number;
  onGuessChange?: (guess: string) => void;
  onGuessSubmit?: () => void;
  isGameActive?: boolean;
  hints?: string[];
  artistName?: string;
}

export default function GameBoard({ 
  attempts, 
  maxAttempts, 
  currentGuess, 
  targetLength, 
  onGuessChange, 
  onGuessSubmit, 
  isGameActive = true,
  hints = [],
  artistName
}: GameBoardProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincronizar apenas em caso de reset/novo jogo
  useEffect(() => {
    // Detectar reset quando currentGuess está vazio
    if (currentGuess === '') {
      // Limpar todos os inputs
      for (let i = 0; i < targetLength; i++) {
        if (cellRefs.current[i]) {
          cellRefs.current[i]!.value = '';
        }
      }
    }
  }, [currentGuess, targetLength]);

  // Foco automático na primeira célula quando uma nova tentativa começa
  useEffect(() => {
    if (isGameActive && attempts.length >= 0 && cellRefs.current[0]) {
      // Aguardar um pouco para garantir que o DOM foi atualizado
      setTimeout(() => {
        cellRefs.current[0]?.focus();
      }, 100);
    }
  }, [attempts.length, isGameActive]);

  // Criar array de tentativas preenchido com vazios
  const allAttempts = [...attempts];
  while (allAttempts.length < maxAttempts) {
    allAttempts.push({ guess: "", feedback: [] });
  }

  const getLetterStyle = (status: "correct" | "present" | "absent") => {
    switch (status) {
      case "correct":
        return "bg-green-500 text-white border-green-500";
      case "present":
        return "bg-yellow-500 text-white border-yellow-500";
      case "absent":
        return "bg-gray-500 text-white border-gray-500";
      default:
        return "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100";
    }
  };

  const handleCellInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    if (!isGameActive) return;

    const input = e.target as HTMLInputElement;
    let value = input.value;

    // Permitir apenas letras, números, espaços e alguns símbolos comuns
    const cleanValue = value.replace(/[^a-zA-Z0-9\s\-'&.,]/g, "").toUpperCase();

    // Se o usuário digitou mais de um caractere, pegar apenas o último
    if (cleanValue.length > 1) {
      value = cleanValue.slice(-1);
    } else {
      value = cleanValue;
    }

    // Atualizar apenas se o valor mudou para evitar duplicação
    if (input.value !== value) {
      input.value = value;
    }

    // Construir o novo guess baseado nos valores atuais de TODOS os inputs
    // Usar setTimeout para garantir que todos os inputs tenham seus valores atualizados
    setTimeout(() => {
      const newGuessArray = [];
      for (let i = 0; i < targetLength; i++) {
        if (cellRefs.current[i]) {
          newGuessArray[i] = cellRefs.current[i]!.value || '';
        } else {
          newGuessArray[i] = '';
        }
      }

      const finalGuess = newGuessArray.join('');

      // Notificar o componente pai sobre a mudança
      if (onGuessChange) {
        onGuessChange(finalGuess);
      }
    }, 0);

    // Mover para próxima célula se digitou uma letra e não é a última célula
    if (value && index < targetLength - 1) {
      setTimeout(() => {
        cellRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleCellPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isGameActive) return;

    e.preventDefault();
    const pastedText = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9\s\-'&.,]/g, "")
      .toUpperCase();

    if (!pastedText) return;

    // Preencher os inputs diretamente a partir da posição atual
    for (let i = 0; i < pastedText.length && index + i < targetLength; i++) {
      if (cellRefs.current[index + i]) {
        cellRefs.current[index + i]!.value = pastedText[i];
      }
    }

    // Reconstruir o guess baseado nos valores atuais dos inputs após o paste
    setTimeout(() => {
      const newGuessArray = [];
      for (let i = 0; i < targetLength; i++) {
        if (cellRefs.current[i]) {
          newGuessArray[i] = cellRefs.current[i]!.value || '';
        } else {
          newGuessArray[i] = '';
        }
      }

      const finalGuess = newGuessArray.join('');

      if (onGuessChange) {
        onGuessChange(finalGuess);
      }
    }, 0);

    // Focar na próxima célula disponível após o texto colado
    const nextIndex = Math.min(index + pastedText.length, targetLength - 1);
    setTimeout(() => {
      cellRefs.current[nextIndex]?.focus();
    }, 10);
  };

  const handleCellKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (!isGameActive) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (onGuessSubmit) {
        onGuessSubmit();
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      
      const currentInput = cellRefs.current[index];
      if (currentInput && currentInput.value) {
        // Se a célula atual tem conteúdo, apagar
        currentInput.value = '';
      } else if (index > 0) {
        // Se a célula atual está vazia, mover para anterior e apagar
        const prevInput = cellRefs.current[index - 1];
        if (prevInput) {
          prevInput.value = '';
          prevInput.focus();
        }
      }
      
      // Reconstruir o guess baseado nos valores atuais dos inputs
      const newGuessArray = [];
      for (let i = 0; i < targetLength; i++) {
        if (cellRefs.current[i]) {
          newGuessArray[i] = cellRefs.current[i]!.value || '';
        } else {
          newGuessArray[i] = '';
        }
      }

      const finalGuess = newGuessArray.join('');

      if (onGuessChange) {
        onGuessChange(finalGuess);
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      
      const currentInput = cellRefs.current[index];
      if (currentInput) {
        currentInput.value = '';
      }

      // Reconstruir o guess baseado nos valores atuais dos inputs
      const newGuessArray = [];
      for (let i = 0; i < targetLength; i++) {
        if (cellRefs.current[i]) {
          newGuessArray[i] = cellRefs.current[i]!.value || '';
        } else {
          newGuessArray[i] = '';
        }
      }

      const finalGuess = newGuessArray.join('');

      if (onGuessChange) {
        onGuessChange(finalGuess);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      cellRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < targetLength - 1) {
      e.preventDefault();
      cellRefs.current[index + 1]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      cellRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      cellRefs.current[targetLength - 1]?.focus();
    }
  };

  const handleCellClick = (index: number) => {
    if (!isGameActive) return;
    cellRefs.current[index]?.focus();
  };

  const renderCompletedAttemptRow = (attempt: Attempt, attemptIndex: number) => {
    const displayGuess = attempt.guess;

    // Calcular tamanho das células baseado no comprimento do título
    const isLongTitle = targetLength > 20;
    const isVeryLongTitle = targetLength > 35;

    // Definir quantas células por linha
    const cellsPerRow = isVeryLongTitle ? 12 : isLongTitle ? 15 : Math.min(targetLength, 12);
    const cellSize = isVeryLongTitle ? "w-10 h-10 text-sm" : isLongTitle ? "w-12 h-12 text-base" : "w-14 h-14 text-lg";

    // Criar células para a linha
    const cells = [];
    const rows = [];

    for (let i = 0; i < targetLength; i++) {
      const letter = displayGuess[i] || "";
      const feedback = attempt.feedback[i];

      let cellStyle = `${cellSize} border-2 flex items-center justify-center font-bold uppercase rounded transition-colors`;

      // Célula de tentativa anterior (apenas exibição)
      if (feedback) {
        cellStyle += ` ${getLetterStyle(feedback.status)}`;
      } else if (!letter) {
        cellStyle += " bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100";
      } else {
        cellStyle += " border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100";
      }

      cells.push(
        <div key={`${attemptIndex}-${i}`} className={cellStyle} role="gridcell" aria-label={letter ? `Letra ${letter}` : "Célula vazia"}>
          {letter}
        </div>
      );
    }

    // Quebrar em múltiplas linhas se necessário
    for (let i = 0; i < cells.length; i += cellsPerRow) {
      const rowCells = cells.slice(i, i + cellsPerRow);
      rows.push(
        <div key={`${attemptIndex}-row-${Math.floor(i / cellsPerRow)}`} className={`flex justify-center ${isLongTitle ? "gap-1" : "gap-2"} mb-2`} role="row">
          {rowCells}
        </div>
      );
    }

    return (
      <div key={attemptIndex} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border" aria-label={`Tentativa ${attemptIndex + 1}`}>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          Tentativa {attemptIndex + 1}
        </div>
        {rows}
      </div>
    );
  };

  const renderCurrentAttemptRow = () => {
    // Calcular tamanho das células baseado no comprimento do título
    const isLongTitle = targetLength > 20;
    const isVeryLongTitle = targetLength > 35;

    // Definir quantas células por linha
    const cellsPerRow = isVeryLongTitle ? 12 : isLongTitle ? 15 : Math.min(targetLength, 12);
    const cellSize = isVeryLongTitle ? "w-10 h-10 text-sm" : isLongTitle ? "w-12 h-12 text-base" : "w-14 h-14 text-lg";

    // Criar células para a linha
    const cells = [];
    const rows = [];

    for (let i = 0; i < targetLength; i++) {
      const cellStyle = `${cellSize} border-2 flex items-center justify-center font-bold uppercase rounded transition-colors`;

      // Célula editável da linha atual
      cells.push(
        <input
          key={`current-${i}`}
          ref={(el) => {
            cellRefs.current[i] = el;
          }}
          type="text"
          defaultValue=""
          onInput={(e) => handleCellInput(i, e)}
          onPaste={(e) => handleCellPaste(i, e)}
          onKeyDown={(e) => handleCellKeyDown(i, e)}
          onClick={() => handleCellClick(i)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          className={`${cellStyle} ${focusedIndex === i ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-800" : "border-blue-400 bg-blue-50 dark:bg-blue-900/20"} text-center text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer`}
          aria-label={`Posição ${i + 1}`}
          maxLength={1}
        />
      );
    }

    // Quebrar em múltiplas linhas se necessário
    for (let i = 0; i < cells.length; i += cellsPerRow) {
      const rowCells = cells.slice(i, i + cellsPerRow);
      rows.push(
        <div key={`current-row-${Math.floor(i / cellsPerRow)}`} className={`flex justify-center ${isLongTitle ? "gap-1" : "gap-2"} mb-2`} role="row">
          {rowCells}
        </div>
      );
    }

    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-600">
        <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 text-center">
          ✏️ Digite sua resposta
        </div>
        {rows}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full">
      {/* Layout Desktop */}
      <div className="hidden lg:flex gap-8 justify-center items-start max-w-7xl mx-auto px-4" role="grid" aria-label="Grade do jogo">
        {/* Dicas na lateral esquerda */}
        <div className="w-80 space-y-4 flex-shrink-0">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Dicas do Jogo</span>
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🎯 {targetLength > 25 ? "Adivinhe o título da música!" : "Adivinhe o nome do artista!"}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📝 {attempts.length + 1}ª tentativa de {maxAttempts}
              </p>
              {artistName && attempts.length >= 3 && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  🔢 {artistName.length} letras no total
                </p>
              )}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
              <span>🎨</span>
              <span>Legenda de Cores</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-green-700 dark:text-green-300">Posição correta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-green-700 dark:text-green-300">Letra existe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm text-green-700 dark:text-green-300">Não existe</span>
              </div>
            </div>
          </div>

          {hints.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
                <span>🎵</span>
                <span>Dicas Especiais</span>
              </h4>
              <div className="space-y-1">
                {hints.slice(0, 3).map((hint, index) => (
                  <p key={index} className="text-sm text-purple-700 dark:text-purple-300">
                    • {hint}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Area principal do jogo */}
        <div className="flex-1 max-w-4xl">
          <div className="text-center mb-6">
            <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
              {targetLength > 25 ? "Adivinhe o título!" : "Adivinhe o nome do artista!"}
            </p>
            {isGameActive && attempts.length < maxAttempts && (
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <p className="text-blue-600 dark:text-blue-400">💡 Clique em qualquer caixa para digitar</p>
                <p className="text-green-600 dark:text-green-400">⏎ Pressione Enter para enviar</p>
              </div>
            )}
          </div>

          {/* Tentativas anteriores (apenas as finalizadas) */}
          <div className="space-y-4 mb-6">
            {attempts.map((attempt, index) => renderCompletedAttemptRow(attempt, index))}
          </div>

          {/* Linha atual (apenas se o jogo estiver ativo) */}
          {isGameActive && attempts.length < maxAttempts && (
            <div className="mb-6">
              <div className="text-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tentativa {attempts.length + 1}/{maxAttempts}
                </span>
              </div>
              {renderCurrentAttemptRow()}
            </div>
          )}
        </div>
      </div>

      {/* Layout Mobile */}
      <div className="lg:hidden max-w-lg mx-auto px-4" role="grid" aria-label="Grade do jogo">
        <div className="text-center mb-6">
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
            {targetLength > 25 ? "Adivinhe o título!" : "Adivinhe o nome do artista!"}
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            📝 {attempts.length + 1}ª tentativa de {maxAttempts}
          </div>
          {isGameActive && attempts.length < maxAttempts && (
            <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <p className="text-blue-600 dark:text-blue-400">💡 Toque em qualquer caixa para digitar</p>
              <p className="text-green-600 dark:text-green-400">⏎ Pressione Enter para enviar</p>
            </div>
          )}
        </div>

        {/* Tentativas anteriores */}
        <div className="space-y-4 mb-6">
          {attempts.map((attempt, index) => renderCompletedAttemptRow(attempt, index))}
        </div>

        {/* Linha atual */}
        {isGameActive && attempts.length < maxAttempts && (
          <div className="mb-6">
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tentativa {attempts.length + 1}/{maxAttempts}
              </span>
            </div>
            {renderCurrentAttemptRow()}
          </div>
        )}

        {/* Dicas mobile */}
        {hints.length > 0 && (
          <div className="mt-6 bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2">
              <span>🎵</span>
              <span>Dicas Especiais</span>
            </h4>
            <div className="space-y-1">
              {hints.slice(0, 2).map((hint, index) => (
                <p key={index} className="text-sm text-purple-700 dark:text-purple-300">
                  • {hint}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Legenda mobile */}
        <div className="flex justify-center items-center gap-4 text-xs mt-6">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Correta</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Existe</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Não existe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
