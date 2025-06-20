
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Play, Pause, Volume2, Mic } from 'lucide-react';
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
      className={`group relative cyber-border hover:cyber-glow transition-all duration-300 cursor-pointer transform hover:scale-[1.02] min-h-[200px] ${
        isSelected ? 'cyber-glow-intense ring-2 ring-primary/50' : ''
      }`}
      onClick={() => onSelect(voice)}
    >
      <CardContent className="p-6 h-full flex flex-col justify-between">
        {/* Header with selection indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full transition-colors ${
              isSelected ? 'bg-primary/20' : 'bg-muted/50'
            }`}>
              <Mic className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            {isSelected && (
              <CheckCircle2 className="w-5 h-5 text-primary animate-scale-in" />
            )}
          </div>
          
          {/* Play button - more prominent */}
          {voice.preview_audio_url && (
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={handleTogglePlay}
                className={`w-12 h-12 rounded-full cyber-border hover:cyber-glow transition-all duration-200 ${
                  isPlaying ? 'bg-primary/10 border-primary/30' : ''
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              {isPlaying && (
                <div className="absolute inset-0 rounded-full animate-ping bg-primary/20"></div>
              )}
            </div>
          )}
        </div>

        {/* Voice name - more prominent */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <h3 className={`font-semibold text-center text-lg leading-tight transition-colors ${
            isSelected ? 'text-primary' : 'text-foreground'
          }`}>
            {voice.voice_name}
          </h3>
        </div>

        {/* Action button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(voice);
          }}
          className={`w-full transition-all duration-200 ${
            isSelected 
              ? 'bg-primary hover:bg-primary/90 cyber-glow text-primary-foreground' 
              : 'cyber-border hover:cyber-glow'
          }`}
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

        {/* Background gradient overlay */}
        <div className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300 ${
          isSelected 
            ? 'bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-100' 
            : 'bg-gradient-to-br from-muted/20 via-transparent to-muted/5 opacity-0 group-hover:opacity-100'
        }`}></div>

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
