
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { HeyGenApiKey } from '@/hooks/useVideoCreationFlow';
import ApiKeyCard from './ApiKeyCard';

interface Props {
  apiKeys: HeyGenApiKey[];
  onSelectApiKey: (apiKey: HeyGenApiKey) => void;
  onDeleteApiKey: (keyId: string) => void;
  onShowAddForm: () => void;
}

const ApiKeyList: React.FC<Props> = ({ 
  apiKeys, 
  onSelectApiKey, 
  onDeleteApiKey, 
  onShowAddForm 
}) => {
  return (
    <>
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Claves API Disponibles:</h2>
        {apiKeys.map((apiKey) => (
          <ApiKeyCard
            key={apiKey.id}
            apiKey={apiKey}
            onSelect={onSelectApiKey}
            onDelete={onDeleteApiKey}
          />
        ))}
      </div>

      {/* Botón para agregar nueva clave */}
      <Card className="cyber-border">
        <CardContent className="p-6">
          <Button
            onClick={onShowAddForm}
            variant="outline"
            className="w-full cyber-border hover:cyber-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar nueva clave API
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default ApiKeyList;
