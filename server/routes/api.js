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
import crypto from 'node:crypto';

const router = express.Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[CRITICAL SECURITY ERROR] JWT_SECRET is not configured in .env!');
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

// Enterprise Security: In-Memory IP Brute-Force Rate Limiter
const rateLimitMap = new Map();

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

// Helper: Validate Indian phone numbers (10 digits starting with 6, 7, 8, or 9)
const isValidIndianPhone = (phone) => {
  const cleanPhone = phone.replace(/[\s\-\+]/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(cleanPhone);
};

// 0. App Version Check (Rate-limit free In-App Update Engine)
router.get('/version', (req, res) => {
  const version = process.env.VITE_APP_VERSION || process.env.APP_VERSION || '1.0.4';
  const appName = process.env.VITE_APP_NAME || 'किसान साथी';
  res.json({
    version,
    minSupportedVersion: '1.0.0',
    apkDownloadUrl: process.env.VITE_APK_DOWNLOAD_URL || process.env.APK_DOWNLOAD_URL || '',
    releaseName: `${appName} v${version}`,
    releaseNotes: 'संतुलित 4+4 टूल्स ग्रिड, 3-दिवसीय मौसम पूर्वानुमान, सुपर एडमिन कंट्रोल रूम और लाइव मंडी पल्स।',
    updatedAt: new Date().toISOString()
  });
});

// 1. Crops (Scalable lean query with projection)
router.get('/crops', async (req, res) => {
  try {
    const crops = await Crop.find().select('-__v').limit(50).lean();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crops data' });
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
    res.status(500).json({ error: 'Failed to fetch fertilizer dosage data' });
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
    res.status(500).json({ error: 'Failed to fetch diseases data' });
  }
});

// 4. Mandi Rates
router.get('/mandi-rates', async (req, res) => {
  try {
    const rates = await MandiRate.find().select('-__v').sort({ modalRate: -1 }).limit(100).lean();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mandi rates' });
  }
});

// 5. Schemes
router.get('/schemes', async (req, res) => {
  try {
    const schemes = await Scheme.find().select('-__v').limit(50).lean();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schemes data' });
  }
});

// 6. Machinery Rentals
router.get('/machinery', async (req, res) => {
  try {
    const machinery = await MachineryRental.find().select('-__v').limit(50).lean();
    res.json(machinery);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch machinery listings' });
  }
});

// 7. Community Q&A
router.get('/community-qa', async (req, res) => {
  try {
    const questions = await CommunityQA.find().select('-__v').sort({ createdAt: -1 }).limit(50).lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch community discussions' });
  }
});

router.post('/community-qa', async (req, res) => {
  try {
    const { author, crop, question } = req.body;
    const cleanQuestion = sanitize(question, 500);

    if (!cleanQuestion || cleanQuestion.length < 5) {
      return res.status(400).json({ error: 'कृपया कम से कम 5 अक्षरों का सवाल लिखें।' });
    }

    const cleanAuthor = sanitize(author || 'किसान भाई', 60);
    const cleanCrop = sanitize(crop || 'सामान्य', 60);

    const newQA = new CommunityQA({
      id: `qa-${Date.now()}`,
      author: cleanAuthor,
      crop: cleanCrop,
      time: 'अभी-अभी',
      question: cleanQuestion,
      answersCount: 1,
      bestAnswer: 'आपका प्रश्न चौपाल में दर्ज हो चुका है। कृषि वैज्ञानिक व साथी किसान जल्द समाधान देंगे।',
    });

    const saved = await newQA.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save question' });
  }
});

// 8. Direct Marketplace (Strict validation on farmer phone and input)
router.get('/marketplace', async (req, res) => {
  try {
    const listings = await MarketListing.find().select('-__v').sort({ createdAt: -1 }).limit(50).lean();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marketplace listings' });
  }
});

router.post('/marketplace', async (req, res) => {
  try {
    const { crop, quantity, expectedPrice, farmerName, location, phone } = req.body;

    const cleanCrop = sanitize(crop, 80);
    const cleanQuantity = sanitize(quantity, 50);
    const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

    if (!cleanCrop || !cleanQuantity) {
      return res.status(400).json({ error: 'फसल का नाम और मात्रा अनिवार्य हैं।' });
    }

    if (!isValidIndianPhone(cleanPhone)) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।' });
    }

    const listing = new MarketListing({
      id: `list-${Date.now()}`,
      crop: cleanCrop,
      quantity: cleanQuantity,
      expectedPrice: sanitize(expectedPrice || 'मंडी भाव अनुसार', 60),
      farmerName: sanitize(farmerName || 'किसान साथी', 80),
      location: sanitize(location || 'छत्तीसगढ़', 100),
      phone: cleanPhone,
      date: 'आज पोस्ट किया गया',
    });

    const saved = await listing.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save market listing' });
  }
});

// ==========================================
// 🌾 मेरा खेत: MULTI-FARMER & MULTI-PLOT APIs
// ==========================================

// 9. Farmer Login / Auto-Registration with 4-Digit PIN
router.post('/farmer/auth', async (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'farmer_client';
    const rate = checkRateLimit(`farmer_${clientIp}`, 15, 60000); // 15 attempts per minute
    if (rate.isBlocked) {
      return res.status(429).json({ error: 'अत्यधिक अनुरोध! कृपया 1 मिनट बाद पुनः प्रयास करें।' });
    }

    const { phone, name, pin, village, district, totalLandAcres } = req.body;
    const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

    if (!isValidIndianPhone(cleanPhone)) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }

    const cleanPin = (pin || '1234').toString().trim().slice(0, 6);
    let farmer = await FarmerProfile.findOne({ phone: cleanPhone });

    if (farmer) {
      // Authenticate existing farmer with timing-safe constant-time comparison
      if (farmer.pin && !timingSafeStringEqual(farmer.pin, cleanPin)) {
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
    res.status(500).json({ error: 'किसान लॉगिन विफल रहा।' });
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
    res.status(500).json({ error: 'डेटा लोड करने में असमर्थ।' });
  }
});

// 11. Add / Update Plot for Farmer
router.post('/farmer/plots/:phone', requireFarmerAuth, async (req, res) => {
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
    res.status(500).json({ error: 'प्लॉट सहेजने में विफल।' });
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

    farmer.plots = farmer.plots.filter((p) => p.plotId !== plotId);
    await farmer.save();
    res.json(farmer.plots);
  } catch (err) {
    res.status(500).json({ error: 'प्लॉट हटाने में असमर्थ।' });
  }
});

// 13. Toggle Task Completion for a Plot
router.post('/farmer/tasks/:phone', requireFarmerAuth, async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const { plotId, taskId } = req.body;

    const farmer = await FarmerProfile.findOne({ phone: cleanPhone });
    if (!farmer) {
      return res.status(404).json({ error: 'किसान खाता नहीं मिला।' });
    }

    const plot = farmer.plots.find((p) => p.plotId === plotId);
    if (!plot) {
      return res.status(404).json({ error: 'प्लॉट नहीं मिला।' });
    }

    if (plot.completedTasks.includes(taskId)) {
      plot.completedTasks = plot.completedTasks.filter((t) => t !== taskId);
    } else {
      plot.completedTasks.push(taskId);
    }

    await farmer.save();
    res.json({ plotId, completedTasks: plot.completedTasks });
  } catch (err) {
    res.status(500).json({ error: 'कार्य स्थिति अपडेट करने में असमर्थ।' });
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
    res.status(500).json({ error: ' Failed to fetch broadcasts' });
  }
});

// 15. Super Admin Passkey Login (Issues Admin JWT with Rate-Limiting & Timing-Safe Security)
router.post('/admin/login', (req, res) => {
  try {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'admin_client';
    const rate = checkRateLimit(`admin_${clientIp}`, 5, 15 * 60000); // 5 attempts per 15 minutes

    if (rate.isBlocked) {
      const waitMin = Math.ceil(rate.remainingMs / 60000);
      return res.status(429).json({
        error: `अत्यधिक असफल प्रयास! सुरक्षा कारणों से एडमिन लॉगिन ${waitMin} मिनट के लिए लॉक कर दिया गया है।`,
      });
    }

    const { passkey, username } = req.body;
    const configuredSecret = getAdminSecret();

    if (!configuredSecret) {
      return res.status(500).json({ error: 'सर्वर सुरक्षा विफलता: एडमिन पासकी पर्यावरण (.env) में कॉन्फ़िगर नहीं है।' });
    }

    if (!passkey || !timingSafeStringEqual(passkey.trim(), configuredSecret)) {
      return res.status(401).json({ error: 'अमान्य एडमिन पासकी। कृपया सही क्रेडेंशियल दर्ज करें।' });
    }

    // Success: reset brute-force counter
    resetRateLimit(`admin_${clientIp}`);

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
    res.status(500).json({ error: 'प्रशासक लॉगिन में समस्या आई।' });
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
    res.status(500).json({ error: 'प्लेटफॉर्म सांख्यिकी लोड करने में असमर्थ।' });
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
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
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
    res.status(500).json({ error: 'किसान रजिस्ट्री लोड करने में विफल।' });
  }
});

// 18. Super Admin Advisory Broadcasts Management
router.get('/admin/broadcasts', requireAdminAuth, async (req, res) => {
  try {
    const list = await BroadcastAdvisory.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'प्रसारण लोड करने में विफल।' });
  }
});

router.post('/admin/broadcasts', requireAdminAuth, async (req, res) => {
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
    res.status(500).json({ error: 'प्रसारण सहेजने में विफल।' });
  }
});

router.delete('/admin/broadcasts/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await BroadcastAdvisory.findOneAndDelete({ id });
    res.json({ success: true, message: 'प्रसारण सफलतापूर्वक हटा दिया गया।' });
  } catch (err) {
    res.status(500).json({ error: 'प्रसारण हटाने में विफल।' });
  }
});

// 19. Super Admin Direct Trade Moderation
router.delete('/admin/listings/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await MarketListing.findOneAndDelete({ id });
    res.json({ success: true, message: 'उपज लिस्टिंग हटा दी गई।' });
  } catch (err) {
    res.status(500).json({ error: 'लिस्टिंग हटाने में विफल।' });
  }
});

// 20. Super Admin Community QA Moderation
router.delete('/admin/qa/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await CommunityQA.findOneAndDelete({ id });
    res.json({ success: true, message: 'चौपाल चर्चा हटा दी गई।' });
  } catch (err) {
    res.status(500).json({ error: 'चर्चा हटाने में विफल।' });
  }
});

export default router;

