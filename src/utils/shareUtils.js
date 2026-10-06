// किसान साथी - शेयर सेवा मॉड्यूल (Enhanced Share Module)
// समाधान विवरण, लेबल्ड लिंक (Web PWA & APK) और व्हाट्सएप/क्लिपबोर्ड इंटीग्रेशन
import { appConfig } from '../config/appConfig';

/**
 * ऐप के सम्पूर्ण समाधान और लेबल्ड लिंक्स के साथ सुव्यवस्थित संदेश तैयार करता है
 */
export const getShareDetails = () => {
  const apkUrl =
    appConfig.apkDownloadUrl ||
    'https://github.com/Paras65/kisansath-apk/releases/latest/download/kisan-saathi.apk';
  const webUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://kisan.init65.co.in';

  const solutions = [
    '🧪 सटीक खाद कैलकुलेटर (यूरिया, DAP, पोटाश की सही मात्रा व खर्च बचत)',
    '🩺 AI फसल डॉक्टर (पत्तियों की फोटो से रोग पहचान व तुरंत वैज्ञानिक दवा)',
    `📈 लाइव मंडी भाव व धान उपार्जन (${appConfig.stateName} ₹${appConfig.paddyScheme.totalRate}/क्विंटल योजना)`,
    '🚶‍♂️ खेत सीमा GPS मापक (मेड़ पर पैदल चलकर सही एकड़ व डिसमिल रकबा नापें)',
    '💧 स्मार्ट ट्यूबवेल मोटर कंट्रोलर (घर बैठे मोबाइल से बोरवेल चालू/बंद)',
    '🚜 कृषि चौपाल व यंत्र रेंटल (ट्रैक्टर, हार्वेस्टर किराया व किसान प्रश्नोत्तरी)',
  ];

  const shareText = `🌾 *${appConfig.appName} (${appConfig.appTagline})*

जय किसान भाइयों! खेती-किसानी की हर समस्या का सम्पूर्ण डिजिटल समाधान अब आपके हाथ में:

✨ *प्रमुख सुविधाएं व समाधान:*
${solutions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

📲 *Android App (APK डाउनलोड लिंक):*
${apkUrl}

🌐 *वेब पोर्टल (बिना इंस्टॉल किए सीधे चलाएं):*
${webUrl}

📞 *किसान हेल्पलाइन:* ${appConfig.helpline.label} (टोल-फ्री)
_अपने साथी किसान भाइयों के साथ भी जरूर साझा करें!_`;

  return {
    title: `${appConfig.appName} - ${appConfig.appTagline}`,
    text: shareText,
    apkUrl,
    webUrl,
    solutions,
  };
};

/**
 * व्हाट्सएप पर पूरा संदेश साझा करें
 */
export const shareOnWhatsApp = () => {
  const { text } = getShareDetails();
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
};

/**
 * पूरा संदेश या लिंक क्लिपबोर्ड पर कॉपी करें
 */
export const copyShareText = async (customText = null) => {
  const textToCopy = customText || getShareDetails().text;
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
  }
  // Fallback for older browsers
  if (typeof document !== 'undefined') {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
  return false;
};

/**
 * सिस्टम नेटिव शेयर (Web Share API) या व्हाट्सएप फॉलबैक
 */
export const shareApp = async () => {
  const { title, text, apkUrl } = getShareDetails();

  // Tier 0: Direct Native Android OS Share Sheet via AndroidBridge
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.shareText === 'function') {
    try {
      window.AndroidBridge.shareText(title, text);
      return true;
    } catch (e) {
      console.warn('[Share] AndroidBridge shareText fallback:', e);
    }
  }

  // Tier 1: Modern Web Share API
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, falling back to WhatsApp:', err);
        shareOnWhatsApp();
        return true;
      }
      return false;
    }
  }

  // Tier 2: Direct WhatsApp Share
  shareOnWhatsApp();
  return true;
};
