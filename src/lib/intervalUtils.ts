
import { MutableRefObject } from 'react';
import { COUNTDOWN_TIME } from './countdownUtils';

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
    const remaining = Math.max(0, COUNTDOWN_TIME - elapsed); // ARREGLADO: Ahora usa la constante dinámica
    
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

export const startPollingInterval = (
  checkFunction: () => Promise<void>,
  pollingRef: MutableRefObject<NodeJS.Timeout | null>,
  intervalMs: number = 180000 // CAMBIADO: Ahora cada 3 minutos (180 segundos) en lugar de 30 segundos
) => {
  console.log(`🔄 Iniciando verificación cada ${intervalMs / 1000} segundos (${intervalMs / 60000} minutos)`);
  pollingRef.current = setInterval(checkFunction, intervalMs);
};
