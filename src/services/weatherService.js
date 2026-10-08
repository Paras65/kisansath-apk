// किसान साथी - Zero-Key Public Weather & Agricultural Advisory Service
// Powered by Open-Meteo Open API (100% Free, Zero API Key Required)
// Features: Auto-Geocoding, Live Precipitation %, Wind Speed, Humidity, Offline Caching, Smart Spray Advisor.
import { parseErrorPayload, logClientApiError, logClientNetworkError } from '../utils/errorHandler';

// Coordinates for all 33 Chhattisgarh Districts for 100% Precise Micro-Location Mapping
export const CG_DISTRICT_COORDS = {
  'रायपुर': { lat: 21.2514, lon: 81.6296, name: 'रायपुर (Raipur)' },
  'बिलासपुर': { lat: 22.0797, lon: 82.1409, name: 'बिलासपुर (Bilaspur)' },
  'दुर्ग': { lat: 21.1904, lon: 81.2849, name: 'दुर्ग (Durg)' },
  'राजनांदगांव': { lat: 21.1030, lon: 81.0345, name: 'राजनांदगांव (Rajnandgaon)' },
  'धमतरी': { lat: 20.7071, lon: 81.5497, name: 'धमतरी (Dhamtari)' },
  'कवर्धा': { lat: 22.0125, lon: 81.2464, name: 'कबीरधाम / कवर्धा' },
  'बलौदाबाजार': { lat: 21.6626, lon: 82.1627, name: 'बलौदाबाजार (Balodabazar)' },
  'जगदलपुर': { lat: 19.0744, lon: 82.0224, name: 'बस्तर / जगदलपुर' },
  'महासमुंद': { lat: 21.1090, lon: 82.0984, name: 'महासमुंद (Mahasamund)' },
  'जांजगीर-चांपा': { lat: 22.0118, lon: 82.5714, name: 'जांजगीर-चांपा (Janjgir)' },
  'रायगढ़': { lat: 21.8974, lon: 83.3950, name: 'रायगढ़ (Raigarh)' },
  'कोरबा': { lat: 22.3595, lon: 82.7501, name: 'कोरबा (Korba)' },
  'अंबिकापुर': { lat: 23.1200, lon: 83.1950, name: 'सरगुजा / अंबिकापुर' },
  'कांकेर': { lat: 20.2718, lon: 81.4925, name: 'उत्तर बस्तर कांकेर' },
  'बेमेतरा': { lat: 21.7032, lon: 81.5348, name: 'बेमेतरा (Bemetara)' },
  'बालोद': { lat: 20.7303, lon: 81.2057, name: 'बालोद (Balod)' },
  'गरियाबंद': { lat: 20.9577, lon: 82.0006, name: 'गरियाबंद (Gariaband)' },
  'मुंगेली': { lat: 22.0664, lon: 81.6936, name: 'मुंगेली (Mungeli)' },
  'दंतेवाड़ा': { lat: 18.8930, lon: 81.3508, name: 'दंतेवाड़ा (Dantewada)' },
  'सुकमा': { lat: 18.3970, lon: 81.6610, name: 'सुकमा (Sukma)' },
  'बीजापुर': { lat: 18.7960, lon: 80.8140, name: 'बीजापुर (Bijapur)' },
  'नारायणपुर': { lat: 19.7190, lon: 81.2500, name: 'नारायणपुर (Narayanpur)' },
  'कोंडागांव': { lat: 19.5960, lon: 81.6620, name: 'कोंडागांव (Kondagaon)' },
  'कोरिया': { lat: 23.2700, lon: 82.5600, name: 'कोरिया (Baikunthpur)' },
  'सूरजपुर': { lat: 23.2200, lon: 82.8600, name: 'सूरजपुर (Surajpur)' },
  'बलरामपुर': { lat: 23.6100, lon: 83.6100, name: 'बलरामपुर (Balrampur)' },
  'जशपुर': { lat: 22.8800, lon: 84.1400, name: 'जशपुर (Jashpur)' },
  'सक्ती': { lat: 22.0200, lon: 82.9600, name: 'सक्ती (Sakti)' },
  'सारंगढ़-बिलाईगढ़': { lat: 21.5800, lon: 83.0800, name: 'सारंगढ़-बिलाईगढ़' },
  'मोहला-मानपुर': { lat: 20.5700, lon: 80.7400, name: 'मोहला-मानपुर' },
  'खैरागढ़': { lat: 21.4200, lon: 80.9700, name: 'खैरागढ़ (Khairagarh)' },
  'मनेंद्रगढ़': { lat: 23.2000, lon: 82.3500, name: 'मनेंद्रगढ़-चिरमिरी' },
  'गौरेला-पेंड्रा': { lat: 22.7500, lon: 81.9100, name: 'गौरेला-पेंड्रा-मरवाही' },
};

/**
 * Find closest district matching GPS coordinates
 */
export const findClosestDistrict = (latitude, longitude) => {
  let closestDistrict = 'रायपुर';
  let minDistance = Infinity;
  Object.entries(CG_DISTRICT_COORDS).forEach(([dist, coords]) => {
    const d = Math.hypot(coords.lat - latitude, coords.lon - longitude);
    if (d < minDistance) {
      minDistance = d;
      closestDistrict = dist;
    }
  });
  return closestDistrict;
};

/**
 * Auto-detect user's current GPS location and resolve closest agricultural center
 */
export const detectCurrentLocationDistrict = (highAccuracy = false) => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const district = findClosestDistrict(latitude, longitude);
        resolve({
          district,
          coords: { latitude, longitude },
          isLiveGps: true,
        });
      },
      (err) => {
        reject(err);
      },
      { enableHighAccuracy: highAccuracy, timeout: 8000, maximumAge: 300000 }
    );
  });
};

// Weather WMO Code to Hindi & Chhattisgarhi condition & icon
const WMO_CODE_MAP = {
  0: { text: 'साफ आसमान (धूप)', textCg: 'उघरा अकास (घाम)', icon: '☀️', condition: 'Sunny' },
  1: { text: 'मुख्यतः साफ', textCg: 'जादातर उघरा', icon: '🌤️', condition: 'Mainly Clear' },
  2: { text: 'आंशिक बादल', textCg: 'हल्का बादर', icon: '⛅', condition: 'Partly Cloudy' },
  3: { text: 'बादल छाए रहेंगे', textCg: 'बादर छाये रहिही', icon: '☁️', condition: 'Overcast' },
  45: { text: 'कोहरा / धुंध', textCg: 'कुहरा / धुंध', icon: '🌫️', condition: 'Fog' },
  48: { text: 'घना कोहरा', textCg: 'गाढ़ा कुहरा', icon: '🌫️', condition: 'Fog' },
  51: { text: 'हल्की बूंदाबांदी', textCg: 'हल्का फुहार / टिप-टिप', icon: '🌦️', condition: 'Light Drizzle' },
  53: { text: 'मध्यम बूंदाबांदी', textCg: 'मंझोला फुहार', icon: '🌦️', condition: 'Drizzle' },
  55: { text: 'घनी बूंदाबांदी', textCg: 'गाढ़ा फुहार', icon: '🌧️', condition: 'Heavy Drizzle' },
  61: { text: 'हल्की बारिश', textCg: 'हल्का पानी', icon: '🌧️', condition: 'Light Rain' },
  63: { text: 'मध्यम बारिश', textCg: 'मंझोला पानी', icon: '🌧️', condition: 'Moderate Rain' },
  65: { text: 'भारी बारिश', textCg: 'जोर के पानी / झड़ी', icon: '⛈️', condition: 'Heavy Rain' },
  80: { text: 'हल्की वर्षा बौछार', textCg: 'हल्का पानी के बौछार', icon: '🌦️', condition: 'Rain Showers' },
  81: { text: 'तेज वर्षा बौछार', textCg: 'तेज पानी के बौछार', icon: '🌧️', condition: 'Rain Showers' },
  82: { text: 'मूसलाधार बौछारें', textCg: 'मुसलाधार पानी', icon: '⛈️', condition: 'Violent Showers' },
  95: { text: 'आंधी-तूफान व बिजली', textCg: 'अंधरा-तूफान अउ बिजली', icon: '⚡', condition: 'Thunderstorm' },
  96: { text: 'तूफान व ओलावृष्टि', textCg: 'तूफान अउ पथरा (ओला)', icon: '⛈️', condition: 'Hailstorm' },
  99: { text: 'भारी तूफान व ओले', textCg: 'भारी तूफान अउ पथरा गिरे के संका', icon: '⛈️', condition: 'Severe Hailstorm' },
};

/**
 * Smart Spray & Daily Farming Action Evaluator
 */
export const getSprayAdvisory = (weather) => {
  const rainProb = weather.rainProbability || 0;
  const windSpeed = weather.windSpeed || 0;
  const humidity = weather.humidity || 0;
  const temp = weather.temp || 30;
  const isRaining = weather.isRaining || false;

  if (rainProb >= 50 || isRaining) {
    return {
      status: 'छिड़काव तुरंत रोकें',
      statusCg: 'छिड़काव तुरते रोक्व',
      statusColor: 'error',
      severity: 'warning',
      badge: '⚠️ छिड़काव रोकें (बारिश की संभावना)',
      badgeCg: '⚠️ छिड़काव रोक्व (पानी गिरे के संका)',
      advisory: `आज बारिश की संभावना ${rainProb}% है। यूरिया, पोटाश और कीटनाशक का छिड़काव तुरंत टालें ताकि दवा बहकर नष्ट न हो जाए।`,
      advisoryCg: `आज पानी गिरे के संका ${rainProb}% हे। यूरिया, पोटाश अउ कीटनाशक के छिड़काव तुरते टालव ताकि दवाई बोहा के खराब झन होवय।`,
      voice: `सावधान किसान भाई! आज बारिश की संभावना ${rainProb} प्रतिशत है। खेत में यूरिया खाद और कीटनाशक का छिड़काव तुरंत रोकें ताकि दवा बह न जाए।`,
      voiceCg: `हुसियार किसान भाई! आज पानी गिरे के संका ${rainProb} प्रतिशत हे। खेत म यूरिया खाद अउ कीटनाशक के छिड़काव तुरते रोक्व ताकि दवाई बोहा झन जाय।`,
      canSpray: false,
    };
  }

  if (windSpeed > 15) {
    return {
      status: 'छिड़काव टालें (तेज हवा)',
      statusCg: 'छिड़काव टालव (तेज हवा)',
      statusColor: 'warning',
      severity: 'warning',
      badge: '💨 तेज हवा (दवा उड़ने का जोखिम)',
      badgeCg: '💨 तेज हवा (दवाई उड़े के खतरा)',
      advisory: `हवा की गति ${windSpeed} किमी/घंटा है। तेज हवा में कीटनाशक का छिड़काव न करें, दवा उड़कर बेकार हो जाएगी। हवा थमने की प्रतीक्षा करें।`,
      advisoryCg: `हवा के गति ${windSpeed} किमी/घंटा हे। तेज हवा म कीटनाशक झन छिड़कव, दवाई उड़के बेकार हो जाही। हवा थमे के अगोरा करव।`,
      voice: `हवा की गति ${windSpeed} किलोमीटर प्रति घंटा है। तेज हवा के कारण दवा का छिड़काव टालें।`,
      voiceCg: `हवा के गति ${windSpeed} किलोमीटर प्रति घंटा हे। तेज हवा के सेती दवाई के छिड़काव टालव।`,
      canSpray: false,
    };
  }

  if (humidity > 80) {
    return {
      status: 'रोग निगरानी आवश्यक',
      statusCg: 'रोग निगरानी जरूरी',
      statusColor: 'info',
      severity: 'info',
      badge: '🌫️ अधिक नमी (फफूंद जोखिम)',
      badgeCg: '🌫️ जादा उमस (फफूंद के संका)',
      advisory: `हवा में नमी ${humidity}% है। धान में शीथ ब्लाइट और दलहन में फफूंद रोग की संभावना है। खेत की मेड़ों का निरीक्षण करें।`,
      advisoryCg: `हवा म उमस ${humidity}% हे। धान म केंचुली (शीथ ब्लाइट) अउ दलहन म फफूंद रोग के संका हे। खेत के मेड़-मेड़ घुमके जांच करव।`,
      voice: `हवा में नमी ${humidity} प्रतिशत है। फसलों में फफूंद व कीटों के प्रकोप पर नजर रखें।`,
      voiceCg: `हवा म उमस ${humidity} प्रतिशत हे। फसल म फफूंद अउ कीरा के परकोप म नजर राखव।`,
      canSpray: true,
    };
  }

  if (temp > 38) {
    return {
      status: 'शाम को ही छिड़काव करें',
      statusCg: 'संजौती म छिड़काव करव',
      statusColor: 'warning',
      severity: 'warning',
      badge: '☀️ तेज धूप (दोपहर में रोकें)',
      badgeCg: '☀️ तेज घाम (मंझनिया म रोक्व)',
      advisory: `तापमान ${temp}°C पहुंच चुका है। दोपहर की कड़ी धूप में छिड़काव करने से पत्तियां जल सकती हैं। छिड़काव शाम 4:30 बजे के बाद ही करें।`,
      advisoryCg: `तापमान ${temp}°C पहुंच गे हे। मंझनिया के कड़क घाम म छिड़काव करे ले पाना जर सकथे। छिड़काव संझा 4:30 बजे के बादे करव।`,
      voice: `तापमान ${temp} डिग्री है। दोपहर में छिड़काव न करें, शाम को हल्की धूप ढलने पर ही करें।`,
      voiceCg: `तापमान ${temp} डिग्री हे। मंझनिया म छिड़काव झन करव, संझा बेरा घाम ढले ले करव।`,
      canSpray: true,
    };
  }

  return {
    status: 'छिड़काव हेतु उत्तम अनुकूल',
    statusCg: 'छिड़काव बर बने बेरा',
    statusColor: 'success',
    severity: 'success',
    badge: '✅ उत्तम अनुकूल मौसम',
    badgeCg: '✅ छिड़काव बर बने मौसम',
    advisory: `मौसम पूरी तरह साफ है और हवा सामान्य (${windSpeed} km/h) है। आज यूरिया खाद व कीटनाशक छिड़काव का सबसे उत्तम समय है।`,
    advisoryCg: `मौसम पुरो तरहा उघरा हे अउ हवा सामान्य (${windSpeed} km/h) हे। आज यूरिया खाद अउ कीटनाशक छिड़के के सबले बने बेरा हे।`,
    voice: `आज मौसम बहुत अच्छा है। हवा सामान्य है। यूरिया खाद और कीटनाशक छिड़काव का अनुकूल समय है।`,
    voiceCg: `आज मौसम बहुत बने हे। हवा सामान्य हे। यूरिया खाद अउ कीटनाशक दवाई छिड़के के बने बेरा हे।`,
    canSpray: true,
  };
};

/**
 * Evaluate 48-Hour Fungal / Blast Disease Outbreak Risk Score
 * Based on ICAR/IGKV Plant Pathology criteria:
 * Fungal spore germination peaks when Relative Humidity >= 80% & Temp 20-29°C for prolonged hours.
 */
export const calculateDiseaseOutbreakRisk = (hourly = {}) => {
  const humidities = hourly.relative_humidity_2m || [];
  const temps = hourly.temperature_2m || [];
  const limit = Math.min(48, Math.min(humidities.length, temps.length));

  let highRiskHours = 0;
  for (let i = 0; i < limit; i++) {
    const h = humidities[i];
    const t = temps[i];
    if (h >= 80 && t >= 20 && t <= 29) {
      highRiskHours++;
    }
  }

  if (highRiskHours >= 12) {
    return {
      riskLevel: 'high',
      riskScoreHours: highRiskHours,
      badge: '⚠️ उच्च फफूंद जोखिम (48h)',
      badgeCg: '⚠️ झुलसा/केंचुली के जादा खतरा',
      title: '48 घंटे में फफूंद / झुलसा रोग की पूर्व-चेतावनी',
      titleCg: '48 घंटा म झुलसा / केंचुली रोग के जादा संका',
      advice: `आगामी 48 घंटों में ${highRiskHours} घंटे अत्यधिक नमी (>80%) और अनुकूल तापमान रहेगा। धान में शीथ ब्लाइट व ब्लास्ट (झुलसा) का तीव्र प्रकोप हो सकता है। खेत में यूरिया न डालें और तुरंत ट्राइसाइक्लाजोल या हेक्साकोनाजोल का छिड़काव तैयार रखें।`,
      adviceCg: `आवत 48 घंटा म ${highRiskHours} घंटा जादा उमस अऊ मौसम अनुकूल रहिही। धान म केंचुली अऊ झुलसा रोग बढ़ सकथे। खेत म यूरिया झन लगाव, दवाई छिड़काव बर तियार रहव।`,
      recommendedAction: 'यूरिया रोकें • फफूंदनाशक स्प्रे तैयार रखें',
      recommendedActionCg: 'यूरिया रोक्व • दवाई स्प्रे तियार राखव',
      canSprayWindow: 'दोपहर बाद शांत हवा में स्प्रे करें',
      canSprayWindowCg: 'मंझनिया बाद शांत हवा म स्प्रे करव'
    };
  }

  if (highRiskHours >= 5) {
    return {
      riskLevel: 'moderate',
      riskScoreHours: highRiskHours,
      badge: '🟡 मध्यम रोग निगरानी',
      badgeCg: '🟡 फफूंद निगरानी जरूरी',
      title: 'मौसम में नमी वृद्धि: कीट व रोग निगरानी आवश्यक',
      titleCg: 'मौसम म उमस बढ़त हे: कीरा-बीमारी म नजर राखव',
      advice: `आगामी 48 घंटों में नमी बढ़ने से फसलों में कीट व फफूंद का फैलाव हो सकता है। खेत की मेड़ों पर जाकर निचली पत्तियों व तनों का नियमित निरीक्षण करें।`,
      adviceCg: `आवत 48 घंटा म उमस बढ़े ले फसल म कीरा अऊ फफूंद फैल सकथे। खेत के मेड़-मेड़ घुमके निचला पाना अऊ तना के जांच करव।`,
      recommendedAction: 'खेत की मेड़ों पर नियमित निरीक्षण करें',
      recommendedActionCg: 'खेत म नियमित जांच करव',
      canSprayWindow: 'मौसम अनुकूल रहने पर स्प्रे करें',
      canSprayWindowCg: 'मौसम साफ रहे म स्प्रे करव'
    };
  }

  return {
    riskLevel: 'low',
    riskScoreHours: highRiskHours,
    badge: '✅ रोग जोखिम सामान्य',
    badgeCg: '✅ बीमारी के संका कम',
    title: 'फसल स्वास्थ्य अनुकूल: फफूंद संक्रमण का खतरा न्यूनतम',
    titleCg: 'फसल बने रहिही: कोनो भारी बीमारी के संका नइये',
    advice: 'आगामी 48 घंटों में मौसम साफ और फफूंद रोगों के अनुकूल नहीं है। फसल की नियमित देखरेख व पोषण प्रबंधन जारी रखें।',
    adviceCg: 'आवत 48 घंटा म मौसम बने हे, कोनो बीमारी के खतरा नइये। फसल के सामान्य देखरेख जारी राखव।',
    recommendedAction: 'सामान्य कृषि कार्य जारी रखें',
    recommendedActionCg: 'सामान्य किसानी काम जारी राखव',
    canSprayWindow: 'सामान्य अनुकूल समय',
    canSprayWindowCg: 'अनुकूल समय'
  };
};

/**
 * Evaluate Satellite Soil Moisture (0-9cm depth) into Farmer-Intuitive Zones
 * Volumetric capacity standard for clay-loam / matasi soil in CG: ~0.40 m³/m³
 */
export const calculateSoilMoistureAdvisory = (currentMoisture = 0.25, rootZoneMoisture = 0.28) => {
  // Weighted moisture across topsoil (0-1cm) and active rootzone (3-9cm)
  const effectiveVolumetric = (Number(currentMoisture) * 0.4) + (Number(rootZoneMoisture) * 0.6);
  // Normalize to farmer percentage (0 to 100%) against field capacity (~0.40 m³/m³)
  const percentage = Math.min(100, Math.max(8, Math.round((effectiveVolumetric / 0.40) * 100)));

  if (percentage < 35) {
    return {
      percentage,
      volumetric: Number(effectiveVolumetric.toFixed(3)),
      status: 'dry',
      label: 'सूखी मिट्टी (सिंचाई आवश्यक)',
      labelCg: 'सूखी भुइयां (पानी के कमी)',
      color: '#d32f2f',
      bg: '#ffebee',
      advice: 'जड़ क्षेत्र (0-9 सेमी) में नमी कम हो गई है। फसल को तनाव से बचाने हेतु अगले 24 घंटों में हल्की सिंचाई करें।',
      adviceCg: 'जड़ क्षेत्र (0-9 सेमी) म माटी सुखावत हे। फसल म जोर झन पड़े तेकर सेती 24 घंटा म पानी देवव।',
      irrigationNeeded: true,
      badge: '🔴 पानी की कमी'
    };
  }

  if (percentage <= 80) {
    return {
      percentage,
      volumetric: Number(effectiveVolumetric.toFixed(3)),
      status: 'optimal',
      label: 'उत्तम नमी (अनुकूल)',
      labelCg: 'बने नमी (पूरव पानी)',
      color: '#2e7d32',
      bg: '#e8f5e9',
      advice: 'खेत के जड़ क्षेत्र (0-9 सेमी) में पर्याप्त नमी उपलब्ध है। अभी सिंचाई की आवश्यकता नहीं है, पानी और बिजली की बचत करें।',
      adviceCg: 'खेत के जड़ क्षेत्र (0-9 सेमी) म बने नमी हे। अभी पानी देहे के जरूरत नइ हे, पानी अऊ बिजली बचावहू।',
      irrigationNeeded: false,
      badge: '🟢 पर्याप्त नमी'
    };
  }

  return {
    percentage,
    volumetric: Number(effectiveVolumetric.toFixed(3)),
    status: 'wet',
    label: 'अत्यधिक गीली (जलभराव जोखिम)',
    labelCg: 'जादा गीला (जलभराव के खतरा)',
    color: '#ed6c02',
    bg: '#fff3e0',
    advice: 'खेत में पानी की मात्रा अधिक है। जलभराव से जड़ों को सड़ने से बचाने के लिए खेत की मेड़ों से अतिरिक्त पानी निकासी की व्यवस्था रखें।',
    adviceCg: 'खेत म जादा पानी भरे हे। जड़ झन सड़य तेकर सेती मेड़ ले अतिरिक्त पानी निकास के बेवस्था करव।',
    irrigationNeeded: false,
    badge: '🟡 अधिक गीली'
  };
};

/**
 * Evaluate Real-time Lightning (गाज) & Severe Squall Danger
 * Codes 95, 96, 99 indicate active thunderstorms / hailstorms in Open-Meteo
 */
export const calculateLightningRisk = (weatherCode = 0, windSpeed = 0, rainProb = 0) => {
  const isThunderstorm = [95, 96, 99].includes(Number(weatherCode));
  const isSevereStorm = isThunderstorm || (Number(windSpeed) >= 35 && Number(rainProb) >= 70);
  const isModerateSquall = [80, 81, 82].includes(Number(weatherCode)) && Number(windSpeed) >= 25;

  if (isSevereStorm) {
    return {
      hasRisk: true,
      severity: 'danger',
      badge: '⚡ गाज (आकाशीय बिजली) अलर्ट',
      badgeCg: '⚡ गाज (बिजली) के भारी खतरा',
      title: 'आकाशीय बिजली (गाज) व आंधी-तूफान की चेतावनी!',
      titleCg: 'आकाशीय बिजली (गाज) अऊ अंधरी-तूफान के भारी खतरा!',
      advice: 'मौसम में बिजली गिरने (गाज) और तेज आंधी की तीव्र संभावना है। तुरंत खुले खेत, ऊंचे पेड़, लोहे के खंभे व ट्रांसफार्मर के पास से हटें। सुरक्षित पक्के मकान में शरण लें!',
      adviceCg: 'मौसम म गाज गिरे अऊ अंधरी चले के भारी खतरा हे! खुले खेत, बड़े रुख (पेड़), खंभा अऊ डीपी (ट्रांसफार्मर) के तीर ले हटके तुरते पक्का घर म जावव!',
      voice: 'सावधान! मौसम में आकाशीय बिजली यानी गाज गिरने का गंभीर खतरा है। तुरंत खुले खेत और पेड़ों के नीचे से हटकर सुरक्षित स्थान पर जाएं।'
    };
  }

  if (isModerateSquall) {
    return {
      hasRisk: true,
      severity: 'warning',
      badge: '💨 तेज आंधी सतर्कता',
      badgeCg: '💨 तेज अंधरी सतर्कता',
      title: 'तेज हवा व आकस्मिक बौछार की सतर्कता',
      titleCg: 'तेज हवा अऊ पानी के बौछार के संका',
      advice: 'हवा की गति तेज है। खुले खेत में कीटनाशक छिड़काव रोकें और कटी फसलों को ढकने की व्यवस्था रखें।',
      adviceCg: 'हवा तेज चलत हे। दवाई के छिड़काव रोकव अऊ कटी फसल ला तिरपाल ले तोप के राखव।',
      voice: 'मौसम में तेज हवा और बौछारों की संभावना है। कटी फसल को सुरक्षित ढकें।'
    };
  }

  return {
    hasRisk: false,
    severity: 'none',
    badge: '✅ बिजली खतरा नहीं',
    badgeCg: '✅ गाज के खतरा नइये',
    title: 'मौसम शांत: आकाशीय बिजली का कोई खतरा नहीं',
    titleCg: 'मौसम शांत हे, कोनो गाज के खतरा नइये',
    advice: 'खेत में सामान्य कृषि कार्य किए जा सकते हैं।',
    adviceCg: 'खेत म सामान्य किसानी काम करे सकथव।',
    voice: ''
  };
};

/**
 * Evaluate 72-Hour Safe Harvest & Sun-Drying Window (फसल कटाई व धूप में सुखाने का मौसम)
 * Analyzes next 3 days for rain probability and precipitation to prevent post-harvest grain sprouting.
 */
export const calculateHarvestDryingWindow = (daily = {}, forecast3Days = []) => {
  const rainProbs = daily.precipitation_probability_max || [];
  const rain0 = rainProbs[0] ?? (forecast3Days[0]?.rainProb || 15);
  const rain1 = rainProbs[1] ?? (forecast3Days[1]?.rainProb || 10);
  const rain2 = rainProbs[2] ?? (forecast3Days[2]?.rainProb || 15);

  const maxRain = Math.max(rain0, rain1, rain2);
  const weatherCodes = daily.weather_code || [];
  const hasStormCode = weatherCodes.slice(0, 3).some(code => [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code));

  if (maxRain < 25 && !hasStormCode) {
    return {
      status: 'safe',
      isSafe: true,
      badge: '☀️ 3 दिन सुरक्षित कटाई',
      badgeCg: '☀️ 3 दिन बने कटाई बेरा',
      color: '#2e7d32',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      title: 'फसल कटाई व धूप में सुखाने हेतु 3 दिन सुरक्षित',
      titleCg: 'फसल कटाई अऊ खरिहान म सुखोय बर 3 दिन बने हे',
      advice: 'अगले 72 घंटों में बारिश की संभावना नगण्य है। पकी फसल की कटाई और खलिहान में धान सुखाने के लिए मौसम पूरी तरह अनुकूल है। दानों में नमी 14-17% तक लाने का यह उत्तम समय है।',
      adviceCg: 'आवत 3 दिन म पानी गिरे के कोनो संका नइये। धान कटाई अऊ खरिहान म सुखोय बर मौसम एकदम साफ हे। गलथाय या दाना जमे के खतरा नइये।',
      voice: 'अगले तीन दिन मौसम सूखा और धूप वाला रहेगा। फसल कटाई और खलिहान में सुखाने के लिए उत्तम समय है।'
    };
  }

  if (maxRain <= 45 && !hasStormCode) {
    return {
      status: 'caution',
      isSafe: false,
      badge: '⛅ सावधानी से कटाई',
      badgeCg: '⛅ देख-परख के कटाई',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      title: 'हल्की स्थानीय वर्षा की संभावना: सतर्कता बरतें',
      titleCg: 'हल्का पानी गिरे के संका: सचेत होके कटाई करव',
      advice: 'आगामी 2-3 दिनों में स्थानीय बादलों से हल्की बौछारों की संभावना है। जितनी फसल की कटाई करें, उसे ढकने या खलिहान में सुरक्षित लाने की व्यवस्था रखें। तिरपाल तैयार रखें।',
      adviceCg: 'आवत 2-3 दिन म हल्का पानी गिर सकथे। कटी फसल बर तिरपाल तियार राखव, खुल्ला म झन छोड़व।',
      voice: 'स्थानीय बादलों से हल्की बौछारों की संभावना है। कटी फसल को ढकने के लिए तिरपाल तैयार रखें।'
    };
  }

  return {
    status: 'unsafe',
    isSafe: false,
    badge: '🌧️ कटाई तुरंत रोकें',
    badgeCg: '🌧️ कटाई अभी झन करव',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    title: 'वर्षा का जोखिम: पकी फसल की कटाई तुरंत टालें',
    titleCg: 'पानी गिरे के भारी संका: कटाई अभी रोकव',
    advice: `आगामी दिनों में बारिश की संभावना (${maxRain}%) अधिक है। कटी हुई फसल भीगने से बालियों में ही दाना अंकुरित होने (गलने) का गंभीर खतरा है। मौसम साफ होने तक कटाई टालें।`,
    adviceCg: `आवत दिन म पानी गिरे के भारी संका (${maxRain}%) हे। कटी फसल भीजही त दाना जम जाही (अंकुरित हो जाही)। मौसम साफ होवे तक कटाई टालव।`,
    voice: 'सावधान! आगामी दिनों में बारिश की संभावना है। कटी फसल भीगने से बचाने के लिए अभी कटाई टालें।'
  };
};

/**
 * Fetch Live Weather from Open-Meteo (Zero Key, Free)
 */
export const fetchLiveWeather = async (districtName = 'रायपुर') => {
  const coords = CG_DISTRICT_COORDS[districtName] || CG_DISTRICT_COORDS['रायपुर'];
  const cacheKey = `kisan_weather_${districtName}`;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&hourly=soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,relative_humidity_2m,temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=3`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const weatherCode = current.weather_code ?? 0;
      const wmoInfo = WMO_CODE_MAP[weatherCode] || WMO_CODE_MAP[0];
      const rainProbability = daily.precipitation_probability_max?.[0] ?? Math.round((current.precipitation || 0) * 40);
      const tempMax = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m || 30);
      const tempMin = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : Math.round((current.temperature_2m || 30) - 6);

      const currentMoisture = current.soil_moisture_0_to_1cm ?? 0.26;
      const rootZoneMoisture = hourly.soil_moisture_3_to_9cm?.[0] ?? currentMoisture;

      const parsedWeather = {
        district: districtName,
        temp: Math.round(current.temperature_2m || 30),
        tempMax,
        tempMin,
        humidity: Math.round(current.relative_humidity_2m || 60),
        windSpeed: Math.round(current.wind_speed_10m || 10),
        precipitation: current.precipitation || 0,
        rainProbability,
        isRaining: (current.precipitation || 0) > 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode),
        conditionText: wmoInfo.text,
        conditionTextCg: wmoInfo.textCg || wmoInfo.text,
        conditionIcon: wmoInfo.icon,
        conditionName: wmoInfo.condition,
        soilTemperature: current.soil_temperature_0cm ? Math.round(current.soil_temperature_0cm) : null,
        soilMoisture: calculateSoilMoistureAdvisory(currentMoisture, rootZoneMoisture),
        diseaseRisk: calculateDiseaseOutbreakRisk(hourly),
        updatedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
      };

      // 3-Day Micro-Forecast for Farmers
      parsedWeather.forecast3Days = [
        {
          day: 'आज (Today)',
          dayCg: 'आज',
          tempMax: tempMax,
          tempMin: tempMin,
          rainProb: rainProbability,
          icon: wmoInfo.icon,
          condition: wmoInfo.text,
          conditionCg: wmoInfo.textCg || wmoInfo.text,
        },
        {
          day: 'कल (Tomorrow)',
          dayCg: 'बिहान',
          tempMax: daily.temperature_2m_max?.[1] ? Math.round(daily.temperature_2m_max[1]) : tempMax + 1,
          tempMin: daily.temperature_2m_min?.[1] ? Math.round(daily.temperature_2m_min[1]) : tempMin,
          rainProb: daily.precipitation_probability_max?.[1] ?? Math.max(0, rainProbability - 5),
          icon: WMO_CODE_MAP[daily.weather_code?.[1]]?.icon || '⛅',
          condition: WMO_CODE_MAP[daily.weather_code?.[1]]?.text || 'धूप व बादल',
          conditionCg: WMO_CODE_MAP[daily.weather_code?.[1]]?.textCg || 'घाम अउ बादर',
        },
        {
          day: 'परसों (Day 3)',
          dayCg: 'पर्सों',
          tempMax: daily.temperature_2m_max?.[2] ? Math.round(daily.temperature_2m_max[2]) : tempMax,
          tempMin: daily.temperature_2m_min?.[2] ? Math.round(daily.temperature_2m_min[2]) : tempMin - 1,
          rainProb: daily.precipitation_probability_max?.[2] ?? Math.max(0, rainProbability - 10),
          icon: WMO_CODE_MAP[daily.weather_code?.[2]]?.icon || '🌤️',
          condition: WMO_CODE_MAP[daily.weather_code?.[2]]?.text || 'मुख्यतः साफ',
          conditionCg: WMO_CODE_MAP[daily.weather_code?.[2]]?.textCg || 'जादातर उघरा',
        }
      ];

      // Attach advisory
      parsedWeather.sprayAdvisory = getSprayAdvisory(parsedWeather);
      parsedWeather.lightningRisk = calculateLightningRisk(weatherCode, parsedWeather.windSpeed, rainProbability);
      parsedWeather.harvestDryingWindow = calculateHarvestDryingWindow(daily, parsedWeather.forecast3Days);

      // Save to localStorage for offline resilience
      localStorage.setItem(cacheKey, JSON.stringify(parsedWeather));
      return parsedWeather;
    } else {
      const errPayload = await parseErrorPayload(res);
      logClientApiError('open-meteo', res, errPayload, { method: 'GET' });
    }
  } catch (err) {
    logClientNetworkError('open-meteo', err, { method: 'GET' });
  }

  // Fallback to cache if offline
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      parsed.isLive = false;
      parsed.sprayAdvisory = getSprayAdvisory(parsed);
      if (!parsed.soilMoisture) parsed.soilMoisture = calculateSoilMoistureAdvisory(0.26, 0.28);
      if (!parsed.diseaseRisk) parsed.diseaseRisk = calculateDiseaseOutbreakRisk();
      if (!parsed.lightningRisk) parsed.lightningRisk = calculateLightningRisk();
      if (!parsed.harvestDryingWindow) parsed.harvestDryingWindow = calculateHarvestDryingWindow({}, parsed.forecast3Days);
      return parsed;
    } catch (e) {}
  }

  // Safe regional default
  const defaultWeather = {
    district: districtName,
    temp: 31,
    tempMax: 34,
    tempMin: 24,
    humidity: 62,
    windSpeed: 9,
    precipitation: 0,
    rainProbability: 15,
    isRaining: false,
    conditionText: 'सामान्य धूप व अनुकूल',
    conditionTextCg: 'बने घाम अउ अनुकूर मौसम',
    conditionIcon: '🌤️',
    conditionName: 'Sunny',
    updatedAt: 'ऑफ़लाइन सुरक्षित डेटा',
    isLive: false,
    soilTemperature: 28,
    soilMoisture: calculateSoilMoistureAdvisory(0.26, 0.28),
    diseaseRisk: calculateDiseaseOutbreakRisk(),
    lightningRisk: calculateLightningRisk(),
    harvestDryingWindow: calculateHarvestDryingWindow({}, [
      { day: 'आज', rainProb: 15 },
      { day: 'बिहान', rainProb: 10 },
      { day: 'पर्सों', rainProb: 20 }
    ]),
    forecast3Days: [
      { day: 'आज (Today)', dayCg: 'आज', tempMax: 34, tempMin: 24, rainProb: 15, icon: '🌤️', condition: 'सामान्य धूप', conditionCg: 'बने घाम' },
      { day: 'कल (Tomorrow)', dayCg: 'बिहान', tempMax: 35, tempMin: 24, rainProb: 10, icon: '⛅', condition: 'धूप व बादल', conditionCg: 'घाम अउ बादर' },
      { day: 'परसों (Day 3)', dayCg: 'पर्सों', tempMax: 33, tempMin: 23, rainProb: 20, icon: '🌤️', condition: 'मुख्यतः साफ', conditionCg: 'जादातर उघरा' }
    ]
  };
  defaultWeather.sprayAdvisory = getSprayAdvisory(defaultWeather);
  return defaultWeather;
};

/**
 * Fetch Live GPS Field Weather from Open-Meteo by Latitude/Longitude
 */
export const fetchLiveWeatherByCoords = async (lat, lon, label = '📍 मेरा खेत (GPS)') => {
  const cacheKey = `kisan_weather_gps_${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm&hourly=soil_moisture_0_to_1cm,soil_moisture_3_to_9cm,relative_humidity_2m,temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=3`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const weatherCode = current.weather_code ?? 0;
      const wmoInfo = WMO_CODE_MAP[weatherCode] || WMO_CODE_MAP[0];
      const rainProbability = daily.precipitation_probability_max?.[0] ?? Math.round((current.precipitation || 0) * 40);
      const tempMax = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m || 30);
      const tempMin = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : Math.round((current.temperature_2m || 30) - 6);

      const currentMoisture = current.soil_moisture_0_to_1cm ?? 0.26;
      const rootZoneMoisture = hourly.soil_moisture_3_to_9cm?.[0] ?? currentMoisture;

      const parsedWeather = {
        district: label,
        isGpsLocation: true,
        lat,
        lon,
        temp: Math.round(current.temperature_2m || 30),
        tempMax,
        tempMin,
        humidity: Math.round(current.relative_humidity_2m || 60),
        windSpeed: Math.round(current.wind_speed_10m || 10),
        precipitation: current.precipitation || 0,
        rainProbability,
        isRaining: (current.precipitation || 0) > 0.1 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode),
        conditionText: wmoInfo.text,
        conditionTextCg: wmoInfo.textCg || wmoInfo.text,
        conditionIcon: wmoInfo.icon,
        conditionName: wmoInfo.condition,
        soilTemperature: current.soil_temperature_0cm ? Math.round(current.soil_temperature_0cm) : null,
        soilMoisture: calculateSoilMoistureAdvisory(currentMoisture, rootZoneMoisture),
        diseaseRisk: calculateDiseaseOutbreakRisk(hourly),
        updatedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
      };

      parsedWeather.forecast3Days = [
        {
          day: 'आज (Today)',
          dayCg: 'आज',
          tempMax: tempMax,
          tempMin: tempMin,
          rainProb: rainProbability,
          icon: wmoInfo.icon,
          condition: wmoInfo.text,
          conditionCg: wmoInfo.textCg || wmoInfo.text,
        },
        {
          day: 'कल (Tomorrow)',
          dayCg: 'बिहान',
          tempMax: daily.temperature_2m_max?.[1] ? Math.round(daily.temperature_2m_max[1]) : tempMax + 1,
          tempMin: daily.temperature_2m_min?.[1] ? Math.round(daily.temperature_2m_min[1]) : tempMin,
          rainProb: daily.precipitation_probability_max?.[1] ?? Math.max(0, rainProbability - 5),
          icon: WMO_CODE_MAP[daily.weather_code?.[1]]?.icon || '⛅',
          condition: WMO_CODE_MAP[daily.weather_code?.[1]]?.text || 'धूप व बादल',
          conditionCg: WMO_CODE_MAP[daily.weather_code?.[1]]?.textCg || 'घाम अउ बादर',
        },
        {
          day: 'परसों (Day 3)',
          dayCg: 'पर्सों',
          tempMax: daily.temperature_2m_max?.[2] ? Math.round(daily.temperature_2m_max[2]) : tempMax,
          tempMin: daily.temperature_2m_min?.[2] ? Math.round(daily.temperature_2m_min[2]) : tempMin - 1,
          rainProb: daily.precipitation_probability_max?.[2] ?? Math.max(0, rainProbability - 10),
          icon: WMO_CODE_MAP[daily.weather_code?.[2]]?.icon || '🌤️',
          condition: WMO_CODE_MAP[daily.weather_code?.[2]]?.text || 'मुख्यतः साफ',
          conditionCg: WMO_CODE_MAP[daily.weather_code?.[2]]?.textCg || 'जादातर उघरा',
        }
      ];

      parsedWeather.sprayAdvisory = getSprayAdvisory(parsedWeather);
      parsedWeather.lightningRisk = calculateLightningRisk(weatherCode, parsedWeather.windSpeed, rainProbability);
      parsedWeather.harvestDryingWindow = calculateHarvestDryingWindow(daily, parsedWeather.forecast3Days);
      localStorage.setItem(cacheKey, JSON.stringify(parsedWeather));
      return parsedWeather;
    }
  } catch (err) {
    console.warn('[GPS Weather Offline]', err.message);
  }

  return await fetchLiveWeather('रायपुर');
};

// Regional Chhattisgarh Soil Characteristics
export const CG_SOIL_PROFILES = {
  'मटासी': {
    name: 'मटासी (पीली-दोमट मिट्टी)',
    texture: 'बलुई दोमट / हल्की',
    idealCrops: 'धान, कोदो, कुटकी, तिल',
    phRange: '5.5 - 6.5 (हल्की अम्लीय)',
    waterRetention: 'मध्यम',
    organicMatter: '0.45% (मध्यम)',
    advice: 'मटासी मिट्टी में जलधारण क्षमता कम होती है, गोबर की खाद 4 टन/एकड़ अवश्य डालें और जिंक की पूर्ति करें।'
  },
  'डोर्सा': {
    name: 'डोर्सा (मध्यम भारी मिट्टी)',
    texture: 'मटासी व कन्हार का मिश्रण',
    idealCrops: 'धान, गेहूं, चना, मक्का',
    phRange: '6.2 - 7.2 (सामान्य उत्तम)',
    waterRetention: 'अच्छी',
    organicMatter: '0.55% (उत्तम)',
    advice: 'डोर्सा सबसे उपजाऊ मिट्टी मानी जाती है। इसमें खरीफ में धान के बाद रबी में बिना जुताई चना (उतेरा) बहुत बढ़िया होता है।'
  },
  'कन्हार': {
    name: 'कन्हार (काली गहरी चिकनी मिट्टी)',
    texture: 'भारी चिकनी (Clayey)',
    idealCrops: 'चना, गेहूं, तीवड़ा, सरसों, गन्ना',
    phRange: '7.0 - 8.0 (हल्की क्षारीय)',
    waterRetention: 'सर्वाधिक (नमी देर तक रखती है)',
    organicMatter: '0.65% (उच्च)',
    advice: 'कन्हार मिट्टी सूखने पर दरारें छोड़ती है। इसमें अधिक सिंचाई की आवश्यकता नहीं होती। रबी फसलों के लिए सर्वोत्तम है।'
  },
  'भाठा': {
    name: 'भाठा (लाल लेटराइट / कंकरीली)',
    texture: 'कंकरीली / उथली',
    idealCrops: 'दलहन, मोटे अनाज, बागवानी (आम, अमरूद)',
    phRange: '5.0 - 6.0 (अम्लीय)',
    waterRetention: 'अत्यंत कम',
    organicMatter: '0.30% (कम)',
    advice: 'चूना उपचार या रॉक फॉस्फेट का प्रयोग करें। फलदार वृक्षारोपण हेतु उपयुक्त।'
  }
};
