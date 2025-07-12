import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  getCurrentProcessingVideo,
  createVideoGenerationTracking,
  markVideoGenerationCompleted,
  VideoGenerationTrackingData,
  updateLastCheckTime,
  markVideoGenerationExpired,
  calculateRemainingTime,
  cleanupExpiredGenerations
} from '@/lib/videoGenerationDatabase';
import { checkVideoInDatabase } from '@/lib/databaseUtils';

export interface UseVideoGenerationDatabaseReturn {
  currentGeneration: VideoGenerationTrackingData | null;
  timeRemaining: number;
  showRecoveryOption: boolean;
  isRecovering: boolean;
  isLoading: boolean;
  handleStartGeneration: (script: string, requestId: string) => Promise<boolean>;
  handleRecoverGeneration: (
    setScript: (script: string) => void,
    setCurrentRequestId: (id: string) => void,
    setIsGenerating: (generating: boolean) => void,
    setVideoResult: (result: string) => void,
    startCountdown: (requestId: string, script: string, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void, startTime?: number) => void
  ) => Promise<void>;
  handleCancelRecovery: () => void;
  handleVideoCompleted: (requestId: string) => Promise<void>;
  handleVideoExpired: (requestId: string) => Promise<void>;
  refreshCurrentGeneration: () => Promise<void>;
}

export const useVideoGenerationDatabase = (): UseVideoGenerationDatabaseReturn => {
  const { user } = useAuth();
  const [currentGeneration, setCurrentGeneration] = useState<VideoGenerationTrackingData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load current generation on mount and user change
  const refreshCurrentGeneration = useCallback(async () => {
    if (!user) {
      setCurrentGeneration(null);
      setTimeRemaining(0);
      setShowRecoveryOption(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get current processing video first
      const generation = await getCurrentProcessingVideo(user);
      setCurrentGeneration(generation);

      if (generation && generation.status === 'processing') {
        // Calculate remaining time
        const remaining = calculateRemainingTime(generation.start_time);
        setTimeRemaining(remaining);
        
        // Show recovery option if there's time remaining
        if (remaining > 0) {
          setShowRecoveryOption(true);
          // Update last check time
          await updateLastCheckTime(generation.request_id, user);
        } else {
          // Mark as expired if time is up
          await markVideoGenerationExpired(generation.request_id, user);
          setCurrentGeneration(null);
          setShowRecoveryOption(false);
        }
      } else {
        setTimeRemaining(0);
        setShowRecoveryOption(false);
      }
    } catch (error) {
      console.error('Error refreshing current generation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCurrentGeneration();
  }, [refreshCurrentGeneration]);

  // Run cleanup once on mount to handle any truly expired generations
  useEffect(() => {
    if (user) {
      const runInitialCleanup = async () => {
        try {
          await cleanupExpiredGenerations(user);
        } catch (error) {
          console.error('Error in initial cleanup:', error);
        }
      };
      runInitialCleanup();
    }
  }, [user]); // Only run when user changes

  // Update time remaining every second when there's an active generation
  useEffect(() => {
    if (!currentGeneration || currentGeneration.status !== 'processing') {
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime(currentGeneration.start_time);
      setTimeRemaining(remaining);
      
      // Auto-expire if time is up
      if (remaining <= 0) {
        handleVideoExpired(currentGeneration.request_id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGeneration]);

  // Start a new video generation
  const handleStartGeneration = useCallback(async (script: string, requestId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const generation = await createVideoGenerationTracking(script, requestId, user);
      if (generation) {
        setCurrentGeneration(generation);
        setTimeRemaining(39 * 60); // 39 minutes
        setShowRecoveryOption(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting generation:', error);
      return false;
    }
  }, [user]);

  // Recover an existing generation
  const handleRecoverGeneration = useCallback(async (
    setScript: (script: string) => void,
    setCurrentRequestId: (id: string) => void,
    setIsGenerating: (generating: boolean) => void,
    setVideoResult: (result: string) => void,
    startCountdown: (requestId: string, script: string, setVideoResult: (result: string) => void, setIsGenerating: (generating: boolean) => void, startTime?: number) => void
  ) => {
    if (!currentGeneration || !user) return;

    try {
      setIsRecovering(true);
      setIsGenerating(true);
      setShowRecoveryOption(false);

      // Set the recovered state
      setScript(currentGeneration.script);
      setCurrentRequestId(currentGeneration.request_id);

      // Update last check time
      await updateLastCheckTime(currentGeneration.request_id, user);

      // Check if video is already available
      const existingVideo = await checkVideoInDatabase(user, currentGeneration.request_id, currentGeneration.script);
      if (existingVideo) {
        setVideoResult(existingVideo.video_url);
        await handleVideoCompleted(currentGeneration.request_id);
        setIsGenerating(false);
        return;
      }

      // Start countdown with the original start time
      const startTime = new Date(currentGeneration.start_time).getTime();
      startCountdown(currentGeneration.request_id, currentGeneration.script, setVideoResult, setIsGenerating, startTime);
    } catch (error) {
      console.error('Error recovering generation:', error);
      setIsGenerating(false);
    } finally {
      setIsRecovering(false);
    }
  }, [currentGeneration, user]);

  // Cancel recovery
  const handleCancelRecovery = useCallback(() => {
    setShowRecoveryOption(false);
    setIsRecovering(false);
  }, []);

  // Mark video as completed
  const handleVideoCompleted = useCallback(async (requestId: string) => {
    if (!user) return;

    try {
      await markVideoGenerationCompleted(requestId, user);
      setCurrentGeneration(null);
      setTimeRemaining(0);
      setShowRecoveryOption(false);
    } catch (error) {
      console.error('Error marking video as completed:', error);
    }
  }, [user]);

  // Mark video as expired
  const handleVideoExpired = useCallback(async (requestId: string) => {
    if (!user) return;

    try {
      await markVideoGenerationExpired(requestId, user);
      setCurrentGeneration(null);
      setTimeRemaining(0);
      setShowRecoveryOption(false);
    } catch (error) {
      console.error('Error marking video as expired:', error);
    }
  }, [user]);

  return {
    currentGeneration,
    timeRemaining,
    showRecoveryOption,
    isRecovering,
    isLoading,
    handleStartGeneration,
    handleRecoverGeneration,
    handleCancelRecovery,
    handleVideoCompleted,
    handleVideoExpired,
    refreshCurrentGeneration
  };
};