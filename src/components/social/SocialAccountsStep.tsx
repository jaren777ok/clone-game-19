
import React, { useState, useEffect } from 'react';
import { Instagram, Youtube, Facebook, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Icono personalizado para TikTok más reconocible
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

interface SocialAccountsStepProps {
  onAccountsSaved: () => void;
  onSaveAccounts: (instagramId?: string, tiktokId?: string, youtubeId?: string, facebookId?: string, facebookPageId?: string) => Promise<{ success: boolean; error?: any }>;
  existingInstagramId?: string;
  existingTiktokId?: string;
  existingYoutubeId?: string;
  existingFacebookId?: string;
  existingFacebookPageId?: string;
  isLoading: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
}

const SocialAccountsStep = ({ 
  onAccountsSaved, 
  onSaveAccounts, 
  existingInstagramId,
  existingTiktokId,
  existingYoutubeId,
  existingFacebookId,
  existingFacebookPageId,
  isLoading,
  isEditing,
  onCancel
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
            <TikTokIcon className="w-3 h-3 text-background" />
            <Youtube className="w-3 h-3 text-background" />
            <Facebook className="w-3 h-3 text-background" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isEditing ? 'Editar Cuentas Sociales' : 'Configurar Cuentas Sociales'}
        </h3>
        <p className="text-muted-foreground">
          {isEditing ? 'Actualiza los IDs de tus cuentas sociales' : 'Conecta tus cuentas sociales desde Blotato'}
        </p>
      </div>

      {/* Información de ayuda */}
      <div className="bg-muted/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">¿Cómo encontrar los IDs?</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Ve a tu panel de Blotato y copia los IDs de tus cuentas conectadas
        </p>
        <Button
          variant="outline"
          size="sm"
          className="cyber-border hover:cyber-glow"
          onClick={() => window.open('https://blotato.com/dashboard', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir Blotato
        </Button>
      </div>

      {/* Formulario - Grid responsivo */}
      <div className="space-y-5">
        {/* Instagram y TikTok */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="instagramId" className="flex items-center mb-3">
              <Instagram className="w-5 h-5 mr-3 text-pink-500" />
              <span className="font-medium">Instagram</span>
            </Label>
            <Input
              id="instagramId"
              type="text"
              placeholder="ID de cuenta de Instagram"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              className="cyber-border focus:cyber-glow"
            />
          </div>

          <div>
            <Label htmlFor="tiktokId" className="flex items-center mb-3">
              <TikTokIcon className="w-5 h-5 mr-3 text-gray-800" />
              <span className="font-medium">TikTok</span>
            </Label>
            <Input
              id="tiktokId"
              type="text"
              placeholder="ID de cuenta de TikTok"
              value={tiktokId}
              onChange={(e) => setTiktokId(e.target.value)}
              className="cyber-border focus:cyber-glow"
            />
          </div>
        </div>

        {/* YouTube */}
        <div>
          <Label htmlFor="youtubeId" className="flex items-center mb-3">
            <Youtube className="w-5 h-5 mr-3 text-red-500" />
            <span className="font-medium">YouTube</span>
          </Label>
          <Input
            id="youtubeId"
            type="text"
            placeholder="ID de cuenta de YouTube"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            className="cyber-border focus:cyber-glow"
          />
        </div>

        {/* Facebook - Sección especial con 2 campos */}
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-5">
          <div className="flex items-center mb-4">
            <Facebook className="w-5 h-5 mr-3 text-blue-500" />
            <h4 className="font-medium text-foreground">Facebook</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Necesitas el ID de tu cuenta y el ID de la página donde publicar
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebookId" className="block mb-2 font-medium">
                ID de Cuenta
              </Label>
              <Input
                id="facebookId"
                type="text"
                placeholder="ID de cuenta de Facebook"
                value={facebookId}
                onChange={(e) => setFacebookId(e.target.value)}
                className={`cyber-border focus:cyber-glow ${facebookIncomplete ? 'border-yellow-500' : ''}`}
              />
            </div>

            <div>
              <Label htmlFor="facebookPageId" className="block mb-2 font-medium">
                ID de Página
              </Label>
              <Input
                id="facebookPageId"
                type="text"
                placeholder="ID de página de Facebook"
                value={facebookPageId}
                onChange={(e) => setFacebookPageId(e.target.value)}
                className={`cyber-border focus:cyber-glow ${facebookIncomplete ? 'border-yellow-500' : ''}`}
              />
            </div>
          </div>

          {facebookIncomplete && (
            <div className="mt-3 text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Completa ambos campos de Facebook
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        * Configura al menos una cuenta para continuar
      </div>

      <div className={isEditing ? "flex gap-3" : ""}>
        <Button
          onClick={handleSave}
          disabled={!hasAtLeastOneAccount || facebookIncomplete || saving || isLoading}
          className={`cyber-border hover:cyber-glow-intense ${isEditing ? 'flex-1' : 'w-full'}`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {isEditing ? 'Actualizando...' : 'Guardando...'}
            </>
          ) : (
            isEditing ? 'Actualizar Cuentas' : 'Guardar Cuentas'
          )}
        </Button>
        
        {isEditing && onCancel && (
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={saving}
            className="cyber-border hover:cyber-glow"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default SocialAccountsStep;
