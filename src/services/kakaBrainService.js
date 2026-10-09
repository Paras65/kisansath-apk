// किसान साथी - बहिरा काका AI कृषि दिमाग (Bhaira Kaka Vernacular Conversational Engine)
// Authentic Chhattisgarhi & Hindi Rural Dialogues with IGKV Raipur recommendations
// Handles 40+ Agricultural Intents, Dialect Edge-cases, Rustic Number Extraction & Persona responses

import { appConfig } from '../config/appConfig';

/**
 * Extracts numeric acreage from colloquial Hindi/Chhattisgarhi speech
 * Handles fractions: "ढाई", "डेढ़", "सवा दो", "पौने तीन", "साढ़े तीन", "आधा एकड़", "25 डिसमिल"
 */
export const extractAcreage = (text) => {
  if (!text) return null;
  const clean = text.toLowerCase().trim();

  // 1. Check dismil (1 acre = 100 dismil)
  const dismilMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:डिसमिल|dismil|दिसमिल)/);
  if (dismilMatch) {
    const val = parseFloat(dismilMatch[1]);
    if (!isNaN(val) && val > 0) return Number((val / 100).toFixed(2));
  }

  // 2. Fractional vernacular colloquial terms
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

  // 3. Spoken Devanagari numbers
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

  // 4. Standard numerical digits
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
  pendingIntent: null, // 'ASK_MOTOR' | 'ASK_ACRES'
  pendingCrop: 'paddy',
  timestamp: 0,
};

export const resetKakaSession = () => {
  kakaSession = { pendingIntent: null, pendingCrop: 'paddy', timestamp: 0 };
};

export const setKakaSession = (intent, crop = 'paddy') => {
  kakaSession = {
    pendingIntent: intent,
    pendingCrop: crop,
    timestamp: Date.now(),
  };
};

export const getKakaSession = () => {
  if (Date.now() - (kakaSession.timestamp || 0) > 45000) {
    kakaSession = { pendingIntent: null, pendingCrop: 'paddy', timestamp: 0 };
  }
  return kakaSession;
};

/**
 * Process any spoken query through Bhaira Kaka's AI Brain
 * Returns structured response with spoken audio strings, matching routes, and structured actions
 */
export const queryKakaBrain = (transcript, isChhattisgarhi = false, context = {}) => {
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 2) {
    return {
      textHi: 'कुछ सुनाई नहीं दिया। शांत जगह पर थोड़ा ज़ोर से बोलें।',
      textCg: 'अरे भइया, कछु सुनाई नई परिस! थोड़ा जोर ले बोलव, तोर काका कान लगाके बइठे हे!',
      route: null,
      action: null,
      needsClarification: false,
      extractedAcre: null,
      confidence: 0,
    };
  }

  const clean = transcript.toLowerCase().trim();
  const extractedAcre = extractAcreage(clean);
  const session = getKakaSession();

  // ── 0. Multi-Turn Conversational Context Resolver ──
  if (session.pendingIntent === 'ASK_MOTOR') {
    const affirmativeWords = ['हव', 'हाँ', 'हां', 'करव', 'कर दो', 'भेजव', 'भेज दो', 'चालू करव', 'चालू', 'yes', 'ok', 'चलाओ', 'हओ', 'हऊ', 'भेज'];
    const negativeWords = ['नहीं', 'झन', 'मत', 'रद्द', 'ना', 'no', 'cancel', 'रहने दो', 'झन भेजव', 'झन करव', 'मत करो'];

    if (affirmativeWords.some((w) => clean.includes(w))) {
      resetKakaSession();
      return {
        textHi: 'जी भैया, बोरवेल मोटर चालू करने का SMS आदेश भेजा जा रहा है। मोटर कंट्रोलर खोल रहे हैं।',
        textCg: 'हव संगी! बोरवेल मोटर चालू करे के SMS आदेश भेजत हंव। मोटर कंट्रोलर खोलत हंव!',
        route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
        action: { type: 'EXECUTE_MOTOR', command: 'START' },
        needsClarification: false,
        extractedAcre: null,
        confidence: 0.99,
      };
    }

    if (negativeWords.some((w) => clean.includes(w))) {
      resetKakaSession();
      return {
        textHi: 'ठीक है भैया, मोटर चालू करने का आदेश रद्द कर दिया गया है।',
        textCg: 'ठीक हे संगी, मोटर चालू नइ करेन। कोनो चिंता झन करव!',
        route: null,
        action: { type: 'CANCEL_MOTOR' },
        needsClarification: false,
        extractedAcre: null,
        confidence: 0.99,
      };
    }
  }

  if (session.pendingIntent === 'ASK_ACRES' && extractedAcre) {
    const crop = session.pendingCrop || 'paddy';
    resetKakaSession();
    if (crop === 'chana') {
      const dapBags = Math.max(1, Math.round(extractedAcre * 0.6));
      return {
        textHi: `${extractedAcre} एकड़ रबी चना के लिए ${dapBags} बोरी DAP लगेगी भैया! खाद कैलकुलेटर में हिसाब सेट कर दिया है।`,
        textCg: `${extractedAcre} एकड़ रबी चना बर ${dapBags} बोरी DAP लगही संगी! चल कैलकुलेटर म पूरा हिसाब सेट कर दे हंव!`,
        route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
        action: { type: 'AUTO_CALC_FERTILIZER', acre: extractedAcre, crop: 'chana' },
        needsClarification: false,
        extractedAcre,
        confidence: 0.98,
      };
    } else {
      const dapBags = Math.max(1, Math.round(extractedAcre * 1.0));
      const ureaBags = Math.max(1, Math.round((extractedAcre * 100) / 45));
      const mopBags = Math.max(1, Math.round(extractedAcre * 0.6));
      return {
        textHi: `${extractedAcre} एकड़ धान के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया और ${mopBags} बोरी पोटाश लगेगी भैया!`,
        textCg: `${extractedAcre} एकड़ धान बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${mopBags} बोरी पोटाश लगही संगी!`,
        route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
        action: { type: 'AUTO_CALC_FERTILIZER', acre: extractedAcre, crop: 'paddy' },
        needsClarification: false,
        extractedAcre,
        confidence: 0.98,
      };
    }
  }

  // 1. Fertilizer & Nutrient Intent (Dosage calculation + Ask-Before)
  const fertTriggers = ['खाद', 'यूरिया', 'dap', 'पोटाश', 'कितना खाद', 'खाद कैलकुलेटर', 'खाद कते डारना', 'डारव', 'डारना', 'khad', 'khaad', 'urea', 'yuriya', 'potash'];
  const hasFert = fertTriggers.some((t) => clean.includes(t));

  if (hasFert) {
    if (extractedAcre) {
      resetKakaSession();
      const dapBags = Math.max(1, Math.round(extractedAcre * 1.0));
      const ureaBags = Math.max(1, Math.round((extractedAcre * 100) / 45));
      const mopBags = Math.max(1, Math.round(extractedAcre * 0.6));
      return {
        textHi: `${extractedAcre} एकड़ धान के लिए ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया और ${mopBags} बोरी पोटाश लगेगी भैया! खाद कैलकुलेटर में हिसाब सेट कर दिया है।`,
        textCg: `${extractedAcre} एकड़ धान बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${mopBags} बोरी पोटाश लगही संगी! चल कैलकुलेटर म पूरा हिसाब सेट कर दे हंव!`,
        route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
        action: { type: 'AUTO_CALC_FERTILIZER', acre: extractedAcre, crop: 'paddy' },
        needsClarification: false,
        extractedAcre,
        confidence: 0.98,
      };
    } else {
      setKakaSession('ASK_ACRES', 'paddy');
      return {
        textHi: 'धान में खाद के लिए आपका खेत कितने एकड़ है भैया? अपना रकबा बताएं — 1 एकड़, 2 एकड़ या ढाई एकड़?',
        textCg: 'धान म खाद बर कतका एकड़ खेत हे संगी? अपन रकबा बताव — 1 एकड़, 2 एकड़ या ढाई एकड़?',
        route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
        action: { type: 'ASK_ACRES', crop: 'paddy' },
        needsClarification: true,
        extractedAcre: null,
        confidence: 0.95,
      };
    }
  }

  // 2. Pest & Disease Intents (Mahu, Blast/Yellowing, Stem Borer)
  const mahuTriggers = ['माहू', 'माहुर', 'माहूर', 'bph', 'चेपा', 'भूरा माहू', 'हरा माहू', 'रस चूसक', 'mahu', 'mahur', 'chepa'];
  if (mahuTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    return {
      textHi: 'सावधान किसान भाई! धान में माहू का प्रकोप है तो खेत का पानी तुरंत निकालें। तने के पास 120 ग्राम पाइमेट्रोजिन या इमिडाक्लोप्रिड का छिड़काव करें।',
      textCg: 'अरे भइया! धान म माहू लग गे हे त खेत के पानी ला तुरते निकालव! 120 ग्राम पाइमेट्रोजिन या इमिडाक्लोप्रिड के स्प्रे सीधे तना तीर करव। चल दवाई देखाथंव!',
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'bph', disease: 'माहू (BPH)' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  const blastTriggers = ['पीला', 'पियरिया', 'पीलापन', 'झुलसा', 'ब्लास्ट', 'केंचुली', 'शीथ ब्लाइट', 'खैरा', 'पाना पीयर', 'peela', 'peeli', 'jhulsa', 'blast', 'khaira'];
  if (blastTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'पत्तियां पीली पड़ रही हैं तो जिंक की कमी से खैरा या फफूंद का झुलसा हो सकता है। 5 किलो जिंक सल्फेट या ट्राइसाइक्लाजोल 120 ग्राम प्रति एकड़ छिड़कें।',
      textCg: 'का कहिथस, पाना पीयर परत हे? खैरा रोग बर जिंक सल्फेट अउ झुलसा बर ट्राइसाइक्लाजोल 120 ग्राम प्रति एकड़ छिड़कव संगी!',
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'spot', disease: 'झुलसा / खैरा' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  const stemBorerTriggers = ['तना छेदक', 'गाभा छेदक', 'इल्ली', 'सुंडी', 'कीड़ा', 'कीरा', 'पत्ता लपेटक', 'tana chhedak', 'illi', 'sundi', 'kida'];
  if (stemBorerTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'तना छेदक और इल्ली के नियंत्रण हेतु कारटाप हाइड्रोक्लोराइड 4G दानेदार या कोराजन 60ml प्रति एकड़ का छिड़काव करें।',
      textCg: 'गाभा छेदक कीरा तना ला भीतर ले काट देथे! कारटाप हाइड्रोक्लोराइड दानेदार या कोराजन के छिड़काव करव। चल दवाई देखाथंव!',
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'stemborer', disease: 'तना छेदक' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  // 3. Mandi & Dhan 3100 Intent
  const mandiTriggers = ['3100', '३१००', 'समर्थन मूल्य', 'msp', 'धान खरीदी', 'कृषक उन्नति', 'रेट', 'धान का भाव', 'धान के रेट', 'भाव', 'dhan', 'bhav', 'bhaav', 'rate', 'price', 'dam', 'daam', 'mandi', 'paisa'];
  if (mandiTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'छत्तीसगढ़ में कृषक उन्नति योजना अंतर्गत धान ₹3,100 प्रति क्विंटल की दर से 21 क्विंटल प्रति एकड़ खरीदा जाता है। पूरा मंडी भाव खोल रहे हैं।',
      textCg: 'हव बेटा! छत्तीसगढ़ म धान के भाव ₹3,100 प्रति क्विंटल हे, प्रति एकड़ 21 क्विंटल खरीदी होथे। चल तोर काका पूरा मंडी भाव देखावत हे!',
      route: { target: 'mandi', type: 'tab', label: 'मंडी भाव' },
      action: { type: 'SHOW_MANDI' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  // 4. Weather & Rain Intent
  const weatherTriggers = ['मौसम', 'बारिश', 'पानी गिरही', 'पानी गिरेगा', 'हवा', 'धूप', 'घाम', 'बादल', 'मावठा', 'mausam', 'mosam', 'barish', 'baarish', 'rain', 'weather', 'pani'];
  if (weatherTriggers.some((t) => clean.includes(t))) {
    const condText = context?.weather ? (isChhattisgarhi ? (context.weather.conditionTextCg || context.weather.conditionText) : context.weather.conditionText) : 'साफ मौसम';
    const distText = context?.selectedDistrict || 'रायपुर';
    return {
      textHi: `आज ${distText} में मौसम ${condText} है भैया! बारिश या 15 किमी से तेज हवा में यूरिया और कीटनाशक का छिड़काव न करें। मौसम डैशबोर्ड खोल रहे हैं।`,
      textCg: `आज ${distText} म मौसम ${condText} हे संगी! पानी अउ तेज हवा म यूरिया अउ कीटनाशक के छिड़काव रोक देवव ताकि दवाई बोहा झन जाय। चल मौसम देखाथंव!`,
      route: { target: 'home', type: 'tab', label: 'मौसम डैशबोर्ड' },
      action: { type: 'SHOW_WEATHER' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  // 5. Motor / Pump Intent (Ask-Before confirmation)
  const motorTriggers = ['मोटर', 'बोरवेल', 'पंप', 'ट्यूबवेल', 'पानी चलाना', 'starter', 'motor', 'motar', 'pump', 'borwell', 'borewell'];
  if (motorTriggers.some((t) => clean.includes(t))) {
    setKakaSession('ASK_MOTOR');
    return {
      textHi: 'क्या बोरवेल मोटर चालू करने का संदेश भेजें भैया? खेत का स्टार्टर नियंत्रित करने हेतु मोटर कंट्रोलर खोल रहे हैं।',
      textCg: 'का बोरवेल मोटर चालू करे के SMS आदेश भेजंव संगी? घर बैठे ट्यूबवेल चलाए बर मोटर कंट्रोलर खोलत हंव!',
      route: { target: 'motor', type: 'modal', label: 'मोटर कंट्रोलर' },
      action: { type: 'ASK_MOTOR' },
      needsClarification: true,
      extractedAcre,
      confidence: 0.95,
    };
  }

  // 6. Token Tuhar Hath Intent
  const tokenTriggers = ['टोकन', 'तुंहर हाथ', 'टोकन कब', 'टोकन कैसे', 'सोसायटी टोकन', 'धान बेचना', 'token', 'tuhar hath', 'parchi', 'slot'];
  if (tokenTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'टोकन तुंहर हाथ ऐप से धान उपार्जन केंद्र का स्लॉट 7 दिन पूर्व बुक करें। धान को 17 प्रतिशत नमी मानक पर सुखाकर लाएं। टोकन गाइड खोल रहे हैं।',
      textCg: 'टोकन तुंहर हाथ ले धान बेचे के टोकन 7 दिन पहिले बुक करे सकथव। धान ला 17% नमी तक सुखा के ले जाना हे। चल टोकन गाइड देखाथंव!',
      route: { target: 'token', type: 'modal', label: 'टोकन तुंहर हाथ' },
      action: { type: 'OPEN_MODAL', modal: 'token' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.95,
    };
  }

  // 7. Rabi Crops Intent
  const rabiTriggers = ['चना', 'गेहूं', 'सरसों', 'रबी', 'उतेरा', 'पैरा', 'पराली', 'पैर', 'पेरा', 'chana', 'gehu', 'sarson', 'rabi'];
  if (rabiTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    return {
      textHi: 'धान कटाई के बाद पराली खेत में न जलाएं। रबी दलहन चना JG-11 व सरसों की बुआई पूर्व ट्राइकोडर्मा व राइजोबियम से बीजोपचार अवश्य करें।',
      textCg: 'धान कटाई बाद पैरा झन जलाव—रोटावेटर ले माटी म मिलाव! रबी चना JG-11 या राधे लगावत हव त ट्राइकोडर्मा ले बीजोपचार जरूर करव।',
      route: { target: 'schemes', type: 'tab', label: 'रबी योजना' },
      action: { type: 'AUTO_CALC_FERTILIZER', crop: 'chana' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.94,
    };
  }

  // 8. Mera Khet / Diary Intent
  const khetTriggers = ['मेरा खेत', 'अपन खेत', 'डायरी', 'खर्चा', 'हिसाब', 'आमदनी', 'plot', 'khet', 'diary'];
  if (khetTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    return {
      textHi: 'फसल की बुआई तारीख, खाद का खर्च और लाभ-हानि का हिसाब रखने हेतु मेरा खेत डायरी खोल रहे हैं।',
      textCg: 'अपन खेत के बुआई तारीख, खाद के खर्च अउ आमदनी के हिसाब रखना हे? चल मेरा खेत डायरी खोलथंव!',
      route: { target: 'khet', type: 'modal', label: 'मेरा खेत' },
      action: { type: 'OPEN_MODAL', modal: 'khet' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.94,
    };
  }

  // 9. Helpline & Support Intent (Clear Distinction between Agri Call Center vs App Tech Support)
  const appIssueTriggers = ['ऐप नहीं चल रहा', 'ऐप में समस्या', 'ऐप की समस्या', 'ऐप खराब', 'लॉगिन नहीं', 'ऐप बंद', 'app problem', 'app issue', 'app not working', 'login problem'];
  if (appIssueTriggers.some((t) => clean.includes(t))) {
    const email = appConfig.supportEmail || 'support@init65.co.in';
    return {
      textHi: `भैया, किसान साथी ऐप में किसी तकनीकी समस्या या खराबी हेतु हमारी सहायता ईमेल ${email} पर लिखें। ध्यान रखें—1800-180-1551 कृषि विभाग का सरकारी कॉल सेंटर है, वो केवल फसल व खेती की सलाह देते हैं, ऐप की नहीं!`,
      textCg: `संगी, किसान साथी ऐप म कोनो तकनीकी खराबी बर हमर सपोर्ट ईमेल ${email} म लिखव। चेत रखव—1800-180-1551 कृषि विभाग के सरकारी कॉल सेंटर हे, वो केवल खेती-किसानी के सलाह देथे, ऐप के नोहय!`,
      route: null,
      action: null,
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  const supportTriggers = ['हेल्पलाइन', 'सहायता', 'सपोर्ट', 'संपर्क', 'कॉल सेंटर', 'फोन नंबर', 'ईमेल', 'शिकायत', 'मदद', 'help', 'support', 'contact', 'email', 'helpline', 'phone', 'mail'];
  if (supportTriggers.some((t) => clean.includes(t))) {
    const email = appConfig.supportEmail || 'support@init65.co.in';
    const phone = appConfig.helpline?.label || '1800-180-1551';
    return {
      textHi: `खेती-किसानी और फसल सलाह के लिए कृषि विभाग के किसान कॉल सेंटर ${phone} पर फोन करें। और यदि किसान साथी ऐप में कोई तकनीकी समस्या या सुझाव हो, तो हमारी ऐप सहायता ईमेल ${email} पर लिखें!`,
      textCg: `खेती-किसानी अउ फसल के सलाह बर कृषि विभाग के किसान कॉल सेंटर ${phone} म फोन लगाव संगी। अउ अगर किसान साथी ऐप म कोनो तकनीकी समस्या या सुझाव हे, त हमर ईमेल ${email} म लिखव!`,
      route: null,
      action: null,
      needsClarification: false,
      extractedAcre,
      confidence: 0.95,
    };
  }

  // 10. FAQ & Common Questions Intent (Zero-Paperwork, Offline, FAQs Modal)
  const zeroPaperworkTriggers = ['खसरा', 'कागजात', 'जमीन का कागज', 'ऋण पुस्तिका', 'पट्टा', 'khasra', 'kagaj', 'paper', 'b1'];
  if (zeroPaperworkTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'बिल्कुल नहीं भैया! किसान साथी 100% सुरक्षित और कागजात-मुक्त ऐप है। इसमें कोई खसरा नंबर या जमीन के सरकारी कागज नहीं देने होते। अक्सर पूछे जाने वाले सवाल खोल रहे हैं!',
      textCg: 'बिलुकुल नोहय संगी! किसान साथी 100% सुरक्षित अउ कागजात-मुक्त हे। कोनो खसरा नंबर या जमीन के कागजात नई लगे। अक्सर पूछे जाने वाले सवाल खोलत हंव!',
      route: { target: 'faq', type: 'modal', label: 'अक्सर पूछे जाने वाले सवाल' },
      action: { type: 'OPEN_FAQ' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  const offlineTriggers = ['बिना इंटरनेट', 'नेटवर्क नहीं', 'ऑफलाइन चलेगा', 'offline', 'bina internet'];
  if (offlineTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'हाँ भैया! खाद कैलकुलेटर, मेड़ नाप GPS, फसल डायरी और मौसम डेटा बिना इंटरनेट के भी 100% काम करता है। अक्सर पूछे जाने वाले सवाल खोल रहे हैं!',
      textCg: 'हव संगी! खाद कैलकुलेटर, मेड़ नाप GPS, डायरी अउ मौसम बिना इंटरनेट के घलो 100% काम करथे। अक्सर पूछे जाने वाले सवाल खोलत हंव!',
      route: { target: 'faq', type: 'modal', label: 'अक्सर पूछे जाने वाले सवाल' },
      action: { type: 'OPEN_FAQ' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.96,
    };
  }

  const faqTriggers = ['faq', 'faqs', 'सवाल', 'प्रश्न', 'शंका', 'पूछे जाने वाले', 'sawal', 'prashna', 'question'];
  if (faqTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'किसान भाई, अक्सर पूछे जाने वाले सवालों (FAQs) का पूरा संग्रह खोल रहे हैं। आप किसी भी सवाल को छूकर मेरी आवाज़ में भी उत्तर सुन सकते हैं!',
      textCg: 'संगी, अक्सर पूछे जाने वाले सवाल (FAQs) खोलत हंव। कोनो भी सवाल ला छूके मोर आवाज़ म घलो उत्तर सुन सकथव!',
      route: { target: 'faq', type: 'modal', label: 'अक्सर पूछे जाने वाले सवाल' },
      action: { type: 'OPEN_FAQ' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.95,
    };
  }

  // 11. Persona & Greetings
  const greetingTriggers = ['काका', 'बहिरा काका', 'जय जोहार', 'नमस्ते', 'प्रणाम', 'राम राम', 'कइसे हस', 'कैसे हो', 'kaka', 'bhaira', 'johar', 'jay johar', 'ram ram', 'namaste', 'hello', 'hi', 'kaise ho'];
  if (greetingTriggers.some((t) => clean.includes(t))) {
    return {
      textHi: 'जय जोहार किसान भाई! मैं आपका बहिरा काका हूँ। थोड़ा ज़ोर से बोलिए—धान का भाव जानना है, खाद का हिसाब, या खेत में कोई बीमारी लगी है?',
      textCg: 'जय जोहार संगी! मैं तोर बहिरा काका हंव। कान म थोड़ा कम सुनाई देथे बाक़ी किसानी के सब बात जानथंव! बोल, खेत म का समस्या हे?',
      route: null,
      action: null,
      needsClarification: false,
      extractedAcre,
      confidence: 0.95,
    };
  }

  // 10. Direct Acreage-only input (e.g. farmer says "2.5 एकड़" or "ढाई एकड़")
  if (extractedAcre) {
    const dapBags = Math.max(1, Math.round(extractedAcre * 1.0));
    const ureaBags = Math.max(1, Math.round((extractedAcre * 100) / 45));
    const mopBags = Math.max(1, Math.round(extractedAcre * 0.6));
    return {
      textHi: `खेत का रकबा ${extractedAcre} एकड़ सेट हो गया। धान हेतु ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया और ${mopBags} बोरी पोटाश लगेगी।`,
      textCg: `तोर खेत के रकबा ${extractedAcre} एकड़ सेट होगे! धान बर ${dapBags} बोरी DAP, ${ureaBags} बोरी यूरिया अउ ${mopBags} बोरी पोटाश लगही संगी!`,
      route: { target: 'schemes', type: 'tab', label: 'खाद कैलकुलेटर' },
      action: { type: 'AUTO_CALC_FERTILIZER', acre: extractedAcre, crop: 'paddy' },
      needsClarification: false,
      extractedAcre,
      confidence: 0.92,
    };
  }

  // 11. Fallback: Warm Bhaira Kaka hard-of-hearing persona
  return {
    textHi: 'काका समझ नहीं पाए। थोड़ा ज़ोर से बोलिए—धान के भाव, खाद की बोरी या फसल में लगी बीमारी के बारे में पूछ रहे हैं?',
    textCg: 'अरे भइया, तोला पता हे न मैं थोड़ा बहिरा हंव! थोड़ा जोर ले बोलव — धान के भाव जानना हे, खाद के हिसाब, कि कोनो दवाई?',
    route: null,
    action: null,
    needsClarification: false,
    extractedAcre: null,
    confidence: 0.3,
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

