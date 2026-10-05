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
  if (!isPlanned) {
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
    : Math.min(100, Math.max(5, Math.round((daysElapsed / cropRule.totalDays) * 100)));

  // Dynamic Weather Override Evaluation
  let weatherAlert = null;
  const condition = (weatherContext.condition || '').toLowerCase();
  const humidity = weatherContext.humidity || 65;
  const temp = weatherContext.temp || 30;

  if (condition.includes('rain') || condition.includes('बारिश') || condition.includes('thunder')) {
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
    currentStage,
    progressPercent,
    weatherAlert,
    estimatedYieldQuintals,
    estimatedGrossIncome,
  };
};
