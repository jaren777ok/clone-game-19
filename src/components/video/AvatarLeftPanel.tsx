import React from 'react';
import { ArrowLeft, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, HeyGenApiKey } from '@/types/videoFlow';

interface Props {
  activeAvatar: Avatar | null;
  selectedApiKey: HeyGenApiKey;
  totalAvatars: number;
  avatarsLoaded: number;
  onSelectAvatar: (avatar: Avatar) => void;
  onBack: () => void;
}

const AvatarLeftPanel: React.FC<Props> = ({ 
  activeAvatar, 
  selectedApiKey,
  totalAvatars,
  avatarsLoaded,
  onSelectAvatar, 
  onBack 
}) => {
  return (
    <div className="w-full lg:w-[30%] lg:min-w-[320px] lg:max-w-[420px] border-b lg:border-b-0 lg:border-r border-border/30 p-6 lg:p-8 flex flex-col relative bg-card/20 backdrop-blur-sm">
      {/* Botón Volver */}
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="absolute top-4 left-4 hover:bg-primary/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 
        Cambiar Estilo
      </Button>
      
      {/* Header del Paso */}
      <div className="flex flex-col items-center mt-16 lg:mt-20">
        {/* Icono con animación flotante */}
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mb-4 lg:mb-6 animate-float">
          <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
        </div>
        
        <h1 className="text-xl lg:text-2xl font-bold text-center whitespace-nowrap">
          Selecciona tu{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Avatar de IA
          </span>
        </h1>
        <p className="text-muted-foreground text-center mt-2 lg:mt-3 text-sm px-4">
          Elige el avatar que representará tu contenido
        </p>
        
        {/* Contador de avatares */}
        <div className="mt-3 text-xs text-muted-foreground">
          <span className="text-primary font-medium">{avatarsLoaded}</span> de {totalAvatars} avatares cargados
        </div>
        
        {/* API Key indicator */}
        <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-muted-foreground">
          {selectedApiKey.api_key_name}
        </div>
      </div>
      
      {/* Separador con gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-6 lg:my-8" />
      
      {/* Información Dinámica del Avatar Activo */}
      {activeAvatar && (
        <div className="flex-1 space-y-4 lg:space-y-6 animate-fade-in" key={activeAvatar.avatar_id}>
          {/* Preview del avatar */}
          <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden p-[3px] bg-gradient-to-br from-primary via-accent to-primary shadow-2xl shadow-primary/30">
            <div className="w-full h-full bg-background rounded-xl overflow-hidden">
              {activeAvatar.preview_video_url ? (
                <video
                  src={activeAvatar.preview_video_url}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={activeAvatar.preview_image_url}
                  alt={activeAvatar.avatar_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Nombre del avatar */}
          <div className="text-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Avatar Activo</span>
            <h2 className="text-xl lg:text-2xl font-bold mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {activeAvatar.avatar_name}
            </h2>
          </div>
          
          {/* Botón Elegir */}
          <div className="pt-2 lg:pt-4">
            <Button
              onClick={() => onSelectAvatar(activeAvatar)}
              className="w-full h-12 lg:h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 cyber-glow text-base lg:text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              <Check className="w-5 h-5 mr-2" />
              Elegir Avatar
            </Button>
          </div>
        </div>
      )}

      {/* Placeholder when no avatar is active */}
      {!activeAvatar && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-center text-sm">
            Navega por el carrusel para explorar los avatares disponibles
          </p>
        </div>
      )}

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none hidden lg:block" />
    </div>
  );
};

export default AvatarLeftPanel;
