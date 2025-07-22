
import { User } from '@supabase/supabase-js';
import { checkVideoViaWebhook } from '@/lib/webhookUtils';

class WebhookMonitoringService {
  async performManualCheck(
    user: User,
    requestId: string,
    script: string,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ): Promise<boolean> {
    console.log('🔍 [WEBHOOK SERVICE] Verificación manual via webhook');
    onDebugUpdate('🔍 Verificando video via webhook...');

    try {
      const videoData = await checkVideoViaWebhook(user, requestId, script);

      if (videoData && videoData.video_url) {
        console.log('✅ [WEBHOOK SERVICE] Video encontrado via webhook');
        onDebugUpdate('✅ Video encontrado via webhook!');
        onVideoFound(videoData);
        return true;
      } else {
        console.log('❌ [WEBHOOK SERVICE] Video no encontrado via webhook');
        onDebugUpdate('❌ Video no encontrado via webhook');
        return false;
      }
    } catch (error) {
      console.error('💥 [WEBHOOK SERVICE] Error en verificación manual:', error);
      onDebugUpdate(`💥 Error webhook: ${error}`);
      return false;
    }
  }
}

export const webhookMonitoringService = new WebhookMonitoringService();
