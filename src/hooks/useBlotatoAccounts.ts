
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlotatoAccount {
  id: string;
  user_id: string;
  api_key_encrypted: string;
  instagram_account_id?: string;
  tiktok_account_id?: string;
  youtube_account_id?: string;
  facebook_account_id?: string;
  facebook_page_id?: string;
  created_at: string;
  updated_at: string;
}

export const useBlotatoAccounts = () => {
  const [blotatoAccount, setBlotatoAccount] = useState<BlotatoAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlotatoAccount = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching Blotato account...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ Error getting user:', userError);
        throw userError;
      }
      
      console.log('👤 Current user:', user?.id);

      const { data, error } = await supabase
        .from('blotato_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching Blotato account:', error);
        throw error;
      }
      
      console.log('📦 Blotato account data:', data);
      setBlotatoAccount(data);
    } catch (error) {
      console.error('❌ Error in fetchBlotatoAccount:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de Blotato.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBlotatoApiKey = async (apiKey: string) => {
    try {
      console.log('💾 Saving Blotato API key...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('blotato_accounts')
        .upsert({
          api_key_encrypted: apiKey, // En producción esto debería estar encriptado
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ API key saved successfully:', data);
      setBlotatoAccount(data);
      
      toast({
        title: "¡Clave API guardada!",
        description: "Tu clave API de Blotato ha sido guardada correctamente.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving Blotato API key:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la clave API de Blotato.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateSocialAccounts = async (
    instagramId?: string, 
    tiktokId?: string, 
    youtubeId?: string, 
    facebookId?: string,
    facebookPageId?: string
  ) => {
    try {
      console.log('🔄 Updating social accounts...', { instagramId, tiktokId, youtubeId, facebookId, facebookPageId });
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('blotato_accounts')
        .update({
          instagram_account_id: instagramId || null,
          tiktok_account_id: tiktokId || null,
          youtube_account_id: youtubeId || null,
          facebook_account_id: facebookId || null,
          facebook_page_id: facebookPageId || null
        })
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Social accounts updated successfully:', data);
      setBlotatoAccount(data);
      
      toast({
        title: "¡Cuentas actualizadas!",
        description: "Los IDs de tus cuentas sociales han sido guardados.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating social accounts:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las cuentas sociales.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchBlotatoAccount();
  }, []);

  return {
    blotatoAccount,
    loading,
    saveBlotatoApiKey,
    updateSocialAccounts,
    refetch: fetchBlotatoAccount
  };
};
