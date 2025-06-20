
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { HeyGenApiKey } from '@/types/videoFlow';

export const useApiKeys = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<HeyGenApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApiKeys = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('heygen_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const keys = data || [];
      setApiKeys(keys);
      return keys;
    } catch (error) {
      console.error('Error loading API keys:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    apiKeys,
    loading,
    loadApiKeys
  };
};
