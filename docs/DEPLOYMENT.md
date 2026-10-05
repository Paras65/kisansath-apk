# 🚀 किसान साथी (Kisan Saathi) - Cloudflare Pages & Render Deployment Guide

यह गाइड **किसान साथी** प्लेटफॉर्म को आधुनिक क्लाउड आर्किटेक्चर पर डिप्लॉय करने के लिए तैयार की गई है:
- **Frontend (PWA & Web):** Cloudflare Pages (ग्लोबल CDN, अल्ट्रा-फास्ट, 100% अपटाइम)
- **Backend (REST API):** Render (`render.com` Node.js Web Service)
- **Database:** MongoDB Atlas (क्लाउड डेटाबेस क्लस्टर)

---

## 📑 विषय-सूची (Table of Contents)
1. [वास्तुकला एवं आवश्यकताएं (Architecture & Prerequisites)](#1-वास्तुकला-एवं-आवश्यकताएं)
2. [भाग 1: MongoDB Atlas डेटाबेस तैयारी व सीडिंग](#2-भाग-1-mongodb-atlas-डेटाबेस-तैयारी-व-सीडिंग)
3. [भाग 2: Render पर Backend डिप्लॉयमेंट](#3-भाग-2-render-पर-backend-डिप्लॉयमेंट)
4. [भाग 3: Cloudflare Pages पर Frontend डिप्लॉयमेंट](#4-भाग-3-cloudflare-pages-पर-frontend-डिप्लॉयमेंट)
5. [भाग 4: कस्टम डोमेन सेटअप](#5-भाग-4-कस्टम-डोमेन-सेटअप-kisaninit65coin-व-kisanapiinit65coin)
6. [भाग 5: CORS एवं एन्वायरनमेंट सिंक्रोनाइज़ेशन](#6-भाग-5-cors-एवं-एन्वायरनमेंट-सिंक्रोनाइज़ेशन)
7. [भाग 6: सुरक्षा एवं प्रोडक्शन चेकलिस्ट](#7-भाग-6-सुरक्षा-एवं-प्रोडक्शन-चेकलिस्ट)

---

## 1. वास्तुकला एवं आवश्यकताएं

| घटक (Component) | प्लेटफॉर्म (Platform) | पोर्ट / रूट (Port / Route) | बिल्ड / स्टार्ट कमांड |
| :--- | :--- | :--- | :--- |
| **Frontend PWA** | Cloudflare Pages | ग्लोबल CDN (`dist/`) | `npm run build` |
| **Backend API** | Render Web Service | `5000` / `$PORT` | `npm install` && `npm start` |
| **डेटाबेस** | MongoDB Atlas | Port `27017` (TLS) | Mongoose Cluster connection |

---

## 2. भाग 1: MongoDB Atlas डेटाबेस तैयारी व सीडिंग

1. **क्लस्टर नेटवर्क एक्सेस (Network Access):**
   - MongoDB Atlas कंसोल में जाएं (`cloud.mongodb.com`)।
   - **Network Access** > **Add IP Address** पर क्लिक करें।
   - `0.0.0.0/0` (Allow Access from Anywhere) जोड़ें ताकि Render और लोकल एनवायरनमेंट कनेक्ट हो सकें।
2. **डेटाबेस सीडिंग (Database Seeding):**
   - अपने लोकल टर्मिनल में MongoDB Atlas में शुरुआती डेटा लोड करने के लिए चलाएं:
     ```bash
     npm run seed
     ```
   - यह कमांड फसलों, खाद अनुपातों, कीट-रोगों, लाइव मंडी भावों और सरकारी योजनाओं को डेटाबेस में लोड कर देगा।

---

## 3. भाग 2: Render पर Backend डिप्लॉयमेंट

### विकल्प A: Render Blueprint (अनुशंसित - ऑटोमैटिक 1-क्लिक)
1. अपने कोड को GitHub रिपॉजिटरी में पुश करें।
2. [dashboard.render.com](https://dashboard.render.com) पर जाएं।
3. **New +** > **Blueprint** पर क्लिक करें।
4. अपनी GitHub रिपॉजिटरी चुनें। रिपॉजिटरी में मौजूद `render.yaml` स्वतः सभी सेटिंग्स लोड कर लेगा।
5. एनवायरनमेंट वेरिएबल्स दर्ज करें:
   - `MONGODB_URI`: आपका MongoDB Atlas कनेक्शन स्ट्रिंग।
   - `CLIENT_URL`: आपका Cloudflare Pages URL (उदा. `https://kisan-saathi.pages.dev`)।
6. **Apply** पर क्लिक करें। आपका बैकएंड तैयार हो जाएगा।

### विकल्प B: मैन्युअल Web Service बनाना
1. Render डैशबोर्ड में **New +** > **Web Service** चुनें।
2. अपनी GitHub रिपॉजिटरी कनेक्ट करें।
3. सेटिंग्स कॉन्फ़िगर करें:
   - **Name:** `kisan-saathi-api`
   - **Region:** Singapore (एशिया प्रशांत - न्यूनतम लेटेंसी)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (या `node server/index.js`)
   - **Health Check Path:** `/health`
4. **Environment Variables** जोड़ें:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb+srv://...` |
   | `CLIENT_URL` | `https://kisan-saathi.pages.dev` |
5. **Create Web Service** दबाएं। कुछ ही मिनटों में आपका बैकएंड लाइव हो जाएगा (उदा. `https://kisan-saathi-api.onrender.com`)।

---

## 4. भाग 3: Cloudflare Pages पर Frontend डिप्लॉयमेंट

1. [dash.cloudflare.com](https://dash.cloudflare.com) पर लॉगिन करें।
2. **Workers & Pages** > **Create application** > **Pages** > **Connect to Git** पर जाएं।
3. अपनी `kisan` GitHub रिपॉजिटरी चुनें और **Begin setup** पर क्लिक करें।
4. **बिल्ड कॉन्फ़िगरेशन (Build configuration):**
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (खाली छोड़ें)
5. **Environment variables (Advanced):**
   | Variable Name | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://kisan-saathi-api.onrender.com/api` (आपका Render URL) |
   | `VITE_APP_HOST` | `https://kisan-saathi.pages.dev` (आपका Cloudflare URL) |
6. **Save and Deploy** पर क्लिक करें।
7. Cloudflare Pages कुछ ही सेकंड में पूरे ऐप का प्रोडक्शन बंडल तैयार करके ग्लोबल एज पर लाइव कर देगा।

> **नोट (SPA Routing):** प्रोजेक्ट में `public/_redirects` फ़ाइल पहले से शामिल है, जिससे Cloudflare Pages पर पेज रीलोड या डीप-लिंक करने पर 404 त्रुटि नहीं आती।

---

## 5. भाग 4: कस्टम डोमेन सेटअप (`kisan.init65.co.in` व `kisanapi.init65.co.in`)

### (क) Cloudflare Pages पर Frontend डोमेन जोड़ना (`kisan.init65.co.in`):
1. Cloudflare Dashboard में अपने Pages प्रोजेक्ट पर जाएं।
2. **Custom domains** टैब पर क्लिक करें > **Set up a custom domain** दबाएं।
3. डोमेन डालें: `kisan.init65.co.in`।
4. यदि `init65.co.in` पहले से Cloudflare DNS पर है, तो यह **1-क्लिक में स्वतः CNAME रिकॉर्ड बनाकर SSL सक्रिय** कर देगा।

### (ख) Render पर Backend डोमेन जोड़ना (`kisanapi.init65.co.in` या `kisan-api.init65.co.in`):
1. Render डैशबोर्ड में अपनी Web Service (`kisan-saathi-api`) खोलें।
2. **Settings** > **Custom Domains** > **Add Custom Domain** पर क्लिक करें।
3. दर्ज करें: `kisanapi.init65.co.in` (या `kisan-api.init65.co.in`)।
4. Render आपको एक CNAME टारगेट देगा (उदा. `kisan-saathi-api.onrender.com`)।
5. Cloudflare DNS में जाकर एक नया CNAME रिकॉर्ड जोड़ें:
   - **Type:** `CNAME`
   - **Name:** `kisanapi`
   - **Target:** `kisan-saathi-api.onrender.com`
   - **Proxy Status:** पहली बार Render के SSL सत्यापन हेतु DNS-Only (Gray cloud) रखें, सत्यापन उपरांत Proxied (Orange cloud) कर सकते हैं।

---

## 6. भाग 5: CORS एवं एन्वायरनमेंट सिंक्रोनाइज़ेशन

डिप्लॉयमेंट के बाद:
1. Render डैशबोर्ड के Environment Variables में:
   - `CLIENT_URL` = `https://kisan.init65.co.in`
   - `CORS_ORIGIN` = `https://kisan.init65.co.in`
2. Cloudflare Pages के Environment Variables में:
   - `VITE_API_BASE_URL` = `https://kisanapi.init65.co.in/api`
   - `VITE_APP_HOST` = `https://kisan.init65.co.in`

---

## 7. भाग 6: सुरक्षा एवं प्रोडक्शन चेकलिस्ट

- [x] **Zero Secret Leakage:** `.env` फ़ाइल `.gitignore` में सुरक्षित है; कोई पासवर्ड गिट पर पुश नहीं होगा।
- [x] **OWASP HTTP Security Headers:** `nosniff`, `DENY` frame-options, XSS protection और HSTS इनेबल्ड हैं।
- [x] **DoS Prevention:** JSON और URL-encoded पेलोड लिमिट `50kb` तक सीमित है।
- [x] **Zero-PII Service Worker:** सर्विस वर्कर कैशिंग में संवेदनशील किसान रिकॉर्ड्स और `/api/` डेटा प्रतिबंधित हैं।
- [x] **Offline Resilient UI:** यदि नेटवर्क अनुपलब्ध हो, तो ऐप स्वचालित रूप से लोकल कैश से काम करता है।
