/**
 * 🎙️ किसान साथी - स्पीच रिकग्निशन सेवा (Voice-to-Text Speech Recognition)
 * 
 * ग्रामीण किसानों के लिए शून्य-टाइपिंग (Zero-Typing) इनपुट:
 * 1. Web Speech Recognition API ('webkitSpeechRecognition' / 'SpeechRecognition')
 * 2. 'hi-IN' भारतीय भाषा मॉडल जो छत्तीसगढ़ी और हिंदी उच्चारण को सटीक समझता है
 * 3. स्थानीय उपनाम मैपिंग (चांउर -> धान, बूट -> चना, लाखड़ी -> तीवड़ा)
 * 4. साइलेंस टाइमआउट (4.5 सेकंड) एवं ग्रेसफुल एरर हैंडलिंग
 */

import { notify } from '../services/notificationService';
import { stopSpeech } from './speech';

// स्थानीय छत्तीसगढ़ी उपनाम मैपिंग (Comprehensive CG Dialect & Produce Synonym Mapping)
export const CROP_SYNONYMS = {
  // 1. धान / चावल (Paddy / Rice)
  'चांउर': 'धान',
  'चांवर': 'धान',
  'चावल': 'धान',
  'dhan': 'धान',
  'paddy': 'धान',

  // 2. चना (Gram / Chickpea)
  'बूट': 'चना',
  'chana': 'चना',
  'gram': 'चना',

  // 3. मक्का (Maize / Corn)
  'जुनहरी': 'मक्का',
  'मक्कई': 'मक्का',
  'भुट्टा': 'मक्का',
  'maize': 'मक्का',

  // 4. अरहर (Pigeon Pea)
  'रहर': 'अरहर',
  'तुअर': 'अरहर',

  // 5. तीवड़ा / खेसरी (Grass Pea)
  'लाखड़ी': 'तीवड़ा',
  'खेसरी': 'तीवड़ा',
  'तिवड़ा': 'तीवड़ा',

  // 6. अलसी व तिलहन (Linseed / Mustard)
  'तीसी': 'अलसी',
  'तिलहन': 'अलसी',
  'तोरिया': 'सरसों',
  'राई': 'सरसों',

  // 7. सोयाबीन
  'सोया': 'सोयाबीन',

  // 8. स्थानीय सब्जियां (Regional CG Vegetables)
  'पताल': 'टमाटर',
  'पाताल': 'टमाटर',
  'भांटा': 'बैंगन',
  'भाटा': 'बैंगन',
  'गोंदली': 'प्याज',
  'गोंदलि': 'प्याज',
  'कंदा': 'आलू',
  'मिर्चा': 'मिर्च',
  'मिरचा': 'मिर्च',

  // 9. दलहन (Pulses)
  'उरद': 'उड़द',
  'मूंग': 'मूँग',

  // 10. मिलेट्स (Shree Anna / CG Millets)
  'कोदो': 'कोदो',
  'कुटकी': 'कुटकी',
  'मड़िया': 'रागी',
  'मंडिया': 'रागी',

  // 11. कीट, व्याधि व खाद (Pests, Diseases & Fertilizers)
  'माहो': 'माहू',
  'लाही': 'माहू',
  'कीरा': 'कीट',
  'खातू': 'खाद'
};

/**
 * जांचें कि क्या वर्तमान ब्राउज़र में स्पीच रिकग्निशन समर्थित है
 */
export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
};

let activeRecognizer = null;
let silenceTimer = null;
let isStartingRecognizer = false;

/**
 * बोले गए शब्द को मानक रूप में सामान्यीकृत करें (Normalize spoken dialect terms)
 */
export const normalizeSpokenQuery = (rawTranscript) => {
  if (!rawTranscript) return '';
  let clean = rawTranscript.trim().toLowerCase();

  // Check direct synonym lookup
  Object.keys(CROP_SYNONYMS).forEach((synonym) => {
    if (clean.includes(synonym.toLowerCase())) {
      clean = clean.replace(new RegExp(synonym, 'gi'), CROP_SYNONYMS[synonym]);
    }
  });

  return clean;
};

/**
 * माइक चालू करें और किसान की आवाज़ सुनें (Start Voice Recognition)
 * @param {Object} options
 * @param {Function} options.onResult - (transcript) => void
 * @param {Function} options.onListeningChange - (isListening) => void
 * @param {Function} options.onError - (errorMsg) => void
 * @param {number} options.silenceTimeoutMs - खामोशी समयसीमा (डिफ़ॉल्ट 4500ms)
 */
export const startVoiceRecognition = ({
  onResult,
  onListeningChange,
  onError,
  silenceTimeoutMs = 4500
}) => {
  if (!isSpeechRecognitionSupported()) {
    const msg = 'आपके ब्राउज़र में माइक वॉइस पहचान समर्थित नहीं है। कृपया नीचे दिए गए 1-टैप बटन छुएं।';
    notify.info(msg);
    if (onError) onError(msg);
    return null;
  }

  // Double-tap race condition guard: If recognizer is currently in the process of starting, ignore
  if (isStartingRecognizer) {
    return activeRecognizer;
  }
  isStartingRecognizer = true;

  // 1. CRITICAL: Halt any active TTS speech playback immediately
  // Prevents the microphone from picking up the phone speaker's own echo
  try {
    stopSpeech();
  } catch (e) {
    // quiet
  }

  // 2. Stop and release any existing microphone session
  stopVoiceRecognition();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();

  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.lang = 'hi-IN'; // Indian Hindi recognizer handles rural Devanagari phonetics best
  recognizer.maxAlternatives = 1;

  const resetSilenceTimer = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      stopVoiceRecognition();
    }, silenceTimeoutMs);
  };

  recognizer.onstart = () => {
    isStartingRecognizer = false;
    if (onListeningChange) onListeningChange(true);
    resetSilenceTimer();
  };

  recognizer.onresult = (event) => {
    resetSilenceTimer();
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const trans = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += trans;
      } else {
        interimTranscript += trans;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    if (transcript) {
      const normalized = normalizeSpokenQuery(transcript);
      if (onResult) onResult(normalized, transcript);
    }
  };

  recognizer.onerror = (event) => {
    isStartingRecognizer = false;
    console.warn('[SpeechRecognition] Error:', event.error);
    let userMsg = 'माइक से आवाज़ नहीं सुनी जा सकी।';

    if (event.error === 'not-allowed') {
      userMsg = 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र या फोन सेटिंग्स में माइक को "Allow" करें।';
    } else if (event.error === 'no-speech') {
      userMsg = 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर दोबारा बोलें।';
    } else if (event.error === 'network') {
      userMsg = 'वॉइस पहचान हेतु इंटरनेट धीमा है। नीचे दिए गए 1-टैप फसल बटन से चुनें।';
    }

    if (onError) onError(userMsg);
    stopVoiceRecognition();
  };

  recognizer.onend = () => {
    isStartingRecognizer = false;
    if (silenceTimer) clearTimeout(silenceTimer);
    if (onListeningChange) onListeningChange(false);
    activeRecognizer = null;
  };

  try {
    recognizer.start();
    activeRecognizer = recognizer;
  } catch (err) {
    isStartingRecognizer = false;
    console.warn('[SpeechRecognition] Start error:', err);
    if (onListeningChange) onListeningChange(false);
  }

  return recognizer;
};

/**
 * माइक बंद करें (Stop Voice Recognition)
 */
export const stopVoiceRecognition = () => {
  isStartingRecognizer = false;
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
  if (activeRecognizer) {
    try {
      // abort() releases hardware audio capture immediately, avoiding InvalidStateError on quick re-start
      if (typeof activeRecognizer.abort === 'function') {
        activeRecognizer.abort();
      } else {
        activeRecognizer.stop();
      }
    } catch (e) {
      // ignore
    }
    activeRecognizer = null;
  }
};

// Global hook for cross-module audio coordination
if (typeof window !== 'undefined') {
  window._kisanStopVoiceRecognition = stopVoiceRecognition;
}

