
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
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
      const encryptedKey = btoa(formData.apiKey);

      // Validate API key with HeyGen
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

      // Save to database
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
    <div className="relative">
      {/* Gradient border wrapper */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/50 via-accent/30 to-primary/50 blur-[1px]" />
      
      {/* Main card */}
      <div className="relative rounded-2xl bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_40px_rgba(255,20,147,0.15)]">
        {/* Title */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            {!hasExistingKeys ? "Agregar Nueva Clave API" : "Agregar Nueva Clave API"}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Ingresa los datos de tu clave API de HeyGen. Puedes obtener tu clave en tu dashboard de HeyGen.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveApiKey} className="space-y-5 sm:space-y-6">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base text-foreground font-medium">
              Nombre de la clave
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Cuenta Principal, Clave de Trabajo, Proyecto X"
              required
              className="
                h-11 sm:h-12
                bg-background/50 
                border-muted-foreground/20
                focus:border-primary/50 
                focus:ring-primary/20
                focus:shadow-[0_0_15px_rgba(255,20,147,0.15)]
                transition-all duration-300
              "
            />
          </div>

          {/* API Key field */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm sm:text-base text-foreground font-medium">
              Clave API de HeyGen
            </Label>
            <PasswordInput
              id="apiKey"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Ingresa tu clave API de HeyGen aquí"
              required
              className="
                h-11 sm:h-12
                bg-background/50 
                border-muted-foreground/20
                focus:border-primary/50 
                focus:ring-primary/20
                focus:shadow-[0_0_15px_rgba(255,20,147,0.15)]
                transition-all duration-300
              "
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="
                flex-1
                bg-gradient-to-r from-primary to-accent 
                hover:from-primary/90 hover:to-accent/90
                text-background font-semibold
                shadow-[0_0_20px_rgba(255,20,147,0.3)]
                hover:shadow-[0_0_30px_rgba(255,20,147,0.5)]
                h-11 sm:h-12 
                text-sm sm:text-base
                transition-all duration-300
              "
            >
              {loading ? 'Validando...' : 'Guardar y Continuar'}
            </Button>
            
            {hasExistingKeys && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="
                  h-11 sm:h-12 
                  text-sm sm:text-base
                  border-muted-foreground/30
                  hover:border-primary/50
                  hover:bg-primary/5
                  transition-all duration-300
                "
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyForm;
