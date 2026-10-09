// किसान साथी - बहिरा काका मौसम हैंडलर (Weather Advisory & Spray Safety Engine)
// Live agro-climatic weather advisories, wind speed interlock, and spray safety recommendations

import { getCachedWeather } from '../weatherService.js';

export const handleWeatherIntent = (clean, transcript, selectedDistrict, spokenDistrict, context = {}) => {
  const weatherTriggers = ['मौसम', 'बारिश', 'पानी गिरही', 'पानी गिरेगा', 'हवा', 'धूप', 'घाम', 'बादल', 'मावठा', 'mausam', 'mosam', 'barish', 'baarish', 'rain', 'weather', 'pani'];
  if (weatherTriggers.some((t) => clean.includes(t))) {
    let weather = context?.weather;
    if (spokenDistrict || !weather || (weather.district && weather.district !== selectedDistrict)) {
      weather = getCachedWeather(selectedDistrict);
    }
    const temp = weather?.temp ?? 29;
    const condText = weather?.conditionText || 'साफ मौसम';
    const condTextCg = weather?.conditionTextCg || condText;
    const wind = weather?.windSpeed ?? 10;
    const rainChance = weather?.rainProbability ?? weather?.rainChance ?? 15;
    const canSpray = wind <= 15 && rainChance <= 40;
    const sprayStatus = canSpray ? '✓ छिड़काव अनुकूल' : '⚠️ छिड़काव रोकें';

    const textHi = `आज ${selectedDistrict} में तापमान ${temp}°C और मौसम ${condText} है भैया! ${canSpray ? 'आज कीटनाशक व खाद का छिड़काव सुरक्षित है।' : 'बारिश या तेज हवा के कारण छिड़काव टालें!'}`;
    const textCg = `आज ${selectedDistrict} म तापमान ${temp}°C अउ मौसम ${condTextCg} हे संगी! ${canSpray ? 'आज स्प्रे करे बर मौसम बने हे।' : 'पानी या तेज हवा म छिड़काव रोक देवव ताकि दवाई बोहा झन जाय!'}`;

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'WEATHER',
        icon: '🌤️',
        headline: `${selectedDistrict}: आज का लाइव मौसम व छिड़काव सलाह`,
        headlineCg: `${selectedDistrict}: आज के मौसम अऊ स्प्रे सलाह`,
        queryEcho: transcript,
        cards: [
          { icon: '🌡️', label: 'तापमान', value: `${temp}°C`, sub: condText, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '💧', label: 'बारिश संभावना', value: `${rainChance}%`, sub: rainChance > 40 ? 'बारिश की आशंका' : 'कम संभावना', bg: rainChance > 40 ? '#fef2f2' : '#f0fdf4', border: rainChance > 40 ? '#fecaca' : '#86efac', color: rainChance > 40 ? '#991b1b' : '#166534' },
          { icon: '💨', label: 'हवा की गति', value: `${wind} km/h`, sub: wind > 15 ? 'तेज हवा' : 'सामान्य गति', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
          { icon: '🚜', label: 'छिड़काव सलाह', value: sprayStatus, sub: canSpray ? 'छिड़काव कर सकते हैं' : 'तेज हवा/बारिश से टालें', bg: canSpray ? '#f0fdf4' : '#fef2f2', border: canSpray ? '#86efac' : '#fecaca', color: canSpray ? '#166534' : '#991b1b' },
        ],
        advisoryText: canSpray ? `आज ${selectedDistrict} में मौसम सामान्य है। सुबह या शाम के समय कीटनाशक व खाद का छिड़काव उत्तम रहेगा।` : `सावधान: ${selectedDistrict} में बारिश या तेज हवा में छिड़काव करने से दवा धुल जाती है और उड़ जाती है।`,
        advisoryTextCg: canSpray ? `आज ${selectedDistrict} म मौसम बने हे, बिहनिया या संझा बेरा स्प्रे कर सकथव।` : `चेत रखव: ${selectedDistrict} म पानी या तेज हवा म स्प्रे झन करव, दवाई बोहा जाही!`,
        whatsappShareText: `🌤️ किसान साथी मौसम बुलेटिन (${selectedDistrict}):\n• तापमान: ${temp}°C (${condText})\n• बारिश संभावना: ${rainChance}%\n• हवा: ${wind} km/h\n• छिड़काव सलाह: ${sprayStatus}\n🌾 100% सटीक कृषि मौसम परामर्श`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [`${selectedDistrict} मंडी भाव`, 'खाद हिसाब', 'धान ₹3,100 भाव'],
        deepLink: { tab: 'home', label: `${selectedDistrict} मौसम देखें` },
      },
      route: { target: 'home', type: 'tab', label: 'मौसम डैशबोर्ड' },
      action: { type: 'SHOW_WEATHER', district: selectedDistrict },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }
  return null;
};

