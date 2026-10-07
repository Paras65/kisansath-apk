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

// स्थानीय छत्तीसगढ़ी उपनाम मैपिंग (Dialect Synonym Mapping)
export const CROP_SYNONYMS = {
  'चांउर': 'धान',
  'चांवर': 'धान',
  'चावल': 'धान',
  'dhan': 'धान',
  'paddy': 'धान',
  'बूट': 'चना',
  'chana': 'चना',
  'gram': 'चना',
  'जुनहरी': 'मक्का',
  'मक्कई': 'मक्का',
  'भुट्टा': 'मक्का',
  'maize': 'मक्का',
  'रहर': 'अरहर',
  'तुअर': 'अरहर',
  'लाखड़ी': 'तीवड़ा',
  'खेसरी': 'तीवड़ा',
  'तिवड़ा': 'तीवड़ा',
  'तीसी': 'अलसी',
  'तिलहन': 'अलसी',
  'सोया': 'सोयाबीन'
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

  // Stop any existing session
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
    console.warn('[SpeechRecognition] Error:', event.error);
    let userMsg = 'माइक से आवाज़ नहीं सुनी जा सकी।';

    if (event.error === 'not-allowed') {
      userMsg = 'कृपया माइक की अनुमति (Permission) दें।';
    } else if (event.error === 'no-speech') {
      userMsg = 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर दोबारा बोलें।';
    } else if (event.error === 'network') {
      userMsg = 'वॉइस पहचान हेतु नेटवर्क धीमा है। नीचे दिए गए बटन छुएं।';
    }

    if (onError) onError(userMsg);
    stopVoiceRecognition();
  };

  recognizer.onend = () => {
    if (silenceTimer) clearTimeout(silenceTimer);
    if (onListeningChange) onListeningChange(false);
    activeRecognizer = null;
  };

  try {
    recognizer.start();
    activeRecognizer = recognizer;
  } catch (err) {
    console.warn('[SpeechRecognition] Start error:', err);
    if (onListeningChange) onListeningChange(false);
  }

  return recognizer;
};

/**
 * माइक बंद करें (Stop Voice Recognition)
 */
export const stopVoiceRecognition = () => {
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
  if (activeRecognizer) {
    try {
      activeRecognizer.stop();
    } catch (e) {
      // ignore
    }
    activeRecognizer = null;
  }
};

