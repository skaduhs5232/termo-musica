"use client";

import { useState, useEffect, useRef } from "react";
import { Attempt } from "@/types/game";
import { formatGuessForDisplay } from "@/lib/game-logic";

interface GameBoardProps {
  attempts: Attempt[];
  maxAttempts: number;
  currentGuess: string;
  targetLength: number;
  onGuessChange?: (guess: string) => void;
  onGuessSubmit?: () => void;
  isGameActive?: boolean;
}

export default function GameBoard({ attempts, maxAttempts, currentGuess, targetLength, onGuessChange, onGuessSubmit, isGameActive = true }: GameBoardProps) {
  const [internalGuess, setInternalGuess] = useState(currentGuess);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const cellRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sincronizar apenas em caso de reset/novo jogo
  useEffect(() => {
    // Detectar reset quando currentGuess está vazio
    if (currentGuess === '') {
      setInternalGuess('');
      
      // Limpar todos os inputs
      for (let i = 0; i < targetLength; i++) {
        if (cellRefs.current[i]) {
          cellRefs.current[i]!.value = '';
        }
      }
    }
  }, [currentGuess, targetLength]);

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
      setInternalGuess(finalGuess);

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
      setInternalGuess(finalGuess);

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
      setInternalGuess(finalGuess);

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
      setInternalGuess(finalGuess);

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

  const renderAttemptRow = (attempt: Attempt, attemptIndex: number) => {
    const isCurrentRow = attemptIndex === attempts.length && isGameActive;
    const displayGuess = isCurrentRow ? formatGuessForDisplay(internalGuess) : attempt.guess;

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

      if (isCurrentRow) {
        // Célula editável da linha atual
        cells.push(
          <input
            key={`${attemptIndex}-${i}`}
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
      } else {
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
      <div key={attemptIndex} className="mb-4" aria-label={`Tentativa ${attemptIndex + 1}`}>
        {rows}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center py-4 overflow-x-auto" role="grid" aria-label="Grade do jogo">
      <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 text-center">
        <p className="text-gray-900 dark:text-gray-100 font-medium">{targetLength > 25 ? "Adivinhe o título!" : "Adivinhe o nome do artista!"}</p>
        {isGameActive && attempts.length < maxAttempts && (
          <div className="text-xs mt-1 space-y-1">
            <p className="text-blue-600 dark:text-blue-400">💡 Clique em qualquer caixa para digitar nela</p>
            <p className="text-green-600 dark:text-green-400">⏎ Pressione Enter para enviar sua tentativa</p>
            <p className="text-purple-600 dark:text-purple-400">📋 Cole texto para preencher várias células</p>
          </div>
        )}
        <div className="flex justify-center items-center mt-2 gap-4 text-xs">
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-green-500 rounded mr-1"></span>
            Posição correta
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-yellow-500 rounded mr-1"></span>
            Letra existe
          </div>
          <div className="flex items-center">
            <span className="inline-block w-4 h-4 bg-gray-500 rounded mr-1"></span>
            Não existe
          </div>
        </div>
        {targetLength > 25 && <p className="text-xs mt-2 text-orange-600 dark:text-orange-400">📏 Título longo - células adaptadas para melhor visualização</p>}
      </div>

      <div className={`${targetLength > 35 ? "max-w-full" : targetLength > 20 ? "max-w-4xl" : "max-w-2xl"} w-full px-4`}>{allAttempts.map((attempt, index) => renderAttemptRow(attempt, index))}</div>
    </div>
  );
}
