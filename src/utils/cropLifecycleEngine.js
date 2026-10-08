// किसान साथी - Crop Lifecycle & Dynamic Weather Advisory Engine
// Pure DRY utility for multi-plot A to Z tracking, stage progression and weather overrides.

export const CROP_LIFECYCLE_RULES = {
  paddy: {
    name: 'धान (Paddy)',
    totalDays: 135,
    avgYieldPerAcre: 22, // क्विंटल / एकड़
    marketRatePerQuintal: 3100, // ₹ / क्विंटल (कृषक उन्नति योजना)
    stages: [
      {
        minDay: 0,
        maxDay: 20,
        stageName: 'अंकुरण व रोपाई स्थापना (Basal & Establishment)',
        statusColor: '#8d6e63',
        task: 'बुआई/रोपाई के समय पूरी DAP (50 किग्रा) और पोटाश (20 किग्रा) प्रति एकड़ डालें। जिंक अलग से छिड़कें।',
        warning: 'खेत में पानी का स्तर 2 सेमी से अधिक न रखें ताकि नई जड़ें अच्छी तरह जम सकें।',
      },
      {
        minDay: 21,
        maxDay: 40,
        stageName: 'कल्ले फूटने की अवस्था (Tillering Stage)',
        statusColor: '#2e7d32',
        task: 'प्रथम टॉप ड्रेसिंग: 45 किग्रा यूरिया प्रति एकड़ डालें। खरपतवार नियंत्रण (निंदाई-गुड़ाई) करें।',
        warning: 'तना छेदक (डेड हार्ट) के लिए खेत की निगरानी करें। फेरोमोन ट्रैप लगाएं।',
      },
      {
        minDay: 41,
        maxDay: 65,
        stageName: 'गाभा व बालियां बनना (Panicle Initiation)',
        statusColor: '#00796b',
        task: 'द्वितीय टॉप ड्रेसिंग: 30 किग्रा यूरिया + 10 किग्रा पोटाश प्रति एकड़ डालें। 3-5 सेमी पानी बनाए रखें।',
        warning: 'भूरा माहू (BPH) और शीथ ब्लाइट का सबसे संवेदनशील समय। तने के निचले हिस्से की जांच करें।',
      },
      {
        minDay: 66,
        maxDay: 95,
        stageName: 'दूधिया अवस्था व दाना भराव (Milk & Dough Stage)',
        statusColor: '#f57f17',
        task: 'दाना भराव के समय खेत में नमी बनाए रखें। बालियों पर गंधी बग कीट दिखे तो नीम अर्क छिड़कें।',
        warning: 'दाना पकने के 10 दिन पहले खेत से पानी निकाल दें ताकि कटाई में आसानी हो।',
      },
      {
        minDay: 96,
        maxDay: 160,
        stageName: 'परिपक्वता व कटाई (Ripening & Harvest)',
        statusColor: '#c62828',
        task: 'जब 85-90% बालियां सुनहरी हो जाएं, तब कटाई करें। 14-17% नमी पर धूप में सुखाएं।',
        warning: 'टोकन तुंहर हाथ ऐप से टोकन काटकर ₹3,100 के भाव से समिति में धान बेचें।',
      },
    ],
  },
  wheat: {
    name: 'गेहूं (Wheat)',
    totalDays: 120,
    avgYieldPerAcre: 20,
    marketRatePerQuintal: 2425,
    stages: [
      {
        minDay: 0,
        maxDay: 20,
        stageName: 'अंकुरण व सीआरआई (Crown Root Stage)',
        statusColor: '#8d6e63',
        task: 'बुआई के 21वें दिन पहली आवश्यक सिंचाई (CRI अवस्था) करें। इसके बिना कल्ले कम निकलते हैं।',
        warning: 'सिंचाई के 2-3 दिन बाद पैर जमने पर 35 किग्रा यूरिया का भुरकाव करें।',
      },
      {
        minDay: 21,
        maxDay: 50,
        stageName: 'कल्ले फूटना व गांठ बनना (Jointing Stage)',
        statusColor: '#2e7d32',
        task: 'दूसरी सिंचाई (बुआई के 40-45 दिन बाद) करें और बची हुई 30 किग्रा यूरिया डालें।',
        warning: 'चौड़ी पत्ती वाले खरपतवार (बथुआ) की रोकथाम करें।',
      },
      {
        minDay: 51,
        maxDay: 85,
        stageName: 'बालियां निकलना व फूल आना (Heading & Flowering)',
        statusColor: '#00796b',
        task: 'तीसरी व चौथी सिंचाई करें। दाना बनते समय पानी की कमी न होने दें।',
        warning: 'पीला रतुआ (Yellow Rust) के लक्षणों पर नजर रखें।',
      },
      {
        minDay: 86,
        maxDay: 140,
        stageName: 'दाना पकना व कटाई (Maturity & Harvest)',
        statusColor: '#f57f17',
        task: 'दाना कड़ा होने पर कंबाइन या रीपर से कटाई करें और सुरक्षित भंडारण करें।',
        warning: 'कटाई उपरांत नजदीकी मंडी में MSP पर बिक्री करें।',
      },
    ],
  },
  chana: {
    name: 'चना (Chickpea - दलहन)',
    totalDays: 110,
    avgYieldPerAcre: 10,
    marketRatePerQuintal: 5440,
    stages: [
      {
        minDay: 0,
        maxDay: 25,
        stageName: 'अंकुरण व शाखाएं निकलना (Vegetative Growth)',
        statusColor: '#8d6e63',
        task: 'चने में अधिक यूरिया न डालें। 40 किग्रा DAP व 20 किग्रा पोटाश बुआई पर ही दें।',
        warning: 'उकठा (विल्ट) रोग से बचाव हेतु बुआई से पहले ट्राइकोडर्मा से बीजोपचार आवश्यक है।',
      },
      {
        minDay: 26,
        maxDay: 55,
        stageName: 'शाखाएं बनना व खुंटाई (Branching / Nipping)',
        statusColor: '#2e7d32',
        task: 'बुआई के 30-35 दिन बाद चने की ऊपरी नोक (खुंटाई) तोड़ें ताकि अधिक शाखाएं और घेटियां बनें।',
        warning: 'फूल आने से पहले एक हल्की सिंचाई करें। फूल आते समय कभी पानी न दें!',
      },
      {
        minDay: 56,
        maxDay: 85,
        stageName: 'फूल व घेंटी (Pod Formation)',
        statusColor: '#00796b',
        task: 'घेंटी छेदक कीट (इल्ली) की रोकथाम हेतु फेरोमोन ट्रैप व टी-आकार की खूंटियां लगाएं।',
        warning: 'इल्ली दिखने पर 5% नीम अर्क या इमामेक्टिन बेंजोएट का छिड़काव करें।',
      },
      {
        minDay: 86,
        maxDay: 130,
        stageName: 'दाना पकना व कटाई (Harvest)',
        statusColor: '#f57f17',
        task: 'पत्तियां पीली-भूरी पड़ने पर कटाई करें। थ्रेशिंग करके 10% नमी पर भंडारण करें।',
        warning: 'चना ₹5,440/क्विंटल से अधिक मंडी दर पर बिकता है।',
      },
    ],
  },
  tomato: {
    name: 'टमाटर / सब्जी (Tomato)',
    totalDays: 105,
    avgYieldPerAcre: 180,
    marketRatePerQuintal: 1500,
    stages: [
      {
        minDay: 0,
        maxDay: 25,
        stageName: 'रोपाई व जड़ स्थापना (Transplanting)',
        statusColor: '#8d6e63',
        task: 'मेड़ों पर ड्रिप और मल्चिंग के साथ रोपाई करें। हल्की सिंचाई नियमित दें।',
        warning: 'डैम्पिंग ऑफ (पौध सड़न) से बचाव हेतु कॉपर ऑक्सीक्लोराइड का ड्रेन्चिंग करें।',
      },
      {
        minDay: 26,
        maxDay: 50,
        stageName: 'सहारा देना व फूल आना (Staking & Flowering)',
        statusColor: '#2e7d32',
        task: 'पौधों को बांस व सुतली से सहारा (Staking) दें ताकि फल जमीन में सड़ने से बचें। 19:19:19 घुलनशील खाद दें।',
        warning: 'फल छेदक कीट और पत्ती मरोड़ (लीफ कर्ल) पर नजर रखें।',
      },
      {
        minDay: 51,
        maxDay: 120,
        stageName: 'फल भराव व नियमित तुड़ाई (Fruiting & Picking)',
        statusColor: '#c62828',
        task: 'हर 3-4 दिन में लाल-गुलाबी फलों की तुड़ाई करें। 0:0:50 पोटाश स्प्रे से फलों की चमक बढ़ती है।',
        warning: 'तुड़ाई के 3 दिन पहले किसी भी रासायनिक कीटनाशक का छिड़काव न करें।',
      },
    ],
  },
  maize: {
    name: 'मक्का (Maize)',
    totalDays: 100,
    avgYieldPerAcre: 26,
    marketRatePerQuintal: 2225,
    stages: [
      {
        minDay: 0,
        maxDay: 25,
        stageName: 'अंकुरण व 4-पत्ती अवस्था (Knee High)',
        statusColor: '#8d6e63',
        task: 'बुआई के 20-25 दिन बाद पहली यूरिया (45 किग्रा) डालें और मिट्टी चढ़ाएं।',
        warning: 'फॉल आर्मीवर्म (सैनिक कीट) के अंडे व इल्लियों की गोभ में नियमित जांच करें।',
      },
      {
        minDay: 26,
        maxDay: 60,
        stageName: 'मंजरी व भुट्टा बनना (Tasseling & Silking)',
        statusColor: '#2e7d32',
        task: 'दूसरी यूरिया (35 किग्रा) + 10 किग्रा पोटाश डालें। इस समय पानी की कमी न होने दें।',
        warning: 'भुट्टे में दाना भरते समय सिंचाई अनिवार्य है।',
      },
      {
        minDay: 61,
        maxDay: 115,
        stageName: 'दाना पकना व कटाई (Harvest)',
        statusColor: '#f57f17',
        task: 'भुट्टे का छिलका सूखने पर तुड़ाई करें और दानों को सुखाकर बेचें।',
        warning: 'मक्का समर्थन मूल्य ₹2,225 पर सरकारी खरीद में बेच सकते हैं।',
      },
    ],
  },
};

/**
 * Calculates days elapsed from sowing date to today.
 */
export const calculateDaysElapsed = (sowDateStr) => {
  if (!sowDateStr) return 0;
  const sowDate = new Date(sowDateStr);
  const today = new Date();
  sowDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today - sowDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Analyzes a specific plot and generates complete stage tracking & weather override.
 */
export const analyzePlotLifecycle = (plot, weatherContext = {}) => {
  const cropRule = CROP_LIFECYCLE_RULES[plot.cropId] || CROP_LIFECYCLE_RULES.paddy;
  const daysElapsed = calculateDaysElapsed(plot.sowDate);
  const isPlanned = daysElapsed < 0;
  const isHarvested = plot.status === 'harvested' || daysElapsed > cropRule.totalDays + 15;

  let currentStage = cropRule.stages[0];
  if (isHarvested) {
    currentStage = {
      minDay: cropRule.totalDays,
      maxDay: cropRule.totalDays + 999,
      stageName: 'कटाई पूर्ण व मंडी बिक्री (Post-Harvest & Mandi)',
      statusColor: '#059669',
      task: 'फसल की कटाई पूर्ण हो चुकी है। टोकन तुंहर हाथ से टोकन काटकर ₹3,100 समर्थन मूल्य पर धान बेचें या मंडी में बिक्री करें। खाली खेत में अगली रबी (चना/गेहूं) की तैयारी करें।',
      taskCg: 'फसल के कटाई पूरा होगे हे। टोकन तुंहर हाथ ले टोकन कटाके ₹3,100 भाव म धान बेचव। खाली खेत म रबी चना/गेहूं के तैयारी करव।',
      warning: 'उपज को 12-14% सुरक्षित नमी पर ही भंडारित करें या समिति में ले जाएं।',
    };
  } else if (isPlanned) {
    currentStage = {
      minDay: -999,
      maxDay: -1,
      stageName: 'बुआई पूर्व खेत तैयारी व बीजोपचार (Pre-Sowing)',
      statusColor: '#8d6e63',
      task: 'खेत की गहरी जुताई करें और 3-4 ट्रॉली सड़ी गोबर खाद मिलाएं। बुआई से पूर्व बीज को ट्राइकोडर्मा या कार्बेन्डाजिम से उपचारित अवश्य करें।',
      taskCg: 'खेत के गहिर जुताई करव अऊ 3-4 ट्राली गोबर खाद डारव। बोवाई ले पहिली बीज के ट्राइकोडर्मा ले बीजोपचार जरूर करव।',
      warning: 'मानसून व खेत में पानी की स्थिति देखकर ही बुआई/रोपाई शुरू करें।',
    };
  } else {
    for (const stage of cropRule.stages) {
      if (daysElapsed >= stage.minDay && daysElapsed <= stage.maxDay) {
        currentStage = stage;
        break;
      }
    }
    if (daysElapsed > cropRule.totalDays) {
      currentStage = cropRule.stages[cropRule.stages.length - 1];
    }
  }

  // Progress percentage (0 - 100%)
  const progressPercent = isPlanned
    ? 0
    : isHarvested
      ? 100
      : Math.min(100, Math.max(5, Math.round((daysElapsed / cropRule.totalDays) * 100)));

  // Friendly Human Day Labels (No negative numbers, zero robotic phrasing)
  const dayLabel = isPlanned
    ? `बुआई से ${Math.abs(daysElapsed)} दिन पूर्व`
    : (daysElapsed === 0
        ? 'आज बुआई का दिन'
        : (isHarvested ? 'कटाई पूर्ण' : `${daysElapsed} दिन हुए`));

  const dayLabelCg = isPlanned
    ? `बोवाई ले ${Math.abs(daysElapsed)} दिन पहिली`
    : (daysElapsed === 0
        ? 'आज बोवाई के दिन'
        : (isHarvested ? 'कटाई पूरा' : `${daysElapsed} दिन होगे`));

  // Dynamic Weather Override Evaluation
  let weatherAlert = null;
  const condition = (weatherContext.conditionName || weatherContext.condition || weatherContext.conditionText || '').toLowerCase();
  const isRaining = weatherContext.isRaining || (weatherContext.rainProbability >= 50);
  const humidity = weatherContext.humidity || 65;
  const temp = weatherContext.temp || 30;

  if (weatherContext.mawathaAlert && weatherContext.mawathaAlert.hasRisk) {
    weatherAlert = {
      type: 'warning',
      title: weatherContext.mawathaAlert.badge,
      message: weatherContext.mawathaAlert.advice,
      actionBlocker: true,
    };
  } else if (isRaining || condition.includes('rain') || condition.includes('बारिश') || condition.includes('thunder')) {
    weatherAlert = {
      type: 'warning',
      title: '🌧️ वर्षा पूर्व-चेतावनी (Rain Alert)',
      message: 'आगामी 24-48 घंटों में बारिश का अनुमान है। यूरिया, पोटाश और कीटनाशक का छिड़काव तुरंत रोकें ताकि दवा बह न जाए। खेत की मेड़ों से जल निकासी का प्रबंध करें।',
      actionBlocker: true,
    };
  } else if (humidity > 80) {
    weatherAlert = {
      type: 'info',
      title: '🌫️ उच्च उमस व बीमारी जोखिम (High Humidity Alert)',
      message: `हवा में नमी ${humidity}% है। ${cropRule.name} में फफूंद और रस चूसक कीटों का खतरा बढ़ गया है। नीम अर्क या ट्राइकोडर्मा का अग्रिम छिड़काव करें।`,
      actionBlocker: false,
    };
  } else if (temp > 38) {
    weatherAlert = {
      type: 'warning',
      title: '☀️ तीव्र धूप व उच्च तापमान (High Heat)',
      message: `तापमान ${temp}°C पहुंच चुका है। दोपहर की कड़ी धूप में सिंचाई न करें। शाम 5 बजे के बाद हल्की सिंचाई करें।`,
      actionBlocker: false,
    };
  }

  // Economic Projections
  const area = parseFloat(plot.areaAcres) || 1.0;
  const estimatedYieldQuintals = Math.round(cropRule.avgYieldPerAcre * area);
  const estimatedGrossIncome = Math.round(estimatedYieldQuintals * cropRule.marketRatePerQuintal);

  return {
    cropRule,
    daysElapsed,
    isPlanned,
    isHarvested,
    dayLabel,
    dayLabelCg,
    currentStage,
    progressPercent,
    weatherAlert,
    estimatedYieldQuintals,
    estimatedGrossIncome,
  };
};

/**
 * 12-Month Agro-Climatic Calendar for Central India & Chhattisgarh
 */
export const getSeasonalFarmAction = (monthIndex = new Date().getMonth(), isChhattisgarhi = false, zoneKey = 'plains') => {
  const actions = {
    // January (0)
    0: {
      season: 'रबी शीतकालीन प्रबंधन',
      title: isChhattisgarhi ? 'पाला अऊ जाड़ा ले फसल बचाव, चना-सरसों कीरा निगरानी' : 'शीतकालीन पाला से फसल सुरक्षा व चना-सरसों कीट निगरानी',
      task: isChhattisgarhi
        ? 'रात म जादा पाला (तुषार) के संका होए म खेत के मेड़ म शाम के धुआं करव या हल्का पानी चलावव। चना म इल्ली अऊ सरसों म माहू बर नीम तेल 5 मिली/लीटर छिड़कव।'
        : 'रात में पाला (तुषार) की संभावना पर खेत की मेड़ों पर शाम के समय धुआं करें या हल्की सिंचाई करें। चना में फली छेदक इल्ली व सरसों में माहू की निगरानी रखें।',
      targetTab: 'doctor',
      actionText: isChhattisgarhi ? 'कीरा दवाई जांचव ➔' : 'कीट-रोग दवा जांचें ➔',
    },
    // February (1)
    1: {
      season: 'रबी दाना भराव व सिंचाई',
      title: isChhattisgarhi ? 'गेहूं म दाना भराव अऊ दलहन म इल्ली रोकथाम' : 'गेहूं में दाना भराव अवस्था व दलहन में इल्ली नियंत्रण',
      task: isChhattisgarhi
        ? 'गेहूं के बाली निकलत बेरा पानी के कमी झन होए देवव। चना म इल्ली दिखे ले इमामेक्टिन बेंजोएट (5 ग्राम/पंप) या नीम अर्क छिड़कव।'
        : 'गेहूं में बालियां बनते समय खेत में नमी बनाए रखें। चने में फली छेदक इल्ली दिखने पर इमामेक्टिन बेंजोएट (5 ग्राम/पंप) या 5% नीम अर्क का छिड़काव करें।',
      targetTab: 'doctor',
      actionText: isChhattisgarhi ? 'फसल डॉक्टर खोलव ➔' : 'फसल डॉक्टर खोलें ➔',
    },
    // March (2)
    2: {
      season: 'रबी कटाई व वित्तीय प्रबंधन',
      title: isChhattisgarhi ? 'रबी चना-गेहूं कटाई अऊ KCC ऋण नवीनीकरण' : 'रबी चना-गेहूं कटाई व 31 मार्च KCC ऋण नवीनीकरण',
      task: isChhattisgarhi
        ? 'चना अऊ सरसों के कटाई समय म करव। 31 मार्च ले पहिली 0% ब्याज बर अपन किसान क्रेडिट कार्ड (KCC) ऋण के बैंक म नवीनीकरण जरूर कराव।'
        : 'चना व सरसों की समय पर कटाई करें। 31 मार्च से पूर्व 0% ब्याज लाभ हेतु अपने किसान क्रेडिट कार्ड (KCC) ऋण का बैंक में नवीनीकरण अवश्य कराएं।',
      targetTab: 'mandi',
      actionText: isChhattisgarhi ? 'मंडी भाव देखव ➔' : 'मंडी भाव देखें ➔',
    },
    // April (3)
    3: {
      season: 'ग्रीष्मकालीन खेत तैयारी',
      title: isChhattisgarhi ? 'घाम म गहिर जुताई अऊ गोबर खाद डारना' : 'ग्रीष्मकालीन गहरी जुताई व गोबर खाद प्रबंधन',
      task: isChhattisgarhi
        ? 'खाली खेत के मिट्टी पलटने वाला नागर ले गहिर जुताई करव ताकि घाम ले कीड़ा-मकोड़ा के अंडा जल जावय। 4-5 ट्राली सड़े गोबर खाद खेत म बगरवाव।'
        : 'खाली खेतों की मिट्टी पलटने वाले हल से गहरी जुताई करें ताकि तेज धूप से हानिकारक कीटों के अंडे व खरपतवार नष्ट हों। 4-5 ट्रॉली गोबर खाद फैलाएं।',
      targetTab: 'schemes',
      actionText: isChhattisgarhi ? 'माटी सेहत जांचव ➔' : 'मृदा स्वास्थ्य देखें ➔',
    },
    // May (4)
    4: {
      season: 'खरीफ पूर्व तैयारी',
      title: isChhattisgarhi ? 'माटी जांच, मेड़ सुधार अऊ उन्नत बीज व्यवस्था' : 'मृदा परीक्षण, मेड़बंदी व उन्नत प्रमाणित बीज व्यवस्था',
      task: isChhattisgarhi
        ? 'नजदीकी कृषि केंद्र ले माटी जांच कराव। बारिश ले पहिली खेत के मेड़ ला बांधव। प्रमाणित धान बीज (सरना, महामाया, एचएमटी) समिति ले उठाव।'
        : 'नजदीकी कृषि विज्ञान केंद्र से मिट्टी की जांच कराएं। मानसून से पूर्व खेत की मेड़बंदी ठीक करें और सहकारी समिति से प्रमाणित बीज प्राप्त करें।',
      targetTab: 'schemes',
      actionText: isChhattisgarhi ? 'खाद हिसाब कैलकुलेटर ➔' : 'खाद कैलकुलेटर ➔',
    },
    // June (5)
    5: {
      season: 'खरीफ बुआई व नर्सरी',
      title: isChhattisgarhi ? 'बीजोपचार अऊ धान थरहा (नर्सरी) डारना' : 'बीजोपचार व धान की नर्सरी (थरहा) बुआई',
      task: isChhattisgarhi
        ? 'बोवाई ले पहिली 1 किग्रा बीज म 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिलाके बीजोपचार करव। रोपाई बर 10 डिसमिल म थरहा डारव।'
        : 'बुआई से पूर्व 1 किग्रा बीज में 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिलाकर बीजोपचार अवश्य करें। रोपाई हेतु 10 डिसमिल में नर्सरी डालें।',
      targetTab: 'schemes',
      actionText: isChhattisgarhi ? 'बीजोपचार गाइड ➔' : 'बीजोपचार विधि ➔',
    },
    // July (6)
    6: {
      season: 'धान रोपाई व बेसल पोषण',
      title: isChhattisgarhi ? 'धान रोपाई, बियासी अऊ पूरा DAP-पोटाश खाद' : 'धान रोपाई, बियासी व बेसल (DAP/पोटाश) खाद प्रबंधन',
      task: isChhattisgarhi
        ? '20-25 दिन के थरहा के 2-3 पौधा प्रति थान रोपाई करव। रोपाई के बेरा पूरा DAP (50 किग्रा) अऊ पोटाश (20 किग्रा) डारव। जिंक अलग ले देवव।'
        : '20-25 दिन की नर्सरी की रोपाई 2-3 पौधे प्रति स्थान करें। रोपाई के समय पूरी DAP (50 किग्रा) व पोटाश (20 किग्रा) डालें। जिंक सल्फेट अलग से दें।',
      targetTab: 'schemes',
      actionText: isChhattisgarhi ? 'खाद बोरी हिसाब ➔' : 'खाद बोरी हिसाब ➔',
    },
    // August (7)
    7: {
      season: 'कल्ले फूटना व प्रथम टॉप-ड्रेसिंग',
      title: isChhattisgarhi ? 'कल्ले फूटना, निंदाई-गुड़ाई अऊ पहिली यूरिया' : 'कल्ले फूटने की अवस्था, खरपतवार नियंत्रण व प्रथम यूरिया',
      task: isChhattisgarhi
        ? 'रोपाई के 20-25 दिन बाद निंदाई करके 45 किग्रा यूरिया प्रति एकड़ डारव। खेत म 2-3 सेमी पानी बना के रखव। तना छेदक बर फेरोमोन ट्रैप लगाव।'
        : 'रोपाई के 20-25 दिन बाद खरपतवार निकालकर 45 किग्रा यूरिया प्रति एकड़ डालें। खेत में 2-3 सेमी पानी बनाए रखें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं।',
      targetTab: 'doctor',
      actionText: isChhattisgarhi ? 'रोग-कीट जांचव ➔' : 'रोग-कीट जांचें ➔',
    },
    // September (8)
    8: {
      season: 'गाभा अवस्था व द्वितीय खाद खुराक',
      title: isChhattisgarhi ? 'गाभा बेरा, माहू-झुलसा निगरानी अऊ यूरिया-पोटाश' : 'गाभा अवस्था, भूरा माहू/शीथ ब्लाइट निगरानी व द्वितीय खुराक',
      task: isChhattisgarhi
        ? 'बालियां बनने से पूर्व 30 किग्रा यूरिया + 10 किग्रा पोटाश प्रति एकड़ डालें। तनों पर भूरा माहू (BPH) व केंचुली (शीथ ब्लाइट) की दैनिक निगरानी करें।'
        : 'बालियां बनने से पहले 30 किग्रा यूरिया + 10 किग्रा पोटाश प्रति एकड़ डालें। तनों पर भूरा माहू (BPH) व पत्तियों पर शीथ ब्लाइट का नियमित निरीक्षण करें।',
      targetTab: 'doctor',
      actionText: isChhattisgarhi ? 'डॉक्टर म दवाई जांचव ➔' : 'दवा परामर्श जांचें ➔',
    },
    // October (9)
    9: {
      season: 'धान परिपक्वता व उतेरा बुआई',
      title: isChhattisgarhi ? 'धान कटाई तैयारी, उतेरा चना-तिवड़ा अऊ पानी निकास' : 'धान परिपक्वता, उतेरा (चना/तिवड़ा) बुआई व खेत से पानी निकासी',
      task: isChhattisgarhi
        ? 'बालियों के 85% सुनहरे होने पर कटाई करें। कटाई से 10-12 दिन पहले खेत का पानी निकालें और खड़े धान में चना/तिवड़ा का उतेरा छिड़काव करें।'
        : 'बालियों के 85% सुनहरे होने पर कटाई करें। कटाई से 10-12 दिन पूर्व खेत का पानी निकालें और खड़े धान में चना/तिवड़ा का उतेरा छिड़कें ताकि बिना जुताई रबी दलहन तैयार हो सके।',
      targetTab: 'schemes',
      actionText: isChhattisgarhi ? 'धान ₹3,100 कैलकुलेटर ➔' : 'धान ₹3,100 कैलकुलेटर ➔',
    },
    // November (10)
    10: {
      season: 'धान कटाई, टोकन व रबी बुआई',
      title: isChhattisgarhi ? 'धान मिझाई, टोकन तुंहर हाथ अऊ रबी चना-गेहूं बोवाई' : 'धान गहाई, टोकन तुंहर हाथ व रबी चना-गेहूं बुआई',
      task: isChhattisgarhi
        ? 'कटी फसल ला खलिहान म 14-17% नमी तक सुखाव। टोकन तुंहर हाथ ले धान बेचे के टोकन कटाव। खाली खेत म रबी चना, गेहूं अउ सरसों के बोवाई पूरा करव।'
        : 'कटी फसल को खलिहान में 14-17% नमी तक सुखाएं। टोकन तुंहर हाथ से धान टोकन काटें। खाली खेतों में पलेवा देकर रबी चना, गेहूं व सरसों की बुआई पूरी करें।',
      targetTab: 'mandi',
      actionText: isChhattisgarhi ? 'मंडी भाव व टोकन ➔' : 'मंडी भाव व टोकन ➔',
    },
    // December (11)
    11: {
      season: 'रबी पोषण व प्रथम सिंचाई',
      title: isChhattisgarhi ? 'गेहूं म CRI पहिली सिंचाई अऊ यूरिया टॉप-ड्रेसिंग' : 'गेहूं में CRI प्रथम सिंचाई (21 दिन) व यूरिया टॉप-ड्रेसिंग',
      task: isChhattisgarhi
        ? 'गेहूं म बोवाई के 21वां दिन पहिली जरूरी सिंचाई (CRI) करव अऊ 35 किग्रा यूरिया डारव। चना म नींदा नियंत्रण अऊ इल्ली निगरानी करव।'
        : 'गेहूं में बुआई के 21वें दिन पहली आवश्यक सिंचाई (CRI अवस्था) करें और 35 किग्रा यूरिया डालें। चने में खरपतवार नियंत्रण व इल्ली निगरानी करें।',
      targetTab: 'schemes',
      actionText: isChhattisgarhi ? 'खाद कैलकुलेटर ➔' : 'खाद कैलकुलेटर ➔',
    },
  };

  const baseAction = actions[monthIndex] || actions[9];

  // Agro-Climatic Zone Specific Seasonal Overrides
  if (zoneKey === 'northern_hills' && (monthIndex === 0 || monthIndex === 11)) {
    return {
      ...baseAction,
      warning: isChhattisgarhi
        ? '❄️ उत्तरी पहाड़ी पाला (तुषार) चेतवनी: रात म जादा पाला परे के संका म खेत के मेड़ म शाम के धुआं करव या हल्का पानी चलावव।'
        : '❄️ उत्तरी पहाड़ी क्षेत्र पाला (तुषार) चेतावनी: रात में तापमान 4°C से कम होने पर खेत की मेड़ों पर शाम को धुआं करें या हल्की सिंचाई करें ताकि चना व सरसों पाले से बच सके।',
    };
  }
  if (zoneKey === 'bastar' && monthIndex === 5) {
    return {
      ...baseAction,
      task: isChhattisgarhi
        ? '🌧️ बस्तर पठार म मानसून 10-15 जून म आथे। टिकरा माटी म पानी गिरते च खुर्रा बोवाई अऊ थरहा काम तुरते सुरू करव। बीजोपचार जरूर करव।'
        : '🌧️ बस्तर पठार विशेष: मानसून 10-15 जून के मध्य सक्रिय होता है। लाल-पीली टिकरा भूमि में हल्की वर्षा पर धान की सीधी बुआई (खुर्रा बोनी) व थरहा तत्काल पूरा करें।',
    };
  }

  return baseAction;
};

/**
 * Official ICAR & IGKV Agro-Climatic Zones of Chhattisgarh
 */
export const CG_AGRO_CLIMATIC_ZONES = {
  BASTAR_PLATEAU: {
    key: 'bastar',
    name: 'बस्तर का पठार (Bastar Plateau)',
    nameCg: 'बस्तर पठार क्षेत्र',
    normalKharifPaddySowDay: 175, // approx June 24
    districts: ['बस्तर', 'दंतेवाड़ा', 'कांकेर', 'कोंडागांव', 'सुकमा', 'बीजापुर', 'नारायणपुर'],
    characteristics: 'लाल-पीली टिकरा व रेतीली मिट्टी, समय पूर्व मानसून (10-15 जून)',
  },
  NORTHERN_HILLS: {
    key: 'northern_hills',
    name: 'उत्तरी पहाड़ी क्षेत्र (Northern Hills)',
    nameCg: 'उत्तरी पहाड़ी क्षेत्र',
    normalKharifPaddySowDay: 190, // approx July 9
    districts: ['सरगुजा', 'जशपुर', 'कोरिया', 'सूरजपुर', 'बलरामपुर', 'मनेंद्रगढ़', 'गौरेला-पेंड्रा-मरवाही'],
    characteristics: 'ऊंचाई अधिक, ठंडी जलवायु, पाला/शीत लहर जोखिम, मानसून (22-26 जून)',
  },
  PLAINS: {
    key: 'plains',
    name: 'छत्तीसगढ़ का मैदानी क्षेत्र (Chhattisgarh Plains)',
    nameCg: 'छत्तीसगढ़ मैदानी क्षेत्र',
    normalKharifPaddySowDay: 182, // approx July 1
    districts: [
      'रायपुर', 'दुर्ग', 'बिलासपुर', 'बेमेतरा', 'राजनांदगांव', 'बलौदाबाजार',
      'जांजगीर-चांपा', 'रायगढ़', 'महासमुंद', 'धमतरी', 'कवर्धा', 'मुंगेली',
      'बालोद', 'गरियाबंद', 'सक्ती', 'सारंगढ़-बिलाईगढ़', 'खैरागढ़',
      'मोहला-मानपुर'
    ],
    characteristics: 'कन्हार/डोरसा काली व मटासी मिट्टी, सघन नलकूप व नहर सिंचाई',
  },
};

/**
 * Returns the Agro-Climatic Zone for a given district in Chhattisgarh
 * Resilient to English names, newly carved districts, and abbreviations.
 */
export const getZoneForDistrict = (districtName = 'रायपुर') => {
  const d = (districtName || '').trim().toLowerCase();

  const isBastar =
    CG_AGRO_CLIMATIC_ZONES.BASTAR_PLATEAU.districts.some((name) => d.includes(name.toLowerCase())) ||
    ['bastar', 'dantewada', 'kanker', 'kondagaon', 'sukma', 'bijapur', 'narayanpur'].some((k) => d.includes(k));
  if (isBastar) return CG_AGRO_CLIMATIC_ZONES.BASTAR_PLATEAU;

  const isHills =
    CG_AGRO_CLIMATIC_ZONES.NORTHERN_HILLS.districts.some((name) => d.includes(name.toLowerCase())) ||
    ['surguja', 'ambikapur', 'jashpur', 'koriya', 'surajpur', 'balrampur', 'manendragarh', 'mcb', 'gaurela', 'pendra', 'marwahi', 'gpm'].some((k) => d.includes(k));
  if (isHills) return CG_AGRO_CLIMATIC_ZONES.NORTHERN_HILLS;

  return CG_AGRO_CLIMATIC_ZONES.PLAINS;
};

/**
 * High-Impact Today's Farm Action Evaluator
 * If farmer has active plot -> returns plot-specific real-time task with multi-plot priority.
 * If guest has local crop preference -> returns personalized task fear-free.
 * Otherwise -> returns district & zone-aware ICAR/IGKV Normal Benchmark Window task.
 */
export const getTodayActionableFarmTask = ({
  activeFarmer,
  farmerPlots = [],
  weather = {},
  selectedDistrict = 'रायपुर',
  isChhattisgarhi = false,
}) => {
  // Check logged-in plots OR guest local crop preference (Zero-Login Support)
  let effectivePlots = farmerPlots || [];
  let isGuestCustom = false;

  if (effectivePlots.length === 0 && !activeFarmer && typeof window !== 'undefined') {
    try {
      const guestPlotRaw = localStorage.getItem('kisan_guest_crop_plot');
      if (guestPlotRaw) {
        const guestPlot = JSON.parse(guestPlotRaw);
        if (guestPlot && guestPlot.sowDate) {
          effectivePlots = [guestPlot];
          isGuestCustom = true;
        }
      }
    } catch {}
  }

  if (effectivePlots.length > 0) {
    // Multi-Plot Priority: Prioritize active unharvested plot, then first plot
    const primaryPlot = effectivePlots.find((p) => {
      const a = analyzePlotLifecycle(p, weather);
      return !a.isHarvested;
    }) || effectivePlots[0];

    const analysis = analyzePlotLifecycle(primaryPlot, weather);
    const cropName = primaryPlot.cropName || analysis.cropRule?.name || 'धान';
    const stageName = analysis.currentStage?.stageName?.split('(')[0] || 'सक्रिय अवस्था';
    const task = analysis.currentStage?.task || 'खेत की नियमित निगरानी करें और उचित नमी बनाए रखें।';
    const days = analysis.daysElapsed || 0;
    const dayLabel = isChhattisgarhi ? (analysis.dayLabelCg || analysis.dayLabel) : analysis.dayLabel;

    return {
      source: isGuestCustom ? 'guest_custom' : 'plot',
      isGuestCustom,
      cropName,
      plotName: primaryPlot.plotName || primaryPlot.name || (isChhattisgarhi ? 'मोर फसल' : 'मेरी फसल'),
      stageName,
      daysElapsed: days,
      dayLabel,
      title: isChhattisgarhi
        ? `🌾 आज के जरूरी काम: ${cropName} (${dayLabel} - ${stageName})`
        : `🌾 आज का आवश्यक कार्य: ${cropName} (${dayLabel} - ${stageName})`,
      task: isChhattisgarhi ? (analysis.currentStage?.taskCg || task) : task,
      warning: analysis.currentStage?.warning || null,
      weatherAlert: analysis.weatherAlert || null,
      targetTab: analysis.isHarvested || analysis.currentStage?.minDay > 90 ? 'mandi' : (analysis.currentStage?.minDay > 40 ? 'doctor' : 'schemes'),
      actionText: analysis.isHarvested
        ? (isChhattisgarhi ? 'मंडी भाव व टोकन ➔' : 'मंडी भाव व टोकन ➔')
        : (isChhattisgarhi ? 'खेत ब्योरा देखव ➔' : 'खेत विवरण देखें ➔'),
      badgeText: isGuestCustom
        ? (isChhattisgarhi ? `🟢 अपन चुने फसल (${dayLabel})` : `🟢 चुनी हुई फसल (${dayLabel})`)
        : (isChhattisgarhi ? `🟢 मोर खेत (${dayLabel})` : `🟢 मेरा खेत (${dayLabel})`),
    };
  }

  // Zone-Aware ICAR / IGKV Normal Benchmark Window for guest / unregistered farmer
  const zone = getZoneForDistrict(selectedDistrict);
  const month = new Date().getMonth();
  const seasonal = getSeasonalFarmAction(month, isChhattisgarhi, zone.key);

  return {
    source: 'seasonal_icar',
    benchmarkSource: 'ICAR / IGKV',
    zoneName: isChhattisgarhi ? zone.nameCg : zone.name,
    district: selectedDistrict,
    season: seasonal.season,
    title: seasonal.title,
    task: seasonal.task,
    warning: seasonal.warning || null,
    targetTab: seasonal.targetTab,
    actionText: seasonal.actionText,
    badgeText: isChhattisgarhi
      ? `🏛️ ICAR/IGKV सामान्य चक्र (${selectedDistrict})`
      : `🏛️ ICAR/IGKV सामान्य चक्र (${selectedDistrict})`,
    transparencyNote: isChhattisgarhi
      ? `🏛️ ICAR व इंदिरा गांधी कृषि वि.वि. (IGKV) सामान्य बुआई कैलेंडर अनुसार (${selectedDistrict})। अपन फसल के सही तारीख सेट करे बर अपन बोवाई तारीख चुनव।`
      : `🏛️ ICAR व इंदिरा गांधी कृषि वि.वि. (IGKV) सामान्य बुआई कैलेंडर अनुसार (${selectedDistrict})। अपने खेत की सटीक तारीख सेट करने हेतु अपनी बुआई तारीख चुनें।`,
  };
};
