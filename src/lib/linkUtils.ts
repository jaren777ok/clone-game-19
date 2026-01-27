// Regex para detectar URLs en texto
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export type LinkPlatform = 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'web';

// Extraer todas las URLs de un texto
export const extractLinksFromText = (text: string): string[] => {
  const matches = text.match(URL_REGEX);
  return matches || [];
};

// Remover URLs del texto para mostrar solo el mensaje
export const removeLinksFromText = (text: string): string => {
  return text.replace(URL_REGEX, '').trim();
};

// Identificar tipo de plataforma
export const identifyPlatform = (url: string): LinkPlatform => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('tiktok.com')) return 'tiktok';
  if (lowerUrl.includes('instagram.com')) return 'instagram';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
  return 'web';
};

// Formatear URL para display
export const formatUrlForDisplay = (url: string): { domain: string; path: string } => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname.length > 35 
      ? urlObj.pathname.substring(0, 35) + '...' 
      : urlObj.pathname;
    return { domain, path };
  } catch {
    return { domain: url, path: '' };
  }
};

// Extraer información específica de la URL según plataforma
export const extractPlatformInfo = (url: string, platform: LinkPlatform): { user?: string; id?: string } => {
  try {
    const urlObj = new URL(url);
    
    if (platform === 'tiktok') {
      // Ejemplo: /@username/video/123456
      const pathMatch = urlObj.pathname.match(/@([^/]+)\/video\/(\d+)/);
      if (pathMatch) {
        return { user: `@${pathMatch[1]}`, id: pathMatch[2] };
      }
    }
    
    if (platform === 'instagram') {
      // Ejemplo: /reel/ABC123/ o /p/ABC123/
      const pathMatch = urlObj.pathname.match(/\/(reel|p)\/([^/]+)/);
      if (pathMatch) {
        return { id: pathMatch[2] };
      }
    }
    
    if (platform === 'youtube') {
      // Ejemplo: /watch?v=ABC123 o youtu.be/ABC123
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.slice(1);
      if (videoId) {
        return { id: videoId };
      }
    }
    
    return {};
  } catch {
    return {};
  }
};
