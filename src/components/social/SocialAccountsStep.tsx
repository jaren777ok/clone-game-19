
import React, { useState, useEffect } from 'react';
import { Instagram, Music, Youtube, Facebook, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialAccountsStepProps {
  onAccountsSaved: () => void;
  onSaveAccounts: (instagramId?: string, tiktokId?: string, youtubeId?: string, facebookId?: string, facebookPageId?: string) => Promise<{ success: boolean; error?: any }>;
  existingInstagramId?: string;
  existingTiktokId?: string;
  existingYoutubeId?: string;
  existingFacebookId?: string;
  existingFacebookPageId?: string;
  isLoading: boolean;
}

const SocialAccountsStep = ({ 
  onAccountsSaved, 
  onSaveAccounts, 
  existingInstagramId,
  existingTiktokId,
  existingYoutubeId,
  existingFacebookId,
  existingFacebookPageId,
  isLoading 
}: SocialAccountsStepProps) => {
  const [instagramId, setInstagramId] = useState(existingInstagramId || '');
  const [tiktokId, setTiktokId] = useState(existingTiktokId || '');
  const [youtubeId, setYoutubeId] = useState(existingYoutubeId || '');
  const [facebookId, setFacebookId] = useState(existingFacebookId || '');
  const [facebookPageId, setFacebookPageId] = useState(existingFacebookPageId || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInstagramId(existingInstagramId || '');
    setTiktokId(existingTiktokId || '');
    setYoutubeId(existingYoutubeId || '');
    setFacebookId(existingFacebookId || '');
    setFacebookPageId(existingFacebookPageId || '');
  }, [existingInstagramId, existingTiktokId, existingYoutubeId, existingFacebookId, existingFacebookPageId]);

  const handleSave = async () => {
    if (!instagramId.trim() && !tiktokId.trim() && !youtubeId.trim() && !facebookId.trim() && !facebookPageId.trim()) return;
    
    setSaving(true);
    const result = await onSaveAccounts(
      instagramId.trim() || undefined,
      tiktokId.trim() || undefined,
      youtubeId.trim() || undefined,
      facebookId.trim() || undefined,
      facebookPageId.trim() || undefined
    );
    setSaving(false);
    
    if (result.success) {
      onAccountsSaved();
    }
  };

  const hasAtLeastOneAccount = Boolean(instagramId.trim() || tiktokId.trim() || youtubeId.trim() || (facebookId.trim() && facebookPageId.trim()));
  const facebookIncomplete = Boolean((facebookId.trim() && !facebookPageId.trim()) || (!facebookId.trim() && facebookPageId.trim()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
          <div className="flex space-x-1">
            <Instagram className="w-3 h-3 text-background" />
            <Music className="w-3 h-3 text-background" />
            <Youtube className="w-3 h-3 text-background" />
            <Facebook className="w-3 h-3 text-background" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Configurar Cuentas Sociales</h3>
        <p className="text-muted-foreground">
          Ingresa los IDs de tus cuentas sociales desde Blotato
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

      {/* Formulario - Grid responsivo */}
      <div className="space-y-4">
        {/* Instagram y TikTok */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* YouTube */}
        <div>
          <Label htmlFor="youtubeId" className="flex items-center">
            <Youtube className="w-4 h-4 mr-2 text-red-500" />
            ID de Cuenta de YouTube
          </Label>
          <Input
            id="youtubeId"
            type="text"
            placeholder="Ej: youtube_account_789"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            className="cyber-border focus:cyber-glow"
          />
        </div>

        {/* Facebook - Sección especial con 2 campos */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Facebook className="w-4 h-4 mr-2 text-blue-600" />
            <h4 className="font-medium text-foreground">Configuración de Facebook</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Para Facebook necesitas tanto el ID de tu cuenta como el ID de la página donde quieres publicar.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebookId" className="flex items-center">
                ID de Cuenta de Facebook
              </Label>
              <Input
                id="facebookId"
                type="text"
                placeholder="Ej: facebook_account_101"
                value={facebookId}
                onChange={(e) => setFacebookId(e.target.value)}
                className={`cyber-border focus:cyber-glow ${facebookIncomplete ? 'border-yellow-500' : ''}`}
              />
            </div>

            <div>
              <Label htmlFor="facebookPageId" className="flex items-center">
                ID de Página de Facebook
              </Label>
              <Input
                id="facebookPageId"
                type="text"
                placeholder="Ej: facebook_page_202"
                value={facebookPageId}
                onChange={(e) => setFacebookPageId(e.target.value)}
                className={`cyber-border focus:cyber-glow ${facebookIncomplete ? 'border-yellow-500' : ''}`}
              />
            </div>
          </div>

          {facebookIncomplete && (
            <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Para Facebook necesitas completar ambos campos: cuenta y página
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        * Debes configurar al menos una cuenta para continuar
      </div>

      <Button
        onClick={handleSave}
        disabled={!hasAtLeastOneAccount || facebookIncomplete || saving || isLoading}
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
  );
};

export default SocialAccountsStep;
