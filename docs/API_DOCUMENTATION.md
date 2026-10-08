# 🛡️ किसान साथी (Kisan Saathi) — Enterprise Secure API Specification

> **संस्करण:** v1.0.28  
> **सुरक्षा मानक:** OWASP Top 10 • Zero-PII Offline Policy • Zero-Fake-Data OGD Engine  
> **आधार URL (Base URL):** `https://kisan.init65.co.in/api` (Production) / `http://localhost:5000/api` (Local)  
> **हेडर प्रारूप:** `Content-Type: application/json`

---

## 📑 विषय-सूची (Table of Contents)

1. [सुरक्षा एवं अनुपालन वास्तुकला (Security & Compliance Architecture)](#1-सुरक्षा-एवं-अनुपालन-वास्तुकला)
   - [HTTP सुरक्षा हेडर्स](#http-सुरक्षा-हेडर्स)
   - [दोहरी टोकन प्रमाणीकरण प्रणाली (Dual JWT Auth)](#दोहरी-टोकन-प्रमाणीकरण-प्रणाली)
   - [टाइमिंग-हमला रोधी सत्यापन (Timing-Safe Comparison)](#टाइमिंग-हमला-रोधी-सत्यापन)
   - [इन-मेमोरी आईपी दर-सीमन (IP Rate Limiting)](#इन-मेमोरी-आईपी-दर-सीमन)
   - [इनपुट सैनिटाइजेशन व पेलोड सीमा](#इनपुट-सैनिटाइजेशन-व-पेलोड-सीमा)
   - [Zero-PII गोपनीयता व मास्किंग](#zero-pii-गोपनीयता-व-मास्किंग)
2. [प्रमाणीकरण एवं सत्र प्रबंधन (Authentication & Session APIs)](#2-प्रमाणीकरण-एवं-सत्र-प्रबंधन)
3. [सार्वजनिक कृषि व वैज्ञानिक परामर्श APIs (Agronomic & Advisory APIs)](#3-सार्वजनिक-कृषि-व-वैज्ञानिक-परामर्श-apis)
4. [डायनामिक OGD भारत सरकार लाइव इंजन (Zero-Fake-Data OGD Engine)](#4-डायनामिक-ogd-भारत-सरकार-लाइव-इंजन)
5. [लाइव मंडी भाव, ऑफ़लाइन सिंक व व्यापार APIs (Mandi & Marketplace)](#5-लाइव-मंडी-भाव-ऑफ़लाइन-सिंक-व-व्यापार-apis)
6. [मशीनरी रेंटल एवं किसान चौपाल APIs (Machinery & Community Q&A)](#6-मशीनरी-रेंटल-एवं-किसान-चौपाल-apis)
7. [मेरा खेत: बहु-प्लॉट प्रबंधन व फसल डायरी APIs (Multi-Plot & Diary APIs)](#7-मेरा-खेत-बहु-प्लॉट-प्रबंधन-व-फसल-डायरी-apis)
8. [सुपर एडमिन कमांड, टेलीमेट्री व लाइव हेल्थ चेकर APIs (Admin Command Center)](#8-सुपर-एडमिन-कमांड-टेलीमेट्री-व-लाइव-हेल्थ-चेकर-apis)
9. [सुरक्षा परीक्षण एवं पेनिट्रेशन टेस्टिंग प्लेबुक (Security Testing Playbook)](#9-सुरक्षा-परीक्षण-एवं-पेनिट्रेशन-टेस्टिंग-प्लेबुक)
10. [आधिकारिक पोस्टमैन कलेक्शन (Official Postman Collection v2.1.0)](#10-आधिकारिक-पोस्टमैन-कलेक्शन)
11. [ओपनएपीआई विनिर्देश व रनटाइम रिक्वेस्ट वैलिडेशन (OpenAPI 3.0.3 YAML & Validation)](#11-ओपनएपीआई-विनिर्देश-व-रनटाइम-रिक्वेस्ट-वैलिडेशन)

---

## 1. सुरक्षा एवं अनुपालन वास्तुकला

### HTTP सुरक्षा हेडर्स
प्रत्येक API प्रतिक्रिया (Response) में निम्नलिखित कड़े OWASP सुरक्षा हेडर्स अंतर्निहित होते हैं:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), geolocation=(self), microphone=()
X-Permitted-Cross-Domain-Policies: none
```

### दोहरी टोकन प्रमाणीकरण प्रणाली
एप्लिकेशन दो अलग-अलग भूमिकाओं हेतु पृथक क्रिप्टोग्राफ़िक टोकन (HMAC-SHA256) का उपयोग करता है:
1. **किसान सत्र (Farmer Session):** 7-दिवसीय जीवनकाल (`7 * 86400` सेकंड्स), जिसमें केवल `{ phone, id, role: 'farmer' }` शामिल होता है।
2. **सुपर एडमिन सत्र (Admin Session):** सख्त 2-घंटे का जीवनकाल (`7200` सेकंड्स), जिसमें `{ role: 'superadmin', authTime }` एन्कोड होता है।

### टाइमिंग-हमला रोधी सत्यापन
पासकी एवं पिन का सत्यापन साइड-चैनल टाइमिंग हमलों (Side-Channel Timing Attacks) से सुरक्षित है:
```javascript
// Node.js crypto.timingSafeEqual द्वारा तुलना
const hashA = crypto.createHash('sha256').update(inputPin).digest();
const hashB = crypto.createHash('sha256').update(storedPin).digest();
return crypto.timingSafeEqual(hashA, hashB);
```

### इन-मेमोरी आईपी दर-सीमन (IP Rate Limiting)
सर्वर कोटा और DDoS से बचाव हेतु विभिन्न एंडपॉइंट्स पर दर सीमा लागू है:
- `/api/crop-doctor/diagnose`: 15 अनुरोध / मिनट / IP
- `/api/mandi-rates/refresh`: 10 अनुरोध / मिनट / IP
- `/api/machinery` (POST): 10 अनुरोध / मिनट / IP
- `/api/farmer/auth`: 15 अनुरोध / मिनट / IP
- `/api/admin/login`: **5 प्रयास / 15 मिनट** (असफल होने पर स्वचालित 15-मिनट लॉकआउट)

### इनपुट सैनिटाइजेशन व पेलोड सीमा
- JSON बॉडी सीमा: अधिकतम 10MB (कैमरा फोटो अपलोड के लिए)
- NoSQL Injection / XSS रोकथाम: सभी इनपुट स्ट्रिंग्स से `<>` और टैग्स को स्ट्रिप किया जाता है।
- लंबाई सीमा: नाम (80 वर्ण), प्रश्न (500 वर्ण), सामान्य इनपुट (200 वर्ण)।

### Zero-PII गोपनीयता व मास्किंग
- एडमिन द्वारा किसान सूची देखने पर मोबाइल नंबर मास्क्ड रूप में आता है: `98••••••12`।
- आधार नंबर, बैंक खाता संख्या, DBT खाता, और ज़मीन की खतौनी PIN कभी भी सर्वर द्वारा स्टोर या लॉग नहीं किए जाते।

---

## 2. प्रमाणीकरण एवं सत्र प्रबंधन

### 2.1 किसान प्रमाणीकरण (Farmer Login / Quick Auth)
* **एंडपॉइंट:** `POST /api/farmer/auth`
* **प्रमाणीकरण:** आवश्यक नहीं (सार्वजनिक)
* **रेट लिमिट:** 15 अनुरोध / मिनट
* **अनुरोध बॉडी (Request Body):**
```json
{
  "phone": "9876543210",
  "name": "रामेश्वर साहू",
  "pin": "1234",
  "village": "आरंग",
  "district": "रायपुर",
  "totalLandAcres": 3.5
}
```
* **सफल प्रतिक्रिया (HTTP 200 / 201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "farmer": {
    "_id": "6703bc987a123f...",
    "phone": "9876543210",
    "name": "रामेश्वर साहू",
    "village": "आरंग",
    "district": "रायपुर",
    "totalLandAcres": 3.5,
    "plots": []
  }
}
```
* **त्रुटि कोड:**
  - `400 Bad Request`: अमान्य 10-अंकीय भारतीय मोबाइल नंबर।
  - `401 Unauthorized`: गलत 4-अंकीय पिन।
  - `429 Too Many Requests`: 1 मिनट में 15 से अधिक प्रयास।

---

### 2.2 सुपर एडमिन लॉगिन (Super Admin Passkey Login)
* **एंडपॉइंट:** `POST /api/admin/login`
* **प्रमाणीकरण:** आवश्यक नहीं
* **रेट लिमिट:** 5 प्रयास / 15 मिनट (कड़ा ब्रूट-फ़ोर्स लॉकआउट)
* **अनुरोध बॉडी:**
```json
{
  "passkey": "your_secure_admin_passkey",
  "username": "kisan_admin"
}
```
* **सफल प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "superadmin",
  "expiresIn": 7200,
  "message": "सुपर एडमिन प्रमाणीकरण सफल।"
}
```
* **त्रुटि कोड:**
  - `401 Unauthorized`: अमान्य एडमिन पासकी।
  - `429 Too Many Requests`: 15 मिनट हेतु लॉकआउट।

---

## 3. सार्वजनिक कृषि व वैज्ञानिक परामर्श APIs

### 3.1 प्रमुख फसलें (Crops Catalog)
* **विधि:** `GET /api/crops`
* **प्रतिक्रिया (HTTP 200):**
```json
[
  {
    "id": "paddy",
    "name": "धान (Paddy)",
    "scientificName": "Oryza sativa",
    "season": "खरीफ (Kharif)",
    "durationDays": "120-140 दिन",
    "msp": "₹2,300 (MSP) + ₹800 बोनस = ₹3,100 / क्विंटल",
    "targetYield": "20-25 क्विंटल / एकड़",
    "idealPh": "5.5 - 6.5 (हल्की अम्लीय से सामान्य)",
    "varieties": ["सरना", "महामाया", "एच.एम.टी.", "स्वर्णा"]
  }
]
```

### 3.2 अनुशंसित खाद मात्रा (Fertilizer Dosages)
* **विधि:** `GET /api/fertilizers`
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "paddy": {
    "cropId": "paddy",
    "cropName": "धान (Paddy)",
    "ureaBags": 2.2,
    "dapBags": 1.1,
    "mopBags": 0.7,
    "zincKg": 5,
    "schedule": {
      "basal": "पूरी DAP (50 kg) + पोटाश (20 kg) + जिंक",
      "firstTop": "यूरिया (45 kg) कल्ले फूटते समय",
      "secondTop": "यूरिया (30 kg) + पोटाश (10 kg) बालियां निकलते समय"
    }
  }
}
```

### 3.3 एआई फसल डॉक्टर लाइव विज़न निदान (Multimodal Vision AI)
* **विधि:** `POST /api/crop-doctor/diagnose`
* **रेट लिमिट:** 15 स्कैन / मिनट / IP
* **अनुरोध बॉडी:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
  "cropId": "paddy",
  "district": "रायपुर"
}
```
* **सफल प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "isLiveAi": true,
  "cropName": "धान",
  "diseaseName": "झुलसा रोग (Blast Disease)",
  "confidencePercent": 94,
  "symptoms": "पत्तियों पर कत्थई रंग के नाव के आकार के धब्बे।",
  "organicRemedy": "नीम तेल 5 मिली/लीटर अथवा ट्राइकोडर्मा का छिड़काव।",
  "chemicalRemedy": "ट्राईसाइक्लाजोल 75% WP (120 ग्राम/एकड़)।",
  "prevention": "संतुलित यूरिया का उपयोग करें, खेत में जल निकासी रखें।",
  "spraySafety": "कटाई से 21 दिन पूर्व छिड़काव बंद करें (PHI: 21 दिन)।"
}
```

---

## 4. डायनामिक OGD भारत सरकार लाइव इंजन (Zero Fake Data)

### 4.1 CIB&RC सरकारी पंजीकृत कीटनाशक व PHI (Safe Formulations)
* **विधि:** `GET /api/cibrc-pesticides?cropId=paddy&pest=stemborer`
* **क्वेरी पैरामीटर्स:**
  - `cropId` (वैकल्पिक): फसल आईडी (`paddy`, `wheat`, `chana` आदि)
  - `pest` (वैकल्पिक): कीट का नाम
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "count": 2,
  "hasCibrcLabelClaim": true,
  "isLive": true,
  "isCached": true,
  "verifiedAuthority": "CIB&RC (केंद्रीय कीटनाशी बोर्ड, भारत सरकार)",
  "data": [
    {
      "id": "cibrc-paddy-stemborer-1",
      "cropId": "paddy",
      "cropName": "धान (Paddy)",
      "targetPest": "तना छेदक (Yellow Stem Borer)",
      "genericName": "क्लोरएंट्रानिलिप्रोल 18.5% SC (Chlorantraniliprole 18.5% SC)",
      "dosagePerAcre": "60 मिली / एकड़",
      "dosagePerPump15L": "6 मिली प्रति 15L पंप (टंकी)",
      "phiDays": 21,
      "toxicityClass": "हरा त्रिकोण (Green Triangle - कम विषाक्त)",
      "cibrcRegRef": "CIB&RC Reg. CIR-58212/2008 / IRAC MoA Group 28",
      "safetyEquipment": "मास्क, रबर दस्ताने पहनें।"
    }
  ]
}
```

### 4.2 DAC&FW जिला मृदा स्वास्थ्य कार्ड सर्वेक्षण (Soil Health Baseline)
* **विधि:** `GET /api/soil-health/:district`
* **पैरामीटर:** `district` (उदा. `रायपुर`, `दुर्ग`, `बिलासपुर`)
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "isDistrictVerified": true,
  "isLive": true,
  "data": {
    "district": "रायपुर",
    "state": "छत्तीसगढ़",
    "nitrogenStatus": "निम्न (Low)",
    "phosphorusStatus": "मध्यम (Medium)",
    "potashStatus": "मध्यम (Medium)",
    "phAverage": "6.4 (हल्की अम्लीय से सामान्य)",
    "organicCarbonPercent": "0.48% (मध्यम)",
    "dominantSoilType": "मटासी एवं डोर्सा",
    "micronutrientDeficiencies": [
      { "nutrient": "जिंक (Zinc - Zn)", "deficiencyPercent": 42, "severity": "उच्च कमी" }
    ],
    "fertilizerRecommendationNote": "रायपुर क्षेत्र में 42% खेतों में जिंक की कमी पाई गई है। रोपाई के समय 5 kg जिंक सल्फेट प्रति एकड़ अवश्य मिलाएं।",
    "officialSurveySource": "Soil Health Card Portal, DAC&FW / भारत सरकार"
  }
}
```

### 4.3 CACP न्यूनतम समर्थन मूल्य मानक (MSP Benchmarks)
* **विधि:** `GET /api/msp-benchmarks`
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "year": "2024-25",
  "verifiedAuthority": "कृषि लागत एवं मूल्य आयोग (CACP, भारत सरकार)",
  "data": [
    {
      "cropId": "paddy",
      "cropName": "धान (Paddy - Common)",
      "season": "खरीफ (Kharif)",
      "nationalMspPerQuintal": 2300,
      "stateBonusPerQuintal": 800,
      "effectiveFarmerPrice": 3100,
      "procurementLimitPerAcre": "21 क्विंटल प्रति एकड़",
      "statutoryNotificationRef": "CACP Kharif Price Policy / CG Cabinet Resolution #3100"
    }
  ]
}
```

---

## 5. लाइव मंडी भाव, ऑफ़लाइन सिंक व व्यापार APIs

### 5.1 लाइव Agmarknet मंडी भाव
* **विधि:** `GET /api/mandi-rates?district=रायपुर&force=false`
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "isLive": true,
  "source": "Agmarknet / छत्तीसगढ़ मंडी बोर्ड (लाइव)",
  "lastUpdated": "2026-10-07T05:00:00.000Z",
  "rates": [
    {
      "mandi": "रायपुर",
      "district": "रायपुर",
      "crop": "धान (Paddy)",
      "variety": "सरना",
      "minRate": 2320,
      "maxRate": 3100,
      "modalRate": 3100,
      "arrival": "420 टन"
    }
  ]
}
```

### 5.2 ऑफ़लाइन पूछताछ सिंक (Offline Query Resolution)
* **विधि:** `POST /api/mandi-rates/offline-query`
* **अनुरोध बॉडी:**
```json
{
  "crop": "धान",
  "mandi": "रायपुर",
  "district": "रायपुर"
}
```
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "success": true,
  "resolved": true,
  "rateData": {
    "crop": "धान (Paddy)",
    "mandi": "रायपुर",
    "modalRate": 3100
  },
  "message": "धान का सत्यापित भाव: ₹3100/क्विंटल (रायपुर)"
}
```

### 5.3 किसान उपज बिक्री लिस्टिंग (Marketplace)
* **सूची प्राप्त करें:** `GET /api/marketplace`
* **नई उपज पोस्ट करें:** `POST /api/marketplace`
* **अनुरोध बॉडी:**
```json
{
  "crop": "सुगंधित दुबराज धान",
  "quantity": "40 क्विंटल",
  "expectedPrice": "₹3,400 / क्विंटल",
  "farmerName": "दीपक पटेल",
  "location": "धमतरी",
  "phone": "9876543210"
}
```

---

## 6. मशीनरी रेंटल एवं किसान चौपाल APIs

### 6.1 मशीनरी रेंटल (Machinery Rental)
* **सूची प्राप्त करें:** `GET /api/machinery`
* **मशीन जोड़ें:** `POST /api/machinery`
```json
{
  "title": "स्वराज ट्रैक्टर 50 HP + रोटावेटर",
  "category": "जुताई एवं खेत तैयारी",
  "rate": "₹1,000 / घंटा",
  "operatorIncluded": true,
  "contactName": "रमेश पटेल",
  "phone": "9876543210",
  "location": "आरंग, रायपुर",
  "features": ["गहरी जुताई", "रोटावेटर"]
}
```

### 6.2 चौपाल चर्चा (Community Q&A)
* **प्रश्न सूची:** `GET /api/community-qa`
* **सवाल पूछें:** `POST /api/community-qa` (`{ "author": "किसान भाई", "crop": "धान", "question": "..." }`)
* **जवाब दें:** `POST /api/community-qa/:id/reply` (`{ "author": "डॉ. वर्मा", "role": "कृषि वैज्ञानिक", "text": "..." }`)

---

## 7. मेरा खेत: बहु-प्लॉट प्रबंधन व फसल डायरी APIs

> 🔒 **नोट:** इन सभी एंडपॉइंट्स हेतु हेडर में `Authorization: Bearer <Farmer_JWT_Token>` अनिवार्य है।

### 7.1 किसान प्रोफ़ाइल व खेत (Get Profile & Plots)
* **विधि:** `GET /api/farmer/profile/:phone`
* **हेडर:** `Authorization: Bearer <token>`

### 7.2 खेत जोड़ना या अपडेट करना (Add / Update Plot)
* **विधि:** `POST /api/farmer/plots/:phone`
* **हेडर:** `Authorization: Bearer <token>`
* **अनुरोध बॉडी:**
```json
{
  "plotId": "plot-1728281920",
  "plotName": "बड़ा खेत (नहर पार)",
  "cropId": "paddy",
  "cropName": "धान (सरना)",
  "areaAcres": 2.5,
  "sowDate": "2026-06-25",
  "season": "खरीफ (Kharif)",
  "notes": "बेसल खाद डल चुकी है"
}
```

### 7.3 खेत हटाना (Delete Plot)
* **विधि:** `DELETE /api/farmer/plots/:phone/:plotId`
* **हेडर:** `Authorization: Bearer <token>`

### 7.4 फसल कार्य पूर्णता टॉगल (Toggle Plot Task)
* **विधि:** `POST /api/farmer/tasks/:phone`
* **अनुरोध बॉडी:** `{ "plotId": "plot-1728281920", "taskId": "basal_fertilizer" }`

### 7.5 फसल डायरी क्लाउड सिंक (Farm Diary Sync)
* **डायरी प्राप्त करें:** `GET /api/farmer/diary/:phone`
* **नई प्रविष्टि जोड़ें:** `POST /api/farmer/diary/:phone` (`{ "cropName": "धान", "areaAcres": 2.5, "sowDate": "2026-06-25", "stage": "कल्ले फूटना", "nextAction": "यूरिया टॉप ड्रेसिंग" }`)
* **प्रविष्टि हटाएं:** `DELETE /api/farmer/diary/:phone/:entryId`

---

## 8. सुपर एडमिन कमांड, टेलीमेट्री व लाइव हेल्थ चेकर APIs

> 🛡️ **नोट:** इन सभी एंडपॉइंट्स हेतु हेडर में `Authorization: Bearer <SuperAdmin_JWT_Token>` अनिवार्य है।

### 8.1 लाइव API हेल्थ चेकर (Comprehensive Live Health Checker)
* **विधि:** `GET /api/admin/api-health`
* **हेडर:** `Authorization: Bearer <admin_token>`
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "checkedAt": "2026-10-07T05:10:00.000Z",
  "durationMs": 420,
  "overallStatus": "optimal",
  "summary": { "total": 9, "connected": 9, "warning": 0, "offline": 0 },
  "services": [
    {
      "id": "mongodb",
      "name": "MongoDB Atlas क्लस्टर",
      "category": "कोर डेटाबेस",
      "status": "connected",
      "statusLabel": "सक्रिय (Connected)",
      "latencyMs": 45,
      "message": "डेटाबेस: kisan_saathi (सक्रिय)"
    },
    {
      "id": "data_gov_in",
      "name": "data.gov.in (OGD India / Agmarknet)",
      "category": "मंडी दर API",
      "status": "connected",
      "statusLabel": "सक्रिय (Live Mandi Stream)",
      "latencyMs": 180,
      "compliance": "GODL-India 100% अनुपालित"
    },
    {
      "id": "gemini_ai",
      "name": "Google Gemini Multimodal AI",
      "category": "फसल डॉक्टर विज़न AI",
      "status": "connected",
      "statusLabel": "सक्रिय (Gemini Ready)",
      "latencyMs": 110
    },
    {
      "id": "open_meteo",
      "name": "Open-Meteo Weather API",
      "category": "मौसम व वर्षा पूर्वानुमान",
      "status": "connected",
      "latencyMs": 85
    }
  ]
}
```

### 8.2 प्लेटफॉर्म टेलीमेट्री व आंकड़े (Platform Stats)
* **विधि:** `GET /api/admin/stats`
* **प्रतिक्रिया (HTTP 200):**
```json
{
  "metrics": {
    "totalFarmers": 1420,
    "totalPlots": 2840,
    "totalPlotAcres": 6250.5,
    "totalMarketListings": 48,
    "totalCommunityQAs": 125,
    "totalMandiRates": 60,
    "activeBroadcasts": 3
  },
  "districtStats": [
    { "district": "रायपुर", "farmersCount": 450, "totalAcreage": 1980.0 },
    { "district": "दुर्ग", "farmersCount": 380, "totalAcreage": 1640.5 }
  ],
  "systemHealth": {
    "uptimeSeconds": 145020,
    "memoryRssMb": 94,
    "nodeVersion": "v20.x",
    "environment": "production"
  }
}
```

### 8.3 किसान ऑडिट रजिस्ट्री (Privacy-Preserved Registry)
* **विधि:** `GET /api/admin/farmers?limit=30&district=रायपुर`
* **प्रतिक्रिया (HTTP 200):**
```json
[
  {
    "phoneMasked": "98••••••10",
    "name": "रामेश्वर साहू",
    "district": "रायपुर",
    "village": "आरंग",
    "plotsCount": 2,
    "totalLandAcres": 3.5,
    "createdAt": "2026-10-01T10:00:00.000Z"
  }
]
```

### 8.4 आपातकालीन किसान अलर्ट जारी करना (Broadcast Advisories)
* **प्रसारण सूची:** `GET /api/admin/broadcasts`
* **नया अलर्ट जारी करें:** `POST /api/admin/broadcasts`
```json
{
  "title": "🌧️ मौसम चेतावनी: भारी वर्षा की संभावना",
  "category": "weather",
  "severity": "urgent",
  "message": "अगले 48 घंटों में भारी बारिश की चेतावनी। यूरिया व कीटनाशक छिड़काव तुरंत रोकें।",
  "targetDistrict": "all",
  "author": "कृषि विज्ञान केंद्र / मौसम विभाग"
}
```
* **अलर्ट निरस्त करें:** `DELETE /api/admin/broadcasts/:id`

---

## 9. सुरक्षा परीक्षण एवं पेनिट्रेशन टेस्टिंग प्लेबुक

### टेस्ट 1: ब्रूट-फ़ोर्स लॉकआउट परीक्षण (Admin Lockout Test)
```bash
# गलत पासकी के साथ 5 बार लगातार अनुरोध भेजें:
for i in {1..6}; do
  curl -s -X POST https://kisan.init65.co.in/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"passkey":"wrong_pass"}'
done
# छठा अनुरोध 'HTTP 429 Too Many Requests' लौटाएगा।
```

### टेस्ट 2: XSS व NoSQL इंजेक्शन सैनिटाइजेशन परीक्षण
```bash
curl -X POST https://kisan.init65.co.in/api/community-qa \
  -H "Content-Type: application/json" \
  -d '{"author":"<script>alert(1)</script>किसान","crop":"धान","question":"<b onmouseover=alert(1)>पत्ती पीली हो रही है?</b>"}'
# सर्वर केवल शुद्ध टेक्स्ट "किसान" और "पत्ती पीली हो रही है?" को डेटाबेस में सहेजेगा।
```

### टेस्ट 3: अनाधिकृत किसान डेटा एक्सेस परीक्षण (Unauthorized Access Test)
```bash
# बिना Bearer टोकन के किसान प्रोफाइल एक्सेस का प्रयास:
curl -i https://kisan.init65.co.in/api/farmer/profile/9876543210
# अपेक्षित परिणाम: HTTP 401 Unauthorized
```

---

## 10. आधिकारिक पोस्टमैन कलेक्शन (Official Postman Collection v2.1.0)

डेवलपर्स, कृषि विज्ञान केंद्रों एवं तकनीकी परीक्षकों के लिए सभी बाहरी और आंतरिक APIs का रेडी-टू-यूज़ पोस्टमैन कलेक्शन तैयार किया गया है:

* **कलेक्शन फ़ाइल:** [`docs/kisan_saathi_postman_collection.json`](file:///c:/Users/LENOVO/Desktop/init/kisan/docs/kisan_saathi_postman_collection.json)
* **पोस्टमैन स्कीमा संस्करण:** Postman Collection v2.1.0

### (क) पोस्टमैन में इम्पोर्ट करने की विधि:
1. अपने कंप्यूटर पर **Postman** खोलें।
2. ऊपरी बाएं कोने में **"Import"** बटन दबाएं।
3. `docs/kisan_saathi_postman_collection.json` फ़ाइल को ड्रैग-एंड-ड्रॉप करें या सेलेक्ट करें।
4. कलेक्शन तुरंत **"Kisan Saathi - Complete Platform & External APIs Collection"** नाम से आपके वर्कस्पेस में जुड़ जाएगा।

### (ख) पहले से कॉन्फ़िगर किए गए 9 मुख्य फ़ोल्डर्स (कुल 52 एंडपॉइंट्स):
1. **🌾 1. External Agri & OGD APIs (भारत सरकार) (5 एंडपॉइंट्स):**
   - Agmarknet Live Mandi Rates (`data.gov.in`)
   - Agmarknet Mandi Rates Backup Mirror (`mandi-api.onrender.com`)
   - CIB&RC Approved Safe Pesticides Dataset
   - District Soil Health Survey Baseline Dataset
   - CACP Official MSP Benchmarks Dataset
2. **🌦️ 2. Live Weather & Agro-Advisory API (Open-Meteo) (3 एंडपॉइंट्स):**
   - Raipur HQ Live Weather & Spray Advisory
   - Bilaspur District Forecast
   - Bastar Tribal Agro-Climatic Zone Forecast
3. **🤖 3. AI Vision Crop Doctor (Google Gemini AI) (2 एंडपॉइंट्स):**
   - Direct Multimodal Gemini 2.5 Flash Vision API
   - Kisan Saathi Proxied Diagnostic Engine (`/api/doctor/diagnose`)
4. **📮 4. Postal Directory & Village API (India Post) (3 एंडपॉइंट्स):**
   - 492001 (Raipur) Pincode & Villages Lookup
   - 495001 (Bilaspur) Pincode & Villages Lookup
   - 494001 (Bastar) Pincode & Villages Lookup
5. **🌾 5. Agronomy & Scientific Advisory APIs (6 एंडपॉइंट्स):**
   - `/api/version` (In-App Update Engine & Integrity Hash)
   - `/api/crops` (Master Crop Catalog)
   - `/api/fertilizers` (Scientific NPK Dosages)
   - `/api/diseases` (Symptoms Library)
   - `/api/schemes` (Government Subsidies & Rates)
   - `/api/admin/broadcasts` (Public Emergency Broadcasts)
6. **🏪 6. Mandi Rates & Farm Marketplace APIs (8 एंडपॉइंट्स):**
   - `/api/mandi-rates` (Proxied Live Rates)
   - `/api/mandi-rates/refresh` (Manual Cache Refresh)
   - `/api/mandi-rates/offline-sync` (Sync Offline Queries)
   - `/api/mandi-rates/pesticides` (CIBRC Local Proxy)
   - `/api/mandi-rates/soil-health` (Soil Health Survey Proxy)
   - `/api/mandi-rates/msp-benchmarks` (CACP MSP Benchmark Proxy)
   - `/api/marketplace` (GET Active Listings)
   - `/api/marketplace` (POST New Direct Produce Listing)
7. **🚜 7. Farm Machinery & Chaupal Community APIs (5 एंडपॉइंट्स):**
   - `/api/machinery` (GET Equipment Rentals)
   - `/api/machinery` (POST Rent Equipment Listing)
   - `/api/community-qa` (GET Q&A Feed)
   - `/api/community-qa` (POST Ask Agri Question)
   - `/api/community-qa/:id/answer` (POST Farmer/Expert Reply)
8. **🌾 8. Farmer Auth, Multi-Plot & Farm Diary APIs (8 एंडपॉइंट्स):**
   - `/api/farmer/auth` (1-Click JWT Quick Auth)
   - `/api/farmer/profile/:phone` (Fetch Profile & Plots)
   - `/api/farmer/plot` (POST Add/Update Farm Plot)
   - `/api/farmer/plot/:plotId` (DELETE Plot)
   - `/api/farmer/plot/:plotId/task/:taskId/toggle` (Toggle Lifecycle Task)
   - `/api/farmer/diary/:phone` (GET Farm Diary Entries)
   - `/api/farmer/diary` (POST New Expense/Income Record)
   - `/api/farmer/diary/:entryId` (DELETE Diary Entry)
9. **🛡️ 9. Super Admin Command Center & Health APIs (12 एंडपॉइंट्स):**
   - `/api/admin/login` (Secure Passkey Auth)
   - `/api/admin/stats` (Platform Usage Metrics)
   - `/api/admin/farmers` (Farmer Registry Audit - Masked PII)
   - `/api/admin/broadcasts` (GET All Broadcasts)
   - `/api/admin/broadcasts` (POST Publish Advisory Alert)
   - `/api/admin/broadcasts/:id` (DELETE Broadcast Alert)
   - `/api/admin/marketplace/:id/status` (Listing Moderation)
   - `/api/admin/community-qa/:id/status` (Q&A Content Moderation)
   - `/api/admin/health` (Telemetry Live Health Probe)
   - `/api/admin/external-config` (External API Configuration Probe)
   - `/api/admin/audit-logs` (Security Event Logs)
   - `/api/admin/audit-logs` (DELETE Purge Audit Logs)

### (ग) अंतर्निहित पर्यावरण चर (Environment Variables):
कलेक्शन में निम्नलिखित चर पहले से सुरक्षित रूप से परिभाषित हैं:
* `{{BASE_URL}}`: `https://kisan-saathi-api-4sdo.onrender.com/api` (या स्थानीय `http://localhost:8000/api`)
* `{{MANDI_API_BASE_URL}}`: `https://api.data.gov.in/resource/`
* `{{OGD_API_KEY}}`: OGD प्लेटफॉर्म API की
* `{{GEMINI_API_KEY}}`: Google Gemini API की
* `{{ADMIN_PIN}}`: सुपर एडमिन ऑथराइजेशन पिन
* `{{ADMIN_TOKEN}}`: सुपर एडमिन प्रमाणीकरण Bearer टोकन
* `{{FARMER_PHONE}}`: टेस्ट किसान मोबाइल नंबर (उदा. `9876543210`)
* `{{FARMER_TOKEN}}`: किसान लॉगिन से प्राप्त होने वाला JWT Bearer टोकन

---

## 11. ओपनएपीआई विनिर्देश व रनटाइम रिक्वेस्ट वैलिडेशन (OpenAPI 3.0.3 YAML & Validation)

### (क) आधिकारिक OpenAPI 3.0.3 विनिर्देश फ़ाइल
* **फ़ाइल पथ:** [`docs/openapi.yaml`](file:///c:/Users/LENOVO/Desktop/init/kisan/docs/openapi.yaml)
* **लाइव एंडपॉइंट:** `GET /openapi.yaml` या `GET /api/openapi.yaml`
* **कवरेज:** किसान साथी के सभी 52 एंडपॉइंट्स, स्कीमा, क्वेरी/पाथ पैरामीटर्स, और दोहरी सुरक्षा स्कीमा (`FarmerBearerAuth`, `AdminBearerAuth`)।

### (ख) रनटाइम रिक्वेस्ट वैलिडेशन मिडिलवेयर (`server/middleware/validate.js`)
सभी इनकमिंग पेलोड्स को कंट्रोलर निष्पादन से पहले स्वचालित रूप से वैलिडेट और सैनिटाइज किया जाता है:
1. **भारतीय मोबाइल नंबर सामान्यीकरण:** `+91`, रिक्त स्थान, या हाइफ़न स्वतः हटाकर `^[6-9]\d{9}$` 10-अंकीय प्रारूप में सामान्यीकृत।
2. **NoSQL व XSS इंजेक्शन रोकथाम:** अमान्य ऑब्जेक्ट्स (उदा. `{"$ne": null}`) तुरंत रिजेक्ट; HTML टैग्स स्ट्रिप।
3. **प्रोटोटाइप पॉल्यूशन गार्ड:** `__proto__`, `constructor`, `prototype` वाले दुर्भावनापूर्ण पेलोड्स 400 सुरक्षा उल्लंघन के रूप में ब्लॉक।
4. **अतिरिक्त फ़ील्ड प्रतिबंध (`additionalProperties: false`):** अनधिकृत कुंजियों (जैसे किसान द्वारा `role: 'superadmin'`) का इंजेक्शन असंभव।
5. **सरल व किसान-अनुकूल 400 त्रुटि संदेश:** तकनीकी अंग्रेजी के स्थान पर स्पष्ट हिंदी मार्गदर्शन प्रतिक्रिया।

#### उदाहरण 400 Bad Request त्रुटि प्रतिक्रिया:
```json
{
  "success": false,
  "status": 400,
  "field": "phone",
  "error": "कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)।",
  "technicalError": "Invalid Indian phone number: '12345'"
}
```



