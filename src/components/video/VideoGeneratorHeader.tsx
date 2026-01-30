
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoGeneratorHeaderProps {
  onBack: () => void;
}

const VideoGeneratorHeader = ({ onBack }: VideoGeneratorHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-start mb-4 sm:mb-6">
      <Button
        variant="outline"
        onClick={onBack}
        className="cyber-border hover:cyber-glow text-xs sm:text-sm px-2 sm:px-4"
        size={isMobile ? "sm" : "default"}
      >
        <ArrowLeft className="w-4 h-4 sm:mr-2" />
        <span>Atrás</span>
      </Button>
    </div>
  );
};

export default VideoGeneratorHeader;
