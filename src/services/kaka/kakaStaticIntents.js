// किसान साथी - बहिra काका स्टैटिक इंटेंट एवं नॉलेज बेस (Static Intents & Rural Fallbacks)
// Token guide, Zero Paperwork FAQs, Solar pumps, KCC loans, Greetings, Motor confirmation, and Agricultural Fallbacks

import { resetKakaSession, setKakaSession } from './kakaSessionManager.js';

/**
 * Knowledge Base of Instant Conversational Agricultural Q&A
 * Carefully calibrated for IGKV Raipur, Chhattisgarh soil, paddy, and weather realities.
 */
export const KAKA_KNOWLEDGE_BASE = [
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
    spokenCg: 'जय जोहार संगी! मैं तोर काका हंव। बताव खेत-खार म का सेवा करंव — धान के भाव, खाद के हिसाब, मौसम कि कोनो बीमारी?',
    spokenHi: 'जय जोहार किसान भाई! मैं आपका काका हूँ। बताइए खेती-किसानी में क्या मदद करूँ — धान का भाव, खाद का हिसाब, मौसम या कोई फसल रोग?',
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

export const getNoSpeechResponse = () => ({
  textHi: 'कोई आवाज़ सुनाई नहीं दी भैया। शांत जगह पर माइक दबाकर दोबारा बोलें।',
  textCg: 'कछु आवाज सुनाई नइ परिस संगी। शांत जगह म माइक दबाके फेर बोलव।',
  directAnswer: {
    intent: 'NO_SPEECH',
    icon: '👂🏻',
    headline: 'आवाज़ सुनाई नहीं दी',
    headlineCg: 'आवाज सुनाई नइ परिस',
    queryEcho: '...',
    cards: [
      { icon: '🎙️', label: 'माइक स्थिति', value: 'आवाज़ नहीं आई', sub: 'शांत जगह पर बोलें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
      { icon: '💡', label: 'सुझाव', value: 'साफ शब्द बोलें', sub: 'जैसे— धान भाव या खाद', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
    ],
    advisoryText: 'माइक ने कोई आवाज़ नहीं पकड़ी। कृपया नीचे दिए गए कृषि सुझावों में से चुनें या दोबारा बोलें:',
    advisoryTextCg: 'माइक म कोनो आवाज नइ आइस। नीचे दिए किसानी सुझाव ला छूव या फेर बोलव:',
    whatsappShareText: '',
    needsClarification: true,
    missingSlot: 'topic',
    slotSuggestions: ['धान ₹3,100 भाव', 'खाद हिसाब', 'टमाटर मंडी भाव', 'आज का मौसम'],
    deepLink: null,
  },
  route: null,
  action: null,
  needsClarification: true,
  extractedAcre: null,
  confidence: 0,
});

export const getZeroAcreResponse = (transcript) => {
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
};

export const handleMotorConfirmation = (clean, transcript) => {
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

  return null;
};

export const handleMotorIntent = (clean, transcript, extractedAcre) => {
  const motorTriggers = ['मोटर', 'बोरवेल', 'पंप', 'ट्यूबवेल', 'पानी चलाना', 'starter', 'motor', 'motar', 'pump', 'borwell', 'borewell'];
  if (motorTriggers.some((t) => clean.includes(t))) {
    // Direct STOP command
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

    // Status inquiry
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

    // Confirmation to START
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
  return null;
};

export const handleTokenIntent = (clean, transcript, extractedAcre) => {
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
  return null;
};

export const handleZeroPaperworkIntent = (clean, transcript, extractedAcre) => {
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
  return null;
};

export const handleSolarIntent = (clean, transcript, extractedAcre) => {
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
  return null;
};

export const handleKccIntent = (clean, transcript, extractedAcre) => {
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
  return null;
};

export const handleGreetingIntent = (clean, transcript, selectedDistrict) => {
  const greetingTriggers = ['काका', 'बहिरा काका', 'जय जोहार', 'नमस्ते', 'प्रणाम', 'राम राम', 'कइसे हस', 'कैसे हो', 'kaka', 'bhaira', 'johar', 'jay johar', 'ram ram', 'namaste', 'hello', 'hi', 'kaise ho'];
  if (greetingTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    const textHi = 'जय जोहार किसान भाई! मैं आपका काका हूँ। बताइए खेत-किसानी में क्या मदद करूँ — धान का भाव, खाद का हिसाब, मौसम या कोई फसल रोग?';
    const textCg = 'जय जोहार संगी! मैं तोर काका हंव। बताव खेत-खार म का सेवा करंव — धान के भाव, खाद के हिसाब, मौसम कि कोनो बीमारी?';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'GREETING',
        icon: '👴🏻',
        headline: 'जय जोहार! बताइए क्या सेवा करूँ',
        headlineCg: 'जय जोहार संगी! बताव का सेवा करंव',
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
  return null;
};

export const getAiExpertPendingResponse = (transcript, topic = 'कृषि AI सलाह') => {
  const textHi = 'काका सलाह निकाल रहे हैं भैया, बस दो सेकंड रुकिए...';
  const textCg = 'काका सलाह खोजत हे संगी, बस दू सेकंड धीरज धरव...';

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'AI_EXPERT_QUERY',
      icon: '👴🏻',
      headline: 'काका सोच रहे हैं... कृषि सलाह',
      headlineCg: 'काका सोचत हे... कृषि सलाह',
      queryEcho: transcript,
      cards: [
        { icon: '🤖', label: 'सलाह माध्यम', value: 'AI कृषि सहायक', sub: 'आधुनिक कृषि तकनीक', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '⏳', label: 'स्थिति', value: 'विश्लेषण जारी...', sub: 'बस 2 सेकंड रुकें', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
      ],
      advisoryText: 'आपके सवाल का सटीक उत्तर तैयार किया जा रहा है...',
      advisoryTextCg: 'तोर सवाल के उत्तर खोजे जावत हे, बस दू सेकंड धीरज धरव...',
      spokenHi: textHi,
      spokenCg: textCg,
      whatsappShareText: '',
      needsClarification: false,
      missingSlot: null,
      slotSuggestions: [],
      deepLink: null,
      needsAiExpert: true,
      isLoadingAiExpert: true,
    },
    route: null,
    action: null,
    needsAiExpert: true,
    confidence: 0.95,
  };
};

export const handleUnknownTopicFallback = (clean, transcript, selectedDistrict) => {
  const words = clean.split(/\s+/).filter(Boolean);
  const isQuestionOrTopic =
    words.length >= 2 ||
    /(?:क्या|कहाँ|कहा|कब|कौन|कइसे|काहे|कैसे|कितना|बताओ|बताव|बोल|सुना|गाना|क्रिकेट|मैच|फिल्म|सिनेमा|न्यूज|समाचार|राजनीति|गाड़ी|दुकान|स्कूल|अस्पताल|दवाखाना|रेलवे|ट्रेन|बस|टिकट|लॉटरी|मोदी|राहुल|मुख्यमंत्री|सरकार)/.test(clean);

  if (isQuestionOrTopic) {
    // If it looks like a genuine question or agricultural topic, consult Gemini AI directly!
    return getAiExpertPendingResponse(transcript);
  }
  return null;
};

export const handleNotUnderstoodFallback = (transcript) => {
  const textHi = 'आपकी बात समझ नहीं आई भैया। कृपया साफ शब्दों में दोबारा बोलें — जैसे "2 एकड़ में धान का पैसा" या "खाद का हिसाब"।';
  const textCg = 'बात समझ म नइ आइस संगी। एक पइत फेर साफ-साफ बोलव — जइसे "2 एकड़ म धान के पइसा" या "खाद के हिसाब"।';

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'NOT_UNDERSTOOD',
      icon: '🤔',
      headline: 'बात समझ नहीं आई — दोबारा बोलें',
      headlineCg: 'बात समझ म नइ आइस — फेर बोलव',
      queryEcho: transcript,
      cards: [
        { icon: '🌾', label: 'धान भाव', value: '₹3,100 / क्विंटल', sub: 'समर्थन मूल्य खरीदी', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '🧮', label: 'खाद हिसाब', value: 'DAP + यूरिया', sub: 'एकड़ अनुसार गणना', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
      ],
      advisoryText: 'कृपया साफ शब्दों में फसल या विषय का नाम बोलें, अथवा नीचे दिए गए विकल्पों को छुएं:',
      advisoryTextCg: 'साफ शब्द म फसल या विषय बताव संगी, या नीचे दिए विकल्प ला छूव:',
      whatsappShareText: '',
      needsClarification: true,
      missingSlot: 'topic',
      slotSuggestions: ['2 एकड़ धान का पैसा', '1 एकड़ खाद हिसाब', 'टमाटर मंडी रेट', 'धान में माहू रोग'],
      deepLink: null,
    },
    route: null,
    action: null,
    needsClarification: false,
    extractedAcre: null,
    confidence: 0.3,
  };
};

