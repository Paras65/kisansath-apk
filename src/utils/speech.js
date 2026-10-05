// किसान साथी - स्पीच और वॉयस सहायता (Web Speech API)
// Android WebView & PWA Compatible

let currentUtterance = null;
let cachedVoices = [];

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

export const speakText = (text, onEndCallback) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this device.');
    return false;
  }

  // Cancel any ongoing speech
  try {
    window.speechSynthesis.cancel();
  } catch (e) {}

  if (!text || text.trim() === '') return false;

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

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
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = (e) => {
    console.warn('[Speech Error]', e);
    currentUtterance = null;
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
    return false;
  }

  return true;
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    currentUtterance = null;
  }
};

export const isSpeaking = () => {
  return typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.speaking : false;
};

