// किसान साथी - प्राकृतिक वॉयस एवं स्पीच सहायता (High-Fidelity Natural Neural TTS)
// 100% Zero-API-Key, Zero-Registration, Zero-Latency Architecture
// Tier 0: Native Android APK Hardware TTS (Capacitor / AndroidTTS bridge)
// Tier 1: Primary Natural Neural Web Speech API (Microsoft Swara / Microsoft Madhur / Google WaveNet)
// Tier 2: Emergency Audio Stream Fallback (Offline / Legacy browser guard)

let currentText = null;
let speakingState = false;
let currentAudio = null;
let audioQueue = [];
let isAudioQueueActive = false;

let activeUtterance = null;
let cachedVoices = [];
let resumeInterval = null;
let androidTtsTimer = null;
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
 * Global subscriber for speech active state (UI speaker pulse animation)
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

// Background tab / Screen lock listener: stop speech cleanly if app goes hidden
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && speakingState) {
      stopSpeech();
    }
  });
}

/**
 * Voice Scoring Algorithm:
 * Evaluates available browser voices and scores them based on audio fidelity,
 * natural human inflection, and Indian / Devanagari phonetics.
 */
const scoreVoice = (v) => {
  if (!v) return 0;
  let score = 0;
  const name = (v.name || '').toLowerCase();
  const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');

  const isHindi = lang.startsWith('hi') || name.includes('hindi') || name.includes('हिन्दी');
  const isIndian = lang.includes('in') || name.includes('india');

  if (isHindi) {
    score += 70;
    // Microsoft Natural Neural voices (Top Tier on Windows & Microsoft Edge)
    if (name.includes('natural') || name.includes('neural')) score += 50;
    if (name.includes('swara')) score += 40; // Microsoft Swara Online (Natural) - Rank 1 Female
    if (name.includes('madhur')) score += 35; // Microsoft Madhur Online (Natural) - Rank 2 Male
    // Google WaveNet Neural (Google Chrome & Android)
    if (name.includes('google')) score += 30;
    if (name.includes('online')) score += 15;
  } else if (isIndian) {
    score += 25;
    if (name.includes('natural') || name.includes('neural')) score += 20;
    if (name.includes('neerja') || name.includes('prabhat')) score += 25;
    if (name.includes('google')) score += 15;
  }

  // Slight bonus if marked system default
  if (v.default) score += 5;

  return score;
};

/**
 * Selects the highest quality natural voice available on the user device.
 */
const selectBestVoice = () => {
  let voices = (cachedVoices && cachedVoices.length > 0) ? cachedVoices : loadVoices();
  // Cold-start safeguard: Query directly from window.speechSynthesis if cachedVoices is empty
  if (!voices || voices.length === 0) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const live = window.speechSynthesis.getVoices() || [];
        if (live.length > 0) {
          cachedVoices = live;
          voices = live;
        }
      } catch (e) {}
    }
  }

  if (!voices || voices.length === 0) {
    return { voice: null, lang: 'hi-IN' };
  }

  let bestVoice = null;
  let highestScore = -1;

  for (const v of voices) {
    const score = scoreVoice(v);
    if (score > highestScore) {
      highestScore = score;
      bestVoice = v;
    }
  }

  if (bestVoice && highestScore > 0) {
    return { voice: bestVoice, lang: bestVoice.lang || 'hi-IN' };
  }

  // Fallback to first available voice or default hi-IN
  return { voice: voices[0] || null, lang: voices[0]?.lang || 'hi-IN' };
};

/**
 * Chromium 10-second heartbeat watchdog
 * Prevents long sentences from being prematurely killed by Chromium's 15s silent cutoff bug
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
 * Immediately stops all active speech playback across all engines
 */
export const stopSpeech = () => {
  // Clear Android TTS duration timer if active
  if (androidTtsTimer) {
    clearTimeout(androidTtsTimer);
    androidTtsTimer = null;
  }

  // 0. Native Android APK TTS
  if (typeof window !== 'undefined' && window.AndroidTTS && typeof window.AndroidTTS.stop === 'function') {
    try {
      window.AndroidTTS.stop();
    } catch (e) {}
  }

  // 1. Audio stream queue
  isAudioQueueActive = false;
  audioQueue = [];
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }

  // 2. Web Speech Synthesis
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
 * Sanitizes and formats text for natural, dignified farmer speech:
 * - Translates currency symbols (₹ -> रुपये)
 * - Converts percentages and metric units to Hindi words
 * - Expands agricultural acronyms (NPK, DAP, KCC, MSP)
 * - Harmonizes Chhattisgarhi spellings for clear Devanagari TTS phonetics
 * - Strips Markdown, emojis, and unpronounceable characters
 */
export const cleanSpeechText = (raw) => {
  if (!raw) return '';
  return String(raw)
    // 0. Remove internal commas inside numbers (e.g. 3,100 -> 3100, 1,50,000 -> 150000)
    // Indian TTS voices skip 'हज़ार' or mispronounce when numbers contain commas
    .replace(/(\d+),(\d+)/g, '$1$2')
    .replace(/(\d+),(\d+)/g, '$1$2')
    // 1. Currency & Prices
    .replace(/₹\s*(\d+)/g, '$1 रुपये')
    .replace(/₹/g, 'रुपये ')
    // 2. Weather & Scientific Units
    .replace(/([\d\.]+)\s*%/g, '$1 प्रतिशत')
    .replace(/([\d\.]+)\s*km\/h/gi, '$1 किलोमीटर प्रति घंटा')
    .replace(/([\d\.]+)\s*°C/gi, '$1 डिग्री सेल्सियस')
    .replace(/([\d\.]+)\s*mm/gi, '$1 मिलीमीटर')
    .replace(/([\d\.]+)\s*kg/gi, '$1 किलोग्राम')
    .replace(/([\d\.]+)\s*टन/gi, '$1 टन')
    .replace(/([\d\.]+)\s*एकड़/gi, '$1 एकड़')
    // 3. Technical & Agricultural Acronyms
    .replace(/\bN:P:K\b/gi, 'एन पी के')
    .replace(/\bNPK\b/gi, 'एन पी के')
    .replace(/\bDAP\b/gi, 'डी ए पी')
    .replace(/\bGPS\b/gi, 'जी पी एस')
    .replace(/\bIoT\b/gi, 'आई ओ टी')
    .replace(/\bKCC\b/gi, 'किसान क्रेडिट कार्ड')
    .replace(/\bMSP\b/gi, 'समर्थन मूल्य')
    .replace(/\bSMS\b/gi, 'एस एम एस')
    .replace(/\bOTP\b/gi, 'ओ टी पी')
    .replace(/\bPIN\b/gi, 'पिन')
    .replace(/\bha\b/gi, 'हेक्टेयर')
    // 4. Chhattisgarhi Phonetic Enhancements for Standard Devanagari TTS
    .replace(/\s+म\s+/g, ' मां ') // Standalone postposition "म" (in/में) pronounced as natural "मां"
    .replace(/अऊ/g, 'अउ') // Phonetic smoothing of diphthong
    .replace(/नइ\s+हे/g, 'नई हे')
    .replace(/नइ\s+हो/g, 'नई हो')
    // 5. Clean Markdown, Punctuation & Emojis
    .replace(/[*_~#`]/g, '')
    .replace(/[•\-\–\—]/g, ' ')
    .replace(/https?:\/\/\S+/g, '') // remove URLs
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Splits long text into natural sentence chunks for emergency audio fallback
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
 * Tier 1 Primary: High-Fidelity Natural Neural Web Speech API
 * Speaks full sentences fluently with zero 140-char choppy stuttering.
 */
const speakViaWebSpeech = (cleanText, onEndCallback) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
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
  } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Chrome cold-start listener: attach best voice as soon as voices finish populating
    const handleVoicesReady = () => {
      const refreshed = selectBestVoice();
      if (refreshed.voice && activeUtterance === utterance) {
        utterance.voice = refreshed.voice;
      }
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesReady);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesReady);
  }

  utterance.lang = lang;
  utterance.rate = 0.92; // Calm, respectful pace for rural elders and clarity
  utterance.pitch = 1.0; // Natural conversational pitch

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
 * Tier 2 Emergency Fallback: Audio Stream Queue (only when Web Speech API is absent)
 */
const fallbackAudioStream = (cleanText, onEndCallback) => {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!isOnline) {
    speakingState = false;
    notifyListeners();
    return false;
  }

  const chunks = splitTextIntoChunks(cleanText);
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
      // Do NOT set crossOrigin = 'anonymous' to prevent CORS rejection on direct audio streams
      audio.src = url;
      currentAudio = audio;
      audio.playbackRate = 0.95;

      audio.onended = () => {
        playNextChunk();
      };

      audio.onerror = () => {
        console.warn('[Speech] Audio stream chunk failed');
        stopSpeech();
        if (onEndCallback) onEndCallback();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          stopSpeech();
          if (onEndCallback) onEndCallback();
        });
      }
    } catch (err) {
      console.warn('[Speech] Audio construction failed:', err);
      stopSpeech();
      if (onEndCallback) onEndCallback();
    }
  };

  playNextChunk();
  return true;
};

/**
 * Main Speak Function
 * Prioritizes High-Fidelity Natural Neural Web Speech API (Microsoft Swara / Google WaveNet);
 * Seamlessly falls back to native Android hardware or emergency audio stream.
 */
export const speakText = (text, onEndCallback) => {
  const clean = cleanSpeechText(text);
  if (!clean) return false;

  // CRITICAL: Stop any active microphone / speech recognition session immediately
  // to prevent the microphone from picking up and transcribing the speaker
  if (typeof window !== 'undefined' && typeof window._kisanStopVoiceRecognition === 'function') {
    try {
      window._kisanStopVoiceRecognition();
    } catch (e) {}
  }

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
      if (androidTtsTimer) {
        clearTimeout(androidTtsTimer);
        androidTtsTimer = null;
      }
      window.AndroidTTS.speak(clean);
      speakingState = true;
      notifyListeners();

      const durationMs = Math.max(2500, Math.min(30000, (clean.length / 13) * 1000));
      androidTtsTimer = setTimeout(() => {
        androidTtsTimer = null;
        if (speakingState && (currentText === text || currentText === clean)) {
          speakingState = false;
          currentText = null;
          notifyListeners();
          if (onEndCallback) onEndCallback();
        }
      }, durationMs);

      return true;
    } catch (err) {
      console.warn('[Speech] AndroidTTS bridge failed, falling back to Web Speech:', err);
    }
  }

  // TIER 1: HIGH-FIDELITY NATURAL NEURAL WEB SPEECH API (Zero-API-Key, Instant Playback)
  // Uses Microsoft Swara / Google Hindi WaveNet without 140-char choppy stuttering
  const webSpeechSuccess = speakViaWebSpeech(clean, onEndCallback);
  if (webSpeechSuccess) {
    return true;
  }

  // TIER 2: EMERGENCY FALLBACK AUDIO STREAM (Only if Web Speech API is missing in exotic browser)
  return fallbackAudioStream(clean, onEndCallback);
};

export const isSpeaking = () => {
  return speakingState || (typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.speaking : false);
};
