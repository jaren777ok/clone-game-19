
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HeyGenApiKey } from '@/hooks/useVideoCreationFlow';
import ApiKeyList from './ApiKeyList';
import ApiKeyForm from './ApiKeyForm';

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
    // Solo mostrar formulario automáticamente si NO hay claves API
    if (apiKeys.length === 0) {
      setShowAddForm(true);
    } else {
      // Si hay claves, no mostrar el formulario por defecto
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
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Button
            variant="outline"
            onClick={onBack}
            className="cyber-border hover:cyber-glow text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight px-4">
              {apiKeys.length === 0 ? "Configurar HeyGen API" : "Seleccionar Clave API"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed">
              {apiKeys.length === 0 
                ? "Agrega tu primera clave API de HeyGen para comenzar a crear videos"
                : "Selecciona una clave API existente o agrega una nueva"
              }
            </p>
          </div>

          {/* Lista de claves existentes o formulario */}
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

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default HeyGenApiKeyManager;
