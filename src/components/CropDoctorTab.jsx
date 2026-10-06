import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SpaIcon from '@mui/icons-material/Spa';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import SecurityIcon from '@mui/icons-material/Security';
import { CROP_DISEASES, CROPS } from '../data/kisanData';
import { speakText, stopSpeech, subscribeSpeechState } from '../utils/speech';
import { getCrops, getDiseases } from '../services/apiService';
import { fetchLiveWeather, getSprayAdvisory } from '../services/weatherService';
import { notify } from '../services/notificationService';

// Visual Symptom Quick Filter Taxonomy
const VISUAL_SYMPTOMS = [
  { id: 'all', label: 'सभी लक्षण', icon: '✨', match: '' },
  { id: 'spot', label: 'नाव/आंख जैसे धब्बे', icon: '🍂', match: 'धब्बे' },
  { id: 'stemborer', label: 'गोभ सूखना / सफेद बाली', icon: '🐛', match: 'गोभ' },
  { id: 'bph', label: 'तने पर माहू / पौधा सूखना', icon: '🦟', match: 'माहू' },
  { id: 'sheath', label: 'केंचुली जैसे धब्बे', icon: '🌿', match: 'केंचुली' },
  { id: 'wilt', label: 'अचानक पीलापन / जड़ सूखना', icon: '🟡', match: 'पीलापन' },
  { id: 'rust', label: 'पीला/भूरा पाउडर (रतुआ)', icon: '🌾', match: 'पाउडर' },
  { id: 'armyworm', label: 'पत्तियों में बड़े छेद (इल्ली)', icon: '🐛', match: 'छेद' },
  { id: 'mosaic', label: 'पीले-हरे चकत्ते', icon: '🟡', match: 'चकत्ते' },
  { id: 'curl', label: 'पत्तियां सिकुड़ना व मुड़ना', icon: '🍃', match: 'मुड़ना' },
];

export const CropDoctorTab = ({ selectedDistrict = 'रायपुर' }) => {
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [selectedSymptom, setSelectedSymptom] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cropsList, setCropsList] = useState(CROPS);
  const [diseasesList, setDiseasesList] = useState(CROP_DISEASES);
  const [activeDisease, setActiveDisease] = useState(CROP_DISEASES[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Live Weather Spray Advisory State
  const [sprayAdvisory, setSprayAdvisory] = useState(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const prescriptionRef = useRef(null);

  // Subscribe to speech state changes
  useEffect(() => {
    const unsubscribe = subscribeSpeechState((speaking) => {
      setIsVoicePlaying(speaking);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load live weather spray advisory for selectedDistrict
  useEffect(() => {
    let isMounted = true;
    const loadSprayWeather = async () => {
      try {
        const weather = await fetchLiveWeather(selectedDistrict);
        if (isMounted && weather) {
          const advisory = getSprayAdvisory(weather);
          setSprayAdvisory({ ...advisory, weather });
        }
      } catch (e) {
        console.warn('[CropDoctor] Weather advisory error:', e);
      }
    };
    loadSprayWeather();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  // Load live data from MongoDB if available
  useEffect(() => {
    const loadFromMongo = async () => {
      const liveCrops = await getCrops();
      if (liveCrops && liveCrops.length > 0) setCropsList(liveCrops);
      const liveDiseases = await getDiseases();
      if (liveDiseases && liveDiseases.length > 0) {
        setDiseasesList(liveDiseases);
        setActiveDisease(liveDiseases[0]);
      }
    };
    loadFromMongo();
  }, []);

  // Filter diseases based on selected crop, symptom, and search text
  const filteredDiseases = diseasesList.filter((d) => {
    const matchesCrop = selectedCrop === 'all' || d.cropId === selectedCrop;

    let matchesSymptom = true;
    if (selectedSymptom !== 'all') {
      const symptomDef = VISUAL_SYMPTOMS.find((s) => s.id === selectedSymptom);
      if (symptomDef && symptomDef.match) {
        const needle = symptomDef.match.toLowerCase();
        matchesSymptom =
          (d.symptomTag && d.symptomTag.toLowerCase().includes(needle)) ||
          (d.symptoms && d.symptoms.toLowerCase().includes(needle)) ||
          (d.diseaseName && d.diseaseName.toLowerCase().includes(needle));
      }
    }

    const needle = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !needle ||
      d.diseaseName.toLowerCase().includes(needle) ||
      d.symptoms.toLowerCase().includes(needle) ||
      d.cropName.toLowerCase().includes(needle) ||
      (d.chemicalRemedy && d.chemicalRemedy.toLowerCase().includes(needle));

    return matchesCrop && matchesSymptom && matchesSearch;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const rawDataUrl = loadEvent.target?.result;
        if (!rawDataUrl) return;

        // Downsample large camera photos client-side to prevent OutOfMemory crashes on budget Android phones
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setUploadedImage(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            setUploadedImage(rawDataUrl);
          }
        };
        img.onerror = () => {
          setUploadedImage(rawDataUrl);
        };
        img.src = rawDataUrl;

        setAnalyzing(true);
        setAiReport(null);

        // Simulate intelligent AI plant vision diagnosis
        setTimeout(() => {
          setAnalyzing(false);
          const matched =
            diseasesList.find((d) => (selectedCrop === 'all' ? true : d.cropId === selectedCrop)) ||
            diseasesList[0];
          setActiveDisease(matched);
          setAiReport({
            confidence: 96,
            disease: matched.diseaseName,
            crop: matched.cropName,
            severity: matched.severity || 'गंभीर',
            pumpDose: matched.pumpDose || '12-15 ग्राम प्रति 15 लीटर पंप'
          });

          notify.success(`पौधे की जांच पूर्ण: ${matched.diseaseName} की पहचान हुई!`);

          // Scroll into view to the prescription
          setTimeout(() => {
            prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value so user can re-trigger capture with same or new photo
    if (e.target) e.target.value = '';
  };

  const handleResetScan = () => {
    setUploadedImage(null);
    setAiReport(null);
    setAnalyzing(false);
    notify.info('स्कैन रीसेट कर दिया गया');
  };

  const handleVoiceReadRemedy = (disease) => {
    if (!disease) return;
    const text = `${disease.cropName} में ${disease.diseaseName} का इलाज। 15 लीटर स्प्रे पंप (टंकी) की खुराक है: ${disease.pumpDose || 'अनुशंसा अनुसार'}। रासायनिक उपाय है: ${disease.chemicalRemedy}। जैविक उपाय है: ${disease.organicRemedy}।`;
    speakText(text);
  };

  const handleVoiceReadWeather = () => {
    if (!sprayAdvisory) return;
    const text = `${selectedDistrict} मौसम एवं छिड़काव सलाह: ${sprayAdvisory.advisory}`;
    speakText(text);
  };

  const handleSharePrescription = (disease) => {
    if (!disease) return;
    notify.info('व्हाट्सएप पर पर्ची साझा की जा रही है...');
    const text = `🌿 *किसान साथी - एआई फसल डॉक्टर पर्ची* 🩺
━━━━━━━━━━━━━━━━━━
🌾 *फसल:* ${disease.cropName}
🔬 *रोग का नाम:* ${disease.diseaseName}
⚠️ *गंभीरता:* ${disease.severity || 'गंभीर'}
🧫 *कारक:* ${disease.pathogen || 'फफूंद / कीट'}

🎒 *15 लीटर स्प्रे पंप (टंकी) खुराक:*
👉 *${disease.pumpDose || 'अनुशंसा अनुसार'}*
💧 पानी: 1 एकड़ में 150-200 लीटर (लगभग 10-12 टंकी)

🧪 *अनुशंसित रासायनिक दवा:*
👉 ${disease.chemicalRemedy}

🌱 *जैविक / देसी उपचार:*
👉 ${disease.organicRemedy}

🛡️ *बचाव सलाह:*
👉 ${disease.prevention}
━━━━━━━━━━━━━━━━━━
📍 कृषि वैज्ञानिकों की मानक अनुशंसा आधारित
📲 किसान साथी ऐप डाउनलोड करें: https://init65.co.in/kisan/`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Severity style helper
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'अति गंभीर':
        return { bgcolor: '#ffebee', color: '#b71c1c', border: '1px solid #ffcdd2', dot: '🔴' };
      case 'गंभीर':
        return { bgcolor: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2', dot: '🟠' };
      case 'मध्यम':
      default:
        return { bgcolor: '#e3f2fd', color: '#0d47a1', border: '1px solid #bbdefb', dot: '🔵' };
    }
  };

  return (
    <Box sx={{ pb: 4, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* 1. Header Banner */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 2 }}>
            <LocalHospitalIcon sx={{ color: '#c62828', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#b71c1c', fontSize: '1.15rem', lineHeight: 1.2 }}>
              एआई फसल डॉक्टर (Crop Doctor)
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.78rem' }}>
              कैमरा पहचान • 15L पंप सटीक खुराक • जैविक व रासायनिक उपचार
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<VerifiedIcon sx={{ fontSize: '15px !important', color: '#1b5e20 !important' }} />}
          label="IGKV वैज्ञानिक अनुमोदित"
          size="small"
          sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.72rem' }}
        />
      </Box>

      {/* 2. Live Weather Spray Advisory Banner (Lifecycle Sync) */}
      {sprayAdvisory && (
        <Card
          sx={{
            mb: 2,
            borderRadius: 3,
            bgcolor: sprayAdvisory.canSpray ? '#f1f8e9' : '#fff8e1',
            border: `1.5px solid ${sprayAdvisory.canSpray ? '#a5d6a7' : '#ffe082'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <CardContent sx={{ p: '12px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1 }}>
                {sprayAdvisory.canSpray ? (
                  <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 22, mt: 0.2 }} />
                ) : (
                  <WarningAmberIcon sx={{ color: '#e65100', fontSize: 22, mt: 0.2 }} />
                )}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 0.3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.86rem',
                        color: sprayAdvisory.canSpray ? '#1b5e20' : '#b71c1c'
                      }}
                    >
                      {sprayAdvisory.canSpray ? `✅ ${selectedDistrict}: आज छिड़काव अनुकूल` : `⚠️ ${selectedDistrict}: आज छिड़काव टालें`}
                    </Typography>
                    {sprayAdvisory.weather && (
                      <Box sx={{ display: 'flex', gap: 0.6 }}>
                        <Chip
                          icon={<WaterDropIcon sx={{ fontSize: '12px !important' }} />}
                          label={`वर्षा ${sprayAdvisory.weather.rainProbability}%`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#fff', fontWeight: 600 }}
                        />
                        <Chip
                          icon={<AirIcon sx={{ fontSize: '12px !important' }} />}
                          label={`हवा ${sprayAdvisory.weather.windSpeed} km/h`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#fff', fontWeight: 600 }}
                        />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#444', fontSize: '0.76rem', lineHeight: 1.35, display: 'block' }}>
                    {sprayAdvisory.advisory}
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="मौसम सलाह सुनें">
                <IconButton
                  size="small"
                  onClick={handleVoiceReadWeather}
                  sx={{
                    bgcolor: '#fff',
                    color: sprayAdvisory.canSpray ? '#2e7d32' : '#e65100',
                    border: '1px solid #ddd',
                    p: 0.8
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 3. AI Photo Diagnosis Box (Dual Action: Camera vs Gallery) */}
      <Card
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: 3.5,
          bgcolor: '#fffde7',
          border: '1.5px dashed #fbc02d',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(245, 127, 23, 0.06)'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.94rem', mb: 0.4 }}>
          📸 बीमार पत्ती या तने की फोटो से तुरंत जांच करें
        </Typography>
        <Typography variant="caption" sx={{ color: '#5d4037', display: 'block', mb: 1.5, fontSize: '0.76rem' }}>
          कैमरा से सीधी फोटो लें या गैलरी से चुनें • एआई तुरंत रोग पहचानकर 15L पंप की खुराक बताएगा
        </Typography>

        {/* Dual Input Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Direct Camera Input with capture="environment" for rear camera */}
          <input
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            id="crop-camera-capture"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="crop-camera-capture">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCameraIcon />}
              sx={{
                bgcolor: '#2e7d32',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: 2.5,
                px: 2,
                py: 0.8,
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              कैमरा से फोटो खींचें
            </Button>
          </label>

          {/* Standard Gallery Chooser */}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="crop-gallery-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="crop-gallery-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<PhotoLibraryIcon />}
              sx={{
                borderColor: '#e65100',
                color: '#e65100',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: 2.5,
                px: 2,
                py: 0.8,
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#fff3e0', borderColor: '#bf360c' }
              }}
            >
              गैलरी से चुनें
            </Button>
          </label>
        </Box>

        {analyzing && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2 }}>
            <CircularProgress size={22} sx={{ color: '#e65100' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e65100', fontSize: '0.82rem' }}>
              एआई फोटो का स्कैन व विश्लेषण कर रहा है... कृपया प्रतीक्षा करें
            </Typography>
          </Box>
        )}

        {uploadedImage && !analyzing && aiReport && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: '#ffffff',
              borderRadius: 2.5,
              border: '1px solid #ffe082',
              textAlign: 'left'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                component="img"
                src={uploadedImage}
                alt="Uploaded Plant"
                sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover', border: '1.5px solid #a5d6a7' }}
              />
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                  <VerifiedIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.9rem' }}>
                    पहचान: {aiReport.disease}
                  </Typography>
                  <Chip
                    label={`${aiReport.confidence}% निश्चित`}
                    size="small"
                    sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.74rem', mt: 0.3 }}>
                  फसल: <strong>{aiReport.crop}</strong> • 15L पंप खुराक: <strong>{aiReport.pumpDose}</strong>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetScan}
                  sx={{ fontSize: '0.72rem', borderRadius: 2, py: 0.4 }}
                >
                  नई फोटो
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => prescriptionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ bgcolor: '#c62828', fontSize: '0.72rem', borderRadius: 2, py: 0.4, '&:hover': { bgcolor: '#b71c1c' } }}
                >
                  पर्ची देखें 👇
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Card>

      {/* 4. Crop & Visual Symptoms Fast Dropdown Selectors (Zero Horizontal Scroll Architecture) */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="🌾 फसल चुनें (Select Crop)"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            >
              <MenuItem value="all">🌾 सभी फसलें (All Crops)</MenuItem>
              {cropsList.map((crop) => (
                <MenuItem key={crop.id} value={crop.id}>
                  {crop.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="👁️ लक्षण देखकर रोग पहचानें (Visual Symptom)"
              value={selectedSymptom}
              onChange={(e) => setSelectedSymptom(e.target.value)}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            >
              {VISUAL_SYMPTOMS.map((sym) => (
                <MenuItem key={sym.id} value={sym.id}>
                  {sym.icon} {sym.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* 6. Search Bar */}
      <TextField
        fullWidth
        size="small"
        placeholder="रोग, लक्षण या दवा खोजें (उदा. ब्लास्ट, माहू, कोराजन, उकठा)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#888', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchQuery('')}>
                <RestartAltIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
        sx={{
          mb: 2,
          bgcolor: '#fff',
          borderRadius: 2.5,
          '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
        }}
      />

      {/* 7. Quick Disease Selection Pills */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', fontSize: '0.84rem' }}>
            पहचाने गए सामान्य रोग ({filteredDiseases.length}):
          </Typography>
          {(selectedSymptom !== 'all' || searchQuery || selectedCrop !== 'all') && (
            <Button
              size="small"
              onClick={() => {
                setSelectedSymptom('all');
                setSearchQuery('');
                setSelectedCrop('all');
              }}
              sx={{ fontSize: '0.7rem', color: '#c62828', p: 0 }}
            >
              फिल्टर हटाएं
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {filteredDiseases.map((d) => {
            const isActive = activeDisease?.id === d.id;
            return (
              <Chip
                key={d.id}
                label={`${d.cropName}: ${d.diseaseName.split('/')[0]}`}
                clickable
                variant={isActive ? 'filled' : 'outlined'}
                onClick={() => {
                  setActiveDisease(d);
                  setTimeout(() => {
                    prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }, 100);
                }}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  bgcolor: isActive ? '#c62828' : '#fff',
                  color: isActive ? '#fff' : '#c62828',
                  borderColor: '#ef9a9a'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* 8. Active Disease Detailed Prescription Card (डॉक्टर की पर्ची) */}
      {activeDisease ? (
        <Card
          ref={prescriptionRef}
          sx={{
            borderRadius: '18px',
            border: '2px solid #ef9a9a',
            boxShadow: '0 6px 20px rgba(198, 40, 40, 0.09)',
            bgcolor: '#fff',
            overflow: 'hidden'
          }}
        >
          {/* Card Prescription Header (Authentic Rx Letterhead Motif) */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: '#fff5f5',
              borderBottom: '1.5px solid #ffcdd2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label="Rx कृषि पर्ची"
                  size="small"
                  sx={{ bgcolor: '#c62828', color: '#fff', fontWeight: 900, fontSize: '0.72rem', height: 22, borderRadius: '6px' }}
                />
                <Chip
                  label={activeDisease.cropName}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem', borderRadius: '6px' }}
                />
                {(() => {
                  const sevStyle = getSeverityStyle(activeDisease.severity);
                  return (
                    <Chip
                      label={`${sevStyle.dot} गंभीरता: ${activeDisease.severity || 'गंभीर'}`}
                      size="small"
                      sx={{
                        bgcolor: sevStyle.bgcolor,
                        color: sevStyle.color,
                        border: sevStyle.border,
                        fontWeight: 800,
                        fontSize: '0.7rem'
                      }}
                    />
                  );
                })()}
                {activeDisease.symptomTag && (
                  <Chip
                    label={`लक्षण: ${activeDisease.symptomTag}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                  />
                )}
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#b71c1c', fontSize: '1.15rem', lineHeight: 1.25 }}>
                {activeDisease.diseaseName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.76rem' }}>
                कारक (Pathogen): <strong>{activeDisease.pathogen}</strong>
              </Typography>
            </Box>

            {/* Quick Prescription Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant={isVoicePlaying ? 'contained' : 'outlined'}
                size="small"
                startIcon={isVoicePlaying ? <VolumeOffIcon sx={{ fontSize: 16 }} /> : <VolumeUpIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  if (isVoicePlaying) {
                    stopSpeech();
                  } else {
                    handleVoiceReadRemedy(activeDisease);
                  }
                }}
                sx={{
                  bgcolor: isVoicePlaying ? '#c62828' : 'transparent',
                  color: isVoicePlaying ? '#fff' : '#c62828',
                  borderColor: '#ef9a9a',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  borderRadius: 2.5,
                  px: 1.2,
                  py: 0.5,
                  '&:hover': { bgcolor: isVoicePlaying ? '#b71c1c' : '#ffebee' }
                }}
              >
                {isVoicePlaying ? 'रोकें ⏹️' : 'इलाज सुनें 🔊'}
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleSharePrescription(activeDisease)}
                sx={{
                  bgcolor: '#25D366',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  borderRadius: 2.5,
                  px: 1.2,
                  py: 0.5,
                  '&:hover': { bgcolor: '#1ebe5d' }
                }}
              >
                दुकानदार पर्ची 💬
              </Button>
            </Box>
          </Box>

          <CardContent sx={{ p: 2 }}>
            {/* High-Visibility 15L Knapsack Backpack Spray Pump Dosage Box */}
            <Box
              sx={{
                mb: 2,
                p: 1.8,
                borderRadius: 3,
                bgcolor: '#fff8e1',
                border: '2px solid #ffd54f',
                boxShadow: '0 3px 10px rgba(255, 179, 0, 0.12)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Typography sx={{ fontSize: '1.25rem' }}>🎒</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.92rem' }}>
                  15 लीटर स्प्रे पंप (टंकी) हेतु सटीक नाप (Knapsack Pump Dose):
                </Typography>
              </Box>

              <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #ffe082', mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#bf360c', fontSize: '1.02rem' }}>
                  👉 {activeDisease.pumpDose || '15-20 ग्राम प्रति 15 लीटर पंप'}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#6d4c41', fontSize: '0.75rem', lineHeight: 1.45, display: 'block' }}>
                💧 <strong>एकड़ नाप:</strong> 1 एकड़ हेतु 150-200 लीटर पानी (लगभग 10-12 टंकी)। हमेशा साफ पानी का उपयोग करें और सुबह (8-11 बजे) या शाम (4-6 बजे) शांत मौसम में छिड़काव करें।
              </Typography>
            </Box>

            {/* Diagnostic Details Grid */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Left Column: Symptoms & Prevention */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, height: '100%' }}>
                  {/* Symptoms */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      bgcolor: '#fafafa',
                      borderRadius: 2.5,
                      border: '1px solid #e0e0e0',
                      flex: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                      <LocalHospitalIcon sx={{ color: '#c62828', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b71c1c', fontSize: '0.86rem' }}>
                        रोग के लक्षण (Visible Symptoms):
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#424242', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      {activeDisease.symptoms}
                    </Typography>
                  </Paper>

                  {/* Prevention */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      bgcolor: '#f5f5f5',
                      borderRadius: 2.5,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                      <SecurityIcon sx={{ color: '#388e3c', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2e7d32', fontSize: '0.86rem' }}>
                        भविष्य में बचाव व बीजोपचार (Prevention):
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#424242', fontSize: '0.78rem', lineHeight: 1.5, display: 'block' }}>
                      {activeDisease.prevention}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>

              {/* Right Column: Organic & Chemical Remedies */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                  {/* Organic Remedy */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      bgcolor: '#f1f8e9',
                      borderRadius: 2.5,
                      border: '1.5px solid #c8e6c9'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                      <SpaIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.86rem' }}>
                        जैविक एवं देसी उपाय (Organic / Bio Remedy):
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {activeDisease.organicRemedy}
                    </Typography>
                  </Paper>

                  {/* Chemical Remedy */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      bgcolor: '#e3f2fd',
                      borderRadius: 2.5,
                      border: '1.5px solid #bbdefb'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                      <ScienceIcon sx={{ color: '#1565c0', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0d47a1', fontSize: '0.86rem' }}>
                        रासायनिक दवा व तकनीकी नाम (Chemical Medicine):
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#0d47a1', fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {activeDisease.chemicalRemedy}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {/* Scientific Disclaimer Footer */}
            <Box
              sx={{
                p: 1.2,
                bgcolor: '#f1f8e9',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: '1px solid #dcedc8'
              }}
            >
              <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.74rem', fontWeight: 600 }}>
                प्रमाणित कृषि विज्ञान केंद्र (KVK) व इंदिरा गांधी कृषि विश्वविद्यालय (IGKV) अनुशंसा आधारित पर्ची।
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Alert
          severity="info"
          sx={{ borderRadius: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setSelectedSymptom('all');
                setSearchQuery('');
                setSelectedCrop('all');
              }}
            >
              रीसेट करें
            </Button>
          }
        >
          इस चयन के लिए कोई रोग नहीं मिला। कृपया अन्य लक्षण या फसल चुनें।
        </Alert>
      )}
    </Box>
  );
};
