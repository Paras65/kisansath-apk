// किसान साथी - सेंट्रलाइज्ड स्मार्ट डिवाइस एवं हार्डवेयर मैनेजर सर्विस (Centralized Smart Device & Hardware Manager)
import { getStoredMotorConfig, saveMotorConfig, getMotorTelemetry } from '../utils/motorControllerService';
import { isWebBluetoothSupported, generateSimulatedSoilData } from '../utils/bluetoothSoilSensor';
import { getActiveFarmer } from './farmerService';

const getHubStorageKey = () => {
  const farmer = getActiveFarmer();
  const phone = farmer && farmer.phone ? farmer.phone.replace(/[\s\-\+]/g, '').slice(-10) : 'default';
  return `kisan_device_hub_registry_${phone}`;
};

// डिफ़ॉल्ट डिवाइस रजिस्ट्री (Multi-Farmer Isolated)
const DEFAULT_REGISTRY = {
  motor: {
    id: 'motor-1',
    name: 'स्मार्ट ट्यूबवेल मोटर (GSM/IoT)',
    type: 'gsm_motor',
    phone: '',
    pin: '1234', // 4-अंकीय स्टार्टर सुरक्षा पिन (CLI / SMS Auth)
    hp: '5 HP',
    status: 'OFF',
    timerMinutes: 60,
    voltage: '415V (3-Phase)',
    lastSeen: 'अभी',
    configured: false
  },
  soilProbe: {
    id: 'soil-ble-1',
    name: 'स्मार्ट मिट्टी IoT सेंसर (AgriProbe BLE)',
    type: 'bluetooth_sensor',
    connected: false,
    deviceName: null,
    battery: 85,
    lastReading: null,
    lastSeen: 'अंतिम जांच: आज',
    configured: true
  },
  gpsTracker: {
    id: 'gps-field-1',
    name: 'खेत सीमा GPS मापक',
    type: 'gps_satellite',
    accuracy: '±2.5m (High Precision)',
    satellites: 14,
    status: 'READY',
    lastSeen: 'सक्रिय'
  },
  smartSprayer: {
    id: 'sprayer-1',
    name: 'स्मार्ट 15L स्प्रे पंप व फ्लो मीटर',
    type: 'spray_controller',
    tankCapacity: 15,
    flowRate: '1.2 L/min',
    status: 'READY',
    lastSeen: 'मानक सेट'
  }
};

let listeners = [];

export const getDeviceRegistry = () => {
  try {
    const key = getHubStorageKey();
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Synchronize with stored motor config
      const motorCfg = getStoredMotorConfig();
      if (motorCfg && motorCfg.starterPhone) {
        parsed.motor.phone = motorCfg.starterPhone;
        parsed.motor.status = motorCfg.lastState || 'OFF';
        parsed.motor.timerMinutes = motorCfg.timerMinutes || 60;
        parsed.motor.pin = motorCfg.pin || parsed.motor.pin || '1234';
        parsed.motor.configured = true;
      }

      // Timer Auto-Cutoff Check
      if (parsed.motor?.status === 'ON' && parsed.motor?.timerStartedAt && parsed.motor?.timerMinutes) {
        const elapsedMinutes = (Date.now() - parsed.motor.timerStartedAt) / (1000 * 60);
        if (elapsedMinutes >= parsed.motor.timerMinutes) {
          parsed.motor.status = 'OFF';
          parsed.motor.timerStartedAt = null;
          parsed.motor.lastSeen = 'टाइमर स्वतः पूरा हुआ';
          saveDeviceRegistry(parsed);
        }
      }

      return { ...DEFAULT_REGISTRY, ...parsed };
    }
  } catch (e) {
    console.error('[DeviceManager] Failed to load registry:', e);
  }

  // Load from motor controller
  const motorCfg = getStoredMotorConfig();
  const init = { ...DEFAULT_REGISTRY };
  if (motorCfg && motorCfg.starterPhone) {
    init.motor.phone = motorCfg.starterPhone;
    init.motor.status = motorCfg.lastState || 'OFF';
    init.motor.timerMinutes = motorCfg.timerMinutes || 60;
    init.motor.pin = motorCfg.pin || '1234';
    init.motor.configured = true;
  }
  return init;
};

export const saveDeviceRegistry = (registry) => {
  try {
    const key = getHubStorageKey();
    localStorage.setItem(key, JSON.stringify(registry));
    notifyListeners(registry);
  } catch (e) {
    console.error('[DeviceManager] Failed to save registry:', e);
  }
};

export const updateDevice = (key, updates) => {
  const current = getDeviceRegistry();
  const updated = {
    ...current,
    [key]: {
      ...current[key],
      ...updates,
      lastSeen: 'अभी-अभी'
    }
  };

  // Keep motor controller in sync
  if (key === 'motor') {
    const motorCfg = getStoredMotorConfig();
    const newMotorCfg = {
      ...motorCfg,
      starterPhone: updates.phone !== undefined ? updates.phone : motorCfg.starterPhone,
      lastState: updates.status !== undefined ? updates.status : motorCfg.lastState,
      timerMinutes: updates.timerMinutes !== undefined ? updates.timerMinutes : motorCfg.timerMinutes,
      pin: updates.pin !== undefined ? updates.pin : (motorCfg.pin || '1234')
    };
    saveMotorConfig(newMotorCfg);
  }

  saveDeviceRegistry(updated);
  return updated;
};

export const subscribeDeviceRegistry = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
};

const notifyListeners = (data) => {
  listeners.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.error('[DeviceManager] Listener error:', e);
    }
  });
};

export const validateIndianPhone = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, cleanPhone: '', message: 'मोबाइल नंबर दर्ज करना अनिवार्य है' };
  }
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  if (digits.length !== 10) {
    return { isValid: false, cleanPhone: digits, message: 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए' };
  }
  if (!/^[6-9]/.test(digits)) {
    return { isValid: false, cleanPhone: digits, message: 'भारतीय मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए' };
  }
  return { isValid: true, cleanPhone: digits, message: 'वैध मोबाइल नंबर' };
};

export const validateStarterPin = (rawPin) => {
  if (!rawPin || typeof rawPin !== 'string') {
    return { isValid: false, cleanPin: '1234', message: 'पिन दर्ज करना अनिवार्य है' };
  }
  const digits = rawPin.replace(/\D/g, '').slice(0, 4);
  if (digits.length !== 4) {
    return { isValid: false, cleanPin: digits, message: 'सुरक्षा पिन ठीक 4 अंकों का होना चाहिए' };
  }
  return { isValid: true, cleanPin: digits, message: 'वैध सुरक्षा पिन' };
};

export const getConnectedDevicesCount = () => {
  const reg = getDeviceRegistry();
  let count = 0;
  if (reg.motor && (reg.motor.status === 'ON' || reg.motor.configured)) count += 1;
  if (reg.soilProbe && reg.soilProbe.connected) count += 1;
  if (reg.gpsTracker && reg.gpsTracker.status === 'READY') count += 1;
  if (reg.smartSprayer && reg.smartSprayer.status === 'READY') count += 1;
  return count;
};

// Global Reactive Listeners for Multi-User Profile Swapping
if (typeof window !== 'undefined') {
  window.addEventListener('kisan_farmer_session_changed', () => {
    const freshReg = getDeviceRegistry();
    notifyListeners(freshReg);
  });
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('kisan_device_hub_registry')) {
      const freshReg = getDeviceRegistry();
      notifyListeners(freshReg);
    }
  });
}
