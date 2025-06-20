import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Key, Trash2 } from 'lucide-react';
import { HeyGenApiKey } from '@/types/videoFlow';

interface Props {
  apiKey: HeyGenApiKey;
  onSelect: (apiKey: HeyGenApiKey) => void;
  onDelete: (keyId: string) => void;
}

const ApiKeyCard: React.FC<Props> = ({ apiKey, onSelect, onDelete }) => {
  return (
    <Card className="cyber-border hover:cyber-glow transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="font-semibold">{apiKey.api_key_name}</h3>
              <p className="text-sm text-muted-foreground">
                Creada el {new Date(apiKey.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => onSelect(apiKey)}
              className="cyber-glow"
            >
              Continuar con esta clave
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(apiKey.id)}
              className="text-destructive hover:text-destructive"
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
