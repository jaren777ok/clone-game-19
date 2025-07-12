import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Key, Trash2 } from 'lucide-react';
import { HeyGenApiKey } from '@/types/videoFlow';
import { useIsMobile } from '@/hooks/use-mobile';

interface Props {
  apiKey: HeyGenApiKey;
  onSelect: (apiKey: HeyGenApiKey) => void;
  onDelete: (keyId: string) => void;
}

const ApiKeyCard: React.FC<Props> = ({ apiKey, onSelect, onDelete }) => {
  const isMobile = useIsMobile();

  return (
    <Card className="cyber-border hover:cyber-glow transition-all">
      <CardContent className="p-3 sm:p-6">
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">{apiKey.api_key_name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Creada el {new Date(apiKey.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className={`flex ${isMobile ? 'justify-between' : 'space-x-2'}`}>
            <Button
              onClick={() => onSelect(apiKey)}
              className="cyber-glow text-xs sm:text-sm px-2 sm:px-4 flex-1 sm:flex-none"
              size={isMobile ? "sm" : "default"}
            >
              {isMobile ? "Continuar" : "Continuar con esta clave"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(apiKey.id)}
              className="text-destructive hover:text-destructive px-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyCard;
