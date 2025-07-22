
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { checkVideoViaWebhook } from '@/lib/databaseUtils';

interface MonitoringSession {
  intervalId: NodeJS.Timeout | null;
  isActive: boolean;
  startTime: number;
}

class WebhookMonitoringService {
  private sessions = new Map<string, MonitoringSession>();

  async startMonitoring(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    // Stop any existing monitoring for this user
    this.stopMonitoring(userId);

    const startTime = Date.now();
    
    console.log('🚀 [MONITORING SERVICE] Iniciando monitoreo independiente:', {
      userId,
      startTime: new Date(startTime).toISOString()
    });

    onDebugUpdate('🚀 Sistema iniciado - activación en 2 minutos');

    // Create session
    const session: MonitoringSession = {
      intervalId: null,
      isActive: true,
      startTime
    };

    this.sessions.set(userId, session);

    // Schedule webhook activation after 2 minutes
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        this.activateWebhookVerification(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  private async activateWebhookVerification(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    console.log('🎯 [MONITORING SERVICE] Activando verificaciones webhook cada minuto');
    onDebugUpdate('🎯 Webhook activado - verificando cada minuto');

    // Execute immediate check
    await this.performWebhookCheck(userId, user, onVideoFound, onDebugUpdate);

    // Set up interval for every minute
    session.intervalId = setInterval(async () => {
      if (!this.sessions.get(userId)?.isActive) {
        this.stopMonitoring(userId);
        return;
      }

      await this.performWebhookCheck(userId, user, onVideoFound, onDebugUpdate);
    }, 60 * 1000); // Every minute
  }

  private async performWebhookCheck(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    try {
      console.log('🔍 [MONITORING SERVICE] Ejecutando verificación webhook');
      
      // Get fresh tracking data from database
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        console.log('❌ [MONITORING SERVICE] No hay tracking activo');
        onDebugUpdate('❌ No hay tracking activo');
        this.stopMonitoring(userId);
        return;
      }

      const { request_id, script, status } = trackingData;

      if (status !== 'processing') {
        console.log('✅ [MONITORING SERVICE] Tracking ya no está en processing:', status);
        this.stopMonitoring(userId);
        return;
      }

      const minutesElapsed = Math.floor((Date.now() - Date.parse(trackingData.start_time)) / 60000);
      onDebugUpdate(`🔍 Verificando webhook (min: ${minutesElapsed})`);

      console.log('📤 [MONITORING SERVICE] Enviando a webhook:', {
        requestId: request_id,
        userId,
        scriptLength: script.length,
        minutesElapsed
      });

      // Send to webhook
      const videoData = await checkVideoViaWebhook(user, request_id, script);

      if (videoData) {
        console.log('🎉 [MONITORING SERVICE] VIDEO ENCONTRADO');
        onDebugUpdate('🎉 Video encontrado via webhook');
        onVideoFound(videoData);
        this.stopMonitoring(userId);
      } else {
        console.log(`❌ [MONITORING SERVICE] Video no listo (min: ${minutesElapsed})`);
        onDebugUpdate(`❌ Video no listo (min: ${minutesElapsed})`);
      }

    } catch (error) {
      console.error('💥 [MONITORING SERVICE] Error en verificación:', error);
      onDebugUpdate(`💥 Error: ${error}`);
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

  async performManualCheck(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ): Promise<boolean> {
    console.log('🔍 [MONITORING SERVICE] Verificación manual ejecutada');
    onDebugUpdate('🔍 Verificación manual...');

    try {
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        onDebugUpdate('❌ No hay tracking activo');
        return false;
      }

      const { request_id, script } = trackingData;
      const videoData = await checkVideoViaWebhook(user, request_id, script);

      if (videoData) {
        console.log('✅ [MONITORING SERVICE] Video encontrado en verificación manual');
        onVideoFound(videoData);
        this.stopMonitoring(userId);
        return true;
      } else {
        onDebugUpdate('❌ Video no encontrado');
        return false;
      }
    } catch (error) {
      console.error('💥 [MONITORING SERVICE] Error en verificación manual:', error);
      onDebugUpdate(`💥 Error: ${error}`);
      return false;
    }
  }

  stopMonitoring(userId: string) {
    const session = this.sessions.get(userId);
    if (session) {
      console.log('🛑 [MONITORING SERVICE] Deteniendo monitoreo para usuario:', userId);
      
      if (session.intervalId) {
        clearInterval(session.intervalId);
      }
      
      session.isActive = false;
      this.sessions.delete(userId);
    }
  }

  isMonitoring(userId: string): boolean {
    return this.sessions.get(userId)?.isActive || false;
  }

  getElapsedTime(userId: string): number {
    const session = this.sessions.get(userId);
    if (!session) return 0;
    return Math.floor((Date.now() - session.startTime) / 1000);
  }
}

export const webhookMonitoringService = new WebhookMonitoringService();
