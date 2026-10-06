// किसान साथी - स्पीच और वॉयस सहायता (Hybrid Dual-Engine TTS)
// 100% Android APK (Capacitor WebView), TWA & PWA Compatible
// Tier 1: High-Fidelity Audio Stream (Google Hindi TTS) - Works on ALL Android devices & APKs
// Tier 2: Offline Web Speech API (SpeechSynthesis) with Hindi -> Indian English fallback

let currentText = null;
let speakingState = false;
let currentAudio = null;
let audioQueue = [];
let isAudioQueueActive = false;

let activeUtterance = null;
let cachedVoices = [];
let resumeInterval = null;
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

/**
 * Eagerly fetch and cache voices for Web Speech API
 */
const loadVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const voices = window.speechSynthesis.getVoices() || [];
    if (voices.length > 0) {
      cachedVoices = voices;
    }
    return cachedVoices;
  } catch (e) {
    return [];
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Finds the best available voice with robust Hindi -> Indian English -> System Default fallback.
 */
const selectBestVoice = () => {
  const voices = (cachedVoices && cachedVoices.length > 0) ? cachedVoices : loadVoices();

  // 1. Native Hindi Voice (hi-IN, hi, Hindi)
  const hindi = voices.find(
    (v) =>
      v.lang === 'hi-IN' ||
      v.lang === 'hi_IN' ||
      v.lang?.toLowerCase().startsWith('hi') ||
      (v.name && v.name.toLowerCase().includes('hindi'))
  );
  if (hindi) return { voice: hindi, lang: hindi.lang || 'hi-IN' };

  // 2. Indian English (en-IN) - Speaks Indian phonetics clearly
  const indian = voices.find(
    (v) =>
      v.lang === 'en-IN' ||
      v.lang === 'en_IN' ||
      v.lang?.toLowerCase().includes('in') ||
      (v.name && v.name.toLowerCase().includes('india'))
  );
  if (indian) return { voice: indian, lang: indian.lang || 'en-IN' };

  // 3. System default voice
  const defaultVoice = voices.find((v) => v.default) || voices[0];
  if (defaultVoice) return { voice: defaultVoice, lang: defaultVoice.lang || 'en-US' };

  return { voice: null, lang: 'hi-IN' };
};

/**
 * Chromium Mobile 15-second cutoff watchdog
 */
const startWatchdog = () => {
  stopWatchdog();
  resumeInterval = setInterval(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        stopWatchdog();
      }
    }
  }, 10000);
};

const stopWatchdog = () => {
  if (resumeInterval) {
    clearInterval(resumeInterval);
    resumeInterval = null;
  }
};

/**
 * Immediately stop speech across all engines (Audio stream & Web Speech)
 */
export const stopSpeech = () => {
  // 0. Stop Native Android APK TTS
  if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.stop === 'function') {
    try {
      window.AndroidTTS.stop();
    } catch (e) {}
  }

  // 1. Stop Audio Stream Queue
  isAudioQueueActive = false;
  audioQueue = [];
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }

  // 2. Stop Web Speech Synthesis without deadlocking
  stopWatchdog();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.warn('[Speech] Cancel error:', e);
    }
  }

  activeUtterance = null;
  currentText = null;
  if (typeof window !== 'undefined') {
    window._kisanActiveUtterance = null;
  }
  speakingState = false;
  notifyListeners();
};

/**
 * Sanitizes text to remove emojis, markdown symbols, and unpronounceable characters
 */
const cleanSpeechText = (raw) => {
  if (!raw) return '';
  return String(raw)
    .replace(/₹/g, 'रुपये ')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/~/g, '')
    .replace(/#/g, '')
    .replace(/`/g, '')
    .replace(/[•\-\–\—]/g, ' ')
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Splits long text into natural sentence chunks (max 140 chars) for smooth streaming
 */
const splitTextIntoChunks = (text, maxLen = 140) => {
  if (text.length <= maxLen) return [text];
  const parts = text.split(/([।,\.!\?]+)/).filter(Boolean);
  const chunks = [];
  let current = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if ((current + part).length <= maxLen) {
      current += part;
    } else {
      if (current.trim()) chunks.push(current.trim());
      current = part;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
};

/**
 * Fallback to Web Speech API when offline or if audio stream fails
 */
const speakViaWebSpeech = (cleanText, onEndCallback) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    speakingState = false;
    notifyListeners();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {}

  const utterance = new SpeechSynthesisUtterance(cleanText);
  activeUtterance = utterance;
  if (typeof window !== 'undefined') {
    window._kisanActiveUtterance = utterance;
  }

  const { voice, lang } = selectBestVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    speakingState = true;
    notifyListeners();
    startWatchdog();
  };

  utterance.onend = () => {
    stopWatchdog();
    activeUtterance = null;
    currentText = null;
    if (typeof window !== 'undefined') {
      window._kisanActiveUtterance = null;
    }
    speakingState = false;
    notifyListeners();
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = (e) => {
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('[WebSpeech Utterance Error]', e.error, e);
    }
    stopWatchdog();
    activeUtterance = null;
    currentText = null;
    if (typeof window !== 'undefined') {
      window._kisanActiveUtterance = null;
    }
    speakingState = false;
    notifyListeners();
    if (onEndCallback) onEndCallback();
  };

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
    speakingState = true;
    notifyListeners();
    return true;
  } catch (err) {
    console.error('[WebSpeech Speak Error]', err);
    stopSpeech();
    return false;
  }
};

/**
 * Main Speak Function
 * Prioritizes High-Fidelity Audio Stream for APK/Mobile compatibility;
 * Automatically falls back to offline Web Speech API.
 */
export const speakText = (text, onEndCallback) => {
  const clean = cleanSpeechText(text);
  if (!clean) return false;

  // TOGGLE: If user clicks the same speech button while it's playing, STOP it.
  if (speakingState) {
    if (currentText === text || currentText === clean) {
      stopSpeech();
      return false;
    }
    stopSpeech();
  }

  currentText = text;

  // TIER 0: NATIVE ANDROID HARDWARE TTS (100% Native OS Engine for Android APK)
  if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
    try {
      window.AndroidTTS.speak(clean);
      speakingState = true;
      notifyListeners();

      // Estimated duration for UI voice animation
      const durationMs = Math.max(2500, Math.min(30000, (clean.length / 13) * 1000));
      setTimeout(() => {
        if (speakingState && (currentText === text || currentText === clean)) {
          speakingState = false;
          currentText = null;
          notifyListeners();
          if (onEndCallback) onEndCallback();
        }
      }, durationMs);

      return true;
    } catch (err) {
      console.warn('[Speech] AndroidTTS bridge failed, falling back to audio stream:', err);
    }
  }

  // 1. If online: Use crystal-clear Google Hindi TTS Audio Stream (PWA & Web)
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (isOnline) {
    const chunks = splitTextIntoChunks(clean);
    audioQueue = [...chunks];
    isAudioQueueActive = true;
    speakingState = true;
    notifyListeners();

    const playNextChunk = () => {
      if (!isAudioQueueActive) return;
      if (audioQueue.length === 0) {
        stopSpeech();
        if (onEndCallback) onEndCallback();
        return;
      }

      const nextChunk = audioQueue.shift();
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(nextChunk)}&tl=hi&client=tw-ob`;

      try {
        const audio = new Audio();
        audio.referrerPolicy = 'no-referrer';
        audio.crossOrigin = 'anonymous';
        audio.src = url;
        currentAudio = audio;
        audio.playbackRate = 1.0;

        audio.onended = () => {
          playNextChunk();
        };

        audio.onerror = () => {
          console.warn('[Speech] Audio stream failed, falling back to Web Speech API');
          currentAudio = null;
          isAudioQueueActive = false;
          speakViaWebSpeech(clean, onEndCallback);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            console.warn('[Speech] Audio play was blocked, falling back to Web Speech API');
            currentAudio = null;
            isAudioQueueActive = false;
            speakViaWebSpeech(clean, onEndCallback);
          });
        }
      } catch (err) {
        console.warn('[Speech] Audio constructor error, falling back:', err);
        isAudioQueueActive = false;
        speakViaWebSpeech(clean, onEndCallback);
      }
    };

    playNextChunk();
    return true;
  }

  // 2. If offline: Fallback directly to native Web Speech API
  return speakViaWebSpeech(clean, onEndCallback);
};

export const isSpeaking = () => {
  return speakingState || (typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.speaking : false);
};
