
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Download, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import SocialPublishModal from '@/components/social/SocialPublishModal';
import { useSocialPublish } from '@/hooks/useSocialPublish';

interface VideoCardProps {
  id: string;
  title?: string;
  videoUrl: string;
  script: string;
  createdAt: string;
  onDelete?: (videoId: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  id, 
  title, 
  videoUrl, 
  script, 
  createdAt,
  onDelete 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openModal } = useSocialPublish();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSocialShare = async () => {
    setIsModalOpen(true);
    await openModal(videoUrl, script);
  };

  return (
    <>
      <Card className="cyber-border hover:cyber-glow transition-all duration-300 group">
        <CardHeader className="p-0">
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              controls={false}
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="lg"
                className="rounded-full w-16 h-16 cyber-glow"
                onClick={() => {
                  const video = document.querySelector(`video[src="${videoUrl}"]`) as HTMLVideoElement;
                  if (video) {
                    video.controls = true;
                    video.play();
                  }
                }}
              >
                <Play className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {title || 'Video sin título'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Creado {formatDistanceToNow(new Date(createdAt), { 
                addSuffix: true, 
                locale: es 
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1 cyber-border hover:cyber-glow"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            
            <Button
              size="sm"
              onClick={handleSocialShare}
              className="flex-1 cyber-glow"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Publicar en Redes
            </Button>
          </div>
        </CardContent>
      </Card>

      <SocialPublishModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrl={videoUrl}
        script={script}
      />
    </>
  );
};

export default VideoCard;
