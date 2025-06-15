
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  hasExistingKeys: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

const ApiKeyForm: React.FC<Props> = ({ hasExistingKeys, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    apiKey: ''
  });
  const [loading, setLoading] = useState(false);

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
      onSuccess();
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

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle>
          {!hasExistingKeys ? "Configurar tu primera clave API" : "Agregar nueva clave API"}
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
            {hasExistingKeys && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyForm;
