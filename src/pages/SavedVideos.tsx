
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, Search, Loader2, Video, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/video/VideoCard';

interface SavedVideo {
  id: string;
  title?: string;
  script: string;
  video_url: string;
  created_at: string;
}

const SavedVideos = () => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<SavedVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, [user]);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm]);

  const fetchVideos = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVideos((data || []).map(video => ({
        id: video.id,
        title: video.title,
        script: video.title || '',
        video_url: video.video_url || '',
        created_at: video.created_at
      } as SavedVideo)));
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error al cargar videos",
        description: "No se pudieron cargar tus videos guardados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterVideos = () => {
    if (!searchTerm.trim()) {
      setFilteredVideos(videos);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = videos.filter(video => {
      const titleMatch = video.title?.toLowerCase().includes(searchLower);
      const scriptMatch = video.script.toLowerCase().includes(searchLower);
      return titleMatch || scriptMatch;
    });
    setFilteredVideos(filtered);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
  };

  const getSearchResultsText = () => {
    if (!searchTerm.trim()) {
      return `${videos.length} videos guardados`;
    }
    return `${filteredVideos.length} de ${videos.length} videos encontrados`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-background animate-spin" />
          </div>
          <p className="text-muted-foreground">Cargando tus videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      {/* Header */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/crear-video')}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Generador
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="cyber-border hover:cyber-glow"
          >
            Dashboard
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mr-4">
              <Bookmark className="w-8 h-8 text-background" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
              Videos Guardados
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Todos tus videos generados con IA en un solo lugar
          </p>
        </div>

        {/* Search and Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por título o guion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 cyber-border focus:cyber-glow"
              />
            </div>
            <div className="flex items-center text-muted-foreground">
              <Video className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {getSearchResultsText()}
              </span>
            </div>
          </div>

          {/* Search info */}
          {searchTerm.trim() && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">
              <div className="flex items-center text-sm">
                <Search className="w-4 h-4 mr-2 text-primary" />
                <span className="text-foreground">
                  Buscando: <strong>"{searchTerm}"</strong>
                </span>
                <span className="text-muted-foreground ml-2">
                  (en títulos y guiones)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Videos Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-muted-foreground" />
              </div>
              {videos.length === 0 ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Aún no tienes videos guardados
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Genera tu primer video con IA para verlo aquí
                  </p>
                  <Button
                    onClick={() => navigate('/crear-video')}
                    className="cyber-border hover:cyber-glow-intense"
                  >
                    Generar Video
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No se encontraron videos
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    No hay videos que coincidan con tu búsqueda: <strong>"{searchTerm}"</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                    className="cyber-border hover:cyber-glow"
                  >
                    Limpiar búsqueda
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  script={video.script}
                  videoUrl={video.video_url}
                  createdAt={video.created_at}
                  onDelete={handleDeleteVideo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        {videos.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-card/50 cyber-border rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  💡 Consejos para gestionar tus videos:
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground text-sm">
                <div className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Los títulos se generan automáticamente con IA basándose en tu guion
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Usa la búsqueda para encontrar videos por título o contenido
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Copia enlaces para compartir tus videos fácilmente
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  Los videos se ordenan por fecha de creación más reciente
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background geometric shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default SavedVideos;
