import React, { useState } from 'react';
import { Copy, Trash2, Calendar, FileText, CheckCircle, Video, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import SocialPublishModal from '@/components/social/SocialPublishModal';

interface VideoCardProps {
  id: string;
  title?: string;
  script: string;
  videoUrl: string;
  createdAt: string;
  onDelete: (id: string) => void;
}

const VideoCard = ({ id, title, script, videoUrl, createdAt, onDelete }: VideoCardProps) => {
  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
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

  const getDisplayTitle = () => {
    if (title) return title;
    return `Video Generado - ${formatDate(createdAt)}`;
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast({
        title: "¡Guion copiado!",
        description: "El guion ha sido copiado al portapapeles.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el guion.",
        variant: "destructive"
      });
    }
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
    <>
      <div className="bg-card/80 backdrop-blur-sm cyber-border rounded-xl hover:cyber-glow transition-all duration-300 group overflow-hidden">
        {/* Header: título + fecha + delete */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-4">
              <div className="flex items-center mb-1">
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
        <div className="border-t border-border/30 mx-5" />

        {/* Video Player */}
        <div className="p-5">
          <div className="rounded-lg overflow-hidden cyber-border bg-black/50">
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video"
              preload="metadata"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30 mx-5" />

        {/* Script Section - Collapsible */}
        <div className="p-5">
          <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-foreground">Guion</span>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  {isScriptExpanded ? (
                    <>
                      <span className="text-xs mr-1">Colapsar</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs mr-1">Expandir</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            {/* Preview cuando está colapsado */}
            {!isScriptExpanded && (
              <p className="text-muted-foreground text-sm line-clamp-2">
                {truncateScript(script, 100)}
              </p>
            )}

            {/* Contenido completo cuando está expandido */}
            <CollapsibleContent>
              <div className="bg-muted/30 rounded-lg p-4 cyber-border">
                <p className="text-foreground text-sm whitespace-pre-wrap mb-4 leading-relaxed">
                  {script}
                </p>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyScript}
                    className="cyber-border hover:cyber-glow"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Guion
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Divider */}
        <div className="border-t border-border/30 mx-5" />

        {/* Publicar en Redes */}
        <div className="p-5">
          <Button
            onClick={() => setShowSocialModal(true)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Publicar en Redes
          </Button>
        </div>
      </div>

      {/* Modal de redes sociales */}
      <SocialPublishModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        videoUrl={videoUrl}
        videoTitle={getDisplayTitle()}
        videoScript={script}
      />
    </>
  );
};

export default VideoCard;
