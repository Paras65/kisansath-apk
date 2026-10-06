// किसान साथी - स्मार्ट मिट्टी जांच ब्लूटूथ (BLE) व IoT सेंसर सर्विस (Web Bluetooth API)

export const isWebBluetoothSupported = () => {
  return (
    typeof navigator !== 'undefined' &&
    'bluetooth' in navigator &&
    typeof navigator.bluetooth?.requestDevice === 'function'
  );
};

// मानक मृदा मापदंड विश्लेषण व निदान
export const analyzeSoilTelemetry = (data) => {
  if (!data) return null;

  const { ph, moisture, nitrogen, phosphorus, potassium, ec, temperature } = data;

  // 1. pH विश्लेषण
  let phStatus = 'आदर्श (संतुलित)';
  let phColor = '#2e7d32';
  let phAdvice = 'मिट्टी का pH पूर्णतः संतुलित है। सभी पोषक तत्वों का अवशोषण सुचारू रहेगा।';

  if (ph < 5.5) {
    phStatus = 'अत्यधिक अम्लीय (Acidic)';
    phColor = '#c62828';
    phAdvice = 'मिट्टी अधिक अम्लीय है। प्रति एकड़ 150-200 किलो कृषि चूना (Agricultural Lime) जुताई के समय मिलाएं।';
  } else if (ph < 6.2) {
    phStatus = 'मध्यम अम्लीय';
    phColor = '#f57f17';
    phAdvice = 'मिट्टी में हल्की अम्लता है। गोबर की सड़ी खाद या वर्मीकम्पोस्ट का प्रयोग बढ़ाएं।';
  } else if (ph > 7.8) {
    phStatus = 'क्षारीय (Alkaline)';
    phColor = '#c62828';
    phAdvice = 'मिट्टी क्षारीय है। प्रति एकड़ 100-150 किलो जिप्सम या हरी खाद (ढैंचा/सनई) की जुताई करें।';
  }

  // 2. नमी (Moisture) विश्लेषण
  let moistureStatus = 'पर्याप्त नमी';
  let moistureColor = '#0288d1';
  let moistureAdvice = 'वर्तमान में सिंचाई की आवश्यकता नहीं है।';

  if (moisture < 25) {
    moistureStatus = 'अत्यधिक शुष्क (कम नमी)';
    moistureColor = '#d32f2f';
    moistureAdvice = 'मिट्टी में नमी की भारी कमी है। तुरंत हल्की सिंचाई करें ताकि फसल में सूखा न पड़े।';
  } else if (moisture > 75) {
    moistureStatus = 'जलभराव (Waterlogged)';
    moistureColor = '#f57f17';
    moistureAdvice = 'मिट्टी में जलभराव है। खेत से अतिरिक्त पानी निकालने की नाली खोलें ताकि जड़ों में सड़न न हो।';
  }

  // 3. N-P-K विश्लेषण
  const nLevel = nitrogen < 160 ? 'कम' : nitrogen > 280 ? 'अधिक' : 'मध्यम';
  const pLevel = phosphorus < 14 ? 'कम' : phosphorus > 25 ? 'अधिक' : 'मध्यम';
  const kLevel = potassium < 180 ? 'कम' : potassium > 300 ? 'अधिक' : 'मध्यम';

  return {
    phStatus,
    phColor,
    phAdvice,
    moistureStatus,
    moistureColor,
    moistureAdvice,
    nLevel,
    pLevel,
    kLevel,
    ureaAdjustment: nLevel === 'कम' ? '+15% अधिक' : nLevel === 'अधिक' ? '-20% कम' : 'सामान्य अनुशंसित',
    dapAdjustment: pLevel === 'कम' ? '+20% अधिक' : pLevel === 'अधिक' ? '-15% कम' : 'सामान्य अनुशंसित',
    mopAdjustment: kLevel === 'कम' ? '+25% अधिक' : kLevel === 'अधिक' ? '-20% कम' : 'सामान्य अनुशंसित'
  };
};

// सिमुलेटेड / डेमो सेंसर डेटा (फील्ड टेस्टिंग हेतु)
export const generateSimulatedSoilData = (preset = 'balanced') => {
  if (preset === 'acidic') {
    return {
      ph: 5.4,
      moisture: 38,
      nitrogen: 145, // kg/ha
      phosphorus: 12, // kg/ha
      potassium: 210, // kg/ha
      ec: 0.35, // dS/m
      temperature: 27.2,
      connectedDevice: 'Kisan BLE-NPK Sensor #9042',
      timestamp: new Date().toLocaleTimeString('hi-IN')
    };
  }
  if (preset === 'dry') {
    return {
      ph: 6.8,
      moisture: 19,
      nitrogen: 190,
      phosphorus: 18,
      potassium: 260,
      ec: 0.52,
      temperature: 31.4,
      connectedDevice: 'Smart AgriProbe BLE-V2',
      timestamp: new Date().toLocaleTimeString('hi-IN')
    };
  }
  // Balanced / Healthy preset
  return {
    ph: 6.5,
    moisture: 46,
    nitrogen: 215,
    phosphorus: 22,
    potassium: 295,
    ec: 0.48,
    temperature: 26.8,
    connectedDevice: 'Kisan Pro SoilSensor BLE-701',
    timestamp: new Date().toLocaleTimeString('hi-IN')
  };
};
