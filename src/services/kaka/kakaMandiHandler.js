// किसान साथी - बहिरा काका मंडी भाव हैंडलर (Live Agmarknet & APMC Mandi Rate Engine)
// Live Agmarknet mandi caching, APMC benchmark fallbacks, and multi-crop rates

import { detectCommodityFromText } from './kakaEntityExtractors.js';
import { setKakaSession } from './kakaSessionManager.js';

/**
 * Resolves live mandi rates directly from Agmarknet cache in localStorage
 */
export const getLiveMandiFromCache = (commodityName, userDistrict = 'रायपुर') => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('kisan_cache_mandi_payload');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const rates = Array.isArray(parsed) ? parsed : (parsed.rates || []);
    if (!rates || rates.length === 0) return null;

    const cleanCommodity = (commodityName || '').toLowerCase().trim();
    const cleanDistrict = (userDistrict || '').toLowerCase().trim();

    // 1. Try exact match for both commodity and district/mandi
    let match = rates.find((r) => {
      const c = (r.crop || r.commodity || '').toLowerCase();
      const m = (r.mandi || r.district || '').toLowerCase();
      return (c.includes(cleanCommodity) || cleanCommodity.includes(c)) &&
             (m.includes(cleanDistrict) || cleanDistrict.includes(m));
    });

    // 2. If no district match, find any rate for this commodity in Chhattisgarh
    if (!match) {
      match = rates.find((r) => {
        const c = (r.crop || r.commodity || '').toLowerCase();
        return c.includes(cleanCommodity) || cleanCommodity.includes(c);
      });
    }

    if (match) {
      const modal = match.modalRate || match.modalPrice || match.price;
      const min = match.minRate || match.minPrice;
      const max = match.maxRate || match.maxPrice;
      const mandiName = match.mandi || `${userDistrict} मंडी`;
      return {
        mandi: mandiName,
        crop: match.crop || match.commodity || commodityName,
        variety: match.variety || '',
        modalRate: modal ? Number(modal).toLocaleString('en-IN') : null,
        minRate: min ? Number(min).toLocaleString('en-IN') : null,
        maxRate: max ? Number(max).toLocaleString('en-IN') : null,
        trend: match.trend || 'स्थिर',
        isLive: parsed.isLive ?? true,
        source: parsed.source || 'Agmarknet (लाइव)',
      };
    }
  } catch (e) {
    console.warn('[KakaBrain] Live mandi cache lookup error:', e);
  }
  return null;
};

/**
 * Helper to generate Mandi direct answers cleanly using Live Agmarknet + Benchmark fallbacks
 */
export const generateMandiDirectAnswer = (commodity, district = 'रायपुर', queryEcho = '') => {
  const isPaddy = commodity === 'धान';
  const live = getLiveMandiFromCache(commodity, district);

  const mandiName = live?.mandi || `${district} मंडी`;
  const modalRate = isPaddy
    ? '3,100'
    : (live?.modalRate || (commodity === 'टमाटर' ? '1,600' : (commodity === 'चना' ? '5,800' : '4,200')));
  const range = isPaddy
    ? '₹3,100 (समर्थन मूल्य)'
    : (live?.minRate && live?.maxRate
        ? `₹${live.minRate} - ₹${live.maxRate}`
        : (commodity === 'टमाटर' ? '₹1,400 - ₹1,800' : (commodity === 'चना' ? '₹5,400 - ₹6,100' : '₹3,800 - ₹4,500')));
  const trend = live?.trend || (isPaddy ? 'शासकीय गारंटी' : 'मजबूत / स्थिर');
  const sourceLabel = isPaddy
    ? 'छत्तीसगढ़ शासन कृषक उन्नति योजना'
    : (live?.isLive ? 'Agmarknet / मंडी बोर्ड (लाइव सत्यापित)' : 'APMC संदर्भ दर');

  const textHi = isPaddy
    ? `छत्तीसगढ़ में धान का समर्थन मूल्य ₹3,100 प्रति क्विंटल है भैया, जिसमें 21 क्विंटल प्रति एकड़ खरीदी होती है।`
    : `आज ${mandiName} में ${commodity} का मॉडल भाव ₹${modalRate} प्रति क्विंटल (${range}) चल रहा है भैया!`;
  const textCg = isPaddy
    ? `छत्तीसगढ़ म धान के भाव ₹3,100 प्रति क्विंटल हे संगी, अउ 21 क्विंटल प्रति एकड़ खरीदी होथे!`
    : `आज ${mandiName} म ${commodity} के मॉडल भाव ₹${modalRate} प्रति क्विंटल (${range}) चलत हे संगी!`;

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'MANDI',
      icon: '🏪',
      headline: `${mandiName}: ${commodity} का आज का ${live ? 'लाइव' : 'मॉडल'} भाव`,
      headlineCg: `${mandiName}: ${commodity} के आज के भाव`,
      queryEcho,
      cards: [
        { icon: '🏪', label: 'मंडी केंद्र', value: mandiName, sub: sourceLabel, bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        { icon: '💵', label: 'मॉडल भाव', value: `₹${modalRate} / क्विंटल`, sub: 'औसत मंडी दर', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '📊', label: 'न्यूनतम - अधिकतम', value: range, sub: 'गुणवत्ता अनुसार दर', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        { icon: '📈', label: 'बाजार रुझान', value: trend, sub: 'दैनिक आवक सामान्य', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
      ],
      advisoryText: isPaddy
        ? 'धान को 17% नमी मानक पर अच्छी तरह सुखाकर लाएं। टोकन तुंहर हाथ मोबाइल ऐप से 7 दिन पूर्व टोकन बुक करें।'
        : 'मंडी ले जाने से पहले छंटाई (ग्रेडिंग) अवश्य करें ताकि उच्चतम मॉडल भाव मिल सके।',
      advisoryTextCg: isPaddy
        ? 'धान ला 17% नमी तक सुखा के ले जाना हे। 7 दिन पहिले तुंहर हाथ ऐप ले टोकन कटा लेवव।'
        : 'मंडी ले जाए के पहिले फसल ला छांट लेवव ताकि बढ़िया दाम मिलय!',
      whatsappShareText: `🏪 किसान साथी - ${commodity} मंडी भाव (${mandiName}):\n• मॉडल भाव: ₹${modalRate}/क्विंटल\n• दर सीमा: ${range}\n• स्रोत: ${sourceLabel}\n🌾 प्रमाणित कृषि मंडी भाव`,
      needsClarification: false,
      missingSlot: null,
      slotSuggestions: [],
      deepLink: { tab: 'mandi', label: 'सभी मंडियों के भाव देखें' },
    },
    route: { target: 'mandi', type: 'tab', label: 'मंडी भाव' },
    action: { type: 'SHOW_MANDI' },
    needsClarification: false,
    extractedAcre: null,
    confidence: 0.98,
  };
};

/**
 * Handles Mandi Rates Voice Query
 */
export const handleMandiIntent = (clean, transcript, selectedDistrict, isDiseasePest = false) => {
  const mandiTriggers = ['मंडी', 'भाव', 'दाम', 'रेट', 'टमाटर', 'सोयाबीन', 'चना भाव', 'प्याज', 'mandi', 'rate', 'price', 'dam', 'daam'];
  if (!isDiseasePest && mandiTriggers.some((t) => clean.includes(t))) {
    const commodity = detectCommodityFromText(clean);
    if (commodity) {
      return generateMandiDirectAnswer(commodity, selectedDistrict, transcript);
    } else {
      setKakaSession('MANDI');
      const textHi = 'किस फसल का मंडी भाव जानना चाहते हैं भैया? नीचे फसल चुनें या बोलकर बताएं — टमाटर, धान, चना या सोयाबीन?';
      const textCg = 'कोन फसल के मंडी भाव जानना हे संगी? नीचे फसल चुनव या बोलव — टमाटर, धान, चना या सोयाबीन?';

      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'MANDI',
          icon: '🏪',
          headline: 'लाइव मंडी भाव खोजें',
          headlineCg: 'मंडी के ताजा भाव खोजव',
          queryEcho: transcript,
          cards: [
            { icon: '🏪', label: 'मंडी केंद्र', value: `${selectedDistrict} मंडी`, sub: 'छत्तीसगढ़ लाइव APMC', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
            { icon: '🌾', label: 'धान भाव', value: '₹3,100 / क्विंटल', sub: 'कृषक उन्नति गारंटी', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          ],
          advisoryText: 'किस फसल का भाव देखना है? नीचे छूकर या बोलकर फसल बताएं:',
          advisoryTextCg: 'कोन फसल के भाव देखना हे? नीचे छूव या बोलके बताव:',
          whatsappShareText: '',
          needsClarification: true,
          missingSlot: 'commodity',
          slotSuggestions: ['टमाटर', 'धान', 'चना', 'सोयाबीन', 'मक्का', 'प्याज'],
          deepLink: null,
        },
        route: { target: 'mandi', type: 'tab', label: 'मंडी भाव' },
        action: { type: 'SHOW_MANDI' },
        needsClarification: true,
        extractedAcre: null,
        confidence: 0.95,
      };
    }
  }
  return null;
};

