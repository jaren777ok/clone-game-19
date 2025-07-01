
import React from 'react';
import { Send, Clock, Zap, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ScriptFormProps {
  script: string;
  setScript: (script: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isGenerating: boolean;
  error: string | null;
  timeRemaining?: number;
  currentRequestId?: string | null;
}

const ScriptForm = ({ 
  script, 
  setScript, 
  onSubmit, 
  onCancel, 
  isGenerating, 
  error, 
  timeRemaining,
  currentRequestId 
}: ScriptFormProps) => {
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card cyber-border rounded-2xl p-8 hover:cyber-glow transition-all duration-500 mb-8">
      <div className="space-y-6">
        {/* Estado de generación activa */}
        {isGenerating && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-amber-300 text-sm font-medium mb-1">
                    Video en generación
                  </p>
                  <p className="text-muted-foreground text-sm mb-2">
                    Tu video se está procesando. Tiempo restante estimado:{' '}
                    <span className="font-mono text-amber-400">
                      {timeRemaining ? formatTimeRemaining(timeRemaining) : 'calculando...'}
                    </span>
                  </p>
                  {currentRequestId && (
                    <p className="text-xs text-muted-foreground">
                      ID: {currentRequestId.substring(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 hover:bg-amber-500/10 text-amber-400"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="script" className="block text-lg font-semibold text-foreground mb-3">
            Guión a Usar
          </label>
          <Textarea
            id="script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder={
              isGenerating 
                ? "Espera a que termine la generación actual o cancela para editar..."
                : "Aquí aparecerá tu guión generado que puedes editar antes de crear el video..."
            }
            className="min-h-[400px] text-base cyber-border focus:cyber-glow resize-none"
            maxLength={1400}
            disabled={isGenerating}
          />
          <div className="flex justify-end items-center mt-2">
            <span className="text-sm text-muted-foreground">
              {script.length}/1400
            </span>
          </div>
        </div>

        {/* Información del sistema - solo mostrar si no está generando */}
        {!isGenerating && (
          <>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-300 text-sm font-medium mb-1">
                    Respuesta inmediata mejorada
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Tu solicitud se procesa al instante y el sistema verifica automáticamente 
                    cuando tu video esté listo (máximo 39 minutos).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">
                    Monitoreo inteligente continuo
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Verificación automática cada 3 minutos. Tu video puede estar listo 
                    mucho antes del tiempo máximo estimado.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Advertencia si intenta generar mientras hay uno en proceso */}
        {isGenerating && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-300 text-sm font-medium mb-1">
                  No se pueden generar videos en paralelo
                </p>
                <p className="text-muted-foreground text-sm">
                  Espera a que termine la generación actual o cancélala para empezar una nueva. 
                  Esto evita conflictos y asegura la mejor calidad.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={!script.trim() || isGenerating}
          size="lg"
          className="w-full cyber-border hover:cyber-glow-intense transition-all duration-300"
        >
          <Send className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generando Video...' : 'Generar Video'}
        </Button>
      </div>
    </div>
  );
};

export default ScriptForm;
