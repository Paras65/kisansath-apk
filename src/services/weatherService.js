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
 * Fetch Live Weather from Open-Meteo (Zero Key, Free)
 */
export const fetchLiveWeather = async (districtName = 'रायपुर') => {
  const coords = CG_DISTRICT_COORDS[districtName] || CG_DISTRICT_COORDS['रायपुर'];
  const cacheKey = `kisan_weather_${districtName}`;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};

      const weatherCode = current.weather_code ?? 0;
      const wmoInfo = WMO_CODE_MAP[weatherCode] || WMO_CODE_MAP[0];
      const rainProbability = daily.precipitation_probability_max?.[0] ?? Math.round((current.precipitation || 0) * 40);
      const tempMax = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m || 30);
      const tempMin = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : Math.round((current.temperature_2m || 30) - 6);

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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const daily = data.daily || {};

      const weatherCode = current.weather_code ?? 0;
      const wmoInfo = WMO_CODE_MAP[weatherCode] || WMO_CODE_MAP[0];
      const rainProbability = daily.precipitation_probability_max?.[0] ?? Math.round((current.precipitation || 0) * 40);
      const tempMax = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m || 30);
      const tempMin = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : Math.round((current.temperature_2m || 30) - 6);

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
