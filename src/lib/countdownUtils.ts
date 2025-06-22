
export const COUNTDOWN_TIME = 39 * 60; // 39 minutes in seconds (cambiado de 57 a 39 minutos)

export const calculateTimeRemaining = (startTime: number): number => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return Math.max(0, COUNTDOWN_TIME - elapsed);
};

export const formatTimeRemaining = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return {
    minutes,
    seconds,
    formattedTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  };
};

export const isTimeExpired = (startTime: number): boolean => {
  const timeElapsed = Date.now() - startTime;
  const maxWaitTime = COUNTDOWN_TIME * 1000;
  return timeElapsed >= maxWaitTime;
};
