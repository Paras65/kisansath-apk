// किसान साथी - बहिरा काका सत्र प्रबंधक (Multi-Turn Session State Manager)
// Maintains 45s conversational context for follow-up questions and slot-filling

let kakaSession = {
  activeIntent: null, // 'PADDY_SALE' | 'FERTILIZER' | 'MANDI' | 'WEATHER' | 'DOCTOR' | 'ASK_MOTOR'
  pendingIntent: null, // backward compatibility
  collectedSlots: {}, // { acre, crop, district, commodity, symptoms }
  timestamp: 0,
};

export const resetKakaSession = () => {
  kakaSession = { activeIntent: null, pendingIntent: null, collectedSlots: {}, timestamp: 0 };
};

export const setKakaSession = (intent, slots = {}) => {
  kakaSession = {
    activeIntent: intent,
    pendingIntent: intent,
    collectedSlots: { ...slots },
    timestamp: Date.now(),
  };
};

export const getKakaSession = () => {
  if (Date.now() - (kakaSession.timestamp || 0) > 45000) {
    kakaSession = { activeIntent: null, pendingIntent: null, collectedSlots: {}, timestamp: 0 };
  }
  return kakaSession;
};

