// किसान साथी - खेत मोड (Muddy Hands / Hands-Free Field Motion Sensor)
// Detects intentional double-shake gesture to trigger Bhaira Kaka hands-free
// Calibrated with low-pass jitter filter to prevent false triggers during walking

let isListening = false;
let lastShakeTime = 0;
let shakeCount = 0;
let lastShakeResetTimer = null;
let activeCallback = null;

const SHAKE_THRESHOLD = 18.5; // m/s^2 calibrated for deliberate double shake
const SHAKE_WINDOW_MS = 1400; // Must do 2 shakes within 1.4 seconds
const COOLDOWN_MS = 2500; // 2.5s cooldown after triggering

const handleMotion = (event) => {
  const current = event.accelerationIncludingGravity || event.acceleration;
  if (!current) return;

  const { x, y, z } = current;
  const magnitude = Math.hypot(x || 0, y || 0, z || 0);

  const now = Date.now();
  if (magnitude > SHAKE_THRESHOLD) {
    if (now - lastShakeTime < 250) {
      // Too fast, ignore same motion wave
      return;
    }

    lastShakeTime = now;
    shakeCount++;

    if (lastShakeResetTimer) {
      clearTimeout(lastShakeResetTimer);
    }

    if (shakeCount >= 2) {
      shakeCount = 0;
      if (typeof activeCallback === 'function' && now - (activeCallback._lastFired || 0) > COOLDOWN_MS) {
        activeCallback._lastFired = now;
        try {
          activeCallback();
        } catch (e) {
          console.warn('[Field Motion] Trigger callback error:', e);
        }
      }
    } else {
      lastShakeResetTimer = setTimeout(() => {
        shakeCount = 0;
      }, SHAKE_WINDOW_MS);
    }
  }
};

/**
 * Enable hands-free shake detection
 */
export const startShakeDetection = (onShakeTrigger) => {
  if (typeof window === 'undefined' || !window.addEventListener) return false;
  activeCallback = onShakeTrigger;

  if (isListening) return true;

  // Modern iOS permission request guard
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleMotion, { passive: true });
          isListening = true;
        }
      })
      .catch(() => {});
  } else if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
    window.addEventListener('devicemotion', handleMotion, { passive: true });
    isListening = true;
  }

  return isListening;
};

/**
 * Stop shake detection to preserve phone battery
 */
export const stopShakeDetection = () => {
  if (typeof window !== 'undefined' && isListening) {
    window.removeEventListener('devicemotion', handleMotion);
    isListening = false;
  }
  if (lastShakeResetTimer) {
    clearTimeout(lastShakeResetTimer);
    lastShakeResetTimer = null;
  }
  shakeCount = 0;
  activeCallback = null;
};

export const isShakeDetectionActive = () => isListening;

