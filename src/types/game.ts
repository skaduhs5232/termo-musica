export interface Artist {
  id: string;
  name: string;
  audioPreview?: string;
  hints?: string[];
  photo?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumCover?: string;
  hints?: string[];
}

export interface GameState {
  currentArtist: Artist;
  attempts: Attempt[];
  gameStatus: 'playing' | 'won' | 'lost';
  maxAttempts: number;
}

export interface SongGameState {
  currentSong: Song;
  attempts: Attempt[];
  gameStatus: 'playing' | 'won' | 'lost';
  maxAttempts: number;
}

export interface Attempt {
  guess: string;
  feedback: LetterFeedback[];
}

export interface LetterFeedback {
  letter: string;
  status: 'correct' | 'present' | 'absent';
}

export type GameMode = 'daily' | 'practice' | 'song-guess';
