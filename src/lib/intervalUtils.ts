
import { MutableRefObject } from 'react';

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
    const remaining = Math.max(0, 3420 - elapsed); // 57 * 60 = 3420
    onTimeUpdate(remaining);
    
    if (remaining <= 0) {
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
  intervalMs: number = 30000
) => {
  pollingRef.current = setInterval(checkFunction, intervalMs);
};
