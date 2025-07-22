
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getOrCreateSessionId, clearSessionId } from '@/lib/sessionUtils';

export const useSession = () => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const currentSessionId = getOrCreateSessionId(user.id);
      setSessionId(currentSessionId);
    } else {
      // Limpiar sessionId cuando no hay usuario
      clearSessionId();
      setSessionId(null);
    }
  }, [user?.id]);

  return {
    sessionId,
    userId: user?.id || null,
    isSessionActive: !!sessionId && !!user
  };
};
