// किसान साथी - बहिरा काका फसल बुआई व उन्नत खेती हैंडलर (Crop Sowing & Cultivation Engine)
// IGKV Raipur Certified Packages of Practices: Sugarcane, Chana, Wheat, Maize, Vegetables & Millets

import { detectCropFromText } from './kakaEntityExtractors.js';
import { resetKakaSession } from './kakaSessionManager.js';

/**
 * Checks if the user is asking about planting, sowing, or cultivating a crop
 */
export const isCultivationQuery = (clean) => {
  const triggers = [
    'लगाना', 'लगाना है', 'लगाना चाहत', 'लगाना चाहता', 'लगाना चाहते', 'लगाय', 'लगाबो', 'लगाएं',
    'बोना', 'बोना है', 'बोना चाहत', 'बोएं', 'बोवाई', 'बुआई', 'बोआई',
    'खेती', 'खेती करना', 'खेती कैसे', 'खेती के तरीका', 'रोपाई', 'उगाना', 'पैदावार',
    'cultivation', 'sowing', 'planting', 'plant', 'kheti'
  ];
  return triggers.some((t) => clean.includes(t));
};

/**
 * Handles Crop Cultivation / Sowing queries
 */
export const handleCropCultivationIntent = (clean, transcript, extractedAcre = null, district = 'रायपुर') => {
  const isCult = isCultivationQuery(clean);
  const detectedCrop = detectCropFromText(clean);

  // If query is specifically about planting a crop, OR mentions sugarcane with acreage
  if (!isCult && !(detectedCrop === 'sugarcane' && extractedAcre)) {
    return null;
  }

  // If no specific crop detected, return null to let other handlers or fallback work
  if (!detectedCrop) {
    return null;
  }

  const acreVal = extractedAcre || 1.0;
  resetKakaSession();

  // ── 1. गन्ना (Sugarcane / ईख) ──
  if (detectedCrop === 'sugarcane') {
    const totalSetts = Math.round(acreVal * 32000);
    const dapBags = Math.max(1, Math.round(acreVal * 2.0));
    const mopBags = Math.max(1, Math.round(acreVal * 1.5));
    const ureaBags = Math.max(1, Math.round(acreVal * 4.5));

    const textHi = `जी भैया! आपके ${acreVal} एकड़ खेत में गन्ना (ईख) बुआई के लिए लगभग ${totalSetts.toLocaleString('en-IN')} दो-आंख वाले टुकड़े लगेंगे। Co 86032 या Co 0238 किस्म चुनें, और बुआई के समय 2 बोरी DAP व डेढ़ बोरी पोटाश बेसल डोज में अवश्य दें।`;
    const textCg = `हव बेटा! तोर ${acreVal} एकड़ म गन्ना (ईख) लगाय बर लगभग ${totalSetts.toLocaleString('en-IN')} दो-आंख वाले टुकड़े लगही! Co-86032 या Co-0238 जात चुनव, अऊ बुआई बेरा 2 बोरी DAP अउ डेढ़ बोरी पोटाश बेसल म डारव! कवर्धा या बालोद शक्कर कारखाना म बढ़िया बिकही!`;

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'CROP_CULTIVATION',
        icon: '🎋',
        headline: `${acreVal} एकड़ गन्ना बुआई व उन्नत खेती मार्गदर्शन`,
        headlineCg: `${acreVal} एकड़ म गन्ना लगाय के पूरा हिसाब`,
        queryEcho: transcript,
        cards: [
          { icon: '🎋', label: 'बीज/टुकड़े दर', value: `~${totalSetts.toLocaleString('en-IN')} टुकड़े`, sub: '2-आंख वाले सेट (प्रति एकड़ मानक)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌾', label: 'उन्नत किस्में', value: 'Co 86032 / Co 0238', sub: 'उच्च शर्करा व 400-500 qtl उपज', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌿', label: 'बेसल खाद (DAP+MOP)', value: `${dapBags} DAP + ${mopBags} पोटाश`, sub: `बुआई के समय (+${ureaBags} बोरी यूरिया बाद में)`, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '📏', label: 'कतार दूरी', value: '4 से 5 फीट नाली (Trench)', sub: 'ट्रेंच विधि से अधिक कल्ले', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'शरदकालीन (अक्टूबर-नवंबर) या वसंतकालीन (फरवरी-मार्च) में बुआई करें। ट्रेंच विधि से 4-5 फीट पर नाली बनाकर बुआई करने से 400-500 क्विंटल प्रति एकड़ तक उपज मिलती है। कवर्धा (भोरमदेव) व बालोद (दंतेश्वरी) सहकारी शक्कर कारखानों से सीधा अनुबंध लाभ लें।',
        advisoryTextCg: 'अक्टूबर-नवंबर या फरवरी-मार्च म बोवाई करव। नाली विधि ले 4-5 फीट दूरी म लगाय ले 400-500 क्विंटल पैदावार मिलथे। कवर्धा (भोरमदेव) अऊ बालोद (दंतेश्वरी) कारखाना म गन्ना आसानी ले बिक जाथे संगी!',
        whatsappShareText: `🎋 किसान साथी - गन्ना (Sugarcane) बुआई मार्गदर्शन:\n• रकबा: ${acreVal} एकड़\n• बीज टुकड़े: ~${totalSetts.toLocaleString('en-IN')} सेट\n• अनुशंसित किस्में: Co 86032, Co 0238\n• बेसल खाद: ${dapBags} बोरी DAP + ${mopBags} बोरी पोटाश\n• यूरिया: ${ureaBags} बोरी (3 किस्तों में मिट्टी चढ़ाते समय)\n🔒 आधुनिक कृषि तकनीक व प्रमाणित मानक`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: ['गन्ना में खाद का हिसाब', 'गन्ना में तना छेदक दवा', 'आज का मौसम'],
        deepLink: { tab: 'schemes', subTab: 0, label: 'खाद कैलकुलेटर देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'गन्ना खेती' },
      action: { type: 'AUTO_CALC_FERTILIZER', crop: 'sugarcane', acre: acreVal },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  }

  // ── 2. चना (Chickpea) ──
  if (detectedCrop === 'chana') {
    const seedKg = Math.round(acreVal * 30);
    const dapBags = Math.max(1, Math.round(acreVal * 0.6));
    const mopBags = Math.max(1, Math.round(acreVal * 0.4));

    const textHi = `जी भैया! आपके ${acreVal} एकड़ खेत में रबी चना बुआई हेतु लगभग ${seedKg} kg बीज लगेगा। JG-11 या जाकी 9218 किस्म चुनें। बुआई से पहले ट्राइकोडर्मा से बीजोपचार अवश्य करें और ${dapBags} बोरी DAP व ${mopBags} बोरी पोटाश दें। यूरिया न डालें।`;
    const textCg = `हव बेटा! तोर ${acreVal} एकड़ म रबी चना बर लगभग ${seedKg} kg बीज लगही। JG-11 या जाकी 9218 जात चुनव। ट्राइकोडर्मा ले बीजोपचार जरूर करव अऊ ${dapBags} बोरी DAP अउ ${mopBags} बोरी पोटाश डारव! यूरिया झन डालव!`;

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'CROP_CULTIVATION',
        icon: '🌱',
        headline: `${acreVal} एकड़ रबी चना बुआई मार्गदर्शन`,
        headlineCg: `${acreVal} एकड़ म चना बोवाई के हिसाब`,
        queryEcho: transcript,
        cards: [
          { icon: '⚖️', label: 'बीज दर', value: `${seedKg} kg बीज`, sub: '30-35 kg प्रति एकड़ मानक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌾', label: 'उन्नत किस्में', value: 'JG-11 / जाकी 9218 / राधे', sub: 'उकठा रोधी व अधिक पैदावार', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌿', label: 'खाद खुराक', value: `${dapBags} DAP + ${mopBags} पोटाश`, sub: 'यूरिया पूरी तरह वर्जित', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '💊', label: 'बीजोपचार', value: 'ट्राइकोडर्मा 5g/kg', sub: 'उकठा रोग सुरक्षा', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
        ],
        advisoryText: 'अक्टूबर-नवंबर में खेत में नमी रहते बुआई करें। कतार से कतार 30 सेमी दूरी रखें। बुआई से पहले राइजोबियम व ट्राइकोडर्मा से बीजोपचार अनिवार्य है।',
        advisoryTextCg: 'अक्टूबर-नवंबर म बोवाई करव। ट्राइकोडर्मा ले बीजोपचार जरूर करव ताकि उकठा रोग झन लगय संगी!',
        whatsappShareText: `🌱 किसान साथी - रबी चना बुआई मार्गदर्शन:\n• रकबा: ${acreVal} एकड़\n• बीज दर: ${seedKg} kg\n• किस्में: JG-11, जाकी 9218\n• खाद: ${dapBags} DAP + ${mopBags} पोटाश`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: ['चना में खाद का हिसाब', 'चना का मंडी भाव', 'आज का मौसम'],
        deepLink: { tab: 'schemes', subTab: 0, label: 'खाद कैलकुलेटर देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'चना बुआई' },
      action: { type: 'AUTO_CALC_FERTILIZER', crop: 'chana', acre: acreVal },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  }

  // ── 3. गेहूं (Wheat) ──
  if (detectedCrop === 'wheat') {
    const seedKg = Math.round(acreVal * 45);
    const dapBags = Math.max(1, Math.round(acreVal * 1.2));
    const ureaBags = Math.max(1, Math.round(acreVal * 2.5));
    const mopBags = Math.max(1, Math.round(acreVal * 0.6));

    const textHi = `जी भैया! आपके ${acreVal} एकड़ खेत में गेहूं बुआई हेतु लगभग ${seedKg} kg बीज लगेगा। GW-322 या लोक-1 किस्म चुनें। बुआई के समय ${dapBags} बोरी DAP व ${mopBags} बोरी पोटाश दें। 21 दिन पर पहली क्राउन रूट सिंचाई सबसे महत्वपूर्ण है।`;
    const textCg = `हव बेटा! तोर ${acreVal} एकड़ म गेहूं बर लगभग ${seedKg} kg बीज लगही। GW-322 या लोक-1 जात चुनव। बुआई बेरा ${dapBags} बोरी DAP अउ ${mopBags} बोरी पोटाश डारव, अउ 21 दिन म पहिली सिंचाई जरूर करव!`;

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'CROP_CULTIVATION',
        icon: '🌾',
        headline: `${acreVal} एकड़ गेहूं बुआई मार्गदर्शन`,
        headlineCg: `${acreVal} एकड़ म गेहूं बोवाई के हिसाब`,
        queryEcho: transcript,
        cards: [
          { icon: '⚖️', label: 'बीज दर', value: `${seedKg} kg बीज`, sub: '40-45 kg प्रति एकड़ मानक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌾', label: 'उन्नत किस्में', value: 'GW-322 / लोक-1 / शरबती', sub: 'रबी छत्तीसगढ़ उपयुक्त', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌿', label: 'खाद खुराक', value: `${dapBags} DAP + ${ureaBags} यूरिया`, sub: `${mopBags} बोरी पोटाश सहित`, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '💧', label: 'पहली सिंचाई (CRI)', value: '21 दिन पर', sub: 'मुकुट जड़ बनते समय', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'नवंबर के प्रथम पखवाड़े में बुआई करें। 21 दिन बाद पहली सिंचाई के तुरंत बाद यूरिया की पहली टॉप-ड्रेसिंग करें।',
        advisoryTextCg: 'नवंबर म बोवाई करव। 21 दिन म पहिली पानी के बाद यूरिया छिड़कव संगी!',
        whatsappShareText: `🌾 किसान साथी - गेहूं बुआई मार्गदर्शन:\n• रकबा: ${acreVal} एकड़\n• बीज दर: ${seedKg} kg\n• किस्में: GW-322, लोक-1\n• खाद: ${dapBags} DAP + ${ureaBags} यूरिया + ${mopBags} MOP`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: ['गेहूं में खाद का हिसाब', 'गेहूं में सिंचाई समय', 'गेहूं का मंडी भाव'],
        deepLink: { tab: 'schemes', subTab: 0, label: 'खाद कैलकुलेटर देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'गेहूं बुआई' },
      action: { type: 'AUTO_CALC_FERTILIZER', crop: 'wheat', acre: acreVal },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  }

  // ── 4. मक्का (Maize / जुनहरी) ──
  if (detectedCrop === 'maize') {
    const seedKg = Math.round(acreVal * 8);
    const dapBags = Math.max(1, Math.round(acreVal * 1.2));
    const ureaBags = Math.max(1, Math.round(acreVal * 2.8));
    const mopBags = Math.max(1, Math.round(acreVal * 0.8));

    const textHi = `जी भैया! आपके ${acreVal} एकड़ खेत में संकर मक्का बुआई हेतु लगभग ${seedKg} kg बीज लगेगा। पायनियर 30V92 या बायोसीड 9681 किस्म चुनें। कतार से कतार 60 सेमी और पौधे से पौधा 20 सेमी दूरी रखें।`;
    const textCg = `हव बेटा! तोर ${acreVal} एकड़ म मक्का (जुनहरी) बर लगभग ${seedKg} kg संकर बीज लगही। पायनियर 30V92 या बायोसीड 9681 जात चुनव। 60 सेमी दूरी म कतार बनाके बोवव!`;

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'CROP_CULTIVATION',
        icon: '🌽',
        headline: `${acreVal} एकड़ मक्का बुआई मार्गदर्शन`,
        headlineCg: `${acreVal} एकड़ म मक्का बोवाई के हिसाब`,
        queryEcho: transcript,
        cards: [
          { icon: '⚖️', label: 'संकर बीज दर', value: `${seedKg} kg संकर बीज`, sub: '7-8 kg प्रति एकड़ मानक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌽', label: 'उन्नत किस्में', value: 'पायनियर / बायोसीड 9681', sub: '25-30 क्विंटल/एकड़ उपज', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌿', label: 'खाद खुराक', value: `${dapBags} DAP + ${ureaBags} यूरिया`, sub: `${mopBags} बोरी पोटाश सहित`, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '📏', label: 'दूरी', value: '60 × 20 सेमी', sub: 'कतार × पौधा दूरी', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'मक्का में फॉल आर्मीवर्म कीट से बचाव हेतु बीज को सायनट्रानिलिप्रोल से उपचारित करें। यूरिया को घुटने की ऊंचाई और नर-मंजरी आते समय किस्तों में दें।',
        advisoryTextCg: 'मक्का म इल्ली ले बचे बर बीजोपचार करव। यूरिया ला 3 बार म डारव संगी!',
        whatsappShareText: `🌽 किसान साथी - मक्का बुआई मार्गदर्शन:\n• रकबा: ${acreVal} एकड़\n• बीज दर: ${seedKg} kg\n• किस्में: पायनियर, बायोसीड 9681\n• खाद: ${dapBags} DAP + ${ureaBags} यूरिया`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: ['मक्का में खाद का हिसाब', 'मक्का में इल्ली की दवा', 'मंडी भाव'],
        deepLink: { tab: 'schemes', subTab: 0, label: 'खाद कैलकुलेटर देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'मक्का बुआई' },
      action: { type: 'AUTO_CALC_FERTILIZER', crop: 'maize', acre: acreVal },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  }

  // ── 5. धान (Paddy - यदि स्पष्ट रूप से बुआई/रोपाई पूछी गई हो) ──
  if (detectedCrop === 'paddy') {
    const seedKg = Math.round(acreVal * 18);
    const dapBags = Math.max(1, Math.round(acreVal * 1.0));
    const ureaBags = Math.max(1, Math.round(acreVal * 2.2));
    const mopBags = Math.max(1, Math.round(acreVal * 0.6));

    const textHi = `जी भैया! आपके ${acreVal} एकड़ खेत में धान रोपाई हेतु लगभग ${seedKg} kg बीज लगेगा। सरना (MTU 1001), महामाया या स्वर्णा सब-1 किस्म चुनें। 20-25 दिन के थरहा की रोपाई करें और बुआई समय 1 बोरी DAP व 30 kg पोटाश दें।`;
    const textCg = `हव बेटा! तोर ${acreVal} एकड़ म धान बर लगभग ${seedKg} kg बीज लगही। सरना, महामाया या स्वर्णा सब-1 जात चुनव। 21-25 दिन के थरहा ला रोपा लगावव, अऊ बुआई बेरा 1 बोरी DAP अउ आधा बोरी पोटाश डारव!`;

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'CROP_CULTIVATION',
        icon: '🌾',
        headline: `${acreVal} एकड़ धान बुआई व रोपाई मार्गदर्शन`,
        headlineCg: `${acreVal} एकड़ म धान रोपाई के हिसाब`,
        queryEcho: transcript,
        cards: [
          { icon: '⚖️', label: 'बीज दर (रोपाई)', value: `${seedKg} kg बीज`, sub: '15-20 kg/एकड़ (लेही बर 30 kg)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌾', label: 'उन्नत किस्में', value: 'सरना / महामाया / स्वर्णा सब-1', sub: '20-25 क्विंटल/एकड़ उपज', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌿', label: 'खाद खुराक', value: `${dapBags} DAP + ${ureaBags} यूरिया`, sub: `${mopBags} बोरी पोटाश + 5 kg जिंक`, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌱', label: 'थरहा आयु', value: '20-25 दिन', sub: '2-3 पौधा प्रति हिल रोपाई', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'रोपाई 20 × 15 सेमी की दूरी पर 2-3 स्वस्थ पौधे प्रति स्थान लगाएं। खैरा रोग से बचाव हेतु 5 kg जिंक सल्फेट बुआई के समय अवश्य डालें।',
        advisoryTextCg: '20 × 15 सेमी दूरी म 2-3 पौधा लगावव। खैरा रोग ले बचे बर जिंक जरूर डारव संगी!',
        whatsappShareText: `🌾 किसान साथी - धान बुआई मार्गदर्शन:\n• रकबा: ${acreVal} एकड़\n• बीज दर: ${seedKg} kg\n• किस्में: सरना, महामाया, स्वर्णा सब-1\n• खाद: ${dapBags} DAP + ${ureaBags} यूरिया + ${mopBags} MOP`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: ['धान में खाद का हिसाब', 'धान ₹3,100 उपार्जन', 'आज का मौसम'],
        deepLink: { tab: 'schemes', subTab: 0, label: 'खाद कैलकुलेटर देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'धान बुआई' },
      action: { type: 'AUTO_CALC_FERTILIZER', crop: 'paddy', acre: acreVal },
      needsClarification: false,
      extractedAcre: acreVal,
      confidence: 0.98,
    };
  }

  // ── 6. अन्य सभी फसलों हेतु (टमाटर, आलू, प्याज, केला, पपीता, आदि) ──
  // Tell Bhaira Kaka brain to route to Google Gemini AI Agricultural Expert for certified advisory
  return {
    needsAiExpert: true,
    detectedCrop,
    acreVal,
  };
};

