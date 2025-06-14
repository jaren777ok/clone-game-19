
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoGeneratorHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="cyber-border hover:cyber-glow"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Button>

      <Button
        variant="outline"
        onClick={() => navigate('/videos-guardados')}
        className="cyber-border hover:cyber-glow"
      >
        <Bookmark className="w-4 h-4 mr-2" />
        Videos Guardados
      </Button>
    </div>
  );
};

export default VideoGeneratorHeader;
