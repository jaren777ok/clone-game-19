
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import VideoGeneratorHeader from '@/components/video/VideoGeneratorHeader';
import VideoProcessingState from '@/components/video/VideoProcessingState';
import VideoResult from '@/components/video/VideoResult';
import GeneratorConfigSummary from '@/components/video/GeneratorConfigSummary';
import { useVideoGenerator } from '@/hooks/useVideoGenerator';
import RecoveryNotification from '@/components/video/RecoveryNotification';
import ScriptForm from '@/components/video/ScriptForm';
import { useVideoCreationFlow } from '@/hooks/useVideoCreationFlow';
import { useAuth } from '@/hooks/useAuth';
import { FlowState } from '@/types/videoFlow';
import { clearFlowState } from '@/utils/videoFlowUtils';
import { supabase } from '@/integrations/supabase/client';
import { saveVideoConfigImmediate } from '@/lib/videoConfigDatabase';

const BACKGROUND_VIDEO_URL = 'https://jbunbmphadxmzjokwgkw.supabase.co/storage/v1/object/sign/fotos/fondonormal.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zNGY4MzVlOS03N2Y3LTRiMWQtOWE0MS03NTVhYzYxNTM3NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmb3Rvcy9mb25kb25vcm1hbC5tcDQiLCJpYXQiOjE3Njk3NDM5NjMsImV4cCI6MTkyNzQyMzk2M30.-sG2JGy680IiMtGAn_Ae96N2sM_Rkw0rDHxZYWrnRc4';

const VideoGeneratorFinal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { flowState: currentFlowState, goToStep } = useVideoCreationFlow();
  const [effectiveFlowState, setEffectiveFlowState] = useState<FlowState | null>(null);
  const [isScriptInitialized, setIsScriptInitialized] = useState(false);
  const { state, handlers } = useVideoGenerator({ flowState: effectiveFlowState });

  // Determinar el estado efectivo del flujo
  useEffect(() => {
    const navigationState = location.state as FlowState | undefined;
    
    console.log('🐛 DEBUG VideoGeneratorFinal - Navigation state:', {
      navigationState: navigationState,
      selectedStyle: navigationState?.selectedStyle,
      selectedStyleId: navigationState?.selectedStyle?.id
    });
    
    if (navigationState && navigationState.selectedApiKey && navigationState.selectedAvatar && 
        navigationState.selectedVoice && navigationState.selectedStyle) {
      console.log('✅ Usando estado de navegación:', {
        step: navigationState.step,
        hasScript: !!navigationState.generatedScript,
        selectedStyleId: navigationState.selectedStyle.id
      });
      setEffectiveFlowState(navigationState);
      return;
    }

    console.log('🐛 DEBUG VideoGeneratorFinal - Current flow state:', {
      currentFlowState: currentFlowState,
      selectedStyle: currentFlowState?.selectedStyle,
      selectedStyleId: currentFlowState?.selectedStyle?.id
    });
    
    if (currentFlowState && currentFlowState.selectedApiKey && currentFlowState.selectedAvatar && 
        currentFlowState.selectedVoice && currentFlowState.selectedStyle) {
      console.log('✅ Usando estado actual del hook:', {
        step: currentFlowState.step,
        hasScript: !!currentFlowState.generatedScript,
        selectedStyleId: currentFlowState.selectedStyle.id
      });
      setEffectiveFlowState(currentFlowState);
      return;
    }

    console.log('❌ No hay configuración válida, redirigiendo al flujo');
    navigate('/crear-video');
  }, [location.state, currentFlowState, navigate]);

  // Script handling: cargar UNA SOLA VEZ al inicializar
  useEffect(() => {
    if (isScriptInitialized) return;
    
    const initializeScript = async () => {
      try {
        let scriptToUse = '';
        
        if (effectiveFlowState?.generatedScript) {
          scriptToUse = effectiveFlowState.generatedScript;
          console.log('📝 Script cargado desde estado de navegación:', {
            scriptLength: scriptToUse.length,
            scriptPreview: scriptToUse.substring(0, 100) + '...'
          });
        }
        
        if (!scriptToUse && user) {
          console.log('🔍 Script no encontrado en estado, intentando recuperar desde BD...');
          try {
            const { data } = await supabase
              .from('user_video_configs')
              .select('generated_script')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (data?.generated_script) {
              scriptToUse = data.generated_script;
              console.log('📝 Script recuperado desde la base de datos:', {
                scriptLength: scriptToUse.length,
                scriptPreview: scriptToUse.substring(0, 100) + '...'
              });
            }
          } catch (error) {
            console.error('❌ Error recuperando script desde BD:', error);
          }
        }
        
        if (scriptToUse) {
          handlers.setScript(scriptToUse);
          setIsScriptInitialized(true);
          console.log('✅ Script aplicado exitosamente y marcado como inicializado');
        } else {
          console.warn('⚠️ No se encontró script ni en estado ni en BD');
          setIsScriptInitialized(true);
        }
        
      } catch (error) {
        console.error('❌ Error inicializando script:', error);
        setIsScriptInitialized(true);
      }
    };

    if (effectiveFlowState && effectiveFlowState.step !== 'loading') {
      initializeScript();
    }
  }, [effectiveFlowState, user, isScriptInitialized, handlers]);
  
  // Detectar refresh y limpiar configuración automáticamente
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && !state.isGenerating) {
        void supabase
          .from('user_video_configs')
          .delete()
          .eq('user_id', user.id);
        console.log('🧹 Limpieza programada en beforeunload');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, state.isGenerating]);

  const handleBack = () => {
    // Navegación directa con estado - sin depender de la BD
    // Mismo patrón que usa handleProceedToGenerator en VideoCreationFlow
    const backState: FlowState = {
      ...effectiveFlowState!,
      step: 'subtitle-customization'
    };
    
    console.log('⬅️ Navegando a subtítulos con estado directo:', {
      step: backState.step,
      hasApiKey: !!backState.selectedApiKey,
      hasStyle: !!backState.selectedStyle,
      hasAvatar: !!backState.selectedAvatar,
      hasVoice: !!backState.selectedVoice
    });
    
    navigate('/crear-video', { 
      state: backState,
      replace: false 
    });
  };

  const handleVideoGenerated = async () => {
    if (user) {
      console.log('🎉 Video generado exitosamente, limpiando configuración');
      await clearFlowState(user);
    }
  };

  useEffect(() => {
    if (state.videoResult) {
      handleVideoGenerated();
    }
  }, [state.videoResult]);

  console.log('🐛 DEBUG VideoGeneratorFinal - Effective flow state:', {
    effectiveFlowState: effectiveFlowState,
    selectedStyle: effectiveFlowState?.selectedStyle,
    selectedStyleId: effectiveFlowState?.selectedStyle?.id,
    hasHandleGenerateVideoWithFiles: !!handlers.handleGenerateVideoWithFiles
  });

  // Loading state
  if (!effectiveFlowState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center cyber-glow mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-background rounded"></div>
          </div>
          <p className="text-muted-foreground">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  // Processing state
  if (state.isGenerating) {
    return (
      <VideoProcessingState 
        timeRemaining={state.timeRemaining}
        totalTime={state.totalTime}
        isRecovering={state.isRecovering}
        onManualCheck={handlers.checkVideoManually}
        debugInfo={state.debugInfo}
        canCheckVideo={state.canCheckVideo}
        isChecking={state.isChecking}
        timeUntilButton={state.timeUntilButton}
      />
    );
  }

  // Video result state
  if (state.videoResult) {
    return (
      <VideoResult 
        videoUrl={state.videoResult} 
        onNewVideo={handlers.handleNewVideo}
      />
    );
  }

  // Main generator view with two-panel layout
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Video de fondo animado */}
      <video
        src={BACKGROUND_VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        autoPlay
        muted
        loop
        playsInline
      />
      
      {/* Overlay para legibilidad */}
      <div className="absolute inset-0 bg-background/50" />
      
      {/* Gradient overlays decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />

      {/* Contenido Principal - Layout de dos paneles */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        
        {/* Panel Izquierdo (35%) - Resumen de Configuración */}
        <div className="w-full lg:w-[35%] lg:min-w-[380px] lg:max-w-[480px] border-b lg:border-b-0 lg:border-r border-border/30 p-6 overflow-y-auto bg-card/20 backdrop-blur-sm">
          {/* Botón Atrás */}
          <VideoGeneratorHeader onBack={handleBack} />
          
          {/* Resumen de Configuración */}
          <GeneratorConfigSummary flowState={effectiveFlowState} />
        </div>
        
        {/* Panel Derecho (65%) - Editor de Script */}
        <div className="flex-1 flex flex-col p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full">
            {/* Recovery Notification */}
            {state.showRecoveryOption && (
              <RecoveryNotification 
                onRecover={handlers.handleRecoverGeneration}
                onCancel={handlers.handleCancelRecovery}
                timeRemaining={state.timeRemaining}
              />
            )}

            {/* Header del Editor */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-glow-text">
                Generador de Videos IA
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Tu guión ha sido generado con NeuroCopy GPT. Puedes editarlo si deseas antes de crear tu video.
              </p>
            </div>

            {/* Script Form */}
            <ScriptForm 
              script={state.script}
              setScript={handlers.setScript}
              onSubmit={handlers.handleGenerateVideo}
              onCancel={handlers.handleCancelGeneration}
              isGenerating={state.isGenerating}
              error={state.error}
              timeRemaining={state.timeRemaining}
              currentRequestId={state.currentRequestId}
              flowState={effectiveFlowState}
              onGenerateWithFiles={handlers.handleGenerateVideoWithFiles}
              onGenerateWithUrls={handlers.handleGenerateVideoWithUrls}
            />
          </div>
        </div>
      </div>

      {/* Indicador SISTEMA NEURAL ACTIVO */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 text-primary animate-pulse bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm font-medium tracking-wider">SISTEMA NEURAL ACTIVO</span>
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorFinal;
