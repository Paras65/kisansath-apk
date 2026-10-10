// किसान साथी - बहिरा काका खाद एवं पोषण हैंडलर (Fertilizer Dosage & Weather Interlock Engine)
// IGKV Raipur Certified NPK Recommendations for Paddy, Chana, Wheat, Maize, Sarson & Nano-Fertilizers

import { detectCropFromText } from './kakaEntityExtractors.js';
import { resetKakaSession, setKakaSession } from './kakaSessionManager.js';

/**
 * Helper to generate Fertilizer direct answers cleanly across all crops with Weather rain interlock
 */
export const generateFertilizerDirectAnswer = (crop = 'paddy', acreVal = 1.0, weather = {}, queryEcho = '') => {
  const hasRainAlert = (weather.rainChance || 0) > 40 || (weather.windSpeed || 0) > 15;
  const rainNoteHi = hasRainAlert ? ' आज बारिश/तेज हवा की संभावना है, अतः यूरिया का छिड़काव अभी टालें!' : '';
  const rainNoteCg = hasRainAlert ? ' आज पानी गिरे के संका हे, त यूरिया छिड़काव रोक देवव ताकि दवाई बोहा झन जाय!' : '';

  if (crop === 'sugarcane') {
    const dapBags = Math.max(1, Math.round(acreVal * 2.0));
    const ureaBags = Math.max(1, Math.round(acreVal * 4.5));
    const mopBags = Math.max(1, Math.round(acreVal * 1.5));
    const zincKg = Math.max(1, Math.round(acreVal * 10));
    const textHi = `${acreVal} एकड़ गन्ना के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया, ${mopBags} बोरी पोटाश और ${zincKg} kg जिंक लगेगी भैया!${rainNoteHi}`;
    const textCg = `${acreVal} एकड़ गन्ना (ईख) बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया, ${mopBags} बोरी पोटाश अउ ${zincKg} kg जिंक लगही संगी!${rainNoteCg}`;

    const cards = [
      { icon: '🌿', label: 'DAP (बेसल)', value: `${dapBags} बोरी`, sub: 'बुआई/रोपाई के समय', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      { icon: '⚪', label: 'यूरिया (3 किस्त)', value: `${ureaBags} बोरी`, sub: 'कल्ले फूटने व बढ़वार बेरा', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
      { icon: '🔴', label: 'पोटाश (MOP)', value: `${mopBags} बोरी`, sub: 'गन्ना मोटाई व शर्करा वृद्धि', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
      { icon: '🌱', label: 'जिंक सल्फेट', value: `${zincKg} kg`, sub: 'सफेद धारी रोग से बचाव', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
    ];
    if (hasRainAlert) {
      cards.push({ icon: '⚠️', label: 'मौसम चेतावनी', value: 'छिड़काव रोकें', sub: 'बारिश/हवा में खाद न डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' });
    }

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🎋',
        headline: `${acreVal} एकड़ गन्ना खाद हिसाब`,
        headlineCg: `${acreVal} एकड़ गन्ना बर खाद के हिसाब`,
        queryEcho: queryEcho || `${acreVal} एकड़ गन्ना`,
        cards,
        advisoryText: 'गन्ना भारी खुराक वाली फसल है। बुआई के समय DAP व पोटाश दें। यूरिया को 45, 90 और 120 दिन पर मिट्टी चढ़ाते समय 3 किस्तों में दें।',
        advisoryTextCg: 'गन्ना म बुआई बेरा DAP अउ पोटाश डालव, अउ यूरिया ला माटी चढ़ावत बेरा 3 बार म डारव संगी!',
        whatsappShareText: `🎋 किसान साथी - गन्ना खाद हिसाब:\n• रकबा: ${acreVal} एकड़\n• DAP: ${dapBags} बोरी\n• यूरिया: ${ureaBags} बोरी\n• पोटाश: ${mopBags} बोरी\n• जिंक: ${zincKg} kg\n💡 IGKV रायपुर कृषि वैज्ञानिक अनुशंसा`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: acreVal, crop: 'sugarcane' },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  } else if (crop === 'chana') {
    const dapBags = Math.max(1, Math.round(acreVal * 0.6));
    const mopBags = Math.max(1, Math.round(acreVal * 0.4));
    const textHi = `${acreVal} एकड़ रबी चना के लिए ${dapBags} बोरी DAP और ${mopBags} बोरी पोटाश लगेगी भैया! दलहन में यूरिया न डालें।${rainNoteHi}`;
    const textCg = `${acreVal} एकड़ रबी चना बर ${dapBags} बोरी DAP अउ ${mopBags} बोरी पोटाश लगही संगी! चना म यूरिया झन डालव।${rainNoteCg}`;

    const cards = [
      { icon: '🌿', label: 'DAP (बेसल)', value: `${dapBags} बोरी`, sub: 'बुआई पूर्व खेत में', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      { icon: '🔴', label: 'पोटाश (MOP)', value: `${mopBags} बोरी`, sub: 'फूल व दाना मजबूती', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
      { icon: '⚪', label: 'यूरिया', value: '0 बोरी (मनाही)', sub: 'चना खुद नाइट्रोजन बनाता है', bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c' },
      { icon: '💊', label: 'बीजोपचार', value: 'ट्राइकोडर्मा', sub: 'उकठा रोग से बचाव हेतु', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
    ];
    if (hasRainAlert) {
      cards.push({ icon: '⚠️', label: 'मौसम चेतावनी', value: 'छिड़काव रोकें', sub: 'बारिश/हवा में खाद न डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' });
    }

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🌱',
        headline: `${acreVal} एकड़ रबी चना खाद हिसाब`,
        headlineCg: `${acreVal} एकड़ रबी चना बर खाद के हिसाब`,
        queryEcho: queryEcho || `${acreVal} एकड़ चना`,
        cards,
        advisoryText: `दलहन फसलों में यूरिया का प्रयोग न करें। बुआई से पूर्व राइजोबियम व ट्राइकोडर्मा से बीजोपचार अवश्य करें।${hasRainAlert ? ' बारिश के कारण आज छिड़काव न करें।' : ''}`,
        advisoryTextCg: `चना म यूरिया डाले ले पेड़ बाढ़थे बाक़ी दाना नइ भरे। ट्राइकोडर्मा ले बीजोपचार जरूर करव!${hasRainAlert ? ' पानी गिरे म दवाई झन डारव।' : ''}`,
        whatsappShareText: `🌱 किसान साथी - रबी चना खाद हिसाब:\n• रकबा: ${acreVal} एकड़\n• DAP: ${dapBags} बोरी\n• पोटाश: ${mopBags} बोरी\n• यूरिया: 0 (मनाही)\n💡 ट्राइकोडर्मा से बीजोपचार अवश्य करें।`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: acreVal, crop: 'chana' },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  } else if (crop === 'wheat') {
    const dapBags = Math.max(1, Math.round(acreVal * 1.2));
    const ureaBags = Math.max(1, Math.round(acreVal * 2.5));
    const mopBags = Math.max(1, Math.round(acreVal * 0.6));
    const textHi = `${acreVal} एकड़ गेहूं के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया और ${mopBags} बोरी पोटाश लगेगी भैया!${rainNoteHi}`;
    const textCg = `${acreVal} एकड़ गेहूं बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${mopBags} बोरी पोटाश लगही संगी!${rainNoteCg}`;

    const cards = [
      { icon: '🌿', label: 'DAP (बेसल)', value: `${dapBags} बोरी`, sub: 'बुआई के समय', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      { icon: '⚪', label: 'यूरिया (2 किस्त)', value: `${ureaBags} बोरी`, sub: 'पहली सिंचाई (CRI) व कल्ले फूटते समय', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
      { icon: '🔴', label: 'पोटाश (MOP)', value: `${mopBags} बोरी`, sub: 'दाना भराव व चमक', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
      { icon: '💧', label: 'क्राउन रूट (CRI)', value: '21 दिन पर सिंचाई', sub: 'पहली सिंचाई सबसे महत्वपूर्ण', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
    ];
    if (hasRainAlert) {
      cards.push({ icon: '⚠️', label: 'मौसम चेतावनी', value: 'छिड़काव रोकें', sub: 'बारिश/हवा में खाद न डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' });
    }

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🌾',
        headline: `${acreVal} एकड़ गेहूं खाद हिसाब`,
        headlineCg: `${acreVal} एकड़ गेहूं बर खाद के हिसाब`,
        queryEcho: queryEcho || `${acreVal} एकड़ गेहूं`,
        cards,
        advisoryText: 'गेहूं में बुआई के समय संपूर्ण DAP व पोटाश दें। यूरिया को पहली सिंचाई (21 दिन) और कल्ले फूटते समय दो बार में दें।',
        advisoryTextCg: 'गेहूं म बुआई बेरा DAP अउ पोटाश डालव, अउ 21 दिन म पहिली पानी के बाद यूरिया छिड़कव!',
        whatsappShareText: `🌾 किसान साथी - गेहूं खाद हिसाब:\n• रकबा: ${acreVal} एकड़\n• DAP: ${dapBags} बोरी\n• यूरिया: ${ureaBags} बोरी\n• पोटाश: ${mopBags} बोरी`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: acreVal, crop: 'wheat' },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  } else if (crop === 'maize') {
    const dapBags = Math.max(1, Math.round(acreVal * 1.2));
    const ureaBags = Math.max(1, Math.round(acreVal * 2.8));
    const mopBags = Math.max(1, Math.round(acreVal * 0.8));
    const zincKg = Math.max(1, Math.round(acreVal * 5));
    const textHi = `${acreVal} एकड़ मक्का के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया, ${mopBags} बोरी पोटाश और ${zincKg} kg जिंक लगेगी भैया!${rainNoteHi}`;
    const textCg = `${acreVal} एकड़ मक्का (जौनरा) बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${mopBags} बोरी पोटाश लगही संगी!${rainNoteCg}`;

    const cards = [
      { icon: '🌿', label: 'DAP (बेसल)', value: `${dapBags} बोरी`, sub: 'बुआई के समय', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      { icon: '⚪', label: 'यूरिया (3 किस्त)', value: `${ureaBags} बोरी`, sub: 'घुटने की ऊंचाई, नर-मंजरी व भुट्टा बनते समय', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
      { icon: '🔴', label: 'पोटाश (MOP)', value: `${mopBags} बोरी`, sub: 'मजबूत तना व बड़ा भुट्टा', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
      { icon: '🌱', label: 'जिंक सल्फेट', value: `${zincKg} kg`, sub: 'सफेद कली रोग बचाव', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
    ];
    if (hasRainAlert) {
      cards.push({ icon: '⚠️', label: 'मौसम चेतावनी', value: 'छिड़काव रोकें', sub: 'बारिश/हवा में खाद न डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' });
    }

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🌽',
        headline: `${acreVal} एकड़ मक्का खाद हिसाब`,
        headlineCg: `${acreVal} एकड़ मक्का बर खाद के हिसाब`,
        queryEcho: queryEcho || `${acreVal} एकड़ मक्का`,
        cards,
        advisoryText: 'मक्का अधिक पोषक तत्व चाहने वाली फसल है। यूरिया को घुटने तक ऊंचाई और भुट्टा आते समय किस्तों में दें।',
        advisoryTextCg: 'मक्का म यूरिया ला 3 बार म डारव ताकि भुट्टा बढ़िया भरय संगी!',
        whatsappShareText: `🌽 किसान साथी - मक्का खाद हिसाब:\n• रकबा: ${acreVal} एकड़\n• DAP: ${dapBags} बोरी\n• यूरिया: ${ureaBags} बोरी\n• पोटाश: ${mopBags} बोरी\n• जिंक: ${zincKg} kg`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: acreVal, crop: 'maize' },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  } else if (crop === 'sarson') {
    const dapBags = Math.max(1, Math.round(acreVal * 0.8));
    const ureaBags = Math.max(1, Math.round(acreVal * 1.5));
    const mopBags = Math.max(1, Math.round(acreVal * 0.4));
    const sulphurKg = Math.max(1, Math.round(acreVal * 10));
    const textHi = `${acreVal} एकड़ सरसों के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया, ${mopBags} बोरी पोटाश और ${sulphurKg} kg सल्फर लगेगा भैया!${rainNoteHi}`;
    const textCg = `${acreVal} एकड़ सरसों (राई) बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${sulphurKg} kg सल्फर लगही संगी!${rainNoteCg}`;

    const cards = [
      { icon: '🌿', label: 'DAP (बेसल)', value: `${dapBags} बोरी`, sub: 'बुआई पूर्व खेत में', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      { icon: '⚪', label: 'यूरिया (2 किस्त)', value: `${ureaBags} बोरी`, sub: 'बुआई व पहली सिंचाई पर', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
      { icon: '🟡', label: 'सल्फर (गंधक)', value: `${sulphurKg} kg`, sub: 'तेल प्रतिशत व दाना वृद्धि', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
      { icon: '🔴', label: 'पोटाश (MOP)', value: `${mopBags} बोरी`, sub: 'रोग रोधी क्षमता', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
    ];
    if (hasRainAlert) {
      cards.push({ icon: '⚠️', label: 'मौसम चेतावनी', value: 'छिड़काव रोकें', sub: 'बारिश/हवा में खाद न डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' });
    }

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🌼',
        headline: `${acreVal} एकड़ सरसों खाद हिसाब`,
        headlineCg: `${acreVal} एकड़ सरसों बर खाद के हिसाब`,
        queryEcho: queryEcho || `${acreVal} एकड़ सरसों`,
        cards,
        advisoryText: 'सरसों में सल्फर (गंधक) का प्रयोग अत्यंत आवश्यक है, इससे दानों में तेल की मात्रा 2 से 3% बढ़ जाती है।',
        advisoryTextCg: 'सरसों म सल्फर जरूर डालव, ओखर ले तेल के मात्रा बाढ़थे संगी!',
        whatsappShareText: `🌼 किसान साथी - सरसों खाद हिसाब:\n• रकबा: ${acreVal} एकड़\n• DAP: ${dapBags} बोरी\n• यूरिया: ${ureaBags} बोरी\n• सल्फर: ${sulphurKg} kg\n• पोटाश: ${mopBags} बोरी`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: acreVal, crop: 'sarson' },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  } else if (crop && !['paddy', 'dhan'].includes(crop)) {
    // Non-static crop fertilizer query (e.g. tomato, soybean, potato, chilli, banana, papaya, etc.)
    // Route to Google Gemini AI Agricultural Expert for certified scientific dosage
    return {
      needsAiExpert: true,
      detectedCrop: crop,
      acreVal,
    };
  } else {
    // Default: Paddy (धान)
    const dapBags = Math.max(1, Math.round(acreVal * 1.0));
    const ureaBags = Math.max(1, Math.round((acreVal * 100) / 45));
    const mopBags = Math.max(1, Math.round(acreVal * 0.6));
    const zincKg = Math.max(1, Math.round(acreVal * 5));
    const textHi = `${acreVal} एकड़ धान के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया और ${mopBags} बोरी पोटाश लगेगी भैया!${rainNoteHi}`;
    const textCg = `${acreVal} एकड़ धान बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${mopBags} बोरी पोटाश लगही संगी!${rainNoteCg}`;

    const cards = [
      { icon: '🌿', label: 'DAP (बेसल)', value: `${dapBags} बोरी`, sub: '50 kg बोरी • बुआई बेरा', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
      { icon: '⚪', label: 'यूरिया (2 किस्त)', value: `${ureaBags} बोरी`, sub: '45 kg बोरी • कल्ले फूटते समय', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
      { icon: '🔴', label: 'पोटाश (MOP)', value: `${mopBags} बोरी`, sub: '50 kg बोरी • दाना भराव', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
      { icon: '🌱', label: 'जिंक सल्फेट', value: `${zincKg} kg`, sub: 'खैरा रोग बचाव हेतु', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
    ];
    if (hasRainAlert) {
      cards.push({ icon: '⚠️', label: 'मौसम चेतावनी', value: 'छिड़काव रोकें', sub: 'बारिश/हवा में खाद न डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' });
    }

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🌾',
        headline: `${acreVal} एकड़ धान खाद हिसाब`,
        headlineCg: `${acreVal} एकड़ धान बर सही खाद के मात्रा`,
        queryEcho: queryEcho || `${acreVal} एकड़ धान`,
        cards,
        advisoryText: hasRainAlert
          ? 'सावधान: आज बारिश या 15 किमी/घंटे से तेज हवा की आशंका है। यूरिया का टॉप-ड्रेसिंग छिड़काव टालें ताकि खाद धुल न जाए।'
          : 'बुआई के समय DAP व पोटाश दें। यूरिया को दो किस्तों में कल्ले फूटते समय डालें।',
        advisoryTextCg: hasRainAlert
          ? 'चेत रखव: पानी या तेज हवा के संका हे, त यूरिया छिड़काव रोक देवव ताकि दवाई बोहा झन जाय!'
          : 'DAP अउ पोटाश ला बुआई बेरा डालव, अउ यूरिया ला 2 बार म छिड़कव संगी!',
        whatsappShareText: `🌾 किसान साथी - धान खाद हिसाब:\n• रकबा: ${acreVal} एकड़\n• DAP: ${dapBags} बोरी\n• यूरिया: ${ureaBags} बोरी (2 किस्तों में)\n• पोटाश: ${mopBags} बोरी\n• जिंक: ${zincKg} kg\n💡 IGKV रायपुर कृषि वैज्ञानिक अनुशंसा`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: acreVal, crop: 'paddy' },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  }
};

/**
 * Handles Fertilizer Voice Queries (Nano Fertilizers & Chemical Dosages)
 */
export const handleFertilizerIntent = (clean, transcript, extractedAcre, context = {}) => {
  // 1. नैनो यूरिया व नैनो डीएपी
  const nanoTriggers = ['नैनो यूरिया', 'नैनो डीएपी', 'नैनो खाद', 'nano urea', 'nano dap', 'इफको नैनो', 'iffco nano'];
  if (nanoTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'इफको नैनो यूरिया की 1 बोतल (500 ml) 1 बोरी यूरिया के बराबर काम करती है भैया! 2 से 4 मिली प्रति लीटर पानी में मिलाकर पत्तियों पर छिड़कें।';
    const textCg = 'इफको नैनो यूरिया के 1 बोतल 1 बोरी यूरिया के बराबर काम करथे संगी! 2 ले 4 मिली प्रति लीटर पानी म मिलाके पाना म छिड़काव करव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FERTILIZER',
        icon: '🧪',
        headline: 'इफको नैनो यूरिया व नैनो DAP उपयोग विधि',
        headlineCg: 'नैनो यूरिया अऊ नैनो DAP के सही प्रयोग',
        queryEcho: transcript,
        cards: [
          { icon: '🧪', label: '1 बोतल क्षमता', value: '1 बोरी (45 kg) समतुल्य', sub: '500 ml बोतल = 1 बोरी यूरिया', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💧', label: 'स्प्रे खुराक', value: '2 - 4 ml / लीटर पानी', sub: '30-40 ml प्रति 15L पंप', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌱', label: 'छिड़काव समय', value: 'कल्ले फूटते व फूल आते समय', sub: 'सीधे पत्तियों पर पर्णीय स्प्रे', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌍', label: 'पोषक तत्व दक्षता', value: '80% से अधिक अवशोषण', sub: 'मिट्टी व भूजल प्रदूषण शून्य', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'नैनो यूरिया का छिड़काव धूप निकलने के बाद सुबह या शाम को करें। जमीन में डालने के बजाय पत्तियों पर स्प्रे करने से पूरा पोषण पौधे को मिलता है।',
        advisoryTextCg: 'नैनो यूरिया ला जमीन म नइ डारना हे, पाना म स्प्रे करना हे। बिहनिया या संझा बेरा स्प्रे करव!',
        whatsappShareText: `🧪 किसान साथी - नैनो यूरिया गाइड:\n• मात्रा: 500 ml बोतल = 1 बोरी (45kg) यूरिया\n• खुराक: 2-4 ml प्रति लीटर पानी (35ml प्रति पंप)\n• समय: कल्ले फूटते व फूल आते समय\n• लाभ: 80% अवशोषण व भूमि सुरक्षित`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', subTab: 0, label: 'पूरा खाद कैलकुलेटर खोलें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'SHOW_NANO_FERT' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  // 2. मानक खाद एवं उर्वरक गणना
  const fertTriggers = ['खाद', 'यूरिया', 'dap', 'पोटाश', 'जिंक', 'सल्फर', 'कितना खाद', 'खाद कैलकुलेटर', 'खाद कते डारना', 'डारव', 'डारना', 'khad', 'khaad', 'urea', 'yuriya', 'potash'];
  if (fertTriggers.some((t) => clean.includes(t))) {
    const crop = detectCropFromText(clean);
    if (crop && !['paddy', 'dhan', 'chana', 'wheat', 'maize', 'sarson', 'sugarcane'].includes(crop)) {
      resetKakaSession();
      return {
        needsAiExpert: true,
        detectedCrop: crop,
        acreVal: extractedAcre || 1.0,
      };
    }
    if (extractedAcre) {
      resetKakaSession();
      return generateFertilizerDirectAnswer(crop, extractedAcre, context?.weather || {}, transcript);
    } else {
      setKakaSession('FERTILIZER', { crop });
      const textHi = 'खाद के हिसाब के लिए आपका खेत कितने एकड़ है भैया? अपना रकबा बताएं — 1 एकड़, 2 एकड़ या 3 एकड़?';
      const textCg = 'खाद के हिसाब बर तोर खेत कतका एकड़ हे संगी? अपन रकबा बताव — 1 एकड़, 2 एकड़ या 3 एकड़?';

      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'FERTILIZER',
          icon: '🧮',
          headline: 'खाद बोरी की सही गणना',
          headlineCg: 'खाद के सही बोरी हिसाब',
          queryEcho: transcript,
          cards: [
            { icon: '🌾', label: 'फसल', value: crop === 'chana' ? 'रबी चना' : (crop === 'wheat' ? 'गेहूं' : (crop === 'maize' ? 'मक्का' : (crop === 'sarson' ? 'सरसों' : 'धान'))), sub: 'अनुशंसित फसल', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
            { icon: '⚖️', label: 'मानक खुराक', value: '1 DAP • 2.2 यूरिया • 0.6 पोटाश', sub: 'प्रति एकड़ IGKV दर', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          ],
          advisoryText: 'अपना खेत का रकबा नीचे चुनें या बोलकर बताएं ताकि सही बोरी की संख्या तुरंत आ सके।',
          advisoryTextCg: 'तोर खेत के रकबा नीचे छूव या बोलके बताव ताकि सही बोरी के गिनती निकल जाय।',
          whatsappShareText: '',
          needsClarification: true,
          missingSlot: 'acre',
          slotSuggestions: ['1 एकड़', '2 एकड़', '2.5 एकड़', '3 एकड़', '5 एकड़'],
          deepLink: null,
        },
        route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
        action: { type: 'ASK_ACRES', crop },
        needsClarification: true,
        extractedAcre: null,
        confidence: 0.95,
      };
    }
  }

  return null;
};

