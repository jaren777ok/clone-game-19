
import { MutableRefObject } from 'react';
import { COUNTDOWN_TIME, DELAYED_POLLING_START, POLLING_INTERVAL_DELAYED } from './countdownUtils';

export const clearAllIntervals = (
  pollingRef: MutableRefObject<NodeJS.Timeout | null>,
  countdownRef: MutableRefObject<NodeJS.Timeout | null>
) => {
  if (pollingRef.current) {
    clearInterval(pollingRef.current);
    pollingRef.current = null;
  }
  if (countdownRef.current) {
    clearInterval(countdownRef.current);
    countdownRef.current = null;
  }
};

export const startCountdownInterval = (
  startTime: number,
  onTimeUpdate: (timeRemaining: number) => void,
  onTimeExpired: () => void,
  countdownRef: MutableRefObject<NodeJS.Timeout | null>
) => {
  const updateTimeRemaining = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, COUNTDOWN_TIME - elapsed);
    
    console.log(`⏰ Contador actualizado: ${Math.floor(remaining / 60)}:${(remaining % 60).toString().padStart(2, '0')} restantes`);
    
    onTimeUpdate(remaining);
    
    if (remaining <= 0) {
      console.log('⏰ Tiempo agotado, ejecutando verificación final');
      if (countdownRef.current) clearInterval(countdownRef.current);
      onTimeExpired();
    }
  };

  // Update immediately
  updateTimeRemaining();

  // Continue updating every second
  countdownRef.current = setInterval(updateTimeRemaining, 1000);
};

// Nueva función para verificación retrasada - inicia después de 30 minutos
export const startDelayedPolling = (
  startTime: number,
  checkFunction: () => Promise<void>,
  pollingRef: MutableRefObject<NodeJS.Timeout | null>
) => {
  const timeElapsed = Date.now() - startTime;
  const delayBeforeStart = Math.max(0, DELAYED_POLLING_START * 1000 - timeElapsed);
  
  console.log(`🕐 Verificación retrasada: iniciará en ${Math.floor(delayBeforeStart / 1000)} segundos (después de 30 minutos)`);
  
  setTimeout(() => {
    console.log('🔄 Iniciando verificaciones cada 1 minuto después de 30 minutos de espera');
    
    // Ejecutar verificación inmediata
    checkFunction();
    
    // Luego cada minuto
    pollingRef.current = setInterval(checkFunction, POLLING_INTERVAL_DELAYED);
  }, delayBeforeStart);
};

// Función legacy mantenida para compatibilidad pero no usada en el nuevo flujo
export const startPollingInterval = (
  checkFunction: () => Promise<void>,
  pollingRef: MutableRefObject<NodeJS.Timeout | null>,
  intervalMs: number = 180000
) => {
  console.log(`🔄 Iniciando verificación cada ${intervalMs / 1000} segundos (${intervalMs / 60000} minutos)`);
  pollingRef.current = setInterval(checkFunction, intervalMs);
};
