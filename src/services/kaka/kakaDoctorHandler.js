// किसान साथी - बहिरा काका फसल डॉक्टर हैंडलर (Crop Disease & Pest Diagnosis Engine)
// IGKV Raipur Certified Recommendations & CIBRC Approved Chemical / Bio-Control Dosages

import { resetKakaSession, setKakaSession } from './kakaSessionManager.js';

export const isDiseasePestQuery = (clean) => [
  'दवा', 'दवाई', 'दवाएं', 'कीड़ा', 'कीरा', 'कीट', 'रोग', 'बीमारी', 'स्प्रे', 'छिड़काव',
  'इलाज', 'उपचार', 'कीटनाशक', 'फफूंदनाशक', 'डॉक्टर', 'doctor', 'dawa', 'dawai', 'bimari',
  'keeda', 'keera', 'spray', 'सूख', 'पीला', 'पियरिया', 'झुलसा', 'ब्लास्ट', 'उकठा', 'इल्ली', 'सुंडी',
  'पिल्लू', 'सूंड़ी', 'फंगस', 'सुर्रा', 'जड़ सड़न', 'सड़न', 'मरोड़िया', 'माहू', 'chepa', 'illi'
].some((d) => clean.includes(d));

/**
 * Helper to generate Crop Doctor direct answers across all major Chhattisgarh crops
 * Handles general disease questions, crop-specific outbreaks, approved CIBRC dosages, and AI camera guidance
 */
export const generateCropDoctorDirectAnswer = (crop = 'general', queryEcho = '') => {
  if (crop === 'paddy' || crop === 'dhan') {
    const textHi = 'धान में मुख्य रूप से 3 बीमारियां आती हैं भैया: तने का रस चूसक भूरा माहू (पाइमेट्रोजिन 120 ग्राम), पत्तियों का झुलसा/ब्लास्ट (ट्राइसाइक्लाजोल 120 ग्राम), और तना छेदक इल्ली (कोराजन 60 ml प्रति एकड़)। नीचे दिए विकल्पों से रोग चुनें या फोटो खींचें!';
    const textCg = 'धान म 3 ठन मुख्य बीमारी लगथे संगी: रस चूसक भूरा माहू (पाइमेट्रोजिन दवाई 120g), पाना के झुलसा (ट्राइसाइक्लाजोल दवाई 120g), अऊ गाभा छेदक इल्ली (कोराजन 60 ml प्रति एकड़)। नीचे ले बीमारी चुनव या पाना के फोटो खींचव!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🌾',
        headline: 'धान के प्रमुख रोग, कीट व प्रमाणित दवा',
        headlineCg: 'धान के मुख्य बीमारी अऊ पक्का इलाज',
        queryEcho: queryEcho || 'धान में बीमारी',
        cards: [
          { icon: '🐛', label: 'भूरा माहू (BPH)', value: 'पाइमेट्रोजिन 50% WDG', sub: '120g/एकड़ (15L टंकी: 12g)', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🍂', label: 'झुलसा (Blast)', value: 'ट्राइसाइक्लाजोल 75% WP', sub: '120g/एकड़ • पत्ती धब्बे', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🐛', label: 'तना छेदक (गाभा)', value: 'कोराजन 18.5% SC', sub: '60ml/एकड़ (15L टंकी: 6ml)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'पत्ती की फोटो खींचें', sub: '5 सेकंड में लाइव रोग पहचान', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'दवा का सही माप: 15 लीटर स्प्रे पंप टंकी में 10-15 ग्राम दवा डालें। साफ फोटो खींचने पर AI डॉक्टर तुरंत रोग पकड़ लेता है।',
        advisoryTextCg: '15 लीटर स्प्रे पंप म 10-15 ग्राम दवाई मिलाव। साफ फोटो खींचव त AI डॉक्टर तुरते बीमारी बता दिही!',
        whatsappShareText: `🌾 किसान साथी - धान रोग व दवा परामर्श:\n• भूरा माहू: पाइमेट्रोजिन 120g/एकड़\n• झुलसा/ब्लास्ट: ट्राइसाइक्लाजोल 120g/एकड़\n• तना छेदक: कोराजन 60ml/एकड़\n💧 15L पंप टंकी नाप: 10-15 ग्राम या 6ml`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['माहू की दवा', 'झुलसा रोग दवा', 'तना छेदक दवा', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'bph', disease: 'माहू' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  if (crop === 'chana') {
    const textHi = 'चना (दलहन) में 2 प्रमुख समस्याएं होती हैं भैया: उकठा रोग (Wilt) जिसमें पौधे अचानक सूखते हैं (ट्राइकोडर्मा 1 kg गोबर खाद में), और घांटी छेदक इल्ली (इमामेक्टिन बेंजोएट 5% SG 80 ग्राम प्रति एकड़)।';
    const textCg = 'चना म 2 ठन मुख्य बीमारी होथे संगी: उकठा रोग (Wilt) जेमा पौधा सूखथे (ट्राइकोडर्मा दवाई), अऊ घांटी छेदक इल्ली (इमामेक्टिन बेंजोएट 80g प्रति एकड़)।';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🌱',
        headline: 'चना (दलहन) के प्रमुख रोग व कीटनाशक उपाय',
        headlineCg: 'चना के मुख्य बीमारी अऊ पक्का इलाज',
        queryEcho: queryEcho || 'चना में बीमारी',
        cards: [
          { icon: '🌱', label: 'उकठा रोग (Wilt)', value: 'ट्राइकोडर्मा वीरिडी', sub: '1 kg सड़ी गोबर खाद में मिलाकर डालें', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🐛', label: 'घांटी छेदक इल्ली', value: 'इमामेक्टिन बेंजोएट 5% SG', sub: '80g/एकड़ (15L टंकी: 8g)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🌿', label: 'जैविक नियंत्रण', value: 'नीम तेल 1500 PPM', sub: 'फूल आने से पहले 5ml/L स्प्रे', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'फोटो खींचकर जांचें', sub: 'पत्ती या तने की लाइव जांच', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'उकठा रोग से बचाव हेतु बुआई पूर्व बीजोपचार अनिवार्य है। फूल खिलते समय रासायनिक कीटनाशक छिड़काव से बचें ताकि परागण न रुके।',
        advisoryTextCg: 'उकठा रोग बर बीजोपचार जरूरी हे। फूल खिले बेरा कीटनाशक झन छिड़कव संगी!',
        whatsappShareText: `🌱 किसान साथी - चना रोग व कीट परामर्श:\n• उकठा रोग (Wilt): ट्राइकोडर्मा वीरिडी 1kg/एकड़\n• घांटी छेदक इल्ली: इमामेक्टिन बेंजोएट 80g/एकड़\n• जैविक: नीम तेल 5ml प्रति लीटर`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['उकठा रोग दवा', 'चना इल्ली दवा', 'नीम तेल स्प्रे', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'wilt', disease: 'उकठा रोग' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  if (crop === 'tomato') {
    const textHi = 'टमाटर में मुख्य रूप से अगेती/पछेती झुलसा (कॉपर ऑक्सीक्लोराइड 500g प्रति एकड़), सफेद मक्खी व पर्ण कुंचन मरोड़िया (थायमेथॉक्सम 80g), और फल छेदक इल्ली (कोराजन 60ml) लगती है।';
    const textCg = 'टमाटर म झुलसा रोग बर कॉपर दवाई 500g, सफेद मक्खी बर थायमेथॉक्सम 80g, अऊ फल छेदक कीरा बर कोराजन 60ml छिड़कव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🍅',
        headline: 'टमाटर के प्रमुख रोग व कीटनाशक सलाह',
        headlineCg: 'टमाटर के बीमारी अऊ दवाई सलाह',
        queryEcho: queryEcho || 'टमाटर में बीमारी',
        cards: [
          { icon: '🍂', label: 'झुलसा रोग (Blight)', value: 'कॉपर ऑक्सीक्लोराइड 50% WP', sub: '500g/एकड़ (15L टंकी: 40g)', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🪰', label: 'सफेद मक्खी / मरोड़िया', value: 'थायमेथॉक्सम 25% WG', sub: '80g/एकड़ • पीले स्टिकी ट्रैप', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🐛', label: 'फल छेदक इल्ली', value: 'कोराजन 18.5% SC', sub: '60ml/एकड़ (15L टंकी: 6ml)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'पत्ती की फोटो खींचें', sub: '5 सेकंड में लाइव रोग पहचान', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'पत्तियां मुड़ रही हैं तो रस चूसक सफेद मक्खी का प्रकोप है। पीले स्टिकी ट्रैप (10 प्रति एकड़) लगाएं और थायमेथॉक्सम का छिड़काव करें।',
        advisoryTextCg: 'पाना मुड़त हे त सफेद मक्खी दवाई छिड़कव अऊ पीला स्टिकी ट्रैप लगावव!',
        whatsappShareText: `🍅 किसान साथी - टमाटर रोग नियंत्रण:\n• झुलसा रोग: कॉपर ऑक्सीक्लोराइड 500g/एकड़\n• सफेद मक्खी (मरोड़िया): थायमेथॉक्सम 80g/एकड़\n• फल छेदक: कोराजन 60ml/एकड़`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['टमाटर झुलसा दवा', 'सफेद मक्खी दवा', 'फल छेदक दवा', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'spot', disease: 'झुलसा' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  if (crop === 'wheat') {
    const textHi = 'गेहूं में पत्तियों पर पीली/भूरी धूल (गेरुई/रतुआ रोग) पर प्रोपिकोनाजोल 25% EC 200 ml प्रति एकड़ छिड़कें, और दीमक के लिए सिंचाई जल के साथ क्लोरपायरीफॉस 20% EC 1.5 लीटर दें भैया!';
    const textCg = 'गेहूं म रतुआ रोग बर प्रोपिकोनाजोल 200ml/एकड़ छिड़कव, अऊ दीमक बर क्लोरपायरीफॉस पानी के संग 1.5L देवव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🌾',
        headline: 'गेहूं के प्रमुख रोग व दीमक नियंत्रण',
        headlineCg: 'गेहूं के बीमारी अऊ दीमक रोकथाम',
        queryEcho: queryEcho || 'गेहूं में बीमारी',
        cards: [
          { icon: '🍂', label: 'गेरुई / रतुआ (Rust)', value: 'प्रोपिकोनाजोल 25% EC', sub: '200ml/एकड़ (15L टंकी: 20ml)', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🐜', label: 'दीमक (Termite)', value: 'क्लोरपायरीफॉस 20% EC', sub: '1.5L/एकड़ सिंचाई जल के साथ', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '🌾', label: 'खेत तैयारी', value: 'कच्ची गोबर खाद न डालें', sub: 'सड़ी कम्पोस्ट ही उपयोग करें', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'फोटो खींचकर जांचें', sub: 'पत्ती या तने की लाइव जांच', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'रतुआ रोग हवा से तेजी से फैलता है, लक्षण दिखते ही तुरंत छिड़काव करें। खेत में कच्ची गोबर खाद कभी न डालें।',
        advisoryTextCg: 'रतुआ रोग दिखते ही प्रोपिकोनाजोल छिड़कव, कच्ची गोबर खाद खेत म झन डालव!',
        whatsappShareText: `🌾 किसान साथी - गेहूं रोग नियंत्रण:\n• गेरुई/रतुआ: प्रोपिकोनाजोल 200ml/एकड़\n• दीमक: क्लोरपायरीफॉस 1.5L/एकड़ सिंचाई के साथ`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['गेहूं रतुआ दवा', 'दीमक नियंत्रण', 'माहू नियंत्रण', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'spot', disease: 'रतुआ' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  if (crop === 'soyabean' || crop === 'soybean') {
    const textHi = 'सोयाबीन में पीला मोजेक वायरस (सफेद मक्खी वाहक) हेतु थायमेथॉक्सम 80 ग्राम, और सेमीलूपर व तंबाकू इल्ली हेतु इमामेक्टिन बेंजोएट 80 ग्राम प्रति एकड़ छिड़कें भैया!';
    const textCg = 'सोयाबीन म पीला मोजेक बर थायमेथॉक्सम 80g, अऊ इल्ली बर इमामेक्टिन 80 ग्राम प्रति एकड़ के स्प्रे करव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🌱',
        headline: 'सोयाबीन के प्रमुख रोग व इल्ली नियंत्रण',
        headlineCg: 'सोयाबीन के बीमारी अऊ इल्ली रोकथाम',
        queryEcho: queryEcho || 'सोयाबीन में बीमारी',
        cards: [
          { icon: '🪰', label: 'पीला मोजेक / मक्खी', value: 'थायमेथॉक्सम 25% WG', sub: '80g/एकड़ (15L टंकी: 8g)', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🐛', label: 'सेमीलूपर व तंबाकू इल्ली', value: 'इमामेक्टिन 5% SG', sub: '80g/एकड़ (15L टंकी: 8g)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🍂', label: 'फली झुलसा (Anthracnose)', value: 'टेबुकोनाजोल 25.9% EC', sub: '250ml/एकड़ (15L टंकी: 25ml)', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'पत्ती की फोटो खींचें', sub: '5 सेकंड में लाइव रोग पहचान', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'सफेद मक्खी पीला मोजेक वायरस फैलाती है। खेत में पीले चिपचिपे कार्ड लगाएं और इल्ली का पहला प्रकोप दिखते ही तुरंत छिड़काव करें।',
        advisoryTextCg: 'सफेद मक्खी पीला मोजेक फइलाथे। पियरिया दिखते ही थायमेथॉक्सम दवाई छिड़कव!',
        whatsappShareText: `🌱 किसान साथी - सोयाबीन रोग नियंत्रण:\n• पीला मोजेक/मक्खी: थायमेथॉक्सम 80g/एकड़\n• सेमीलूपर इल्ली: इमामेक्टिन 80g/एकड़\n• फली झुलसा: टेबुकोनाजोल 250ml/एकड़`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['सोयाबीन इल्ली दवा', 'पीला मोजेक दवा', 'झुलसा दवा', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'spot', disease: 'सोयाबीन रोग' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  if (crop === 'maize') {
    const textHi = 'मक्का में फॉल आर्मीवर्म (सैनिक इल्ली) गोभ काटती है, इसके लिए कोराजन 18.5% SC 80 मिली या इमामेक्टिन 80 ग्राम का सीधे गोभ में छिड़काव करें भैया!';
    const textCg = 'मक्का म फॉल आर्मीवर्म इल्ली गोभ ला काटथे! कोराजन 80ml या इमामेक्टिन दवाई के स्प्रे सीधे गोभ म करव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🌽',
        headline: 'मक्का में फॉल आर्मीवर्म व तना छेदक नियंत्रण',
        headlineCg: 'मक्का म सैनिक इल्ली के पक्का रोकथाम',
        queryEcho: queryEcho || 'मक्का में बीमारी',
        cards: [
          { icon: '🐛', label: 'फॉल आर्मीवर्म (सैनिक कीट)', value: 'कोराजन 18.5% SC', sub: '80ml/एकड़ (सीधे गोभ में डालें)', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '💊', label: 'इल्ली स्प्रे विकल्प', value: 'इमामेक्टिन 5% SG', sub: '80g/एकड़ (15L टंकी: 8g)', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '🍂', label: 'पत्ती झुलसा (Blight)', value: 'मैंकोजेब 75% WP', sub: '600g/एकड़ (15L टंकी: 50g)', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'फोटो खींचकर जांचें', sub: 'पत्ती या गोभ की लाइव जांच', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'फॉल आर्मीवर्म कीड़े पौधे की गोभ (Whorl) में छिपकर बैठते हैं। नोजल को सीधे पौधे की गोभ के ऊपर रखकर छिड़काव करें।',
        advisoryTextCg: 'इल्ली गोभ म लुका के रहिथे! दवाई के स्प्रे सीधे गोभ के मुंह म करव!',
        whatsappShareText: `🌽 किसान साथी - मक्का रोग व कीट सलाह:\n• फॉल आर्मीवर्म: कोराजन 80ml या इमामेक्टिन 80g/एकड़\n• पत्ती झुलसा: मैंकोजेब 600g/एकड़\n💧 स्प्रे सीधे गोभ (Whorl) के भीतर करें`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['मक्का इल्ली दवा', 'फॉल आर्मीवर्म दवा', 'पत्ती झुलसा दवा', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'stemborer', disease: 'फॉल आर्मीवर्म' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  if (crop === 'sarson') {
    const textHi = 'सरसों में माहू (चेपा कीट) पत्तियों व फूलों का रस चूसता है, इसके लिए इमिडाक्लोप्रिड 17.8% SL 60 मिली या थायमेथॉक्सम 80 ग्राम प्रति एकड़ छिड़कें!';
    const textCg = 'सरसों म माहू (चेपा) फूल के रस चूसथे! इमिडाक्लोप्रिड 60ml या थायमेथॉक्सम 80 ग्राम के छिड़काव करव संगी!';

    return {
      textHi,
      textCg,
      directAnswer: {
        intent: 'DOCTOR',
        icon: '🌼',
        headline: 'सरसों में माहू (चेपा) व सफेद रतुआ नियंत्रण',
        headlineCg: 'सरसों म माहू अऊ सफेद रतुआ के रोकथाम',
        queryEcho: queryEcho || 'सरसों में बीमारी',
        cards: [
          { icon: '🐛', label: 'माहू / चेपा (Aphids)', value: 'इमिडाक्लोप्रिड 17.8% SL', sub: '60ml/एकड़ (15L टंकी: 6ml)', bg: '#fef2f2', border: '#fecaca', color: '#991b1b' },
          { icon: '🍂', label: 'सफेद रतुआ (White Rust)', value: 'रिडोमिल MZ (मेटालैक्सिल)', sub: '500g/एकड़ (15L टंकी: 40g)', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
          { icon: '💧', label: 'जैविक विकल्प', value: 'नीम तेल 1500 PPM', sub: 'फूल आने से पहले 5ml/L स्प्रे', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
          { icon: '📸', label: 'AI कैमरा जांच', value: 'फोटो खींचकर जांचें', sub: 'पत्ती या तने की लाइव जांच', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        ],
        advisoryText: 'सरसों में बादल छाए रहने या नमी बढ़ने पर माहू का प्रकोप तेजी से फैलता है। फूल आने के समय शाम को ही छिड़काव करें ताकि मधुमक्खियां प्रभावित न हों।',
        advisoryTextCg: 'बादल छाए म माहू जल्दी बाढ़थे। संझा बेरा स्प्रे करव ताकि मउमाखी मन ला नुकसान झन होवय!',
        whatsappShareText: `🌼 किसान साथी - सरसों रोग नियंत्रण:\n• माहू (Aphids): इमिडाक्लोप्रिड 60ml/एकड़\n• सफेद रतुआ: रिडोमिल MZ 500g/एकड़\n• जैविक: नीम तेल 5ml प्रति लीटर`,
        needsClarification: true,
        missingSlot: 'disease',
        slotSuggestions: ['सरसों माहू दवा', 'सफेद रतुआ दवा', 'नीम तेल स्प्रे', '📸 पत्ती की फोटो जांचें'],
        deepLink: { tab: 'doctor', label: 'फसल डॉक्टर में फोटो जांचें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'SHOW_DISEASE', symptom: 'bph', disease: 'सरसों माहू' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.98,
    };
  }

  // General Crop Doctor fallback (when crop is not specified)
  const textHi = 'फसल डॉक्टर में स्वागत है भैया! यदि खेत में कोई रोग या कीड़ा लगा है, तो नीचे से अपनी फसल चुनें — धान, चना, या टमाटर, अथवा रोगग्रस्त पत्ती की फोटो खींचें — तुरंत प्रमाणित दवा व 15 लीटर टंकी का नाप बताएंगे!';
  const textCg = 'फसल डॉक्टर म स्वागत हे संगी! खेत म कोनो बीमारी या कीरा लगे हे त नीचे ले अपन फसल चुनव — धान, चना या टमाटर, या पाना के फोटो खींचव — तुरते पक्की दवाई अऊ 15 लीटर टंकी के नाप बताबो!';

  return {
    textHi,
    textCg,
    directAnswer: {
      intent: 'DOCTOR',
      icon: '🌿',
      headline: 'फसल डॉक्टर: रोग पहचान व प्रमाणित उपचार',
      headlineCg: 'फसल डॉक्टर: बीमारी पहचान अऊ पक्का इलाज',
      queryEcho: queryEcho || 'फसल बीमारी',
      cards: [
        { icon: '🌾', label: 'धान के रोग', value: 'माहू, झुलसा, तना छेदक', sub: 'पाइमेट्रोजिन, ट्राइसाइक्लाजोल दवा', bg: '#f0fdf4', border: '#86efac', color: '#166534' },
        { icon: '🌱', label: 'चना व दलहन', value: 'उकठा व घांटी छेदक इल्ली', sub: 'ट्राइकोडर्मा, इमामेक्टिन दवा', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        { icon: '🍅', label: 'सब्जी फसलें', value: 'झुलसा व सफेद मक्खी', sub: 'कॉपर, थायमेथॉक्सम कीटनाशक', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
        { icon: '📸', label: 'AI कैमरा डॉक्टर', value: 'पत्ती की फोटो खींचें', sub: '5 सेकंड में लाइव रोग पहचान', bg: '#fdf2f8', border: '#fbcfe8', color: '#9d174d' },
      ],
      advisoryText: 'रोग की सटीक पहचान के लिए नीचे "फसल डॉक्टर खोलें" दबाकर मोबाइल कैमरे से पत्ती की साफ फोटो लें। 15 लीटर स्प्रे पंप में हमेशा अनुशंसित मात्रा ही मिलाएं।',
      advisoryTextCg: 'बीमारी के पक्का इलाज बर नीचे "फसल डॉक्टर खोलव" दबाके मोबाइल कैमरा ले पाना के फोटो खींचव! 15 लीटर टंकी म नाप अनुसार दवाई मिलाव।',
      whatsappShareText: `🌿 किसान साथी - फसल डॉक्टर रोग निदान:\n• धान: माहू, झुलसा, तना छेदक\n• चना: उकठा रोग, घांटी छेदक इल्ली\n• टमाटर: झुलसा, सफेद मक्खी\n📸 मोबाइल कैमरे से तुरंत पत्ती जांचें`,
      needsClarification: true,
      missingSlot: 'crop',
      slotSuggestions: ['धान में बीमारी', 'चना में बीमारी', 'टमाटर में बीमारी', 'माहू की दवा', '📸 पत्ती की फोटो जांचें'],
      deepLink: { tab: 'doctor', label: 'फसल डॉक्टर (कैमरा जांच) खोलें' },
    },
    route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
    action: { type: 'SHOW_DISEASE', symptom: 'bph', disease: 'माहू' },
    needsClarification: false,
    extractedAcre: null,
    confidence: 0.98,
  };
};

/**
 * Handles Doctor Follow-up during active multi-turn session
 */
export const handleDoctorFollowup = (clean, transcript) => {
  if (clean.includes('फोटो') || clean.includes('कैमरा') || clean.includes('camera') || clean.includes('photo')) {
    resetKakaSession();
    return {
      textHi: 'फसल डॉक्टर कैमरा खोल रहे हैं भैया! रोगग्रस्त पत्ती की साफ फोटो खींचें, AI तुरंत रोग पहचान लेगा।',
      textCg: 'फसल डॉक्टर कैमरा खोलत हंव संगी! पाना के साफ फोटो खींचव, AI तुरते बीमारी बता दिही!',
      directAnswer: {
        intent: 'DOCTOR_CAMERA',
        icon: '📸',
        headline: 'फसल डॉक्टर AI कैमरा स्कैन',
        headlineCg: 'फसल डॉक्टर कैमरा स्कैन',
        queryEcho: transcript,
        cards: [
          { icon: '📸', label: 'कैमरा स्कैनर', value: 'पत्ती की फोटो लें', sub: '10-15 सेमी पास रखें', bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
          { icon: '☀️', label: 'रोशनी', value: 'दिन का अच्छा प्रकाश', sub: 'छाया से बचें', bg: '#fefce8', border: '#fef08a', color: '#854d0e' },
        ],
        advisoryText: 'कैमरे को रोगग्रस्त पत्ती के 10-15 सेमी पास रखें और स्थिर हाथ से साफ फोटो खींचें।',
        advisoryTextCg: 'कैमरा ला पाना के 10-15 सेमी तीर राखव अउ साफ फोटो खींचव!',
        whatsappShareText: '',
        needsClarification: false,
        missingSlot: null,
        slotSuggestions: [],
        deepLink: { tab: 'doctor', label: 'कैमरा चालू करें' },
      },
      route: { target: 'doctor', type: 'tab', label: 'फसल डॉक्टर' },
      action: { type: 'OPEN_CAMERA' },
      needsClarification: false,
      extractedAcre: null,
      confidence: 0.99,
    };
  }
  if (clean.includes('चना') || clean.includes('chana')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('chana', transcript);
  }
  if (clean.includes('टमाटर') || clean.includes('tamatar')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('tomato', transcript);
  }
  if (clean.includes('गेहूं') || clean.includes('wheat') || clean.includes('gehu')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('wheat', transcript);
  }
  if (clean.includes('धान') || clean.includes('चावल') || clean.includes('dhan')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('paddy', transcript);
  }
  if (clean.includes('सोयाबीन') || clean.includes('soyabean')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('soyabean', transcript);
  }
  if (clean.includes('मक्का') || clean.includes('maize') || clean.includes('makka')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('maize', transcript);
  }
  if (clean.includes('सरसों') || clean.includes('mustard') || clean.includes('sarson') || clean.includes('राई')) {
    resetKakaSession();
    return generateCropDoctorDirectAnswer('sarson', transcript);
  }
  return null;
};

/**
 * Handles all Crop Doctor voice queries & disease pest symptoms
 */
export const handleDoctorIntent = (clean, transcript, extractedAcre) => {
  // 1. माहू / BPH
  const mahuTriggers = ['माहू', 'माहुर', 'माहूर', 'bph', 'चेपा', 'भूरा माहू', 'हरा माहू', 'रस चूसक', 'mahu', 'mahur', 'chepa'];
  if (mahuTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    if (clean.includes('सरसों') || clean.includes('mustard') || clean.includes('राई') || clean.includes('sarson')) {
      return generateCropDoctorDirectAnswer('sarson', transcript);
    }
    if (clean.includes('चना') || clean.includes('chana')) {
      return generateCropDoctorDirectAnswer('chana', transcript);
    }
    if (clean.includes('टमाटर') || clean.includes('tamatar')) {
      return generateCropDoctorDirectAnswer('tomato', transcript);
    }
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

  // 2. ब्लास्ट / झुलसा / खैरा / पीलापन
  const blastTriggers = ['पीला', 'पियरिया', 'पीलापन', 'झुलसा', 'ब्लास्ट', 'केंचुली', 'शीथ ब्लाइट', 'खैरा', 'पाना पीयर', 'peela', 'peeli', 'jhulsa', 'blast', 'khaira'];
  if (blastTriggers.some((t) => clean.includes(t))) {
    resetKakaSession();
    if (clean.includes('टमाटर') || clean.includes('tamatar')) {
      return generateCropDoctorDirectAnswer('tomato', transcript);
    }
    if (clean.includes('सोयाबीन') || clean.includes('soyabean')) {
      return generateCropDoctorDirectAnswer('soyabean', transcript);
    }
    if (clean.includes('मक्का') || clean.includes('maize')) {
      return generateCropDoctorDirectAnswer('maize', transcript);
    }
    if (clean.includes('गेहूं') || clean.includes('wheat') || clean.includes('gehu')) {
      return generateCropDoctorDirectAnswer('wheat', transcript);
    }
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

  // 3. तना छेदक व गाभा कीड़ा
  const stemBorerTriggers = ['तना छेदक', 'गाभा छेदक', 'गाभा कीड़ा', 'पत्ता लपेटक', 'dead heart', 'tana chhedak'];
  const isPaddyStemBorer = stemBorerTriggers.some((t) => clean.includes(t)) ||
    ((clean.includes('धान') || clean.includes('चावल') || clean.includes('dhan')) && (clean.includes('इल्ली') || clean.includes('गाभा') || clean.includes('सुंडी')));
  if (isPaddyStemBorer) {
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

  // 4. गंधी बग (पोच धान)
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

  // 5. उकठा रोग (Fusarium Wilt)
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

  // 6. सफेद मक्खी व पीला मोजेक
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

  // 7. शीथ ब्लाइट (केंचुली रोग)
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

  // 8. दीमक (Termite)
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

  // 9. Comprehensive General Crop Doctor Triggers
  const generalDoctorTriggers = [
    'बीमारी', 'रोग', 'कीड़ा', 'कीरा', 'कीट', 'दवाई', 'दवा', 'दवाएं', 'कीटनाशक', 'फफूंदनाशक',
    'इलाज', 'उपचार', 'फसल खराब', 'पौधा सूख', 'पत्ती खराब', 'पत्ता खराब', 'फसल डॉक्टर', 'डॉक्टर',
    'कृषि डॉक्टर', 'स्प्रे', 'छिड़काव', 'टंकी दवा', 'छिड़कना', 'दवा छिड़कना', 'दवा डालना',
    'कवक', 'फफूंद', 'सड़न', 'पत्ता मरोड़', 'सफेद धब्बा', 'काला धब्बा', 'रस चूसक', 'कीट नियंत्रण',
    'रोकथाम', 'दवा बताओ', 'दवाई बताव', 'दवा क्या है', 'दवाई कौन',
    'इल्ली', 'सुंडी', 'पिल्लू', 'सूंड़ी', 'सेंवड़ा', 'कैटरपिलर', 'caterpillar', 'illi', 'sundi', 'pillu',
    'फंगस', 'fungus', 'सुर्रा', 'जड़ सड़न', 'तना सड़न', 'सड़ रहा', 'गल रहा', 'मुरझा', 'मुरझान', 'धब्बा', 'मरोड़िया', 'माहू',
    'bimari', 'bimaari', 'rog', 'keeda', 'keera', 'kira', 'kitnashak', 'dawai', 'dawa',
    'fasal doctor', 'doctor', 'ilaj', 'spray', 'fasal kharab'
  ];

  if (generalDoctorTriggers.some((t) => clean.includes(t))) {
    if (clean.includes('धान') || clean.includes('चावल') || clean.includes('dhan')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('paddy', transcript);
    }
    if (clean.includes('चना') || clean.includes('chana')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('chana', transcript);
    }
    if (clean.includes('टमाटर') || clean.includes('tamatar') || clean.includes('tomato')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('tomato', transcript);
    }
    if (clean.includes('गेहूं') || clean.includes('wheat') || clean.includes('gehu')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('wheat', transcript);
    }
    if (clean.includes('मक्का') || clean.includes('maize') || clean.includes('makka')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('maize', transcript);
    }
    if (clean.includes('सरसों') || clean.includes('mustard') || clean.includes('sarson')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('sarson', transcript);
    }
    if (clean.includes('सोयाबीन') || clean.includes('soyabean')) {
      resetKakaSession();
      return generateCropDoctorDirectAnswer('soyabean', transcript);
    }

    setKakaSession('DOCTOR');
    return generateCropDoctorDirectAnswer('general', transcript);
  }

  return null;
};

