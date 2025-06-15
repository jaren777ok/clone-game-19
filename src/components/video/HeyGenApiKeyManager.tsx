
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HeyGenApiKey } from '@/hooks/useVideoCreationFlow';

interface Props {
  apiKeys: HeyGenApiKey[];
  onSelectApiKey: (apiKey: HeyGenApiKey) => void;
  onRefreshKeys: () => void;
  onBack: () => void;
}

const HeyGenApiKeyManager: React.FC<Props> = ({ apiKeys, onSelectApiKey, onRefreshKeys, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Solo mostrar formulario automáticamente si NO hay claves API
    if (apiKeys.length === 0) {
      setShowAddForm(true);
    } else {
      // Si hay claves, no mostrar el formulario por defecto
      setShowAddForm(false);
    }
  }, [apiKeys.length]);

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || !formData.apiKey.trim()) return;

    setLoading(true);
    try {
      // Simple encriptación básica (en producción usar una librería más robusta)
      const encryptedKey = btoa(formData.apiKey);

      // Primero validar la clave API llamando a HeyGen
      const response = await supabase.functions.invoke('heygen-avatars', {
        body: { 
          apiKey: formData.apiKey,
          offset: 0,
          limit: 1
        }
      });

      if (response.error) {
        toast({
          title: "Clave API inválida",
          description: "La clave API proporcionada no es válida o no tiene acceso a HeyGen.",
          variant: "destructive"
        });
        return;
      }

      // Si la validación es exitosa, guardar en la base de datos
      const { error } = await supabase
        .from('heygen_api_keys')
        .insert({
          user_id: user.id,
          api_key_name: formData.name.trim(),
          api_key_encrypted: encryptedKey
        });

      if (error) throw error;

      toast({
        title: "Clave API guardada",
        description: "Tu clave API de HeyGen ha sido guardada exitosamente."
      });

      setFormData({ name: '', apiKey: '' });
      setShowAddForm(false);
      onRefreshKeys();
    } catch (error) {
      console.error('Error saving API key:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la clave API. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
            Volver al Dashboard
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              {apiKeys.length === 0 ? "Configurar HeyGen API" : "Seleccionar Clave API"}
            </h1>
            <p className="text-muted-foreground">
              {apiKeys.length === 0 
                ? "Agrega tu primera clave API de HeyGen para comenzar a crear videos"
                : "Selecciona una clave API existente o agrega una nueva"
              }
            </p>
          </div>

          {/* Lista de claves existentes */}
          {apiKeys.length > 0 && !showAddForm && (
            <div className="space-y-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Claves API Disponibles:</h2>
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="cyber-border hover:cyber-glow transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                          <Key className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{apiKey.api_key_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Creada el {new Date(apiKey.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => onSelectApiKey(apiKey)}
                          className="cyber-glow"
                        >
                          Continuar con esta clave
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Botón para agregar nueva clave */}
          {apiKeys.length > 0 && !showAddForm && (
            <Card className="cyber-border">
              <CardContent className="p-6">
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  className="w-full cyber-border hover:cyber-glow"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar nueva clave API
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Formulario para agregar clave */}
          {showAddForm && (
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>
                  {apiKeys.length === 0 ? "Configurar tu primera clave API" : "Agregar nueva clave API"}
                </CardTitle>
                <CardDescription>
                  Ingresa los datos de tu clave API de HeyGen. Puedes obtener tu clave en tu dashboard de HeyGen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveApiKey} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre de la clave</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Cuenta Principal, Cuenta Trabajo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiKey">Clave API de HeyGen</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Ingresa tu clave API de HeyGen"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 cyber-glow"
                    >
                      {loading ? 'Validando...' : 'Guardar y Continuar'}
                    </Button>
                    {apiKeys.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl"></div>
    </div>
  );
};

export default HeyGenApiKeyManager;
