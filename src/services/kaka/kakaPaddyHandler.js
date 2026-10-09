// किसान साथी - बहिरा काका धान उपार्जन हैंडलर (Paddy Procurement & MSP Engine)
// Krushak Unnati Yojana: ₹3,100/quintal, 21 quintal/acre, Bardana Bags, Token Limits & Girdaavari Validation

import { calculatePaddyProcurement } from '../../utils/unitConverter.js';
import { extractQuintals } from './kakaEntityExtractors.js';
import { resetKakaSession, setKakaSession } from './kakaSessionManager.js';

/**
 * Handles Follow-up resolution for Paddy sale when user provides acre
 */
export const handlePaddySaleFollowup = (extractedAcre) => {
  resetKakaSession();
  const res = calculatePaddyProcurement(extractedAcre);
  const textHi = `${extractedAcre} एकड़ धान में कुल ${res.maxQuintals} क्विंटल खरीदी होगी भैया! ₹3,100 की दर से ₹${res.totalPayout.toLocaleString('en-IN')} सीधे बैंक खाते में आएंगे, और लगभग ${res.bardanaBags} बोरा बारदाना लगेगा।`;
  const textCg = `${extractedAcre} एकड़ धान म जम्मा ${res.maxQuintals} क्विंटल खरीदी होही संगी! ₹3,100 के भाव ले ₹${res.totalPayout.toLocaleString('en-IN')} तोर बैंक खाता म आही, अऊ ~${res.bardanaBags} बोरा बारदाना लगही!`;

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'PADDY_SALE',
      icon: '🌾',
      headline: `${extractedAcre} एकड़ धान उपार्जन हिसाब (₹3,100 दर)`,
      headlineCg: `${extractedAcre} एकड़ धान बेचे के हिसाब (₹3,100 भाव)`,
      queryEcho: `${extractedAcre} एकड़ धान`,
      cards: [
        { icon: '🌾', label: 'कुल धान कोटा', value: `${res.maxQuintals} क्विंटल`, sub: '21 क्विंटल/एकड़ मानक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '💰', label: 'कुल भुगतान', value: `₹${res.totalPayout.toLocaleString('en-IN')}`, sub: '₹3,100 समर्थन मूल्य', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        { icon: '📦', label: 'बारदाना बोरा', value: `${res.bardanaBags} बोरा`, sub: '35 बोरा/एकड़ आवश्यक', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        { icon: '🎫', label: 'टोकन सीमा', value: `${res.tokenLimit} टोकन`, sub: 'तुंहर हाथ ऐप से बुक करें', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
      ],
      advisoryText: 'धान को 17% नमी मानक पर सुखाकर लाएं। टोकन तुंहर हाथ मोबाइल ऐप से 7 दिन पूर्व टोकन बुक करें।',
      advisoryTextCg: 'धान ला 17% नमी तक सुखा के ले जाना हे। 7 दिन पहिले तुंहर हाथ ऐप ले टोकन कटा लेवव।',
      whatsappShareText: `🌾 किसान साथी - धान उपार्जन हिसाब:\n• रकबा: ${extractedAcre} एकड़\n• धान कोटा: ${res.maxQuintals} क्विंटल (@ ₹3,100)\n• कुल राशि: ₹${res.totalPayout.toLocaleString('en-IN')}\n• आवश्यक बारदाना: ${res.bardanaBags} बोरा\n🔒 100% सुरक्षित • छत्तीसगढ़ शासन कृषक उन्नति योजना`,
      needsClarification: false,
      missingSlot: null,
      slotSuggestions: [],
      deepLink: { tab: 'schemes', subTab: 1, label: 'पूरा धान कैलकुलेटर खोलें' },
    },
    route: { target: 'schemes', type: 'tab', label: 'धान ₹3,100' },
    action: { type: 'AUTO_CALC_PADDY', acre: extractedAcre },
    needsClarification: false,
    extractedAcre,
    confidence: 0.99,
  };
};

/**
 * Handles Paddy Sale Voice Queries (MSP ₹3,100, 21 Quintals, Bardana)
 */
export const handlePaddySaleIntent = (clean, transcript, extractedAcre) => {
  const paddySaleTriggers = ['3100', '३१००', 'समर्थन मूल्य', 'msp', 'धान खरीदी', 'कृषक उन्नति', 'धान बेचना', 'धान का भाव', 'धान के रेट', 'धान कोटा', 'बारदाना', 'पर्ची', 'dhan bechna', 'kharidi'];
  if (paddySaleTriggers.some((t) => clean.includes(t))) {
    // Edge Case: Farmer specifies quantity in quintals directly (e.g. "50 क्विंटल धान बेचना है")
    const extractedQuintals = extractQuintals(clean);
    if (extractedQuintals && !extractedAcre) {
      resetKakaSession();
      const calculatedAcre = Number((extractedQuintals / 21).toFixed(2));
      const totalPayout = Math.round(extractedQuintals * 3100);
      const bardanaBags = Math.ceil(extractedQuintals / 0.40);
      const tokenCount = Math.max(1, Math.ceil(extractedQuintals / 100));

      const textHi = `${extractedQuintals} क्विंटल धान का ₹3,100 समर्थन मूल्य से कुल भुगतान ₹${totalPayout.toLocaleString('en-IN')} होगा भैया! लगभग ${bardanaBags} बोरा बारदाना लगेगा और यह ~${calculatedAcre} एकड़ का कोटा है।`;
      const textCg = `${extractedQuintals} क्विंटल धान म ₹3,100 के भाव ले जम्मा ₹${totalPayout.toLocaleString('en-IN')} पईसा मिलही संगी! ~${bardanaBags} बोरा बारदाना लगही अऊ ये ~${calculatedAcre} एकड़ के कोटा हे!`;

      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'PADDY_SALE',
          icon: '🌾',
          headline: `${extractedQuintals} क्विंटल धान उपार्जन हिसाब (₹3,100 दर)`,
          headlineCg: `${extractedQuintals} क्विंटल धान बेचे के हिसाब (₹3,100 भाव)`,
          queryEcho: `${extractedQuintals} क्विंटल धान`,
          cards: [
            { icon: '💰', label: 'कुल भुगतान', value: `₹${totalPayout.toLocaleString('en-IN')}`, sub: '₹3,100 समर्थन मूल्य', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
            { icon: '📦', label: 'बारदाना बोरा', value: `${bardanaBags} बोरा`, sub: '40 kg मानक जूट/PP', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
            { icon: '🌾', label: 'अनुमानित रकबा', value: `~${calculatedAcre} एकड़`, sub: '21 क्विंटल/एकड़ मानक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
            { icon: '🎫', label: 'टोकन संख्या', value: `${tokenCount} टोकन`, sub: '100 क्विंटल प्रति स्लॉट', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          ],
          advisoryText: 'धान को 17% नमी मानक पर सुखाकर लाएं। टोकन तुंहर हाथ मोबाइल ऐप से 7 दिन पूर्व टोकन बुक करें।',
          advisoryTextCg: 'धान ला 17% नमी तक सुखा के ले जाना हे। 7 दिन पहिले तुंहर हाथ ऐप ले टोकन कटा लेवव।',
          whatsappShareText: `🌾 किसान साथी - धान उपार्जन हिसाब:\n• धान: ${extractedQuintals} क्विंटल (@ ₹3,100)\n• कुल राशि: ₹${totalPayout.toLocaleString('en-IN')}\n• बारदाना: ${bardanaBags} बोरा\n• रकबा: ~${calculatedAcre} एकड़\n🔒 छत्तीसगढ़ शासन कृषक उन्नति योजना`,
          needsClarification: false,
          missingSlot: null,
          slotSuggestions: [],
          deepLink: { tab: 'schemes', subTab: 1, label: 'पूरा धान कैलकुलेटर खोलें' },
        },
        route: { target: 'schemes', type: 'tab', label: 'धान ₹3,100' },
        action: { type: 'AUTO_CALC_PADDY', acre: calculatedAcre },
        needsClarification: false,
        extractedAcre: calculatedAcre,
        confidence: 0.98,
      };
    }

    if (extractedAcre) {
      resetKakaSession();
      const res = calculatePaddyProcurement(extractedAcre);
      const textHi = `${extractedAcre} एकड़ धान में कुल ${res.maxQuintals} क्विंटल खरीदी होगी भैया! ₹3,100 की दर से ₹${res.totalPayout.toLocaleString('en-IN')} सीधे बैंक खाते में आएंगे, और लगभग ${res.bardanaBags} बोरा बारदाना लगेगा।${extractedAcre > 100 ? ' 100 एकड़ से अधिक रकबे पर विशेष गिरदावरी सत्यापन आवश्यक है।' : ''}`;
      const textCg = `${extractedAcre} एकड़ धान म जम्मा ${res.maxQuintals} क्विंटल खरीदी होही संगी! ₹3,100 के भाव ले ₹${res.totalPayout.toLocaleString('en-IN')} तोर बैंक खाता म आही, अऊ ~${res.bardanaBags} बोरा बारदाना लगही!${extractedAcre > 100 ? ' 100 एकड़ ले बड़े रकबा म नोडल अधिकारी के सत्यापन लगही।' : ''}`;

      const cards = [
        { icon: '🌾', label: 'कुल धान कोटा', value: `${res.maxQuintals} क्विंटल`, sub: '21 क्विंटल/एकड़ मानक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '💰', label: 'कुल भुगतान', value: `₹${res.totalPayout.toLocaleString('en-IN')}`, sub: '₹3,100 समर्थन मूल्य', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        { icon: '📦', label: 'बारदाना बोरा', value: `${res.bardanaBags} बोरा`, sub: '35 बोरा/एकड़ आवश्यक', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        { icon: '🎫', label: 'टोकन सीमा', value: `${res.tokenLimit} टोकन`, sub: 'तुंहर हाथ ऐप से बुक करें', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
      ];

      if (extractedAcre > 100) {
        cards.push({ icon: '⚠️', label: 'बड़ा रकबा सतर्कता', value: 'विशेष गिरदावरी', sub: '100+ एकड़ पर नोडल अधिकारी अनुमोदन आवश्यक', bg: '#fefce8', border: '#fef08a', color: '#854d0e' });
      }

      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'PADDY_SALE',
          icon: '🌾',
          headline: `${extractedAcre} एकड़ धान उपार्जन हिसाब (₹3,100 दर)`,
          headlineCg: `${extractedAcre} एकड़ धान बेचे के हिसाब (₹3,100 भाव)`,
          queryEcho: transcript,
          cards,
          advisoryText: extractedAcre > 100
            ? '100 एकड़ से अधिक रकबे पर धान खरीदी पूर्व राजस्व विभाग द्वारा विशेष गिरदावरी सत्यापन व नोडल अधिकारी अनुमति आवश्यक होती है।'
            : 'धान को 17% नमी मानक पर सुखाकर लाएं। टोकन तुंहर हाथ मोबाइल ऐप से 7 दिन पूर्व टोकन बुक करें।',
          advisoryTextCg: extractedAcre > 100
            ? '100 एकड़ ले बड़े रकबा म सोसायटी खरीदी पूर्व नोडल अधिकारी सत्यापन करवा लेवव संगी।'
            : 'धान ला 17% नमी तक सुखा के ले जाना हे। 7 दिन पहिले तुंहर हाथ ऐप ले टोकन कटा लेवव।',
          whatsappShareText: `🌾 किसान साथी - धान उपार्जन हिसाब:\n• रकबा: ${extractedAcre} एकड़\n• धान कोटा: ${res.maxQuintals} क्विंटल (@ ₹3,100)\n• कुल राशि: ₹${res.totalPayout.toLocaleString('en-IN')}\n• आवश्यक बारदाना: ${res.bardanaBags} बोरा\n🔒 छत्तीसगढ़ शासन कृषक उन्नति योजना`,
          needsClarification: false,
          missingSlot: null,
          slotSuggestions: [],
          deepLink: { tab: 'schemes', subTab: 1, label: 'पूरा धान कैलकुलेटर खोलें' },
        },
        route: { target: 'schemes', type: 'tab', label: 'धान ₹3,100' },
        action: { type: 'AUTO_CALC_PADDY', acre: extractedAcre },
        needsClarification: false,
        extractedAcre,
        confidence: 0.98,
      };
    } else {
      setKakaSession('PADDY_SALE');
      const textHi = 'धान बेचने के लिए आपका खेत कितने एकड़ है भैया? अपना रकबा बताएं — 1 एकड़, 2 एकड़ या 3 एकड़?';
      const textCg = 'धान बेचे बर तोर खेत कतका एकड़ हे संगी? अपन रकबा बताव — 1 एकड़, 2 एकड़ या 3 एकड़?';

      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'PADDY_SALE',
          icon: '🌾',
          headline: 'धान बेचने का हिसाब (₹3,100 समर्थन मूल्य)',
          headlineCg: 'धान बेचे के हिसाब (₹3,100 भाव)',
          queryEcho: transcript,
          cards: [
            { icon: '💰', label: 'समर्थन मूल्य', value: '₹3,100 / क्विंटल', sub: 'कृषक उन्नति योजना', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
            { icon: '🌾', label: 'शासकीय कोटा', value: '21 क्विंटल / एकड़', sub: 'प्रति एकड़ अधिकतम सीमा', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          ],
          advisoryText: 'अपना रकबा (एकड़) नीचे चुनें या बोलकर बताएं ताकि कुल धान, रुपये और बारदाना का सटीक हिसाब निकल सके।',
          advisoryTextCg: 'अपन रकबा (एकड़) नीचे छूव या बोलके बताव ताकि जम्मा धान अऊ रुपया के हिसाब आ सके।',
          whatsappShareText: '',
          needsClarification: true,
          missingSlot: 'acre',
          slotSuggestions: ['1 एकड़', '2 एकड़', '2.5 एकड़', '3 एकड़', '5 एकड़'],
          deepLink: null,
        },
        route: { target: 'schemes', type: 'tab', label: 'धान ₹3,100' },
        action: { type: 'ASK_ACRES', crop: 'paddy' },
        needsClarification: true,
        extractedAcre: null,
        confidence: 0.96,
      };
    }
  }
  return null;
};

/**
 * Handles Direct Acreage Input without prior intent (e.g. farmer says "2.5 एकड़")
 */
export const handleDirectAcreage = (extractedAcre) => {
  resetKakaSession();
  const res = calculatePaddyProcurement(extractedAcre);
  const textHi = `खेत का रकबा ${extractedAcre} एकड़ सेट हो गया। धान उपार्जन में कुल ${res.maxQuintals} क्विंटल खरीदी और ₹${res.totalPayout.toLocaleString('en-IN')} का भुगतान होगा।`;
  const textCg = `तोर खेत के रकबा ${extractedAcre} एकड़ सेट होगे! धान म ${res.maxQuintals} क्विंटल खरीदी अउ ₹${res.totalPayout.toLocaleString('en-IN')} पईसा मिलही संगी!`;

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'PADDY_SALE',
      icon: '🌾',
      headline: `${extractedAcre} एकड़ रकबा: धान उपार्जन हिसाब`,
      headlineCg: `${extractedAcre} एकड़ रकबा: धान बेचे के हिसाब`,
      queryEcho: `${extractedAcre} एकड़`,
      cards: [
        { icon: '🌾', label: 'कुल धान कोटा', value: `${res.maxQuintals} क्विंटल`, sub: '21 क्विंटल/एकड़', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '💰', label: 'कुल भुगतान', value: `₹${res.totalPayout.toLocaleString('en-IN')}`, sub: '₹3,100 समर्थन मूल्य', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        { icon: '📦', label: 'बारदाना', value: `${res.bardanaBags} बोरा`, sub: '35 बोरा/एकड़', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        { icon: '🌿', label: 'DAP खाद', value: `${Math.max(1, Math.round(extractedAcre * 1.0))} बोरी`, sub: 'बुआई बेसल डोज', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
      ],
      advisoryText: `${extractedAcre} एकड़ खेत के अनुसार धान उपार्जन और खाद दोनों का हिसाब तैयार है।`,
      advisoryTextCg: `${extractedAcre} एकड़ खेत बर धान खरीदी अऊ खाद के पूरा हिसाब तैयार हे संगी!`,
      whatsappShareText: `🌾 किसान साथी - ${extractedAcre} एकड़ खेत हिसाब:\n• धान कोटा: ${res.maxQuintals} क्विंटल (@ ₹3,100)\n• कुल राशि: ₹${res.totalPayout.toLocaleString('en-IN')}\n• बारदाना: ${res.bardanaBags} बोरा\n• DAP: ${Math.max(1, Math.round(extractedAcre * 1.0))} बोरी`,
      needsClarification: false,
      missingSlot: null,
      slotSuggestions: [],
      deepLink: { tab: 'schemes', subTab: 1, label: 'पूरा कैलकुलेटर खोलें' },
    },
    route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
    action: { type: 'AUTO_CALC_FERTILIZER', acre: extractedAcre, crop: 'paddy' },
    needsClarification: false,
    extractedAcre,
    confidence: 0.95,
  };
};

