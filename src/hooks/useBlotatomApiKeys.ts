
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface BlotatomApiKey {
  id: string;
  user_id: string;
  api_key_name: string;
  api_key_encrypted: string;
  created_at: string;
  updated_at: string;
}

export const useBlotatomApiKeys = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<BlotatomApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApiKeys = useCallback(async () => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blotato_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const keys = data || [];
      setApiKeys(keys);
      return keys;
    } catch (error) {
      console.error('Error loading Blotato API keys:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveApiKey = useCallback(async (name: string, apiKey: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      const encryptedKey = btoa(apiKey);
      
      const { error } = await supabase
        .from('blotato_api_keys')
        .insert({
          user_id: user.id,
          api_key_name: name,
          api_key_encrypted: encryptedKey
        });

      if (error) throw error;
      
      await loadApiKeys();
    } catch (error) {
      console.error('Error saving Blotato API key:', error);
      throw error;
    }
  }, [user, loadApiKeys]);

  const deleteApiKey = useCallback(async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('blotato_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
      
      await loadApiKeys();
    } catch (error) {
      console.error('Error deleting Blotato API key:', error);
      throw error;
    }
  }, [loadApiKeys]);

  return {
    apiKeys,
    loading,
    loadApiKeys,
    saveApiKey,
    deleteApiKey
  };
};
