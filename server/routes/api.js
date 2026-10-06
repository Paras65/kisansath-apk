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

const router = express.Router();

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
  res.json({
    version: process.env.APP_VERSION || '1.0.0',
    minSupportedVersion: '1.0.0',
    apkDownloadUrl: process.env.VITE_APK_DOWNLOAD_URL || 'https://github.com/Paras65/kisansath-apk/releases/latest/download/kisan-saathi.apk',
    releaseName: 'किसान साथी v1.0.0',
    releaseNotes: 'संतुलित 4+4 टूल्स ग्रिड, 3-दिवसीय मौसम पूर्वानुमान, और लाइव मंडी पल्स।',
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
    const { phone, name, pin, village, district, totalLandAcres } = req.body;
    const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '').slice(-10);

    if (!isValidIndianPhone(cleanPhone)) {
      return res.status(400).json({ error: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।' });
    }

    const cleanPin = (pin || '1234').toString().trim().slice(0, 6);
    let farmer = await FarmerProfile.findOne({ phone: cleanPhone });

    if (farmer) {
      // Authenticate existing farmer
      if (farmer.pin && farmer.pin !== cleanPin) {
        return res.status(401).json({ error: 'पिन गलत है। कृपया सही 4-अंकीय पिन दर्ज करें।' });
      }
      return res.json(farmer);
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
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'किसान लॉगिन विफल रहा।' });
  }
});

// 10. Get Farmer Profile and Plots
router.get('/farmer/profile/:phone', async (req, res) => {
  try {
    const cleanPhone = (req.params.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    const farmer = await FarmerProfile.findOne({ phone: cleanPhone }).select('-__v').lean();
    if (!farmer) {
      return res.status(404).json({ error: 'किसान प्रोफाइल नहीं मिला।' });
    }
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: 'डेटा लोड करने में असमर्थ।' });
  }
});

// 11. Add / Update Plot for Farmer
router.post('/farmer/plots/:phone', async (req, res) => {
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
router.delete('/farmer/plots/:phone/:plotId', async (req, res) => {
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
router.post('/farmer/tasks/:phone', async (req, res) => {
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

export default router;
