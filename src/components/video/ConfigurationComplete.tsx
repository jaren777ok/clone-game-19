import React from 'react';
import { CheckCircle, Key, User, Mic, Film, Type, Sparkles, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FlowState } from '@/types/videoFlow';

interface ConfigurationCompleteProps {
  flowState: FlowState;
  onContinue: () => void;
  onReview: () => void;
}

const ConfigurationComplete = ({ flowState, onContinue, onReview }: ConfigurationCompleteProps) => {
  const configItems = [
    {
      icon: Key,
      label: 'API Key',
      value: flowState.selectedApiKey?.api_key_name || 'No seleccionada'
    },
    {
      icon: User,
      label: 'Avatar',
      value: flowState.selectedAvatar?.avatar_name || 'No seleccionado'
    },
    {
      icon: Mic,
      label: 'Voz',
      value: flowState.selectedVoice?.voice_name || 'No seleccionada'
    },
    {
      icon: Film,
      label: 'Estilo',
      value: flowState.selectedStyle?.name || 'No seleccionado'
    },
    {
      icon: Type,
      label: 'Subtítulos',
      value: flowState.subtitleCustomization 
        ? `${flowState.subtitleCustomization.fontFamily}, ${flowState.subtitleCustomization.placementEffect}`
        : 'Configuración por defecto'
    }
  ];

  // Si es Multi-Avatar, añadir segundo avatar
  if (flowState.selectedStyle?.id === 'style-7' && flowState.selectedSecondAvatar) {
    configItems.splice(2, 0, {
      icon: User,
      label: 'Segundo Avatar',
      value: flowState.selectedSecondAvatar.avatar_name
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Animated check icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse cyber-glow">
            <CheckCircle className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Title and message */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 pb-1 leading-normal bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Configuración Completada
        </h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Tu configuración de video está lista. Una vez que continúes al generador, 
          <span className="text-primary font-medium"> no podrás modificar estas opciones</span>.
        </p>

        {/* Configuration summary */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Resumen de Configuración
            </h3>
            <div className="space-y-3">
              {configItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg cyber-glow"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Ir al Generador de Videos
        </Button>

        {/* Review button */}
        <Button
          onClick={onReview}
          variant="outline"
          size="lg"
          className="w-full mt-3 border-border/50 hover:bg-primary/10 hover:border-primary/50 font-semibold py-6 text-lg"
        >
          <Settings className="w-5 h-5 mr-2" />
          Revisar Configuración
        </Button>

        {/* Status indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-primary">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">Configuración Bloqueada</span>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ConfigurationComplete;
