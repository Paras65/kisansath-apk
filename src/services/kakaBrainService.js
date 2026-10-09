// किसान साथी - बहिरा काका AI कृषि दिमाग (Bhaira Kaka Vernacular Conversational Engine)
// Authentic Chhattisgarhi & Hindi Rural Dialogues with IGKV Raipur recommendations
// Handles 40+ Agricultural Intents, Dialect Edge-cases, Rustic Number Extraction & Persona responses

import { appConfig } from '../config/appConfig';
import { calculatePaddyProcurement } from '../utils/unitConverter';

/**
 * Extracts numeric quintals from colloquial speech (e.g. "50 क्विंटल", "100 quintal", "25 बोरा धान")
 */
export const extractQuintals = (text) => {
  if (!text) return null;
  const clean = text.toLowerCase().trim();
  const qMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:क्विंटल|क्विन्टल|quintal|kintal)/);
  if (qMatch) {
    const val = parseFloat(qMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }
  return null;
};

/**
 * Extracts numeric acreage from colloquial Hindi/Chhattisgarhi speech
 * Handles:
 * - Composite: "2 एकड़ 50 डिसमिल", "1 एकड़ 25 dismil"
 * - Fractions: "ढाई", "डेढ़", "सवा दो", "पौने तीन", "साढ़े तीन", "आधा एकड़"
 * - Units: "25 डिसमिल", "50 dismil" (100 dismil = 1 acre)
 */
export const extractAcreage = (text) => {
  if (!text) return null;
  const clean = text.toLowerCase().trim();

  // 1. Composite Acre + Dismil (e.g. "2 एकड़ 50 डिसमिल", "1 एकड़ 25 dismil")
  const compositeMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:एकड़|एकड|acre|एकर)\s*(?:और|अउ|अऊ)?\s*(\d+(?:\.\d+)?)\s*(?:डिसमिल|dismil|दिसमिल)/);
  if (compositeMatch) {
    const acrePart = parseFloat(compositeMatch[1]) || 0;
    const dismilPart = parseFloat(compositeMatch[2]) || 0;
    if (acrePart > 0 || dismilPart > 0) {
      return Number((acrePart + (dismilPart / 100)).toFixed(2));
    }
  }

  // 2. Pure dismil (1 acre = 100 dismil, e.g. "50 डिसमिल")
  const dismilMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:डिसमिल|dismil|दिसमिल)/);
  if (dismilMatch) {
    const val = parseFloat(dismilMatch[1]);
    if (!isNaN(val) && val > 0) return Number((val / 100).toFixed(2));
  }

  // 3. Fractional vernacular colloquial terms
  if (clean.includes('ढाई') || clean.includes('dhai')) return 2.5;
  if (clean.includes('डेढ़') || clean.includes('dedh')) return 1.5;
  if (clean.includes('सवा दो')) return 2.25;
  if (clean.includes('पौने दो')) return 1.75;
  if (clean.includes('पौने तीन')) return 2.75;
  if (clean.includes('सवा तीन')) return 3.25;
  if (clean.includes('साढ़े तीन')) return 3.5;
  if (clean.includes('साढ़े चार')) return 4.5;
  if (clean.includes('साढ़े पांच')) return 5.5;
  if (clean.includes('आधा') || clean.includes('aadha')) return 0.5;
  if (clean.includes('एक चौथाई') || clean.includes('पाव')) return 0.25;

  // 4. Spoken Devanagari numbers
  const wordNumbers = {
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
    'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'ग्यारह': 11, 'बारह': 12, 'पंद्रह': 15, 'बीस': 20,
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'panch': 5
  };

  for (const [word, num] of Object.entries(wordNumbers)) {
    const pattern = new RegExp(`(?:^|\\s)${word}(?:\\s*(?:एकड़|एकड|acre|एकड़ा))?(?:\\s|$)`);
    if (pattern.test(clean)) return num;
  }

  // 5. Standard numerical digits
  const digitMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:एकड़|एकड|acre|एकर)?/);
  if (digitMatch) {
    const val = parseFloat(digitMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
};

/**
 * Knowledge Base of Instant Conversational Agricultural Q&A
 * Carefully calibrated for IGKV Raipur, Chhattisgarh soil, paddy, and weather realities.
 */
const KAKA_KNOWLEDGE_BASE = [
  // ── 1. माहू / BPH (Brown Plant Hopper) ──
  {
    triggers: ['माहू', 'माहुर', 'bph', 'चेपा', 'भूरा माहू', 'हरा माहू', 'रस चूसक', 'mahu', 'mahur', 'chepa', 'keeda', 'keera'],
    route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
    spokenCg: 'अरे भइया! धान म माहू लग गे हे त खेत के पानी ला तुरते निकालव! पाइमेट्रोजिन या इमिडाक्लोप्रिड के स्प्रे सीधे तना तीर करव। चल डॉक्टर खोलथंव!',
    spokenHi: 'सावधान किसान भाई! धान में माहू का प्रकोप है तो खेत का पानी तुरंत निकालें। तने के पास पाइमेट्रोजिन या इमिडाक्लोप्रिड का छिड़काव करें। फसल डॉक्टर खोल रहे हैं।',
  },

  // ── 2. झुलसा व पत्ती पीलापन (Blast / Sheath Blight / Khaira) ──
  {
    triggers: ['पीला', 'पियरिया', 'पीलापन', 'झुलसा', 'ब्लास्ट', 'केंचुली', 'शीथ ब्लाइट', 'खैरा', 'पाना पीयर', 'peela', 'peeli', 'jhulsa', 'blast', 'khaira'],
    route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
    spokenCg: 'का कहिथस, पाना पीयर परत हे? यदि नीचे ले सूखत हे त खैरा रोग हो सकथे—जिंक सल्फेट छिड़कव। अउ झुलसा हे त ट्राइसाइक्लाजोल डारव। चल दवाई देखाथंव!',
    spokenHi: 'पत्तियां पीली पड़ रही हैं तो जिंक की कमी से खैरा या फफूंद का झुलसा हो सकता है। ट्राइसाइक्लाजोल या हेक्साकोनाजोल की सलाह देखें। फसल डॉक्टर खोल रहे हैं।',
  },

  // ── 3. तना छेदक व इल्ली (Stem Borer / Leaf Folder) ──
  {
    triggers: ['तना छेदक', 'गाभा छेदक', 'इल्ली', 'सुंडी', 'कीड़ा', 'कीरा', 'पत्ता लपेटक', 'tana chhedak', 'illi', 'sundi', 'kida'],
    route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
    spokenCg: 'गाभा छेदक कीरा तना ला भीतर ले काट देथे! कारटाप हाइड्रोक्लोराइड दानेदार या कोराजन के छिड़काव करव। चल दवाई के नाम देखाथंव!',
    spokenHi: 'तना छेदक और इल्ली के नियंत्रण हेतु कारटाप हाइड्रोक्लोराइड 4G या कोराजन का छिड़काव अनुशंसित है। पूरी जानकारी फसल डॉक्टर में देखें।',
  },

  // ── 4. धान ₹3,100 भाव एवं कृषक उन्नति योजना ──
  {
    triggers: ['3100', '३१००', 'समर्थन मूल्य', 'msp', 'धान खरीदी', 'कृषक उन्नति', 'रेट', 'धान का भाव', 'धान के रेट', 'भाव', 'dhan', 'bhav', 'bhaav', 'rate', 'price', 'dam', 'daam', 'mandi', 'paisa'],
    route: { target: 'mandi', type: 'tab', label: 'मंडी भाव' },
    spokenCg: 'हव बेटा! छत्तीसगढ़ म धान के भाव ₹3,100 प्रति क्विंटल हे, प्रति एकड़ 21 क्विंटल खरीदी होथे। चल तोर काका पूरा मंडी भाव देखावत हे!',
    spokenHi: 'छत्तीसगढ़ में कृषक उन्नति योजना अंतर्गत धान ₹3,100 प्रति क्विंटल की दर से 21 क्विंटल प्रति एकड़ खरीदा जाता है। मंडी भाव खोल रहे हैं।',
  },

  // ── 5. टोकन तुंहर हाथ (धान बेचने का टोकन) ──
  {
    triggers: ['टोकन', 'तुंहर हाथ', 'टोकन कब', 'टोकन कैसे', 'सोसायटी टोकन', 'धान बेचना', 'token', 'tuhar hath', 'parchi', 'slot'],
    route: { target: 'token', type: 'modal', label: 'टोकन तुंहर हाथ' },
    spokenCg: 'टोकन तुंहर हाथ ले धान बेचे के टोकन 7 दिन पहिले बुक करे सकथव। धान ला 17% नमी तक सुखा के ले जाना हे। चल टोकन गाइड देखाथंव!',
    spokenHi: 'टोकन तुंहर हाथ ऐप से धान खरीदी केंद्र का स्लॉट बुक करें। धान को 17 प्रतिशत नमी मानक पर सुखाकर लाएं। टोकन गाइड खोल रहे हैं।',
  },

  // ── 6. खाद की मात्रा व यूरिया (NPK Doses) ──
  {
    triggers: ['खाद', 'यूरिया', 'dap', 'पोटाश', 'कितना खाद', 'खाद कैलकुलेटर', 'खाद कते डारना', 'khad', 'khaad', 'urea', 'yuriya', 'potash'],
    route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
    spokenCg: 'धान म बुआई बेरा DAP अउ पोटाश डालना हे, अउ यूरिया ला 2 बार म छिड़कना हे। कते एकड़ खेत हे? चल कैलकुलेटर म बोरी गिनथंव!',
    spokenHi: 'बुआई के समय बेसल डोज में DAP व पोटाश दें, और यूरिया को दो किस्तों में कल्ले फूटते समय डालें। सही बोरी की गणना हेतु खाद कैलकुलेटर खोल रहे हैं।',
  },

  // ── 7. मौसम व बारिश (Weather & Rain) ──
  {
    triggers: ['मौसम', 'बारिश', 'पानी गिरही', 'पानी गिरेगा', 'हवा', 'धूप', 'घाम', 'बादल', 'मावठा', 'mausam', 'mosam', 'barish', 'baarish', 'rain', 'weather', 'pani'],
    route: { target: 'home', type: 'tab', label: 'मौसम डैशबोर्ड' },
    spokenCg: 'आज के मौसम देखव! अगर पानी गिरे के संका हे त यूरिया अउ कीटनाशक के छिड़काव रोक देवव ताकि दवाई बोहा झन जाय। चल मौसम देखाथंव!',
    spokenHi: 'लाइव मौसम के अनुसार यदि बारिश या 15 किमी से तेज हवा है तो छिड़काव टालें। आपका लाइव मौसम डैशबोर्ड खोल रहे हैं।',
  },

  // ── 8. रबी चना, गेहूं व सरसों तैयारी ──
  {
    triggers: ['चना', 'गेहूं', 'सरसों', 'रबी', 'उतेरा', 'पैरा', 'पराली', 'chana', 'gehu', 'sarson', 'rabi'],
    route: { target: 'schemes', type: 'tab', label: 'रबी योजना' },
    spokenCg: 'धान कटाई बाद पैरा झन जलाव—रोटावेटर ले माटी म मिलाव! रबी चना JG-11 या राधे लगावत हव त ट्राइकोडर्मा ले बीजोपचार जरूर करव।',
    spokenHi: 'धान कटाई के बाद पराली खेत में न जलाएं। रबी दलहन चना JG-11 व सरसों की बुआई पूर्व ट्राइकोडर्मा व राइजोबियम से बीजोपचार अवश्य करें।',
  },

  // ── 9. आत्मीय देहाती अभिवादन व काका का परिचय (Persona & Greetings) ──
  {
    triggers: ['काका', 'बहिरा काका', 'जय जोहार', 'नमस्ते', 'प्रणाम', 'राम राम', 'कइसे हस', 'कैसे हो', 'kaka', 'bhaira', 'johar', 'jay johar', 'ram ram', 'namaste', 'hello', 'hi', 'kaise ho'],
    route: null,
    spokenCg: 'जय जोहार संगी! मैं तोर बहिरा काका हंव। कान म थोड़ा कम सुनाई देथे बाक़ी किसानी के सब बात जानथंव! बोल, खेत म का समस्या हे?',
    spokenHi: 'जय जोहार किसान भाई! मैं आपका बहिरा काका हूँ। थोड़ा ज़ोर से बोलिए—धान का भाव जानना है, खाद का हिसाब, या खेत में कोई बीमारी लगी है?',
  },

  // ── 10. मोटर कंट्रोलर (बोरवेल) ──
  {
    triggers: ['मोटर', 'बोरवेल', 'पंप', 'ट्यूबवेल', 'पानी चलाना', 'starter', 'motor', 'motar', 'pump', 'borwell', 'borewell'],
    route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
    spokenCg: 'घर बैठे ट्यूबवेल मोटर चालू या बंद करना हे? चल तोर काका GSM मोटर कंट्रोलर खोलत हे!',
    spokenHi: 'खेत का ट्यूबवेल व बोरवेल स्टार्टर नियंत्रित करने हेतु मोटर कंट्रोलर खोल रहे हैं।',
  },

  // ── 11. मेरा खेत व फसल डायरी ──
  {
    triggers: ['मेरा खेत', 'अपन खेत', 'डायरी', 'खर्चा', 'हिसाब', 'आमदनी', 'plot', 'khet', 'diary'],
    route: { target: 'khet', type: 'modal', label: 'मेरा खेत' },
    spokenCg: 'अपन खेत के बुआई तारीख, खाद के खर्च अउ आमदनी के हिसाब रखना हे? चल मेरा खेत डायरी खोलथंव!',
    spokenHi: 'फसल की बुआई तारीख, खाद का खर्च और लाभ-हानि का हिसाब रखने हेतु मेरा खेत डायरी खोल रहे हैं।',
  },
];

// Multi-Turn Conversational Session Context (45s TTL)
let kakaSession = {
  activeIntent: null, // 'PADDY_SALE' | 'FERTILIZER' | 'MANDI' | 'WEATHER' | 'DOCTOR' | 'ASK_MOTOR'
  pendingIntent: null, // backward compatibility
  collectedSlots: {}, // { acre, crop, district, commodity, symptoms }
  timestamp: 0,
};

export const resetKakaSession = () => {
  kakaSession = { activeIntent: null, pendingIntent: null, collectedSlots: {}, timestamp: 0 };
};

export const setKakaSession = (intent, slots = {}) => {
  kakaSession = {
    activeIntent: intent,
    pendingIntent: intent,
    collectedSlots: { ...slots },
    timestamp: Date.now(),
  };
};

export const getKakaSession = () => {
  if (Date.now() - (kakaSession.timestamp || 0) > 45000) {
    kakaSession = { activeIntent: null, pendingIntent: null, collectedSlots: {}, timestamp: 0 };
  }
  return kakaSession;
};

const detectCropFromText = (text) => {
  if (!text) return 'paddy';
  const c = text.toLowerCase();
  if (c.includes('चना') || c.includes('chana') || c.includes('chane')) return 'chana';
  if (c.includes('गेहूं') || c.includes('गेंहू') || c.includes('gehu') || c.includes('wheat')) return 'wheat';
  if (c.includes('टमाटर') || c.includes('tamatar') || c.includes('tomato')) return 'tomato';
  if (c.includes('सरसों') || c.includes('sarson') || c.includes('mustard') || c.includes('राई')) return 'sarson';
  if (c.includes('सोयाबीन') || c.includes('soyabean')) return 'soyabean';
  if (c.includes('मक्का') || c.includes('जौनरा') || c.includes('maize') || c.includes('makka') || c.includes('भुट्टा')) return 'maize';
  return 'paddy';
};

const detectCommodityFromText = (text) => {
  if (!text) return null;
  const c = text.toLowerCase();
  if (c.includes('टमाटर') || c.includes('tamatar')) return 'टमाटर';
  if (c.includes('धान') || c.includes('dhan') || c.includes('चावल')) return 'धान';
  if (c.includes('चना') || c.includes('chana')) return 'चना';
  if (c.includes('सोयाबीन') || c.includes('soyabean')) return 'सोयाबीन';
  if (c.includes('प्याज') || c.includes('pyaj') || c.includes('gondli')) return 'प्याज';
  if (c.includes('आलू') || c.includes('aalu') || c.includes('potato')) return 'आलू';
  if (c.includes('मक्का') || c.includes('makka')) return 'मक्का';
  if (c.includes('गेहूं') || c.includes('gehu')) return 'गेहूं';
  if (c.includes('मिर्च') || c.includes('mirch') || c.includes('chilli')) return 'मिर्च';
  if (c.includes('बैंगन') || c.includes('baingan') || c.includes('bhata')) return 'बैंगन';
  if (c.includes('सरसों') || c.includes('sarson') || c.includes('mustard')) return 'सरसों';
  if (c.includes('लहसुन') || c.includes('lahsun') || c.includes('garlic')) return 'लहसुन';
  if (c.includes('अरहर') || c.includes('tur') || c.includes('arhar') || c.includes('तुअर')) return 'अरहर';
  if (c.includes('तीवड़ा') || c.includes('lakhadi') || c.includes('लाखड़ी')) return 'तीवड़ा';
  return null;
};

/**
 * Process any spoken query through Bhaira Kaka's AI Conversational Agent
 * Returns structured directAnswer for zero-navigation popup + backward-compatible routes
 */
export const queryKakaBrain = (transcript, isChhattisgarhi = false, context = {}) => {
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 2) {
    return {
      textHi: 'कुछ सुनाई नहीं दिया। शांत जगह पर थोड़ा ज़ोर से बोलें।',
      textCg: 'अरे भइया, कछु सुनाई नई परिस! थोड़ा जोर ले बोलव, तोर काका कान लगाके बइठे हे!',
      directAnswer: null,
      route: null,
      action: null,
      needsClarification: false,
      extractedAcre: null,
      confidence: 0,
    };
  }

  const clean = transcript.toLowerCase().trim();
  const session = getKakaSession();
  const selectedDistrict = context?.district || appConfig?.geography?.defaultDistrict || 'रायपुर';
  const extractedAcre = extractAcreage(clean);
  // Edge Case: 0 एकड़ or negative input
  if (clean.includes('0 एकड़') || clean.includes('शून्य एकड़') || clean.includes('0 acre') || clean.includes('शून्य एकड')) {
    const textHi = 'रकबा शून्य (0) एकड़ नहीं हो सकता भैया! कृपया सही रकबा बताएं, जैसे 1 एकड़, 2 एकड़ या 50 डिसमिल।';
    const textCg = 'रकबा शून्य (0) एकड़ नइ हो सके संगी! अपन सही रकबा बताव, जइसे 1 एकड़, 2 एकड़ या 50 डिसमिल!';
    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FALLBACK',
        icon: '⚠️',
        headline: 'रकबा 0 एकड़ नहीं हो सकता',
        headlineCg: 'रकबा 0 एकड़ नइ हो सके',
        queryEcho: transcript,
        cards: [
          { icon: '🌾', label: 'न्यूनतम रकबा', value: '1 एकड़ / 25 डिसमिल', sub: 'मानक कृषि रकबा', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
        ],
        advisoryText: 'कृपया नीचे दिए गए विकल्पों में से अपना रकबा चुनें या बोलकर बताएं:',
        advisoryTextCg: 'नीचे कोनो भी रकबा ला छूव या बोलके बताव:',
        whatsappShareText: '',
        needsClarification: true,
        missingSlot: 'acre',
        slotSuggestions: ['1 एकड़', '2 एकड़', '2.5 एकड़', '3 एकड़', '5 एकड़'],
        deepLink: null,
      },
      route: null,
      action: null,
      needsClarification: true,
      extractedAcre: null,
      confidence: 0.9,
    };
  }

  // ── 0. Multi-Turn Conversational Slot-Filling Resolver ──
  const activeIntent = session.activeIntent || session.pendingIntent;

  // 0A. Motor Confirmation Resolution ("हव" / "नहीं")
  if (activeIntent === 'ASK_MOTOR') {
    const affirmativeWords = ['हव', 'हाँ', 'हां', 'करव', 'कर दो', 'भेजव', 'भेज दो', 'चालू करव', 'चालू', 'yes', 'ok', 'चलाओ', 'हओ', 'हऊ', 'भेज'];
    const negativeWords = ['नहीं', 'झन', 'मत', 'रद्द', 'ना', 'no', 'cancel', 'रहने दो', 'झन भेजव', 'झन करव', 'मत करो'];

    if (affirmativeWords.some((w) => clean.includes(w))) {
      resetKakaSession();
      const textHi = 'जी भैया, बोरवेल मोटर चालू करने का SMS आदेश भेज दिया है। खेत का पंप चालू हो रहा है!';
      const textCg = 'हव संगी! बोरवेल मोटर चालू करे के SMS आदेश भेज दे हंव। तोर बोरवेल चालू होवत हे!';
      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'MOTOR',
          icon: '⚡',
          headline: 'बोरवेल मोटर चालू आदेश प्रेषित',
          headlineCg: 'बोरवेल मोटर चालू करे के आदेश भेज दे हन',
          queryEcho: transcript,
          cards: [
            { icon: '⚡', label: 'मोटर स्थिति', value: 'चालू (ON)', sub: 'SMS आदेश भेजा गया', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
            { icon: '📱', label: 'कंट्रोलर', value: 'GSM स्टार्टर', sub: 'स्वचालित रिले सक्रिय', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
            { icon: '🔒', label: 'सुरक्षा इंटरलॉक', value: 'ड्राई-रन सेफ', sub: 'पानी न होने पर स्वतः बंद', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          ],
          advisoryText: 'मोटर चालू करने का संदेश खेत के स्टार्टर तक पहुँच गया है। किसी भी खराबी पर ऐप अलर्ट करेगा।',
          advisoryTextCg: 'खेत के स्टार्टर म SMS पहुंच गे हे। मोटर पानी फेंकत हे, कोनो चिंता झन करव!',
          whatsappShareText: `⚡ किसान साथी मोटर सूचना:\nबोरवेल मोटर चालू कर दी गई है।\nसमय: ${new Date().toLocaleTimeString('hi-IN')}`,
          needsClarification: false,
          missingSlot: null,
          slotSuggestions: [],
          deepLink: { tab: 'home', modal: 'motor', label: 'मोटर कंट्रोलर देखें' },
        },
        route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
        action: { type: 'EXECUTE_MOTOR', command: 'START' },
        needsClarification: false,
        extractedAcre: null,
        confidence: 0.99,
      };
    }

    if (negativeWords.some((w) => clean.includes(w))) {
      resetKakaSession();
      const textHi = 'ठीक है भैया, मोटर चालू करने का आदेश रद्द कर दिया गया है।';
      const textCg = 'ठीक हे संगी, मोटर चालू नइ करेन। कोनो चिंता झन करव!';
      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'MOTOR',
          icon: '🛑',
          headline: 'मोटर आदेश निरस्त',
          headlineCg: 'मोटर आदेश रद्द कर दे हन',
          queryEcho: transcript,
          cards: [
            { icon: '🛑', label: 'मोटर स्थिति', value: 'सुरक्षित बंद (OFF)', sub: 'आदेश रद्द किया गया', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          ],
          advisoryText: 'मोटर चालू नहीं की गई है। जब भी आवश्यकता हो पुनः बोलकर चालू कर सकते हैं।',
          advisoryTextCg: 'मोटर बंद हे। जब मन लगही, फेर बोलव!',
          whatsappShareText: '',
          needsClarification: false,
          missingSlot: null,
          slotSuggestions: [],
          deepLink: null,
        },
        route: null,
        action: { type: 'CANCEL_MOTOR' },
        needsClarification: false,
        extractedAcre: null,
        confidence: 0.99,
      };
    }
  }

  // 0B. Paddy Sale Acreage Resolution from Follow-up ("3 एकड़", "ढाई एकड़")
  if (activeIntent === 'PADDY_SALE' && extractedAcre) {
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
  }

  // 0C. Fertilizer Acreage Resolution from Follow-up ("2 एकड़", "चना", "गेहूं", "मक्का", "सरसों", etc.)
  if ((activeIntent === 'FERTILIZER' || activeIntent === 'ASK_ACRES') && (extractedAcre || clean.includes('चना') || clean.includes('धान') || clean.includes('गेहूं') || clean.includes('मक्का') || clean.includes('सरसों'))) {
    const crop = detectCropFromText(clean) || session.collectedSlots?.crop || 'paddy';
    const acreVal = extractedAcre || session.collectedSlots?.acre || 1.0;
    resetKakaSession();
    return generateFertilizerDirectAnswer(crop, acreVal, context?.weather || {}, transcript);
  }

  // 0D. Mandi Commodity Follow-up ("टमाटर", "चना", "सोयाबीन")
  if (activeIntent === 'MANDI') {
    const detectedCommodity = detectCommodityFromText(clean) || 'टमाटर';
    resetKakaSession();
    return generateMandiDirectAnswer(detectedCommodity, selectedDistrict, transcript);
  }

  // ── 1. धान ₹3,100 उपार्जन व बारदाना Intent (Paddy Sale) ──
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

  // ── 2A. नैनो यूरिया व नैनो डीएपी Intent (Nano Fertilizer) ──
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

  // ── 2B. खाद एवं उर्वरक Intent (Fertilizer Dosage) ──
  const fertTriggers = ['खाद', 'यूरिया', 'dap', 'पोटाश', 'जिंक', 'सल्फर', 'कितना खाद', 'खाद कैलकुलेटर', 'खाद कते डारना', 'डारव', 'डारना', 'khad', 'khaad', 'urea', 'yuriya', 'potash'];
  if (fertTriggers.some((t) => clean.includes(t))) {
    const crop = detectCropFromText(clean);
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

  // ── 3. लाइव मंडी भाव Intent (Mandi Rates) ──
  const mandiTriggers = ['मंडी', 'भाव', 'दाम', 'रेट', 'टमाटर', 'सोयाबीन', 'चना भाव', 'प्याज', 'mandi', 'rate', 'price', 'dam', 'daam'];
  if (mandiTriggers.some((t) => clean.includes(t))) {
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

  // ── 4. लाइव मौसम व स्प्रे एडवाइजरी Intent (Weather) ──
  const weatherTriggers = ['मौसम', 'बारिश', 'पानी गिरही', 'पानी गिरेगा', 'हवा', 'धूप', 'घाम', 'बादल', 'मावठा', 'mausam', 'mosam', 'barish', 'baarish', 'rain', 'weather', 'pani'];
  if (weatherTriggers.some((t) => clean.includes(t))) {
    const weather = context?.weather || {};
    const temp = weather.temp ?? 29;
    const condText = weather.conditionText || 'साफ मौसम';
    const wind = weather.windSpeed ?? 11;
    const rainChance = weather.rainChance ?? 15;
    const canSpray = wind <= 15 && rainChance <= 40;
    const sprayStatus = canSpray ? '✓ छिड़काव अनुकूल' : '⚠️ छिड़काव रोकें';

    const textHi = `आज ${selectedDistrict} में तापमान ${temp}°C और मौसम ${condText} है भैया! ${canSpray ? 'आज कीटनाशक व खाद का छिड़काव सुरक्षित है।' : 'बारिश या तेज हवा के कारण छिड़काव टालें!'}`;
    const textCg = `आज ${selectedDistrict} म तापमान ${temp}°C अउ मौसम ${condText} हे संगी! ${canSpray ? 'आज स्प्रे करे बर मौसम बने हे।' : 'पानी या तेज हवा म छिड़काव रोक देवव ताकि दवाई बोहा झन जाय!'}`;

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
        advisoryText: canSpray ? 'आज मौसम सामान्य है। सुबह या शाम के समय कीटनाशक व खाद का छिड़काव उत्तम रहेगा।' : 'सावधान: बारिश या 15 किमी से तेज हवा में छिड़काव करने से दवा धुल जाती है और उड़ जाती है।',
        advisoryTextCg: canSpray ? 'आज मौसम बने हे, बिहनिया या संझा बेरा स्प्रे कर सकथव।' : 'चेत रखव: पानी या तेज हवा म स्प्रे झन करव, दवाई बोहा जाही!',
        whatsappShareText: `🌤️ किसान साथी मौसम बुलेटिन (${selectedDistrict}):\n• तापमान: ${temp}°C (${condText})\n• बारिश संभावना: ${rainChance}%\n• हवा: ${wind} km/h\n• छिड़काव सलाह: ${sprayStatus}\n🌾 100% सटीक कृषि मौसम परामर्श`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'home', label: '16-दिवसीय मौसम देखें' },
      },
      route: { target: 'home', type: 'tab', label: 'मौसम डैशबोर्ड' },
      action: { type: 'SHOW_WEATHER' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  // ── 5. फसल डॉक्टर व रोग-कीट Intent (Crop Doctor) ──
  const mahuTriggers = ['माहू', 'माहुर', 'माहूर', 'bph', 'चेपा', 'भूरा माहू', 'हरा माहू', 'रस चूसक', 'mahu', 'mahur', 'chepa'];
  if (mahuTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'सावधान किसान भाई! धान में माहू का प्रकोप है तो खेत का पानी तुरंत निकालें। तने के पास 120 ग्राम पाइमेट्रोजिन या इमिडाक्लोप्रिड का छिड़काव करें।';
    const textCg = 'अरे भइया! धान म माहू लग गे हे त खेत के पानी ला तुरते निकालव! 120 ग्राम पाइमेट्रोजिन या इमिडाक्लोप्रिड के स्प्रे सीधे तना तीर करव।';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🐛',
        headline: 'धान में भूरा माहू (BPH) नियंत्रण उपाय',
        headlineCg: 'धान म भूरा माहू के तुरंत रोकथाम',
        queryEcho: transcript,
        cards: [
          { icon: '🐛', label: 'पहचाना गया कीट', value: 'भूरा माहू (BPH)', sub: 'रस चूसक कीट • तने पर प्रकोप', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'अनुशंसित दवाई', value: 'पाइमेट्रोजिन 50% WDG', sub: '120g प्रति एकड़ (CIBRC)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💧', label: '15L टंकी खुराक', value: '12-15 ग्राम', sub: 'तने के पास नोजल रखें', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌾', label: 'खेत प्रबंधन', value: 'पानी तुरंत निकालें', sub: 'धूप व हवा लगने दें', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'खेत से पानी तुरंत बाहर निकालें ताकि नमी कम हो। दवा का स्प्रे सीधे तने की जड़ के पास करें, ऊपर पत्तियों पर नहीं।',
        advisoryTextCg: 'खेत के पानी ला तुरते निकालव! दवाई के स्प्रे सीधे तना के जड़ तीर करव, ऊपर पाना म नोहय।',
        whatsappShareText: `🐛 किसान साथी - माहू (BPH) नियंत्रण परामर्श:\n• कीट: भूरा माहू (रस चूसक)\n• दवा: पाइमेट्रोजिन 50% WDG (120g/एकड़)\n• टंकी माप: 12-15g प्रति 15 लीटर पंप\n• सलाह: खेत का पानी तुरंत निकालें।`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'bph', disease: 'माहू (BPH)' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const blastTriggers = ['पीला', 'पियरिया', 'पीलापन', 'झुलसा', 'ब्लास्ट', 'केंचुली', 'शीथ ब्लाइट', 'खैरा', 'पाना पीयर', 'peela', 'peeli', 'jhulsa', 'blast', 'khaira'];
  if (blastTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'पत्तियां पीली पड़ रही हैं तो जिंक की कमी से खैरा या फफूंद का झुलसा हो सकता है। 5 किलो जिंक सल्फेट या ट्राइसाइक्लाजोल 120 ग्राम प्रति एकड़ छिड़कें।';
    const textCg = 'का कहिथस, पाना पीयर परत हे? खैरा रोग बर जिंक सल्फेट अउ झुलसा बर ट्राइसाइक्लाजोल 120 ग्राम प्रति एकड़ छिड़कव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🍂',
        headline: 'धान में पत्ती पीलापन, खैरा व झुलसा नियंत्रण',
        headlineCg: 'धान म पाना पीयर अऊ झुलसा के इलाज',
        queryEcho: transcript,
        cards: [
          { icon: '🍂', label: 'रोग पहचान', value: 'खैरा / झुलसा (Blast)', sub: 'जिंक कमी या फफूंद प्रकोप', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'फफूंदनाशक दवा', value: 'ट्राइसाइक्लाजोल 75% WP', sub: '120g प्रति एकड़', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌱', label: 'जिंक सल्फेट', value: '5 kg प्रति एकड़', sub: 'खैरा रोग सुधार हेतु', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '💧', label: '15L टंकी खुराक', value: '15 ग्राम ट्राइसाइक्लाजोल', sub: 'पत्तियों पर एकसमान स्प्रे', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'यदि पुरानी पत्तियां कत्थई होकर पीली पड़ रही हैं तो 5 किग्रा जिंक सल्फेट दें। यदि नाव के आकार के धब्बे हैं तो ट्राइसाइक्लाजोल छिड़कें।',
        advisoryTextCg: 'यदि पाना म लाल-कत्थई दाग हे त जिंक सल्फेट डालव, अउ धब्बा हे त ट्राइसाइक्लाजोल छिड़कव!',
        whatsappShareText: `🍂 किसान साथी - धान पीलापन व झुलसा उपाय:\n• रोग: झुलसा (Blast) / खैरा\n• दवा: ट्राइसाइक्लाजोल 75% WP (120g/एकड़)\n• जिंक: 5 kg जिंक सल्फेट\n• टंकी माप: 15g प्रति 15 लीटर पंप`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'spot', disease: 'झुलसा / खैरा' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const stemBorerTriggers = ['तना छेदक', 'गाभा छेदक', 'इल्ली', 'सुंडी', 'कीड़ा', 'कीरा', 'पत्ता लपेटक', 'tana chhedak', 'illi', 'sundi', 'kida'];
  if (stemBorerTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'तना छेदक और इल्ली के नियंत्रण हेतु कारटाप हाइड्रोक्लोराइड 4G दानेदार या कोराजन 60ml प्रति एकड़ का छिड़काव करें।';
    const textCg = 'गाभा छेदक कीरा तना ला भीतर ले काट देथे! कारटाप हाइड्रोक्लोराइड दानेदार या कोराजन 60ml के छिड़काव करव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🐛',
        headline: 'धान में तना छेदक व गाभा कीड़ा नियंत्रण',
        headlineCg: 'धान म गाभा कीरा अऊ इल्ली के रोकथाम',
        queryEcho: transcript,
        cards: [
          { icon: '🐛', label: 'पहचाना गया कीट', value: 'तना छेदक (Stem Borer)', sub: 'गाभा काटने वाली इल्ली', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'अनुशंसित दवा', value: 'कोराजन (क्लोरेंट्रानिलिप्रोल)', sub: '60ml प्रति एकड़', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💧', label: '15L टंकी खुराक', value: '6 मिली कोराजन', sub: 'लंबे समय तक सुरक्षा', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌾', label: 'दानेदार विकल्प', value: 'कारटाप 4G (7.5 kg/एकड़)', sub: 'खेत में भुरकाव करें', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'तना छेदक कीड़ा तने के भीतर रहता है जिससे मृत गोभ (Dead Heart) बनती है। कोराजन 60ml या कारटाप दानेदार का प्रयोग करें।',
        advisoryTextCg: 'कीरा भीतर ले तना काटथे त गोभ सूख जाथे। कोराजन 6 मिली प्रति टंकी मिला के छिड़कव!',
        whatsappShareText: `🐛 किसान साथी - तना छेदक नियंत्रण:\n• कीट: तना छेदक (गाभा कीड़ा)\n• दवा: कोराजन 18.5% SC (60ml/एकड़)\n• टंकी माप: 6 मिली प्रति 15 लीटर पंप\n• दानेदार: कारटाप 4G (7.5 kg/एकड़)`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'stemborer', disease: 'तना छेदक' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const gundhiTriggers = ['गंधी', 'गांधी', 'बदबूदार', 'दुर्गंध', 'पोच धान', 'सफेद बाली', 'gundhi', 'gandhi', 'durgandh'];
  if (gundhiTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'धान में गंधी बग (बदबूदार कीड़े) का प्रकोप है तो दुग्ध अवस्था में बाली से रस चूसता है जिससे धान पोच हो जाता है। मैलाथियान 5% DP धूल 10 किलो प्रति एकड़ भुरकाव करें।';
    const textCg = 'अरे भइया! धान म गंधी बग कीरा लग गे हे त बाली के दूध ला चूस दिही अऊ धान पोच हो जाही! मैलाथियान 5% धूल 10 किलो प्रति एकड़ बिहनिया भुरकाव करव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🪲',
        headline: 'धान में गंधी बग (दुर्गंध कीट) व पोच धान नियंत्रण',
        headlineCg: 'धान म गंधी बग अऊ पोच धान के रोकथाम',
        queryEcho: transcript,
        cards: [
          { icon: '🪲', label: 'पहचाना गया कीट', value: 'गंधी बग (दुर्गंध कीट)', sub: 'दुग्ध अवस्था में रस चूसक', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'धूल भुरकाव दवा', value: 'मैलाथियान 5% DP', sub: '10 kg प्रति एकड़ (ओस में)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💧', label: 'स्प्रे विकल्प', value: 'क्लोरपायरीफॉस 20% EC', sub: '400 ml / एकड़ (150L पानी)', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌾', label: 'नुकसान लक्षण', value: 'सफेद खाली बाली (पोच)', sub: 'समय पर उपचार आवश्यक', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'सुबह के समय जब धान पर ओस की बूंदें हों, तब मैलाथियान धूल का भुरकाव करें। इससे धूल पत्तियों पर चिपककर कीट को तुरंत मारती है।',
        advisoryTextCg: 'बिहनिया जब पाना म ओस रहिथे तब मैलाथियान धूल ला भुरकाव करव। कीरा तुरते मर जाही!',
        whatsappShareText: `🪲 किसान साथी - गंधी बग नियंत्रण परामर्श:\n• कीट: गंधी बग (पोच धान)\n• धूल दवा: मैलाथियान 5% DP (10 kg/एकड़)\n• स्प्रे: क्लोरपायरीफॉस 20% EC (400 ml/एकड़)\n• समय: सुबह ओस के समय`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'gundhibug', disease: 'गंधी बग' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const wiltTriggers = ['उकठा', 'विल्ट', 'पौधा सूख', 'चना सूख', 'सूख रहा', 'उकठ', 'wilt', 'uktha'];
  if (wiltTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'चना या दलहन में उकठा रोग फफूंद से होता है जिससे पौधा अचानक सूख जाता है। ट्राइकोडर्मा 1 किलो प्रति एकड़ गोबर खाद में मिलाकर खेत में डालें।';
    const textCg = 'चना म उकठा रोग लग गे हे त झाड़ अचानक सूख जाथे! 1 किलो ट्राइकोडर्मा ला गोबर खाद म मिलाके खेत म डारव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🥀',
        headline: 'चना व दलहन में उकठा (Wilt) रोग नियंत्रण',
        headlineCg: 'चना म उकठा रोग के रोकथाम व इलाज',
        queryEcho: transcript,
        cards: [
          { icon: '🥀', label: 'पहचाना गया रोग', value: 'उकठा (Fusarium Wilt)', sub: 'मिट्टी जनित फफूंद रोग', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🌿', label: 'जैविक नियंत्रण', value: 'ट्राइकोडर्मा वीरिडी 1% WP', sub: '1-2 kg प्रति एकड़ (गोबर खाद)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💊', label: 'बीजोपचार', value: 'कार्बेन्डाजिम 50% WP', sub: '2g प्रति kg बीज', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌱', label: 'प्रतिरोधी किस्म', value: 'JG-11 / राधे / विजय', sub: 'उकठा रोधी चना किस्में', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'उकठा रोग जमीन में फफूंद से फैलता है। खड़ी फसल में 1 किग्रा ट्राइकोडर्मा को 50 किग्रा सड़ी गोबर खाद में मिलाकर खेत में फैलाएं और हल्की सिंचाई करें।',
        advisoryTextCg: 'ट्राइकोडर्मा ला गोबर खाद म मिलाके खेत म फैला देवव अऊ हल्का पानी चलावव। अगली बार बीजोपचार जरूर करव!',
        whatsappShareText: `🥀 किसान साथी - उकठा (Wilt) नियंत्रण परामर्श:\n• रोग: उकठा रोग (चना/दलहन)\n• जैविक दवा: ट्राइकोडर्मा वीरिडी (1-2 kg/एकड़)\n• बीजोपचार: कार्बेन्डाजिम 2g/kg\n• उन्नत किस्म: JG-11 / राधे`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'wilt', disease: 'उकठा रोग' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const whiteflyTriggers = ['सफेद मक्खी', 'मक्खी', 'मोजेक', 'पीला मोजेक', 'whitefly', 'mosaic'];
  if (whiteflyTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'सफेद मक्खी रस चूसकर पीला मोजेक वायरस फैलाती है भैया! इसके नियंत्रण हेतु थायमेथॉक्सम 25% WG 80 ग्राम या एसीफेट का 150 लीटर पानी में छिड़काव करें।';
    const textCg = 'सफेद मक्खी पाना के रस चूस के पीला मोजेक फैलाथे! थायमेथॉक्सम 80 ग्राम प्रति एकड़ या एसीफेट के स्प्रे तुरते करव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🪰',
        headline: 'सफेद मक्खी व पीला मोजेक वायरस नियंत्रण',
        headlineCg: 'सफेद मक्खी अऊ पीला मोजेक के रोकथाम',
        queryEcho: transcript,
        cards: [
          { icon: '🪰', label: 'पहचाना गया कीट', value: 'सफेद मक्खी (Whitefly)', sub: 'रस चूसक • वायरस वाहक', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'अनुशंसित दवा', value: 'थायमेथॉक्सम 25% WG', sub: '80g प्रति एकड़', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💧', label: '15L टंकी माप', value: '8 ग्राम प्रति टंकी', sub: '150 लीटर पानी प्रति एकड़', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🟡', label: 'पीले स्टिकी ट्रैप', value: '10 ट्रैप / एकड़', sub: 'मक्खियों को चिपकाकर मारें', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'खेत में पीले चिपचिपे कार्ड (Yellow Sticky Traps) लगाएं जिससे मक्खियां उसपर चिपक जाएं। रोग ग्रस्त पौधों को उखाड़कर तुरंत नष्ट करें।',
        advisoryTextCg: 'खेत म पियर चिपचिपा कार्ड लगावहू त मक्खी चिपक जाही। रोगी पौधा ला तुरते उखाड़ के फेंक देवव!',
        whatsappShareText: `🪰 किसान साथी - सफेद मक्खी नियंत्रण:\n• कीट: सफेद मक्खी (Whitefly)\n• दवा: थायमेथॉक्सम 25% WG (80g/एकड़)\n• टंकी माप: 8g प्रति 15 लीटर पंप\n• जैविक उपाय: पीले चिपचिपे ट्रैप (10/एकड़)`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'whitefly', disease: 'सफेद मक्खी' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const sheathBlightTriggers = ['शीथ ब्लाइट', 'पर्ण आच्छद', 'केंचुली', 'sheath blight'];
  if (sheathBlightTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'धान में शीथ ब्लाइट (केंचुली रोग) के लक्षण हैं तो तने पर हेक्साकोनाजोल 5% SC 400 मिली या वेलिडामाइसिन का छिड़काव करें।';
    const textCg = 'धान म केंचुली रोग (शीथ ब्लाइट) लग गे हे त हेक्साकोनाजोल 400 मिली प्रति एकड़ के स्प्रे पानी के सतह तीर करव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🍂',
        headline: 'धान में शीथ ब्लाइट (केंचुली रोग) नियंत्रण',
        headlineCg: 'धान म शीथ ब्लाइट (केंचुली) के इलाज',
        queryEcho: transcript,
        cards: [
          { icon: '🍂', label: 'पहचाना गया रोग', value: 'शीथ ब्लाइट (केंचुली)', sub: 'तने पर सांप की केंचुली जैसे धब्बे', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'अनुशंसित दवा', value: 'हेक्साकोनाजोल 5% SC', sub: '400 ml प्रति एकड़', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💧', label: '15L टंकी माप', value: '40 मिली प्रति पंप', sub: 'तने के पास स्प्रे करें', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🌿', label: 'एंटीबायोटिक विकल्प', value: 'वेलिडामाइसिन 3% L', sub: '500 ml प्रति एकड़', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'अत्यधिक यूरिया डालने से यह रोग बढ़ता है। दवा का छिड़काव पत्तियों के बजाय सीधे तने और पानी की सतह के पास करें।',
        advisoryTextCg: 'ज्यादा यूरिया डारे ले ये रोग बढ़थे। दवाई के स्प्रे सीधे तना तीर करव!',
        whatsappShareText: `🍂 किसान साथी - शीथ ब्लाइट नियंत्रण:\n• रोग: शीथ ब्लाइट (केंचुली रोग)\n• दवा: हेक्साकोनाजोल 5% SC (400 ml/एकड़)\n• टंकी माप: 40 ml प्रति 15 लीटर पंप\n• विकल्प: वेलिडामाइसिन 3% L`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'sheathblight', disease: 'शीथ ब्लाइट' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  const termiteTriggers = ['दीमक', 'demak', 'dimak', 'termite'];
  if (termiteTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'खेत में दीमक लगी है तो सिंचाई के पानी के साथ क्लोरपायरीफॉस 20% EC 1.5 लीटर प्रति एकड़ बहाएं या खेत में फिपरोनिल दानेदार डालें।';
    const textCg = 'खेत म दीमक लग गे हे त सिंचाई के पानी म क्लोरपायरीफॉस 1.5 लीटर बहा देवव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🐜',
        headline: 'खेत में दीमक (Termite) नियंत्रण उपाय',
        headlineCg: 'खेत म दीमक के पक्का रोकथाम',
        queryEcho: transcript,
        cards: [
          { icon: '🐜', label: 'पहचाना गया कीट', value: 'दीमक (Termite)', sub: 'जड़ों को काटने वाला कीट', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'सिंचाई जल दवा', value: 'क्लोरपायरीफॉस 20% EC', sub: '1.5 लीटर / एकड़ (पानी के साथ)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌾', label: 'दानेदार विकल्प', value: 'फिपरोनिल 0.3% GR', sub: '8-10 kg प्रति एकड़', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🪵', label: 'सावधानी', value: 'कच्ची गोबर खाद न डालें', sub: 'कच्ची खाद दीमक को बुलाती है', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'खेत में कभी भी कच्ची गोबर खाद न डालें क्योंकि इससे दीमक आकर्षित होती है। हमेशा पूर्णतः सड़ी हुई कम्पोस्ट खाद ही प्रयोग करें।',
        advisoryTextCg: 'कच्ची गोबर खाद खेत म झन डालव, ओखर ले दीमक बाढ़थे!',
        whatsappShareText: `🐜 किसान साथी - दीमक नियंत्रण:\n• कीट: दीमक\n• दवा: क्लोरपायरीफॉस 20% EC (1.5L/एकड़ सिंचाई जल के साथ)\n• दानेदार: फिपरोनिल 0.3% GR (10kg/एकड़)`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'termite', disease: 'दीमक' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  // ── 6. मोटर कंट्रोलर Intent (Motor & Borewell) ──
  const motorTriggers = ['मोटर', 'बोरवेल', 'पंप', 'ट्यूबवेल', 'पानी चलाना', 'starter', 'motor', 'motar', 'pump', 'borwell', 'borewell'];
  if (motorTriggers.some((t) => clean.includes(t))) {
    // Edge case 6A: Direct STOP command
    if (clean.includes('बंद') || clean.includes('रोक') || clean.includes('stop') || clean.includes('off')) {
      resetKakaSession();
      const textHi = 'जी भैया, बोरवेल मोटर बंद करने का SMS आदेश भेज दिया है। पंप सुरक्षित बंद हो रहा है!';
      const textCg = 'हव संगी! बोरवेल मोटर बंद करे के SMS आदेश भेज दे हन। पंप सुरक्षित बंद होवत हे!';
      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'MOTOR',
          icon: '🛑',
          headline: 'बोरवेल मोटर बंद आदेश प्रेषित',
          headlineCg: 'बोरवेल मोटर बंद करे के आदेश भेज दे हन',
          queryEcho: transcript,
          cards: [
            { icon: '🛑', label: 'मोटर स्थिति', value: 'सुरक्षित बंद (OFF)', sub: 'SMS आदेश भेजा गया', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
            { icon: '📱', label: 'कंट्रोलर', value: 'GSM स्टार्टर', sub: 'रिले डिस्कनेक्टेड', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          ],
          advisoryText: 'मोटर बंद करने का आदेश स्टार्टर को भेज दिया गया है। खेत का पंप सुरक्षित बंद है।',
          advisoryTextCg: 'मोटर बंद होगे हे संगी, पंप सुरक्षित बंद हे!',
          whatsappShareText: `🛑 किसान साथी मोटर सूचना:\nबोरवेल मोटर बंद कर दी गई है।\nसमय: ${new Date().toLocaleTimeString('hi-IN')}`,
          needsClarification: false,
          missingSlot: null,
          slotSuggestions: [],
          deepLink: { tab: 'home', modal: 'motor', label: 'मोटर कंट्रोलर देखें' },
        },
        route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
        action: { type: 'EXECUTE_MOTOR', command: 'STOP' },
        needsClarification: false,
        extractedAcre: null,
        confidence: 0.99,
      };
    }

    // Edge case 6B: Status inquiry
    if (clean.includes('चालू है') || clean.includes('स्थिति') || clean.includes('स्टेटस') || clean.includes('status')) {
      resetKakaSession();
      const textHi = 'खेत का GSM मोटर कंट्रोलर तैयार (Standby) स्थिति में है भैया। आप SMS आदेश से इसे कभी भी चालू या बंद कर सकते हैं।';
      const textCg = 'खेत के GSM मोटर कंट्रोलर तैयार स्थिति म हे संगी! तैं SMS भेज के चालू या बंद करे सकथस।';
      return {
        textHi,
        textCg,
        directAnswer: {
          intent: 'MOTOR',
          icon: '⚡',
          headline: 'बोरवेल मोटर वर्तमान स्थिति',
          headlineCg: 'बोरवेल मोटर के ताजा स्थिति',
          queryEcho: transcript,
          cards: [
            { icon: '⚡', label: 'मोटर स्थिति', value: 'स्टैंडबाय (तैयार)', sub: 'GSM सिग्नल उपलब्ध', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
            { icon: '🔒', label: 'सुरक्षा इंटरलॉक', value: 'ड्राई-रन सेफ', sub: 'वोल्टेज सामान्य', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          ],
          advisoryText: 'मोटर चालू करने हेतु नीचे "चालू करव" दबाएं या बोलें।',
          advisoryTextCg: 'मोटर चालू करे बर नीचे "चालू करव" छूव संगी!',
          whatsappShareText: '',
          needsClarification: true,
          missingSlot: 'confirmation',
          slotSuggestions: ['चालू करव (START)', 'बंद रखव (STOP)'],
          deepLink: { tab: 'home', modal: 'motor', label: 'मोटर कंट्रोलर देखें' },
        },
        route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
        action: { type: 'SHOW_MOTOR_STATUS' },
        needsClarification: false,
        extractedAcre: null,
        confidence: 0.98,
      };
    }

    // Edge case 6C: Confirmation to START
    setKakaSession('ASK_MOTOR');
    const textHi = 'क्या बोरवेल मोटर चालू करने का SMS आदेश भेजें भैया? पुष्टि हेतु नीचे "हाँ" चुनें या बोलें।';
    const textCg = 'का बोरवेल मोटर चालू करे के SMS आदेश भेजंव संगी? पुष्टि बर नीचे "हव" छूव या बोलव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'MOTOR',
        icon: '⚡',
        headline: 'स्मार्ट ट्यूबवेल मोटर कंट्रोल',
        headlineCg: 'खेत के बोरवेल मोटर कंट्रोलर',
        queryEcho: transcript,
        cards: [
          { icon: '⚡', label: 'मोटर स्थिति', value: 'तैयार (Standby)', sub: 'GSM रिले कनेक्टेड', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '📱', label: 'SMS कमांड', value: 'START / STOP', sub: '1-क्लिक दूरस्थ नियंत्रण', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        ],
        advisoryText: 'मोटर चालू करने का SMS आदेश भेजने के लिए नीचे "हव (हाँ)" दबाएं या बोलें।',
        advisoryTextCg: 'मोटर चालू करे बर नीचे "हव (हाँ)" छूव या बोलके बताव संगी!',
        whatsappShareText: '',
        needsClarification: true,
        missingSlot: 'confirmation',
        slotSuggestions: ['हव (हाँ, चालू करव)', 'झन (नहीं, रहने दो)'],
        deepLink: { tab: 'home', modal: 'motor', label: 'मोटर कंट्रोलर देखें' },
      },
      route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
      action: { type: 'ASK_MOTOR' },
      needsClarification: true,
      extractedAcre,
      confidence: 0.96,
    };
  }

  // ── 7. टोकन तुंहर हाथ Intent (Token Guide) ──
  const tokenTriggers = ['टोकन', 'तुंहर हाथ', 'टोकन कब', 'टोकन कैसे', 'सोसायटी टोकन', 'token', 'tuhar hath', 'parchi', 'slot'];
  if (tokenTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'टोकन तुंहर हाथ ऐप से धान उपार्जन का टोकन 7 दिन पूर्व बुक करें भैया। धान को 17% नमी मानक पर सुखाकर लाएं।';
    const textCg = 'टोकन तुंहर हाथ ले धान बेचे के टोकन 7 दिन पहिले बुक करे सकथव। धान ला 17% नमी तक सुखा के ले जाना हे संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'TOKEN',
        icon: '🎫',
        headline: 'टोकन तुंहर हाथ: धान खरीदी नियम व स्लॉट बुकिंग',
        headlineCg: 'टोकन तुंहर हाथ: धान बेचे के पूरा नियम',
        queryEcho: transcript,
        cards: [
          { icon: '🎫', label: 'टोकन बुकिंग', value: '7 दिन पूर्व', sub: 'तुंहर हाथ मोबाइल ऐप से', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '💧', label: 'नमी मानक', value: 'अधिकतम 17%', sub: 'अच्छी तरह सुखाकर लाएं', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌾', label: 'खरीदी कोटा', value: '21 क्विंटल/एकड़', sub: '₹3,100 कृषक उन्नति दर', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '📄', label: 'ज़रूरी दस्तावेज़', value: 'ऋण पुस्तिका + पासबुक', sub: 'आधार व सोसायटी पंजीयन', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'धान को 17% से कम नमी पर सुखाकर लाएं। रविवार और शासकीय अवकाश पर खरीदी केंद्र बंद रहते हैं।',
        advisoryTextCg: 'धान ला 17% नमी म सुखा के ले जाना हे। अतवार अउ छुट्टी के दिन खरीदी केंद्र बंद रहिथे!',
        whatsappShareText: `🎫 किसान साथी - टोकन तुंहर हाथ मार्गदर्शिका:\n• टोकन: 7 दिन पूर्व बुक करें\n• नमी मानक: अधिकतम 17%\n• कोटा: 21 क्विंटल प्रति एकड़\n• भाव: ₹3,100 प्रति क्विंटल\n• दस्तावेज: ऋण पुस्तिका, आधार, बैंक पासबुक`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { modal: 'token', label: 'टोकन मार्गदर्शिका खोलें' },
      },
      route: { target: 'token', type: 'modal', label: 'टोकन तुंहर हाथ' },
      action: { type: 'OPEN_MODAL', modal: 'token' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  // ── 8. FAQs & शून्य कागज़ात Intent (Zero Paperwork) ──
  const zeroPaperworkTriggers = ['खसरा', 'कागजात', 'जमीन का कागज', 'ऋण पुस्तिका', 'पट्टा', 'khasra', 'kagaj', 'paper', 'b1', 'faq', 'faqs', 'सवाल', 'प्रश्न'];
  if (zeroPaperworkTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'किसान साथी 100% सुरक्षित और कागजात-मुक्त ऐप है भैया! इसमें कोई खसरा नंबर या जमीन के सरकारी कागज नहीं देने होते।';
    const textCg = 'किसान साथी 100% सुरक्छित अउ कागजात-मुक्त हे संगी! कोनो खसरा नंबर या जमीन के कागजात नइ लगे।';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'FAQ',
        icon: '🔒',
        headline: 'किसान साथी: 100% सुरक्षित व कागजात-मुक्त मंच',
        headlineCg: 'किसान साथी: 100% सुरक्छित अऊ कागजात-मुक्त ऐप',
        queryEcho: transcript,
        cards: [
          { icon: '🔒', label: 'शून्य कागज़ात', value: '100% सुरक्षित', sub: 'कोई खसरा नंबर नहीं चाहिए', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '📶', label: 'ऑफलाइन क्षमता', value: 'बिना नेट भी काम', sub: 'खाद, डायरी, KCC उपलब्ध', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '📞', label: 'किसान कॉल सेंटर', value: '1800-180-1551', sub: 'कृषि सलाह (टोल-फ्री)', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '✉️', label: 'ऐप तकनीकी सहायता', value: 'support@init65.co.in', sub: '24x7 किसान ईमेल सहायता', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'यह ऐप किसानों के मार्गदर्शन हेतु है। हम कभी भी आपकी ज़मीन, खसरा या बैंक पासवर्ड जैसी संवेदनशील जानकारी नहीं मांगते।',
        advisoryTextCg: 'ये ऐप किसान मन के भलाई बर हे। कोनो खसरा या जमीन के सरकारी कागज नइ मांगे जाय!',
        whatsappShareText: `🔒 किसान साथी - 100% सुरक्षित व कागजात-मुक्त:\n• शून्य कागज़ात: कोई खसरा नंबर नहीं चाहिए\n• बिना इंटरनेट भी 100% काम करता है\n• कृषि कॉल सेंटर: 1800-180-1551 (टोल-फ्री)\n• ऐप सपोर्ट: support@init65.co.in`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { modal: 'faq', label: 'अक्सर पूछे जाने वाले सवाल देखें' },
      },
      route: { target: 'faq', type: 'modal', label: 'अक्सर पूछे जाने वाले सवाल' },
      action: { type: 'OPEN_FAQ' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  // ── 9. सौर सुजला योजना व सोलर पंप Intent (Solar Pump) ──
  const solarTriggers = ['सोलर पंप', 'सौर सुजला', 'कुसुम', 'सौर ऊर्जा', 'solar pump', 'saur sujala', 'kusum'];
  if (solarTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'छत्तीसगढ़ सौर सुजला योजना में किसानों को 3HP और 5HP सोलर पंप पर 90% तक सरकारी अनुदान मिलता है भैया! यह क्रेडा (CREDA) द्वारा लगाया जाता है।';
    const textCg = 'छत्तीसगढ़ सौर सुजला योजना म 3HP अउ 5HP सोलर पंप म 90% तक सरकारी छूट मिलथे संगी! क्रेडा (CREDA) म आवेदन करे सकथव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'SCHEMES',
        icon: '☀️',
        headline: 'छत्तीसगढ़ सौर सुजला योजना (सोलर पंप अनुदान)',
        headlineCg: 'सौर सुजला योजना: 90% छूट म सोलर पंप',
        queryEcho: transcript,
        cards: [
          { icon: '☀️', label: 'सरकारी अनुदान', value: '75% से 90% छूट', sub: 'SC/ST 90% • OBC 80% • सामान्य 75%', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '⚡', label: 'पंप क्षमता', value: '3 HP एवं 5 HP', sub: 'सबमर्सिबल व सरफेस पंप', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🏢', label: 'नोडल एजेंसी', value: 'CREDA (क्रेडा)', sub: 'छत्तीसगढ़ अक्षय ऊर्जा विकास', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '💰', label: 'बिजली खर्च', value: '₹0 (शून्य बिल)', sub: 'दिनभर मुफ्त सौर ऊर्जा सिंचाई', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'आवेदन हेतु बी-1/खसरा नकल, आधार कार्ड और बैंक पासबुक के साथ अपने जिले के क्रेडा कार्यालय अथवा कृषि विभाग में संपर्क करें।',
        advisoryTextCg: 'आवेदन बर आधार, पासबुक अउ बी-1 लेके जिला के क्रेडा दफ्तर म जावव संगी!',
        whatsappShareText: `☀️ किसान साथी - सौर सुजला योजना:\n• अनुदान: 75% से 90% तक सरकारी सब्सिडी\n• पंप: 3 HP एवं 5 HP सोलर पंप\n• एजेंसी: क्रेडा (CREDA) छत्तीसगढ़\n• लाभ: ₹0 बिजली बिल, दिन में मुफ्त सिंचाई`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', label: 'सरकारी योजनाएं देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'सरकारी योजनाएं' },
      action: { type: 'SHOW_SCHEME', scheme: 'solar' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  // ── 10. किसान क्रेडिट कार्ड व 0% ब्याज ऋण (KCC Loan) ──
  const kccTriggers = ['केसीसी', 'kcc', 'कर्ज', 'कर्जा', 'लोन', 'ऋण', 'सोसायटी ऋण', 'सोसायटी लोन', 'credit card', 'क्रेडिट कार्ड'];
  if (kccTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'छत्तीसगढ़ में प्राथमिक कृषि साख सहकारी समितियों (PACS) के माध्यम से किसानों को शून्य प्रतिशत (0%) ब्याज पर अल्पकालीन कृषि ऋण दिया जाता है भैया!';
    const textCg = 'छत्तीसगढ़ म सोसायटी ले 0% ब्याज म बिना कोनो सूद के खेती बर कर्जा मिलथे संगी! RuPay किसान कार्ड ले पईसा निकाल सकथव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'SCHEMES',
        icon: '💳',
        headline: 'किसान क्रेडिट कार्ड (KCC): 0% ब्याज दर ऋण',
        headlineCg: 'केसीसी (KCC): 0% ब्याज म कृषि कर्जा',
        queryEcho: transcript,
        cards: [
          { icon: '💳', label: 'ब्याज दर', value: '0% (शून्य ब्याज)', sub: 'छत्तीसगढ़ शासन ब्याज अनुदान', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '💰', label: 'अधिकतम सीमा', value: '₹3 से ₹5 लाख तक', sub: 'फसल रकबा अनुसार ऋण पात्रता', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🏧', label: 'एटीएम कार्ड', value: 'RuPay Kisan Card', sub: 'खाद-बीज व नकद आहरण', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🏢', label: 'कहाँ मिलेगा', value: 'ग्राम सेवा सहकारी समिति', sub: 'PACS / जिला सहकारी अपेक्स बैंक', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'समय पर ऋण चुकता करने पर शून्य ब्याज लागू रहता है। अपनी ग्राम सोसायटी में ऋण पुस्तिका, आधार कार्ड और बैंक पासबुक जमा करके KCC बनवाएं।',
        advisoryTextCg: 'समय म कर्जा पटाए ले 0% ब्याज लगथे। अपन सोसायटी म जाके RuPay किसान कार्ड बनवा लेवव!',
        whatsappShareText: `💳 किसान साथी - KCC 0% ब्याज ऋण:\n• ब्याज दर: 0% (शून्य ब्याज)\n• सीमा: ₹3 से ₹5 लाख तक\n• कार्ड: RuPay Kisan Card (ATM निकासी)\n• प्रदाता: सहकारी समिति (PACS) / अपेक्स बैंक`,
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'schemes', label: 'सरकारी योजनाएं देखें' },
      },
      route: { target: 'schemes', type: 'tab', label: 'सरकारी योजनाएं' },
      action: { type: 'SHOW_SCHEME', scheme: 'kcc' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.98,
    };
  }

  // ── 11. आत्मीय देहाती अभिवादन व काका का परिचय (Persona & Greetings) ──
  const greetingTriggers = ['काका', 'बहिरा काका', 'जय जोहार', 'नमस्ते', 'प्रणाम', 'राम राम', 'कइसे हस', 'कैसे हो', 'kaka', 'bhaira', 'johar', 'jay johar', 'ram ram', 'namaste', 'hello', 'hi', 'kaise ho'];
  if (greetingTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'जय जोहार किसान भाई! मैं आपका बहिरा काका हूँ। थोड़ा ज़ोर से बोलिए—धान का भाव जानना है, खाद का हिसाब, या खेत में कोई बीमारी लगी है?';
    const textCg = 'जय जोहार संगी! मैं तोर बहिरा काका हंव। कान म थोड़ा कम सुनाई देथे बाक़ी किसानी के सब बात जानथंव! बोल, खेत म का समस्या हे?';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'GREETING',
        icon: '👴🏻',
        headline: 'जय जोहार! मैं तोर बहिरा काका हंव',
        headlineCg: 'जय जोहार संगी! बोल काका का सेवा करय?',
        queryEcho: transcript,
        cards: [
          { icon: '🌾', label: 'धान खरीदी', value: '₹3,100 / क्विंटल', sub: '21 क्विंटल प्रति एकड़ कोटा', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🧮', label: 'खाद हिसाब', value: 'DAP + यूरिया गणना', sub: 'एकड़ अनुसार सटीक बोरी', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🏪', label: 'लाइव मंडी भाव', value: `${selectedDistrict} मंडी`, sub: 'टमाटर, चना, सोयाबीन रेट', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '🐛', label: 'फसल डॉक्टर', value: 'रोग व कीट सलाह', sub: 'दवाई नाम व टंकी माप', bg: '#f8fafc', border: '#cbd5e1', color: '#1e293b' },
        ],
        advisoryText: 'मुझसे कुछ भी पूछ सकते हैं—खेत का रकबा बोलें, फसल का नाम बताएं या नीचे दिए गए विकल्पों में से किसी एक को छुएं:',
        advisoryTextCg: 'काका ले कछु भी पूछ सकथव—धान के भाव, खाद के बोरी, या कोनो दवाई। नीचे छूव या बोलव संगी:',
        whatsappShareText: '',
        needsClarification: true,
        missingSlot: 'topic',
        slotSuggestions: ['धान ₹3,100 भाव', 'खाद हिसाब', 'टमाटर मंडी भाव', 'आज का मौसम', 'माहू की दवा'],
        deepLink: null,
      },
      route: null,
      action: null,
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.99,
    };
  }

  // ── 12. Direct Acreage Input without prior intent (e.g. farmer says "2.5 एकड़") ──
  if (extractedAcre) {
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
  }

  // ── 10. Fallback: Warm Bhaira Kaka hard-of-hearing persona ──
  const textHi = 'काका समझ नहीं पाए। थोड़ा ज़ोर से बोलिए—धान के भाव, खाद की बोरी या फसल में लगी बीमारी के बारे में पूछ रहे हैं?';
  const textCg = 'अरे भइया, तोला पता हे न मैं थोड़ा बहिरा हंव! थोड़ा जोर ले बोलव — धान के भाव जानना हे, खाद के हिसाब, कि कोनो दवाई?';

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'FALLBACK',
      icon: '👴🏻',
      headline: 'काका समझ नहीं पाए — थोड़ा ज़ोर से बोलें',
      headlineCg: 'काका सुन नइ पाइन — थोड़ा जोर ले बोलव',
      queryEcho: transcript,
      cards: [
        { icon: '🌾', label: 'धान भाव', value: '₹3,100 / क्विंटल', sub: 'समर्थन मूल्य खरीदी', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '🧮', label: 'खाद हिसाब', value: 'DAP + यूरिया', sub: 'एकड़ अनुसार गणना', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
      ],
      advisoryText: 'आप नीचे दिए गए विकल्पों में से किसी एक को छू सकते हैं या दोबारा ज़ोर से बोल सकते हैं:',
      advisoryTextCg: 'नीचे कोनो भी विकल्प ला छूव या फेर जोर ले बोलव संगी:',
      whatsappShareText: '',
      needsClarification: true,
      missingSlot: 'topic',
      slotSuggestions: ['धान ₹3,100 भाव', 'खाद हिसाब', 'टमाटर मंडी भाव', 'आज का मौसम', 'माहू की दवा'],
      deepLink: null,
    },
    route: null,
    action: null,
    needsClarification: false,
    extractedAcre: null,
    confidence: 0.3,
  };
};

/**
 * Helper to generate Fertilizer direct answers cleanly across all crops with Weather rain interlock
 */
export const generateFertilizerDirectAnswer = (crop = 'paddy', acreVal = 1.0, weather = {}, queryEcho = '') => {
  const hasRainAlert = (weather.rainChance || 0) > 40 || (weather.windSpeed || 0) > 15;
  const rainNoteHi = hasRainAlert ? ' आज बारिश/तेज हवा की संभावना है, अतः यूरिया का छिड़काव अभी टालें!' : '';
  const rainNoteCg = hasRainAlert ? ' आज पानी गिरे के संका हे, त यूरिया छिड़काव रोक देवव ताकि दवाई बोहा झन जाय!' : '';

  if (crop === 'chana') {
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
const generateMandiDirectAnswer = (commodity, district = 'रायपुर', queryEcho = '') => {
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
 * 15-Second Vernacular Spoken Audio Walkthroughs ("काका ले समझव")
 * Explains any screen in simple, practical rural language
 */
export const getKakaWalkthrough = (featureId, isChhattisgarhi = false) => {
  const walkthroughs = {
    home: {
      hi: 'यह आपका मुख्य किसान डैशबोर्ड है। यहाँ आज का लाइव मौसम, छिड़काव की सलाह, और खेती के शीर्ष 8 औजार 1-टैप में उपलब्ध हैं।',
      cg: 'ये तोर मुख्य किसान डैशबोर्ड हे! इहां रोज के मौसम, छिड़काव सलाह, अउ किसानी के सबले जरूरी 8 औजार ऊपर दिखथें।',
    },
    calculator: {
      hi: 'खाद कैलकुलेटर में अपनी फसल व एकड़ चुनें। यह आपकी जमीन हेतु सही यूरिया, डीएपी और पोटाश की बोरी का सटीक हिसाब तुरंत निकाल देता है।',
      cg: 'खाद कैलकुलेटर म अपन फसल अउ एकड़ चुनव। कतका बोरी DAP, यूरिया, अउ पोटाश डालना हे, सब सही हिसाब आ जाही!',
    },
    doctor: {
      hi: 'फसल डॉक्टर में बीमार पत्ती की फोटो कैमरे से खींचें। यह तुरंत रोग पहचानकर सही कीटनाशक और फफूंदनाशक दवा का नाम व मात्रा बताता है।',
      cg: 'फसल डॉक्टर म धान या कोनो फसल के बीमार पाना के फोटो खींचव, काका तुरंत दवाई, कीटनाशक अउ स्प्रे के सही मात्रा बता दिही।',
    },
    mandi: {
      hi: 'मंडी भाव में छत्तीसगढ़ की सभी मंडियों के ताज़ा दाम और कृषक उन्नति योजना के तहत ₹3,100 समर्थन मूल्य का पूरा ब्योरा मिलता है।',
      cg: 'मंडी भाव म छत्तीसगढ़ के सबो मंडी के भाव अउ ₹3,100 के दर ले धान के पूरा पईसा के हिसाब मिलथे।',
    },
    token: {
      hi: 'टोकन तुंहर हाथ में धान बेचने का टोकन, बारदाना बोरी की संख्या, और उपार्जन केंद्र में सही समय पर धान तौलने की पूरी जानकारी है।',
      cg: 'टोकन तुंहर हाथ म धान बेचे के टोकन, बारदाना के गिनती, अउ उपार्जन केंद्र के सब नियम समझाय गे हे।',
    },
    diary: {
      hi: 'मेरी फसल डायरी में अपने खेत का बीज, खाद, जुताई और मजदूरी का खर्च दर्ज करें ताकि फसल बिकने पर सही मुनाफा पता चले।',
      cg: 'मोर फसल डायरी म अपन खेत के पूरा खर्च, खाद, मजदूरी, अउ आमदनी लिख के रख सकथव ताकि सही मुनाफा पता चलय।',
    },
    machinery: {
      hi: 'मशीनरी रेंटल में ट्रैक्टर, हार्वेस्टर और ड्रोन किराए पर लें या अपनी कृषि मशीन किराए पर चढ़ाकर अतिरिक्त आमदनी कमाएं।',
      cg: 'मशीनरी रेंटल म ट्रैक्टर, हार्वेस्टर अउ ड्रोन किराया म लेवव या अपन मशीन किराया म चला के बनेच कमाई करव।',
    },
    chaupal: {
      hi: 'किसान चौपाल में छत्तीसगढ़ के किसान भाइयों से सवाल पूछें, खेती के अनुभव साझा करें, और कृषि वैज्ञानिकों की सीधी सलाह पाएं।',
      cg: 'किसान चौपाल म अपन साथी किसान भाई मन ले सवाल पूछव, सलाह लेवव, अउ खेती के नया तरीका सीखव।',
    },
    merakhet: {
      hi: 'मेरा खेत में अपनी बुआई तारीख चुनकर फसल का लाइव विकास चक्र, खाद देने का सही दिन, और कटाई का समय ट्रैक करें।',
      cg: 'मोर खेत म बुआई तारीख चुनव अउ फसल के बढ़त, खाद डारे के दिन, अउ कटाई के सही बेरा आसानी ले देखव।',
    },
    gps: {
      hi: 'खेत सीमा जीपीएस मापक चालू करके खेत की चारों मेड़ों पर सामान्य चाल से चलें। यह आपके खेत का कुल रकबा एकड़ और डिसमिल में नाप देगा।',
      cg: 'खेत सीमा नापक चालू करके खेत के चारों मेड़ म चलव। ये तोर खेत के कुल रकबा एकड़ अउ डिसमिल म तुरते नाप दिही!',
    },
    soiliot: {
      hi: 'स्मार्ट मिट्टी जांच में ब्लूटूथ सेंसर से खेत की मिट्टी का पीएच, नमी और एनपीके नापकर जमीन की सेहत तुरंत जांचें।',
      cg: 'स्मार्ट माटी जांच म ब्लूटूथ सेंसर ले खेत के माटी, नमी, अउ खाद के ताकत 1-टैप म नाप सकथव।',
    },
    motor: {
      hi: 'स्मार्ट मोटर कंट्रोलर से घर बैठे मोबाइल के 1-क्लिक या एसएमएस से खेत का बोरवेल और स्टार्टर आसानी से चालू-बंद करें।',
      cg: 'स्मार्ट मोटर कंट्रोलर ले घर बैठे मोबाइल ले 1 बटन दबा के खेत के बोरवेल पंप चालू-बंद करव।',
    },
    devicehub: {
      hi: 'स्मार्ट डिवाइस हब से अपने खेत के सभी ब्लूटूथ सेंसर, मोटर कंट्रोलर और जीपीएस उपकरणों को एक ही जगह से नियंत्रित करें।',
      cg: 'डिवाइस हब म अपन सबो ब्लूटूथ माटी सेंसर, मोटर स्टार्टर, अउ जीपीएस औजार ल एक जगह ले चलावव।',
    },
  };

  const item = walkthroughs[featureId] || walkthroughs.home;
  return isChhattisgarhi ? item.cg : item.hi;
};

