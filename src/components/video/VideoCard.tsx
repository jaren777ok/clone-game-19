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

  const truncateScript = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getDisplayTitle = () => {
    if (title) return title;
    return `Video Generado`;
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
        {/* Book Layout: Video Left + Info Right */}
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Video Player (9:16 vertical) */}
          <div className="md:w-[200px] lg:w-[220px] flex-shrink-0 p-4">
            <div className="rounded-lg overflow-hidden cyber-border bg-black/50 h-full">
              <video
                src={videoUrl}
                controls
                className="w-full h-full object-cover"
                style={{ aspectRatio: '9/16' }}
                preload="metadata"
              />
            </div>
          </div>

          {/* Vertical Divider (visible on md+) */}
          <div className="hidden md:block w-px bg-border/30 my-4" />

          {/* Right Side - Info */}
          <div className="flex-1 flex flex-col p-4 md:pl-4">
            {/* Header: título + fecha + delete */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <div className="flex items-start mb-1">
                  <Video className="w-4 h-4 mr-2 text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-base font-semibold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight break-words">
                    {getDisplayTitle()}
                  </h3>
                </div>
                <div className="flex items-center text-muted-foreground text-xs mt-1">
                  <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                  {formatDate(createdAt)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30 my-3" />

            {/* Script Section - Collapsible */}
            <div className="flex-1">
              <Collapsible open={isScriptExpanded} onOpenChange={setIsScriptExpanded}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="w-3 h-3 mr-1.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">Guion</span>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 h-6 px-2">
                      {isScriptExpanded ? (
                        <>
                          <span className="text-xs mr-1">Colapsar</span>
                          <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          <span className="text-xs mr-1">Expandir</span>
                          <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                {/* Preview cuando está colapsado */}
                {!isScriptExpanded && (
                  <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                    {truncateScript(script, 80)}
                  </p>
                )}

                {/* Contenido completo cuando está expandido */}
                <CollapsibleContent>
                  <div className="bg-muted/30 rounded-lg p-3 cyber-border max-h-48 overflow-y-auto">
                    <p className="text-foreground text-xs whitespace-pre-wrap mb-3 leading-relaxed">
                      {script}
                    </p>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyScript}
                        className="cyber-border hover:cyber-glow h-7 text-xs"
                        disabled={copied}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30 my-3" />

            {/* Publicar en Redes */}
            <Button
              onClick={() => setShowSocialModal(true)}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold h-9 text-sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Publicar en Redes
            </Button>
          </div>
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
