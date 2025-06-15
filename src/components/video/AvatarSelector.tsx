import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, HeyGenApiKey } from '@/hooks/useVideoCreationFlow';

interface Props {
  selectedApiKey: HeyGenApiKey;
  onSelectAvatar: (avatar: Avatar) => void;
  onBack: () => void;
}

const AvatarSelector: React.FC<Props> = ({ selectedApiKey, onSelectAvatar, onBack }) => {
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [previouslySelectedAvatar, setPreviouslySelectedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    // Cargar selección previa del localStorage
    const savedState = localStorage.getItem('video_creation_flow');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.selectedAvatar) {
          setPreviouslySelectedAvatar(parsedState.selectedAvatar);
          setSelectedAvatarId(parsedState.selectedAvatar.avatar_id);
        }
      } catch (error) {
        console.error('Error parsing saved flow state:', error);
      }
    }
    
    loadAvatars(0, true);
  }, [selectedApiKey]);

  const loadAvatars = async (offset: number = 0, isInitial: boolean = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Desencriptar la clave API
      const decryptedKey = atob(selectedApiKey.api_key_encrypted);

      const { data, error } = await supabase.functions.invoke('heygen-avatars', {
        body: {
          apiKey: decryptedKey,
          offset,
          limit: 10
        }
      });

      if (error) throw error;

      if (isInitial) {
        setAvatars(data.avatars || []);
      } else {
        setAvatars(prev => [...prev, ...(data.avatars || [])]);
      }

      setHasMore(data.hasMore || false);
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los avatares. Verifica tu clave API.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadAvatars(avatars.length, false);
    }
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatarId(avatar.avatar_id);
    onSelectAvatar(avatar);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando avatares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar clave API
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Usando: {selectedApiKey.api_key_name}
          </div>
        </div>

        {/* Mostrar selección previa si existe */}
        {previouslySelectedAvatar && (
          <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="text-base sm:text-lg font-semibold">Selección anterior</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tienes <strong>{previouslySelectedAvatar.avatar_name}</strong> seleccionado previamente. 
                Puedes continuar con esta selección o elegir un avatar diferente.
              </p>
              <Button
                onClick={() => handleSelectAvatar(previouslySelectedAvatar)}
                className="cyber-glow text-sm"
                size="sm"
              >
                Continuar con {previouslySelectedAvatar.avatar_name}
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight px-4">
              Selecciona tu Avatar
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-3xl mx-auto px-4 leading-relaxed">
              Elige el avatar que representará tu contenido en el video
            </p>
          </div>

          {avatars.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No se encontraron avatares en tu cuenta de HeyGen.</p>
            </div>
          ) : (
            <>
              {/* Grid de avatares */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 px-2">
                {avatars.map((avatar) => (
                  <Card 
                    key={avatar.avatar_id}
                    className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-[1.02] ${
                      selectedAvatarId === avatar.avatar_id ? 'cyber-glow-intense' : ''
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="aspect-square mb-3 sm:mb-4 rounded-lg overflow-hidden bg-muted relative">
                        {selectedAvatarId === avatar.avatar_id && (
                          <div className="absolute top-2 right-2 z-10">
                            <CheckCircle2 className="w-5 h-5 text-primary bg-background rounded-full" />
                          </div>
                        )}
                        <img
                          src={avatar.preview_image_url}
                          alt={avatar.avatar_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-center mb-3 text-sm sm:text-base truncate">
                        {avatar.avatar_name}
                      </h3>
                      <Button
                        onClick={() => handleSelectAvatar(avatar)}
                        className="w-full cyber-glow text-xs sm:text-sm"
                        size="sm"
                        variant={selectedAvatarId === avatar.avatar_id ? "default" : "outline"}
                      >
                        {selectedAvatarId === avatar.avatar_id ? "Continuar" : "Elegir Avatar"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Botón cargar más */}
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="cyber-border hover:cyber-glow"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Más Avatars
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default AvatarSelector;
