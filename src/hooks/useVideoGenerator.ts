
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const initializationDone = useRef(false);
  const currentStateRef = useRef<VideoGenerationState | null>(null);

  // Single initialization effect - only runs once when user becomes available
  useEffect(() => {
    if (!user || initializationDone.current) return;
    
    initializationDone.current = true;
    console.log('🚀 Initializing video generator once for user:', user.id);

    // Load saved state synchronously to avoid additional effects
    const loadInitialState = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          console.log('No saved state found');
          return;
        }

        const savedState: VideoGenerationState = JSON.parse(saved);
        console.log('📂 Found saved state:', savedState);

        // Try to sync with database first
        if (savedState.requestId) {
          const syncResult = await syncGenerationState(user, savedState.requestId, savedState.script);
          
          if (syncResult?.video_url) {
            console.log('✅ Video found during initialization sync');
            setVideoUrl(syncResult.video_url);
            setScript(savedState.script);
            setRequestId(savedState.requestId);
            setIsGenerating(false);
            setShowRecovery(false);
            localStorage.removeItem(STORAGE_KEY);
            toast.success('¡Video encontrado! Se ha sincronizado automáticamente.');
            return;
          }
        }

        // If no sync result, restore saved state
        console.log('🔄 Restoring saved generation state');
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
        console.error('❌ Error loading saved state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    loadInitialState();
  }, [user?.id]); // Only depend on user ID

  // Separate effect for saving state - much simpler logic
  useEffect(() => {
    if (!initializationDone.current) return;

    // Create current state snapshot
    const currentState: VideoGenerationState = {
      isGenerating,
      requestId,
      script,
      videoUrl: videoUrl || undefined,
      startTime: Date.now()
    };

    // Only save if we're actually generating
    if (isGenerating && requestId && script) {
      console.log('💾 Saving generation state');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      currentStateRef.current = currentState;
    } else if (!isGenerating && currentStateRef.current) {
      console.log('🗑️ Clearing saved state');
      localStorage.removeItem(STORAGE_KEY);
      currentStateRef.current = null;
    }
  }, [isGenerating, requestId, script, videoUrl]);

  // Memoized handlers to prevent unnecessary re-renders
  const generateVideo = useCallback(async (inputScript: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para generar videos');
      return;
    }

    const newRequestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🎬 Starting video generation');
    
    // Update all generation state at once
    setIsGenerating(true);
    setRequestId(newRequestId);
    setScript(inputScript.trim());
    setVideoUrl(null);
    setShowRecovery(false);
    setCountdown(300);
    setError(null);

    try {
      await sendToWebhook(inputScript.trim(), newRequestId, user.id);
      toast.success('Video enviado para generar. Te notificaremos cuando esté listo.');
    } catch (error) {
      console.error('❌ Error generating video:', error);
      setError('Error al enviar el video para generar');
      toast.error('Error al enviar el video para generar');
      // Reset state on error
      setIsGenerating(false);
      setRequestId('');
      setScript('');
    }
  }, [user]);

  const stopGeneration = useCallback(() => {
    console.log('🛑 Stopping generation');
    setIsGenerating(false);
    setRequestId('');
    setScript('');
    setVideoUrl(null);
    setShowRecovery(false);
    setCountdown(0);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    currentStateRef.current = null;
    toast.info('Generación cancelada');
  }, []);

  const recoverGeneration = useCallback(() => {
    console.log('🔄 Recovering generation');
    setShowRecovery(false);
    setCountdown(300);
    toast.info('Continuando con la generación...');
  }, []);

  const handleNewVideo = useCallback(() => {
    console.log('📹 Starting new video');
    setVideoUrl(null);
    setScript('');
    setError(null);
  }, []);

  const handleGenerateVideo = useCallback(() => {
    if (script.trim()) {
      generateVideo(script.trim());
    }
  }, [script, generateVideo]);

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
      handleGenerateVideo,
      handleNewVideo,
      handleRecoverGeneration: recoverGeneration,
      handleCancelRecovery: stopGeneration
    }
  };
};
