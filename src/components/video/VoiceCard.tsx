
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Play, Pause } from 'lucide-react';
import { Voice } from '@/types/videoFlow';

interface Props {
  voice: Voice;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (voice: Voice) => void;
  onTogglePlay: (voiceId: string) => void;
}

const VoiceCard: React.FC<Props> = ({ 
  voice, 
  isSelected, 
  isPlaying, 
  onSelect, 
  onTogglePlay 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (voice.preview_audio_url) {
      onTogglePlay(voice.voice_id);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 group">
      {/* Circular Voice Player */}
      <div className="relative">
        {/* Main Circle */}
        <div className={`
          relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full 
          bg-gradient-to-br from-background via-muted/50 to-background
          border-2 transition-all duration-300 cursor-pointer
          hover:scale-105 hover:shadow-lg hover:shadow-primary/20
          ${isSelected 
            ? 'border-primary shadow-lg shadow-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background' 
            : 'border-border hover:border-primary/50'
          }
          ${isPlaying ? 'animate-pulse' : ''}
        `}>
          
          {/* Animated Sound Waves */}
          {isPlaying && (
            <>
              {/* Wave 1 - Inner */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" 
                   style={{ animationDuration: '0.8s' }} />
              
              {/* Wave 2 - Middle */}
              <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-ping" 
                   style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
              
              {/* Wave 3 - Outer */}
              <div className="absolute -inset-4 rounded-full border-2 border-primary/10 animate-ping" 
                   style={{ animationDuration: '1.6s', animationDelay: '0.4s' }} />
            </>
          )}

          {/* Play/Pause Button */}
          {voice.preview_audio_url && (
            <button
              onClick={handleTogglePlay}
              className={`
                absolute inset-0 w-full h-full rounded-full
                flex items-center justify-center
                transition-all duration-200
                hover:bg-primary/10 active:scale-95
                ${isPlaying 
                  ? 'bg-primary/5 text-primary' 
                  : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary'
                }
              `}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 sm:w-9 sm:h-9" />
              ) : (
                <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1" />
              )}
            </button>
          )}

          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Voice Name */}
      <div className="text-center max-w-[160px]">
        <h3 className={`
          font-semibold text-sm sm:text-base leading-tight transition-colors
          ${isSelected ? 'text-primary' : 'text-foreground'}
        `}>
          {voice.voice_name}
        </h3>
      </div>

      {/* Select Button */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(voice);
        }}
        className={`
          w-full max-w-[160px] transition-all duration-200
          ${isSelected 
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }
        `}
        size="sm"
        variant={isSelected ? "default" : "outline"}
      >
        {isSelected ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Seleccionada
          </span>
        ) : (
          "Elegir Voz"
        )}
      </Button>

      {/* Hidden audio element */}
      {voice.preview_audio_url && (
        <audio
          ref={audioRef}
          src={voice.preview_audio_url}
          onEnded={() => onTogglePlay(voice.voice_id)}
          preload="metadata"
        />
      )}
    </div>
  );
};

export default VoiceCard;
