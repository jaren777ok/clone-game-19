
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { sendToWebhook } from '@/lib/webhookUtils';
import { syncGenerationState } from '@/lib/databaseUtils';

const STORAGE_KEY = 'videoGeneration';

interface VideoGenerationState {
  isGenerating: boolean;
  requestId: string;
  script: string;
  videoUrl?: string;
  startTime?: number;
}

export const useVideoGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [script, setScript] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasRecovered, setHasRecovered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  
  const { user } = useAuth();

  // Load saved state on mount - runs only once
  useEffect(() => {
    if (!user || hasLoadedInitialState) return;

    const loadSavedState = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setHasLoadedInitialState(true);
        return;
      }

      try {
        const savedState: VideoGenerationState = JSON.parse(saved);
        console.log('🔄 Estado guardado encontrado:', savedState);

        // Intelligent sync before showing recovery
        if (savedState.requestId) {
          const syncResult = await syncGenerationState(user, savedState.requestId, savedState.script);
          
          if (syncResult?.video_url) {
            console.log('✅ Video encontrado - sincronizando estado');
            setVideoUrl(syncResult.video_url);
            setIsGenerating(false);
            setShowRecovery(false);
            localStorage.removeItem(STORAGE_KEY);
            toast.success('¡Video encontrado! Se ha sincronizado automáticamente.');
            setHasLoadedInitialState(true);
            return;
          }
        }

        // If not synced, proceed with normal recovery
        setIsGenerating(savedState.isGenerating);
        setRequestId(savedState.requestId);
        setScript(savedState.script);
        setVideoUrl(savedState.videoUrl || null);
        
        if (savedState.isGenerating) {
          setShowRecovery(true);
          const elapsed = savedState.startTime ? Date.now() - savedState.startTime : 0;
          const remaining = Math.max(0, 300000 - elapsed);
          setCountdown(Math.ceil(remaining / 1000));
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
      
      setHasLoadedInitialState(true);
    };

    loadSavedState();
  }, [user?.id, hasLoadedInitialState]);

  // Save state when it changes - but only after initial load
  useEffect(() => {
    if (!hasLoadedInitialState) return;

    if (isGenerating && requestId && script) {
      const state: VideoGenerationState = {
        isGenerating,
        requestId,
        script,
        videoUrl: videoUrl || undefined,
        startTime: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else if (!isGenerating) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isGenerating, requestId, script, videoUrl, hasLoadedInitialState]);

  const generateVideo = useCallback(async (inputScript: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para generar videos');
      return;
    }

    const newRequestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setIsGenerating(true);
    setRequestId(newRequestId);
    setScript(inputScript.trim());
    setVideoUrl(null);
    setShowRecovery(false);
    setHasRecovered(false);
    setCountdown(300);
    setError(null);

    try {
      await sendToWebhook(inputScript.trim(), newRequestId, user.id);
      toast.success('Video enviado para generar. Te notificaremos cuando esté listo.');
    } catch (error) {
      console.error('Error:', error);
      setError('Error al enviar el video para generar');
      toast.error('Error al enviar el video para generar');
      setIsGenerating(false);
      setRequestId('');
      setScript('');
    }
  }, [user]);

  const stopGeneration = useCallback(() => {
    setIsGenerating(false);
    setRequestId('');
    setScript('');
    setVideoUrl(null);
    setShowRecovery(false);
    setCountdown(0);
    setHasRecovered(false);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Generación cancelada');
  }, []);

  const recoverGeneration = useCallback(() => {
    setShowRecovery(false);
    setCountdown(300);
    toast.info('Continuando con la generación...');
  }, []);

  const handleNewVideo = useCallback(() => {
    setVideoUrl(null);
    setScript('');
    setError(null);
  }, []);

  const handleGenerateVideo = useCallback(() => {
    if (script.trim()) {
      generateVideo(script.trim());
    }
  }, [script, generateVideo]);

  // Return state and handlers in the expected format
  return {
    state: {
      isGenerating,
      script,
      videoResult: videoUrl,
      showRecoveryOption: showRecovery,
      timeRemaining: countdown,
      totalTime: 300,
      isRecovering: false,
      error
    },
    handlers: {
      setScript: (newScript: string) => setScript(newScript),
      handleGenerateVideo, // Now this is a function that takes no parameters
      handleNewVideo,
      handleRecoverGeneration: recoverGeneration,
      handleCancelRecovery: stopGeneration
    }
  };
};
