
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
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

  useEffect(() => {
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
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cambiar clave API
          </Button>
          <div className="text-sm text-muted-foreground">
            Usando: {selectedApiKey.api_key_name}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Selecciona tu Avatar
            </h1>
            <p className="text-muted-foreground">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {avatars.map((avatar) => (
                  <Card 
                    key={avatar.avatar_id}
                    className={`cyber-border hover:cyber-glow transition-all cursor-pointer transform hover:scale-105 ${
                      selectedAvatarId === avatar.avatar_id ? 'cyber-glow-intense' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-muted">
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
                      <h3 className="font-semibold text-center mb-3 truncate">
                        {avatar.avatar_name}
                      </h3>
                      <Button
                        onClick={() => handleSelectAvatar(avatar)}
                        className="w-full cyber-glow"
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
