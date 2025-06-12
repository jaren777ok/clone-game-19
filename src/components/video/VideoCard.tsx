
import React, { useState } from 'react';
import { Copy, ExternalLink, Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoCardProps {
  id: string;
  script: string;
  videoUrl: string;
  createdAt: string;
  onDelete: (id: string) => void;
}

const VideoCard = ({ id, script, videoUrl, createdAt, onDelete }: VideoCardProps) => {
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

  const truncateScript = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    <div className="bg-card cyber-border rounded-xl p-6 hover:cyber-glow transition-all duration-300 group">
      {/* Header con fecha */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-muted-foreground text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(createdAt)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={copied}
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenVideo}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Script preview */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <FileText className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium text-foreground">Guion</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {truncateScript(script)}
        </p>
      </div>

      {/* URL preview */}
      <div className="bg-muted/30 cyber-border rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground font-mono text-xs break-all flex-1 mr-2">
            {videoUrl}
          </span>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="cyber-border hover:cyber-glow flex-shrink-0"
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
              className="cyber-border hover:cyber-glow-intense flex-shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
