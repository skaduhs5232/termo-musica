import { LetterFeedback } from '@/types/game';

export const compareGuess = (guess: string, target: string): LetterFeedback[] => {
  const normalizedGuess = guess.toUpperCase().trim();
  const normalizedTarget = target.toUpperCase().trim();
  
  const feedback: LetterFeedback[] = [];
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');
  
  // Garantir que o feedback tenha o mesmo tamanho que o target
  const maxLength = targetLetters.length;
  
  // Primeiro, marcar as letras corretas na posição correta
  const targetUsed = new Array(targetLetters.length).fill(false);
  const guessUsed = new Array(guessLetters.length).fill(false);
  
  // Inicializar feedback com tamanho correto
  for (let i = 0; i < maxLength; i++) {
    feedback[i] = { letter: '', status: 'absent' };
  }
  
  // Marcar letras corretas na posição correta
  for (let i = 0; i < maxLength; i++) {
    const guessLetter = i < guessLetters.length ? guessLetters[i] : '';
    const targetLetter = targetLetters[i];
    
    feedback[i].letter = guessLetter;
    
    if (guessLetter === targetLetter) {
      feedback[i].status = 'correct';
      if (i < targetUsed.length) targetUsed[i] = true;
      if (i < guessUsed.length) guessUsed[i] = true;
    }
  }
  
  // Marcar letras presentes mas na posição errada
  for (let i = 0; i < maxLength; i++) {
    if (feedback[i].status === 'correct') continue;
    if (i >= guessLetters.length) continue;
    
    const letter = guessLetters[i];
    let found = false;
    
    for (let j = 0; j < targetLetters.length; j++) {
      if (!targetUsed[j] && targetLetters[j] === letter) {
        feedback[i].status = 'present';
        targetUsed[j] = true;
        found = true;
        break;
      }
    }
    
    if (!found) {
      feedback[i].status = 'absent';
    }
  }
  
  return feedback;
};

export const isValidGuess = (guess: string): boolean => {
  const normalizedGuess = guess.toUpperCase().trim();
  // Remover espaços vazios do final para permitir palavras incompletas
  const cleanGuess = normalizedGuess.replace(/\s+$/, '');
  return cleanGuess.length >= 1 && cleanGuess.length <= 60 && /^[A-Z\s&'(),-]+$/.test(normalizedGuess);
};

export const normalizeArtistName = (name: string): string => {
  return name.toUpperCase().trim();
};

export const formatGuessForDisplay = (guess: string): string => {
  return guess.toUpperCase().trim();
};
