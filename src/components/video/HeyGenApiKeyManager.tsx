
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HeyGenApiKey } from '@/types/videoFlow';
import ApiKeyList from './ApiKeyList';
import ApiKeyForm from './ApiKeyForm';

const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk3MTYyNzQsImV4cCI6MTkyNzM5NjI3NH0.WY9BkeYyf8U0doTqKMBmXo0X_2pecKTwDy3tMN7VKHY';

interface Props {
  apiKeys: HeyGenApiKey[];
  onSelectApiKey: (apiKey: HeyGenApiKey) => void;
  onRefreshKeys: () => void;
  onBack: () => void;
}

const HeyGenApiKeyManager: React.FC<Props> = ({ 
  apiKeys, 
  onSelectApiKey, 
  onRefreshKeys, 
  onBack 
}) => {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (apiKeys.length === 0) {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }
  }, [apiKeys.length]);

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('heygen_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      toast({
        title: "Clave eliminada",
        description: "La clave API ha sido eliminada exitosamente."
      });

      onRefreshKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la clave API.",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    onRefreshKeys();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Video Background */}
      <video
        src={BACKGROUND_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/60" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow text-xs sm:text-sm px-3 sm:px-4"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Title and Subtitle */}
          <div className="text-center mb-10 sm:mb-12 space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Gestión de Claves API
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
              Administra tus claves API de HeyGen o agrega nuevas para potenciar tu creación.
            </p>
          </div>

          {/* Content */}
          <div className="px-2">
            {apiKeys.length > 0 && !showAddForm ? (
              <ApiKeyList
                apiKeys={apiKeys}
                onSelectApiKey={onSelectApiKey}
                onDeleteApiKey={handleDeleteApiKey}
                onShowAddForm={() => setShowAddForm(true)}
              />
            ) : (
              <ApiKeyForm
                hasExistingKeys={apiKeys.length > 0}
                onSuccess={handleFormSuccess}
                onCancel={apiKeys.length > 0 ? () => setShowAddForm(false) : undefined}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sistema Neural Activo Indicator */}
      <div className="fixed bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 text-primary animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,20,147,0.5)]" />
          <span className="text-xs sm:text-sm font-medium tracking-wider uppercase">
            Sistema Neural Activo
          </span>
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(255,20,147,0.5)]" />
        </div>
      </div>

      {/* Background geometric shapes */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default HeyGenApiKeyManager;
