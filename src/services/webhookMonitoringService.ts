
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { checkVideoViaWebhook } from '@/lib/databaseUtils';

interface MonitoringSession {
  intervalId: NodeJS.Timeout | null;
  isActive: boolean;
  startTime: number;
  attemptCount: number;
  lastAttemptTime: number;
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
    
    console.log('🚀 [WEBHOOK SERVICE] Iniciando sistema automático simplificado:', {
      userId,
      startTime: new Date(startTime).toISOString()
    });

    onDebugUpdate('🚀 Sistema iniciado - verificación automática cada minuto');

    // Create session
    const session: MonitoringSession = {
      intervalId: null,
      isActive: true,
      startTime,
      attemptCount: 0,
      lastAttemptTime: 0
    };

    this.sessions.set(userId, session);

    // Start FIRST verification after 10 seconds (quick videos)
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        console.log('⚡ [WEBHOOK SERVICE] Primera verificación automática (10s)');
        this.performAutomaticCheck(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 10000); // 10 segundos

    // Start main automatic verification every 60 seconds
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        this.startAutomaticVerification(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 60000); // 1 minuto para la primera verificación regular
  }

  private async startAutomaticVerification(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    console.log('🕐 [WEBHOOK SERVICE] Iniciando verificación automática cada 60 segundos');
    onDebugUpdate('🕐 Verificación automática activa - cada 60 segundos');

    // Execute first automatic check
    await this.performAutomaticCheck(userId, user, onVideoFound, onDebugUpdate);

    // Set up interval for every 60 seconds
    session.intervalId = setInterval(async () => {
      const currentSession = this.sessions.get(userId);
      if (!currentSession?.isActive) {
        this.stopMonitoring(userId);
        return;
      }

      await this.performAutomaticCheck(userId, user, onVideoFound, onDebugUpdate);
    }, 60000); // Exactamente cada 60 segundos
  }

  private async performAutomaticCheck(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    try {
      session.attemptCount++;
      session.lastAttemptTime = Date.now();

      const minutesElapsed = Math.floor((Date.now() - session.startTime) / 60000);
      
      console.log(`🔄 [WEBHOOK SERVICE] Verificación automática #${session.attemptCount}:`, {
        minutesElapsed,
        userId,
        timestamp: new Date().toISOString()
      });
      
      // Get fresh tracking data from database
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        console.log('❌ [WEBHOOK SERVICE] No hay tracking activo - deteniendo');
        onDebugUpdate('❌ No hay tracking activo - sistema detenido');
        this.stopMonitoring(userId);
        return;
      }

      const { request_id, script, status } = trackingData;

      if (status !== 'processing') {
        console.log('✅ [WEBHOOK SERVICE] Tracking completado:', status);
        onDebugUpdate(`✅ Video completado: ${status}`);
        this.stopMonitoring(userId);
        return;
      }

      onDebugUpdate(`🔄 Auto #${session.attemptCount} (${minutesElapsed}min) - Verificando webhook...`);

      console.log('📤 [WEBHOOK SERVICE] Enviando datos automáticamente a webhook:', {
        requestId: request_id,
        userId,
        scriptLength: script.length,
        minutesElapsed,
        attemptNumber: session.attemptCount
      });

      // Send to webhook automatically
      const videoData = await this.sendToWebhookWithLogging(user, request_id, script, 'AUTO');

      if (videoData) {
        console.log('🎉 [WEBHOOK SERVICE] VIDEO ENCONTRADO - SISTEMA AUTOMÁTICO');
        onDebugUpdate(`🎉 Video encontrado automáticamente #${session.attemptCount}`);
        onVideoFound(videoData);
        this.stopMonitoring(userId);
      } else {
        console.log(`⏳ [WEBHOOK SERVICE] Video no listo - verificación #${session.attemptCount}`);
        onDebugUpdate(`⏳ Auto #${session.attemptCount}: Video en proceso...`);
      }

    } catch (error) {
      console.error(`💥 [WEBHOOK SERVICE] Error en verificación automática:`, error);
      onDebugUpdate(`💥 Error auto #${session.attemptCount}: ${error}`);
      // NO detenemos el sistema por un error - seguimos intentando
    }
  }

  private async sendToWebhookWithLogging(user: User, requestId: string, script: string, checkType: string) {
    try {
      console.log(`🌐 [WEBHOOK SERVICE] ${checkType} - Enviando petición HTTP a webhook`);
      const result = await checkVideoViaWebhook(user, requestId, script);
      console.log(`📥 [WEBHOOK SERVICE] ${checkType} - Respuesta webhook:`, !!result);
      return result;
    } catch (error) {
      console.error(`💥 [WEBHOOK SERVICE] ${checkType} - Error en webhook:`, error);
      throw error;
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
        console.error('❌ [WEBHOOK SERVICE] Error obteniendo tracking:', error);
        return null;
      }

      console.log('📊 [WEBHOOK SERVICE] Datos de tracking frescos:', {
        hasData: !!data,
        requestId: data?.request_id,
        status: data?.status,
        scriptLength: data?.script?.length
      });

      return data;
    } catch (error) {
      console.error('💥 [WEBHOOK SERVICE] Error en getFreshTrackingData:', error);
      return null;
    }
  }

  async performManualCheck(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ): Promise<boolean> {
    console.log('🔍 [WEBHOOK SERVICE] VERIFICACIÓN MANUAL EJECUTADA');
    onDebugUpdate('🔍 Verificación manual iniciada...');

    try {
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        onDebugUpdate('❌ Manual: No hay tracking activo');
        return false;
      }

      const { request_id, script } = trackingData;
      
      onDebugUpdate('📤 Manual: Enviando datos a webhook...');
      console.log('📤 [WEBHOOK SERVICE] Manual - Enviando a webhook:', {
        requestId: request_id,
        scriptLength: script.length
      });

      const videoData = await this.sendToWebhookWithLogging(user, request_id, script, 'MANUAL');

      if (videoData) {
        console.log('✅ [WEBHOOK SERVICE] Video encontrado en verificación manual');
        onDebugUpdate('✅ Manual: Video encontrado!');
        onVideoFound(videoData);
        this.stopMonitoring(userId);
        return true;
      } else {
        onDebugUpdate('❌ Manual: Video no encontrado');
        return false;
      }
    } catch (error) {
      console.error('💥 [WEBHOOK SERVICE] Error en verificación manual:', error);
      onDebugUpdate(`💥 Manual: Error - ${error}`);
      return false;
    }
  }

  stopMonitoring(userId: string) {
    const session = this.sessions.get(userId);
    if (session) {
      console.log('🛑 [WEBHOOK SERVICE] Deteniendo sistema automático para usuario:', userId);
      
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

  getSessionInfo(userId: string) {
    const session = this.sessions.get(userId);
    if (!session) return null;
    
    return {
      elapsedTime: Math.floor((Date.now() - session.startTime) / 1000),
      attemptCount: session.attemptCount,
      isActive: session.isActive,
      timeSinceLastAttempt: session.lastAttemptTime ? Math.floor((Date.now() - session.lastAttemptTime) / 1000) : 0
    };
  }
}

export const webhookMonitoringService = new WebhookMonitoringService();
