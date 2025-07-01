
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Loader2 } from 'lucide-react';

interface Props {
  onSave: (name: string, apiKey: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const BlotatomApiKeyForm: React.FC<Props> = ({ onSave, isLoading, error }) => {
  const [apiKeyName, setApiKeyName] = useState('Mi Clave Blotato');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    onSave(apiKeyName.trim() || 'Mi Clave Blotato', apiKey.trim());
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
          <Key className="w-8 h-8 text-background" />
        </div>
        <h2 className="text-2xl font-bold">Conectar Blotato</h2>
        <p className="text-muted-foreground">
          Ingresa tu clave API de Blotato para poder publicar en redes sociales
        </p>
      </div>

      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="text-lg">Configuración de API</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKeyName">Nombre de la clave</Label>
              <Input
                id="apiKeyName"
                type="text"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                placeholder="Ej: Mi Clave Blotato"
                className="cyber-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">Clave API de Blotato *</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu clave API de Blotato"
                className="cyber-border"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!apiKey.trim() || isLoading}
              className="w-full cyber-glow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Clave API'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Tu clave API se almacena de forma segura y encriptada
        </p>
      </div>
    </div>
  );
};

export default BlotatomApiKeyForm;
