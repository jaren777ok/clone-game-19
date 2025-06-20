
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Play, Pause, Volume2 } from 'lucide-react';
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
    <Card 
      className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-[1.02] ${
        isSelected ? 'cyber-glow-intense' : ''
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-primary" />
            {isSelected && (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            )}
          </div>
          {voice.preview_audio_url && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleTogglePlay}
              className="w-8 h-8 cyber-border hover:cyber-glow"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3 ml-0.5" />
              )}
            </Button>
          )}
        </div>

        <h3 className="font-semibold text-center mb-3 text-sm sm:text-base truncate">
          {voice.voice_name}
        </h3>

        <Button
          onClick={() => onSelect(voice)}
          className="w-full cyber-glow text-xs sm:text-sm"
          size="sm"
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Continuar" : "Elegir Voz"}
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
      </CardContent>
    </Card>
  );
};

export default VoiceCard;
