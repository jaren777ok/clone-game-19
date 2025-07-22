
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { checkVideoViaWebhook } from '@/lib/databaseUtils';

interface MonitoringSession {
  intervalId: NodeJS.Timeout | null;
  backupIntervalId: NodeJS.Timeout | null;
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
    
    console.log('🚀 [WEBHOOK SERVICE] Iniciando monitoreo mejorado:', {
      userId,
      startTime: new Date(startTime).toISOString()
    });

    onDebugUpdate('🚀 Sistema iniciado - primera verificación en 30 segundos');

    // Create session
    const session: MonitoringSession = {
      intervalId: null,
      backupIntervalId: null,
      isActive: true,
      startTime,
      attemptCount: 0,
      lastAttemptTime: 0
    };

    this.sessions.set(userId, session);

    // Start IMMEDIATE verification (testing)
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        console.log('🔥 [WEBHOOK SERVICE] Verificación inmediata de prueba');
        this.performWebhookCheck(userId, user, onVideoFound, onDebugUpdate, 'INMEDIATA');
      }
    }, 5000); // 5 segundos para prueba inmediata

    // Schedule main webhook verification after 30 seconds (reduced from 2 minutes)
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        this.activateMainVerification(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 30 * 1000); // 30 segundos

    // Start backup verification every 30 seconds
    this.activateBackupVerification(userId, user, onVideoFound, onDebugUpdate);
  }

  private async activateMainVerification(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    console.log('🎯 [WEBHOOK SERVICE] Activando verificación principal cada minuto');
    onDebugUpdate('🎯 Verificación principal activada - cada minuto');

    // Execute immediate check
    await this.performWebhookCheck(userId, user, onVideoFound, onDebugUpdate, 'PRINCIPAL');

    // Set up main interval for every minute
    session.intervalId = setInterval(async () => {
      const currentSession = this.sessions.get(userId);
      if (!currentSession?.isActive) {
        this.stopMonitoring(userId);
        return;
      }

      await this.performWebhookCheck(userId, user, onVideoFound, onDebugUpdate, 'PRINCIPAL');
    }, 60 * 1000); // Every minute
  }

  private async activateBackupVerification(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    console.log('🔄 [WEBHOOK SERVICE] Activando verificación de respaldo cada 30 segundos');

    // Set up backup interval for every 30 seconds
    session.backupIntervalId = setInterval(async () => {
      const currentSession = this.sessions.get(userId);
      if (!currentSession?.isActive) {
        this.stopMonitoring(userId);
        return;
      }

      // Only run backup if main verification hasn't run recently
      const timeSinceLastAttempt = Date.now() - currentSession.lastAttemptTime;
      if (timeSinceLastAttempt > 25000) { // If no main verification in last 25 seconds
        console.log('🆘 [WEBHOOK SERVICE] Ejecutando verificación de respaldo');
        await this.performWebhookCheck(userId, user, onVideoFound, onDebugUpdate, 'RESPALDO');
      }
    }, 30 * 1000); // Every 30 seconds
  }

  private async performWebhookCheck(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void,
    checkType: string = 'AUTO'
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    try {
      session.attemptCount++;
      session.lastAttemptTime = Date.now();

      const minutesElapsed = Math.floor((Date.now() - session.startTime) / 60000);
      
      console.log(`🔍 [WEBHOOK SERVICE] Verificación ${checkType} #${session.attemptCount}:`, {
        minutesElapsed,
        userId,
        timestamp: new Date().toISOString()
      });
      
      // Get fresh tracking data from database
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        console.log('❌ [WEBHOOK SERVICE] No hay tracking activo');
        onDebugUpdate('❌ No hay tracking activo - deteniendo verificación');
        this.stopMonitoring(userId);
        return;
      }

      const { request_id, script, status } = trackingData;

      if (status !== 'processing') {
        console.log('✅ [WEBHOOK SERVICE] Tracking ya no está en processing:', status);
        onDebugUpdate(`✅ Tracking completado: ${status}`);
        this.stopMonitoring(userId);
        return;
      }

      onDebugUpdate(`🔍 ${checkType} #${session.attemptCount} (min: ${minutesElapsed}) - Enviando a webhook...`);

      console.log('📤 [WEBHOOK SERVICE] Enviando datos a webhook:', {
        requestId: request_id,
        userId,
        scriptLength: script.length,
        minutesElapsed,
        checkType,
        webhookUrl: 'https://primary-production-f0d1.up.railway.app/webhook/videogenerado'
      });

      // Send to webhook with aggressive logging
      const videoData = await this.sendToWebhookWithLogging(user, request_id, script, checkType);

      if (videoData) {
        console.log('🎉 [WEBHOOK SERVICE] VIDEO ENCONTRADO VIA WEBHOOK');
        onDebugUpdate(`🎉 Video encontrado via ${checkType}`);
        onVideoFound(videoData);
        this.stopMonitoring(userId);
      } else {
        console.log(`❌ [WEBHOOK SERVICE] Video no listo en verificación ${checkType}`);
        onDebugUpdate(`❌ ${checkType} #${session.attemptCount}: Video no listo`);
      }

    } catch (error) {
      console.error(`💥 [WEBHOOK SERVICE] Error en verificación ${checkType}:`, error);
      onDebugUpdate(`💥 Error ${checkType}: ${error}`);
    }
  }

  private async sendToWebhookWithLogging(user: User, requestId: string, script: string, checkType: string) {
    try {
      console.log(`🌐 [WEBHOOK SERVICE] ${checkType} - Enviando petición HTTP a webhook`);
      const result = await checkVideoViaWebhook(user, requestId, script);
      console.log(`📥 [WEBHOOK SERVICE] ${checkType} - Respuesta webhook recibida:`, !!result);
      return result;
    } catch (error) {
      console.error(`💥 [WEBHOOK SERVICE] ${checkType} - Error en petición webhook:`, error);
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

      console.log('📊 [WEBHOOK SERVICE] Datos de tracking obtenidos:', {
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
      console.log('🛑 [WEBHOOK SERVICE] Deteniendo monitoreo para usuario:', userId);
      
      if (session.intervalId) {
        clearInterval(session.intervalId);
      }
      
      if (session.backupIntervalId) {
        clearInterval(session.backupIntervalId);
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
