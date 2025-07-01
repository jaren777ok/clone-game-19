
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
    if (!user) {
      console.log('❌ No user authenticated for loading API keys');
      return [];
    }

    console.log('🔍 Loading Blotato API keys for user:', user.id);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('blotato_api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('💥 Error loading Blotato API keys:', error);
        throw error;
      }
      
      const keys = data || [];
      console.log('✅ Successfully loaded API keys count:', keys.length);
      setApiKeys(keys);
      return keys;
    } catch (error) {
      console.error('💥 Unexpected error loading Blotato API keys:', error);
      setApiKeys([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveApiKey = useCallback(async (name: string, apiKey: string) => {
    if (!user) {
      console.error('❌ No user authenticated for saving API key');
      throw new Error('Usuario no autenticado');
    }

    console.log('💾 Saving Blotato API key:', name);
    
    try {
      const encryptedKey = btoa(apiKey);
      
      const { error } = await supabase
        .from('blotato_api_keys')
        .insert({
          user_id: user.id,
          api_key_name: name,
          api_key_encrypted: encryptedKey
        });

      if (error) {
        console.error('💥 Error saving Blotato API key:', error);
        throw error;
      }
      
      console.log('✅ API key saved successfully');
      await loadApiKeys();
    } catch (error) {
      console.error('💥 Unexpected error saving Blotato API key:', error);
      throw error;
    }
  }, [user, loadApiKeys]);

  const deleteApiKey = useCallback(async (keyId: string) => {
    console.log('🗑️ Deleting Blotato API key:', keyId);
    
    try {
      const { error } = await supabase
        .from('blotato_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) {
        console.error('💥 Error deleting Blotato API key:', error);
        throw error;
      }
      
      console.log('✅ API key deleted successfully');
      await loadApiKeys();
    } catch (error) {
      console.error('💥 Unexpected error deleting Blotato API key:', error);
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
