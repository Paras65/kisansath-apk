import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import Crop from './models/Crop.js';
import FertilizerDose from './models/FertilizerDose.js';
import CropDisease from './models/CropDisease.js';
import MandiRate from './models/MandiRate.js';
import Scheme from './models/Scheme.js';
import MachineryRental from './models/MachineryRental.js';
import CommunityQA from './models/CommunityQA.js';
import MarketListing from './models/MarketListing.js';

dotenv.config();

const CROPS_DATA = [
  {
    id: 'paddy',
    name: 'धान (Paddy)',
    scientificName: 'Oryza sativa',
    season: 'खरीफ (Kharif)',
    durationDays: '120-140 दिन',
    msp: '₹2,300 (MSP) + ₹800 बोनस = ₹3,100 / क्विंटल',
    targetYield: '20-25 क्विंटल / एकड़',
    idealPh: '5.5 - 6.5 (हल्की अम्लीय से सामान्य)',
    sowingMonth: 'जून - जुलाई',
    harvestMonth: 'नवंबर - दिसंबर',
    waterRequirement: 'अधिक (1200 - 1400 मिमी)',
    varieties: ['सरना (MTU 1001)', 'एच.एम.टी.', 'महामाया', 'मंसूरी (BPT 5204)', 'राजेश्री', 'दंतेश्वरी', 'स्वर्णा सब-1']
  },
  {
    id: 'wheat',
    name: 'गेहूं (Wheat)',
    scientificName: 'Triticum aestivum',
    season: 'रबी (Rabi)',
    durationDays: '110-125 दिन',
    msp: '₹2,425 / क्विंटल',
    targetYield: '18-22 क्विंटल / एकड़',
    idealPh: '6.0 - 7.5',
    sowingMonth: 'नवंबर - दिसंबर',
    harvestMonth: 'मार्च - अप्रैल',
    waterRequirement: 'मध्यम (4-5 सिंचाई)',
    varieties: ['लोक-1 (Lok-1)', 'शरबती', 'GW-322', 'HI-1544', 'कंचन', 'पूसा मंगल']
  },
  {
    id: 'chana',
    name: 'चना (Chickpea)',
    scientificName: 'Cicer arietinum',
    season: 'रबी (Rabi)',
    durationDays: '100-115 दिन',
    msp: '₹5,440 / क्विंटल',
    targetYield: '8-12 क्विंटल / एकड़',
    idealPh: '6.0 - 7.5',
    sowingMonth: 'अक्टूबर - नवंबर',
    harvestMonth: 'फरवरी - मार्च',
    waterRequirement: 'कम (1-2 सिंचाई)',
    varieties: ['जे.जी.-11', 'जाकी 9218', 'राधे', 'काबुली चना (HK-1)', 'विजय']
  },
  {
    id: 'maize',
    name: 'मक्का (Maize)',
    scientificName: 'Zea mays',
    season: 'खरीफ / रबी',
    durationDays: '90-105 दिन',
    msp: '₹2,225 / क्विंटल',
    targetYield: '25-30 क्विंटल / एकड़',
    idealPh: '6.5 - 7.5',
    sowingMonth: 'जून-जुलाई / अक्टूबर',
    harvestMonth: 'सितंबर / फरवरी',
    waterRequirement: 'मध्यम (500-600 मिमी)',
    varieties: ['दक्कन-103', 'गंगा-11', 'बायोसीड 9681', 'पायनियर 30V92', 'पूसा एचएम 4']
  },
  {
    id: 'soybean',
    name: 'सोयाबीन (Soybean)',
    scientificName: 'Glycine max',
    season: 'खरीफ (Kharif)',
    durationDays: '95-105 दिन',
    msp: '₹4,892 / क्विंटल',
    targetYield: '10-14 क्विंटल / एकड़',
    idealPh: '6.0 - 7.0',
    sowingMonth: 'जून के अंतिम सप्ताह से जुलाई',
    harvestMonth: 'अक्टूबर',
    waterRequirement: 'मध्यम',
    varieties: ['जे.एस. 95-60', 'जे.एस. 335', 'आर.वी.एस. 2001-4', 'एन.आर.सी. 37']
  },
  {
    id: 'tomato',
    name: 'टमाटर / सब्जी (Tomato)',
    scientificName: 'Solanum lycopersicum',
    season: 'सभी मौसम',
    durationDays: '90-120 दिन',
    msp: 'मंडी दर आधारित',
    targetYield: '150-250 क्विंटल / एकड़',
    idealPh: '6.0 - 7.0',
    sowingMonth: 'अगस्त-सितंबर (शीतकालीन) / जनवरी (ग्रीष्म)',
    harvestMonth: 'रोपाई के 60 दिन बाद से',
    waterRequirement: 'नियमित टपक सिंचाई (Drip)',
    varieties: ['अभिनव (सिंजेंटा)', 'साहो (3251)', 'हिमसोना', 'पूसा रूबी', 'अर्का रक्षक']
  }
];

const FERTILIZERS_DATA = [
  {
    cropId: 'paddy',
    name: 'धान (Paddy)',
    ureaTotal: 100,
    dapTotal: 50,
    mopTotal: 30,
    zincSulfate: 10,
    schedule: [
      {
        stage: 'बुआई / रोपाई के समय (Basal Dose)',
        time: 'खेत की अंतिम जुताई या रोपाई के तुरंत बाद',
        dap: '50 कि.ग्रा. (1 बोरी DAP)',
        mop: '20 कि.ग्रा. पोटाश (MOP)',
        urea: '25 कि.ग्रा. यूरिया',
        zinc: '10 कि.ग्रा. जिंक सल्फेट 21%',
        note: 'जिंक और डीएपी को कभी मिलाकर न डालें, अलग-अलग छिड़कें।'
      },
      {
        stage: 'कल्ले फूटते समय (Tillering Stage)',
        time: 'रोपाई के 20-25 दिन बाद (प्रथम टॉप ड्रेसिंग)',
        urea: '45 कि.ग्रा. यूरिया',
        dap: '0 कि.ग्रा.',
        mop: '0 कि.ग्रा.',
        zinc: '0 कि.ग्रा.',
        note: 'खेत में हल्का पानी हो, खरपतवार निकालने के बाद ही खाद डालें।'
      },
      {
        stage: 'गाभा / बालियां बनते समय (Panicle Initiation)',
        time: 'रोपाई के 45-50 दिन बाद (द्वितीय टॉप ड्रेसिंग)',
        urea: '30 कि.ग्रा. यूरिया',
        mop: '10 कि.ग्रा. पोटाश (दाने चमकदार और वजनदार बनने हेतु)',
        dap: '0 कि.ग्रा.',
        zinc: '0 कि.ग्रा.',
        note: 'यह खुराक दानों के भराव और बाली की लंबाई के लिए अत्यंत महत्वपूर्ण है।'
      }
    ]
  },
  {
    cropId: 'wheat',
    name: 'गेहूं (Wheat)',
    ureaTotal: 90,
    dapTotal: 55,
    mopTotal: 25,
    zincSulfate: 8,
    schedule: [
      {
        stage: 'बुआई के समय (Basal Dose)',
        time: 'बीज बोते समय कतारों में (Seed-cum-fertilizer drill)',
        dap: '55 कि.ग्रा. (1 बोरी से थोड़ा अधिक DAP)',
        mop: '25 कि.ग्रा. पोटाश',
        urea: '25 कि.ग्रा. यूरिया',
        zinc: '8 कि.ग्रा. जिंक',
        note: 'खाद को बीज से 2-3 सेमी नीचे रखें।'
      },
      {
        stage: 'पहली सिंचाई के बाद (CRI Stage - 21 दिन)',
        time: 'सीआरआई अवस्था (क्राउन रूट इनिशिएशन)',
        urea: '35 कि.ग्रा. यूरिया',
        note: 'सिंचाई के 2-3 दिन बाद जब पैर जमने लगे तब यूरिया का भुरकाव करें।'
      },
      {
        stage: 'दूसरी सिंचाई (गांठ बनने पर - 45 दिन)',
        time: 'बुआई के 40-45 दिन बाद',
        urea: '30 कि.ग्रा. यूरिया',
        note: 'अंतिम यूरिया खुराक।'
      }
    ]
  },
  {
    cropId: 'chana',
    name: 'चना (Chickpea - दलहन)',
    ureaTotal: 15,
    dapTotal: 40,
    mopTotal: 20,
    zincSulfate: 5,
    schedule: [
      {
        stage: 'बुआई के समय (एकमुश्त खुराक)',
        time: 'बुआई के पूर्व खेत तैयारी में',
        dap: '40 कि.ग्रा. DAP',
        mop: '20 कि.ग्रा. MOP',
        urea: '15 कि.ग्रा. (स्टार्टर खुराक)',
        zinc: '5 कि.ग्रा. जिंक सल्फेट',
        note: 'चने में ज्यादा यूरिया न डालें, अन्यथा पौधे केवल बढ़ेंगे और दाने नहीं बनेंगे। राइजोबियम कल्चर से बीजोपचार अवश्य करें।'
      }
    ]
  },
  {
    cropId: 'maize',
    name: 'मक्का (Maize)',
    ureaTotal: 110,
    dapTotal: 60,
    mopTotal: 30,
    zincSulfate: 10,
    schedule: [
      {
        stage: 'बुआई के समय (Basal)',
        time: 'खेत की अंतिम जुताई पर',
        dap: '60 कि.ग्रा. DAP',
        mop: '20 कि.ग्रा. MOP',
        urea: '30 कि.ग्रा. यूरिया',
        zinc: '10 कि.ग्रा. जिंक',
        note: 'मक्का अधिक पोषक तत्व खींचने वाली फसल है।'
      },
      {
        stage: 'घुटने की ऊंचाई पर (Knee-high - 30 दिन)',
        time: 'बुआई के 25-30 दिन बाद',
        urea: '45 कि.ग्रा. यूरिया',
        note: 'निराई-गुड़ाई के बाद मिट्टी चढ़ाते समय डालें।'
      },
      {
        stage: 'नर मंजरी (Tasseling - 50 दिन)',
        time: 'बुआई के 45-50 दिन बाद',
        urea: '35 कि.ग्रा. यूरिया',
        mop: '10 कि.ग्रा. पोटाश',
        note: 'भुट्टे में दानों के भराव हेतु आवश्यक।'
      }
    ]
  }
];

const DISEASES_DATA = [
  {
    id: 'paddy-blast',
    cropId: 'paddy',
    cropName: 'धान',
    diseaseName: 'ब्लास्ट / झुलसा रोग (Paddy Blast)',
    pathogen: 'फफूंद (Pyricularia oryzae)',
    symptoms: 'पत्तियों पर आंख या नाव के आकार के धब्बे बनते हैं, जिनके किनारे भूरे-कत्थई और बीच का भाग राख के रंग का होता है। गर्दन मरोड़ (Neck blast) में बाली की गर्दन काली पड़कर टूट जाती है।',
    organicRemedy: 'खेत में ट्राइकोडर्मा वीरिडी 5 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें। 5% नीम अर्क या गौमूत्र का छिड़काव करें।',
    chemicalRemedy: 'ट्राईसाइक्लाजोल 75% WP - 120 ग्राम प्रति एकड़ 200 लीटर पानी में घोलकर छिड़कें।',
    prevention: 'यूरिया का अत्यधिक उपयोग न करें। बीजोपचार कार्बेन्डाजिम से करें।'
  },
  {
    id: 'paddy-stemborer',
    cropId: 'paddy',
    cropName: 'धान',
    diseaseName: 'तना छेदक (Yellow Stem Borer)',
    pathogen: 'कीट (Scirpophaga incertulas)',
    symptoms: 'शुरुआती अवस्था में बीच की गोभ सूख जाती है जिसे "डेड हार्ट" कहते हैं। बाद में बालियां सफेद और खोखली रह जाती हैं।',
    organicRemedy: 'फेरोमोन ट्रैप 8 प्रति एकड़ लगाएं। ट्राइकोग्रामा जॅपोनिकम कार्ड 20,000 प्रति एकड़ छोड़ें।',
    chemicalRemedy: 'कोराजन (क्लोरएंट्रानिलिप्रोल 18.5% SC) 60 मिली प्रति एकड़ अथवा कार्टाप हाइड्रोक्लोराइड 4% जी 10 कि.ग्रा./एकड़ भुरकाव करें।',
    prevention: 'रोपाई करते समय धान की पौध की ऊपरी पत्तियों की नोक तोड़ दें।'
  },
  {
    id: 'paddy-bph',
    cropId: 'paddy',
    cropName: 'धान',
    diseaseName: 'भूरा माहू / चेपा (Brown Planthopper - BPH)',
    pathogen: 'रस चूसक कीट (Nilaparvata lugens)',
    symptoms: 'कीट तने के निचले भाग में जल स्तर के पास चिपके रहते हैं और रस चूसते हैं। पौधे सूखकर पीले-भूरे पड़ जाते हैं (हॉपर बर्न)।',
    organicRemedy: 'खेत से तुरंत पानी निकाल दें। 1500 PPM नीम तेल 5 मिली प्रति लीटर पानी के साथ तने के निचले हिस्से पर छिड़कें।',
    chemicalRemedy: 'पाइमेट्रोज़िन 50% WG 120 ग्राम प्रति एकड़ अथवा डिनोटेफ्यूरॉन 20% SG 100 ग्राम प्रति एकड़ पौधे की जड़/तने की ओर नोजल करके छिड़कें।',
    prevention: 'खेत में हर 2-3 मीटर पर 30 सेमी चौड़ी नाली छोड़ें।'
  },
  {
    id: 'paddy-sheath-blight',
    cropId: 'paddy',
    cropName: 'धान',
    diseaseName: 'शीथ ब्लाइट (Sheath Blight)',
    pathogen: 'फफूंद (Rhizoctonia solani)',
    symptoms: 'तने के निचले हिस्से पर सांप की केंचुली जैसे अंडाकार, हरे-सलेटी धब्बे बनते हैं जिनके किनारे गहरे भूरे होते हैं।',
    organicRemedy: 'स्यूडोमोनास फ्लोरेसेंस 10 ग्राम प्रति लीटर पानी का छिड़काव करें।',
    chemicalRemedy: 'हेक्साकोनाजोल 5% EC 2 मिली/लीटर पानी अथवा एज़ोक्सीस्ट्रोबिन 1 मिली/लीटर पानी।',
    prevention: 'खेत में पानी का भराव आवश्यकता से अधिक न रखें।'
  },
  {
    id: 'chana-wilt',
    cropId: 'chana',
    cropName: 'चना',
    diseaseName: 'उकठा रोग (Fusarium Wilt)',
    pathogen: 'मृदा जनित फफूंद (Fusarium oxysporum)',
    symptoms: 'पौधे की पत्तियां अचानक पीली पड़कर सूख जाती हैं। जड़ चीर कर देखने पर अंदर की नसें भूरी या काली पड़ जाती हैं।',
    organicRemedy: 'बुआई से पूर्व ट्राइकोडर्मा वीरिडी 10 ग्राम प्रति किग्रा बीज से बीजोपचार करें।',
    chemicalRemedy: 'कार्बेन्डाजिम 50% WP (बाविस्टिन) 2 ग्राम प्रति किग्रा बीज से उपचार।',
    prevention: 'फसल चक्र अपनाएं। रोगरोधी किस्में जैसे जेजी-11 लगाएं।'
  },
  {
    id: 'tomato-leafcurl',
    cropId: 'tomato',
    cropName: 'टमाटर',
    diseaseName: 'पत्ता मरोड़ रोग (Leaf Curl Virus)',
    pathogen: 'सफेद मक्खी द्वारा फैलने वाला वायरस',
    symptoms: 'पत्तियां सिकुड़कर मुड़ जाती हैं, खुरदुरी और मोटी हो जाती हैं। पौधों का विकास रुक जाता है।',
    organicRemedy: 'पीले स्टिकी ट्रैप 20 प्रति एकड़ लगाएं। नीम तेल 5 मिली/लीटर का छिड़काव करें।',
    chemicalRemedy: 'एसिटामिप्रिड 20% SP - 0.5 ग्राम प्रति लीटर पानी में छिड़कें।',
    prevention: 'रोगग्रस्त पौधों को तुरंत उखाड़कर नष्ट करें।'
  }
];

const MANDI_DATA = [
  {
    mandi: 'रायपुर (Raipur)',
    district: 'रायपुर, छत्तीसगढ़',
    crop: 'धान (सरना / मोटा)',
    variety: 'सामान्य (Common)',
    minRate: 2300,
    maxRate: 3100,
    modalRate: 3100,
    trend: '+150',
    unit: '₹ / क्विंटल',
    arrival: '450 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'रायपुर (Raipur)',
    district: 'रायपुर, छत्तीसगढ़',
    crop: 'धान (सुगंधित / बासमती)',
    variety: 'Dubraj / HMT',
    minRate: 2850,
    maxRate: 3650,
    modalRate: 3380,
    trend: '+80',
    unit: '₹ / क्विंटल',
    arrival: '180 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'बिलासपुर (Bilaspur)',
    district: 'बिलासपुर, छत्तीसगढ़',
    crop: 'धान (सरना)',
    variety: 'ग्रेड-ए',
    minRate: 2320,
    maxRate: 3100,
    modalRate: 3100,
    trend: '+100',
    unit: '₹ / क्विंटल',
    arrival: '320 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'राजनांदगांव (Rajnandgaon)',
    district: 'राजनांदगांव, छत्तीसगढ़',
    crop: 'चना (Chickpea)',
    variety: 'देसी चना',
    minRate: 5600,
    maxRate: 6150,
    modalRate: 5950,
    trend: '+210',
    unit: '₹ / क्विंटल',
    arrival: '120 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'धमतरी (Dhamtari)',
    district: 'धमतरी, छत्तीसगढ़',
    crop: 'धान (एच.एम.टी.)',
    variety: 'HMT Fine',
    minRate: 2750,
    maxRate: 3280,
    modalRate: 3100,
    trend: '+50',
    unit: '₹ / क्विंटल',
    arrival: '510 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'कवर्धा (Kawardha)',
    district: 'कबीरधाम, छत्तीसगढ़',
    crop: 'सोयाबीन (Soybean)',
    variety: 'पीला सोयाबीन',
    minRate: 4400,
    maxRate: 4850,
    modalRate: 4680,
    trend: '+45',
    unit: '₹ / क्विंटल',
    arrival: '90 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'भाटापारा (Bhatapara)',
    district: 'बलौदाबाजार, छत्तीसगढ़',
    crop: 'मक्का (Maize)',
    variety: 'हाइब्रिड पीला',
    minRate: 2050,
    maxRate: 2350,
    modalRate: 2260,
    trend: '-30',
    unit: '₹ / क्विंटल',
    arrival: '220 टन',
    date: 'आज के भाव'
  },
  {
    mandi: 'जगदलपुर (Jagdalpur)',
    district: 'बस्तर, छत्तीसगढ़',
    crop: 'कोदो - कुटकी (Millets)',
    variety: 'श्री अन्न',
    minRate: 3900,
    maxRate: 4400,
    modalRate: 4200,
    trend: '+120',
    unit: '₹ / क्विंटल',
    arrival: '65 टन',
    date: 'आज के भाव'
  }
];

const SCHEMES_DATA = [
  {
    id: 'krishak-unnati',
    title: 'छत्तीसगढ़ कृषक उन्नति योजना (Krishak Unnati Yojana)',
    badge: 'धान ₹3,100 / क्विंटल',
    status: 'सक्रिय (Active)',
    summary: 'धान उत्पादक किसानों को ₹3,100 प्रति क्विंटल का निश्चित मूल्य (MSP + अंतर राशि) और प्रति एकड़ 21 क्विंटल तक खरीद का प्रावधान।',
    keyPoints: [
      'खरीदी सीमा: अधिकतम 21 क्विंटल प्रति एकड़ धान खरीदी।',
      'भुगतान दर: ₹3,100 प्रति क्विंटल की कुल राशि (समर्थन मूल्य + राज्य सरकार की प्रोत्साहन अंतर राशि)।',
      'फसल विविधीकरण: धान के बदले दलहन, तिलहन, मक्का या मोटे अनाज लगाने पर ₹15,000 प्रति एकड़ तक इनपुट सब्सिडी।',
      'अनिवार्यता: एग्री-स्टैक / किसान रजिस्ट्री पोर्टल पर अनिवार्य पंजीकरण।'
    ],
    linkUrl: process.env.VITE_PORTAL_AGRISTACK_URL || 'https://cgfr.agristack.gov.in/',
    linkText: 'किसान रजिस्ट्री पोर्टल खोलें'
  },
  {
    id: 'token-tuhar-hath',
    title: 'टोकन तुंहर हाथ (Token Tuhar Hath App)',
    badge: 'ऑनलाइन धान टोकन',
    status: 'सक्रिय (Active)',
    summary: 'धान उपार्जन केंद्रों (समितियों) में धान बेचने हेतु लाइन में लगे बिना घर बैठे मोबाइल से टोकन काटने की डिजिटल सुविधा।',
    keyPoints: [
      'किसान स्वयं अपने मोबाइल से तारीख और समय चुनकर टोकन बुक कर सकते हैं।',
      'टोकन स्थिति, तौल पर्ची (Toul Parchi) और बारदाना विवरण ऐप में उपलब्ध।',
      'छोटे एवं सीमांत किसानों के लिए प्राथमिकता स्लॉट की व्यवस्था।',
      'टोकन कटने के बाद निर्धारित तिथि पर समिति में धान लेकर जाना होता है।'
    ],
    linkUrl: process.env.VITE_PORTAL_TOKEN_URL || 'http://khadya.cg.nic.in/',
    linkText: 'खाद्य विभाग उपार्जन पोर्टल'
  },
  {
    id: 'bhuiyan',
    title: 'भुइयां पोर्टल (Bhuiyan CG Land Records)',
    badge: 'डिजिटल जमीन रिकॉर्ड',
    status: 'सक्रिय (Active)',
    summary: 'खसरा, खतौनी (B-1), नक्शा और ऋण पुस्तिका का ऑनलाइन रिकॉर्ड देखना और डाउनलोड करना।',
    keyPoints: [
      'धान बेचने और किसान रजिस्ट्री के लिए B-1 और खसरा रिकॉर्ड अनिवार्य।',
      'मोबाइल से ही अपना डिजिटल हस्ताक्षरित खसरा व B-1 डाउनलोड करें।',
      'जमीन के रकबे का सटीक सत्यापन जिससे धान बेचने में कोई त्रुटि न हो।'
    ],
    linkUrl: process.env.VITE_PORTAL_BHUIYAN_URL || 'https://bhuiyan.cg.nic.in/',
    linkText: 'भुइयां पोर्टल पर जाएं'
  },
  {
    id: 'saur-sujla',
    title: 'सौर सुजला योजना (Saur Sujla Solar Pump)',
    badge: '95% तक सब्सिडी',
    status: 'सक्रिय (Active)',
    summary: 'क्रेडा (CREDA) द्वारा खेतों में 3 एचपी और 5 एचपी सौर ऊर्जा संचालित सिंचाई पंपों की स्थापना।',
    keyPoints: [
      'बिजली बिल और डीजल के खर्च से हमेशा के लिए मुक्ति।',
      'अनुसूचित जाति/जनजाति के किसानों को नाममात्र शुल्क पर 5HP सोलर पंप।',
      'सामान्य एवं पिछड़ा वर्ग के किसानों को 85-90% तक की भारी सरकारी छूट।'
    ],
    linkUrl: process.env.VITE_PORTAL_CREDA_URL || 'https://creda.cgstate.gov.in/',
    linkText: 'क्रेडा आधिकारिक वेबसाइट'
  },
  {
    id: 'pm-kisan',
    title: 'पीएम-किसान सम्मान निधि (PM-KISAN)',
    badge: '₹6,000 प्रति वर्ष',
    status: 'सक्रिय (Active)',
    summary: 'पात्र किसानों के बैंक खातों में प्रत्येक 4 माह में ₹2,000 की 3 किस्तें (कुल ₹6,000 वार्षिक) डीबीटी के माध्यम से।',
    keyPoints: [
      'e-KYC अनिवार्य (ओटीपी या बायोमेट्रिक द्वारा)।',
      'बैंक खाता आधार व एनपीसीआई (NPCI) से मैप होना अनिवार्य।'
    ],
    linkUrl: process.env.VITE_PORTAL_PMKISAN_URL || 'https://pmkisan.gov.in/',
    linkText: 'PM-Kisan स्थिति जांचें'
  },
  {
    id: 'pmfby',
    title: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    badge: 'फसल सुरक्षा कवच',
    status: 'सक्रिय (Active)',
    summary: 'सूखा, बाढ़, ओलावृष्टि, कीट-व्याधि और प्राकृतिक आपदाओं से फसल नुकसान पर आर्थिक भरपाई।',
    keyPoints: [
      'खरीफ फसलों हेतु मात्र 2% और रबी फसलों हेतु मात्र 1.5% प्रीमियम किसान को देना होता है।',
      'स्थानीयकृत आपदा होने पर 72 घंटे के भीतर टोल-फ्री नंबर 14447 पर सूचना देना अनिवार्य है।'
    ],
    linkUrl: process.env.VITE_PORTAL_PMFBY_URL || 'https://pmfby.gov.in/',
    linkText: 'फसल बीमा पोर्टल'
  }
];

const MACHINERY_DATA = [
  {
    id: 'tractor-rotavator',
    title: 'महिंद्रा / स्वराज ट्रैक्टर 50 HP + रोटावेटर',
    category: 'जुताई एवं खेत तैयारी',
    rate: '₹900 - ₹1,100 / घंटा',
    operatorIncluded: true,
    contactName: 'रामेश्वर पटेल (कस्टम हायरिंग सेंटर)',
    phone: '98260XXXXX',
    location: 'आरंग / रायपुर',
    features: ['खेत की गहरी जुताई', 'रोटावेटर से मिट्टी भुरभुरी करना', 'लेवलर उपलब्ध']
  },
  {
    id: 'combine-harvester',
    title: 'कंबाइन हार्वेस्टर (धान / गेहूं कटाई व मिंजाई)',
    category: 'कटाई व थ्रेशिंग',
    rate: '₹1,900 - ₹2,200 / घंटा',
    operatorIncluded: true,
    contactName: 'सुरेश साहू (कृषि सेवा केंद्र)',
    phone: '94252XXXXX',
    location: 'तखतपुर / बिलासपुर',
    features: ['1 घंटे में 1 एकड़ धान कटाई व मिंजाई', 'अनाज का न्यूनतम नुकसान', 'स्ट्रॉ रीपर सुविधा']
  },
  {
    id: 'drone-sprayer',
    title: 'कृषि ड्रोन स्प्रेयर (10 लीटर क्षमता)',
    category: 'आधुनिक छिड़काव तकनीक',
    rate: '₹350 - ₹400 / एकड़',
    operatorIncluded: true,
    contactName: 'ग्रीन एग्रो ड्रोन सर्विसेज',
    phone: '91110XXXXX',
    location: 'दुर्ग / भिलाई व पाटन',
    features: ['10 मिनट में 1 एकड़ छिड़काव', 'दवा और पानी की 50% बचत', 'पौधों के पत्तों पर समान छिड़काव']
  },
  {
    id: 'laser-leveler',
    title: 'लेजर लैंड लेवलर (समतलीकरण मशीन)',
    category: 'जल संरक्षण एवं लेवलिंग',
    rate: '₹1,200 / घंटा',
    operatorIncluded: true,
    contactName: 'किसान विकास समिति',
    phone: '97520XXXXX',
    location: 'बेमेतरा / कवर्धा',
    features: ['खेत को 100% समतल करना', 'पानी की 30% बचत', 'उर्वरक का समान फैलाव']
  }
];

const COMMUNITY_DATA = [
  {
    id: 'qa-1',
    author: 'महेश कुमार (किसान, बेमेतरा)',
    crop: 'धान',
    time: '2 घंटे पहले',
    question: 'धान की पत्तियों पर कत्थई रंग के नाव के आकार के धब्बे दिख रहे हैं, यह कौन सा रोग है और क्या तुरंत उपाय करें?',
    answersCount: 3,
    bestAnswer: 'यह धान का झुलसा (ब्लास्ट) रोग है। तुरंत ट्राईसाइक्लाजोल 75% WP (120 ग्राम प्रति एकड़) का 200 लीटर पानी में छिड़काव करें। खेत में यूरिया देना तुरंत बंद कर दें। - डॉ. वर्मा (कृषि विशेषज्ञ)'
  },
  {
    id: 'qa-2',
    author: 'भूपेश साहू (किसान, धमतरी)',
    crop: 'धान उपार्जन',
    time: '5 घंटे पहले',
    question: 'इस साल धान बेचने के लिए क्या टोकन तुंहर हाथ में नया रजिस्ट्रेशन करना पड़ेगा या एग्री-स्टैक आईडी से ही होगा?',
    answersCount: 5,
    bestAnswer: 'इस वर्ष सरकार ने एग्री-स्टैक / किसान रजिस्ट्री को अनिवार्य कर दिया है। यदि सत्यापन हो गया है, तो टोकन ऐप में आईडी स्वतः जुड़ जाएगी। - समिति प्रबंधक'
  },
  {
    id: 'qa-3',
    author: 'दिलीप वर्मा (किसान, बलौदाबाजार)',
    crop: 'चना',
    time: '1 दिन पहले',
    question: 'धान कटाई के बाद तुरंत चना बोने पर उकठा रोग का खतरा कैसे कम करें?',
    answersCount: 4,
    bestAnswer: 'बीज बोने से पहले ट्राइकोडर्मा वीरिडी 10 ग्राम प्रति किग्रा बीज से बीजोपचार अवश्य करें। खेत में अंतिम जुताई पर 2 किग्रा ट्राइकोडर्मा गोबर खाद में मिलाकर फैलाएं। - रामनारायण पटेल'
  }
];

const MARKETPLACE_DATA = [
  {
    id: 'list-1',
    crop: 'सुगंधित दुबराज धान',
    quantity: '50 क्विंटल',
    expectedPrice: '₹3,400 / क्विंटल',
    farmerName: 'दीपक पटेल',
    location: 'धमतरी',
    phone: '98261XXXXX',
    date: 'कल पोस्ट किया गया'
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('--- Seeding Agricultural Collections into MongoDB Atlas ---');

    // 1. Crops
    await Crop.deleteMany();
    await Crop.insertMany(CROPS_DATA);
    console.log(`[Crops] Seeded ${CROPS_DATA.length} records.`);

    // 2. Fertilizers
    await FertilizerDose.deleteMany();
    await FertilizerDose.insertMany(FERTILIZERS_DATA);
    console.log(`[FertilizerDoses] Seeded ${FERTILIZERS_DATA.length} records.`);

    // 3. Diseases
    await CropDisease.deleteMany();
    await CropDisease.insertMany(DISEASES_DATA);
    console.log(`[CropDiseases] Seeded ${DISEASES_DATA.length} records.`);

    // 4. Mandi Rates
    await MandiRate.deleteMany();
    await MandiRate.insertMany(MANDI_DATA);
    console.log(`[MandiRates] Seeded ${MANDI_DATA.length} records.`);

    // 5. Schemes
    await Scheme.deleteMany();
    await Scheme.insertMany(SCHEMES_DATA);
    console.log(`[Schemes] Seeded ${SCHEMES_DATA.length} records.`);

    // 6. Machinery
    await MachineryRental.deleteMany();
    await MachineryRental.insertMany(MACHINERY_DATA);
    console.log(`[Machinery] Seeded ${MACHINERY_DATA.length} records.`);

    // 7. Community Q&A
    await CommunityQA.deleteMany();
    await CommunityQA.insertMany(COMMUNITY_DATA);
    console.log(`[CommunityQA] Seeded ${COMMUNITY_DATA.length} records.`);

    // 8. Marketplace
    await MarketListing.deleteMany();
    await MarketListing.insertMany(MARKETPLACE_DATA);
    console.log(`[Marketplace] Seeded ${MARKETPLACE_DATA.length} records.`);

    console.log('🎉 MongoDB Atlas Seeding Completed Successfully! All data is now live in database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
