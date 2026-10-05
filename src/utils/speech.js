// किसान साथी - स्पीच और वॉयस सहायता (Web Speech API)
// Android WebView & PWA Compatible

let currentUtterance = null;
let currentText = null;
let cachedVoices = [];
let speakingState = false;
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener(speakingState, currentText);
    } catch (e) {
      console.warn('[Speech] Listener error:', e);
    }
  });
};

/**
 * Subscribe to global speech speaking state changes
 */
export const subscribeSpeechState = (fn) => {
  listeners.add(fn);
  fn(speakingState, currentText);
  return () => {
    listeners.delete(fn);
  };
};

// Pre-load and cache speech synthesis voices for Android WebViews
const initVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {
      console.warn('[Speech] Voice pre-cache error:', e);
    }
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    initVoices();
  };
}

/**
 * Immediately stop all speech output across all platforms
 */
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.pause) {
        window.speechSynthesis.pause();
      }
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  currentUtterance = null;
  currentText = null;
  speakingState = false;
  notifyListeners();
};

/**
 * Speak text in Hindi with toggle-to-stop behavior
 * If the exact same text is currently playing and tapped again, it will stop speaking.
 */
export const speakText = (text, onEndCallback) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this device.');
    return false;
  }

  // 1. TOGGLE CHECK: If already speaking and user taps the same button, STOP speaking!
  if (speakingState || window.speechSynthesis.speaking) {
    if (currentText === text) {
      stopSpeech();
      return false;
    }
    // If different text was playing, stop the previous one first
    stopSpeech();
  }

  if (!text || text.trim() === '') return false;

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;
  currentText = text;
  speakingState = true;
  notifyListeners();

  // Retrieve cached voices or query directly
  const voices = (cachedVoices && cachedVoices.length > 0) ? cachedVoices : (window.speechSynthesis.getVoices() || []);
  const hindiVoice = voices.find(
    (v) =>
      v.lang.includes('hi') ||
      v.lang.includes('hi-IN') ||
      (v.name && v.name.toLowerCase().includes('hindi'))
  );

  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }
  utterance.lang = 'hi-IN';
  utterance.rate = 0.95; // Slightly slower for elderly farmers
  utterance.pitch = 1.0;

  utterance.onend = () => {
    currentUtterance = null;
    currentText = null;
    speakingState = false;
    notifyListeners();
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = (e) => {
    console.warn('[Speech Error]', e);
    currentUtterance = null;
    currentText = null;
    speakingState = false;
    notifyListeners();
    if (onEndCallback) onEndCallback();
  };

  // Android WebView fix: if speech engine is in paused state, resume it
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[Speech Speak Error]', err);
    currentUtterance = null;
    currentText = null;
    speakingState = false;
    notifyListeners();
    return false;
  }

  return true;
};

export const isSpeaking = () => {
  return speakingState || (typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.speaking : false);
};

