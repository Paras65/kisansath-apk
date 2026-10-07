// किसान साथी - Google Gemini Multimodal Vision AI Plant Doctor Service
// Zero-False-Data Policy: Only returns real, analyzed diagnoses. Never generates guessed, dummy or false data.

import { externalApisConfig } from '../config/externalApis.js';

/**
 * Clean and extract base64 data and MIME type from data URL or raw string
 */
export const extractBase64Data = (imageString) => {
  if (!imageString || typeof imageString !== 'string') {
    throw new Error('अमान्य तस्वीर डेटा (Invalid image data)');
  }

  const match = imageString.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64Data: match[2]
    };
  }

  // Raw base64 fallback (default to image/jpeg)
  return {
    mimeType: 'image/jpeg',
    base64Data: imageString.trim()
  };
};

/**
 * Analyze plant photo with Google Gemini Vision API.
 * Strict Integrity Guarantee: If AI analysis fails, returns explicit error without hallucinating dummy diseases.
 * Zero-Code Environment Driven: Base URL, Model Cascades, Timeout, Temperature read dynamically from externalApisConfig.
 */
export const diagnoseWithGeminiVision = async ({ imageString, symptoms = '', cropId = '', district = 'रायपुर' }) => {
  const { apiKey, baseUrl, models, timeoutMs, temperature } = externalApisConfig.gemini;

  if (!apiKey) {
    const techMsg = 'GEMINI_API_KEY is not configured in server environment variables (.env). Check GEMINI_API_KEY / VITE_AI_VISION_API_URL.';
    console.warn(`[GeminiVision Diagnostic] ${techMsg}`);
    return {
      success: false,
      error: 'AI विज़न सेवा की कुंजी (.env) में सक्रिय नहीं है। गलत या नकली सलाह से बचने के लिए कोई अनुमानित डेटा नहीं दिखाया जा रहा है। कृपया नीचे दी गई सूची से अपनी फसल व लक्षण चुनकर प्रमाणित इलाज देखें।',
      technicalError: techMsg,
      modelErrors: ['API key missing or empty in environment configuration'],
    };
  }

  let mimeType = 'image/jpeg';
  let base64Data = '';
  if (imageString) {
    try {
      const extracted = extractBase64Data(imageString);
      mimeType = extracted.mimeType;
      base64Data = extracted.base64Data;
    } catch (e) {
      return {
        success: false,
        error: 'तस्वीर लोड करने में त्रुटि: कृपया कैमरे से खींची गई वैध JPEG/PNG फोटो भेजें।',
        technicalError: `Base64 extraction failure: ${e.message}`,
        modelErrors: [`Invalid image payload: ${e.message}`],
      };
    }
  }

  const prompt = `You are a Senior Indian Agricultural Scientist, Agronomist and Plant Pathologist (वरिष्ठ कृषि वैज्ञानिक व पादप रोग विशेषज्ञ) at Indira Gandhi Krishi Vishwavidyalaya (IGKV) & ICAR.
${imageString ? 'Analyze this uploaded crop/plant leaf/stem image with extreme accuracy' : `Analyze these farmer-reported crop symptoms with extreme accuracy: "${symptoms}"`} for Indian farmers (specifically Chhattisgarh & Central/North Indian agricultural conditions).
Farmer's selected crop context hint: ${cropId || 'Not specified (auto-detect)'}.
District context: ${district}.

STRICT INSTRUCTIONS:
1. First, verify whether this ${imageString ? 'image is' : 'symptom description relates to'} genuinely a plant, crop, leaf, stem, or agricultural field. If it is NOT agricultural, set "isPlant": false.
2. If it IS a plant:
   - Identify if it is HEALTHY or DISEASED/PEST-INFESTED.
   - If healthy, set diseaseName to "फसल पूरी तरह स्वस्थ है (Healthy Crop)", and severity to "स्वस्थ".
   - If diseased or pest-infested, identify the exact disease or pest name in standard Hindi and English.
   - Estimate diagnostic confidence (number between 60 and 99).
   - Severity: "सामान्य", "मध्यम", or "अति गंभीर".
   - Exact 15-Litre spray tank (टंकी) dose: Specify exact grams (g) or milliliters (ml) per 15L water pump tank.
   - Chemical remedy: Technical chemical name and formulation (e.g., ट्राईसाइक्लाजोल 75% WP, इमिडाक्लोप्रिड 17.8% SL, क्लोरेंट्रानिलिप्रोल 18.5% SC).
   - Organic/Bio remedy: Desi/organic option (e.g., नीम का तेल, ट्राइकोडर्मा, दसपर्णी अर्क).
   - Precautions & agronomic tips: Irrigation, nitrogen adjustment, wind speed advice.
   - Voice advice: 2-3 concise, caring spoken Hindi sentences for farmers.

Return ONLY a valid JSON object with NO extra text or markdown code fences:
{
  "isPlant": true,
  "cropName": "धान",
  "cropId": "paddy",
  "diseaseName": "झुलसा (ब्लास्ट) रोग",
  "englishName": "Blast Disease (Magnaporthe oryzae)",
  "confidence": 95,
  "severity": "अति गंभीर",
  "symptoms": "पत्तियों पर आंख या नाव के आकार के कत्थई धब्बे जिनके बीच का भाग राख के रंग का होता है",
  "pumpDose": "12-15 ग्राम प्रति 15 लीटर पंप (टंकी)",
  "chemicalRemedy": "ट्राईसाइक्लाजोल 75% WP (120 ग्राम/एकड़) या कासुगामाइसिन 3% SL (400 मिली/एकड़)",
  "organicRemedy": "स्यूडोमोनास फ्लोरीसेंस 10 ग्राम/लीटर या नीम तेल 5 मिली/लीटर पानी",
  "precautions": "खेत में यूरिया का छिड़काव तुरंत रोकें। शांत मौसम में सुबह या शाम छिड़कें।",
  "voiceAdvice": "आपकी धान की फसल में झुलसा रोग के लक्षण हैं। 15 लीटर स्प्रे टंकी में 15 ग्राम ट्राईसाइक्लाजोल मिलाकर तुरंत छिड़काव करें और यूरिया देना बंद कर दें।"
}`;

  // Multi-model fallback cascade read dynamically from externalApisConfig (.env GEMINI_MODELS)
  const defaultModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-1.5-pro'];
  const modelsToTry = models.length > 0 ? Array.from(new Set([...models, ...defaultModels])) : defaultModels;

  const modelErrors = [];

  const redactSecret = (str) => {
    if (!str || typeof str !== 'string' || !apiKey) return str;
    return str.split(apiKey).join('[REDACTED_API_KEY]');
  };

  for (const model of modelsToTry) {
    try {
      const url = `${baseUrl}/${model}:generateContent?key=${apiKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const parts = [];
      if (base64Data) {
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
      parts.push({ text: prompt });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        let parsedErrMsg = '';
        try {
          const parsedErr = JSON.parse(errorText);
          parsedErrMsg = parsedErr.error?.message || parsedErr.message || errorText.slice(0, 300);
        } catch {
          parsedErrMsg = errorText.slice(0, 300);
        }
        const errDetail = redactSecret(`[Model ${model}] HTTP ${res.status} (${res.statusText}): ${parsedErrMsg}`);
        modelErrors.push(errDetail);
        console.warn(`[GeminiVision Diagnostic] ${errDetail}`);
        continue;
      }

      const json = await res.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        const errDetail = `[Model ${model}] Empty content parts returned`;
        modelErrors.push(errDetail);
        console.warn(`[GeminiVision Diagnostic] ${errDetail}`);
        continue;
      }

      // Clean possible markdown wrapper if model added any
      const cleanedText = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        success: true,
        isLiveAi: true,
        source: `gemini-vision (${model})`,
        ...parsed
      };
    } catch (err) {
      const errDetail = redactSecret(`[Model ${model}] Exception: ${err.message}`);
      modelErrors.push(errDetail);
      console.warn(`[GeminiVision] Attempt with ${model} failed:`, errDetail);
    }
  }

  // Zero-False-Data: If AI call failed, do NOT guess or return fake database records
  const allErrorsSummary = modelErrors.join(' | ') || 'All Gemini models failed or timed out';
  console.warn('[GeminiVision] All Gemini models failed or timed out:', allErrorsSummary);
  return {
    success: false,
    error: 'AI सर्वर से संपर्क नहीं हो सका। किसान भाइयों की सुरक्षा हेतु कोई भी अनुमानित (Dummy) रोग नहीं दिखाया जा रहा है। कृपया इंटरनेट कनेक्शन जांचें या नीचे दी गई सूची से अपनी फसल के दृश्य लक्षण चुनकर सटीक इलाज देखें।',
    technicalError: allErrorsSummary,
    modelErrors,
  };
};
