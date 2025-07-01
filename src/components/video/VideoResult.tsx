
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RotateCcw, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { saveVideoToDatabase, clearGenerationState } from '@/lib/videoGeneration';
import SocialPublishModal from '@/components/social/SocialPublishModal';
import { useSocialPublish } from '@/hooks/useSocialPublish';

interface VideoResultProps {
  videoUrl: string;
  onNewVideo: () => void;
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, onNewVideo }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openModal } = useSocialPublish();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'video-generado.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewVideo = () => {
    clearGenerationState();
    onNewVideo();
  };

  const handleSocialShare = async () => {
    // Get script from localStorage if available
    const savedState = localStorage.getItem('video_generation_state');
    let script = '';
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        script = parsedState.script || '';
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }

    setIsModalOpen(true);
    await openModal(videoUrl, script);
  };

  return (
    <>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
                ¡Video Completado!
              </h1>
              <p className="text-muted-foreground text-lg">
                Tu video ha sido generado exitosamente
              </p>
            </div>

            <Card className="cyber-border mb-8">
              <CardContent className="p-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    autoPlay
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 cyber-border hover:cyber-glow"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Video
                  </Button>
                  
                  <Button
                    onClick={handleSocialShare}
                    className="flex-1 cyber-glow"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Publicar en Redes
                  </Button>
                  
                  <Button
                    onClick={handleNewVideo}
                    variant="outline" 
                    className="flex-1 cyber-border hover:cyber-glow"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Crear Nuevo Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <SocialPublishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={videoUrl}
        script="" // Will be handled by the modal
      />
    </>
  );
};

export default VideoResult;
