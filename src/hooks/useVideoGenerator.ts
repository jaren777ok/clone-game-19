import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { sendToWebhook } from '@/lib/webhookUtils';
import { syncGenerationState } from '@/lib/databaseUtils';

const STORAGE_KEY = 'videoGeneration';
const CHECK_INTERVAL = 10000; // 10 seconds

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
  
  const { user } = useAuth();

  // Intelligent sync function - memoized to prevent recreation
  const performIntelligentSync = useCallback(async (savedState: VideoGenerationState) => {
    if (!user || !savedState.requestId || hasRecovered) return false;

    console.log('🔄 Iniciando sincronización inteligente...');
    
    try {
      const syncResult = await syncGenerationState(user, savedState.requestId, savedState.script);
      
      if (syncResult?.video_url) {
        console.log('✅ Video encontrado - sincronizando estado');
        
        // Update state
        setVideoUrl(syncResult.video_url);
        setIsGenerating(false);
        setShowRecovery(false);
        setHasRecovered(true);
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        toast.success('¡Video encontrado! Se ha sincronizado automáticamente.');
        return true;
      }
    } catch (error) {
      console.error('Error en sincronización inteligente:', error);
    }
    
    return false;
  }, [user, hasRecovered]);

  // Load saved state on mount - runs only once
  useEffect(() => {
    const loadSavedState = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      try {
        const savedState: VideoGenerationState = JSON.parse(saved);
        console.log('🔄 Estado guardado encontrado:', savedState);

        // Intelligent sync before showing recovery
        const wasSynced = await performIntelligentSync(savedState);
        
        if (!wasSynced) {
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
        }
      } catch (error) {
        console.error('Error loading saved state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadSavedState();
  }, []); // Empty dependency array - runs only once

  // Save state when it changes
  useEffect(() => {
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
  }, [isGenerating, requestId, script, videoUrl]);

  const generateVideo = async (inputScript: string) => {
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

    try {
      await sendToWebhook(inputScript.trim(), newRequestId, user.id);
      toast.success('Video enviado para generar. Te notificaremos cuando esté listo.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al enviar el video para generar');
      setIsGenerating(false);
      setRequestId('');
      setScript('');
    }
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setRequestId('');
    setScript('');
    setVideoUrl(null);
    setShowRecovery(false);
    setCountdown(0);
    setHasRecovered(false);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('Generación cancelada');
  };

  const recoverGeneration = () => {
    setShowRecovery(false);
    setCountdown(300);
    toast.info('Continuando con la generación...');
  };

  return {
    isGenerating,
    requestId,
    script,
    videoUrl,
    showRecovery,
    countdown,
    generateVideo,
    stopGeneration,
    recoverGeneration,
    setVideoUrl,
    setIsGenerating,
    setCountdown
  };
};
