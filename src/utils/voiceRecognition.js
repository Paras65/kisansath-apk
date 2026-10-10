// किसान साथी — Voice Recognition & Voice-First Interaction (बोलकर पूछें)
// High-Fidelity Vernacular Audio Assistant (Hindi + Chhattisgarhi)
// Addresses 25+ Field & Edge Cases (Mic-TTS collision, 2G fallback, dialect phonetics, haptics)

import { stopSpeech, isSpeaking } from './speech';

let recognitionInstance = null;
let isListening = false;
let isStarting = false;
let watchdogTimer = null;
const stateListeners = new Set();

const notifyListeners = (state) => {
  stateListeners.forEach((fn) => {
    try {
      fn(state);
    } catch {
      // safe observer pattern
    }
  });
};

/**
 * Subscribe to recognition state changes.
 * state = { listening: bool, transcript: string, error: string|null }
 */
export const subscribeVoiceState = (fn) => {
  stateListeners.add(fn);
  fn({ listening: isListening, transcript: '', error: null });
  return () => stateListeners.delete(fn);
};

/** Returns true if browser supports Web Speech Recognition or Android Native Speech Bridge */
export const isVoiceSupported = () => {
  if (typeof window === 'undefined') return false;
  if (window.AndroidSpeech && typeof window.AndroidSpeech.startListening === 'function') {
    return true;
  }
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Safe Haptic feedback helper
const triggerHaptic = (pattern = [40]) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptics not allowed or not supported
    }
  }
};

/**
 * Vernacular Keyword → Navigation & Action Mapping
 * Carefully calibrated for Chhattisgarh agricultural speech patterns and code-switching
 */
export const KEYWORD_ROUTES = [
  // ── 1. फसल डॉक्टर (रोग, कीट, माहू, दवाई) ──
  {
    target: 'doctor',
    type: 'tab',
    label: 'फसल डॉक्टर',
    icon: '🌿',
    spokenHi: 'फसल डॉक्टर खोल रहे हैं, रोग और दवा की सलाह देखें।',
    spokenCg: 'हव बेटा! धान म कीरा-माहू लग गे हे का? चल फसल डॉक्टर खोल के दवाई देखाथंव!',
    keywords: [
      'फसल', 'बीमारी', 'कीड़ा', 'कीरा', 'पत्ती', 'पीला', 'पीलापन', 'सूखा', 'झुलसा',
      'कवक', 'फफूंद', 'रोग', 'खेत में समस्या', 'दवाई', 'कीटनाशक', 'स्प्रे', 'दवा',
      'धान में', 'मक्का में', 'सोयाबीन में', 'doctor', 'डॉक्टर', 'इल्ली', 'टिड्डी',
      'तना छेदक', 'सड़न', 'उकठा', 'ब्लास्ट', 'शीथ ब्लाइट', 'पत्ता मरोड़', 'दवा छिड़काव', 'टंकी',
      // Chhattisgarhi & Hinglish / Phonetic triggers
      'माहू', 'माहुर', 'पाना पीयर', 'खेत के रोग', 'फसल खराब', 'दवाई बताव', 'का डारूँ',
      'का छिड़काव', 'गाभा छेदक', 'सुंडी', 'चेपा', 'दवाई कौन',
      'bimari', 'keeda', 'keera', 'kira', 'mahu', 'mahur', 'dawai', 'dawa', 'spray',
      'fasal', 'patti', 'peela', 'peeli', 'jhulsa', 'blast', 'khaira', 'chepa', 'illi'
    ],
  },

  // ── 2. मंडी भाव एवं धान खरीदी (MSP, 3100, टोकन) ──
  {
    target: 'mandi',
    type: 'tab',
    label: 'मंडी भाव',
    icon: '🏪',
    spokenHi: 'मंडी भाव और समर्थन मूल्य खोल रहे हैं।',
    spokenCg: 'का कहिथस, धान बेचना हे? ₹3,100 रुपया के भाव चाही? चल मंडी भाव देखाथंव!',
    keywords: [
      'मंडी', 'भाव', 'दाम', 'कीमत', 'बेचना', 'बिक्री', 'मार्केट', 'धान का भाव',
      'msp', 'समर्थन मूल्य', 'रेट', 'धान खरीदी', 'उपार्जन', 'तौल', 'बोनस',
      '3100', '३१००', 'कृषक उन्नति', 'सोसायटी', 'मंडी भाव',
      // Chhattisgarhi & Hinglish triggers
      'मंडी म', 'धान बेचना', 'बाज़ार भाव', 'पईसा', 'कतना पईसा', 'धान के रेट',
      '३१०० रुपया', 'धान के पईसा', 'धान बिकाही', 'सोसायटी म',
      'dhan', 'bhav', 'bhaav', 'rate', 'price', 'dam', 'daam', 'paisa', 'bechna', 'chawal', 'kharidi'
    ],
  },

  // ── 3. टोकन मार्गदर्शिका (टोकन तुंहर हाथ) ──
  {
    target: 'token',
    type: 'modal',
    label: 'टोकन तुंहर हाथ',
    icon: '🎫',
    spokenHi: 'धान टोकन मार्गदर्शिका खोल रहे हैं।',
    spokenCg: 'अरे टोकन कटाना हे? हड़बड़ा झन, चल टोकन तुंहर हाथ के पूरा रद्दा बताथंव!',
    keywords: [
      'टोकन', 'टोकन तुंहर हाथ', 'टोकन काटना', 'टोकन कइसे', 'token', 'टोकन पर्ची',
      'टोकन डेट', 'टोकन तारीख', 'tuhar hath', 'parchi', 'slot'
    ],
  },

  // ── 4. खाद कैलकुलेटर एवं सरकारी योजना ──
  {
    target: 'schemes',
    type: 'tab',
    label: 'खाद व योजना',
    icon: '🧮',
    spokenHi: 'खाद कैलकुलेटर और सरकारी योजनाएं खोल रहे हैं।',
    spokenCg: 'कतना खाद डालना हे? डीएपी अउ यूरिया के हिसाब जोड़थंव, चल देख!',
    keywords: [
      'खाद', 'उर्वरक', 'npk', 'dap', 'यूरिया', 'पोटाश', 'कैलकुलेटर', 'हिसाब',
      'कितनी खाद', 'calculator', 'योजना', 'सरकारी', 'pm kisan', 'पीएम किसान',
      'किसान क्रेडिट', 'kcc', 'लोन', 'सब्सिडी', 'किस्त', 'ऋण', 'बीमा', 'फसल बीमा',
      // Chhattisgarhi & Hinglish
      'खाद कतना', 'सरकारी योजना', 'पैसा कब', 'खाद हिसाब', 'पैसा कब आही', 'किस्त कब',
      'khad', 'khaad', 'urea', 'yuriya', 'potash', 'subsidy', 'loan', 'fasal bima'
    ],
  },

  // ── 5. मोटर / ट्यूबवेल / पंप नियंत्रक ──
  {
    target: 'motor',
    type: 'modal',
    label: 'मोटर कंट्रोलर',
    icon: '⚙️',
    spokenHi: 'खेत की मोटर नियंत्रक खोल रहे हैं।',
    spokenCg: 'बोर के मोटर चालू करना हे? रुकव, मोटर कंट्रोलर खोलत हंव!',
    keywords: [
      'मोटर', 'पंप', 'ट्यूबवेल', 'बोर', 'बोरवेल', 'पानी चलाना', 'सिंचाई मोटर',
      'मोटर चालू', 'मोटर बंद', 'लाइट', 'बिजली', 'motor', 'pump',
      'motar', 'borewell', 'borwell', 'tubewell', 'starter', 'bijli'
    ],
  },

  // ── 6. मेरा खेत / फसल कैलेंडर ──
  {
    target: 'khet',
    type: 'modal',
    label: 'मेरा खेत',
    icon: '📅',
    spokenHi: 'मेरा खेत फसल कैलेंडर खोल रहे हैं।',
    spokenCg: 'अपन खेत के हाल-चाल देखना हे? चल तोर खेत के कैलेंडर खोलथंव!',
    keywords: [
      'मेरा खेत', 'अपन खेत', 'खेत का हाल', 'बुआई', 'बोवाई', 'रोपाई',
      'फसल चक्र', 'कैलेंडर', 'फसल के दिन', 'khet', 'apna khet', 'mera khet', 'calendar'
    ],
  },

  // ── 7. किसान चौपाल (समुदाय एवं चर्चा) ──
  {
    target: 'chaupal',
    type: 'tab',
    label: 'किसान चौपाल',
    icon: '💬',
    spokenHi: 'किसान चौपाल मंच खोल रहे हैं।',
    spokenCg: 'गाँव के किसान भाई मन ले गोठ-बात करना हे? चल चौपाल म बइठथन!',
    keywords: [
      'चौपाल', 'सवाल', 'पूछना', 'दूसरे किसान', 'community', 'forum', 'सलाह',
      'बात करना', 'चर्चा', 'मदद', 'समुदाय',
      // Chhattisgarhi
      'चौपाल म', 'किसान भाई', 'गोठ बात', 'गोठ-बात', 'chaupal'
    ],
  },

  // ── 8. मौसम एवं मुख्य पृष्ठ ──
  {
    target: 'home',
    type: 'tab',
    label: 'मुख्य पृष्ठ व मौसम',
    icon: '🏠',
    spokenHi: 'मौसम और मुख्य पृष्ठ खोल रहे हैं।',
    spokenCg: 'पानी गिरे वाला हे का? बादर छाये हे? चल आज के मौसम देखाथंव!',
    keywords: [
      'मौसम', 'बारिश', 'आंधी', 'तूफान', 'धूप', 'तापमान', 'weather', 'कल कैसा',
      'आज का मौसम', 'घर', 'होम', 'home', 'मुख्य',
      // Chhattisgarhi & Hinglish
      'बरसात', 'पानी कब', 'मौसम कइसन हे', 'बादल', 'हवा',
      'mausam', 'mosam', 'barish', 'baarish', 'rain', 'badal', 'dhup'
    ],
  },

  // ── 9. आदरणीय अभिवादन (Greetings & Bhaira Kaka Callout) ──
  {
    target: 'greeting',
    type: 'action',
    label: 'नमस्ते / जय जोहार',
    icon: '👴🏻',
    spokenHi: 'नमस्ते किसान भाई! बताइए क्या जानना चाहते हैं — धान का भाव, खाद या कोई दवाई?',
    spokenCg: 'जय जोहार संगी! राम राम! बताव का जानना चाहत हव — धान के भाव, खाद कि कोनो दवाई?',
    keywords: [
      'जय जोहार', 'राम राम', 'नमस्ते', 'नमस्कार', 'प्रणाम', 'हेलो', 'जोहार',
      'hello', 'hi', 'काका', 'बहिरा काका', 'काका सुन', 'काका सुनव', 'काका बताव',
      'ओ काका', 'काका जी', 'kaka', 'bhaira kaka', 'johar', 'jay johar', 'ram ram', 'kaise ho'
    ],
  },

  // ── 10. मोडल इन-फॉर्म कार्य (Smart In-Modal Save & Close) ──
  {
    target: 'modal_close',
    type: 'modal_action',
    action: 'close',
    label: 'डायलॉग बंद',
    icon: '❌',
    spokenHi: 'डायलॉग बंद कर दिया गया।',
    spokenCg: 'ले बेटा, डायलॉग ला बंद कर देगेंव!',
    keywords: [
      'बंद करो', 'बंद करव', 'काटो', 'हटाओ', 'हटाव', 'रद्द करो', 'रद्द करव',
      'वापस जाओ', 'वापस जाव', 'पीछे जाओ', 'close', 'cancel', 'back', 'band karo', 'band karav'
    ],
  },
  {
    target: 'modal_save',
    type: 'modal_action',
    action: 'save',
    label: 'जानकारी सहेजें',
    icon: '💾',
    spokenHi: 'जानकारी सहेजी जा रही है।',
    spokenCg: 'हव बेटा, तोर जानकारी सहेज देगेंव! निश्चिंत रहव!',
    keywords: [
      'सहेजें', 'सहेजो', 'सहेजव', 'सेव करो', 'सेव करव', 'सबमिट करो', 'सबमिट करव',
      'जमा करो', 'जमा करव', 'आगे बढ़ो', 'आगे बढ़व', 'save', 'submit', 'done', 'save karo'
    ],
  },
];

/** Extract acre number from speech e.g. "2 एकड़", "डेढ़ एकड़" */
export const extractAcreage = (transcript) => {
  if (!transcript) return null;
  const match = transcript.match(/(\d+(?:\.\d+)?)\s*(?:एकड़|एकड|acre)/i);
  if (match) return parseFloat(match[1]);
  const wordMap = {
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
    'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'डेढ़': 1.5, 'ढाई': 2.5
  };
  for (const [word, val] of Object.entries(wordMap)) {
    if (transcript.includes(word) && transcript.includes('एकड़')) {
      return val;
    }
  }
  return null;
};

/**
 * Match spoken transcript against all vernacular routes.
 * Case-insensitive, whitespace sanitized.
 */
export const matchVoiceRoute = (transcript) => {
  if (!transcript) return null;
  const clean = transcript.toLowerCase().trim();

  // Try exact keyword containment
  for (const route of KEYWORD_ROUTES) {
    for (const kw of route.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        return route;
      }
    }
  }
  return null;
};

// Automatic cleanup on app backgrounding (lock phone / incoming call)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isListening) {
      stopVoiceRecognition();
    }
  });
}

/**
 * Start voice recognition with comprehensive edge case protections:
 * - Cancels active TTS beforehand to prevent echo feedback loop (E01)
 * - Rapid tap debouncing (E02)
 * - 8-second ambient noise watchdog timer (E08)
 * - Haptic feedback (E25)
 * - Friendly vernacular error responses (E05, E06, E07)
 */
export const startVoiceRecognition = (onResult, onError) => {
  if (!isVoiceSupported()) {
    if (onError) onError('आपका ब्राउज़र आवाज़ पहचान को सपोर्ट नहीं करता।');
    return;
  }

  // E02: Prevent duplicate calls if already starting
  if (isStarting) return;
  isStarting = true;

  // E01: Stop all active TTS immediately so mic doesn't hear the speaker!
  if (isSpeaking()) {
    stopSpeech();
  }

  // Stop any lingering session
  stopVoiceRecognition();

  const clearWatchdog = () => {
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }
  };

  // ── Native Android Speech Recognition Bridge (APK / TWA / Capacitor) ──
  if (
    typeof window !== 'undefined' &&
    window.AndroidSpeech &&
    typeof window.AndroidSpeech.startListening === 'function'
  ) {
    isStarting = false;
    isListening = true;
    triggerHaptic([45]);

    clearWatchdog();
    watchdogTimer = setTimeout(() => {
      if (isListening) {
        stopVoiceRecognition();
        if (onError) onError('समय समाप्त हुआ। शांत जगह पर फिर से बोलें।', 'timeout');
      }
    }, 9000);

    window._kisanOnNativeSpeechState = (state) => {
      if (state === 'ready' || state === 'beginning') {
        isListening = true;
        notifyListeners({ listening: true, transcript: '', error: null });
      }
    };

    window._kisanOnNativeSpeechPartial = (partial) => {
      notifyListeners({ listening: true, transcript: partial, error: null });
    };

    window._kisanOnNativeSpeechResult = (text) => {
      clearWatchdog();
      triggerHaptic([30, 40, 30]);
      const best = (text || '').trim();
      const matched = matchVoiceRoute(best);
      notifyListeners({ listening: false, transcript: best, error: null });
      isListening = false;
      isStarting = false;

      // Sequence buffer to let audio hardware switch from mic to speaker cleanly
      setTimeout(() => {
        if (onResult) onResult(best, matched);
      }, 260);
    };

    window._kisanOnNativeSpeechError = (code) => {
      clearWatchdog();
      isListening = false;
      isStarting = false;

      let friendly = 'आवाज़ पहचान में समस्या आई। फिर से बोलें।';
      if (code === 'permission_needed' || code === 9) {
        friendly = '🎤 माइक्रोफ़ोन की अनुमति बंद है। कृपया ऐप सेटिंग्स में अनुमति दें।';
      } else if (code === 6 || code === 7) {
        friendly = 'कुछ सुनाई नहीं दिया। कृपया फिर से बोलें।';
      } else if (code === 1 || code === 2) {
        friendly = 'इंटरनेट धीमा है, थोड़ा इंतज़ार करके दोबारा बोलें।';
      }

      notifyListeners({ listening: false, transcript: '', error: friendly });
      if (onError) onError(friendly, code);
    };

    window._kisanStopVoiceRecognition = stopVoiceRecognition;
    notifyListeners({ listening: true, transcript: '', error: null });

    try {
      window.AndroidSpeech.startListening();
    } catch (err) {
      clearWatchdog();
      isListening = false;
      isStarting = false;
      if (onError) onError('माइक्रोफ़ोन शुरू करने में समस्या आई।', err?.message);
    }
    return;
  }

  // ── Standard Web Speech Recognition (Chrome / Safari / PWA) ──
  try {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();

    recognition.lang = 'hi-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    let accumulatedFinal = '';
    let latestInterim = '';
    let silenceDebounceTimer = null;
    let isFinishing = false;

    const clearTimers = () => {
      clearWatchdog();
      if (silenceDebounceTimer) {
        clearTimeout(silenceDebounceTimer);
        silenceDebounceTimer = null;
      }
    };

    const finishWebRecognition = (textToDeliver) => {
      if (isFinishing) return;
      isFinishing = true;
      clearTimers();

      const bestText = (textToDeliver || '').trim();
      const matched = matchVoiceRoute(bestText);

      isListening = false;
      isStarting = false;
      notifyListeners({ listening: false, transcript: bestText, error: null });

      if (recognitionInstance) {
        try {
          recognitionInstance.abort();
        } catch {}
        recognitionInstance = null;
      }

      setTimeout(() => {
        if (onResult && bestText.length > 0) {
          onResult(bestText, matched);
        }
      }, 220);
    };

    recognition.onstart = () => {
      isStarting = false;
      isListening = true;
      isFinishing = false;
      accumulatedFinal = '';
      latestInterim = '';
      triggerHaptic([45]);

      // Safety watchdog against ambient engine or wind noise in fields
      clearWatchdog();
      watchdogTimer = setTimeout(() => {
        if (isListening && !isFinishing) {
          const currentSpoken = (accumulatedFinal + (latestInterim ? ' ' + latestInterim : '')).trim();
          if (currentSpoken.length >= 2) {
            finishWebRecognition(currentSpoken);
          } else {
            stopVoiceRecognition();
            if (onError) onError('समय समाप्त हुआ। शांत जगह पर फिर से बोलें।', 'timeout');
          }
        }
      }, 12000);

      window._kisanStopVoiceRecognition = stopVoiceRecognition;
      notifyListeners({ listening: true, transcript: '', error: null });
    };

    recognition.onresult = (event) => {
      if (isFinishing) return;

      let freshFinal = '';
      let freshInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        const piece = (item[0]?.transcript || '').trim();
        if (item.isFinal) {
          freshFinal += (freshFinal ? ' ' : '') + piece;
        } else {
          freshInterim += (freshInterim ? ' ' : '') + piece;
        }
      }

      accumulatedFinal = freshFinal;
      latestInterim = freshInterim;

      const currentSpoken = (freshFinal + (freshInterim ? ' ' + freshInterim : '')).trim();

      if (currentSpoken) {
        // Stream live transcript to UI so farmer sees words appearing as they speak
        notifyListeners({ listening: true, transcript: currentSpoken, error: null });

        // Reset silence debounce timer: Wait 1800ms of quiet after speaking before completing
        if (silenceDebounceTimer) {
          clearTimeout(silenceDebounceTimer);
        }
        silenceDebounceTimer = setTimeout(() => {
          if (isListening && !isFinishing) {
            triggerHaptic([30, 40, 30]);
            finishWebRecognition(currentSpoken);
          }
        }, 1800);
      }
    };

    recognition.onerror = (event) => {
      if (isFinishing) return;
      clearTimers();
      isListening = false;
      isStarting = false;
      notifyListeners({ listening: false, transcript: '', error: event.error });

      let friendly = 'आवाज़ पहचान में समस्या आई।';
      if (event.error === 'not-allowed') {
        friendly = '🎤 माइक्रोफ़ोन की अनुमति बंद है। कृपया ब्राउज़र सेटिंग से चालू करें।';
      } else if (event.error === 'no-speech') {
        friendly = 'कुछ सुनाई नहीं दिया। कृपया फिर से बोलें।';
      } else if (event.error === 'network') {
        friendly = 'इंटरनेट धीमा है, थोड़ा इंतज़ार करके दोबारा बोलें।';
      }

      if (onError) onError(friendly, event.error);
    };

    recognition.onend = () => {
      clearTimers();
      isStarting = false;
      if (isListening && !isFinishing) {
        const currentSpoken = (accumulatedFinal + (latestInterim ? ' ' + latestInterim : '')).trim();
        if (currentSpoken.length >= 2) {
          finishWebRecognition(currentSpoken);
        } else {
          isListening = false;
          notifyListeners({ listening: false, transcript: '', error: null });
        }
      }
    };

    recognition.start();
    recognitionInstance = recognition;
  } catch (err) {
    clearWatchdog();
    isStarting = false;
    isListening = false;
    if (onError) onError('माइक्रोफ़ोन शुरू करने में समस्या आई।', err?.message);
  }
};

/** Stop the active recognition session cleanly */
export const stopVoiceRecognition = () => {
  if (watchdogTimer) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
  if (
    typeof window !== 'undefined' &&
    window.AndroidSpeech &&
    typeof window.AndroidSpeech.stopListening === 'function'
  ) {
    try {
      window.AndroidSpeech.stopListening();
    } catch {
      // safe stop
    }
  }
  if (recognitionInstance) {
    try {
      recognitionInstance.abort();
    } catch {
      // safe abort
    }
    recognitionInstance = null;
  }
  isStarting = false;
  if (isListening) {
    isListening = false;
    notifyListeners({ listening: false, transcript: '', error: null });
  }
};

export const isRecognitionActive = () => isListening;
