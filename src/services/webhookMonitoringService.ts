
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { sendVideoVerificationWebhook } from '@/lib/webhookUtils';

interface MonitoringSession {
  isActive: boolean;
  startTime: number;
}

class WebhookMonitoringService {
  private sessions = new Map<string, MonitoringSession>();

  // Solo inicializar sesión para tracking, sin verificaciones automáticas
  async startMonitoring(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    console.log('🚀 [MONITORING SERVICE] Iniciando sesión manual (sin verificaciones automáticas)');
    
    const startTime = Date.now();
    
    // Solo crear sesión para tracking - sin intervalos automáticos
    const session: MonitoringSession = {
      isActive: true,
      startTime
    };

    this.sessions.set(userId, session);
    onDebugUpdate('🚀 Sistema manual iniciado - verificación solo con botón');
  }

  // Verificación manual que usa la nueva webhook
  async performManualCheck(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ): Promise<boolean> {
    console.log('🔍 [MONITORING SERVICE] VERIFICACIÓN MANUAL ejecutada');
    onDebugUpdate('🔍 Verificación manual iniciada...');

    try {
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        onDebugUpdate('❌ Manual: No hay tracking activo');
        return false;
      }

      const { request_id, script } = trackingData;
      
      onDebugUpdate('📤 Manual: Enviando a webhook de verificación...');
      console.log('📤 [MONITORING SERVICE] Enviando verificación manual:', {
        requestId: request_id,
        userId,
        scriptLength: script.length
      });

      // Usar la nueva función de verificación manual
      const success = await sendVideoVerificationWebhook(request_id, userId, script);

      if (success) {
        console.log('✅ [MONITORING SERVICE] Verificación manual enviada exitosamente');
        onDebugUpdate('✅ Manual: Verificación enviada a webhook externa');
        return true;
      } else {
        onDebugUpdate('❌ Manual: Error enviando verificación');
        return false;
      }
    } catch (error) {
      console.error('💥 [MONITORING SERVICE] Error en verificación manual:', error);
      onDebugUpdate(`💥 Manual: Error - ${error}`);
      return false;
    }
  }

  private async getFreshTrackingData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('video_generation_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'processing')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [MONITORING SERVICE] Error obteniendo tracking:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('💥 [MONITORING SERVICE] Error en getFreshTrackingData:', error);
      return null;
    }
  }

  stopMonitoring(userId: string) {
    const session = this.sessions.get(userId);
    if (session) {
      console.log('🛑 [MONITORING SERVICE] Deteniendo sesión manual para usuario:', userId);
      session.isActive = false;
      this.sessions.delete(userId);
    }
  }

  isMonitoring(userId: string): boolean {
    const session = this.sessions.get(userId);
    return session?.isActive || false;
  }

  getSessionInfo(userId: string) {
    const session = this.sessions.get(userId);
    if (!session) return null;
    
    return {
      elapsedTime: Math.floor((Date.now() - session.startTime) / 1000),
      isActive: session.isActive,
      isManual: true
    };
  }
}

export const webhookMonitoringService = new WebhookMonitoringService();
