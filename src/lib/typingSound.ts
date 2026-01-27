/**
 * Procedural Typing Sound Generator
 * Uses Web Audio API to create a "clicky" keyboard/typewriter sound
 * without needing external audio files.
 */

let audioContext: AudioContext | null = null;
let lastPlayTime = 0;
let charCounter = 0;

// Configuration
const CONFIG = {
  volume: 0.08,           // Very subtle (0.05-0.15)
  baseFrequency: 1000,    // Base frequency in Hz
  frequencyVariation: 400, // Random variation range
  duration: 0.025,        // Duration in seconds (25ms)
  throttleChars: 2,       // Play sound every N characters
  minInterval: 30,        // Minimum ms between sounds
};

/**
 * Initialize or get the AudioContext (lazy initialization)
 */
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  
  return audioContext;
};

/**
 * Play a single typing sound
 * Uses a short burst of noise-like oscillation with rapid decay
 */
export const playTypingSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Throttle: only play every N characters
  charCounter++;
  if (charCounter % CONFIG.throttleChars !== 0) return;
  
  // Throttle: minimum interval between sounds
  const now = Date.now();
  if (now - lastPlayTime < CONFIG.minInterval) return;
  lastPlayTime = now;
  
  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const currentTime = ctx.currentTime;
  
  // Create oscillator for the "click" sound
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  // Random frequency for natural variation
  const frequency = CONFIG.baseFrequency + (Math.random() - 0.5) * CONFIG.frequencyVariation;
  
  // Square wave gives a more "clicky" sound
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, currentTime);
  
  // Quick frequency drop for more realistic "click"
  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 0.5,
    currentTime + CONFIG.duration
  );
  
  // Volume envelope: instant attack, fast decay
  gainNode.gain.setValueAtTime(CONFIG.volume, currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + CONFIG.duration);
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // Play and cleanup
  oscillator.start(currentTime);
  oscillator.stop(currentTime + CONFIG.duration);
};

/**
 * Reset the character counter (call when starting a new message)
 */
export const resetTypingSoundCounter = (): void => {
  charCounter = 0;
};

/**
 * Cleanup function to close AudioContext when no longer needed
 */
export const cleanupTypingSound = (): void => {
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
};
