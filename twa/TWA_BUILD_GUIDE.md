# 📱 किसान साथी: TWA (Trusted Web Activity) Android APK / AAB निर्माण गाइड

यह गाइड आपको सिखाती है कि कैसे इस PWA (Progressive Web App) को **100% ओरिजिनल Android App (APK / AAB)** में बदलें और **Google Play Store** पर पब्लिश करें।

---

## 🚀 विधि 1: GitHub Actions CI/CD (अनुशंसित - 1-क्लिक क्लाउड ऑटोमेशन)

यह **सर्वोत्तम और सबसे तेज़ तरीका** है क्योंकि इसके लिए आपके कंप्यूटर में 4GB का Android SDK या Java इंस्टॉल करने की कोई आवश्यकता नहीं है।

### कैसे उपयोग करें:
1. अपने कोड को GitHub पर पुश करें।
2. GitHub रिपॉजिटरी में **Actions** टैब पर जाएं।
3. **"📱 Build Kisan Saathi Android APK & AAB"** वर्कफ़्लो चुनें।
4. **"Run workflow"** बटन दबाएं।
5. 1 से 2 मिनट के अंदर GitHub क्लाउड पर APK और AAB बनकर तैयार हो जाएंगे:
   - **`app-release-signed.apk`**: किसानों के फोन में सीधे इंस्टॉल करने या वेबसाइट/WhatsApp पर बांटने हेतु।
   - **`app-release-bundle.aab`**: Google Play Console पर अपलोड करने हेतु।
6. जब भी आप Git टैग पुश करेंगे (उदा. `git tag v1.0.0 && git push origin v1.0.0`), तो GitHub अपने आप Release बनाकर APK डाउनलोड लिंक जारी कर देगा!

---

## ⚡ विधि 2: लोकल कंप्यूटर पर Google Bubblewrap CLI से बनाना

### चरण 4: Android प्रोजेक्ट इनिशियलाइज़ करें
`twa` फोल्डर में जाएं और चलाएं:
```bash
bubblewrap init --manifest=https://your-kisan-app.web.app/manifest.json
```
यह आपसे ऐप का नाम, पैकेज आईडी (`in.co.init65.kisan`), और की-स्टोर (Keystore) पासवर्ड पूछेगा।

### चरण 5: APK और AAB बनाएं (Build)
```bash
bubblewrap build
```
🎉 बधाई हो! आपको 2 फाइलें मिलेंगी:
* `app-release-signed.apk` (किसानों के फोन में सीधे इंस्टॉल करने या WhatsApp पर शेयर करने हेतु)
* `app-release-bundle.aab` (Google Play Store कंसोल पर अपलोड करने हेतु)

---

## 🔐 डिजिटल एसेट लिंक (Digital Asset Links) सत्यापन

जब ऐप खुले, तो बिना ब्राउज़र एड्रेस बार (Full Native Screen) के चले, इसके लिए:
1. Bubblewrap द्वारा दिए गए SHA-256 फिंगरप्रिंट को कॉपी करें।
2. इसे अपने प्रोजेक्ट की `public/.well-known/assetlinks.json` फाइल में `sha256_cert_fingerprints` के अंदर पेस्ट करें।
3. वेबसाइट को पुनः डिप्लॉय कर दें।

---

## 🛠️ विधि 2: Android Studio से बनाना (वैकल्पिक)

यदि आप Android Studio का उपयोग करना चाहते हैं:
1. Android Studio में एक नया प्रोजेक्ट बनाएं -> `Empty Views Activity`
2. `build.gradle` में जोड़ें:
   ```groovy
   implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
   ```
3. `AndroidManifest.xml` में `LauncherActivity` को `com.google.androidbrowserhelper.trusted.LauncherActivity` सेट करें और `DEFAULT_URL` मेटाडेटा में अपनी वेबसाइट का URL दें।
4. **Build > Generate Signed Bundle / APK** पर क्लिक करें।

---

## 📞 सहायता
किसी भी समस्या के लिए किसान कॉल सेंटर `1800-180-1551` या ऐप डेवलपर सहायता से संपर्क करें।
