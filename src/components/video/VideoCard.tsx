
import React, { useState } from 'react';
import { Copy, ExternalLink, Trash2, Calendar, FileText, CheckCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoCardProps {
  id: string;
  title?: string;
  script: string;
  videoUrl: string;
  createdAt: string;
  onDelete: (id: string) => void;
}

const VideoCard = ({ id, title, script, videoUrl, createdAt, onDelete }: VideoCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateScript = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getDisplayTitle = () => {
    if (title) return title;
    return `Video Generado - ${formatDate(createdAt)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace del video ha sido copiado al portapapeles.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace.",
        variant: "destructive"
      });
    }
  };

  const handleOpenVideo = () => {
    window.open(videoUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('generated_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      onDelete(id);
      toast({
        title: "Video eliminado",
        description: "El video ha sido eliminado de tu biblioteca.",
      });
    } catch (error) {
      console.error('Error eliminando video:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el video. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card cyber-border rounded-xl hover:cyber-glow transition-all duration-300 group overflow-hidden">
      {/* Header con título, fecha y solo botón de basura */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <div className="flex items-center mb-2">
              <Video className="w-5 h-5 mr-2 text-primary flex-shrink-0" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight break-words">
                {getDisplayTitle()}
              </h3>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              {formatDate(createdAt)}
            </div>
          </div>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/30 mx-6"></div>

      {/* Script preview */}
      <div className="p-6 py-4">
        <div className="flex items-center mb-3">
          <FileText className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium text-foreground">Guion</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {truncateScript(script)}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border/30 mx-6"></div>

      {/* Footer con URL y botones principales */}
      <div className="p-6 pt-4">
        <div className="bg-muted/20 cyber-border rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <span className="text-xs text-muted-foreground block mb-1">URL del video:</span>
              <span className="text-foreground font-mono text-xs break-all">
                {videoUrl}
              </span>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="cyber-border hover:cyber-glow"
                disabled={copied}
              >
                {copied ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleOpenVideo}
                className="cyber-border hover:cyber-glow-intense"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
