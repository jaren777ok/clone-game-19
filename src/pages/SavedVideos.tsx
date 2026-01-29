
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bookmark, Calendar, Loader2, Video, Sparkles, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoCard from '@/components/video/VideoCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, subMonths, isAfter, isBefore, parseISO } from 'date-fns';

interface SavedVideo {
  id: string;
  title?: string;
  script: string;
  video_url: string;
  created_at: string;
}

type DateFilterType = 'all' | 'week' | 'month' | 'three-months' | 'custom';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

const SavedVideos = () => {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<SavedVideo[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !hasFetched.current) {
      fetchVideos();
      hasFetched.current = true;
    }
  }, [user]);

  useEffect(() => {
    filterVideosByDate();
  }, [videos, dateFilter, customDateRange]);

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
        script: video.script || video.title || '',
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

  const filterVideosByDate = () => {
    if (dateFilter === 'all') {
      setFilteredVideos(videos);
      return;
    }

    const now = new Date();
    let startDate: Date;

    switch (dateFilter) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'three-months':
        startDate = subMonths(now, 3);
        break;
      case 'custom':
        if (!customDateRange.from) {
          setFilteredVideos(videos);
          return;
        }
        const filtered = videos.filter(video => {
          const videoDate = parseISO(video.created_at);
          const afterStart = customDateRange.from ? isAfter(videoDate, customDateRange.from) || videoDate.toDateString() === customDateRange.from.toDateString() : true;
          const beforeEnd = customDateRange.to ? isBefore(videoDate, customDateRange.to) || videoDate.toDateString() === customDateRange.to.toDateString() : true;
          return afterStart && beforeEnd;
        });
        setFilteredVideos(filtered);
        return;
      default:
        setFilteredVideos(videos);
        return;
    }

    const filtered = videos.filter(video => {
      const videoDate = parseISO(video.created_at);
      return isAfter(videoDate, startDate) || videoDate.toDateString() === startDate.toDateString();
    });
    setFilteredVideos(filtered);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
  };

  const getDateFilterText = () => {
    if (dateFilter === 'all') {
      return `${videos.length} videos guardados`;
    }
    return `${filteredVideos.length} de ${videos.length} videos filtrados`;
  };

  const getFilterDescription = () => {
    switch (dateFilter) {
      case 'week': return 'Últimos 7 días';
      case 'month': return 'Último mes'; 
      case 'three-months': return 'Últimos 3 meses';
      case 'custom': 
        if (!customDateRange.from) return 'Rango personalizado';
        if (!customDateRange.to) return `desde ${format(customDateRange.from, 'dd/MM/yyyy')}`;
        return `${format(customDateRange.from, 'dd/MM/yyyy')} - ${format(customDateRange.to, 'dd/MM/yyyy')}`;
      default: return 'Todos los videos';
    }
  };

  const resetDateFilter = () => {
    setDateFilter('all');
    setCustomDateRange({ from: undefined, to: undefined });
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
        <div className="flex items-center mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
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

        {/* Date Filter and Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Select value={dateFilter} onValueChange={(value: DateFilterType) => setDateFilter(value)}>
                <SelectTrigger className="w-48 cyber-border focus:cyber-glow">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por fecha" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="all">Todos los videos</SelectItem>
                  <SelectItem value="week">Últimos 7 días</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="three-months">Últimos 3 meses</SelectItem>
                  <SelectItem value="custom">Rango personalizado</SelectItem>
                </SelectContent>
              </Select>

              {dateFilter === 'custom' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="cyber-border hover:cyber-glow">
                      <Calendar className="w-4 h-4 mr-2" />
                      {customDateRange.from ? (
                        customDateRange.to ? (
                          `${format(customDateRange.from, 'dd/MM')} - ${format(customDateRange.to, 'dd/MM')}`
                        ) : (
                          format(customDateRange.from, 'dd/MM/yyyy')
                        )
                      ) : (
                        'Seleccionar fechas'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border border-border" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={customDateRange.from}
                      selected={customDateRange}
                      onSelect={(range) => setCustomDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}

              {dateFilter !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetDateFilter}
                  className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Video className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {getDateFilterText()}
              </span>
            </div>
          </div>

          {/* Filter info */}
          {dateFilter !== 'all' && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6">
              <div className="flex items-center text-sm">
                <Filter className="w-4 h-4 mr-2 text-primary" />
                <span className="text-foreground">
                  Filtro activo: <strong>{getFilterDescription()}</strong>
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
                    No hay videos en el período seleccionado: <strong>{getFilterDescription()}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={resetDateFilter}
                    className="cyber-border hover:cyber-glow"
                  >
                    Ver todos los videos
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
                  Usa los filtros de fecha para encontrar videos por período de creación
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
