// किसान साथी - बहिरा काका इकाई निष्कर्षण (Entity Extraction & Dialect Parser)
// Extracts quintals, acreage, crops, commodities, and Chhattisgarh districts from rural speech

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

  // 3. Fractional vernacular colloquial terms WITH land units or context
  const hasLandContext = /(?:एकड़|एकड|acre|एकर|रकबा|खेत|जमीन|भूमि)/.test(clean);
  if (hasLandContext) {
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
  }

  // 4. Spoken Devanagari numbers WITH explicit acre/land unit
  const wordNumbers = {
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
    'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
    'ग्यारह': 11, 'बारह': 12, 'पंद्रह': 15, 'बीस': 20,
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'panch': 5
  };

  for (const [word, num] of Object.entries(wordNumbers)) {
    // Explicit acre unit is strictly REQUIRED so "एक बात" or "दो दिन" doesn't become acreage!
    const pattern = new RegExp(`(?:^|\\s)${word}\\s*(?:एकड़|एकड|acre|एकर|एकड़ा)(?:\\s|$)`);
    if (pattern.test(clean)) return num;
  }

  // 5. Standard numerical digits WITH explicit acre/land unit
  const digitMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:एकड़|एकड|acre|एकर|एकड़ा)/);
  if (digitMatch) {
    const val = parseFloat(digitMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
};

export const detectCropFromText = (text) => {
  if (!text) return null;
  const c = text.toLowerCase();
  // 1. Sugarcane / गन्ना (प्रमुख वाणिज्यिक फसल - कवर्धा, बालोद, बेमेतरा)
  if (c.includes('गन्ना') || c.includes('ganna') || c.includes('ईख') || c.includes('ऊख') || c.includes('sugarcane')) return 'sugarcane';
  // 2. दलहन एवं तिलहन (Pulses & Oilseeds)
  if (c.includes('चना') || c.includes('chana') || c.includes('chane') || c.includes('बूट')) return 'chana';
  if (c.includes('गेहूं') || c.includes('गेंहू') || c.includes('gehu') || c.includes('wheat')) return 'wheat';
  if (c.includes('सरसों') || c.includes('sarson') || c.includes('mustard') || c.includes('राई') || c.includes('तोरिया')) return 'sarson';
  if (c.includes('सोयाबीन') || c.includes('soyabean')) return 'soyabean';
  if (c.includes('मक्का') || c.includes('जौनरा') || c.includes('जुनहरी') || c.includes('maize') || c.includes('makka') || c.includes('भुट्टा')) return 'maize';
  if (c.includes('धान') || c.includes('चावल') || c.includes('चांउर') || c.includes('चांवर') || c.includes('dhan') || c.includes('paddy') || c.includes('rice')) return 'paddy';
  if (c.includes('अरहर') || c.includes('tur') || c.includes('arhar') || c.includes('तुअर') || c.includes('रहर')) return 'arhar';
  if (c.includes('उड़द') || c.includes('urad') || c.includes('उरद')) return 'urad';
  if (c.includes('मूंग') || c.includes('moong')) return 'moong';
  if (c.includes('तीवड़ा') || c.includes('lakhadi') || c.includes('लाखड़ी') || c.includes('खेसरी')) return 'tivda';
  // 3. सब्जियां एवं फल (Horticulture & Vegetables)
  if (c.includes('टमाटर') || c.includes('tamatar') || c.includes('tomato') || c.includes('पताल') || c.includes('पाताल')) return 'tomato';
  if (c.includes('आलू') || c.includes('aalu') || c.includes('potato') || c.includes('कंदा')) return 'potato';
  if (c.includes('प्याज') || c.includes('pyaj') || c.includes('onion') || c.includes('गोंदली') || c.includes('गोंदलि')) return 'onion';
  if (c.includes('मिर्च') || c.includes('mirch') || c.includes('chilli') || c.includes('मिरचा')) return 'chilli';
  if (c.includes('बैंगन') || c.includes('baingan') || c.includes('bhata') || c.includes('भांटा') || c.includes('भाटा')) return 'brinjal';
  if (c.includes('लहसुन') || c.includes('lahsun') || c.includes('garlic')) return 'garlic';
  if (c.includes('अदरक') || c.includes('adrak') || c.includes('ginger')) return 'ginger';
  if (c.includes('हल्दी') || c.includes('haldi') || c.includes('turmeric')) return 'turmeric';
  if (c.includes('केला') || c.includes('kela') || c.includes('banana')) return 'banana';
  if (c.includes('पपीता') || c.includes('papita') || c.includes('papaya')) return 'papaya';
  // 4. मिलेट्स (Millets / श्री अन्न)
  if (c.includes('कोदो') || c.includes('कुटकी') || c.includes('रागी') || c.includes('मड़िया')) return 'millets';
  return null;
};

export const detectCommodityFromText = (text) => {
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
 * Detects any of the 33 Chhattisgarh districts from colloquial spoken speech
 * Supports standard Hindi, Chhattisgarhi, phonetic English, and regional block/tehsil aliases
 */
export const detectDistrictFromText = (text) => {
  if (!text) return null;
  const c = text.toLowerCase();

  // 1. रायपुर संभाग (Raipur Division)
  if (c.includes('बलौदाबाजार') || c.includes('बलौदा बाजार') || c.includes('balodabazar') || c.includes('भाटापारा') || c.includes('bhatapara')) return 'बलौदाबाजार';
  if (c.includes('गरियाबंद') || c.includes('gariaband') || c.includes('राजिम') || c.includes('rajim')) return 'गरियाबंद';
  if (c.includes('धमतरी') || c.includes('dhamtari') || c.includes('कुरूद') || c.includes('kurud')) return 'धमतरी';
  if (c.includes('महासमुंद') || c.includes('mahasamund') || c.includes('सरायपाली') || c.includes('पिथौरा')) return 'महासमुंद';
  if (c.includes('रायपुर') || c.includes('raipur') || c.includes('आरंग') || c.includes('तिलदा')) return 'रायपुर';

  // 2. दुर्ग संभाग (Durg Division)
  if (c.includes('राजनांदगांव') || c.includes('राजनंदगांव') || c.includes('rajnandgaon') || c.includes('nandgaon') || c.includes('डोंगरगढ़')) return 'राजनांदगांव';
  if (c.includes('कवर्धा') || c.includes('कबीरधाम') || c.includes('kawardha') || c.includes('kabirdham')) return 'कवर्धा';
  if (c.includes('बेमेतरा') || c.includes('bemetara') || c.includes('bemetra') || c.includes('साजा') || c.includes('नवागढ़')) return 'बेमेतरा';
  if (c.includes('बालोद') || c.includes('balod') || c.includes('गुंडरदेही') || c.includes('दल्लीराजहरा')) return 'बालोद';
  if (c.includes('मोहला') || c.includes('मानपुर') || c.includes('mohla') || c.includes('अंबागढ़')) return 'मोहला-मानपुर';
  if (c.includes('खैरागढ़') || c.includes('छुईखदान') || c.includes('गंडई') || c.includes('khairagarh')) return 'खैरागढ़';
  if (c.includes('दुर्ग') || c.includes('durg') || c.includes('भिलाई') || c.includes('bhilai') || c.includes('पाटन') || c.includes('patan')) return 'दुर्ग';

  // 3. बिलासपुर संभाग (Bilaspur Division)
  if (c.includes('गौरेला') || c.includes('पेंड्रा') || c.includes('मरवाही') || c.includes('pendra') || c.includes('gaurela')) return 'गौरेला-पेंड्रा';
  if (c.includes('मुंगेली') || c.includes('mungeli') || c.includes('लोरमी') || c.includes('lormi')) return 'मुंगेली';
  if (c.includes('कोरबा') || c.includes('korba') || c.includes('कटघोरा')) return 'कोरबा';
  if (c.includes('जांजगीर') || c.includes('चांपा') || c.includes('janjgir') || c.includes('champa') || c.includes('अकलतरा')) return 'जांजगीर-चांपा';
  if (c.includes('सक्ती') || c.includes('sakti') || c.includes('डभरा') || c.includes('मालखरौदा')) return 'सक्ती';
  if (c.includes('सारंगढ़') || c.includes('बिलाईगढ़') || c.includes('sarangarh') || c.includes('bilaigarh')) return 'सारंगढ़-बिलाईगढ़';
  if (c.includes('रायगढ़') || c.includes('raigarh') || c.includes('खरसिया') || c.includes('घरघोड़ा')) return 'रायगढ़';
  if (c.includes('बिलासपुर') || c.includes('bilaspur') || c.includes('बिल्हा') || c.includes('तखतपुर') || c.includes('रतनपुर') || c.includes('मस्तूरी')) return 'बिलासपुर';

  // 4. सरगुजा संभाग (Surguja Division - Northern Hills)
  if (c.includes('मनेंद्रगढ़') || c.includes('चिरमिरी') || c.includes('भरतपुर') || c.includes('manendragarh') || c.includes('chirmiri')) return 'मनेंद्रगढ़';
  if (c.includes('कोरिया') || c.includes('बैकुंठपुर') || c.includes('koriya') || c.includes('korea') || c.includes('baikunthpur')) return 'कोरिया';
  if (c.includes('सूरजपुर') || c.includes('surajpur') || c.includes('प्रतापपुर') || c.includes('भटगांव')) return 'सूरजपुर';
  if (c.includes('बलरामपुर') || c.includes('balrampur') || c.includes('रामानुजगंज') || c.includes('कुसमी')) return 'बलरामपुर';
  if (c.includes('जशपुर') || c.includes('jashpur') || c.includes('पत्थलगांव') || c.includes('बगीचा')) return 'जशपुर';
  if (c.includes('अंबिकापुर') || c.includes('अम्बिकापुर') || c.includes('सरगुजा') || c.includes('ambikapur') || c.includes('surguja') || c.includes('सीतापुर') || c.includes('मैनपाट')) return 'अंबिकापुर';

  // 5. बस्तर संभाग (Bastar Division - Bastar Plateau)
  if (c.includes('कांकेर') || c.includes('kanker') || c.includes('भानुप्रतापपुर') || c.includes('चारामा') || c.includes('अंतागढ़') || c.includes('पखांजूर')) return 'कांकेर';
  if (c.includes('कोंडागांव') || c.includes('kondagaon') || c.includes('केशकाल') || c.includes('फरसगांव')) return 'कोंडागांव';
  if (c.includes('नारायणपुर') || c.includes('narayanpur') || c.includes('ओरछा')) return 'नारायणपुर';
  if (c.includes('दंतेवाड़ा') || c.includes('दंतेवाडा') || c.includes('dantewada') || c.includes('किरंदुल') || c.includes('बचेली') || c.includes('गीदम')) return 'दंतेवाड़ा';
  if (c.includes('सुकमा') || c.includes('sukma') || c.includes('कोन्टा') || c.includes('दोरनापाल')) return 'सुकमा';
  if (c.includes('बीजापुर') || c.includes('bijapur') || c.includes('भोपालपटनम') || c.includes('भैरमगढ़')) return 'बीजापुर';
  if (c.includes('बस्तर') || c.includes('जगदलपुर') || c.includes('bastar') || c.includes('jagdalpur') || c.includes('तोकापाल')) return 'जगदलपुर';

  return null;
};

