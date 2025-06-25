
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface Props {
  hasExistingKeys: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorType?: string;
  retryable?: boolean;
  avatarCount?: number;
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
  const [retryable, setRetryable] = useState<boolean>(false);

  const validateApiKey = async (apiKey: string): Promise<ValidationResult> => {
    console.log('🔍 Iniciando validación directa de API key:', apiKey.substring(0, 10) + '...');
    
    try {
      const response = await supabase.functions.invoke('validate-heygen-key', {
        body: { apiKey }
      });

      console.log('📋 Respuesta de validación:', {
        error: response.error,
        data: response.data
      });

      if (response.error) {
        console.error('❌ Error en Edge Function:', response.error);
        return { 
          isValid: false, 
          error: 'Error de conexión al validar la clave API. Por favor intenta de nuevo.',
          retryable: true
        };
      }

      // La respuesta viene directamente en response.data
      const result = response.data;
      
      if (result?.isValid) {
        console.log('✅ Validación exitosa, avatares disponibles:', result.avatarCount || 'desconocido');
        return result;
      } else {
        console.log('❌ Validación falló:', result?.error);
        return result || { 
          isValid: false, 
          error: 'Error desconocido al validar la clave API.',
          retryable: true
        };
      }

    } catch (error) {
      console.error('💥 Error crítico en validación:', error);
      return { 
        isValid: false, 
        error: 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
        retryable: true
      };
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim() || !formData.apiKey.trim()) return;

    setLoading(true);
    setValidationStatus('validating');
    setValidationError('');
    setRetryable(false);

    try {
      console.log('🔐 Iniciando validación de API key...');
      
      // Validar la clave API usando la nueva Edge Function
      const validation = await validateApiKey(formData.apiKey);
      
      if (!validation.isValid) {
        setValidationStatus('error');
        setValidationError(validation.error || 'Error desconocido');
        setRetryable(validation.retryable || false);
        
        toast({
          title: validation.retryable ? "Error temporal" : "Clave API inválida",
          description: validation.error,
          variant: "destructive",
          action: validation.retryable ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSaveApiKey(e)}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
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
        description: `${formData.name} ha sido configurada y validada correctamente.${validation.avatarCount ? ` Se encontraron ${validation.avatarCount} avatares disponibles.` : ''}`,
        action: <CheckCircle2 className="w-4 h-4 text-green-500" />
      });

      setFormData({ name: '', apiKey: '' });
      onSuccess();

    } catch (error) {
      console.error('💥 Error guardando API key:', error);
      setValidationStatus('error');
      setValidationError('Error interno al guardar la clave API');
      setRetryable(true);
      
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

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'validating':
        return 'Validando clave API con HeyGen...';
      case 'success':
        return '¡Clave API validada correctamente! Tienes acceso a los recursos de HeyGen.';
      case 'error':
        return validationError;
      default:
        return '';
    }
  };

  return (
    <Card className="cyber-border">
      <CardHeader className="space-y-2 sm:space-y-3 pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight">
          {!hasExistingKeys ? "Configurar tu primera clave API" : "Agregar nueva clave API"}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base leading-relaxed">
          Ingresa los datos de tu clave API de HeyGen. La validaremos directamente con el servicio de HeyGen para asegurar que funcione correctamente.
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
            {validationStatus !== 'idle' && (
              <div className={`flex items-start gap-2 p-3 rounded-md text-sm ${
                validationStatus === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : validationStatus === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}>
                {validationStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : validationStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <Wifi className="w-4 h-4 mt-0.5 flex-shrink-0 animate-pulse" />
                )}
                <span>{getValidationMessage()}</span>
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
