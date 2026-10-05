// किसान साथी - स्पीच और वॉयस सहायता (Web Speech API)

let currentUtterance = null;

export const speakText = (text, onEndCallback) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || text.trim() === '') return false;

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Attempt to select Hindi voice if available
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(
    (v) => v.lang.includes('hi') || v.lang.includes('hi-IN') || v.name.toLowerCase().includes('hindi')
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
    console.log('[Speech Error]', e);
    currentUtterance = null;
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(utterance);
  return true;
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

export const isSpeaking = () => {
  return window.speechSynthesis ? window.speechSynthesis.speaking : false;
};
