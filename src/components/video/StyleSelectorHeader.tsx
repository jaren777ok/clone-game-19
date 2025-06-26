
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const StyleSelectorHeader: React.FC<Props> = ({ onBack }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="cyber-border hover:cyber-glow text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cambiar avatar
        </Button>
      </div>

      <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-safe leading-normal py-3 px-4">
          Elige el Estilo de Edición
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4 leading-relaxed">
          Selecciona el estilo de edición que quieres que tenga tu video
        </p>
      </div>
    </>
  );
};

export default StyleSelectorHeader;
