
import React from 'react';
import { Volume2 } from 'lucide-react';
import { Voice } from '@/types/videoFlow';
import VoiceCard from './VoiceCard';

interface Props {
  voices: Voice[];
  selectedVoiceId: string | null;
  playingVoiceId: string | null;
  onSelectVoice: (voice: Voice) => void;
  onTogglePlay: (voiceId: string) => void;
}

const VoiceGrid: React.FC<Props> = ({ 
  voices, 
  selectedVoiceId, 
  playingVoiceId,
  onSelectVoice, 
  onTogglePlay 
}) => {
  if (voices.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Volume2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay voces disponibles</h3>
        <p className="text-muted-foreground">No se encontraron voces en tu cuenta de HeyGen.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 px-2">
      {voices.map((voice) => (
        <VoiceCard
          key={voice.voice_id}
          voice={voice}
          isSelected={selectedVoiceId === voice.voice_id}
          isPlaying={playingVoiceId === voice.voice_id}
          onSelect={onSelectVoice}
          onTogglePlay={onTogglePlay}
        />
      ))}
    </div>
  );
};

export default VoiceGrid;
