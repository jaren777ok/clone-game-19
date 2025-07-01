
import React, { useState, useEffect } from 'react';
import { Instagram, Music, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialAccountsStepProps {
  onAccountsSaved: () => void;
  onSaveAccounts: (instagramId?: string, tiktokId?: string) => Promise<{ success: boolean; error?: any }>;
  existingInstagramId?: string;
  existingTiktokId?: string;
  isLoading: boolean;
}

const SocialAccountsStep = ({ 
  onAccountsSaved, 
  onSaveAccounts, 
  existingInstagramId,
  existingTiktokId,
  isLoading 
}: SocialAccountsStepProps) => {
  const [instagramId, setInstagramId] = useState(existingInstagramId || '');
  const [tiktokId, setTiktokId] = useState(existingTiktokId || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInstagramId(existingInstagramId || '');
    setTiktokId(existingTiktokId || '');
  }, [existingInstagramId, existingTiktokId]);

  const handleSave = async () => {
    if (!instagramId.trim() && !tiktokId.trim()) return;
    
    setSaving(true);
    const result = await onSaveAccounts(
      instagramId.trim() || undefined,
      tiktokId.trim() || undefined
    );
    setSaving(false);
    
    if (result.success) {
      onAccountsSaved();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
          <div className="flex space-x-1">
            <Instagram className="w-4 h-4 text-background" />
            <Music className="w-4 h-4 text-background" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Configurar Cuentas Sociales</h3>
        <p className="text-muted-foreground">
          Ingresa los IDs de tus cuentas de Instagram y TikTok desde Blotato
        </p>
      </div>

      {/* Información de ayuda */}
      <div className="bg-muted/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">¿Cómo encontrar los IDs de mis cuentas?</h4>
        <p className="text-sm text-muted-foreground mb-3">
          1. Ve a tu panel de Blotato<br/>
          2. En la sección "Cuentas Conectadas" verás tus redes sociales<br/>
          3. Copia el ID de cada cuenta que quieras usar
        </p>
        <Button
          variant="outline"
          size="sm"
          className="cyber-border hover:cyber-glow"
          onClick={() => window.open('https://blotato.com/dashboard', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ir al Panel de Blotato
        </Button>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="instagramId" className="flex items-center">
            <Instagram className="w-4 h-4 mr-2 text-pink-500" />
            ID de Cuenta de Instagram
          </Label>
          <Input
            id="instagramId"
            type="text"
            placeholder="Ej: instagram_account_123"
            value={instagramId}
            onChange={(e) => setInstagramId(e.target.value)}
            className="cyber-border focus:cyber-glow"
          />
        </div>

        <div>
          <Label htmlFor="tiktokId" className="flex items-center">
            <Music className="w-4 h-4 mr-2 text-black" />
            ID de Cuenta de TikTok
          </Label>
          <Input
            id="tiktokId"
            type="text"
            placeholder="Ej: tiktok_account_456"
            value={tiktokId}
            onChange={(e) => setTiktokId(e.target.value)}
            className="cyber-border focus:cyber-glow"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          * Debes configurar al menos una cuenta para continuar
        </div>

        <Button
          onClick={handleSave}
          disabled={(!instagramId.trim() && !tiktokId.trim()) || saving || isLoading}
          className="w-full cyber-border hover:cyber-glow-intense"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            'Guardar Cuentas'
          )}
        </Button>
      </div>
    </div>
  );
};

export default SocialAccountsStep;
