
import React from 'react';
import { Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialNetworkSelectorProps {
  onPublish: (platform: 'Instagram' | 'TikTok', videoUrl: string, apiKey: string, accountId: string, caption: string) => Promise<{ success: boolean; error?: string }>;
  videoUrl: string;
  caption: string;
  blotatoApiKey: string;
  instagramAccountId?: string;
  tiktokAccountId?: string;
  publishingToInstagram: boolean;
  publishingToTikTok: boolean;
  publishSuccess: { platform: string } | null;
  publishError: string | null;
}

const SocialNetworkSelector = ({
  onPublish,
  videoUrl,
  caption,
  blotatoApiKey,
  instagramAccountId,
  tiktokAccountId,
  publishingToInstagram,
  publishingToTikTok,
  publishSuccess,
  publishError
}: SocialNetworkSelectorProps) => {
  const handlePublishToInstagram = async () => {
    if (!instagramAccountId) return;
    await onPublish('Instagram', videoUrl, blotatoApiKey, instagramAccountId, caption);
  };

  const handlePublishToTikTok = async () => {
    if (!tiktokAccountId) return;
    await onPublish('TikTok', videoUrl, blotatoApiKey, tiktokAccountId, caption);
  };

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

      {/* Caption preview */}
      <div className="bg-muted/20 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Caption a usar:</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {caption.length > 150 ? `${caption.substring(0, 150)}...` : caption}
        </p>
      </div>

      {/* Social Networks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20ig.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gaWcucG5nIiwiaWF0IjoxNzUxMzkzMTQ2LCJleHAiOjE3ODI5MjkxNDZ9.8mclgvFVZ2fcXkgsGBmn1Xj5oFocfW4biuEI7EOeOBs"
              alt="Instagram"
              className="w-20 h-20 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'Instagram' && (
              <CheckCircle className="w-6 h-6 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToInstagram}
            disabled={!instagramAccountId || publishingToInstagram || publishSuccess?.platform === 'Instagram'}
            className="w-full cyber-border hover:cyber-glow-intense"
          >
            {publishingToInstagram ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Publicando...
              </>
            ) : publishSuccess?.platform === 'Instagram' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Publicado
              </>
            ) : (
              'Publicar en Instagram'
            )}
          </Button>
          
          {!instagramAccountId && (
            <p className="text-xs text-muted-foreground">
              Cuenta no configurada
            </p>
          )}
        </div>

        {/* TikTok */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20tik%20tok%20(2).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gdGlrIHRvayAoMikucG5nIiwiaWF0IjoxNzUxMzkzMTcxLCJleHAiOjE3ODI5MjkxNzF9.-gDibqoF1aR9pGRlgqoEKm4-1-r0GW_Xq73EyS1MCeQ"
              alt="TikTok"
              className="w-20 h-20 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'TikTok' && (
              <CheckCircle className="w-6 h-6 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToTikTok}
            disabled={!tiktokAccountId || publishingToTikTok || publishSuccess?.platform === 'TikTok'}
            className="w-full cyber-border hover:cyber-glow-intense"
          >
            {publishingToTikTok ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Publicando...
              </>
            ) : publishSuccess?.platform === 'TikTok' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Publicado
              </>
            ) : (
              'Publicar en TikTok'
            )}
          </Button>
          
          {!tiktokAccountId && (
            <p className="text-xs text-muted-foreground">
              Cuenta no configurada
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
