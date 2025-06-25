
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Wifi, WifiOff } from 'lucide-react';

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
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string>('');

  const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean; error?: string; isRetryable?: boolean }> => {
    console.log('🔍 Validando API key:', apiKey.substring(0, 10) + '...');
    
    try {
      const response = await supabase.functions.invoke('heygen-avatars', {
        body: { 
          apiKey: apiKey,
          offset: 0,
          limit: 1
        }
      });

      console.log('📋 Respuesta de validación:', {
        error: response.error,
        data: response.data,
        hasAvatars: response.data?.avatars?.length > 0
      });

      if (response.error) {
        console.error('❌ Error en validación:', response.error);
        return { 
          isValid: false, 
          error: 'Error de conexión al validar la clave API. Por favor intenta de nuevo.',
          isRetryable: true
        };
      }

      // Verificar si la respuesta indica un error específico
      if (response.data?.error) {
        const errorData = response.data;
        console.error('❌ Error específico:', errorData);
        
        if (errorData.error.includes('Invalid API key') || errorData.error.includes('insufficient permissions')) {
          return { 
            isValid: false, 
            error: 'La clave API no es válida o no tiene los permisos necesarios para acceder a HeyGen.',
            isRetryable: false
          };
        } else if (errorData.error.includes('temporarily unavailable') || errorData.retryable) {
          return { 
            isValid: false, 
            error: 'El servicio de HeyGen está temporalmente no disponible. Por favor intenta en unos momentos.',
            isRetryable: true
          };
        } else {
          return { 
            isValid: false, 
            error: errorData.details || 'Error desconocido al validar la clave API.',
            isRetryable: errorData.retryable || false
          };
        }
      }

      // Si llegamos aquí y tenemos datos, la validación fue exitosa
      const hasValidData = response.data && (
        response.data.avatars !== undefined || 
        response.data.total !== undefined
      );

      if (hasValidData) {
        console.log('✅ Validación exitosa, avatares disponibles:', response.data.total || response.data.avatars?.length || 0);
        return { isValid: true };
      } else {
        console.warn('⚠️ Respuesta inesperada de la API');
        return { 
          isValid: false, 
          error: 'Respuesta inesperada del servicio. Por favor verifica tu clave API.',
          isRetryable: true
        };
      }

    } catch (error) {
      console.error('💥 Error crítico en validación:', error);
      return { 
        isValid: false, 
        error: 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
        isRetryable: true
      };
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || !formData.apiKey.trim()) return;

    setLoading(true);
    setValidationStatus('validating');
    setValidationError('');

    try {
      console.log('🔐 Iniciando validación de API key...');
      
      // Validar la clave API
      const validation = await validateApiKey(formData.apiKey);
      
      if (!validation.isValid) {
        setValidationStatus('error');
        setValidationError(validation.error || 'Error desconocido');
        
        toast({
          title: validation.isRetryable ? "Error temporal" : "Clave API inválida",
          description: validation.error,
          variant: "destructive",
          action: validation.isRetryable ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSaveApiKey(e)}
            >
              Reintentar
            </Button>
          ) : undefined
        });
        return;
      }

      setValidationStatus('success');
      console.log('✅ API key válida, guardando en base de datos...');

      // Simple encriptación básica (en producción usar una librería más robusta)
      const encryptedKey = btoa(formData.apiKey);

      // Guardar en la base de datos
      const { error } = await supabase
        .from('heygen_api_keys')
        .insert({
          user_id: user.id,
          api_key_name: formData.name.trim(),
          api_key_encrypted: encryptedKey
        });

      if (error) throw error;

      toast({
        title: "¡Clave API guardada exitosamente!",
        description: `${formData.name} ha sido configurada y validada correctamente.`,
        action: <CheckCircle2 className="w-4 h-4 text-green-500" />
      });

      setFormData({ name: '', apiKey: '' });
      onSuccess();

    } catch (error) {
      console.error('💥 Error guardando API key:', error);
      setValidationStatus('error');
      setValidationError('Error interno al guardar la clave API');
      
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la clave API. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Wifi className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="cyber-border">
      <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight">
          {!hasExistingKeys ? "Configurar tu primera clave API" : "Agregar nueva clave API"}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base leading-relaxed">
          Ingresa los datos de tu clave API de HeyGen. La validaremos automáticamente para asegurar que funcione correctamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveApiKey} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">Nombre de la clave</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Cuenta Principal, Cuenta Trabajo"
              required
              className="h-10 sm:h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm sm:text-base flex items-center gap-2">
              Clave API de HeyGen
              {getValidationIcon()}
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Ingresa tu clave API de HeyGen"
              required
              className="h-10 sm:h-11"
            />
            {validationStatus === 'error' && validationError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
            {validationStatus === 'success' && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>¡Clave API validada correctamente! Tienes acceso a los recursos de HeyGen.</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 cyber-glow h-10 sm:h-11 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <Wifi className="w-4 h-4 mr-2 animate-pulse" />
                  {validationStatus === 'validating' ? 'Validando...' : 'Guardando...'}
                </>
              ) : (
                'Validar y Guardar'
              )}
            </Button>
            {hasExistingKeys && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="h-10 sm:h-11 text-sm sm:text-base"
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
