
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Shield, Zap, Star, Cpu, Key } from 'lucide-react';
import { HeyGenApiKey } from '@/types/videoFlow';
import { useIsMobile } from '@/hooks/use-mobile';

const projectIcons = [Shield, Zap, Star, Cpu, Key];

interface Props {
  apiKey: HeyGenApiKey;
  index: number;
  onSelect: (apiKey: HeyGenApiKey) => void;
  onDelete: (keyId: string) => void;
}

const ApiKeyCard: React.FC<Props> = ({ apiKey, index, onSelect, onDelete }) => {
  const isMobile = useIsMobile();
  const IconComponent = projectIcons[index % projectIcons.length];

  return (
    <div 
      className="
        relative rounded-xl 
        bg-card/80 backdrop-blur-sm 
        border border-primary/30
        shadow-[0_0_30px_rgba(255,20,147,0.15)]
        hover:shadow-[0_0_40px_rgba(255,20,147,0.25)]
        hover:border-primary/50
        transition-all duration-300
        p-4 sm:p-5
      "
    >
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        {/* Left side: Icon and Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,20,147,0.3)]">
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
              {apiKey.api_key_name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Creada el {new Date(apiKey.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className={`flex ${isMobile ? 'justify-between' : 'items-center space-x-3'}`}>
          <Button
            onClick={() => onSelect(apiKey)}
            className="
              bg-gradient-to-r from-primary to-accent 
              hover:from-primary/90 hover:to-accent/90
              text-background font-semibold
              shadow-[0_0_20px_rgba(255,20,147,0.3)]
              hover:shadow-[0_0_30px_rgba(255,20,147,0.5)]
              transition-all duration-300
              text-xs sm:text-sm px-3 sm:px-4 
              flex-1 sm:flex-none
            "
            size={isMobile ? "sm" : "default"}
          >
            {isMobile ? "Continuar" : "Continuar con esta clave"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(apiKey.id)}
            className="
              text-muted-foreground hover:text-destructive 
              hover:bg-destructive/10
              transition-all duration-200
              px-2 sm:px-3
            "
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyCard;
