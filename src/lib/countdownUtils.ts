
export const COUNTDOWN_TIME = 39 * 60; // 39 minutes in seconds
export const DELAYED_POLLING_START = 25 * 60; // 25 minutes in seconds - cuando iniciar verificaciones
export const POLLING_INTERVAL_DELAYED = 60 * 1000; // 1 minute in milliseconds - verificaciones cada minuto

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

export const hasReachedPollingTime = (startTime: number): boolean => {
  const timeElapsed = Date.now() - startTime;
  return timeElapsed >= DELAYED_POLLING_START * 1000;
};
