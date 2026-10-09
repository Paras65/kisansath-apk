// किसान साथी - बहिरा काका AI कृषि दिमाग (Bhaira Kaka Vernacular Conversational Engine)
// Authentic Chhattisgarhi & Hindi Rural Dialogues with IGKV Raipur recommendations
// Handles 40+ Agricultural Intents, Dialect Edge-cases, Rustic Number Extraction & Persona responses

import { appConfig } from '../config/appConfig.js';
import {
  extractQuintals,
  extractAcreage,
  detectCropFromText,
  detectCommodityFromText,
  detectDistrictFromText,
} from './kaka/kakaEntityExtractors.js';
import {
  resetKakaSession,
  setKakaSession,
  getKakaSession,
} from './kaka/kakaSessionManager.js';
import {
  generateCropDoctorDirectAnswer,
  handleDoctorIntent,
  handleDoctorFollowup,
  isDiseasePestQuery,
} from './kaka/kakaDoctorHandler.js';
import {
  generateFertilizerDirectAnswer,
  handleFertilizerIntent,
} from './kaka/kakaFertilizerHandler.js';
import {
  getLiveMandiFromCache,
  generateMandiDirectAnswer,
  handleMandiIntent,
} from './kaka/kakaMandiHandler.js';
import {
  handlePaddySaleIntent,
  handlePaddySaleFollowup,
  handleDirectAcreage,
} from './kaka/kakaPaddyHandler.js';
import { handleWeatherIntent } from './kaka/kakaWeatherHandler.js';
import {
  getNoSpeechResponse,
  getZeroAcreResponse,
  handleMotorConfirmation,
  handleMotorIntent,
  handleTokenIntent,
  handleZeroPaperworkIntent,
  handleSolarIntent,
  handleKccIntent,
  handleGreetingIntent,
  handleUnknownTopicFallback,
  handleNotUnderstoodFallback,
} from './kaka/kakaStaticIntents.js';
import { getKakaWalkthrough } from '../data/kakaWalkthroughData.js';

// Re-export core utilities for 100% backward compatibility across all modules
export {
  extractQuintals,
  extractAcreage,
  detectDistrictFromText,
  resetKakaSession,
  setKakaSession,
  getKakaSession,
  generateCropDoctorDirectAnswer,
  generateFertilizerDirectAnswer,
  getLiveMandiFromCache,
  getKakaWalkthrough,
};

/**
 * Process any spoken query through Bhaira Kaka's AI Conversational Agent
 * Returns structured directAnswer for zero-navigation popup + backward-compatible routes
 */
export const queryKakaBrain = (transcript, isChhattisgarhi = false, context = {}) => {
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 2) {
    return getNoSpeechResponse();
  }

  const clean = transcript.toLowerCase().trim();
  const session = getKakaSession();
  const spokenDistrict = detectDistrictFromText(clean);
  const effectiveDistrict =
    spokenDistrict ||
    context?.district ||
    context?.selectedDistrict ||
    session.collectedSlots?.district ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('kisan_selected_district') : null) ||
    appConfig?.geography?.defaultDistrict ||
    'रायपुर';
  const selectedDistrict = effectiveDistrict;
  const extractedAcre = extractAcreage(clean);

  // Edge Case: 0 एकड़ or negative input
  if (clean.includes('0 एकड़') || clean.includes('शून्य एकड़') || clean.includes('0 acre') || clean.includes('शून्य एकड')) {
    return getZeroAcreResponse(transcript);
  }

  // ── 0. Multi-Turn Conversational Slot-Filling Resolver ──
  const activeIntent = session.activeIntent || session.pendingIntent;

  // 0A. Motor Confirmation Resolution ("हव" / "नहीं")
  if (activeIntent === 'ASK_MOTOR') {
    const motorAnswer = handleMotorConfirmation(clean, transcript);
    if (motorAnswer) return motorAnswer;
  }

  // 0B. Paddy Sale Acreage Resolution from Follow-up ("3 एकड़", "ढाई एकड़")
  if (activeIntent === 'PADDY_SALE' && extractedAcre) {
    return handlePaddySaleFollowup(extractedAcre);
  }

  // 0C. Fertilizer Acreage Resolution from Follow-up ("2 एकड़", "चना", "गेहूं", "मक्का", "सरसों", etc.)
  if ((activeIntent === 'FERTILIZER' || activeIntent === 'ASK_ACRES') && (extractedAcre || clean.includes('चना') || clean.includes('धान') || clean.includes('गेहूं') || clean.includes('मक्का') || clean.includes('सरसों'))) {
    const crop = detectCropFromText(clean) || session.collectedSlots?.crop || 'paddy';
    const acreVal = extractedAcre || session.collectedSlots?.acre || 1.0;
    resetKakaSession();
    return generateFertilizerDirectAnswer(crop, acreVal, context?.weather || {}, transcript);
  }

  // 0D. Mandi Commodity Follow-up ("टमाटर", "चना", "सोयाबीन")
  if (activeIntent === 'MANDI') {
    const detectedCommodity = detectCommodityFromText(clean) || 'टमाटर';
    resetKakaSession();
    return generateMandiDirectAnswer(detectedCommodity, selectedDistrict, transcript);
  }

  // 0E. Crop Doctor Follow-up ("धान", "चना", "टमाटर", "गेहूं", "माहू", "झुलसा", "इल्ली", "उकठा", "फोटो", etc.)
  if (activeIntent === 'DOCTOR') {
    const doctorFollowup = handleDoctorFollowup(clean, transcript);
    if (doctorFollowup) return doctorFollowup;
  }

  // ── 1. धान ₹3,100 उपार्जन व बारदाना Intent (Paddy Sale) ──
  const paddyRes = handlePaddySaleIntent(clean, transcript, extractedAcre);
  if (paddyRes) return paddyRes;

  // ── 2. खाद एवं उर्वरक Intent (Fertilizer Dosage & Nano Fertilizers) ──
  const fertRes = handleFertilizerIntent(clean, transcript, extractedAcre, context);
  if (fertRes) return fertRes;

  // ── 3. लाइव मंडी भाव Intent (Mandi Rates) ──
  const isDisease = isDiseasePestQuery(clean);
  const mandiRes = handleMandiIntent(clean, transcript, selectedDistrict, isDisease);
  if (mandiRes) return mandiRes;

  // ── 4. लाइव मौसम व स्प्रे एडवाइजरी Intent (Weather) ──
  const weatherRes = handleWeatherIntent(clean, transcript, selectedDistrict, spokenDistrict, context);
  if (weatherRes) return weatherRes;

  // ── 5. फसल डॉक्टर व रोग-कीट Intent (Crop Doctor) ──
  const doctorRes = handleDoctorIntent(clean, transcript, extractedAcre);
  if (doctorRes) return doctorRes;

  // ── 6. मोटर कंट्रोलर Intent (Motor & Borewell) ──
  const motorRes = handleMotorIntent(clean, transcript, extractedAcre);
  if (motorRes) return motorRes;

  // ── 7. टोकन तुंहर हाथ Intent (Token Guide) ──
  const tokenRes = handleTokenIntent(clean, transcript, extractedAcre);
  if (tokenRes) return tokenRes;

  // ── 8. FAQs & शून्य कागज़ात Intent (Zero Paperwork) ──
  const zeroPaperworkRes = handleZeroPaperworkIntent(clean, transcript, extractedAcre);
  if (zeroPaperworkRes) return zeroPaperworkRes;

  // ── 9. सौर सुजला योजना व सोलर पंप Intent (Solar Pump) ──
  const solarRes = handleSolarIntent(clean, transcript, extractedAcre);
  if (solarRes) return solarRes;

  // ── 10. किसान क्रेडिट कार्ड व 0% ब्याज ऋण (KCC Loan) ──
  const kccRes = handleKccIntent(clean, transcript, extractedAcre);
  if (kccRes) return kccRes;

  // ── 11. आत्मीय देहाती अभिवादन व काका का परिचय (Persona & Greetings) ──
  const greetingRes = handleGreetingIntent(clean, transcript, selectedDistrict);
  if (greetingRes) return greetingRes;

  // ── 12. Direct Acreage Input without prior intent (e.g. farmer says "2.5 एकड़") ──
  if (extractedAcre) {
    return handleDirectAcreage(extractedAcre);
  }

  // ── 13. Intelligent Fallback: Differentiate "नहीं पता" (Unknown Domain) vs "समझ नहीं आया" (Muffled / Unclear) ──
  const unknownTopicRes = handleUnknownTopicFallback(clean, transcript, selectedDistrict);
  if (unknownTopicRes) return unknownTopicRes;

  return handleNotUnderstoodFallback(transcript);
};

/**
 * Asynchronously query Google Gemini AI Agricultural Expert (IGKV/ICAR Role)
 * Used as an intelligent fallback when query is not matched by local offline rules.
 * Strictly filters out non-agricultural topics and provides certified agricultural diagnoses.
 */
export const queryKakaAiExpert = async (query, isChhattisgarhi = false, context = {}) => {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return null;
  const district = context?.district || context?.selectedDistrict || 'रायपुर';

  try {
    const apiBase = appConfig?.apiBaseUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${apiBase}/kaka-brain/expert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        district,
        isChhattisgarhi: Boolean(isChhattisgarhi),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[KakaBrain] AI Agricultural Expert consultation failed or timed out:', err.message);
  }

  return null;
};
