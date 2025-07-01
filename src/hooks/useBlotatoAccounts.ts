
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlotatoAccount {
  id: string;
  user_id: string;
  api_key_encrypted: string;
  instagram_account_id?: string;
  tiktok_account_id?: string;
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
      const { data, error } = await supabase
        .from('blotato_accounts')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setBlotatoAccount(data);
    } catch (error) {
      console.error('Error fetching Blotato account:', error);
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
      const { data, error } = await supabase
        .from('blotato_accounts')
        .upsert({
          api_key_encrypted: apiKey, // En producción esto debería estar encriptado
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      setBlotatoAccount(data);
      
      toast({
        title: "¡Clave API guardada!",
        description: "Tu clave API de Blotato ha sido guardada correctamente.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving Blotato API key:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la clave API de Blotato.",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateSocialAccounts = async (instagramId?: string, tiktokId?: string) => {
    try {
      const { data, error } = await supabase
        .from('blotato_accounts')
        .update({
          instagram_account_id: instagramId || null,
          tiktok_account_id: tiktokId || null
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;
      setBlotatoAccount(data);
      
      toast({
        title: "¡Cuentas actualizadas!",
        description: "Los IDs de tus cuentas sociales han sido guardados.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating social accounts:', error);
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
