
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const VideoGeneratorHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between mb-4 sm:mb-8 px-2 sm:px-0">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="cyber-border hover:cyber-glow text-xs sm:text-sm px-2 sm:px-4"
        size={isMobile ? "sm" : "default"}
      >
        <ArrowLeft className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Volver al Dashboard</span>
        <span className="sm:hidden">Dashboard</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => navigate('/videos-guardados')}
        className="cyber-border hover:cyber-glow text-xs sm:text-sm px-2 sm:px-4"
        size={isMobile ? "sm" : "default"}
      >
        <Bookmark className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Videos Guardados</span>
        <span className="sm:hidden">Videos</span>
      </Button>
    </div>
  );
};

export default VideoGeneratorHeader;
