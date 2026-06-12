'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SpeakerHigh, SpeakerX, ArrowCounterClockwise, Microphone } from '@phosphor-icons/react';

interface AudioPlayerProps {
  src: string;
  duration?: number; // duração em segundos (opcional, calcula automaticamente)
  compact?: boolean;
  className?: string;
}

export function AudioPlayer({
  src,
  duration: initialDuration,
  compact = false,
  className = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // Manter ref sincronizada com estado
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Usar requestAnimationFrame para atualização mais suave do progresso
  useEffect(() => {
    const updateProgress = () => {
      const audio = audioRef.current;
      if (audio && isPlayingRef.current) {
        setCurrentTime(audio.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      // Só usa a duração do áudio se não foi passada via props
      if (!initialDuration && audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      // Backup para o requestAnimationFrame
      if (!animationFrameRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleDurationChange = () => {
      // Alguns formatos (como WebM) podem atualizar a duração após carregar
      if (!initialDuration && audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [initialDuration]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-2 bg-surface-hover rounded-lg ${className}`}>
        <audio ref={audioRef} src={src} preload="metadata" />

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-8 h-8 rounded-full bg-brand hover:bg-brand-dark disabled:bg-ink-faint flex items-center justify-center transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 bg-line-strong rounded-full cursor-pointer group"
          >
            <div
              className="h-full bg-brand rounded-full group-hover:bg-brand-dark"
              style={{ width: `${progressPercent}%`, transition: 'background-color 0.2s' }}
            />
          </div>
        </div>

        <span className="text-xs text-ink-soft tabular-nums whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-surface-hover border border-line rounded-xl p-4 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header com ícone */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center">
          <Microphone className="w-4 h-4 text-brand-dark" />
        </div>
        <span className="text-sm text-ink-soft">Gravação de áudio</span>
      </div>

      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="h-2 bg-line-strong rounded-full cursor-pointer group mb-3"
      >
        <div
          className="h-full bg-brand rounded-full relative group-hover:bg-brand-dark"
          style={{ width: `${progressPercent}%`, transition: 'background-color 0.2s' }}
        >
          {/* Indicador de posição */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-surface rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Tempo */}
      <div className="flex justify-between text-xs text-ink-faint mb-3">
        <span className="tabular-nums">{formatTime(currentTime)}</span>
        <span className="tabular-nums">{formatTime(duration)}</span>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={restart}
          className="w-10 h-10 rounded-full hover:bg-line flex items-center justify-center transition-colors"
          title="Reiniciar"
        >
          <ArrowCounterClockwise className="w-5 h-5 text-ink-soft" />
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-14 h-14 rounded-full bg-brand hover:bg-brand-dark disabled:bg-ink-faint flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full hover:bg-line flex items-center justify-center transition-colors"
          title={isMuted ? 'Ativar som' : 'Silenciar'}
        >
          {isMuted ? (
            <SpeakerX className="w-5 h-5 text-ink-soft" />
          ) : (
            <SpeakerHigh className="w-5 h-5 text-ink-soft" />
          )}
        </button>
      </div>
    </div>
  );
}
