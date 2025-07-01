
import React, { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BlotatoApiKeyStepProps {
  onApiKeySaved: () => void;
  onSaveApiKey: (apiKey: string) => Promise<{ success: boolean; error?: any }>;
  isLoading: boolean;
}

const BlotatoApiKeyStep = ({ onApiKeySaved, onSaveApiKey, isLoading }: BlotatoApiKeyStepProps) => {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setSaving(true);
    const result = await onSaveApiKey(apiKey.trim());
    setSaving(false);
    
    if (result.success) {
      onApiKeySaved();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
          <Key className="w-8 h-8 text-background" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Configurar Blotato</h3>
        <p className="text-muted-foreground">
          Para publicar en redes sociales necesitas configurar tu clave API de Blotato
        </p>
      </div>

      {/* Información de ayuda */}
      <div className="bg-muted/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">¿Dónde encontrar tu API Key?</h4>
        <p className="text-sm text-muted-foreground mb-3">
          1. Ve a tu cuenta de Blotato<br/>
          2. Accede a la sección "API Keys" o "Configuración"<br/>
          3. Copia tu clave API
        </p>
        <Button
          variant="outline"
          size="sm"
          className="cyber-border hover:cyber-glow"
          onClick={() => window.open('https://blotato.com', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ir a Blotato
        </Button>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">Clave API de Blotato</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Ingresa tu clave API de Blotato"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="cyber-border focus:cyber-glow"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!apiKey.trim() || saving || isLoading}
          className="w-full cyber-border hover:cyber-glow-intense"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar API Key'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BlotatoApiKeyStep;
