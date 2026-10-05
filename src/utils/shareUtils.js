// किसान साथी - शेयर सेवा (Web Share API & WhatsApp Fallback)
import { appConfig } from '../config/appConfig';

export const shareApp = async () => {
  const downloadUrl =
    appConfig.apkDownloadUrl ||
    'https://github.com/Paras65/kisansath-apk/releases/latest/download/kisan-saathi.apk';
  const webUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kisan.init65.co.in';

  const shareText = `🌾 किसान साथी (Kisan Saathi) - फसल से लेकर बिक्री तक सम्पूर्ण कृषि समाधान!\n\n📲 Android APK सीधे डाउनलोड करें:\n${downloadUrl}\n\n🌐 ऑनलाइन वेब ऐप चलाएं:\n${webUrl}\n\n(खाद कैलकुलेटर, AI रोग निदान, मंडी भाव, खेत सीमा GPS व ट्यूबवेल मोटर कंट्रोलर)`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'किसान साथी ऐप',
        text: shareText,
        url: downloadUrl,
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, falling back to WhatsApp:', err);
      } else {
        return false;
      }
    }
  }

  // Fallback to WhatsApp
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(whatsappUrl, '_blank');
  return true;
};
