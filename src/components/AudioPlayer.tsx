'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  duration?: number; // duração em segundos
  className?: string;
}

export default function AudioPlayer({ src, duration = 2, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Erro ao carregar áudio');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src]);

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else {
        audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
        
        // Parar automaticamente após a duração especificada
        timeoutRef.current = setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
          setCurrentTime(0);
        }, duration * 1000);
      }
    } catch {
      setError('Erro ao reproduzir áudio');
      setIsPlaying(false);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-4 p-4 bg-gray-100 rounded-lg ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button
        onClick={handlePlay}
        disabled={isLoading || !!error}
        className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full transition-colors"
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : error ? (
          <Volume2 className="w-5 h-5" />
        ) : isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Prévia do Artista</span>
          <span>{duration}s</span>
        </div>
        
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
