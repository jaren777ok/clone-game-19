
import React, { useState } from 'react';
import { Send, Clock, Zap, X, AlertCircle, Lock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ManualUploadModal } from './ManualUploadModal';
import { FlowState, ApiVersionCustomization } from '@/types/videoFlow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ScriptFormProps {
  script: string;
  setScript: (script: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isGenerating: boolean;
  error: string | null;
  timeRemaining?: number;
  currentRequestId?: string | null;
  flowState?: FlowState;
  onGenerateWithFiles?: (
    images: File[], 
    videos: File[], 
    apiVersionCustomization: ApiVersionCustomization,
    flowState: FlowState,
    onProgress?: (current: number, total: number, type: 'image') => void
  ) => Promise<void>;
  onGenerateWithUrls?: (
    driveUrls: any,
    apiVersionCustomization: ApiVersionCustomization,
    flowState: FlowState
  ) => Promise<void>;
}

const ScriptForm = ({ 
  script, 
  setScript, 
  onSubmit, 
  onCancel, 
  isGenerating, 
  error, 
  timeRemaining,
  currentRequestId,
  flowState,
  onGenerateWithFiles,
  onGenerateWithUrls
}: ScriptFormProps) => {
  const [showManualModal, setShowManualModal] = useState(false);
  const [isSavingScript, setIsSavingScript] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Script initialization removed - now handled by VideoGeneratorFinal only once

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Check if this is manual style
  const isManualStyle = flowState?.selectedStyle?.id === 'style-5' || flowState?.selectedStyle?.id === 'style-6';

  // 🔍 DEBUG: Log flowState and subtitle customization
  console.log('🔍 DEBUG ScriptForm - flowState completo:', {
    flowState: flowState,
    selectedStyle: flowState?.selectedStyle,
    selectedStyleId: flowState?.selectedStyle?.id,
    isManualStyle: isManualStyle,
    hasSubtitleCustomization: !!flowState?.subtitleCustomization,
    subtitleCustomizationData: flowState?.subtitleCustomization,
    hasOnGenerateWithFiles: !!onGenerateWithFiles
  });

  const handleGenerateClick = () => {
    console.log('🔍 DEBUG handleGenerateClick - isManualStyle:', isManualStyle);
    
    if (isManualStyle) {
      console.log('🔍 DEBUG - Opening manual modal with flowState:', {
        hasSubtitleCustomization: !!flowState?.subtitleCustomization,
        subtitleData: flowState?.subtitleCustomization
      });
      setShowManualModal(true);
    } else {
      console.log('🔍 DEBUG - Calling onSubmit for regular style');
      onSubmit();
    }
  };

  const handleManualModalConfirm = async (
    images: File[], 
    videos: File[], 
    apiVersionCustomization: ApiVersionCustomization,
    onProgress?: (current: number, total: number, type: 'image') => void
  ) => {
    console.log('🔍 DEBUG - handleManualModalConfirm called with flowState:', {
      hasFlowState: !!flowState,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      styleId: flowState?.selectedStyle?.id
    });

    if (!flowState) {
      console.error('❌ ERROR - No flowState available for manual confirmation');
      return;
    }

    // Use different handlers based on style
    if (flowState?.selectedStyle?.id === 'style-6') {
      // For style-6, we would need the new handler (not implemented yet in this interface)
      // For now, fallback to regular handler
      if (onGenerateWithFiles) {
        await onGenerateWithFiles(images, videos, apiVersionCustomization, flowState, onProgress);
        setShowManualModal(false);
      }
    } else {
      // For style-5 (original manual)
      if (onGenerateWithFiles) {
        await onGenerateWithFiles(images, videos, apiVersionCustomization, flowState, onProgress);
        setShowManualModal(false);
      }
    }
  };

  const handleManualModalConfirmWithUrls = async (
    driveUrls: any,
    apiVersionCustomization: ApiVersionCustomization
  ) => {
    console.log('🔍 DEBUG - handleManualModalConfirmWithUrls called with flowState:', {
      hasFlowState: !!flowState,
      hasSubtitleCustomization: !!flowState?.subtitleCustomization,
      subtitleData: flowState?.subtitleCustomization,
      styleId: flowState?.selectedStyle?.id
    });

    if (!flowState) {
      console.error('❌ ERROR - No flowState available for manual confirmation with URLs');
      return;
    }

    // Use different handlers based on style
    if (flowState?.selectedStyle?.id === 'style-6') {
      // For style-6, we would need the new handler (not implemented yet in this interface)
      // For now, fallback to regular handler
      if (onGenerateWithUrls) {
        await onGenerateWithUrls(driveUrls, apiVersionCustomization, flowState);
        setShowManualModal(false);
      }
    } else {
      // For style-5 (original manual)
      if (onGenerateWithUrls) {
        await onGenerateWithUrls(driveUrls, apiVersionCustomization, flowState);
        setShowManualModal(false);
      }
    }
  };

  // Guardar el script editado en la base de datos
  const handleSaveScript = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para guardar cambios",
        variant: "destructive"
      });
      return;
    }
    
    setIsSavingScript(true);
    try {
      const { error } = await supabase
        .from('user_video_configs')
        .update({ 
          generated_script: script,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Guión guardado",
        description: "Tus cambios han sido guardados exitosamente"
      });
    } catch (error) {
      console.error('Error guardando script:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el guión",
        variant: "destructive"
      });
    } finally {
      setIsSavingScript(false);
    }
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
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="script" className="text-lg font-semibold text-foreground">
              Guión a Usar
            </label>
            
            {/* Botón de guardar */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveScript}
              disabled={isSavingScript || isGenerating}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingScript ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
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
            maxLength={955}
            disabled={isGenerating && timeRemaining !== undefined && timeRemaining > 0}
          />
          <div className="flex justify-end items-center mt-2">
            <span className="text-sm text-muted-foreground">
              {script.length}/955
            </span>
          </div>
        </div>

        {/* Los avisos de información del sistema fueron removidos para más espacio */}

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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGenerateClick}
                disabled={!script.trim() || isGenerating}
                size="lg"
                className="w-full cyber-border hover:cyber-glow-intense transition-all duration-300"
              >
                {isGenerating ? (
                  <Lock className="w-5 h-5 mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {isGenerating ? 'Video en Proceso...' : 'Generar Video'}
              </Button>
            </TooltipTrigger>
            {isGenerating && (
              <TooltipContent>
                <p>Espera a que termine la generación actual o cancélala para empezar una nueva</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Manual Upload Modal */}
        {isManualStyle && (
          <ManualUploadModal
            open={showManualModal}
            onClose={() => setShowManualModal(false)}
            script={script}
            flowState={flowState}
            selectedApiKey={flowState?.selectedApiKey}
            onConfirm={handleManualModalConfirm}
            onConfirmWithUrls={handleManualModalConfirmWithUrls}
          />
        )}
      </div>
    </div>
  );
};

export default ScriptForm;
