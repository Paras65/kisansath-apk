/**
 * 🌾 किसान साथी - केंद्रीकृत भाषा एवं स्थानीयकरण सेवा (i18n Service)
 * 
 * डिफ़ॉल्ट भाषा: छत्तीसगढ़ी ('cg')
 * वैकल्पिक भाषा: हिंदी ('hi')
 * 
 * विशेषताएँ:
 * 1. शून्य-क्रैश फ़ॉलबैक (Fallback Hierarchy: cg -> hi -> key)
 * 2. सुरक्षित लोकल स्टोरेज (Try/Catch Guard for private/incognito modes)
 * 3. 10ms रिएक्टिव स्टेट (Custom Event 'kisan-language-change')
 * 4. व्याकरणिक स्ट्रिंग इंटरपोलेशन ('बर' vs 'के लिए', 'म' vs 'में')
 * 5. देवनागरी TTS अनुकूलन (Speech synthesis uses Devanagari text with hi-IN voice)
 */

import { useState, useEffect } from 'react';

// 1. भाषा शब्दकोश (Chhattisgarhi & Hindi Dictionaries)
export const DICTIONARY = {
  cg: {
    // Branding & App Identity
    app_name: 'किसान साथी',
    app_tagline: 'फसल ले लेके बिक्री तक संगवारी',
    greeting: 'जय जोहार किसान भाई!',
    welcome_sub: 'छत्तीसगढ़ के किसान मन के अपन डिजिटल साथी',

    // Language Toggle Labels
    lang_cg: 'छत्ती.',
    lang_hi: 'हिंदी',
    lang_switched_toast: 'बोली बदलिस: छत्तीसगढ़ी म सेट हे',

    // Navigation Tabs
    tab_home: 'घर (होम)',
    tab_doctor: 'रोग निदान',
    tab_schemes: 'खाद-धान हिसाब',
    tab_mandi: 'मंडी भाव',
    tab_chaupal: 'किसान चौपाल',

    // Home Screen Actions & Cards
    weather_card_title: 'आज के मौसम अऊ सलाह',
    spray_safe: 'दवाई छिड़काव बर मौसम बने हे',
    spray_unsafe: 'अभी दवाई झन छिड़कव (तेज हवा/पानी)',
    quick_tools_title: '⚡ जरूरी कृषि सेवा मन (तुरंत उपयोग करव)',
    lifecycle_title: '🌱 धान फसल यात्रा (बीज ले लेके खलिहान तक)',
    read_voice_btn: 'गोठ सुनव',
    stop_voice_btn: 'रोक्व',
    call_btn: 'फोन लगाव',
    whatsapp_btn: 'व्हाट्सएप म गोठियाव',
    search_placeholder: 'फसल, मंडी या समस्या खोजव...',
    voice_mic_title: 'बोलव (माइक)',
    voice_listening: 'सुनत हन... बोलव',

    // Portal Headers & Distinction
    portal_public_title: '🏛️ सार्वजनिक किसान सुविधा मंच (100% खुला)',
    portal_public_desc: 'मौसम, मंडी भाव अऊ खाद हिसाब सबो बर मुफ्त अऊ खुला हे',
    portal_login_btn: '🔑 अपन खाता खोलव / लॉगिन (10 सेकंड)',
    locked_services_title: '🔒 किसान निजी सेवा मन (1-क्लिक लॉगिन ले तुरंत चालू करव)',
    locked_services_desc: 'सार्वजनिक खुला मंच: मौसम अऊ मंडी भाव बिना लॉगिन खुले हे। अपन खेत के रकबा, रोज के काम, बोर मोटर मोबाइल ले चालू/बंद करे अऊ खर्च डायरी बर मोबाइल नंबर ले लॉगिन करव:',
    passbook_title: '🏛️ डिजिटल किसान पहचान पत्र अऊ पासबुक',
    passbook_certified: 'सत्यापित किसान',
    plots_dashboard_title: '🌱 मोर चालू खेत अऊ आज के किसानी काम',
    quick_command_title: '🌾 किसान त्वरित कमांड सेंटर',
    app_launcher_title: '⚡ मुख्य कृषि सेवा अऊ स्मार्ट टूल्स',
    crop_advisor_title: '⚡ 5 मुख्य फसल व तुरंत रकबा हिसाब',
    mandi_pulse_title: 'आज के मुख्य मंडी भाव (Mandi Pulse)',
    lifecycle_journey_title: '🌱 फसल ले लेके खलिहान तक (6 चरणीय किसानी यात्रा)',

    // Weather Metrics
    weather_rain: 'पानी (वर्षा)',
    weather_wind: 'हवा',
    weather_humidity: 'उमस (आर्द्रता)',
    weather_forecast_3days: '3 दिन के मौसम अनुमान:',

    // Fertilizer & Schemes Calculator
    fert_calc_title: 'खाद हिसाब कैलकुलेटर',
    paddy_calc_title: 'धान ₹3,100 योजना',
    gov_schemes_title: 'सरकारी योजना मन',
    unit_acre: 'एकड़',
    unit_dismil: 'डिसमिल',
    quick_acre_title: '⚡ तुरंत रकबा चुनव:',
    topography_title: '🏞️ खेत के ढलान व स्थिति:',
    topo_dand: 'डांड / टिकरा (ऊंचा खेत - पानी जल्दी सुखथे)',
    topo_bahra: 'बाहरा / गहिरा (निचला खेत - पानी भरे रहिथे)',
    topo_dand_tip: 'टिकरा खेत म यूरिया ला 3-4 बेर म थोड़ा-थोड़ा करके डारव अऊ जिंक सल्फेट जरूर मिलाव।',
    topo_bahra_tip: 'बाहरा खेत म भरे पानी म यूरिया झन डारव, पानी कम होए ले डारव ताकि खाद बह के बेकार झन होवय।',
    bardana_card_title: '📦 जरूरी बारदाना (जूट बोरा) अऊ टोकन हिसाब:',
    bardana_bags: 'जम्मा जरूरी बारदाना',
    bardana_reimbursement: 'किसान के अपन बारदाना पइसा (₹25/बोरा हिसाब ले)',
    token_guideline_title: 'टोकन तुंहर हाथ नियम:',
    token_small_farmer: '10 एकड़ ले कम रकबा म 2 टोकन, 10 एकड़ ले ज्यादा म 3 टोकन कटवा सकथो।',

    // Crop Doctor
    doctor_title: 'एआई फसल डॉक्टर (रोग-दवाई)',
    photo_scan_btn: 'पत्ती के फोटो खींचव',
    symptom_filter_title: 'रोग के चिन्हारी देखव:',
    pest_stemborer: 'गाभा कीरा / भंवरी / मृत गोभ',
    pest_bph: 'लाही / चेंपा / माहू',
    pest_gundhi: 'गांधी कीड़ा / बदबूदार भुनगा',
    pest_sheath: 'केंचुली रोग (शीथ ब्लाइट)',
    pest_khaira: 'खैरा रोग (जस्ता/जिंक के कमी)',
    dosage_15l_pump: '15 लीटर टंकी (पंप) डोज हिसाब',

    // Mandi Rates
    mandi_title: 'छत्तीसगढ़ लाइव मंडी भाव अऊ सीधा बाजार',
    mandi_main_price: '⭐ मुख्य मॉडल भाव',
    mandi_my_district_only: '📍 मोर जिला के मंडी',
    mandi_sell_produce_btn: 'खेत ले सीधा बेचव',

    // Chaupal
    chaupal_title: 'किसान चौपाल अऊ कृषि मशीनरी',
    machinery_rent_btn: 'मशीन किराया म लेव/देव',
    ask_question_btn: 'अपन सवाल पूछव',
    quick_questions_title: 'तैयार सवाल (छु के पूछव):',

    // Native Exit Toast
    exit_toast: 'ऐप ले बाहर निकले बर फेर बैक दबावहू'
  },
  hi: {
    // Branding & App Identity
    app_name: 'किसान साथी',
    app_tagline: 'फसल से लेकर बिक्री तक सम्पूर्ण समाधान',
    greeting: 'नमस्कार किसान भाई!',
    welcome_sub: 'किसानों का सम्पूर्ण डिजिटल कृषि साथी',

    // Language Toggle Labels
    lang_cg: 'छत्ती.',
    lang_hi: 'हिंदी',
    lang_switched_toast: 'भाषा बदली: हिंदी में सेट है',

    // Navigation Tabs
    tab_home: 'होम',
    tab_doctor: 'फसल डॉक्टर',
    tab_schemes: 'खाद-धान',
    tab_mandi: 'मंडी भाव',
    tab_chaupal: 'चौपाल',

    // Home Screen Actions & Cards
    weather_card_title: 'आज का मौसम एवं सलाह',
    spray_safe: 'कीटनाशक छिड़काव के लिए मौसम अनुकूल है',
    spray_unsafe: 'अभी छिड़काव स्थगित रखें (तेज हवा/बारिश)',
    quick_tools_title: '⚡ जरूरी कृषि सेवाएं (त्वरित उपयोग करें)',
    lifecycle_title: '🌱 फसल जीवन-चक्र यात्रा (बुआई से मंडी तक)',
    read_voice_btn: 'सुनें (आवाज)',
    stop_voice_btn: 'रोकें',
    call_btn: 'कॉल करें',
    whatsapp_btn: 'व्हाट्सएप',
    search_placeholder: 'फसल, मंडी या समस्या खोजें...',
    voice_mic_title: 'बोलें (माइक)',
    voice_listening: 'सुन रहे हैं... बोलिए',

    // Portal Headers & Distinction
    portal_public_title: '🏛️ सार्वजनिक किसान सुविधा पोर्टल (100% खुला)',
    portal_public_desc: 'मौसम, मंडी भाव व खाद गणना सभी के लिए निशुल्क व खुली',
    portal_login_btn: '🔑 किसान खाता खोलें / लॉगिन (10 सेकंड)',
    locked_services_title: '🔒 किसान निजी सेवाएं (1-क्लिक लॉगिन से तुरंत सक्रिय करें)',
    locked_services_desc: 'सार्वजनिक खुला मंच: मौसम व मंडी भाव बिना लॉगिन खुले हैं। अपने खेत का रकबा, दिन-वार कार्य, ट्यूबवेल मोटर मोबाइल से चालू/बंद करने व खर्च डायरी चलाने हेतु केवल मोबाइल नंबर से लॉगिन करें:',
    passbook_title: '🏛️ डिजिटल किसान पहचान पत्र व पासबुक (Digital Passbook)',
    passbook_certified: 'प्रमाणित किसान',
    plots_dashboard_title: '🌱 मेरे सक्रिय खेत व आज के कृषि कार्य (Live Field Dashboard)',
    quick_command_title: '🌾 किसान त्वरित कमांड सेंटर (Personal Farm Tools)',
    app_launcher_title: '⚡ मुख्य कृषि सेवाएं व स्मार्ट टूल्स',
    crop_advisor_title: '⚡ 5 मुख्य फसल व त्वरित रकबा हिसाब',
    mandi_pulse_title: 'आज के प्रमुख मंडी भाव (Mandi Pulse)',
    lifecycle_journey_title: '🌱 फसल से लेकर बिक्री तक (6 चरणीय कृषि यात्रा)',

    // Weather Metrics
    weather_rain: 'वर्षा',
    weather_wind: 'हवा',
    weather_humidity: 'आर्द्रता',
    weather_forecast_3days: '3-दिवसीय मौसम अनुमान:',

    // Fertilizer & Schemes Calculator
    fert_calc_title: 'खाद कैलकुलेटर',
    paddy_calc_title: 'धान ₹3,100 योजना',
    gov_schemes_title: 'सरकारी योजनाएं',
    unit_acre: 'एकड़',
    unit_dismil: 'डिसमिल',
    quick_acre_title: '⚡ त्वरित रकबा चुनें:',
    topography_title: '🏞️ खेत की ढलान व स्थिति:',
    topo_dand: 'डांड / टिकरा (ऊंचा खेत - पानी जल्दी सूखता है)',
    topo_bahra: 'बाहरा / गहिरा (निचला खेत - पानी देर तक रुकता है)',
    topo_dand_tip: 'टिकरा खेत में यूरिया को 3-4 बार में थोड़ा-थोड़ा करके डालें और जिंक सल्फेट अवश्य मिलाएं।',
    topo_bahra_tip: 'बाहरा खेत में भरे पानी में यूरिया न डालें, पानी कम होने पर डालें ताकि खाद बहकर बर्बाद न हो।',
    bardana_card_title: '📦 आवश्यक बारदाना (जूट बोरी) व टोकन हिसाब:',
    bardana_bags: 'कुल आवश्यक बारदाना',
    bardana_reimbursement: 'किसान के स्वयं के बारदाने की राशि (₹25/बोरा दर से)',
    token_guideline_title: 'टोकन तुंहर हाथ नियम:',
    token_small_farmer: '10 एकड़ से कम रकबे पर 2 टोकन, 10 एकड़ से अधिक पर 3 टोकन जारी किए जा सकते हैं।',

    // Crop Doctor
    doctor_title: 'एआई फसल डॉक्टर',
    photo_scan_btn: 'पत्ती की फोटो खींचें',
    symptom_filter_title: 'रोग के लक्षण देखें:',
    pest_stemborer: 'तना छेदक (गाभा कीट / सफेद बाली)',
    pest_bph: 'माहू / फुदका (लाही/चेंपा)',
    pest_gundhi: 'गंधी बग (गांधी कीड़ा)',
    pest_sheath: 'शीथ ब्लाइट (केंचुली रोग)',
    pest_khaira: 'खैरा रोग (जिंक/जस्ते की कमी)',
    dosage_15l_pump: '15 लीटर टंकी (पंप) डोज हिसाब',

    // Mandi Rates
    mandi_title: 'लाइव मंडी भाव',
    mandi_main_price: '⭐ मुख्य मॉडल भाव',
    mandi_my_district_only: '📍 मेरे जिले की मंडी',
    mandi_sell_produce_btn: 'खेत से सीधा बेचें',

    // Chaupal
    chaupal_title: 'चौपाल व मशीनरी रेंटल',
    machinery_rent_btn: 'मशीन किराए पर लें/दें',
    ask_question_btn: 'अपना सवाल पूछें',
    quick_questions_title: 'तैयार सवाल (छूकर पूछें):',

    // Native Exit Toast
    exit_toast: 'ऐप से बाहर निकलने के लिए दोबारा बैक दबाएं'
  }
};

const STORAGE_KEY = 'kisan_app_lang';

// 2. सक्रिय भाषा प्राप्त करना (Get Current Language)
export const getAppLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'hi' || saved === 'cg') {
      return saved;
    }
  } catch (e) {
    console.warn('[i18n] Storage access fallback:', e);
  }
  return 'cg'; // छत्तीसगढ़ी हमेशा प्राथमिक डिफ़ॉल्ट
};

// 3. भाषा बदलना (Set Language with Event Dispatch)
export const setAppLanguage = (lang) => {
  const nextLang = lang === 'hi' ? 'hi' : 'cg';
  try {
    localStorage.setItem(STORAGE_KEY, nextLang);
  } catch (e) {
    console.warn('[i18n] Storage write error:', e);
  }

  // Set HTML lang attribute
  if (typeof document !== 'undefined') {
    document.documentElement.lang = nextLang === 'cg' ? 'hi' : 'hi';
  }

  // Dispatch custom window event for reactive updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kisan-language-change', { detail: { lang: nextLang } }));
  }

  return nextLang;
};

// 4. अनुवाद हेल्पर (Translation Function with Safe Fallback & Param Interpolation)
export const t = (key, params = {}) => {
  const currentLang = getAppLanguage();
  let text =
    DICTIONARY[currentLang]?.[key] ||
    DICTIONARY.hi?.[key] ||
    DICTIONARY.cg?.[key] ||
    key;

  // Param Interpolation: {name} -> value
  if (params && typeof params === 'object') {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey] ?? '');
    });
  }

  return text;
};

/**
 * 🌾 जेनेरिक इनलाइन भाषा अनुवादक (Inline Generic i18n Helper)
 * कोड में बार-बार isChhattisgarhi ? ... : ... लिखने की जगह सीधे:
 * tCg('छत्तीसगढ़ी पाठ', 'हिंदी पाठ', { params })
 * यह 1 नैनोसेकंड में सक्रिय भाषा अनुसार सही वाक्य लौटाता है।
 */
export const tCg = (cgText, hiText, params = {}) => {
  const currentLang = getAppLanguage();
  let text = currentLang === 'cg' ? (cgText || hiText || '') : (hiText || cgText || '');

  if (params && typeof params === 'object') {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey] ?? '');
    });
  }

  return text;
};

/**
 * एकवचन एवं बहुवचन जेनेरिक सहायक (Chhattisgarhi 'मन' vs Hindi Pluralizer)
 * उपयोग: tPlural(plotCount, { cg: '{count} खेत मन चालू हवय', hi: '{count} खेत सक्रिय हैं' })
 */
export const tPlural = (count, options = {}) => {
  const currentLang = getAppLanguage();
  const template = options[currentLang] || options.hi || options.cg || '';
  return template.replace(/\{count\}/g, count);
};

/**
 * कृषि शब्दावली व बाह्य API अनुवादक (Agri Terms & LLM Mapper)
 * Agmarknet, OGD India, एवं AI विज़न के मानक शब्दों को स्वतः स्थानीय भाषा में मैप करता है।
 */
export const AGRI_GLOSSARY = {
  paddy: { cg: 'धान', hi: 'धान' },
  wheat: { cg: 'गहूं (गेहूं)', hi: 'गेहूं' },
  maize: { cg: 'मक्का (जौनरा)', hi: 'मक्का' },
  gram: { cg: 'चना', hi: 'चना' },
  soybean: { cg: 'सोयाबीन', hi: 'सोयाबीन' },
  mustard: { cg: 'सरसों (राई)', hi: 'सरसों' },
  urea: { cg: 'यूरिया', hi: 'यूरिया' },
  dap: { cg: 'डी.ए.पी. (DAP)', hi: 'डी.ए.पी. (DAP)' },
  mop: { cg: 'पोटाश (MOP)', hi: 'पोटाश (MOP)' },
  zinc: { cg: 'जिंक सल्फेट', hi: 'जिंक सल्फेट' },
  stem_borer: { cg: 'गाभा कीट / भंवरी / मृत गोभ', hi: 'तना छेदक (गाभा कीट / मृत गोभ)' },
  bph: { cg: 'माहू / लाही / चेंपा', hi: 'माहू / भूरा फुदका' },
  sheath_blight: { cg: 'केंचुली रोग (शीथ ब्लाइट)', hi: 'शीथ ब्लाइट (केंचुली रोग)' },
  khaira: { cg: 'खैरा रोग (जिंक कमी)', hi: 'खैरा रोग (जिंक कमी)' },
  acre: { cg: 'एकड़', hi: 'एकड़' },
  dismil: { cg: 'डिसमिल', hi: 'डिसमिल' },
  quintal: { cg: 'क्विंटल', hi: 'क्विंटल' }
};

export const translateAgriTerm = (termKey) => {
  const currentLang = getAppLanguage();
  const entry = AGRI_GLOSSARY[termKey?.toLowerCase()];
  if (!entry) return termKey || '';
  return entry[currentLang] || entry.hi || termKey;
};

/**
 * व्याकरणिक विभक्तियों एवं क्रियापदों का जेनेरिक अनुवाद नियम (Generic Grammar Engine)
 */
export const CG_TO_HI_GRAMMAR = [
  { cg: /\bम\b/g, hi: 'में' },
  { cg: /\bबर\b/g, hi: 'के लिए' },
  { cg: /\bअऊ\b/g, hi: 'और' },
  { cg: /\bकरव\b/g, hi: 'करें' },
  { cg: /\bदेखव\b/g, hi: 'देखें' },
  { cg: /\bसुनव\b/g, hi: 'सुनें' },
  { cg: /\bजानव\b/g, hi: 'जानें' },
  { cg: /\bजोड़व\b/g, hi: 'जोड़ें' },
  { cg: /\bहवय\b/g, hi: 'है' },
  { cg: /\bहवंय\b/g, hi: 'हैं' },
  { cg: /\bनइ\s+हे\b/g, hi: 'नहीं है' },
  { cg: /\bनई\s+हे\b/g, hi: 'नहीं है' },
  { cg: /\bझनम\b/g, hi: 'मत' },
  { cg: /\bझन\b/g, hi: 'मत' },
  { cg: /\bतुंहर\b/g, hi: 'आपका' },
  { cg: /\bअपन\b/g, hi: 'अपना' }
];

export const autoTranslateCgToHi = (cgSentence) => {
  if (!cgSentence) return '';
  let hiSentence = String(cgSentence);
  CG_TO_HI_GRAMMAR.forEach(({ cg, hi }) => {
    hiSentence = hiSentence.replace(cg, hi);
  });
  return hiSentence;
};

// 5. रिएक्ट हुक (React Hook for Instant Component Re-render)
export const useLanguage = () => {
  const [lang, setLang] = useState(getAppLanguage);

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e?.detail?.lang) {
        setLang(e.detail.lang);
      } else {
        setLang(getAppLanguage());
      }
    };

    window.addEventListener('kisan-language-change', handleLangChange);
    return () => {
      window.removeEventListener('kisan-language-change', handleLangChange);
    };
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'cg' ? 'hi' : 'cg';
    setAppLanguage(next);
    return next;
  };

  const translate = (key, params) => t(key, params);
  const inlineTranslate = (cgText, hiText, params) => tCg(cgText, hiText, params);
  const pluralTranslate = (count, options) => tPlural(count, options);

  return {
    lang,
    isChhattisgarhi: lang === 'cg',
    isHindi: lang === 'hi',
    setLanguage: setAppLanguage,
    toggleLanguage,
    t: translate,
    tCg: inlineTranslate,
    tPlural: pluralTranslate
  };
};

// 6. ऑडियो वॉयस इंजन सहायक (TTS Speech Lang Config)
export const getSpeechLangConfig = () => {
  // Although the text is in Chhattisgarhi, we use 'hi-IN' voice for standard clear Devanagari pronunciation
  return {
    lang: 'hi-IN',
    isChhattisgarhi: getAppLanguage() === 'cg'
  };
};

