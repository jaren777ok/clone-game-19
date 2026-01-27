import React from 'react';
import { ArrowLeft, Clapperboard, Check, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoStyle } from '@/types/videoFlow';

interface Props {
  activeStyle: VideoStyle | null;
  onSelectStyle: (style: VideoStyle) => void;
  onBack: () => void;
}

const StyleLeftPanel: React.FC<Props> = ({ activeStyle, onSelectStyle, onBack }) => {
  return (
    <div className="w-[30%] min-w-[320px] max-w-[420px] border-r border-border/30 p-8 flex flex-col relative bg-card/20 backdrop-blur-sm">
      {/* Botón Volver */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="absolute top-4 left-4 hover:bg-primary/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 
        Cambiar avatar
      </Button>
      
      {/* Header del Paso */}
      <div className="flex flex-col items-center mt-20">
        {/* Icono con animación flotante */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mb-6 animate-float">
          <Clapperboard className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-center whitespace-nowrap">
          Elige el{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Estilo de Edición
          </span>
        </h1>
        <p className="text-muted-foreground text-center mt-3 text-sm px-4">
          Selecciona el estilo que mejor se adapte a tu visión para el video
        </p>
      </div>
      
      {/* Separador con gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />
      
      {/* Información Dinámica del Estilo Activo */}
      {activeStyle && (
        <div className="flex-1 space-y-6 animate-fade-in" key={activeStyle.id}>
          {/* Nombre del estilo */}
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Estilo Seleccionado</span>
            <h2 className="text-2xl font-bold mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {activeStyle.name}
            </h2>
            {activeStyle.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {activeStyle.description}
              </p>
            )}
          </div>
          
          {/* Requisitos */}
          {activeStyle.requirements && activeStyle.requirements.items.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                Requisitos
              </span>
              <div className="space-y-2">
                {activeStyle.requirements.items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20"
                  >
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              
              {/* Enlace de descarga */}
              {activeStyle.requirements.downloadUrl && (
                <a
                  href={activeStyle.requirements.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 hover:border-primary/50 transition-all duration-200 group"
                >
                  <Download className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-primary">
                    {activeStyle.requirements.downloadLabel || 'Descargar recursos'}
                  </span>
                </a>
              )}
            </div>
          )}
          
          {/* Botón Elegir */}
          <div className="pt-4">
            <Button
              onClick={() => onSelectStyle(activeStyle)}
              className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 cyber-glow text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              <Check className="w-5 h-5 mr-2" />
              Elegir {activeStyle.name}
            </Button>
          </div>
        </div>
      )}

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default StyleLeftPanel;
