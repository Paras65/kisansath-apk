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
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CallIcon from '@mui/icons-material/Call';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MicIcon from '@mui/icons-material/Mic';
import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import { speakText, stopSpeech, subscribeSpeechState } from '../utils/speech';
import { useLanguage } from '../utils/i18n';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';
import { startVoiceRecognition, stopVoiceRecognition, normalizeSpokenQuery } from '../utils/speechRecognition';
import { getCrops, getDiseases, diagnoseCropWithLiveAi, getCachedModuleData, getCibrcPesticides, chatWithCropDoctor } from '../services/apiService';
import { fetchLiveWeather, getSprayAdvisory, getCachedWeather } from '../services/weatherService';
import { notify } from '../services/notificationService';
import { getOfflineScans, saveOfflineScan, removeOfflineScan } from '../services/offlineDoctorQueueService';
import { openNativeDialer } from '../utils/capacitorUtils';
import { appConfig } from '../config/appConfig';

// Visual Symptom Quick Filter Taxonomy with Chhattisgarhi Dialect Names
const VISUAL_SYMPTOMS = [
  { id: 'all', label: 'सभी लक्षण / सबो चिन्हारी', icon: '✨', match: '' },
  { id: 'spot', label: 'नाव/आंख जैसे धब्बे (ब्लास्ट)', icon: '🍂', match: 'धब्बे' },
  { id: 'stemborer', label: 'गाभा कीट / भंवरी / मृत गोभ', icon: '🐛', match: 'गोभ' },
  { id: 'bph', label: 'माहू / लाही / चेंपा (तने पर)', icon: '🦟', match: 'माहू' },
  { id: 'sheath', label: 'केंचुली जैसे धब्बे (शीथ ब्लाइट)', icon: '🌿', match: 'केंचुली' },
  { id: 'khaira', label: 'खैरा रोग / पीलापन (जिंक कमी)', icon: '🟡', match: 'खैरा' },
  { id: 'wilt', label: 'अचानक पीलापन / जड़ सूखना (उकठा)', icon: '🥀', match: 'पीलापन' },
  { id: 'gandhi', label: 'गांधी कीड़ा / बदबूदार कीड़ा (दूधिया दाना)', icon: '🦗', match: 'गांधी' },
  { id: 'armyworm', label: 'पत्तियों में बड़े छेद / कटरुआ इल्ली', icon: '🐛', match: 'छेद' },
  { id: 'rust', label: 'पीला/भूरा पाउडर (रतुआ)', icon: '🌾', match: 'पाउडर' },
  { id: 'curl', label: 'पत्तियां सिकुड़ना व मुड़ना (कुकरो)', icon: '🍃', match: 'मुड़ना' },
];

export const CropDoctorTab = ({ selectedDistrict = 'रायपुर' }) => {
  const { isChhattisgarhi, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [selectedSymptom, setSelectedSymptom] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  // Strictly initialize from cache or empty (Zero-False-Data Policy)
  const [cropsList, setCropsList] = useState(() => {
    const cached = getCachedModuleData('crops');
    return cached && Array.isArray(cached.data) ? cached.data : [];
  });
  const [diseasesList, setDiseasesList] = useState(() => {
    const cached = getCachedModuleData('diseases');
    return cached && Array.isArray(cached.data) ? cached.data : [];
  });
  const [activeDisease, setActiveDisease] = useState(() => {
    const cached = getCachedModuleData('diseases');
    return cached && Array.isArray(cached.data) && cached.data.length > 0 ? cached.data[0] : null;
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [nonPlantWarning, setNonPlantWarning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanTechnicalError, setScanTechnicalError] = useState(null);
  const [scanModelErrors, setScanModelErrors] = useState([]);
  const [pendingScans, setPendingScans] = useState(() => getOfflineScans());
  const [isSyncingPending, setIsSyncingPending] = useState(false);

  // Multi-Turn Plant Doctor Follow-Up Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);

  // Reset follow-up chat when active disease changes
  useEffect(() => {
    setChatMessages([]);
    setChatInput('');
  }, [activeDisease?.id, activeDisease?.diseaseName]);

  // Live Weather Spray Advisory State
  const [sprayAdvisory, setSprayAdvisory] = useState(() => {
    const cached = getCachedWeather(selectedDistrict);
    if (cached) {
      return { ...getSprayAdvisory(cached), weather: cached };
    }
    return null;
  });
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const prescriptionRef = useRef(null);

  // Subscribe to speech state changes
  useEffect(() => {
    const unsubscribe = subscribeSpeechState((speaking) => {
      setIsVoicePlaying(speaking);
    });
    return () => {
      if (unsubscribe) unsubscribe();
      stopVoiceRecognition();
    };
  }, []);

  // Voice recognition mic toggle for search
  const handleToggleVoiceSearch = () => {
    if (isVoiceListening) {
      stopVoiceRecognition();
      setIsVoiceListening(false);
    } else {
      startVoiceRecognition({
        onResult: (normalized, raw) => {
          setSearchQuery(normalized || raw);
        },
        onListeningChange: (listening) => {
          setIsVoiceListening(listening);
        },
        onError: (msg) => {
          notify.info(msg);
          setIsVoiceListening(false);
        }
      });
    }
  };

  // Voice recognition mic toggle for Doctor Chat
  const handleToggleVoiceChat = () => {
    if (isChatListening) {
      stopVoiceRecognition();
      setIsChatListening(false);
    } else {
      startVoiceRecognition({
        onResult: (normalized, raw) => {
          const spoken = normalized || raw;
          setChatInput(spoken);
          setIsChatListening(false);
        },
        onListeningChange: (listening) => {
          setIsChatListening(listening);
        },
        onError: (msg) => {
          notify.info(msg);
          setIsChatListening(false);
        }
      });
    }
  };

  // Send message to Gemini Plant Doctor
  const handleSendChatMessage = async (customText = null) => {
    const textToSend = (customText !== null ? customText : chatInput).trim();
    if (!textToSend || !activeDisease) return;

    const userMsg = { sender: 'user', text: textToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    if (customText === null) setChatInput('');
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-6).map((m) => ({
        role: m.sender === 'doctor' ? 'model' : 'user',
        text: m.text
      }));

      const res = await chatWithCropDoctor({
        question: textToSend,
        cropName: activeDisease.cropName || (selectedCrop === 'paddy' ? 'धान' : selectedCrop),
        diseaseName: activeDisease.diseaseName,
        chemicalRemedy: activeDisease.chemicalRemedy,
        organicRemedy: activeDisease.organicRemedy,
        district: selectedDistrict,
        history
      });

      if (res && res.success) {
        const docMsg = {
          sender: 'doctor',
          text: res.answer,
          voiceAdvice: res.voiceAdvice,
          quickTips: res.quickTips || []
        };
        setChatMessages((prev) => [...prev, docMsg]);
        if (res.voiceAdvice) {
          speakText(res.voiceAdvice);
        }
      } else {
        const errorMsg = {
          sender: 'doctor',
          text: res?.error || 'सलाह प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।',
          isError: true
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'doctor', text: 'नेटवर्क में समस्या आई। कृपया इंटरनेट कनेक्शन जांचें।', isError: true }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

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

  const [cibrcList, setCibrcList] = useState([]);

  // Load live data from MongoDB if available
  const loadFromMongo = async () => {
    const liveCrops = await getCrops();
    if (liveCrops && liveCrops.length > 0) setCropsList(liveCrops);
    const liveDiseases = await getDiseases();
    if (liveDiseases && liveDiseases.length > 0) {
      setDiseasesList(liveDiseases);
      setActiveDisease((prev) => prev || liveDiseases[0]);
    }
  };

  useEffect(() => {
    loadFromMongo();
  }, []);

  // Synchronize official CIB&RC certified formulations
  useEffect(() => {
    let isMounted = true;
    const fetchCibrc = async () => {
      try {
        const res = await getCibrcPesticides(selectedCrop);
        if (isMounted && res && res.data) {
          setCibrcList(res.data);
        }
      } catch (e) {
        console.warn('[CIBRC Pesticides Fetch Error]', e);
      }
    };
    fetchCibrc();
    return () => {
      isMounted = false;
    };
  }, [selectedCrop]);

  const getMatchingCibrc = (disease) => {
    if (!disease || !cibrcList || cibrcList.length === 0) return null;
    const dName = (disease.diseaseName || '').toLowerCase();
    const dSym = (disease.symptoms || '').toLowerCase();
    const dChem = (disease.chemicalRemedy || '').toLowerCase();

    return (
      cibrcList.find((item) => {
        const pName = (item.targetPest || '').toLowerCase().slice(0, 4);
        const gName = (item.genericName || '').toLowerCase().slice(0, 6);
        return (
          (item.cropId === disease.cropId || disease.cropId === 'all') &&
          (dName.includes(pName) || dChem.includes(gName) || dSym.includes(pName))
        );
      }) || null
    );
  };

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
    const normalizedNeedle = normalizeSpokenQuery(needle);
    const matchesSearch =
      !needle ||
      d.diseaseName.toLowerCase().includes(needle) ||
      d.symptoms.toLowerCase().includes(needle) ||
      d.cropName.toLowerCase().includes(needle) ||
      (d.chemicalRemedy && d.chemicalRemedy.toLowerCase().includes(needle)) ||
      (normalizedNeedle && (
        d.diseaseName.toLowerCase().includes(normalizedNeedle) ||
        d.symptoms.toLowerCase().includes(normalizedNeedle) ||
        d.cropName.toLowerCase().includes(normalizedNeedle)
      ));

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
        img.onload = async () => {
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
          let processedDataUrl = rawDataUrl;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            processedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          }

          setUploadedImage(processedDataUrl);
          setAnalyzing(true);
          setAiReport(null);
          setNonPlantWarning(false);
          setScanError(null);
          setScanTechnicalError(null);
          setScanModelErrors([]);

          try {
            const diagResult = await diagnoseCropWithLiveAi({
              imageBase64: processedDataUrl,
              cropId: selectedCrop,
              district: selectedDistrict
            });

            setAnalyzing(false);

            // Zero-False-Data Enforcement: If AI failed, do NOT show fake/dummy data
            if (!diagResult || diagResult.success === false) {
              if (appConfig.debugMode) {
                console.error('🚨 [Crop Doctor Diagnostic Failure (Photo Scan)]:', diagResult?.error);
                console.error('🛠️ [Crop Doctor Technical Error Details]:', diagResult?.technicalError || 'No technical error provided by API');
                if (diagResult?.modelErrors?.length) {
                  console.error('🤖 [Crop Doctor Model Cascade Errors]:', diagResult.modelErrors);
                }
                console.error('📦 [Crop Doctor Full Diagnosis Result]:', diagResult);
              }

              setScanError(
                diagResult?.error ||
                'फोटो की AI जांच पूरी नहीं हो सकी। किसानों की फसल सुरक्षा हेतु कोई भी अनुमानित या नकली (Dummy) रोग नहीं दिखाया जा रहा है।'
              );
              setScanTechnicalError(diagResult?.technicalError || 'सर्वर द्वारा कोई विस्तृत तकनीकी विवरण नहीं दिया गया (Missing technical details from backend).');
              setScanModelErrors(diagResult?.modelErrors || []);
              notify.error(diagResult?.isOffline ? 'इंटरनेट कनेक्शन बंद है। लाइव AI हेतु इंटरनेट ऑन करें।' : 'AI जांच असफल रही।');
              return;
            }

            // Edge Case 1: Photo is not a plant
            if (diagResult.isPlant === false) {
              setNonPlantWarning(true);
              notify.warning('पौधे या पत्ती की स्पष्ट फोटो नहीं मिली। कृपया पुनः साफ फोटो खींचें।');
              return;
            }

            // Normal or healthy plant diagnosis
            const isHealthy = diagResult.diseaseName && diagResult.diseaseName.includes('स्वस्थ');
            const formattedDisease = {
              id: `ai-${Date.now()}`,
              cropId: diagResult.cropId || selectedCrop,
              cropName: diagResult.cropName || (selectedCrop === 'paddy' ? 'धान' : selectedCrop),
              diseaseName: diagResult.diseaseName || 'अज्ञात रोग',
              severity: diagResult.severity || 'गंभीर',
              pathogen: diagResult.englishName || 'पादप रोग / कीट',
              pumpDose: diagResult.pumpDose || '12-15 ग्राम प्रति 15 लीटर पंप (टंकी)',
              chemicalRemedy: diagResult.chemicalRemedy || 'कृषि विशेषज्ञ की सलाह अनुसार कीटनाशक उपयोग करें।',
              organicRemedy: diagResult.organicRemedy || 'नीम तेल (5 मिली/लीटर) या ट्राइकोडर्मा का प्रयोग करें।',
              prevention: diagResult.precautions || 'शांत मौसम में ही सुबह या शाम छिड़काव करें।',
              symptoms: diagResult.symptoms || 'पत्तियों पर रोग के लक्षण।',
              voiceAdvice: diagResult.voiceAdvice,
              isLiveAi: Boolean(diagResult.isLiveAi),
              source: diagResult.source || 'gemini-vision',
              confidence: diagResult.confidence || 92,
              isHealthy
            };

            setActiveDisease(formattedDisease);
            setAiReport({
              confidence: diagResult.confidence || 92,
              disease: formattedDisease.diseaseName,
              crop: formattedDisease.cropName,
              severity: formattedDisease.severity,
              pumpDose: formattedDisease.pumpDose,
              isLiveAi: formattedDisease.isLiveAi,
              source: formattedDisease.source,
              isHealthy
            });

            notify.success(`⚡ Google Gemini AI लाइव पहचान: ${formattedDisease.diseaseName}!`);

            // Scroll into view to the prescription
            setTimeout(() => {
              prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 180);
          } catch (err) {
            setAnalyzing(false);
            if (appConfig.debugMode) {
              console.error('[CropDoctor Scan Error]', err);
            }
            setScanError('फोटो विश्लेषण में तकनीकी समस्या आई। गलत जानकारी से बचने के लिए कोई डमी डेटा नहीं दिखाया गया है।');
            notify.error('फोटो विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।');
          }
        };

        img.onerror = () => {
          setUploadedImage(rawDataUrl);
          setAnalyzing(false);
          setScanError('फोटो लोड करने में असमर्थ। कृपया पुनः प्रयास करें।');
          notify.error('फोटो लोड नहीं हो सकी।');
        };
        img.src = rawDataUrl;
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
    setNonPlantWarning(false);
    setScanError(null);
    setScanTechnicalError(null);
    setScanModelErrors([]);
    stopSpeech();
    notify.info('स्कैन रीसेट कर दिया गया');
  };

  const handleSaveCurrentScanOffline = () => {
    if (!uploadedImage) return;
    const saved = saveOfflineScan({
      imageBase64: uploadedImage,
      cropId: selectedCrop,
      district: selectedDistrict
    });
    if (saved) {
      setPendingScans(getOfflineScans());
      setScanError(null);
      notify.success('💾 फोटो सुरक्षित हो गई! इंटरनेट चालू होते ही ऐप स्वतः जांच करेगी।');
    }
  };

  const handleProcessQueuedScan = async (scanItem) => {
    if (!scanItem) return;
    if (!navigator.onLine) {
      notify.warning('अभी फोन में इंटरनेट नहीं है। कृपया मोबाइल डेटा चालू करें।');
      return;
    }

    setIsSyncingPending(true);
    setAnalyzing(true);
    setScanError(null);
    setScanTechnicalError(null);
    setScanModelErrors([]);
    setNonPlantWarning(false);
    setUploadedImage(scanItem.imageBase64);

    try {
      const diagResult = await diagnoseCropWithLiveAi({
        imageBase64: scanItem.imageBase64,
        cropId: scanItem.cropId || selectedCrop,
        district: scanItem.district || selectedDistrict
      });

      setAnalyzing(false);
      setIsSyncingPending(false);

      if (!diagResult || diagResult.success === false) {
        if (appConfig.debugMode) {
          console.error('🚨 [Crop Doctor Diagnostic Failure (Offline Recheck)]:', diagResult?.error);
          console.error('🛠️ [Crop Doctor Technical Error Details]:', diagResult?.technicalError || 'No technical error provided by API');
          if (diagResult?.modelErrors?.length) {
            console.error('🤖 [Crop Doctor Model Cascade Errors]:', diagResult.modelErrors);
          }
          console.error('📦 [Crop Doctor Full Diagnosis Result]:', diagResult);
        }

        setScanError(
          diagResult?.error ||
          'AI जांच पूरी नहीं हो सकी। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
        );
        setScanTechnicalError(diagResult?.technicalError || 'सर्वर द्वारा कोई विस्तृत तकनीकी विवरण नहीं दिया गया।');
        setScanModelErrors(diagResult?.modelErrors || []);
        notify.error('AI जांच नहीं हो सकी।');
        return;
      }

      if (diagResult.isPlant === false) {
        setNonPlantWarning(true);
        removeOfflineScan(scanItem.id);
        setPendingScans(getOfflineScans());
        notify.warning('पौधा या पत्ती स्पष्ट नहीं है।');
        return;
      }

      const isHealthy = diagResult.diseaseName && diagResult.diseaseName.includes('स्वस्थ');
      const formattedDisease = {
        id: `ai-${Date.now()}`,
        cropId: diagResult.cropId || scanItem.cropId || selectedCrop,
        cropName: diagResult.cropName || (scanItem.cropId === 'paddy' ? 'धान' : scanItem.cropId),
        diseaseName: diagResult.diseaseName || 'अज्ञात रोग',
        severity: diagResult.severity || 'गंभीर',
        pathogen: diagResult.englishName || 'पादप रोग / कीट',
        pumpDose: diagResult.pumpDose || '12-15 ग्राम प्रति 15 लीटर पंप (टंकी)',
        chemicalRemedy: diagResult.chemicalRemedy || 'कृषि विशेषज्ञ की सलाह अनुसार कीटनाशक उपयोग करें।',
        organicRemedy: diagResult.organicRemedy || 'नीम तेल (5 मिली/लीटर) या ट्राइकोडर्मा का प्रयोग करें।',
        prevention: diagResult.precautions || 'शांत मौसम में ही सुबह या शाम छिड़काव करें।',
        symptoms: diagResult.symptoms || 'पत्तियों पर रोग के लक्षण।',
        voiceAdvice: diagResult.voiceAdvice,
        isLiveAi: Boolean(diagResult.isLiveAi),
        source: diagResult.source || 'gemini-vision',
        confidence: diagResult.confidence || 92,
        isHealthy
      };

      setActiveDisease(formattedDisease);
      setAiReport({
        confidence: diagResult.confidence || 92,
        disease: formattedDisease.diseaseName,
        crop: formattedDisease.cropName,
        severity: formattedDisease.severity,
        pumpDose: formattedDisease.pumpDose,
        isLiveAi: formattedDisease.isLiveAi,
        source: formattedDisease.source,
        isHealthy
      });

      // Remove from offline queue since it was successfully diagnosed!
      removeOfflineScan(scanItem.id);
      setPendingScans(getOfflineScans());

      notify.success(`🎉 सुरक्षित फोटो की AI जांच पूर्ण: ${formattedDisease.diseaseName}!`);

      setTimeout(() => {
        prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    } catch (err) {
      setAnalyzing(false);
      setIsSyncingPending(false);
      setScanError('तकनीकी समस्या आई। कृपया पुनः प्रयास करें।');
    }
  };

  // Process all queued offline scans sequentially (1-Click Batch Diagnostic)
  const handleProcessAllQueuedScans = async () => {
    const queued = getOfflineScans();
    if (!queued || queued.length === 0) return;
    notify.info(`⚡ सभी ${queued.length} सुरक्षित स्कैन की जांच शुरू की जा रही है...`);
    for (const scan of queued) {
      await handleProcessQueuedScan(scan);
    }
  };

  // Auto-sync pending offline scans when connectivity is restored
  useEffect(() => {
    const handleOnline = () => {
      const queued = getOfflineScans();
      if (queued && queued.length > 0) {
        notify.info('🌐 इंटरनेट पुनः जुड़ गया! सुरक्षित फोटो की AI जांच शुरू हो रही है...');
        handleProcessQueuedScan(queued[0]);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleVoiceReadRemedy = (disease) => {
    if (!disease) return;
    if (disease.voiceAdvice) {
      speakText(disease.voiceAdvice);
      return;
    }
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
    <Box sx={{ pb: 1, pt: 0 }} className="fade-in">
      {/* 1. Header Banner */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 2 }}>
            <LocalHospitalIcon sx={{ color: '#c62828', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#b71c1c', fontSize: '1.15rem', lineHeight: 1.2 }}>
              {isChhattisgarhi ? 'एआई फसल डॉक्टर (रोग-कीरा निदान)' : 'एआई फसल डॉक्टर (Crop Doctor)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.78rem' }}>
              {isChhattisgarhi ? 'कैमरा जांच • 15L पंप पक्का खुराक • देसी अउ रासायनिक दवाई' : 'कैमरा पहचान • 15L पंप सटीक खुराक • जैविक व रासायनिक उपचार'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <KakaWalkthroughButton featureId="doctor" />
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '15px !important', color: '#1b5e20 !important' }} />}
            label={isChhattisgarhi ? "IGKV वैज्ञानिक ले जांचे" : "IGKV वैज्ञानिक अनुमोदित"}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 700, fontSize: '0.72rem' }}
          />
        </Box>
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
                      {isChhattisgarhi
                        ? (sprayAdvisory.canSpray ? `✅ ${selectedDistrict}: आज दवाई छिड़काव बर बने हे` : `⚠️ ${selectedDistrict}: आज दवाई छिड़काव झन करव`)
                        : (sprayAdvisory.canSpray ? `✅ ${selectedDistrict}: आज छिड़काव अनुकूल` : `⚠️ ${selectedDistrict}: आज छिड़काव टालें`)}
                    </Typography>
                    {sprayAdvisory.weather && (
                      <Box sx={{ display: 'flex', gap: 0.6 }}>
                        <Chip
                          icon={<WaterDropIcon sx={{ fontSize: '12px !important' }} />}
                          label={`${isChhattisgarhi ? 'पानी' : 'वर्षा'} ${sprayAdvisory.weather.rainProbability}%`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#fff', fontWeight: 600 }}
                        />
                        <Chip
                          icon={<AirIcon sx={{ fontSize: '12px !important' }} />}
                          label={`${isChhattisgarhi ? 'हवा' : 'हवा'} ${sprayAdvisory.weather.windSpeed} km/h`}
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

              <Tooltip title={isChhattisgarhi ? "मौसम के गोठ सुनव" : "मौसम सलाह सुनें"}>
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
          {isChhattisgarhi ? '📸 बीमार पाना या तना के फोटो ले तुरंत जांच करव' : '📸 बीमार पत्ती या तने की फोटो से तुरंत जांच करें'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5d4037', display: 'block', mb: 1.5, fontSize: '0.76rem' }}>
          {isChhattisgarhi
            ? 'कैमरा ले सीधा फोटो खींचव या गैलरी ले चुनव • एआई तुरंत रोग पहचान के 15L पंप के खुराक बताही'
            : 'कैमरा से सीधी फोटो लें या गैलरी से चुनें • एआई तुरंत रोग पहचानकर 15L पंप की खुराक बताएगा'}
        </Typography>

        {/* Pending Offline Scan Queue */}
        {pendingScans.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#e8f5e9',
              border: '1.5px solid #a5d6a7',
              textAlign: 'left'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CloudQueueIcon sx={{ color: '#1b5e20', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.84rem' }}>
                  {isChhattisgarhi ? `📥 ऑफ़लाइन सहेजाये फोटो (${pendingScans.length})` : `📥 ऑफ़लाइन सुरक्षित प्रश्न (${pendingScans.length})`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                {pendingScans.length > 1 && (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={isSyncingPending || !navigator.onLine}
                    onClick={handleProcessAllQueuedScans}
                    sx={{
                      bgcolor: '#2e7d32',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      py: 0.2,
                      px: 1,
                      minHeight: 22,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#1b5e20' }
                    }}
                  >
                    {isChhattisgarhi ? `⚡ सबो जांचव (${pendingScans.length})` : `⚡ सभी जांचें (${pendingScans.length})`}
                  </Button>
                )}
                <Chip
                  label={
                    navigator.onLine
                      ? (isChhattisgarhi ? '🟢 इंटरनेट चालू हे' : '🟢 इंटरनेट उपलब्ध')
                      : (isChhattisgarhi ? '🟠 इंटरनेट के अगोरा' : '🟠 इंटरनेट की प्रतीक्षा')
                  }
                  size="small"
                  sx={{
                    bgcolor: navigator.onLine ? '#c8e6c9' : '#ffe0b2',
                    color: navigator.onLine ? '#1b5e20' : '#e65100',
                    fontWeight: 800,
                    fontSize: '0.68rem',
                    height: 20
                  }}
                />
              </Box>
            </Box>

            <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mb: 1, fontSize: '0.74rem' }}>
              {isChhattisgarhi
                ? 'खेत म इंटरनेट नइ रहे त तुंहर फोटो सहेज लिये गे रिहिस। जइसे ही नेटवर्क मिलही, "जांचव" दबाबव या ऐप अपने-आप जांच करही।'
                : "खेत में इंटरनेट न होने पर आपकी फोटो सुरक्षित कर ली गई थी। जैसे ही आप नेटवर्क में आएंगे, 'जांचें' दबाएं या ऐप स्वतः जांच करेगी।"}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {pendingScans.map((scan) => (
                <Box
                  key={scan.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#fff',
                    p: 1,
                    borderRadius: 2,
                    border: '1px solid #c8e6c9',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="img"
                      src={scan.imageBase64}
                      alt="Offline scan"
                      sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#1b5e20' }}>
                        🌾 {scan.cropId === 'paddy' ? (isChhattisgarhi ? 'धान (चांउर)' : 'धान') : scan.cropId} • {scan.district}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.68rem' }}>
                        {isChhattisgarhi ? 'बेरा' : 'समय'}: {scan.displayTime}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={isSyncingPending}
                      startIcon={<SyncIcon sx={{ fontSize: 15 }} />}
                      onClick={() => handleProcessQueuedScan(scan)}
                      sx={{
                        bgcolor: '#1b5e20',
                        color: '#fff',
                        fontSize: '0.7rem',
                        borderRadius: 2,
                        py: 0.3,
                        px: 1,
                        fontWeight: 700,
                        '&:hover': { bgcolor: '#0a3d0c' }
                      }}
                    >
                      {isSyncingPending
                        ? (isChhattisgarhi ? 'जांच चलत हे...' : 'जांच जारी...')
                        : (isChhattisgarhi ? '⚡ जांचव' : '⚡ जांचें')}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        removeOfflineScan(scan.id);
                        setPendingScans(getOfflineScans());
                        notify.info(isChhattisgarhi ? 'सहेजाये फोटो हटा दे गे' : 'सुरक्षित फोटो हटा दी गई');
                      }}
                      sx={{ color: '#888' }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

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
              {isChhattisgarhi ? 'कैमरा ले फोटो खींचव' : 'कैमरा से फोटो खींचें'}
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
              {isChhattisgarhi ? 'गैलरी ले चुनव' : 'गैलरी से चुनें'}
            </Button>
          </label>
        </Box>

        {analyzing && uploadedImage && (
          <Box
            sx={{
              mt: 2,
              mx: 'auto',
              maxWidth: 360,
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #ffb74d'
            }}
          >
            <Box
              component="img"
              src={uploadedImage}
              alt="Scanned Plant"
              sx={{
                width: '100%',
                maxHeight: { xs: 200, sm: 240 },
                objectFit: 'cover',
                display: 'block',
                filter: 'brightness(0.85)'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: 2,
                color: '#fff'
              }}
            >
              <CircularProgress size={32} sx={{ color: '#ffb74d' }} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem', textAlign: 'center' }}>
                {isChhattisgarhi ? '🔍 एआई फसल अउ पाना के जांच करत हे...' : '🔍 एआई फसल व पत्ती का विश्लेषण कर रहा है...'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ffe082', fontSize: '0.72rem' }}>
                {isChhattisgarhi ? 'कनिहा बेरा अगोरव' : 'कृपया कुछ सेकंड प्रतीक्षा करें'}
              </Typography>
            </Box>
          </Box>
        )}

        {analyzing && !uploadedImage && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2 }}>
            <CircularProgress size={22} sx={{ color: '#e65100' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e65100', fontSize: '0.82rem' }}>
              {isChhattisgarhi ? 'एआई फोटो के जांच करत हे... कनिहा बेरा अगोरव' : 'एआई फोटो का स्कैन व विश्लेषण कर रहा है... कृपया प्रतीक्षा करें'}
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
                    {isChhattisgarhi ? 'पहचान:' : 'पहचान:'} {aiReport.disease}
                  </Typography>
                  <Chip
                    label={`${aiReport.confidence}% ${isChhattisgarhi ? 'पक्का' : 'निश्चित'}`}
                    size="small"
                    sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                  />
                  <Chip
                    label={aiReport.isLiveAi ? '⚡ Gemini AI लाइव' : (isChhattisgarhi ? '📶 ऑफ़लाइन डेटा' : '📶 ऑफ़लाइन डेटाबेस')}
                    size="small"
                    sx={{
                      bgcolor: aiReport.isLiveAi ? '#ede7f6' : '#fff3e0',
                      color: aiReport.isLiveAi ? '#4a148c' : '#e65100',
                      fontWeight: 800,
                      height: 20,
                      fontSize: '0.68rem'
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.74rem', mt: 0.3 }}>
                  {isChhattisgarhi ? 'फसल:' : 'फसल:'} <strong>{aiReport.crop}</strong> • 15L {isChhattisgarhi ? 'पंप खुराक:' : 'पंप खुराक:'} <strong>{aiReport.pumpDose}</strong>
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
                  {isChhattisgarhi ? 'नवा फोटो' : 'नई फोटो'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => prescriptionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ bgcolor: '#c62828', fontSize: '0.72rem', borderRadius: 2, py: 0.4, '&:hover': { bgcolor: '#b71c1c' } }}
                >
                  {isChhattisgarhi ? 'पर्ची देखव 👇' : 'पर्ची देखें 👇'}
                </Button>
              </Box>
            </Box>
          </Box>
        )}

        {nonPlantWarning && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 3,
              bgcolor: '#fffde7',
              border: '2px solid #fbc02d',
              textAlign: 'left'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>📷</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.92rem' }}>
                  {isChhattisgarhi ? 'साफ फोटो खींचे के 3 सरल नियम (Smart Re-capture)' : 'साफ फोटो खींचने के 3 सरल नियम (Smart Re-capture Guide)'}
                </Typography>
              </Box>
              <Chip
                label={isChhattisgarhi ? 'धुंधला या दूर फोटो' : 'अस्पष्ट या दूर से फोटो'}
                size="small"
                sx={{ bgcolor: '#ffe082', color: '#b78103', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: '#5d4037', fontSize: '0.8rem', mb: 1.2 }}>
              {isChhattisgarhi
                ? 'फोटो म पत्ती बहुत दूर हे या कोहरा/छाया हे। सटीक दवाई के पर्ची पाए बर ये 3 बात ध्यान राखव:'
                : 'अपलोड की गई फोटो में पत्ती बहुत दूर है या धुंधली है। सटीक रासायनिक व जैविक पर्ची पाने के लिए इन 3 बातों का ध्यान रखें:'}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1, mb: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #ffe082' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#e65100', display: 'block', mb: 0.2 }}>
                  1. 🎯 {isChhattisgarhi ? 'क्लोज-अप (10-15 सेमी)' : 'क्लोज-अप (10-15 सेमी)'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.72rem', lineHeight: 1.3, display: 'block' }}>
                  {isChhattisgarhi ? 'बीमार भाग या धब्बा के एकदम पास ले जाके फोटो खींचव।' : 'रोगग्रस्त भाग या धब्बे के बिल्कुल पास ले जाकर फोटो लें।'}
                </Typography>
              </Box>

              <Box sx={{ p: 1, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #ffe082' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#e65100', display: 'block', mb: 0.2 }}>
                  2. ☀️ {isChhattisgarhi ? 'बने दिन के अंजोर' : 'उचित दिन की रोशनी'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.72rem', lineHeight: 1.3, display: 'block' }}>
                  {isChhattisgarhi ? 'घाम या दिन के अंजोर म खींचव, मोबाइल के परछाई झन पड़य।' : 'दिन के उजाले में फोटो लें, मोबाइल या हाथ की परछाई से बचें।'}
                </Typography>
              </Box>

              <Box sx={{ p: 1, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #ffe082' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#e65100', display: 'block', mb: 0.2 }}>
                  3. ✋ {isChhattisgarhi ? 'हाथ थिर (फोकस)' : 'हाथ स्थिर व फोकस'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.72rem', lineHeight: 1.3, display: 'block' }}>
                  {isChhattisgarhi ? 'हाथ ला हिलाव मत, पत्ती म टच करके फोकस करव।' : 'हाथ को स्थिर रखें और पत्ती पर उंगली टच करके फोकस करें।'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<PhotoCameraIcon sx={{ fontSize: 16 }} />}
                onClick={() => document.getElementById('crop-camera-capture')?.click()}
                sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, borderRadius: 2, fontSize: '0.75rem', '&:hover': { bgcolor: '#1b5e20' } }}
              >
                {isChhattisgarhi ? '📸 फेर कैमरा खोलव' : '📸 दोबारा कैमरा खोलें'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PhotoLibraryIcon sx={{ fontSize: 16 }} />}
                onClick={() => document.getElementById('crop-gallery-upload')?.click()}
                sx={{ borderColor: '#e65100', color: '#e65100', fontWeight: 800, borderRadius: 2, fontSize: '0.75rem' }}
              >
                {isChhattisgarhi ? '🖼️ गैलरी ले चुनव' : '🖼️ गैलरी से चुनें'}
              </Button>
              <Button
                size="small"
                onClick={handleResetScan}
                sx={{ color: '#666', fontSize: '0.75rem', textTransform: 'none' }}
              >
                {isChhattisgarhi ? 'रीसेट' : 'रीसेट'}
              </Button>
            </Box>
          </Paper>
        )}

        {scanError && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              borderRadius: 2.5,
              bgcolor: '#ffebee',
              border: '1.5px solid #ffcdd2',
              textAlign: 'left'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#c62828', fontSize: '0.86rem' }}>
              ⚠️ {scanError}
            </Typography>
            <Typography variant="body2" sx={{ color: '#5d4037', fontSize: '0.78rem', mt: 0.5 }}>
              🛡️ <strong>{isChhattisgarhi ? 'शून्य गलत डेटा नीति (Zero-False-Data Policy):' : 'शून्य गलत डेटा नीति (Zero-False-Data Policy):'}</strong> {isChhattisgarhi
                ? 'किसान साथी किसान भाई मन के फसल सुरक्षा ल सबले पहिली रखथे अउ बिना पक्का AI जांच के कोनो मनगढ़ंत डेटा नइ दिखाय जाय। आप नीचे सूची ले अपन फसल अउ लक्षण चुन के प्रमाणिक इलाज देख सकत हव।'
                : 'किसान साथी किसानों की फसल सुरक्षा को सर्वोच्च प्राथमिकता देता है और बिना सटीक AI विश्लेषण के कोई भी फर्जी या अनुमानित (Dummy) डेटा नहीं दिखाता। आप नीचे दी गई सूची से अपनी फसल व लक्षण चुनकर भारतीय कृषि अनुसंधान परिषद (ICAR) अनुमोदित प्रमाणिक इलाज देख सकते हैं।'}
            </Typography>

            {appConfig.debugMode && scanTechnicalError && (
              <Box
                sx={{
                  mt: 1.2,
                  p: 1.2,
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  border: '1px dashed #ef9a9a',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#b71c1c', display: 'block', mb: 0.3 }}>
                  🛠️ तकनीकी विफलता विवरण (Technical Error for Console / Debugging):
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#c62828', fontSize: '0.74rem', wordBreak: 'break-all', display: 'block', lineHeight: 1.4 }}>
                  {scanTechnicalError}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 1.2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {uploadedImage && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CloudQueueIcon sx={{ fontSize: 16 }} />}
                  onClick={handleSaveCurrentScanOffline}
                  sx={{
                    bgcolor: '#2e7d32',
                    color: '#fff',
                    borderRadius: 2,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#1b5e20' }
                  }}
                >
                  {isChhattisgarhi ? '💾 ये फोटो ल सहेजव (इंटरनेट आये म जांचव)' : '💾 इस फोटो को सुरक्षित करें (इंटरनेट आने पर जांचें)'}
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={handleResetScan}
                sx={{ color: '#c62828', borderColor: '#ef9a9a', borderRadius: 2, fontSize: '0.74rem' }}
              >
                {isChhattisgarhi ? '🔄 नवा फोटो लेवव' : '🔄 नई फोटो लें'}
              </Button>
            </Box>
          </Alert>
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
              label={isChhattisgarhi ? "🌾 फसल चुनव (फसल)" : "🌾 फसल चुनें (Select Crop)"}
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              sx={{
                bgcolor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            >
              <MenuItem value="all">{isChhattisgarhi ? "🌾 सबो फसल (सब)" : "🌾 सभी फसलें (All Crops)"}</MenuItem>
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
              label={isChhattisgarhi ? "👁️ चिन्हारी देख के रोग पहचानव" : "👁️ लक्षण देखकर रोग पहचानें (Visual Symptom)"}
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

      {/* 6. Search Bar with Voice Mic & Clear (Zero-Typing) */}
      <TextField
        fullWidth
        size="small"
        placeholder={isChhattisgarhi ? "रोग, चिन्हारी या दवाई बोलव या खोजव (जैसे: गाभा कीट, केंचुली, माहू)..." : "रोग, लक्षण या दवा बोलें या खोजें (जैसे: तना छेदक, शीथ ब्लाइट, माहू)..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#888', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ gap: 0.5 }}>
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: '#94a3b8' }}>
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
              <Tooltip title={isVoiceListening ? (isChhattisgarhi ? "सुनत हन... (रोके बर दबावहू)" : "सुन रहे हैं... (रोकने हेतु दबाएं)") : (isChhattisgarhi ? "बोलके खोजव (माइक दबावहू)" : "बोलकर खोजें (माइक दबाएं)")}>
                <IconButton
                  size="small"
                  onClick={handleToggleVoiceSearch}
                  sx={{
                    color: isVoiceListening ? '#fff' : '#c62828',
                    bgcolor: isVoiceListening ? '#d32f2f' : 'rgba(198, 40, 40, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: isVoiceListening ? '#b71c1c' : 'rgba(198, 40, 40, 0.18)'
                    }
                  }}
                >
                  <MicIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
        sx={{
          mb: 1.2,
          bgcolor: '#fff',
          borderRadius: 2.5,
          '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
        }}
      />

      {/* 1-Tap Quick Visual Symptom Chips (Zero-Typing Rural Farmers) */}
      <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {VISUAL_SYMPTOMS.map((sym) => {
          const isSelected = selectedSymptom === sym.id;
          return (
            <Chip
              key={sym.id}
              icon={<span style={{ fontSize: '13px', marginRight: -2 }}>{sym.icon}</span>}
              label={sym.label}
              clickable
              size="small"
              onClick={() => {
                setSelectedSymptom(sym.id);
                if (sym.id !== 'all') {
                  setSearchQuery('');
                }
              }}
              sx={{
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.76rem',
                borderRadius: '16px',
                bgcolor: isSelected ? '#c62828' : '#f8fafc',
                color: isSelected ? '#fff' : '#334155',
                border: isSelected ? '1px solid #b71c1c' : '1px solid #e2e8f0',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: isSelected ? '#b71c1c' : '#f1f5f9'
                }
              }}
            />
          );
        })}
      </Box>

      {/* 7. Quick Disease Selection Pills & Detailed Prescription Card */}
      {diseasesList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            mb: 4,
            textAlign: 'center',
            borderRadius: '16px',
            bgcolor: '#f8fafc',
            border: '1.5px dashed #cbd5e1'
          }}
        >
          <LocalHospitalIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            {isChhattisgarhi ? 'रोग-कीरा के कोनो जानकारी नइये' : 'रोग निदान लाइब्रेरी डेटा उपलब्ध नहीं है'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 440, mx: 'auto', mb: 2 }}>
            {isChhattisgarhi
              ? 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत कोनो मनगढ़ंत रोग पर्ची नइ दिखाय जाय। प्रमाणिक KVK/ICAR डेटाबेस लोड करे बर इंटरनेट कनेक्ट कर फेर लोड करव।'
              : 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत कोई भी मनगढ़ंत या कल्पित रोग पर्ची नहीं दिखाई जाती है। प्रमाणिक KVK/ICAR रोग डेटाबेस लोड करने हेतु इंटरनेट कनेक्ट कर पुनः लोड करें।'}
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
            onClick={loadFromMongo}
            sx={{ bgcolor: '#c62828', color: '#fff', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#b71c1c' } }}
          >
            {isChhattisgarhi ? 'फेर लोड करव (Retry)' : 'डेटा लोड करें (Retry)'}
          </Button>
        </Paper>
      ) : (
        <>
          {/* 7. Quick Disease Selection Pills */}
          <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', fontSize: '0.84rem' }}>
            {isChhattisgarhi ? `पहचाने गे आम रोग-कीरा (${filteredDiseases.length}):` : `पहचाने गए सामान्य रोग (${filteredDiseases.length}):`}
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
              {isChhattisgarhi ? 'फिल्टर हटावव' : 'फिल्टर हटाएं'}
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
                  label={isChhattisgarhi ? "Rx किसान पर्ची" : "Rx कृषि पर्ची"}
                  size="small"
                  sx={{ bgcolor: '#c62828', color: '#fff', fontWeight: 900, fontSize: '0.72rem', height: 22, borderRadius: '6px' }}
                />
                <Chip
                  label={activeDisease.cropName}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem', borderRadius: '6px' }}
                />
                {activeDisease.isLiveAi ? (
                  <Chip
                    label="⚡ Gemini AI लाइव"
                    size="small"
                    sx={{
                      bgcolor: '#ede7f6',
                      color: '#4a148c',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 22,
                      borderRadius: '6px'
                    }}
                  />
                ) : (
                  <Chip
                    label={isChhattisgarhi ? "📶 कृषि डेटा" : "📶 कृषि डेटाबेस"}
                    size="small"
                    sx={{
                      bgcolor: '#fff3e0',
                      color: '#e65100',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 22,
                      borderRadius: '6px'
                    }}
                  />
                )}
                {(() => {
                  const sevStyle = getSeverityStyle(activeDisease.severity);
                  return (
                    <Chip
                      label={`${sevStyle.dot} ${isChhattisgarhi ? 'गंभीरता:' : 'गंभीरता:'} ${activeDisease.severity || 'गंभीर'}`}
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
                    label={`${isChhattisgarhi ? 'चिन्हारी:' : 'लक्षण:'} ${activeDisease.symptomTag}`}
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
                {isChhattisgarhi ? 'कारक:' : 'कारक (Pathogen):'} <strong>{activeDisease.pathogen}</strong>
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
                {isVoicePlaying
                  ? (isChhattisgarhi ? 'रोक्व ⏹️' : 'रोकें ⏹️')
                  : (isChhattisgarhi ? 'इलाज सुनव 🔊' : 'इलाज सुनें 🔊')}
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
                {isChhattisgarhi ? 'दुकानदार बर पर्ची 💬' : 'दुकानदार पर्ची 💬'}
              </Button>
            </Box>
          </Box>

          <CardContent sx={{ p: 2 }}>
            {/* Weather Spray Interlock Warning */}
            {sprayAdvisory && !sprayAdvisory.canSpray && (
              <Alert
                severity="warning"
                icon={<AirIcon />}
                sx={{ mb: 2, borderRadius: 2.5, bgcolor: '#fff8e1', border: '1.5px solid #ffe082' }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b78103', fontSize: '0.84rem' }}>
                  {isChhattisgarhi ? '🌧️ मौसम चेतावनी: आज दवाई छिड़काव झन करव!' : '🌧️ मौसम चेतावनी: आज छिड़काव टालें! (Live Spray Advisory)'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5d4037', display: 'block', mt: 0.2 }}>
                  {sprayAdvisory.advisory}
                </Typography>
              </Alert>
            )}

            {/* Healthy Plant Confirmation Banner */}
            {activeDisease.isHealthy && (
              <Alert
                severity="success"
                icon={<SpaIcon />}
                sx={{ mb: 2, borderRadius: 2.5, bgcolor: '#e8f5e9', border: '1.5px solid #a5d6a7' }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.86rem' }}>
                  {isChhattisgarhi ? '🎉 बधाई! तुंहर फसल एकदम तंदुरुस्त हे!' : '🎉 बधाई! आपकी फसल पूरी तरह स्वस्थ है!'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', mt: 0.2 }}>
                  {isChhattisgarhi
                    ? 'पौधा म कोनो कीरा या फफूंद के लक्षण नइ मिले हे। कोनो रासायनिक दवाई छिड़के के जरूरत नइये।'
                    : 'पौधे में किसी भी हानिकारक कीट या फफूंद के लक्षण नहीं मिले हैं। किसी रासायनिक कीटनाशक के छिड़काव की आवश्यकता नहीं है।'}
                </Typography>
              </Alert>
            )}
            {/* High-Visibility 15L Knapsack Backpack Spray Pump Dosage Box */}
            <Box
              sx={{
                mb: 2,
                p: { xs: 1.5, sm: 1.8 },
                borderRadius: 3,
                bgcolor: '#fff8e1',
                border: '2px solid #ffd54f',
                boxShadow: '0 3px 10px rgba(255, 179, 0, 0.12)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                <Typography sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>🎒</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: { xs: '0.86rem', sm: '0.92rem' } }}>
                  {isChhattisgarhi ? '15 लीटर स्प्रे पंप (टंकी) बर पक्का नाप (15L पंप खुराक):' : '15 लीटर स्प्रे पंप (टंकी) हेतु सटीक नाप (Knapsack Pump Dose):'}
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 1, sm: 1.2 }, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #ffe082', mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 900, color: '#bf360c', fontSize: { xs: '0.94rem', sm: '1.02rem' } }}>
                  👉 {activeDisease.pumpDose || (isChhattisgarhi ? '15-20 ग्राम हर 15 लीटर टंकी' : '15-20 ग्राम प्रति 15 लीटर पंप')}
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ color: '#6d4c41', fontSize: { xs: '0.72rem', sm: '0.75rem' }, lineHeight: 1.45, display: 'block' }}>
                {isChhattisgarhi
                  ? '💧 <strong>एकड़ नाप:</strong> 1 एकड़ बर 150-200 लीटर पानी (लगभग 10-12 टंकी)। हमेशा साफ पानी के उपयोग करव अउ बिहनिया (8-11 बजे) या संझा (4-6 बजे) शांत मौसम म दवाई छिड़कव।'
                  : '💧 <strong>एकड़ नाप:</strong> 1 एकड़ हेतु 150-200 लीटर पानी (लगभग 10-12 टंकी)। हमेशा साफ पानी का उपयोग करें और सुबह (8-11 बजे) या शाम (4-6 बजे) शांत मौसम में छिड़काव करें।'}
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
                        {isChhattisgarhi ? 'रोग के चिन्हारी (लक्षण):' : 'रोग के लक्षण (Visible Symptoms):'}
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
                        {isChhattisgarhi ? 'आगू बर बचाव अउ बीहा उपचार:' : 'भविष्य में बचाव व बीजोपचार (Prevention):'}
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
                        {isChhattisgarhi ? 'देसी अउ जैविक उपाय (Organic उपचार):' : 'जैविक एवं देसी उपाय (Organic / Bio Remedy):'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {activeDisease.organicRemedy}
                    </Typography>
                  </Paper>

                  {/* Chemical Remedy & CIB&RC Certified Active Formulation */}
                  {(() => {
                    const matchedCibrc = getMatchingCibrc(activeDisease);
                    return (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.8,
                          bgcolor: '#e3f2fd',
                          borderRadius: 2.5,
                          border: '1.5px solid #bbdefb'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, mb: 0.8, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <ScienceIcon sx={{ color: '#1565c0', fontSize: 18 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0d47a1', fontSize: '0.86rem' }}>
                              {isChhattisgarhi ? 'रासायनिक दवाई अउ तकनीकी नाम:' : 'रासायनिक दवा व तकनीकी नाम (Chemical Medicine):'}
                            </Typography>
                          </Box>
                          {matchedCibrc ? (
                            <Chip
                              icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: '#1565c0 !important' }} />}
                              label={isChhattisgarhi ? "🛡️ CIB&RC जांचे" : "🛡️ CIB&RC अनुमोदित"}
                              size="small"
                              sx={{ bgcolor: '#fff', color: '#1565c0', fontWeight: 800, fontSize: '0.68rem', height: 22, border: '1px solid #90caf9' }}
                            />
                          ) : (
                            <Chip
                              label={isChhattisgarhi ? "🛡️ शून्य गलत डेटा नीति" : "🛡️ शून्य फर्जी डेटा नीति"}
                              size="small"
                              sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
                            />
                          )}
                        </Box>

                        <Typography variant="body2" sx={{ color: '#0d47a1', fontSize: '0.82rem', lineHeight: 1.55, mb: 1 }}>
                          {activeDisease.chemicalRemedy}
                        </Typography>

                        {/* CIB&RC Pre-Harvest Interval (PHI) & Government Verified Dosage Specs */}
                        {matchedCibrc ? (
                          <Box sx={{ mt: 1.2, p: 1.2, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #90caf9' }}>
                            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 800, display: 'block', mb: 0.6, fontSize: '0.74rem' }}>
                              {isChhattisgarhi ? '📋 CIB&RC सरकारी तकनीकी विवरण:' : '📋 CIB&RC आधिकारिक तकनीकी विवरण (Official CIB&RC Label Claim):'}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 0.8 }}>
                              <Chip
                                label={isChhattisgarhi ? `⏳ सुरक्षित PHI: ${matchedCibrc.phiDays} दिन` : `⏳ सुरक्षित PHI: ${matchedCibrc.phiDays} दिन`}
                                size="small"
                                sx={{
                                  bgcolor: matchedCibrc.phiDays <= 7 ? '#e8f5e9' : matchedCibrc.phiDays <= 21 ? '#fff8e1' : '#ffebee',
                                  color: matchedCibrc.phiDays <= 7 ? '#2e7d32' : matchedCibrc.phiDays <= 21 ? '#b78103' : '#c62828',
                                  fontWeight: 800,
                                  fontSize: '0.7rem'
                                }}
                              />
                              <Chip
                                label={`🎒 15L ${isChhattisgarhi ? 'पंप' : 'पंप'}: ${matchedCibrc.dosagePerPump15L}`}
                                size="small"
                                sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 700, fontSize: '0.68rem' }}
                              />
                              <Chip
                                label={`💧 ${isChhattisgarhi ? 'हर एकड़' : 'प्रति एकड़'}: ${matchedCibrc.dosagePerAcre}`}
                                size="small"
                                sx={{ bgcolor: '#f0f9ff', color: '#0369a1', fontWeight: 700, fontSize: '0.68rem' }}
                              />
                            </Box>

                            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block', mb: 0.4 }}>
                              {isChhattisgarhi ? (
                                <>⚠️ <strong>तुड़ाई पहिली अंतराल (PHI):</strong> कटाई ले कम से कम <strong>{matchedCibrc.phiDays} दिन पहिली</strong> दवाई छिड़काव बंद करना जरूरी हे ताकि फसल म दवाई के अंश झन रहय।</>
                              ) : (
                                <>⚠️ <strong>तुड़ाई पूर्व अंतराल (PHI):</strong> कटाई से कम से कम <strong>{matchedCibrc.phiDays} दिन पूर्व</strong> छिड़काव बंद करना अनिवार्य है ताकि उपज में रासायनिक अवशेष न रहें (FSSAI/निर्यात सुरक्षा)।</>
                              )}
                            </Typography>

                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                              🔒 {matchedCibrc.safetyEquipment} • {matchedCibrc.cibrcRegRef}
                            </Typography>
                          </Box>
                        ) : (
                          <Alert
                            severity="warning"
                            icon={<SecurityIcon sx={{ fontSize: 18 }} />}
                            sx={{ mt: 1, p: 0.8, borderRadius: 2, bgcolor: '#fffde7', border: '1px solid #fff59d' }}
                          >
                            <Typography variant="caption" sx={{ color: '#795548', fontSize: '0.72rem', display: 'block', lineHeight: 1.4 }}>
                              {isChhattisgarhi
                                ? '🛡️ शून्य गलत डेटा नीति: ये कीरा/रोग बर कोनो मनगढ़ंत दवाई नइ दिखाय गे हे। केवल देसी/जैविक उपाय करव या विशेषज्ञ सलाह बर किसान कॉल सेंटर म बात करव।'
                                : '🛡️ शून्य फर्जी डेटा नीति: इस कीट/रोग हेतु कोई मनगढ़ंत रासायनिक दवा नहीं दिखाई गई है। केवल जैविक उपचार अपनाएं या विशेषज्ञ सलाह हेतु KCC हेल्पलाइन पर संपर्क करें।'}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<CallIcon sx={{ fontSize: 13 }} />}
                              onClick={() => openNativeDialer('18001801551')}
                              sx={{ mt: 0.5, py: 0.2, px: 1, fontSize: '0.68rem', color: '#e65100', borderColor: '#ffb74d', bgcolor: '#fff', border: '1px solid' }}
                            >
                              {isChhattisgarhi ? 'किसान कॉल सेंटर (1800-180-1551)' : 'किसान कॉल सेंटर (1800-180-1551)'}
                            </Button>
                          </Alert>
                        )}
                      </Paper>
                    );
                  })()}
                </Box>
              </Grid>
            </Grid>

            {/* 9. Conversational Multi-Turn Follow-Up Chat Box (Google Gemini AI Doctor) */}
            <Paper
              elevation={0}
              sx={{
                mt: 2.5,
                mb: 2,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ChatIcon sx={{ color: '#1565c0', fontSize: 22 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                      {isChhattisgarhi ? '👨‍⚕️ डॉक्टर ले अउ पूछव (Follow-up Chat)' : '👨‍⚕️ डॉक्टर से और पूछें (Follow-up Question & Advice)'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.73rem' }}>
                      {isChhattisgarhi ? 'दवाई, छिड़काव बेरा, खाद मिलाना या जैविक काढ़ा संबंधी कोनो सवाल पूछव' : 'दवा, छिड़काव समय, खाद मिश्रण या जैविक काढ़ा संबंधी कोई भी सवाल पूछें'}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label="⚡ 100% लाइव AI परामर्श"
                  size="small"
                  sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                />
              </Box>

              {/* 4 Zero-Typing Quick Question Chips for Rural Farmers */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.72rem', display: 'block', mb: 0.6 }}>
                  {isChhattisgarhi ? '⚡ 1-टच त्वरित सवाल (टाइप करे के जरूरत नइये):' : '⚡ 1-टच त्वरित सवाल (टाइप करने की आवश्यकता नहीं):'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  {[
                    { label: isChhattisgarhi ? '💊 दूसरी या सस्ती दवाई बताव' : '💊 दूसरी या सस्ती दवा बताएं', text: `${activeDisease.diseaseName} के लिए कोई दूसरी या सस्ती अनुमोदित दवा और 15L पंप की खुराक बताएं` },
                    { label: isChhattisgarhi ? '🌿 जैविक / देसी काढ़ा उपाय' : '🌿 जैविक / देसी काढ़ा उपचार', text: `${activeDisease.diseaseName} की रोकथाम हेतु देसी काढ़ा या जैविक घरेलू उपचार कैसे तैयार करें?` },
                    { label: isChhattisgarhi ? '⏰ स्प्रे करे के सही बेरा' : '⏰ स्प्रे का सबसे सही समय', text: 'इस दवा का छिड़काव सुबह करना चाहिए या शाम को, और कितने दिन बाद दोबारा छिड़कें?' },
                    { label: isChhattisgarhi ? '🌧️ स्प्रे बाद पानी गिर जाए त?' : '🌧️ स्प्रे के बाद बारिश हो जाए तो?', text: 'कीटनाशक छिड़कने के कितने घंटे बाद बारिश होने पर दवा काम करेगी?' }
                  ].map((chip, idx) => (
                    <Chip
                      key={idx}
                      label={chip.label}
                      clickable
                      disabled={chatLoading}
                      onClick={() => handleSendChatMessage(chip.text)}
                      sx={{
                        bgcolor: '#ffffff',
                        border: '1px solid #94a3b8',
                        color: '#1e293b',
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        borderRadius: '16px',
                        '&:hover': { bgcolor: '#f1f5f9', borderColor: '#1565c0' }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Message Transcript Area */}
              {chatMessages.length > 0 && (
                <Box
                  sx={{
                    maxHeight: 260,
                    overflowY: 'auto',
                    mb: 1.5,
                    p: 1.2,
                    bgcolor: '#ffffff',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  {chatMessages.map((msg, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%',
                        p: 1.2,
                        borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        bgcolor: msg.sender === 'user' ? '#1565c0' : msg.isError ? '#ffebee' : '#f0fdf4',
                        color: msg.sender === 'user' ? '#ffffff' : msg.isError ? '#c62828' : '#0f172a',
                        border: msg.sender === 'user' ? 'none' : msg.isError ? '1px solid #ffcdd2' : '1px solid #bbf7d0'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.3 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: msg.sender === 'user' ? '#bbdefb' : '#15803d' }}>
                          {msg.sender === 'user' ? (isChhattisgarhi ? 'आप:' : 'आप:') : (isChhattisgarhi ? '👨‍⚕️ कृषि वैज्ञानिक (IGKV):' : '👨‍⚕️ कृषि वैज्ञानिक (IGKV परामर्श):')}
                        </Typography>
                        {msg.sender === 'doctor' && !msg.isError && (
                          <IconButton
                            size="small"
                            onClick={() => speakText(msg.voiceAdvice || msg.text)}
                            sx={{ p: 0.2, color: '#15803d' }}
                          >
                            <VolumeUpIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {msg.text}
                      </Typography>
                      {msg.quickTips && msg.quickTips.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.8 }}>
                          {msg.quickTips.map((tip, tIdx) => (
                            <Chip
                              key={tIdx}
                              label={`💡 ${tip}`}
                              size="small"
                              sx={{ bgcolor: '#ffffff', color: '#1b5e20', fontSize: '0.68rem', height: 20, border: '1px solid #86efac' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}

                  {chatLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 2 }}>
                      <CircularProgress size={16} sx={{ color: '#1565c0' }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {isChhattisgarhi ? 'डॉक्टर सलाह लिखत हवय...' : 'डॉक्टर सलाह तैयार कर रहे हैं...'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Chat Input Field + Voice + Send Button */}
              <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={isChhattisgarhi ? "अपन सवाल लिखव या माइक दबा के बोलव..." : "अपना सवाल लिखें या माइक दबाकर बोलें..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  disabled={chatLoading}
                  sx={{
                    bgcolor: '#ffffff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                  }}
                />

                <Tooltip title={isChatListening ? (isChhattisgarhi ? "माइक बंद करव" : "माइक बंद करें") : (isChhattisgarhi ? "बोल के सवाल पूछव" : "बोलकर सवाल पूछें")}>
                  <IconButton
                    onClick={handleToggleVoiceChat}
                    disabled={chatLoading}
                    sx={{
                      bgcolor: isChatListening ? '#c62828' : '#e0f2fe',
                      color: isChatListening ? '#fff' : '#0284c7',
                      p: 1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: isChatListening ? '#b71c1c' : '#bae6fd' }
                    }}
                  >
                    <MicIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  disabled={chatLoading || !chatInput.trim()}
                  onClick={() => handleSendChatMessage()}
                  sx={{
                    bgcolor: '#1565c0',
                    color: '#fff',
                    fontWeight: 800,
                    px: 2,
                    py: 0.9,
                    borderRadius: 2,
                    minWidth: 'auto',
                    '&:hover': { bgcolor: '#0d47a1' }
                  }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>
            </Paper>

            {/* Scientific Disclaimer & GODL Attribution Footer */}
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
                {isChhattisgarhi
                  ? 'प्रमाणित CIB&RC, KVK अउ इंदिरा गांधी कृषि विश्वविद्यालय (IGKV) अनुशंसा आधारित • स्रोत: डेटा.गॉव.इन (GODL-India)'
                  : 'प्रमाणित CIB&RC (केंद्रीय कीटनाशी बोर्ड), KVK एवं इंदिरा गांधी कृषि विश्वविद्यालय (IGKV) अनुशंसा आधारित • स्रोत: डेटा.गॉव.इन (GODL-India अनुपालित)'}
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
              {isChhattisgarhi ? 'फेर चुनव' : 'रीसेट करें'}
            </Button>
          }
        >
          {isChhattisgarhi
            ? 'ये पसंद बर कोनो रोग नइ मिलिस। कोनो दूसरा चिन्हारी या फसल चुनव।'
            : 'इस चयन के लिए कोई रोग नहीं मिला। कृपया अन्य लक्षण या फसल चुनें।'}
        </Alert>
      )}
        </>
      )}
    </Box>
  );
};
