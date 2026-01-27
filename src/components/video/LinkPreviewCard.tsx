import React from 'react';
import { Music, Camera, Youtube, Globe, ExternalLink } from 'lucide-react';
import { identifyPlatform, formatUrlForDisplay, extractPlatformInfo, type LinkPlatform } from '@/lib/linkUtils';

interface LinkPreviewCardProps {
  url: string;
}

// Configuración visual por plataforma
const platformConfig: Record<LinkPlatform, {
  name: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
}> = {
  tiktok: {
    name: 'TikTok',
    icon: Music,
    gradient: 'from-[#000000] to-[#ff0050]',
    borderColor: 'border-[#ff0050]/40'
  },
  instagram: {
    name: 'Instagram',
    icon: Camera,
    gradient: 'from-[#833AB4] via-[#E1306C] to-[#F77737]',
    borderColor: 'border-[#E1306C]/40'
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    gradient: 'from-[#FF0000] to-[#CC0000]',
    borderColor: 'border-[#FF0000]/40'
  },
  twitter: {
    name: 'X / Twitter',
    icon: Globe,
    gradient: 'from-[#1DA1F2] to-[#0d8bd9]',
    borderColor: 'border-[#1DA1F2]/40'
  },
  web: {
    name: 'Web',
    icon: Globe,
    gradient: 'from-primary to-accent',
    borderColor: 'border-primary/40'
  }
};

const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url }) => {
  const platform = identifyPlatform(url);
  const { domain, path } = formatUrlForDisplay(url);
  const platformInfo = extractPlatformInfo(url, platform);
  const config = platformConfig[platform];
  const Icon = config.icon;

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full text-left p-3 rounded-xl
        bg-card/30 backdrop-blur-sm
        border ${config.borderColor}
        hover:bg-card/50 hover:scale-[1.02]
        transition-all duration-200 cursor-pointer
        group
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icono de plataforma */}
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          bg-gradient-to-br ${config.gradient}
        `}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        {/* Información del enlace */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">
              {config.name}
            </span>
            {platformInfo.user && (
              <span className="text-xs text-muted-foreground">
                {platformInfo.user}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {domain}
          </p>
          {path && path !== '/' && (
            <p className="text-xs text-muted-foreground/70 truncate">
              {path}
            </p>
          )}
        </div>
        
        {/* Icono de abrir */}
        <div className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
};

export default LinkPreviewCard;
