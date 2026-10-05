// किसान साथी - स्मार्ट ट्यूबवेल व मोटर कंट्रोलर सर्विस (Smart Tubewell & Motor Controller)

const STORAGE_KEY = 'kisan_motor_config';

export const getStoredMotorConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load motor config:', e);
  }
  return {
    starterPhone: '',
    starterName: 'बोरवेल 1 (मुख्य खेत)',
    motorHp: '5 HP',
    lastState: 'OFF',
    timerMinutes: 60,
    connectionMode: 'gsm' // 'gsm' | 'iot' | 'ble' | 'demo'
  };
};

export const saveMotorConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save motor config:', e);
  }
};

/**
 * GSM SMS कमांड तैयार करना
 * अधिकांश भारतीय कृषि GSM स्टार्टर (जैसे Shanti, Kisan Raja, Niagara) मानक कोड उपयोग करते हैं:
 * ON: 'START' या '1'
 * OFF: 'STOP' या '0'
 * STATUS: 'STATUS' या 'CHECK'
 */
export const getGsmActionUri = (phone, action = 'ON') => {
  const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
  const body = action === 'ON' ? 'START' : action === 'OFF' ? 'STOP' : 'STATUS';
  // SMS URI scheme
  return `sms:${cleanPhone}?body=${encodeURIComponent(body)}`;
};

/**
 * सिमुलेटेड / लाइव मोटर टेलीमेट्री स्थिति
 */
export const getMotorTelemetry = (isMotorOn = false) => {
  return {
    powerStatus: '3-Phase सक्रिय (Line Voltage 415V)',
    voltageL1: 415,
    voltageL2: 410,
    voltageL3: 418,
    currentAmps: isMotorOn ? 7.4 : 0, // 5 HP motor ~7.5 Amperes
    dryRunSafe: true, // बोरवेल में पर्याप्त पानी
    waterFlow: isMotorOn ? 'सक्रिय जल प्रवाह (Normal Flow)' : 'प्रवाह बंद',
    motorTemp: isMotorOn ? '42°C (सामान्य)' : '31°C (ठंडी)',
    health: 'उत्कृष्ट (No Fault)'
  };
};
