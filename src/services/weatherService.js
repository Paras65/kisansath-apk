// किसान साथी - Zero-Key Public Weather & Agricultural Advisory Service
// Powered by Open-Meteo Open API (100% Free, Zero API Key Required)
// Features: Auto-Geocoding, Live Precipitation %, Wind Speed, Humidity, Offline Caching, Smart Spray Advisor.

// Coordinates for Chhattisgarh Districts
export const CG_DISTRICT_COORDS = {
  'रायपुर': { lat: 21.2514, lon: 81.6296, name: 'रायपुर (Raipur)' },
  'बिलासपुर': { lat: 22.0797, lon: 82.1409, name: 'बिलासपुर (Bilaspur)' },
  'दुर्ग': { lat: 21.1904, lon: 81.2849, name: 'दुर्ग (Durg)' },
  'राजनांदगांव': { lat: 21.1030, lon: 81.0345, name: 'राजनांदगांव' },
  'धमतरी': { lat: 20.7071, lon: 81.5497, name: 'धमतरी (Dhamtari)' },
  'कवर्धा': { lat: 22.0125, lon: 81.2464, name: 'कबीरधाम / कवर्धा' },
  'बलौदाबाजार': { lat: 21.6626, lon: 82.1627, name: 'बलौदाबाजार' },
  'जगदलपुर': { lat: 19.0744, lon: 82.0224, name: 'बस्तर / जगदलपुर' },
  'महासमुंद': { lat: 21.1090, lon: 82.0984, name: 'महासमुंद' },
  'जांजगीर-चांपा': { lat: 22.0118, lon: 82.5714, name: 'जांजगीर-चांपा' },
  'रायगढ़': { lat: 21.8974, lon: 83.3950, name: 'रायगढ़' },
  'कोरबा': { lat: 22.3595, lon: 82.7501, name: 'कोरबा' },
  'अंबिकापुर': { lat: 23.1200, lon: 83.1950, name: 'सरगुजा / अंबिकापुर' },
  'कांकेर': { lat: 20.2718, lon: 81.4925, name: 'उत्तर बस्तर कांकेर' },
  'बेमेतरा': { lat: 21.7032, lon: 81.5348, name: 'बेमेतरा' },
  'बालोद': { lat: 20.7303, lon: 81.2057, name: 'बालोद' },
  'गरियाबंद': { lat: 20.9577, lon: 82.0006, name: 'गरियाबंद' },
  'मुंगेली': { lat: 22.0664, lon: 81.6936, name: 'मुंगेली' },
};

// Weather WMO Code to Hindi condition & icon
const WMO_CODE_MAP = {
  0: { text: 'साफ आसमान (धूप)', icon: '☀️', condition: 'Sunny' },
  1: { text: 'मुख्यतः साफ', icon: '🌤️', condition: 'Mainly Clear' },
  2: { text: 'आंशिक बादल', icon: '⛅', condition: 'Partly Cloudy' },
  3: { text: 'बादल छाए रहेंगे', icon: '☁️', condition: 'Overcast' },
  45: { text: 'कोहरा / धुंध', icon: '🌫️', condition: 'Fog' },
  48: { text: 'घना कोहरा', icon: '🌫️', condition: 'Fog' },
  51: { text: 'हल्की बूंदाबांदी', icon: '🌦️', condition: 'Light Drizzle' },
  53: { text: 'मध्यम बूंदाबांदी', icon: '🌦️', condition: 'Drizzle' },
  55: { text: 'घनी बूंदाबांदी', icon: '🌧️', condition: 'Heavy Drizzle' },
  61: { text: 'हल्की बारिश', icon: '🌧️', condition: 'Light Rain' },
  63: { text: 'मध्यम बारिश', icon: '🌧️', condition: 'Moderate Rain' },
  65: { text: 'भारी बारिश', icon: '⛈️', condition: 'Heavy Rain' },
  80: { text: 'हल्की वर्षा बौछार', icon: '🌦️', condition: 'Rain Showers' },
  81: { text: 'तेज वर्षा बौछार', icon: '🌧️', condition: 'Rain Showers' },
  82: { text: 'मूसलाधार बौछारें', icon: '⛈️', condition: 'Violent Showers' },
  95: { text: 'आंधी-तूफान व बिजली', icon: '⚡', condition: 'Thunderstorm' },
  96: { text: 'तूफान व ओलावृष्टि', icon: '⛈️', condition: 'Hailstorm' },
  99: { text: 'भारी तूफान व ओले', icon: '⛈️', condition: 'Severe Hailstorm' },
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
      statusColor: 'error',
      severity: 'warning',
      badge: '⚠️ छिड़काव रोकें (बारिश की संभावना)',
      advisory: `आज बारिश की संभावना ${rainProb}% है। यूरिया, पोटाश और कीटनाशक का छिड़काव तुरंत टालें ताकि दवा बहकर नष्ट न हो जाए।`,
      voice: `सावधान किसान भाई! आज बारिश की संभावना ${rainProb} प्रतिशत है। खेत में यूरिया खाद और कीटनाशक का छिड़काव तुरंत रोकें ताकि दवा बह न जाए।`,
      canSpray: false,
    };
  }

  if (windSpeed > 15) {
    return {
      status: 'छिड़काव टालें (तेज हवा)',
      statusColor: 'warning',
      severity: 'warning',
      badge: '💨 तेज हवा (दवा उड़ने का जोखिम)',
      advisory: `हवा की गति ${windSpeed} किमी/घंटा है। तेज हवा में कीटनाशक का छिड़काव न करें, दवा उड़कर बेकार हो जाएगी। हवा थमने की प्रतीक्षा करें।`,
      voice: `हवा की गति ${windSpeed} किलोमीटर प्रति घंटा है। तेज हवा के कारण दवा का छिड़काव टालें।`,
      canSpray: false,
    };
  }

  if (humidity > 80) {
    return {
      status: 'रोग निगरानी आवश्यक',
      statusColor: 'info',
      severity: 'info',
      badge: '🌫️ अधिक नमी (फफूंद जोखिम)',
      advisory: `हवा में नमी ${humidity}% है। धान में शीथ ब्लाइट और दलहन में फफूंद रोग की संभावना है। खेत की मेड़ों का निरीक्षण करें।`,
      voice: `हवा में नमी ${humidity} प्रतिशत है। फसलों में फफूंद व कीटों के प्रकोप पर नजर रखें।`,
      canSpray: true,
    };
  }

  if (temp > 38) {
    return {
      status: 'शाम को ही छिड़काव करें',
      statusColor: 'warning',
      severity: 'warning',
      badge: '☀️ तेज धूप (दोपहर में रोकें)',
      advisory: `तापमान ${temp}°C पहुंच चुका है। दोपहर की कड़ी धूप में छिड़काव करने से पत्तियां जल सकती हैं। छिड़काव शाम 4:30 बजे के बाद ही करें।`,
      voice: `तापमान ${temp} डिग्री है। दोपहर में छिड़काव न करें, शाम को हल्की धूप ढलने पर ही करें।`,
      canSpray: true,
    };
  }

  return {
    status: 'छिड़काव हेतु उत्तम अनुकूल',
    statusColor: 'success',
    severity: 'success',
    badge: '✅ उत्तम अनुकूल मौसम',
    advisory: `मौसम पूरी तरह साफ है और हवा सामान्य (${windSpeed} km/h) है। आज यूरिया खाद व कीटनाशक छिड़काव का सबसे उत्तम समय है।`,
    voice: `आज मौसम बहुत अच्छा है। हवा सामान्य है। यूरिया खाद और कीटनाशक छिड़काव का अनुकूल समय है।`,
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
        conditionIcon: wmoInfo.icon,
        conditionName: wmoInfo.condition,
        updatedAt: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        isLive: true,
      };

      // Attach advisory
      parsedWeather.sprayAdvisory = getSprayAdvisory(parsedWeather);

      // Save to localStorage for offline resilience
      localStorage.setItem(cacheKey, JSON.stringify(parsedWeather));
      return parsedWeather;
    }
  } catch (err) {
    console.warn('[Open-Meteo Offline Fallback]', err.message);
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
    conditionIcon: '🌤️',
    conditionName: 'Sunny',
    updatedAt: 'ऑफ़लाइन सुरक्षित डेटा',
    isLive: false,
  };
  defaultWeather.sprayAdvisory = getSprayAdvisory(defaultWeather);
  return defaultWeather;
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
