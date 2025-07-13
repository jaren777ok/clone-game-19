import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Clean up base64 files from user_video_configs after successful video generation
 * This helps save space in the database
 */
export const cleanupManualCustomizationFiles = async (user: User | null): Promise<void> => {
  if (!user) {
    console.log('❌ No user provided for cleanup');
    return;
  }

  try {
    console.log('🧹 Limpiando archivos base64 de la configuración del usuario...');

    const { error } = await supabase
      .from('user_video_configs')
      .update({
        manual_customization: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error limpiando archivos base64:', error);
      throw error;
    }

    console.log('✅ Archivos base64 limpiados exitosamente de la configuración del usuario');
  } catch (error) {
    console.error('❌ Error durante la limpieza de archivos:', error);
    throw error;
  }
};

/**
 * Get the total size of base64 files for a user (for monitoring purposes)
 */
export const getManualCustomizationSize = async (user: User | null): Promise<number> => {
  if (!user) return 0;

  try {
    const { data, error } = await supabase
      .from('user_video_configs')
      .select('manual_customization')
      .eq('user_id', user.id)
      .single();

    if (error || !data?.manual_customization) {
      return 0;
    }

    const manualData = data.manual_customization as any;
    const totalSize = [
      ...(manualData.images || []),
      ...(manualData.videos || [])
    ].reduce((sum: number, file: any) => sum + (file.size || 0), 0);

    return totalSize;
  } catch (error) {
    console.error('❌ Error calculando tamaño de archivos:', error);
    return 0;
  }
};