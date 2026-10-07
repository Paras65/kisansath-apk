/**
 * 🌾 किसान साथी - जमीन नाप (यूनिट कनवर्टर) एवं धान उपार्जन बारदाना इंजन
 * 
 * विशेषताएँ:
 * 1. छत्तीसगढ़ राजस्व मानक: 1 एकड़ = 100 डिसमिल = 0.4047 हेक्टेयर
 * 2. फ्लोटिंग पॉइंट दोष निवारण (Floating point rounding protection)
 * 3. बड़े अंगूठा स्टीपर्स (0.5 एकड़ / 25 डिसमिल कदम)
 * 4. बारदाना सीलिंग (Gunny Bags Ceiling rule: Math.ceil, 1 बोरा = 40 kg)
 * 5. कृषक उन्नति योजना ₹3,100 एवं बारदाना प्रतिपूर्ति (₹25/बोरा)
 */

/**
 * एकड़ को डिसमिल में बदलें (Acre to Dismil)
 * उदा. 1.5 एकड़ -> 150 डिसमिल, 0.75 एकड़ -> 75 डिसमिल
 */
export const acreToDismil = (acres) => {
  const num = parseFloat(acres) || 0;
  if (num <= 0) return 0;
  // Round to 2 decimal places to avoid 149.99999999 issues
  return Math.round(num * 100 * 100) / 100;
};

/**
 * डिसमिल को एकड़ में बदलें (Dismil to Acre)
 * उदा. 75 डिसमिल -> 0.75 एकड़, 150 डिसमिल -> 1.5 एकड़
 */
export const dismilToAcre = (dismil) => {
  const num = parseFloat(dismil) || 0;
  if (num <= 0) return 0;
  // Round to 3 decimal places
  return Math.round((num / 100) * 1000) / 1000;
};

/**
 * एकड़ स्टीपर (+ / -) क्लैम्प्ड
 */
export const stepAcre = (currentAcre, delta = 0.5) => {
  const current = parseFloat(currentAcre) || 0;
  const next = Math.max(0, Math.min(100, Math.round((current + delta) * 10) / 10));
  return next;
};

/**
 * डिसमिल स्टीपर (+ / -) क्लैम्प्ड
 */
export const stepDismil = (currentDismil, delta = 25) => {
  const current = parseFloat(currentDismil) || 0;
  const next = Math.max(0, Math.min(10000, Math.round(current + delta)));
  return next;
};

/**
 * धान उपार्जन, बारदाना (Jute Gunny Bags) एवं भुगतान गणना
 * @param {number|string} acres - कुल रकबा (एकड़ में)
 * @param {number} maxQuintalPerAcre - शासकीय सीमा (डिफ़ॉल्ट 21 क्विंटल/एकड़)
 */
export const calculatePaddyProcurement = (acres, maxQuintalPerAcre = 21) => {
  const numAcres = parseFloat(acres) || 0;
  if (numAcres <= 0) {
    return {
      acres: 0,
      dismil: 0,
      maxQuintals: 0,
      bardanaBags: 0,
      bardanaReimbursement: 0,
      mspCommon: 0,
      bonusCommon: 0,
      mspGradeA: 0,
      bonusGradeA: 0,
      totalPayout: 0,
      tokenLimit: 0
    };
  }

  // 1. कुल धान उपार्जन क्षमता (21 क्विंटल प्रति एकड़)
  const maxQuintals = parseFloat((numAcres * maxQuintalPerAcre).toFixed(1));

  // 2. बारदाना गणना (1 क्विंटल = 2.5 जूट बोरी, 1 बोरी = 40 kg मानक)
  // समिति में आधा बोरा नहीं चलता, इसलिए हमेशा Math.ceil()
  const bardanaBags = Math.ceil(maxQuintals * 2.5);

  // 3. किसान के स्वयं के बारदाने की प्रतिपूर्ति राशि (₹25 प्रति बोरा शासन मानक)
  const bardanaReimbursement = bardanaBags * 25;

  // 4. भारत सरकार MSP एवं छत्तीसगढ़ शासन बोनस ब्रेकडाउन
  // सामान्य (Common): MSP ₹2,300, बोनस ₹800 -> ₹3,100
  const mspCommon = Math.round(maxQuintals * 2300);
  const bonusCommon = Math.round(maxQuintals * 800);

  // ग्रेड-ए (Grade-A): MSP ₹2,320, बोनस ₹780 -> ₹3,100
  const mspGradeA = Math.round(maxQuintals * 2320);
  const bonusGradeA = Math.round(maxQuintals * 780);

  // कुल राशि (@ ₹3,100 प्रति क्विंटल)
  const totalPayout = Math.round(maxQuintals * 3100);

  // 5. टोकन तुंहर हाथ कोटा सीमा (10 एकड़ तक 2 टोकन, 10+ एकड़ पर 3 टोकन)
  const tokenLimit = numAcres <= 10 ? 2 : 3;

  return {
    acres: numAcres,
    dismil: acreToDismil(numAcres),
    maxQuintals,
    bardanaBags,
    bardanaReimbursement,
    mspCommon,
    bonusCommon,
    mspGradeA,
    bonusGradeA,
    totalPayout,
    tokenLimit
  };
};

