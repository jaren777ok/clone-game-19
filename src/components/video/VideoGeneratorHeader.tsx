
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const VideoGeneratorHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-start mb-4 sm:mb-8 px-2 sm:px-0">
      <Button
        variant="outline"
        onClick={() => navigate('/crear-video')}
        className="cyber-border hover:cyber-glow text-xs sm:text-sm px-2 sm:px-4"
        size={isMobile ? "sm" : "default"}
      >
        <ArrowLeft className="w-4 h-4 sm:mr-2" />
        <span>Volver</span>
      </Button>
    </div>
  );
};

export default VideoGeneratorHeader;
