
import React from 'react';
import { Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialNetworkSelectorProps {
  onPublish: (platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook', videoUrl: string, apiKey: string, accountId: string, caption: string, pageId?: string) => Promise<{ success: boolean; error?: string }>;
  onYouTubeSelected: () => void;
  videoUrl: string;
  caption: string;
  blotatoApiKey: string;
  instagramAccountId?: string;
  tiktokAccountId?: string;
  youtubeAccountId?: string;
  facebookAccountId?: string;
  facebookPageId?: string;
  publishingToInstagram: boolean;
  publishingToTikTok: boolean;
  publishingToYouTube: boolean;
  publishingToFacebook: boolean;
  publishSuccess: { platform: string } | null;
  publishError: string | null;
  youtubeTitle?: string;
}

const SocialNetworkSelector = ({
  onPublish,
  onYouTubeSelected,
  videoUrl,
  caption,
  blotatoApiKey,
  instagramAccountId,
  tiktokAccountId,
  youtubeAccountId,
  facebookAccountId,
  facebookPageId,
  publishingToInstagram,
  publishingToTikTok,
  publishingToYouTube,
  publishingToFacebook,
  publishSuccess,
  publishError,
  youtubeTitle
}: SocialNetworkSelectorProps) => {
  const handlePublishToInstagram = async () => {
    if (!instagramAccountId) return;
    await onPublish('Instagram', videoUrl, blotatoApiKey, instagramAccountId, caption);
  };

  const handlePublishToTikTok = async () => {
    if (!tiktokAccountId) return;
    await onPublish('TikTok', videoUrl, blotatoApiKey, tiktokAccountId, caption);
  };

  const handlePublishToYouTube = async () => {
    if (!youtubeAccountId) return;
    
    // Si no hay título configurado, ir al paso de configuración
    if (!youtubeTitle) {
      onYouTubeSelected();
      return;
    }
    
    // Si ya hay título, publicar directamente
    await onPublish('YouTube', videoUrl, blotatoApiKey, youtubeAccountId, caption);
  };

  const handlePublishToFacebook = async () => {
    if (!facebookAccountId || !facebookPageId) return;
    await onPublish('Facebook', videoUrl, blotatoApiKey, facebookAccountId, caption, facebookPageId);
  };

  const facebookConfigured = facebookAccountId && facebookPageId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4">
          <Share2 className="w-8 h-8 text-background" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Publicar en Redes Sociales</h3>
        <p className="text-muted-foreground">
          Selecciona en qué red social quieres publicar tu video
        </p>
      </div>

      {/* Social Networks Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Instagram */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/logo%20instgram%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9sb2dvIGluc3RncmFtICgxKS5wbmciLCJpYXQiOjE3NTYwMDEwNTUsImV4cCI6MTkxMzY4MTA1NX0.btDFXhu1ftZSzuvIrz_PfMlT14xoKwOdOhZ6Mg8Iw_M"
              alt="Instagram"
              className="w-16 h-16 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'Instagram' && (
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToInstagram}
            disabled={!instagramAccountId || publishingToInstagram || publishSuccess?.platform === 'Instagram'}
            className="w-full cyber-border hover:cyber-glow-intense text-xs"
            size="sm"
          >
            {publishingToInstagram ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Publicando...
              </>
            ) : publishSuccess?.platform === 'Instagram' ? (
              <>
                <CheckCircle className="w-3 h-3 mr-2" />
                Publicado
              </>
            ) : (
              'Instagram'
            )}
          </Button>
          
          {!instagramAccountId && (
            <p className="text-xs text-muted-foreground">
              No configurada
            </p>
          )}
        </div>

        {/* TikTok */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/logo%20tik%20tok%20(2)%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9sb2dvIHRpayB0b2sgKDIpICgxKS5wbmciLCJpYXQiOjE3NTcxODk0MzksImV4cCI6MTkxNDg2OTQzOX0.aWGwMRxyCzlUdQOppQ0DHj4lIO4tXmKkWTWY-a09XaU"
              alt="TikTok"
              className="w-16 h-16 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'TikTok' && (
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToTikTok}
            disabled={!tiktokAccountId || publishingToTikTok || publishSuccess?.platform === 'TikTok'}
            className="w-full cyber-border hover:cyber-glow-intense text-xs"
            size="sm"
          >
            {publishingToTikTok ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Publicando...
              </>
            ) : publishSuccess?.platform === 'TikTok' ? (
              <>
                <CheckCircle className="w-3 h-3 mr-2" />
                Publicado
              </>
            ) : (
              'TikTok'
            )}
          </Button>
          
          {!tiktokAccountId && (
            <p className="text-xs text-muted-foreground">
              No configurada
            </p>
          )}
        </div>

        {/* YouTube */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/logo%20yt%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9sb2dvIHl0ICgxKS5wbmciLCJpYXQiOjE3NTYwMDEwOTIsImV4cCI6MTkxMzY4MTA5Mn0.uTc3D_I7yERxUMwAvYIO2tY_naLfdXTPVD-mQRkUf3o"
              alt="YouTube"
              className="w-16 h-16 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'YouTube' && (
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToYouTube}
            disabled={!youtubeAccountId || publishingToYouTube || publishSuccess?.platform === 'YouTube'}
            className="w-full cyber-border hover:cyber-glow-intense text-xs"
            size="sm"
          >
            {publishingToYouTube ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Publicando...
              </>
            ) : publishSuccess?.platform === 'YouTube' ? (
              <>
                <CheckCircle className="w-3 h-3 mr-2" />
                Publicado
              </>
            ) : youtubeTitle ? (
              'Publicar YouTube'
            ) : (
              'Configurar Título'
            )}
          </Button>
          
          {!youtubeAccountId ? (
            <p className="text-xs text-muted-foreground">
              No configurada
            </p>
          ) : !youtubeTitle ? (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Título requerido
            </p>
          ) : null}
        </div>

        {/* Facebook */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/logo%20facebook%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9sb2dvIGZhY2Vib29rICgxKS5wbmciLCJpYXQiOjE3NTYwMDExMDgsImV4cCI6MTkxMzY4MTEwOH0.0uK1Fp42b64mIYRVFpQ1MuDsUvE2z1E0SXBczPPY1mo"
              alt="Facebook"
              className="w-16 h-16 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'Facebook' && (
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToFacebook}
            disabled={!facebookConfigured || publishingToFacebook || publishSuccess?.platform === 'Facebook'}
            className="w-full cyber-border hover:cyber-glow-intense text-xs"
            size="sm"
          >
            {publishingToFacebook ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Publicando...
              </>
            ) : publishSuccess?.platform === 'Facebook' ? (
              <>
                <CheckCircle className="w-3 h-3 mr-2" />
                Publicado
              </>
            ) : (
              'Facebook'
            )}
          </Button>
          
          {!facebookConfigured && (
            <p className="text-xs text-muted-foreground">
              {!facebookAccountId && !facebookPageId ? 'No configurada' : 'Configuración incompleta'}
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {publishError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{publishError}</p>
        </div>
      )}

      {/* Success message */}
      {publishSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-green-700 dark:text-green-400 font-medium">
            ¡Video publicado exitosamente en {publishSuccess.platform}!
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialNetworkSelector;
