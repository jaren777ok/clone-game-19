import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { checkVideoDirectly } from '@/lib/databaseUtils';

interface MonitoringSession {
  intervalId: NodeJS.Timeout | null;
  isActive: boolean;
  startTime: number;
  attemptCount: number;
  lastAttemptTime: number;
  lastSuccessfulCheck: number;
  healthCheckCount: number;
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
    
    console.log('🚀 [MONITORING SERVICE] Iniciando sistema automático MEJORADO con verificación directa:', {
      userId,
      startTime: new Date(startTime).toISOString()
    });

    onDebugUpdate('🚀 Sistema iniciado - BD directa cada 60s + auto-recovery');

    // Create enhanced session
    const session: MonitoringSession = {
      intervalId: null,
      isActive: true,
      startTime,
      attemptCount: 0,
      lastAttemptTime: 0,
      lastSuccessfulCheck: Date.now(),
      healthCheckCount: 0
    };

    this.sessions.set(userId, session);

    // 🚨 IMMEDIATE check at 2 seconds (for stuck videos)
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        console.log('🚨 [MONITORING SERVICE] Verificación inmediata para stuck videos (2s)');
        this.performAutomaticCheck(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 2000); // 2 segundos para stuck videos

    // PRIMERA verificación a los 10 segundos (videos rápidos)
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        console.log('⚡ [MONITORING SERVICE] Primera verificación automática (10s)');
        this.performAutomaticCheck(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 10000); // 10 segundos

    // INTERVALO PRINCIPAL: Verificación cada 60 segundos exactos
    setTimeout(() => {
      if (this.sessions.get(userId)?.isActive) {
        this.startMainInterval(userId, user, onVideoFound, onDebugUpdate);
      }
    }, 60000); // Primer intervalo a los 60 segundos
  }

  private async startMainInterval(
    userId: string,
    user: User,
    onVideoFound: (videoData: any) => void,
    onDebugUpdate: (message: string) => void
  ) {
    const session = this.sessions.get(userId);
    if (!session?.isActive) return;

    console.log('🕐 [MONITORING SERVICE] Iniciando intervalo principal MEJORADO cada 60 segundos');
    onDebugUpdate('🕐 Verificación automática - cada 60s exactos + health checks');

    // Ejecutar primera verificación del intervalo
    await this.performAutomaticCheck(userId, user, onVideoFound, onDebugUpdate);

    // Configurar intervalo de 60 segundos exactos con health monitoring
    session.intervalId = setInterval(async () => {
      const currentSession = this.sessions.get(userId);
      if (!currentSession?.isActive) {
        console.log('🛑 [MONITORING SERVICE] Sesión inactiva - deteniendo intervalo');
        this.stopMonitoring(userId);
        return;
      }

      // 🚨 Health check: verificar si el último check fue hace más de 90 segundos
      const timeSinceLastCheck = Date.now() - currentSession.lastSuccessfulCheck;
      if (timeSinceLastCheck > 90000) { // 90 segundos
        console.log('🚨 [MONITORING SERVICE] Health check failed - reiniciando sesión');
        onDebugUpdate('🚨 Health check failed - sistema reiniciado');
        
        // Reset session health
        currentSession.lastSuccessfulCheck = Date.now();
        currentSession.healthCheckCount++;
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
      session.lastSuccessfulCheck = Date.now(); // 🚨 Mark successful execution

      const minutesElapsed = Math.floor((Date.now() - session.startTime) / 60000);
      
      console.log(`🔄 [MONITORING SERVICE] Verificación automática MEJORADA #${session.attemptCount}:`, {
        minutesElapsed,
        userId,
        healthChecks: session.healthCheckCount,
        timestamp: new Date().toISOString()
      });
      
      // Obtener datos frescos de tracking
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        console.log('❌ [MONITORING SERVICE] No hay tracking activo - deteniendo');
        onDebugUpdate('❌ No hay tracking activo - sistema detenido');
        this.stopMonitoring(userId);
        return;
      }

      const { request_id, script, status } = trackingData;

      if (status !== 'processing') {
        console.log('✅ [MONITORING SERVICE] Tracking completado:', status);
        onDebugUpdate(`✅ Video completado: ${status}`);
        this.stopMonitoring(userId);
        return;
      }

      onDebugUpdate(`🔄 Auto #${session.attemptCount} (${minutesElapsed}min) - BD directa...`);

      console.log('📊 [MONITORING SERVICE] Verificación directa MEJORADA en BD:', {
        requestId: request_id,
        userId,
        scriptLength: script.length,
        minutesElapsed,
        attemptNumber: session.attemptCount,
        healthChecks: session.healthCheckCount
      });

      // 🚨 ENHANCED: Verificación directa en base de datos con mejor logging
      const videoData = await checkVideoDirectly(user, request_id, script);

      if (videoData) {
        console.log('🎉 [MONITORING SERVICE] VIDEO ENCONTRADO - VERIFICACIÓN DIRECTA MEJORADA');
        onDebugUpdate(`🎉 Video encontrado automáticamente #${session.attemptCount} (BD directa)`);
        onVideoFound(videoData);
        this.stopMonitoring(userId);
      } else {
        console.log(`⏳ [MONITORING SERVICE] Video no listo - verificación mejorada #${session.attemptCount}`);
        onDebugUpdate(`⏳ Auto #${session.attemptCount}: Video en proceso... (BD directa OK)`);
      }

    } catch (error) {
      console.error(`💥 [MONITORING SERVICE] Error en verificación automática MEJORADA:`, error);
      onDebugUpdate(`💥 Error auto #${session.attemptCount}: ${error}`);
      
      // 🚨 Reset health on error but don't stop - keep trying
      if (session) {
        session.lastSuccessfulCheck = Date.now() - 30000; // Mark as 30s ago to trigger health check sooner
      }
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

      console.log('📊 [MONITORING SERVICE] Datos de tracking frescos:', {
        hasData: !!data,
        requestId: data?.request_id,
        status: data?.status,
        scriptLength: data?.script?.length
      });

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
    console.log('🔍 [MONITORING SERVICE] VERIFICACIÓN MANUAL MEJORADA EJECUTADA (BD directa)');
    onDebugUpdate('🔍 Verificación manual mejorada iniciada... (BD directa)');

    try {
      const trackingData = await this.getFreshTrackingData(userId);
      
      if (!trackingData) {
        onDebugUpdate('❌ Manual: No hay tracking activo');
        return false;
      }

      const { request_id, script } = trackingData;
      
      onDebugUpdate('📊 Manual: Verificando en BD directa mejorada...');
      console.log('📊 [MONITORING SERVICE] Manual MEJORADO - Verificación directa BD:', {
        requestId: request_id,
        scriptLength: script.length
      });

      const videoData = await checkVideoDirectly(user, request_id, script);

      if (videoData) {
        console.log('✅ [MONITORING SERVICE] Video encontrado en verificación manual MEJORADA (BD directa)');
        onDebugUpdate('✅ Manual: Video encontrado! (BD directa mejorada)');
        onVideoFound(videoData);
        this.stopMonitoring(userId);
        return true;
      } else {
        onDebugUpdate('❌ Manual: Video no encontrado (BD directa)');
        return false;
      }
    } catch (error) {
      console.error('💥 [MONITORING SERVICE] Error en verificación manual MEJORADA:', error);
      onDebugUpdate(`💥 Manual: Error - ${error}`);
      return false;
    }
  }

  stopMonitoring(userId: string) {
    const session = this.sessions.get(userId);
    if (session) {
      console.log('🛑 [MONITORING SERVICE] Deteniendo sistema automático MEJORADO para usuario:', userId);
      
      if (session.intervalId) {
        clearInterval(session.intervalId);
      }
      
      session.isActive = false;
      this.sessions.delete(userId);
    }
  }

  isMonitoring(userId: string): boolean {
    const session = this.sessions.get(userId);
    return session?.isActive || false;
  }

  // 🚨 ENHANCED: Better session info with health data
  getSessionInfo(userId: string) {
    const session = this.sessions.get(userId);
    if (!session) return null;
    
    return {
      elapsedTime: Math.floor((Date.now() - session.startTime) / 1000),
      attemptCount: session.attemptCount,
      isActive: session.isActive,
      timeSinceLastAttempt: session.lastAttemptTime ? Math.floor((Date.now() - session.lastAttemptTime) / 1000) : 0,
      timeSinceLastSuccessfulCheck: Math.floor((Date.now() - session.lastSuccessfulCheck) / 1000),
      healthCheckCount: session.healthCheckCount,
      isHealthy: (Date.now() - session.lastSuccessfulCheck) < 90000 // Healthy if last check was within 90 seconds
    };
  }
}

export const webhookMonitoringService = new WebhookMonitoringService();
