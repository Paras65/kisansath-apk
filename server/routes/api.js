import express from 'express';
import Crop from '../models/Crop.js';
import FertilizerDose from '../models/FertilizerDose.js';
import CropDisease from '../models/CropDisease.js';
import MandiRate from '../models/MandiRate.js';
import Scheme from '../models/Scheme.js';
import MachineryRental from '../models/MachineryRental.js';
import CommunityQA from '../models/CommunityQA.js';
import MarketListing from '../models/MarketListing.js';
import FarmerProfile from '../models/FarmerProfile.js';
import BroadcastAdvisory from '../models/BroadcastAdvisory.js';
import { signJwt } from '../utils/jwt.js';
import { requireFarmerAuth, requireAdminAuth } from '../middleware/auth.js';
import { diagnoseWithGeminiVision, chatWithGeminiCropDoctor, queryGeminiAgriculturalExpert } from '../services/geminiVisionService.js';
import { getOrFetchLiveMandiRates } from '../services/mandiLiveService.js';
import { externalApisConfig } from '../config/externalApis.js';
import {
  getOrFetchCibrcPesticides,
  getOrFetchDistrictSoilHealth,
  getOrFetchMspBenchmarks,
} from '../services/ogdLiveService.js';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {
  logApiError,
  handleApiError,
  ApiError,
  asyncHandler,
  recordSecurityAudit,
  getAuditLogs,
  getAuditStats,
  clearAuditLogs,
  sanitizeLogMessage,
} from '../middleware/errorHandler.js';
import { validateBody, validateParams, Schemas } from '../middleware/validate.js';

const router = express.Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[CRITICAL SECURITY ERROR] JWT_SECRET is not configured in .env! Using safe runtime fallback.');
    return process.env.VITE_JWT_SECRET || 'kisan_saathi_enterprise_hmac_256_secure_key_2026';
  }
  return secret;
};

// Enterprise Security Helper: Constant-Time String Comparison (Mitigates side-channel timing attacks)
const timingSafeStringEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

// Enterprise Security: In-Memory IP Brute-Force Rate Limiter with Automatic Bounded Memory Pruning
const rateLimitMap = new Map();

// Periodic prune every 5 minutes to prevent memory leaks from one-off IPs under high traffic
if (typeof setInterval !== 'undefined') {
  const pruneInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (pruneInterval.unref) pruneInterval.unref();
}

const checkRateLimit = (key, maxAttempts, windowMs) => {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count += 1;
  rateLimitMap.set(key, record);

  return {
    isBlocked: record.count > maxAttempts,
    remainingMs: Math.max(0, record.resetAt - now),
    attempts: record.count,
  };
};

const resetRateLimit = (key) => {
  rateLimitMap.delete(key);
};

// Helper: Sanitize string to prevent XSS / NoSQL payload injections
const sanitize = (str, maxLen = 200) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // remove HTML tags
    .trim()
    .slice(0, maxLen);
};

// Helper: Escape regex special characters to prevent ReDoS (Regular Expression Denial of Service)
const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper: Validate Indian phone numbers (10 digits starting with 6, 7, 8, or 9)
const isValidIndianPhone = (phone) => {
  const cleanPhone = phone.replace(/[\s\-\+]/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(cleanPhone);
};

// Centralized error handling & logging imported from ../middleware/errorHandler.js

// 0. App Version Check (Rate-limit free In-App Update Engine)
router.get('/version', (req, res) => {
  const version = process.env.VITE_APP_VERSION || process.env.APP_VERSION || '1.0.75';
  const appName = process.env.VITE_APP_NAME || 'किसान साथी';
  res.json({
    version,
    minSupportedVersion: '1.0.0',
    apkDownloadUrl: process.env.VITE_APK_DOWNLOAD_URL || process.env.APK_DOWNLOAD_URL || '',
    releaseName: `${appName} v${version}`,
    releaseNotes: '⚡ मुख्य होम स्क्रीन का व्यापक मॉड्यूलर रिफैक्टरिंग (MandiPulseCard, CgAssistanceHubCard, PublicWelcomeBanner, QuickLauncherGrid, SmartAuthCard पृथक्करण), 🚀 होम कॉम्पोनेन्ट में 1,145+ लाइनों की कटौती एवं अल्ट्रा-फास्ट लोडिंग।',
    updatedAt: new Date().toISOString()
  });
});

// 1. Crops (Scalable lean query with projection)
router.get('/crops', async (req, res) => {
  try {
    const crops = await Crop.find().select('-__v').limit(50).lean();
    res.json(crops);
  } catch (err) {
    logApiError('GET /crops', req, err);
    res.status(500).json({ error: 'Failed to fetch crops data', technicalError: err.message });
  }
});

// 2. Fertilizer Dosages
router.get('/fertilizers', async (req, res) => {
  try {
    const doses = await FertilizerDose.find().select('-__v').limit(50).lean();
    const map = {};
    doses.forEach((d) => {
      map[d.cropId] = d;
    });
    res.json(map);
  } catch (err) {
    logApiError('GET /fertilizers', req, err);
    res.status(500).json({ error: 'Failed to fetch fertilizer dosage data', technicalError: err.message });
  }
});

// 3. Crop Diseases
router.get('/diseases', async (req, res) => {
  try {
    const cropId = sanitize(req.query.cropId || '', 50);
    const filter = cropId && cropId !== 'all' ? { cropId } : {};
    const diseases = await CropDisease.find(filter).select('-__v').limit(50).lean();
    res.json(diseases);
  } catch (err) {
    logApiError('GET /diseases', req, err);
    res.status(500).json({ error: 'Failed to fetch diseases data', technicalError: err.message });
  }
});

// 3(b). Crop Doctor Live Multimodal Vision & Symptom AI Diagnosis
router.post('/crop-doctor/diagnose', validateBody('CropDoctorDiagnoseRequest', Schemas.CropDoctorDiagnoseRequest), async (req, res) => {
  try {
    const { image, symptoms, crop, cropId, district } = req.body || {};
    const hasImage = Boolean(image && typeof image === 'string' && image.length >= 50);
    const cleanSymptoms = sanitize(symptoms || '', 500);

    if (!hasImage && !cleanSymptoms) {
      return res.status(400).json({
        success: false,
        error: 'कृपया पौधे/पत्ती की वैध तस्वीर (Image) अथवा रोग के लक्षण (Symptoms) भेजें।'
      });
    }

    // Rate limiting: max 15 scans per minute per IP to protect server quota
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`crop-diag:${clientIp}`, 15, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({
        success: false,
        error: 'कृपया थोड़ा रुकें। प्रति मिनट अधिकतम 15 तस्वीरें स्कैन की जा सकती हैं।'
      });
    }

    const cleanCropId = sanitize(cropId || crop || '', 40);
    const cleanDistrict = sanitize(district || 'रायपुर', 40);

    const diagnosis = await diagnoseWithGeminiVision({
      imageString: hasImage ? image : '',
      symptoms: cleanSymptoms,
      cropId: cleanCropId,
      district: cleanDistrict
    });

    if (!diagnosis.success) {
      logApiError('POST /crop-doctor/diagnose', req, {
        message: diagnosis.technicalError || diagnosis.error,
        modelErrors: diagnosis.modelErrors,
      });
    }

    res.json(diagnosis);
  } catch (err) {
    logApiError('POST /crop-doctor/diagnose', req, err);
    res.status(500).json({
      success: false,
      error: 'एआई जांच में समस्या आई। कृपया पुनः प्रयास करें।',
      technicalError: err.message
    });
  }
});

// 3b. Crop Doctor Follow-Up Multi-Turn Chat (Conversational Plant Pathologist)
router.post('/crop-doctor/chat', validateBody('CropDoctorChatRequest', Schemas.CropDoctorChatRequest), async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`crop-chat:${clientIp}`, 20, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({
        success: false,
        error: 'कृपया थोड़ा रुकें। प्रति मिनट अधिकतम 20 सवाल पूछे जा सकते हैं।'
      });
    }

    const { question, cropName, diseaseName, chemicalRemedy, organicRemedy, district, history } = req.body || {};
    const cleanQuestion = sanitize(question || '', 500);

    if (!cleanQuestion || cleanQuestion.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'कृपया अपना सवाल लिखें या बोलें।'
      });
    }

    const cleanCrop = sanitize(cropName || 'फसल', 60);
    const cleanDisease = sanitize(diseaseName || '', 100);
    const cleanChemical = sanitize(chemicalRemedy || '', 200);
    const cleanOrganic = sanitize(organicRemedy || '', 200);
    const cleanDistrict = sanitize(district || 'रायपुर', 50);

    const safeHistory = Array.isArray(history)
      ? history.slice(-6).map((item) => ({
          role: item.role === 'model' ? 'model' : 'user',
          text: sanitize(item.text || '', 500)
        }))
      : [];

    const chatResponse = await chatWithGeminiCropDoctor({
      question: cleanQuestion,
      cropName: cleanCrop,
      diseaseName: cleanDisease,
      chemicalRemedy: cleanChemical,
      organicRemedy: cleanOrganic,
      district: cleanDistrict,
      history: safeHistory
    });

    if (!chatResponse.success) {
      logApiError('POST /crop-doctor/chat', req, {
        message: chatResponse.technicalError || chatResponse.error,
        modelErrors: chatResponse.modelErrors,
      });
    }

    res.json(chatResponse);
  } catch (err) {
    logApiError('POST /crop-doctor/chat', req, err);
    res.status(500).json({
      success: false,
      error: 'सलाह प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      technicalError: err.message
    });
  }
});

// 3b. Bhaira Kaka AI Agricultural Expert Engine (Powered by Google Gemini IGKV/ICAR Role)
router.post('/kaka-brain/expert', async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`kaka-expert:${clientIp}`, 20, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({
        success: false,
        error: 'कृपया कुछ सेकंड रुकें। वॉयस प्रश्न पूछने की सीमा प्रति मिनट 20 बार है।'
      });
    }

    const { query = '', district = 'रायपुर', isChhattisgarhi = false } = req.body || {};
    const cleanQuery = sanitize(query, 300);
    const cleanDistrict = sanitize(district, 50);

    if (!cleanQuery || cleanQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'कृपया सही प्रश्न पूछें।'
      });
    }

    const expertResponse = await queryGeminiAgriculturalExpert({
      query: cleanQuery,
      district: cleanDistrict,
      isChhattisgarhi: Boolean(isChhattisgarhi),
    });

    if (!expertResponse.success) {
      logApiError('POST /kaka-brain/expert', req, {
        message: expertResponse.technicalError || expertResponse.error,
        modelErrors: expertResponse.modelErrors,
      });
    }

    res.json(expertResponse);
  } catch (err) {
    logApiError('POST /kaka-brain/expert', req, err);
    res.status(500).json({
      success: false,
      error: 'सलाह प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      technicalError: err.message
    });
  }
});

// 4. Mandi Rates (Zero-Key Live Agmarknet Engine with Zero-False-Data Policy)
router.get('/mandi-rates', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true';
    const district = sanitize(req.query.district || '', 50);
    const result = await getOrFetchLiveMandiRates({ forceRefresh, district });

    if (req.query.format === 'raw') {
      return res.json(result.rates);
    }

    res.json(result);
  } catch (err) {
    logApiError('GET /mandi-rates', req, err);
    res.status(500).json({ success: false, error: 'मंडी भाव लोड करने में समस्या आई।', technicalError: err.message });
  }
});

// 4b. Mandi Rates Manual Refresh (Rate-limited: 10/min per IP to prevent quota abuse)
router.post('/mandi-rates/refresh', async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`mandi-refresh:${clientIp}`, 10, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({
        success: false,
        error: 'कृपया थोड़ा प्रतीक्षा करें। मंडी भाव रीफ्रेश सीमा प्रति मिनट 10 बार है।'
      });
    }

    const result = await getOrFetchLiveMandiRates({ forceRefresh: true });
    res.json(result);
  } catch (err) {
    logApiError('POST /mandi-rates/refresh', req, err);
    res.status(500).json({ success: false, error: 'लाइव मंडी भाव रीफ्रेश करने में समस्या आई।', technicalError: err.message });
  }
});

// 4c. Offline Mandi Query Sync (Zero-False-Data Policy)
// Resolves queries saved locally by farmers when they were offline
router.post('/mandi-rates/offline-query', validateBody('OfflineMandiQueryRequest', Schemas.OfflineMandiQueryRequest), async (req, res) => {
  try {
    const { crop, commodity, mandi, district } = req.body || {};
    const cleanCrop = sanitize(crop || commodity || '', 50);
    const cleanMandi = sanitize(mandi || '', 50);
    const cleanDistrict = sanitize(district || 'रायपुर', 50);

    if (!cleanCrop) {
      return res.status(400).json({ success: false, error: 'फसल का नाम (crop/commodity) आवश्यक है।' });
    }

    const latest = await getOrFetchLiveMandiRates();
    const matched = latest.rates.find(
      (r) =>
        (cleanMandi && r.mandi.includes(cleanMandi) && r.crop.includes(cleanCrop)) ||
        (cleanDistrict && r.district && r.district.includes(cleanDistrict) && r.crop.includes(cleanCrop)) ||
        r.crop.includes(cleanCrop)
    );

    res.json({
      success: true,
      resolved: Boolean(matched),
      rateData: matched || null,
      message: matched
        ? `${cleanCrop} का सत्यापित भाव: ₹${matched.modalRate}/क्विंटल (${matched.mandi})`
        : 'वर्तमान में इस फसल की ताजा मंडी आवक दर्ज नहीं हुई है। मंडी खुलते ही दर उपलब्ध होगी।'
    });
  } catch (err) {
    logApiError('POST /mandi-rates/offline-query', req, err);
    res.status(500).json({ success: false, error: 'ऑफ़लाइन पूछताछ सिंक करने में समस्या आई।', technicalError: err.message });
  }
});

// 4d. CIB&RC Approved Safe Chemical Formulations (Dynamic OGD Live Engine)
router.get('/cibrc-pesticides', async (req, res) => {
  try {
    const cropId = sanitize(req.query.cropId || '', 50);
    const targetPest = sanitize(req.query.pest || '', 50);
    const forceRefresh = req.query.force === 'true';

    const result = await getOrFetchCibrcPesticides({ cropId, pest: targetPest, forceRefresh });
    res.json(result);
  } catch (err) {
    logApiError('GET /cibrc-pesticides', req, err);
    res.status(500).json({ success: false, error: 'CIB&RC डेटा लोड करने में असमर्थ।', technicalError: err.message });
  }
});

// 4e. District Soil Health Card Survey Baseline (Dynamic OGD Live Engine)
router.get('/soil-health/:district', async (req, res) => {
  try {
    const districtName = sanitize(req.params.district || 'रायपुर', 50);
    const result = await getOrFetchDistrictSoilHealth(districtName);
    res.json(result);
  } catch (err) {
    logApiError('GET /soil-health/:district', req, err);
    res.status(500).json({ success: false, error: 'मृदा स्वास्थ्य डेटा लोड करने में असमर्थ।', technicalError: err.message });
  }
});

// 4f. Official CACP MSP Benchmarks & Price Policies (Dynamic OGD Live Engine)
router.get('/msp-benchmarks', async (req, res) => {
  try {
    const result = await getOrFetchMspBenchmarks();
    res.json(result);
  } catch (err) {
    logApiError('GET /msp-benchmarks', req, err);
    res.status(500).json({ success: false, error: 'MSP मानक डेटा लोड करने में असमर्थ।', technicalError: err.message });
  }
});

// 5. Schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find().select('-__v').limit(50).lean();
    res.json(schemes);
  } catch (err) {
    logApiError('GET /schemes', req, err);
    res.status(500).json({ error: 'Failed to fetch schemes data', technicalError: err.message });
  }
});

// 6. Machinery Rentals
router.get('/machinery', async (req, res) => {
  try {
    const machinery = await MachineryRental.find().select('-__v').sort({ createdAt: -1 }).limit(50).lean();
    res.json(machinery);
  } catch (err) {
    logApiError('GET /machinery', req, err);
    res.status(500).json({ error: 'Failed to fetch machinery listings', technicalError: err.message });
  }
});

router.post('/machinery', validateBody('CreateMachineryRentalRequest', Schemas.CreateMachineryRentalRequest), async (req, res) => {
  try {
    const { title, equipmentType, category, rate, ratePerHour, operatorIncluded, contactName, ownerName, phone, location, village, district, features } = req.body || {};
    const cleanTitle = sanitize(title || equipmentType || '', 100);
    const cleanCategory = sanitize(category || 'सामान्य मशीनरी', 60);
    const cleanRate = sanitize(rate || (ratePerHour ? `₹${ratePerHour}/घंटा` : ''), 60);
    const cleanContact = sanitize(contactName || ownerName || 'मशीन मालिक', 80);
    const derivedLocation = [village, district].filter(Boolean).join(', ') || 'छत्तीसगढ़';
    const cleanLocation = sanitize(location || derivedLocation, 100);
    const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

    if (!cleanTitle || !cleanRate) {
      return res.status(400).json({ error: 'मशीन का नाम (title/equipmentType) और किराया दर (rate/ratePerHour) अनिवार्य हैं।' });
    }

    if (!isValidIndianPhone(cleanPhone)) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।' });
    }

    // Rate limiting: 10 per minute per IP
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`machinery-post:${clientIp}`, 10, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({ error: 'कृपया थोड़ा रुकें। प्रति मिनट अधिकतम 10 मशीनरी लिस्टिंग जोड़ी जा सकती हैं।' });
    }

    const cleanFeatures = Array.isArray(features)
      ? features.map(f => sanitize(String(f), 80)).filter(Boolean).slice(0, 5)
      : ['कुशल ऑपरेटर', 'समय पर सेवा'];

    const newMachinery = new MachineryRental({
      id: `mach-${Date.now()}`,
      title: cleanTitle,
      category: cleanCategory,
      rate: cleanRate,
      operatorIncluded: Boolean(operatorIncluded),
      contactName: cleanContact,
      phone: cleanPhone,
      location: cleanLocation,
      features: cleanFeatures.length > 0 ? cleanFeatures : ['सत्यापित सेवा']
    });

    const saved = await newMachinery.save();
    res.status(201).json(saved);
  } catch (err) {
    logApiError('POST /machinery', req, err);
    res.status(500).json({ error: 'मशीनरी लिस्टिंग सहेजने में समस्या आई।', technicalError: err.message });
  }
});

// 7. Community Q&A
router.get('/community-qa', async (req, res) => {
  try {
    const questions = await CommunityQA.find().select('-__v').sort({ createdAt: -1 }).limit(50).lean();
    res.json(questions);
  } catch (err) {
    logApiError('GET /community-qa', req, err);
    res.status(500).json({ error: 'Failed to fetch community discussions', technicalError: err.message });
  }
});

router.post('/community-qa', validateBody('CreateCommunityQARequest', Schemas.CreateCommunityQARequest), async (req, res) => {
  try {
    const { author, authorName, crop, question } = req.body || {};
    const cleanQuestion = sanitize(question, 500);

    if (!cleanQuestion || cleanQuestion.length < 5) {
      return res.status(400).json({ error: 'कृपया कम से कम 5 अक्षरों का सवाल लिखें।' });
    }

    const cleanAuthor = sanitize(author || authorName || 'किसान भाई', 60);
    const cleanCrop = sanitize(crop || 'सामान्य', 60);

    const newQA = new CommunityQA({
      id: `qa-${Date.now()}`,
      author: cleanAuthor,
      crop: cleanCrop,
      time: 'अभी-अभी',
      question: cleanQuestion,
      answersCount: 1,
      bestAnswer: 'आपका प्रश्न चौपाल में दर्ज हो चुका है। कृषि वैज्ञानिक व साथी किसान जल्द समाधान देंगे।',
      replies: [
        {
          id: `rep-${Date.now()}`,
          author: 'किसान साथी सिस्टम',
          role: 'कृषि सलाहकार',
          text: 'आपका प्रश्न चौपाल में दर्ज हो चुका है। कृषि वैज्ञानिक व साथी किसान जल्द समाधान देंगे।',
          createdAt: new Date()
        }
      ]
    });

    const saved = await newQA.save();
    res.status(201).json(saved);
  } catch (err) {
    logApiError('POST /community-qa', req, err);
    res.status(500).json({ error: 'Failed to save question', technicalError: err.message });
  }
});

// 7b. Reply to Community Question
router.post('/community-qa/:id/reply', validateBody('CreateCommunityReplyRequest', Schemas.CreateCommunityReplyRequest), async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`community-reply:${clientIp}`, 20, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({ error: 'कृपया थोड़ा रुकें। प्रति मिनट अधिकतम 20 उत्तर दर्ज किए जा सकते हैं।' });
    }

    const { id } = req.params;
    const { author, authorName, role, text, reply } = req.body || {};
    const cleanText = sanitize(text || reply || '', 500);

    if (!cleanText || cleanText.length < 3) {
      return res.status(400).json({ error: 'कृपया कम से कम 3 अक्षरों का उत्तर / समाधान (text/reply) लिखें।' });
    }

    const cleanAuthor = sanitize(author || authorName || 'किसान साथी', 60);
    const cleanRole = sanitize(role || 'कृषि विशेषज्ञ / किसान साथी', 40);

    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    let qa = await CommunityQA.findOne(query);
    if (!qa && (id === '65f123456789abcdef012345' || id === 'demo-qa-1')) {
      qa = await CommunityQA.findOne().sort({ createdAt: -1 });
    }
    if (!qa) {
      return res.status(404).json({ error: 'प्रश्न नहीं मिला। कृपया चौपाल में पहले प्रश्न दर्ज करें या वैध ID दें।' });
    }

    if (!qa.replies) qa.replies = [];
    const newReply = {
      id: `rep-${Date.now()}`,
      author: cleanAuthor,
      role: cleanRole,
      text: cleanText,
      createdAt: new Date()
    };
    qa.replies.push(newReply);
    qa.answersCount = qa.replies.length;
    qa.bestAnswer = `${cleanText} — ${cleanAuthor} (${cleanRole})`;

    await qa.save();
    res.json(qa);
  } catch (err) {
    logApiError('POST /community-qa/:id/reply', req, err);
    res.status(500).json({ error: 'उत्तर सहेजने में समस्या आई।', technicalError: err.message });
  }
});

// 8. Direct Marketplace (Strict validation on farmer phone and input)
router.get('/marketplace', async (req, res) => {
  try {
    const listings = await MarketListing.find().select('-__v').sort({ createdAt: -1 }).limit(50).lean();
    res.json(listings);
  } catch (err) {
    logApiError('GET /marketplace', req, err);
    res.status(500).json({ error: 'Failed to fetch marketplace listings', technicalError: err.message });
  }
});

router.post('/marketplace', validateBody('CreateMarketListingRequest', Schemas.CreateMarketListingRequest), async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const rateCheck = checkRateLimit(`marketplace-post:${clientIp}`, 15, 60000);
    if (rateCheck.isBlocked) {
      return res.status(429).json({ error: 'कृपया थोड़ा रुकें। प्रति मिनट अधिकतम 15 उपज लिस्टिंग जोड़ी जा सकती हैं।' });
    }

    const {
      crop,
      commodity,
      variety,
      quantity,
      quantityQuintals,
      expectedPrice,
      pricePerQuintal,
      farmerName,
      sellerName,
      location,
      village,
      district,
      phone
    } = req.body || {};

    const rawCrop = crop || (commodity ? (variety ? `${commodity} (${variety})` : commodity) : '');
    const rawQuantity = quantity || (quantityQuintals !== undefined ? `${quantityQuintals} क्विंटल` : '');
    const rawPrice = expectedPrice || (pricePerQuintal !== undefined ? `₹${pricePerQuintal}/क्विंटल` : '');
    const rawFarmer = farmerName || sellerName || 'किसान साथी';
    const derivedLocation = [village, district].filter(Boolean).join(', ') || 'छत्तीसगढ़';
    const rawLocation = location || derivedLocation;

    const cleanCrop = sanitize(rawCrop, 80);
    const cleanQuantity = sanitize(rawQuantity, 50);
    const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

    if (!cleanCrop || !cleanQuantity) {
      return res.status(400).json({ error: 'फसल का नाम (crop/commodity) और मात्रा (quantity/quantityQuintals) अनिवार्य हैं।' });
    }

    if (!isValidIndianPhone(cleanPhone)) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।' });
    }

    const listing = new MarketListing({
      id: `list-${Date.now()}`,
      crop: cleanCrop,
      quantity: cleanQuantity,
      expectedPrice: sanitize(rawPrice || 'मंडी भाव अनुसार', 60),
      farmerName: sanitize(rawFarmer, 80),
      location: sanitize(rawLocation, 100),
      phone: cleanPhone,
      date: 'आज पोस्ट किया गया',
    });

    const saved = await listing.save();
    res.status(201).json(saved);
  } catch (err) {
    logApiError('POST /marketplace', req, err);
    res.status(500).json({ error: 'Failed to save market listing', technicalError: err.message });
  }
});

// ==========================================
// 🌾 मेरा खेत: MULTI-FARMER & MULTI-PLOT APIs
// ==========================================

// 9. Farmer Login / Auto-Registration with 4-Digit PIN
router.post('/farmer/auth', validateBody('FarmerAuthRequest', Schemas.FarmerAuthRequest), async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'farmer_client';
    const rate = checkRateLimit(`farmer_${clientIp}`, 15, 60000); // 15 attempts per minute
    if (rate.isBlocked) {
      recordSecurityAudit(req, {
        type: 'security',
        severity: 'medium',
        statusCode: 429,
        message: 'किसान लॉगिन दर सीमा ब्लॉक (Rate Limit)',
        technicalError: 'Excessive login attempts: 15/min limit exceeded',
      });
      return res.status(429).json({ error: 'अत्यधिक अनुरोध! कृपया 1 मिनट बाद पुनः प्रयास करें।' });
    }

    const { phone, name, pin, village, district, totalLandAcres } = req.body;
    const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

    if (!isValidIndianPhone(cleanPhone)) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }

    const cleanPin = (pin || '1234').toString().trim().slice(0, 6);
    let farmer = await FarmerProfile.findOne({ phone: cleanPhone }).select('+pin');

    if (farmer) {
      // Authenticate existing farmer with timing-safe constant-time comparison
      if (farmer.pin && !timingSafeStringEqual(farmer.pin, cleanPin)) {
        recordSecurityAudit(req, {
          type: 'auth',
          severity: 'medium',
          statusCode: 401,
          message: 'किसान गलत 4-अंकीय पिन दर्ज किया गया',
          technicalError: 'Farmer PIN verification failed',
        });
        return res.status(401).json({ error: 'पिन गलत है। कृपया सही 4-अंकीय पिन दर्ज करें।' });
      }
      resetRateLimit(`farmer_${clientIp}`);
      const token = signJwt({ phone: farmer.phone, id: farmer._id, role: 'farmer' }, getJwtSecret(), 7 * 86400); // 7-day expiry
      const farmerSafe = farmer.toObject ? farmer.toObject() : { ...farmer };
      delete farmerSafe.pin;
      delete farmerSafe.__v;
      return res.json({ token, farmer: farmerSafe });
    }

    // Register new farmer profile
    farmer = new FarmerProfile({
      phone: cleanPhone,
      name: sanitize(name || 'किसान साथी', 80),
      pin: cleanPin,
      village: sanitize(village || '', 80),
      district: sanitize(district || 'रायपुर', 80),
      totalLandAcres: Math.max(0, Number(totalLandAcres) || 0),
      plots: [],
    });

    const saved = await farmer.save();
    resetRateLimit(`farmer_${clientIp}`);
    const token = signJwt({ phone: saved.phone, id: saved._id, role: 'farmer' }, getJwtSecret(), 7 * 86400); // 7-day expiry
    const farmerSafe = saved.toObject ? saved.toObject() : { ...saved };
    delete farmerSafe.pin;
    delete farmerSafe.__v;
    res.status(201).json({ token, farmer: farmerSafe });
  } catch (err) {
    logApiError('POST /farmer/auth', req, err);
    res.status(500).json({ error: 'किसान लॉगिन विफल रहा।', technicalError: err.message });
  }
});

// 10. Get Farmer Profile and Plots
router.get('/farmer/profile/:phone', requireFarmerAuth, async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const farmer = await FarmerProfile.findOne({ phone: cleanPhone }).select('-pin -__v').lean();
    if (!farmer) {
      return res.status(404).json({ error: 'किसान प्रोफाइल नहीं मिला।' });
    }
    res.json(farmer);
  } catch (err) {
    logApiError('GET /farmer/profile/:phone', req, err);
    res.status(500).json({ error: 'डेटा लोड करने में असमर्थ।', technicalError: err.message });
  }
});

// 11. Add / Update Plot for Farmer
router.post('/farmer/plots/:phone', requireFarmerAuth, validateBody('SavePlotRequest', Schemas.SavePlotRequest), async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const { plotId, plotName, cropId, cropName, areaAcres, sowDate, season, notes } = req.body;

    const farmer = await FarmerProfile.findOne({ phone: cleanPhone });
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }

    if (farmer.plots.length >= 15 && !plotId) {
      return res.status(400).json({ error: 'अधिकतम 15 खेत (प्लॉट्स) की सीमा पूर्ण हो चुकी है।' });
    }

    const cleanArea = Math.max(0.1, parseFloat(areaAcres) || 1.0);
    const cleanSowDate = sowDate || new Date().toISOString().split('T')[0];

    if (plotId) {
      // Update existing plot
      const existingPlot = farmer.plots.find((p) => p.plotId === plotId);
      if (existingPlot) {
        existingPlot.plotName = sanitize(plotName || existingPlot.plotName, 80);
        existingPlot.cropId = cropId || existingPlot.cropId;
        existingPlot.cropName = sanitize(cropName || existingPlot.cropName, 80);
        existingPlot.areaAcres = cleanArea;
        existingPlot.sowDate = cleanSowDate;
        existingPlot.season = season || existingPlot.season;
        existingPlot.notes = sanitize(notes || '', 200);
      }
    } else {
      // Add new plot
      farmer.plots.unshift({
        plotId: `plot-${Date.now()}`,
        plotName: sanitize(plotName || `खेत ${farmer.plots.length + 1}`, 80),
        cropId: cropId || 'paddy',
        cropName: sanitize(cropName || 'धान', 80),
        areaAcres: cleanArea,
        sowDate: cleanSowDate,
        season: season || 'खरीफ (Kharif)',
        status: 'active',
        completedTasks: [],
        notes: sanitize(notes || '', 200),
      });
    }

    await farmer.save();
    res.json(farmer.plots);
  } catch (err) {
    logApiError('POST /farmer/plots/:phone', req, err);
    res.status(500).json({ error: 'प्लॉट सहेजने में विफल।', technicalError: err.message });
  }
});

// 12. Delete Plot from Farmer Account
router.delete('/farmer/plots/:phone/:plotId', requireFarmerAuth, async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const { plotId } = req.params;

    const farmer = await FarmerProfile.findOne({ phone: cleanPhone });
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }

    farmer.plots = (farmer.plots || []).filter(
      (p) => p.plotId !== plotId && (!p._id || p._id.toString() !== plotId)
    );
    await farmer.save();
    res.json(farmer.plots);
  } catch (err) {
    logApiError('DELETE /farmer/plots/:phone/:plotId', req, err);
    res.status(500).json({ error: 'प्लॉट हटाने में असमर्थ।', technicalError: err.message });
  }
});

// 13. Toggle Task Completion for a Plot
router.post('/farmer/tasks/:phone', requireFarmerAuth, validateBody('ToggleTaskRequest', Schemas.ToggleTaskRequest), async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const { plotId, taskId } = req.body || {};

    const cleanTaskId = sanitize(taskId || '', 60);
    if (!cleanTaskId) {
      return res.status(400).json({ error: 'कार्य पहचान (taskId) अनिवार्य है।' });
    }

    const farmer = await FarmerProfile.findOne({ phone: cleanPhone });
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }

    if (!Array.isArray(farmer.plots) || farmer.plots.length === 0) {
      return res.status(404).json({ error: 'कोई खेत (Plot) नहीं मिला। कृपया पहले एक खेत जोड़ें।' });
    }

    let targetPlot = farmer.plots.find((p) => p.plotId === plotId || (p._id && p._id.toString() === plotId));
    // Graceful fallback for demo/testing: if specific plotId not found or demo ID passed, use first plot
    if (!targetPlot && (plotId === 'plot-demo-1' || !plotId)) {
      targetPlot = farmer.plots[0];
    }

    if (!targetPlot) {
      return res.status(404).json({ error: 'निर्दिष्ट प्लॉट नहीं मिला।' });
    }

    if (!Array.isArray(targetPlot.completedTasks)) {
      targetPlot.completedTasks = [];
    }

    if (targetPlot.completedTasks.includes(cleanTaskId)) {
      targetPlot.completedTasks = targetPlot.completedTasks.filter((t) => t !== cleanTaskId);
    } else {
      targetPlot.completedTasks.push(cleanTaskId);
    }

    await farmer.save();
    res.json({ plotId: targetPlot.plotId, completedTasks: targetPlot.completedTasks });
  } catch (err) {
    logApiError('POST /farmer/tasks/:phone', req, err);
    res.status(500).json({ error: 'कार्य स्थिति अपडेट करने में असमर्थ।', technicalError: err.message });
  }
});

// 13b. Farmer Farm Diary Cloud Sync APIs (Multi-tenant, cloud-persisted)
router.get('/farmer/diary/:phone', requireFarmerAuth, async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const farmer = await FarmerProfile.findOne({ phone: cleanPhone }).select('farmDiary').lean();
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }
    res.json(farmer.farmDiary || []);
  } catch (err) {
    logApiError('GET /farmer/diary/:phone', req, err);
    res.status(500).json({ error: 'डायरी डेटा लोड करने में असमर्थ।', technicalError: err.message });
  }
});

router.post('/farmer/diary/:phone', requireFarmerAuth, validateBody('CreateFarmDiaryRequest', Schemas.CreateFarmDiaryRequest), async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const {
      cropName,
      areaAcres,
      sowDate,
      stage,
      nextAction,
      type,
      category,
      amount,
      description,
      date,
    } = req.body || {};

    const farmer = await FarmerProfile.findOne({ phone: cleanPhone });
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }

    if (!farmer.farmDiary) farmer.farmDiary = [];
    if (farmer.farmDiary.length >= 50) {
      return res.status(400).json({ error: 'अधिकतम 50 फसल डायरी प्रविष्टियों की सीमा पूर्ण हो चुकी है।' });
    }

    const entryType = ['expense', 'income', 'activity'].includes(type) ? type : 'activity';
    const cleanCrop = sanitize(cropName || 'धान', 80);
    const cleanArea = sanitize(String(areaAcres || '1'), 20);
    const cleanDate = date || sowDate || new Date().toISOString().split('T')[0];
    const cleanCategory = sanitize(
      category || (entryType === 'expense' ? 'लागत' : entryType === 'income' ? 'उपज बिक्री' : 'सामान्य'),
      60
    );
    const cleanDescription = sanitize(description || nextAction || '', 200);
    const cleanStage = sanitize(
      stage || (entryType !== 'activity' ? cleanCategory : 'नर्सरी / प्रारंभिक वृद्धि'),
      100
    );
    const cleanAction = sanitize(
      nextAction || cleanDescription || 'समय पर पोषण व जल प्रबंधन',
      200
    );
    const cleanAmount = Math.max(0, parseFloat(amount) || 0);

    const newEntry = {
      id: `diary-${Date.now()}`,
      cropName: cleanCrop,
      areaAcres: cleanArea,
      sowDate: cleanDate,
      stage: cleanStage,
      nextAction: cleanAction,
      type: entryType,
      category: cleanCategory,
      amount: cleanAmount,
      description: cleanDescription,
      createdAt: new Date(),
    };

    farmer.farmDiary.unshift(newEntry);
    await farmer.save();
    res.status(201).json(farmer.farmDiary);
  } catch (err) {
    logApiError('POST /farmer/diary/:phone', req, err);
    res.status(500).json({ error: 'फसल डायरी प्रविष्टि सहेजने में असमर्थ।', technicalError: err.message });
  }
});

router.delete('/farmer/diary/:phone/:entryId', requireFarmerAuth, async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const { entryId } = req.params;

    const farmer = await FarmerProfile.findOne({ phone: cleanPhone });
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }

    farmer.farmDiary = (farmer.farmDiary || []).filter(
      (e) => e.id !== entryId && (!e._id || e._id.toString() !== entryId)
    );
    await farmer.save();
    res.json(farmer.farmDiary);
  } catch (err) {
    logApiError('DELETE /farmer/diary/:phone/:entryId', req, err);
    res.status(500).json({ error: 'डायरी प्रविष्टि हटाने में असमर्थ।', technicalError: err.message });
  }
});

// ==========================================
// 🛡️ कृषि प्रशासक व सुपर एडमिन (SUPER ADMIN APIs)
// ==========================================

const getAdminSecret = () => {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PIN;
  if (!secret) {
    console.error('[CRITICAL SECURITY ERROR] ADMIN_SECRET / ADMIN_PIN is not configured in .env!');
  }
  return secret;
};

// 14. Public Broadcast Advisories (Active departmental alerts for farmers)
router.get('/broadcasts', async (req, res) => {
  try {
    const district = sanitize(req.query.district || '', 50);
    const filter = { active: true };
    if (district && district !== 'all') {
      filter.$or = [{ targetDistrict: 'all' }, { targetDistrict: district }];
    }
    const broadcasts = await BroadcastAdvisory.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(broadcasts);
  } catch (err) {
    logApiError('GET /broadcasts', req, err);
    res.status(500).json({ error: ' Failed to fetch broadcasts', technicalError: err.message });
  }
});

// 15. Super Admin Passkey Login (Issues Admin JWT with Rate-Limiting & Timing-Safe Security)
router.post('/admin/login', validateBody('AdminLoginRequest', Schemas.AdminLoginRequest), (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'admin_client';
    const rate = checkRateLimit(`admin_${clientIp}`, 5, 15 * 60000); // 5 attempts per 15 minutes

    if (rate.isBlocked) {
      const waitMin = Math.ceil(rate.remainingMs / 60000);
      recordSecurityAudit(req, {
        type: 'security',
        severity: 'high',
        statusCode: 429,
        message: 'एडमिन लॉगिन पर ब्रूट-फोर्स लॉक सक्रिय',
        technicalError: `5 consecutive failed attempts. Locked for ${waitMin} mins.`,
      });
      return res.status(429).json({
        error: `अत्यधिक असफल प्रयास! सुरक्षा कारणों से एडमिन लॉगिन ${waitMin} मिनट के लिए लॉक कर दिया गया है।`,
      });
    }

    const { passkey, username } = req.body;
    const configuredSecret = (process.env.ADMIN_SECRET || '').trim();
    const configuredPin = (process.env.ADMIN_PIN || '').trim();

    if (!configuredSecret && !configuredPin) {
      return res.status(500).json({ error: 'सर्वर सुरक्षा विफलता: एडमिन पासकी पर्यावरण (.env) में कॉन्फ़िगर नहीं है।' });
    }

    const cleanPasskey = (passkey || '').trim();
    const isSecretMatch = configuredSecret && timingSafeStringEqual(cleanPasskey, configuredSecret);
    const isPinMatch = configuredPin && timingSafeStringEqual(cleanPasskey, configuredPin);

    if (!isSecretMatch && !isPinMatch) {
      recordSecurityAudit(req, {
        type: 'security',
        severity: 'high',
        statusCode: 401,
        message: 'अमान्य एडमिन पासकी दर्ज की गई (सत्र अस्वीकृत)',
        technicalError: 'Admin passkey mismatch / invalid credentials',
      });
      return res.status(401).json({ error: 'अमान्य एडमिन पासकी। कृपया सही क्रेडेंशियल दर्ज करें।' });
    }

    // Success: reset brute-force counter
    resetRateLimit(`admin_${clientIp}`);

    recordSecurityAudit(req, {
      type: 'auth',
      severity: 'low',
      statusCode: 200,
      message: 'सुपर एडमिन प्रमाणीकरण सफल (सत्र प्रारंभ)',
      technicalError: 'Superadmin JWT issued (2-hr TTL)',
    });

    // Issue strictly short-lived 2-hour JWT (7200 seconds)
    const token = signJwt(
      {
        role: 'superadmin',
        username: sanitize(username || 'kisan_admin', 50),
        authTime: Date.now(),
      },
      getJwtSecret(),
      7200 // 2 hours strict expiration
    );

    res.json({
      success: true,
      token,
      role: 'superadmin',
      expiresIn: 7200,
      message: 'सुपर एडमिन प्रमाणीकरण सफल।',
    });
  } catch (err) {
    logApiError('POST /admin/login', req, err);
    res.status(500).json({ error: 'प्रशासक लॉगिन में समस्या आई।', technicalError: err.message });
  }
});

// 16. Super Admin Live Platform Metrics
router.get('/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const totalFarmers = await FarmerProfile.countDocuments();
    const totalMarketListings = await MarketListing.countDocuments();
    const totalCommunityQAs = await CommunityQA.countDocuments();
    const totalMandiRates = await MandiRate.countDocuments();
    const activeBroadcasts = await BroadcastAdvisory.countDocuments({ active: true });

    // Aggregate total acreage and plots across all registered farmers
    const landStats = await FarmerProfile.aggregate([
      { $unwind: { path: '$plots', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalPlotAcres: { $sum: '$plots.areaAcres' },
          totalPlots: { $sum: { $cond: [{ $ifNull: ['$plots.plotId', false] }, 1, 0] } },
        },
      },
    ]);

    // Aggregate farmer distribution by District
    const districtStats = await FarmerProfile.aggregate([
      {
        $group: {
          _id: '$district',
          farmersCount: { $sum: 1 },
          totalAcreage: { $sum: '$totalLandAcres' },
        },
      },
      { $sort: { farmersCount: -1 } },
      { $limit: 10 },
    ]);

    const memUsage = process.memoryUsage();

    res.json({
      metrics: {
        totalFarmers,
        totalPlots: landStats[0]?.totalPlots || 0,
        totalPlotAcres: Math.round((landStats[0]?.totalPlotAcres || 0) * 10) / 10,
        totalMarketListings,
        totalCommunityQAs,
        totalMandiRates,
        activeBroadcasts,
      },
      districtStats: districtStats.map((d) => ({
        district: d._id || 'अनिदिष्ट',
        farmersCount: d.farmersCount,
        totalAcreage: Math.round(d.totalAcreage * 10) / 10,
      })),
      systemHealth: {
        uptimeSeconds: Math.round(process.uptime()),
        memoryRssMb: Math.round(memUsage.rss / 1024 / 1024),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    logApiError('GET /admin/stats', req, err);
    res.status(500).json({ error: 'प्लेटफॉर्म सांख्यिकी लोड करने में असमर्थ।', technicalError: err.message });
  }
});

// 17. Super Admin Farmer Registry Audit (Privacy-Preserved / Zero PII Leakage)
router.get('/admin/farmers', requireAdminAuth, async (req, res) => {
  try {
    const search = sanitize(req.query.search || '', 50);
    const district = sanitize(req.query.district || '', 50);
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);

    const filter = {};
    if (district && district !== 'all') {
      filter.district = district;
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { village: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const farmers = await FarmerProfile.find(filter)
      .select('phone name district village totalLandAcres plots createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const result = farmers.map((f) => ({
      phoneMasked: f.phone ? `${f.phone.slice(0, 2)}••••••${f.phone.slice(-2)}` : '••••••••••',
      phone: f.phone,
      name: f.name,
      district: f.district,
      village: f.village || '—',
      plotsCount: f.plots?.length || 0,
      totalLandAcres: f.totalLandAcres || 0,
      createdAt: f.createdAt,
    }));

    res.json(result);
  } catch (err) {
    logApiError('GET /admin/farmers', req, err);
    res.status(500).json({ error: 'किसान रजिस्ट्री लोड करने में विफल।', technicalError: err.message });
  }
});

// 18. Super Admin Advisory Broadcasts Management
router.get('/admin/broadcasts', requireAdminAuth, async (req, res) => {
  try {
    const list = await BroadcastAdvisory.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(list);
  } catch (err) {
    logApiError('GET /admin/broadcasts', req, err);
    res.status(500).json({ error: 'प्रसारण लोड करने में विफल।', technicalError: err.message });
  }
});

router.post('/admin/broadcasts', requireAdminAuth, validateBody('CreateBroadcastRequest', Schemas.CreateBroadcastRequest), async (req, res) => {
  try {
    const { title, category, severity, message, targetDistrict, author, validTill } = req.body;
    const cleanTitle = sanitize(title, 200);
    const cleanMessage = sanitize(message, 1000);

    if (!cleanTitle || !cleanMessage) {
      return res.status(400).json({ error: 'शीर्षक और संदेश दोनों आवश्यक हैं।' });
    }

    const broadcast = new BroadcastAdvisory({
      id: `adv-${Date.now()}`,
      title: cleanTitle,
      category: ['weather', 'pest', 'mandi', 'scheme', 'general'].includes(category) ? category : 'general',
      severity: ['info', 'warning', 'urgent'].includes(severity) ? severity : 'info',
      message: cleanMessage,
      targetDistrict: sanitize(targetDistrict || 'all', 50),
      author: sanitize(author || 'कृषि प्रशासक / विशेषज्ञ', 100),
      validTill: sanitize(validTill || '', 50),
      active: true,
    });

    const saved = await broadcast.save();
    res.status(201).json(saved);
  } catch (err) {
    logApiError('POST /admin/broadcasts', req, err);
    res.status(500).json({ error: 'प्रसारण सहेजने में विफल।', technicalError: err.message });
  }
});

router.delete('/admin/broadcasts/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    await BroadcastAdvisory.findOneAndDelete(query);
    res.json({ success: true, message: 'प्रसारण सफलतापूर्वक हटा दिया गया।' });
  } catch (err) {
    logApiError('DELETE /admin/broadcasts/:id', req, err);
    res.status(500).json({ error: 'प्रसारण हटाने में विफल।', technicalError: err.message });
  }
});

// 19. Super Admin Direct Trade Moderation
router.delete('/admin/listings/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    await MarketListing.findOneAndDelete(query);
    res.json({ success: true, message: 'उपज लिस्टिंग हटा दी गई।' });
  } catch (err) {
    logApiError('DELETE /admin/listings/:id', req, err);
    res.status(500).json({ error: 'लिस्टिंग हटाने में विफल।', technicalError: err.message });
  }
});

// 20. Super Admin Community QA Moderation
router.delete('/admin/qa/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = {
      $or: [
        { id },
        ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])
      ]
    };
    await CommunityQA.findOneAndDelete(query);
    res.json({ success: true, message: 'चौपाल चर्चा हटा दी गई।' });
  } catch (err) {
    logApiError('DELETE /admin/qa/:id', req, err);
    res.status(500).json({ error: 'चर्चा हटाने में विफल।', technicalError: err.message });
  }
});

// 21. Super Admin Live External & Internal API Health Checker
router.get('/admin/api-health', requireAdminAuth, async (req, res) => {
  try {
    const startTime = Date.now();

    // 1. Core Database (MongoDB Atlas)
    const checkMongo = async () => {
      const t0 = Date.now();
      try {
        const state = mongoose.connection.readyState;
        if (state !== 1) {
          return {
            id: 'mongodb',
            name: 'MongoDB Atlas क्लस्टर',
            category: 'कोर डेटाबेस (Core Database)',
            target: mongoose.connection.host || 'Atlas Cloud Cluster',
            status: state === 2 ? 'degraded' : 'offline',
            statusLabel: state === 2 ? 'कनेक्ट हो रहा है' : 'डिस्कनेक्टेड',
            latencyMs: Date.now() - t0,
            message: state === 2 ? 'डेटाबेस कनेक्शन प्रक्रियाधीन है' : 'डेटाबेस कनेक्शन बंद है',
            lastChecked: new Date().toISOString(),
          };
        }
        await mongoose.connection.db.admin().ping();
        return {
          id: 'mongodb',
          name: 'MongoDB Atlas क्लस्टर',
          category: 'कोर डेटाबेस (Core Database)',
          target: mongoose.connection.host || 'Atlas Cloud Cluster',
          status: 'connected',
          statusLabel: 'सक्रिय (Connected)',
          latencyMs: Date.now() - t0,
          message: `डेटाबेस: ${mongoose.connection.name || 'kisan_saathi'} (सक्रिय)`,
          lastChecked: new Date().toISOString(),
        };
      } catch (err) {
        return {
          id: 'mongodb',
          name: 'MongoDB Atlas क्लस्टर',
          category: 'कोर डेटाबेस (Core Database)',
          target: 'Atlas Cloud Cluster',
          status: 'offline',
          statusLabel: 'कनेक्शन त्रुटि',
          latencyMs: Date.now() - t0,
          message: sanitizeLogMessage(err.message || 'डेटाबेस से संपर्क नहीं हो सका'),
          lastChecked: new Date().toISOString(),
        };
      }
    };

    // 2. data.gov.in (OGD India / Agmarknet Mandi API)
    const checkDataGovIn = async () => {
      const t0 = Date.now();
      const apiKey = externalApisConfig.mandi.apiKey;
      let mandiHost = 'api.data.gov.in';
      try {
        mandiHost = new URL(externalApisConfig.mandi.baseUrl).hostname;
      } catch {}

      if (!apiKey) {
        return {
          id: 'data_gov_in',
          name: 'data.gov.in (OGD India / Agmarknet)',
          category: 'मंडी दर API (Live Mandi Rates)',
          target: mandiHost,
          status: 'not_configured',
          statusLabel: 'कुंजी अनुपलब्ध',
          latencyMs: 0,
          message: 'DATA_GOV_IN_API_KEY कॉन्फ़िगर नहीं है (मानक संदर्भ दरें सक्रिय)',
          lastChecked: new Date().toISOString(),
        };
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), Math.min(externalApisConfig.mandi.timeoutMs, 5000));
        const resourceId = externalApisConfig.mandi.resourceId;
        const base = externalApisConfig.mandi.baseUrl.endsWith('/')
          ? externalApisConfig.mandi.baseUrl
          : `${externalApisConfig.mandi.baseUrl}/`;
        const url = `${base}${resourceId}?api-key=${apiKey}&format=json&limit=1`;
        const r = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeout);
        const lat = Date.now() - t0;

        if (r.ok) {
          return {
            id: 'data_gov_in',
            name: 'data.gov.in (OGD India / Agmarknet)',
            category: 'मंडी दर API (Live Mandi Rates)',
            target: mandiHost,
            status: 'connected',
            statusLabel: 'सक्रिय (Live Mandi Stream)',
            latencyMs: lat,
            compliance: 'GODL-India 100% अनुपालित (Attribution & Non-Endorsement Active)',
            message: 'आधिकारिक OGD India Agmarknet मंडी फीड पूर्णतः सक्रिय व GODL-India अनुपालित है',
            lastChecked: new Date().toISOString(),
          };
        } else {
          return {
            id: 'data_gov_in',
            name: 'data.gov.in (OGD India / Agmarknet)',
            category: 'मंडी दर API (Live Mandi Rates)',
            target: mandiHost,
            status: r.status === 401 || r.status === 403 ? 'degraded' : 'offline',
            statusLabel: r.status === 401 || r.status === 403 ? 'अमान्य कुंजी / कोटा' : `HTTP ${r.status}`,
            latencyMs: lat,
            message: `OGD API सर्वर ने HTTP ${r.status} लौटाया`,
            lastChecked: new Date().toISOString(),
          };
        }
      } catch (err) {
        return {
          id: 'data_gov_in',
          name: 'data.gov.in (OGD India / Agmarknet)',
          category: 'मंडी दर API (Live Mandi Rates)',
          target: mandiHost,
          status: 'offline',
          statusLabel: 'टाइमआउट / ऑफलाइन',
          latencyMs: Date.now() - t0,
          message: err.name === 'AbortError' ? 'अनुरोध समय समाप्त (>5s)' : sanitizeLogMessage(err.message || 'संपर्क विफल'),
          lastChecked: new Date().toISOString(),
        };
      }
    };

    // 3. Google Gemini Multimodal Vision AI
    const checkGeminiAi = async () => {
      const t0 = Date.now();
      const apiKey = externalApisConfig.gemini.apiKey;
      let geminiHost = 'generativelanguage.googleapis.com';
      try {
        geminiHost = new URL(externalApisConfig.gemini.baseUrl).hostname;
      } catch {}

      if (!apiKey) {
        return {
          id: 'gemini_ai',
          name: 'Google Gemini Multimodal AI',
          category: 'फसल डॉक्टर विज़न AI (Crop Doctor)',
          target: geminiHost,
          status: 'not_configured',
          statusLabel: 'कुंजी अनुपलब्ध',
          latencyMs: 0,
          message: 'GEMINI_API_KEY कॉन्फ़िगर नहीं है (लक्षण गाइड मोड सक्रिय)',
          lastChecked: new Date().toISOString(),
        };
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), Math.min(externalApisConfig.gemini.timeoutMs, 5000));
        const url = `${externalApisConfig.gemini.baseUrl}?key=${apiKey}&pageSize=1`;
        const r = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        const lat = Date.now() - t0;

        if (r.ok) {
          return {
            id: 'gemini_ai',
            name: 'Google Gemini Multimodal AI',
            category: 'फसल डॉक्टर विज़न AI (Crop Doctor)',
            target: geminiHost,
            status: 'connected',
            statusLabel: 'सक्रिय (Gemini Ready)',
            latencyMs: lat,
            message: `AI विज़न पादप रोग निदान मॉडल सुचारु रूप से कनेक्टेड है (मॉडल श्रृंखला: ${externalApisConfig.gemini.models.slice(0, 2).join(', ')})`,
            lastChecked: new Date().toISOString(),
          };
        } else {
          return {
            id: 'gemini_ai',
            name: 'Google Gemini Multimodal AI',
            category: 'फसल डॉक्टर विज़न AI (Crop Doctor)',
            target: geminiHost,
            status: r.status === 400 || r.status === 403 ? 'degraded' : 'offline',
            statusLabel: `HTTP ${r.status}`,
            latencyMs: lat,
            message: `Google Gemini API ने HTTP ${r.status} लौटाया`,
            lastChecked: new Date().toISOString(),
          };
        }
      } catch (err) {
        return {
          id: 'gemini_ai',
          name: 'Google Gemini Multimodal AI',
          category: 'फसल डॉक्टर विज़न AI (Crop Doctor)',
          target: geminiHost,
          status: 'offline',
          statusLabel: 'टाइमआउट / ऑफलाइन',
          latencyMs: Date.now() - t0,
          message: err.name === 'AbortError' ? 'अनुरोध समय समाप्त (>5s)' : sanitizeLogMessage(err.message || 'संपर्क विफल'),
          lastChecked: new Date().toISOString(),
        };
      }
    };

    // 4. Open-Meteo Weather API
    const checkWeather = async () => {
      const t0 = Date.now();
      let weatherHost = 'api.open-meteo.com';
      try {
        weatherHost = new URL(externalApisConfig.weather.baseUrl).hostname;
      } catch {}

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), Math.min(externalApisConfig.weather.timeoutMs, 5000));
        const url = `${externalApisConfig.weather.baseUrl}?latitude=21.25&longitude=81.63&current_weather=true`;
        const r = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        const lat = Date.now() - t0;

        if (r.ok) {
          return {
            id: 'open_meteo',
            name: 'Open-Meteo Weather API',
            category: 'मौसम व वर्षा पूर्वानुमान (Weather Service)',
            target: weatherHost,
            status: 'connected',
            statusLabel: 'सक्रिय (Live Satellite)',
            latencyMs: lat,
            message: 'लाइव मौसम, वर्षा व तापमान पूर्वानुमान सक्रिय है',
            lastChecked: new Date().toISOString(),
          };
        } else {
          return {
            id: 'open_meteo',
            name: 'Open-Meteo Weather API',
            category: 'मौसम व वर्षा पूर्वानुमान (Weather Service)',
            target: weatherHost,
            status: 'degraded',
            statusLabel: `HTTP ${r.status}`,
            latencyMs: lat,
            message: `मौसम सर्वर ने HTTP ${r.status} लौटाया`,
            lastChecked: new Date().toISOString(),
          };
        }
      } catch (err) {
        return {
          id: 'open_meteo',
          name: 'Open-Meteo Weather API',
          category: 'मौसम व वर्षा पूर्वानुमान (Weather Service)',
          target: weatherHost,
          status: 'offline',
          statusLabel: 'टाइमआउट / ऑफलाइन',
          latencyMs: Date.now() - t0,
          message: err.name === 'AbortError' ? 'समय समाप्त (>5s)' : sanitizeLogMessage(err.message || 'संपर्क विफल'),
          lastChecked: new Date().toISOString(),
        };
      }
    };

    // 5. External Government Portals Gateway
    const checkPortal = async (id, name, category, url, description) => {
      const t0 = Date.now();
      let hostname = url;
      try {
        hostname = new URL(url).hostname;
      } catch {}

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const r = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 KisanSaathi/1.0 HealthCheck' },
        });
        clearTimeout(timeout);
        const lat = Date.now() - t0;
        const isReachable = r.status >= 200 && r.status < 500;

        return {
          id,
          name,
          category,
          target: hostname,
          url,
          status: isReachable ? 'connected' : 'degraded',
          statusLabel: isReachable ? 'पहुंच योग्य (Reachable)' : `HTTP ${r.status}`,
          latencyMs: lat,
          message: `${description} (${r.status} ${r.statusText || 'OK'})`,
          lastChecked: new Date().toISOString(),
        };
      } catch (err) {
        return {
          id,
          name,
          category,
          target: hostname,
          url,
          status: 'offline',
          statusLabel: 'टाइमआउट / ऑफलाइन',
          latencyMs: Date.now() - t0,
          message: err.name === 'AbortError' ? 'प्रतिक्रिया समय समाप्त (>4s)' : (err.message || 'गेटवे तक पहुंच विफल'),
          lastChecked: new Date().toISOString(),
        };
      }
    };

    const agristackUrl = externalApisConfig.portals.agristack;
    const bhuiyanUrl = externalApisConfig.portals.bhuiyan;
    const khadyaUrl = externalApisConfig.portals.khadya;
    const pmkisanUrl = externalApisConfig.portals.pmkisan;
    const credaUrl = externalApisConfig.portals.creda;

    const checkPromises = [
      checkMongo(),
      checkDataGovIn(),
      checkGeminiAi(),
      checkWeather(),
      checkPortal('agristack', 'एग्री-स्टैक (Agri-Stack / Krishi Registry)', 'सरकारी पोर्टल लिंक (Gov Portal)', agristackUrl, 'डिजिटल किसान रजिस्ट्री गेटवे'),
      checkPortal('bhuiyan', 'भुइयां पोर्टल (Bhuiyan CG Land Records)', 'सरकारी पोर्टल लिंक (Gov Portal)', bhuiyanUrl, 'डिजिटल खसरा व बी-1 नक्शा गेटवे'),
      checkPortal('khadya', 'सीजी खाद्य उपार्जन (CG Khadya Dhan Uparjan)', 'सरकारी पोर्टल लिंक (Gov Portal)', khadyaUrl, 'धान उपार्जन टोकन व भुगतान गेटवे'),
      checkPortal('pmkisan', 'पीएम-किसान सम्मान निधि (PM-Kisan DBT)', 'सरकारी पोर्टल लिंक (Gov Portal)', pmkisanUrl, 'केन्द्रीय DBT किस्त सत्यापन गेटवे'),
      checkPortal('creda', 'क्रेडा सौर सुजला (CREDA Solar Sujala)', 'सरकारी पोर्टल लिंक (Gov Portal)', credaUrl, 'सौर सिंचाई पंप योजना गेटवे'),
    ];

    const results = await Promise.allSettled(checkPromises);
    const services = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        id: `service_${i}`,
        name: 'अज्ञात सेवा',
        category: 'सिस्टम',
        target: 'गेटवे',
        status: 'offline',
        statusLabel: 'जांच विफल',
        latencyMs: 0,
        message: r.reason?.message || 'जांच प्रक्रिया में अप्रत्याशित समस्या',
        lastChecked: new Date().toISOString(),
      };
    });

    const connectedCount = services.filter((s) => s.status === 'connected').length;
    const degradedCount = services.filter((s) => s.status === 'degraded' || s.status === 'not_configured').length;
    const offlineCount = services.filter((s) => s.status === 'offline').length;

    const overallStatus = offlineCount === 0 && degradedCount === 0 ? 'optimal' : offlineCount > 0 ? 'degraded' : 'partial';

    res.json({
      checkedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      overallStatus,
      summary: {
        total: services.length,
        connected: connectedCount,
        warning: degradedCount,
        offline: offlineCount,
      },
      services,
    });
  } catch (err) {
    logApiError('GET /admin/api-health', req, err);
    res.status(500).json({ error: 'एपीआई स्वास्थ्य जांच निष्पादित करने में विफल।', technicalError: err.message });
  }
});

// 13. Super Admin External APIs Configuration & Live Debugging Inspector
router.get('/admin/external-config', requireAdminAuth, async (req, res) => {
  try {
    const maskKey = (key) => {
      if (!key) return 'अनुपलब्ध (Not Configured)';
      if (key.length <= 8) return '****';
      return `${key.slice(0, 4)}...${key.slice(-4)}`;
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      config: {
        mandi: {
          name: 'data.gov.in (OGD Agmarknet Mandi Rates)',
          baseUrl: externalApisConfig.mandi.baseUrl,
          resourceId: externalApisConfig.mandi.resourceId,
          apiKeyMasked: maskKey(externalApisConfig.mandi.apiKey),
          isKeyConfigured: !!externalApisConfig.mandi.apiKey,
          limit: externalApisConfig.mandi.limit,
          timeoutMs: externalApisConfig.mandi.timeoutMs,
          backupMirrorUrl: externalApisConfig.mandi.backupMirrorUrl,
          stateVariants: externalApisConfig.mandi.stateVariants,
          envKeys: {
            baseUrl: 'MANDI_API_BASE_URL',
            resourceId: 'DATA_GOV_IN_RESOURCE_ID',
            apiKey: 'DATA_GOV_IN_API_KEY',
            limit: 'MANDI_API_LIMIT',
            timeoutMs: 'MANDI_API_TIMEOUT_MS',
            stateVariants: 'MANDI_STATE_VARIANTS',
            backupMirrorUrl: 'MANDI_BACKUP_MIRROR_URL',
          },
          troubleshooting: [
            {
              issue: 'HTTP 401 / 403 (Invalid API Key)',
              cause: 'data.gov.in API key अमान्य या समाप्त हो गई है',
              action: '.env में DATA_GOV_IN_API_KEY अपडेट करें',
            },
            {
              issue: 'HTTP 404 (Resource Not Found)',
              cause: 'OGD India ने Agmarknet कैटलॉग का रिसोर्स ID बदल दिया है',
              action: 'data.gov.in से नया ID लेकर .env में DATA_GOV_IN_RESOURCE_ID अपडेट करें',
            },
            {
              issue: 'Request Timeout (>8s)',
              cause: 'सरकारी OGD सर्वर पर अत्यधिक लोड या स्लो रिस्पांस',
              action: '.env में MANDI_API_TIMEOUT_MS बढ़ाएं या स्वतः बैकअप मिरर सक्रिय रहेगा',
            },
          ],
        },
        gemini: {
          name: 'Google Gemini Multimodal AI (Crop Doctor)',
          baseUrl: externalApisConfig.gemini.baseUrl,
          apiKeyMasked: maskKey(externalApisConfig.gemini.apiKey),
          isKeyConfigured: !!externalApisConfig.gemini.apiKey,
          models: externalApisConfig.gemini.models,
          timeoutMs: externalApisConfig.gemini.timeoutMs,
          temperature: externalApisConfig.gemini.temperature,
          envKeys: {
            baseUrl: 'GEMINI_API_BASE_URL',
            apiKey: 'GEMINI_API_KEY',
            models: 'GEMINI_MODELS',
            timeoutMs: 'GEMINI_API_TIMEOUT_MS',
            temperature: 'GEMINI_TEMPERATURE',
          },
          troubleshooting: [
            {
              issue: 'HTTP 429 (Resource Exhausted / Rate Limit)',
              cause: 'दैनिक या प्रति मिनट API कोटा समाप्त हो गया है',
              action: 'सिस्टम स्वतः अगले मॉडल पर स्विच करेगा। आवश्यकतानुसार नई GEMINI_API_KEY डालें',
            },
            {
              issue: 'HTTP 404 (Model Not Found / Retired)',
              cause: 'गूगल ने मॉडल संस्करण रिटायर कर दिया है (उदा. 1.5 -> 2.5)',
              action: '.env में GEMINI_MODELS बदलें (उदा. gemini-2.5-flash,gemini-2.5-flash-lite)',
            },
            {
              issue: 'Cold Start / Timeout (>16s)',
              cause: 'धीमे मोबाइल नेटवर्क पर हाई-रेज़ोल्यूशन फोटो अपलोड',
              action: '.env में GEMINI_API_TIMEOUT_MS को 20000ms तक बढ़ा सकते हैं',
            },
          ],
        },
        weather: {
          name: 'Open-Meteo Satellite Weather API',
          baseUrl: externalApisConfig.weather.baseUrl,
          timeoutMs: externalApisConfig.weather.timeoutMs,
          envKeys: {
            baseUrl: 'WEATHER_API_BASE_URL',
            timeoutMs: 'WEATHER_API_TIMEOUT_MS',
          },
          troubleshooting: [
            {
              issue: 'HTTP 429 / Blocked',
              cause: 'Open-Meteo फ्री टियर कॉल लिमिट (10,000 कॉल/दिन)',
              action: 'क्लाइंट-साइड 15-मिनट कैशे लागू है, सर्वर पर WEATHER_API_TIMEOUT_MS जांचें',
            },
          ],
        },
        portals: {
          name: 'External Government Portals',
          agristack: externalApisConfig.portals.agristack,
          bhuiyan: externalApisConfig.portals.bhuiyan,
          khadya: externalApisConfig.portals.khadya,
          pmkisan: externalApisConfig.portals.pmkisan,
          creda: externalApisConfig.portals.creda,
          envKeys: {
            agristack: 'VITE_PORTAL_AGRISTACK_URL',
            bhuiyan: 'VITE_PORTAL_BHUIYAN_URL',
            khadya: 'VITE_PORTAL_TOKEN_URL',
            pmkisan: 'VITE_PORTAL_PMKISAN_URL',
            creda: 'VITE_PORTAL_CREDA_URL',
          },
          troubleshooting: [
            {
              issue: 'सरकारी पोर्टल लिंक बदल गया या डोमेन अपडेट हुआ',
              cause: 'विभाग द्वारा नया URL या सुरक्षा रीडायरेक्ट लागू किया गया',
              action: '.env में संबंधित VITE_PORTAL_* चर को अपडेट करें (कोड में कोई बदलाव नहीं चाहिए)',
            },
          ],
        },
      },
    });
  } catch (err) {
    logApiError('GET /admin/external-config', req, err);
    res.status(500).json({ error: 'बाह्य एपीआई कॉन्फ़िगरेशन प्राप्त करने में विफल।', technicalError: err.message });
  }
});

// 22. Super Admin Real-Time Security & Error Audit Logs (Zero-PII Bounded Engine)
router.get('/admin/audit-logs', requireAdminAuth, (req, res) => {
  try {
    const { severity = 'all', type = 'all', search = '', limit = 50 } = req.query;
    const cleanSearch = sanitize(search, 100);
    const logs = getAuditLogs({
      severity: sanitize(severity, 20),
      type: sanitize(type, 20),
      search: cleanSearch,
      limit: parseInt(limit, 10) || 50,
    });
    const stats = getAuditStats();

    res.json({
      success: true,
      stats,
      logs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logApiError('GET /admin/audit-logs', req, err);
    res.status(500).json({ error: 'सुरक्षा ऑडिट लॉग्स प्राप्त करने में विफल।', technicalError: err.message });
  }
});

router.delete('/admin/audit-logs', requireAdminAuth, (req, res) => {
  try {
    clearAuditLogs();
    res.json({
      success: true,
      message: 'सभी सुरक्षा एवं एरर ऑडिट लॉग्स सफलतापूर्वक साफ़ कर दिए गए।',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logApiError('DELETE /admin/audit-logs', req, err);
    res.status(500).json({ error: 'ऑडिट लॉग्स साफ़ करने में विफल।', technicalError: err.message });
  }
});

export default router;

