
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { VideoStyle } from '@/types/videoFlow';

interface Props {
  previouslySelectedStyle: VideoStyle;
  onContinueWithPrevious: (style: VideoStyle) => void;
}

const PreviousStyleSelectionBanner: React.FC<Props> = ({
  previouslySelectedStyle,
  onContinueWithPrevious
}) => {
  return (
    <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">Selección anterior</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Tienes <strong>{previouslySelectedStyle.name}</strong> seleccionado previamente. 
          Puedes continuar con esta selección o elegir un estilo diferente.
        </p>
        <Button
          onClick={() => onContinueWithPrevious(previouslySelectedStyle)}
          className="cyber-glow text-sm"
          size="sm"
        >
          Continuar con {previouslySelectedStyle.name}
        </Button>
      </div>
    </div>
  );
};

export default PreviousStyleSelectionBanner;
