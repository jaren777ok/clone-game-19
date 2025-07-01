
import React from 'react';
import { Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialNetworkSelectorProps {
  onPublish: (platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Facebook', videoUrl: string, apiKey: string, accountId: string, caption: string) => Promise<{ success: boolean; error?: string }>;
  videoUrl: string;
  caption: string;
  blotatoApiKey: string;
  instagramAccountId?: string;
  tiktokAccountId?: string;
  youtubeAccountId?: string;
  facebookAccountId?: string;
  publishingToInstagram: boolean;
  publishingToTikTok: boolean;
  publishingToYouTube: boolean;
  publishingToFacebook: boolean;
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
  youtubeAccountId,
  facebookAccountId,
  publishingToInstagram,
  publishingToTikTok,
  publishingToYouTube,
  publishingToFacebook,
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

  const handlePublishToYouTube = async () => {
    if (!youtubeAccountId) return;
    await onPublish('YouTube', videoUrl, blotatoApiKey, youtubeAccountId, caption);
  };

  const handlePublishToFacebook = async () => {
    if (!facebookAccountId) return;
    await onPublish('Facebook', videoUrl, blotatoApiKey, facebookAccountId, caption);
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

      {/* Social Networks Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Instagram */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20instgram.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gaW5zdGdyYW0ucG5nIiwiaWF0IjoxNzUxMzk4MTUwLCJleHAiOjE3ODI5MzQxNTB9.Zc9zwKjj7-jrHDdK4LaOW0j4nacsBwm5hIXUP0LzsD0"
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
              src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20tik%20tok%20(2).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gdGlrIHRvayAoMikucG5nIiwiaWF0IjoxNzUxMzkzMTcxLCJleHAiOjE3ODI5MjkxNzF9.-gDibqoF1aR9pGRlgqoEKm4-1-r0GW_Xq73EyS1MCeQ"
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
              src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20yt.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28geXQucG5nIiwiaWF0IjoxNzUxMzk4MjIzLCJleHAiOjE3ODI5MzQyMjN9.wxVt3uunbNNLkN4ZTjzUVshpwMOdpf6U9ea58ZlsXKY"
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
            ) : (
              'YouTube'
            )}
          </Button>
          
          {!youtubeAccountId && (
            <p className="text-xs text-muted-foreground">
              No configurada
            </p>
          )}
        </div>

        {/* Facebook */}
        <div className="text-center space-y-4">
          <div className="relative">
            <img
              src="https://wnvpvjkzjkgiaztgtlxy.supabase.co/storage/v1/object/sign/videos-de-app/logo%20facebook.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMGRjNjgyNS1lZDgyLTQ2ZDgtYTlmYy0xNzc2ZmUwN2IxMzEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MtZGUtYXBwL2xvZ28gZmFjZWJvb2sucG5nIiwiaWF0IjoxNzUxMzk4MjQyLCJleHAiOjE3ODI5MzQyNDJ9.-4ih8q6TBcFURk9TFfHmF5yBYqNjMQO5wTtUIuU-3rI"
              alt="Facebook"
              className="w-16 h-16 mx-auto rounded-2xl cyber-border"
            />
            {publishSuccess?.platform === 'Facebook' && (
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </div>
          
          <Button
            onClick={handlePublishToFacebook}
            disabled={!facebookAccountId || publishingToFacebook || publishSuccess?.platform === 'Facebook'}
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
          
          {!facebookAccountId && (
            <p className="text-xs text-muted-foreground">
              No configurada
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
