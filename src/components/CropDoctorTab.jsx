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
  Collapse
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
import { CROPS, CROP_DISEASES, CIBRC_PESTICIDES } from '../data/kisanData';

// Visual Symptom Quick Filter Taxonomy with Chhattisgarhi Dialect Names
const VISUAL_SYMPTOMS = [
  { id: 'all', label: 'सभी लक्षण', labelCg: 'सबो चिन्हारी', icon: '✨', match: '' },
  { id: 'spot', label: 'नाव/आंख जैसे धब्बे (ब्लास्ट)', labelCg: 'धब्बा (ब्लास्ट)', icon: '🍂', match: 'धब्बे' },
  { id: 'stemborer', label: 'गाभा कीट / मृत गोभ', labelCg: 'भंवरी / गोभ कीट', icon: '🐛', match: 'गोभ' },
  { id: 'bph', label: 'माहू / लाही (तने पर)', labelCg: 'माहू / चेंपा', icon: '🦟', match: 'माहू' },
  { id: 'sheath', label: 'केंचुली जैसे धब्बे (शीथ ब्लाइट)', labelCg: 'केंचुली धब्बा', icon: '🌿', match: 'केंचुली' },
  { id: 'khaira', label: 'खैरा रोग / पीलापन', labelCg: 'खैरा पीलापन', icon: '🟡', match: 'खैरा' },
  { id: 'wilt', label: 'अचानक जड़ सूखना (उकठा)', labelCg: 'उकठा सूखना', icon: '🥀', match: 'पीलापन' },
  { id: 'gandhi', label: 'गांधी कीड़ा / बदबूदार कीट', labelCg: 'गांधी कीड़ा', icon: '🦗', match: 'गांधी' },
  { id: 'armyworm', label: 'पत्तियों में बड़े छेद / इल्ली', labelCg: 'कटरुआ इल्ली', icon: '🐛', match: 'छेद' },
  { id: 'rust', label: 'पीला/भूरा पाउडर (रतुआ)', labelCg: 'हल्दी पाउडर (रतुआ)', icon: '🌾', match: 'पाउडर' },
  { id: 'curl', label: 'पत्तियां मुड़ना (कुकरो)', labelCg: 'पत्ता मरोड़', icon: '🍃', match: 'मुड़ना' },
];

export const CropDoctorTab = ({ selectedDistrict = 'रायपुर' }) => {
  const { isChhattisgarhi } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [selectedSymptom, setSelectedSymptom] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [prescriptionTab, setPrescriptionTab] = useState('chemical'); // 'chemical' | 'organic'
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  // 100% Real Statutory & ICAR Baseline Initialization (Guaranteed Zero Empty Screen on cold start)
  const [cropsList, setCropsList] = useState(() => {
    const cached = getCachedModuleData('crops');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return CROPS;
  });

  const [diseasesList, setDiseasesList] = useState(() => {
    const cached = getCachedModuleData('diseases_all') || getCachedModuleData('diseases');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return CROP_DISEASES;
  });

  const [activeDisease, setActiveDisease] = useState(() => {
    const cached = getCachedModuleData('diseases_all') || getCachedModuleData('diseases');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data[0];
    return CROP_DISEASES[0] || null;
  });

  const [cibrcList, setCibrcList] = useState(() => {
    const cached = getCachedModuleData('cibrc_all_all') || getCachedModuleData('cibrc_paddy_all');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return CIBRC_PESTICIDES;
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [nonPlantWarning, setNonPlantWarning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanTechnicalError, setScanTechnicalError] = useState(null);
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
  const [highlightDoctorCard, setHighlightDoctorCard] = useState(false);

  // Listen to Bhaira Kaka Voice Action
  useEffect(() => {
    const handleKakaAction = (e) => {
      const action = e.detail;
      if (!action || action.type !== 'SHOW_DISEASE') return;

      if (action.symptom) {
        setSelectedSymptom(action.symptom);
      }
      if (diseasesList && diseasesList.length > 0) {
        const found = diseasesList.find(
          (d) =>
            (action.disease && (d.diseaseName?.includes(action.disease) || action.disease?.includes(d.diseaseName))) ||
            (action.symptom === 'bph' && (d.diseaseName?.includes('माहू') || d.symptoms?.includes('माहू'))) ||
            (action.symptom === 'spot' && (d.diseaseName?.includes('झुलसा') || d.diseaseName?.includes('खैरा') || d.symptoms?.includes('धब्बे'))) ||
            (action.symptom === 'stemborer' && (d.diseaseName?.includes('तना') || d.symptoms?.includes('गोभ')))
        );
        if (found) {
          setActiveDisease(found);
        }
      }
      setHighlightDoctorCard(true);
      const tryScroll = () => {
        const el = document.getElementById('kaka-doctor-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      tryScroll();
      setTimeout(() => setHighlightDoctorCard(false), 3500);
    };

    window.addEventListener('kisan_kaka_action', handleKakaAction);
    return () => window.removeEventListener('kisan_kaka_action', handleKakaAction);
  }, [diseasesList]);

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

  // Load live data from MongoDB
  const loadFromMongo = async () => {
    try {
      const liveCrops = await getCrops();
      if (liveCrops && Array.isArray(liveCrops) && liveCrops.length > 0) setCropsList(liveCrops);
      const liveDiseases = await getDiseases();
      if (liveDiseases && Array.isArray(liveDiseases) && liveDiseases.length > 0) {
        setDiseasesList(liveDiseases);
        setActiveDisease((prev) => prev || liveDiseases[0]);
      }
    } catch (e) {
      console.warn('[CropDoctor] Mongo load warning:', e);
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
        if (isMounted && res && Array.isArray(res.data) && res.data.length > 0) {
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
    const list = cibrcList && cibrcList.length > 0 ? cibrcList : CIBRC_PESTICIDES;
    if (!disease || !list || list.length === 0) return null;
    const dName = (disease.diseaseName || '').toLowerCase();
    const dSym = (disease.symptoms || '').toLowerCase();
    const dChem = (disease.chemicalRemedy || '').toLowerCase();

    return (
      list.find((item) => {
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

        // Downsample large camera photos client-side to prevent OOM on budget phones
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

          try {
            const diagResult = await diagnoseCropWithLiveAi({
              imageBase64: processedDataUrl,
              cropId: selectedCrop,
              district: selectedDistrict
            });

            setAnalyzing(false);

            if (!diagResult || diagResult.success === false) {
              setScanError(
                diagResult?.error ||
                'फोटो की AI जांच पूरी नहीं हो सकी। फसल सुरक्षा हेतु कोई कल्पित रोग नहीं दिखाया गया है।'
              );
              setScanTechnicalError(diagResult?.technicalError || null);
              notify.error(diagResult?.isOffline ? 'इंटरनेट कनेक्शन बंद है। लाइव AI हेतु डेटा ऑन करें।' : 'AI जांच असफल रही।');
              return;
            }

            // Edge Case: Photo is not a plant
            if (diagResult.isPlant === false) {
              setNonPlantWarning(true);
              notify.warning('पौधे या पत्ती की स्पष्ट फोटो नहीं मिली। कृपया पुनः साफ फोटो लें।');
              return;
            }

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

            setTimeout(() => {
              prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 180);
          } catch (err) {
            setAnalyzing(false);
            setScanError('फोटो विश्लेषण में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।');
            notify.error('फोटो विश्लेषण में त्रुटि हुई।');
          }
        };

        img.onerror = () => {
          setUploadedImage(rawDataUrl);
          setAnalyzing(false);
          setScanError('फोटो लोड करने में असमर्थ।');
          notify.error('फोटो लोड नहीं हो सकी।');
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleResetScan = () => {
    setUploadedImage(null);
    setAiReport(null);
    setAnalyzing(false);
    setNonPlantWarning(false);
    setScanError(null);
    setScanTechnicalError(null);
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
      notify.success('💾 फोटो सुरक्षित हो गई! इंटरनेट आते ही स्वतः जांच होगी।');
    }
  };

  const handleProcessQueuedScan = async (scanItem) => {
    if (!scanItem) return;
    if (!navigator.onLine) {
      notify.warning('अभी फोन में इंटरनेट नहीं है। कृपया मोबाइल डेटा चालू करें।');
      return;
    }
    setIsSyncingPending(true);
    try {
      const diagResult = await diagnoseCropWithLiveAi({
        imageBase64: scanItem.imageBase64,
        cropId: scanItem.cropId,
        district: scanItem.district
      });
      setIsSyncingPending(false);

      if (!diagResult || diagResult.success === false) {
        setScanError(diagResult?.error || 'AI जांच पूरी नहीं हो सकी।');
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
        chemicalRemedy: diagResult.chemicalRemedy || 'कृषि विशेषज्ञ की सलाह अनुसार दवा लें।',
        organicRemedy: diagResult.organicRemedy || 'नीम तेल (5 मिली/लीटर) या ट्राइकोडर्मा छिड़कें।',
        prevention: diagResult.precautions || 'शांत मौसम में सुबह या शाम छिड़काव करें।',
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

      removeOfflineScan(scanItem.id);
      setPendingScans(getOfflineScans());
      notify.success(`🎉 सुरक्षित फोटो की AI जांच पूर्ण: ${formattedDisease.diseaseName}!`);

      setTimeout(() => {
        prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    } catch (err) {
      setIsSyncingPending(false);
      setScanError('तकनीकी समस्या आई। कृपया पुनः प्रयास करें।');
    }
  };

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
    const text = isChhattisgarhi
      ? `${disease.cropName} म ${disease.diseaseName} के इलाज। 15 लीटर टंकी के दवाई खुराक हे: ${disease.pumpDose || 'नियम अनुसार'}। रासायनिक दवाई हे: ${disease.chemicalRemedy}। जैविक उपाय हे: ${disease.organicRemedy}।`
      : `${disease.cropName} में ${disease.diseaseName} का इलाज। 15 लीटर स्प्रे पंप की खुराक है: ${disease.pumpDose || 'अनुशंसा अनुसार'}। रासायनिक उपाय है: ${disease.chemicalRemedy}। जैविक उपाय है: ${disease.organicRemedy}।`;
    speakText(text);
  };

  const handleVoiceReadWeather = () => {
    if (!sprayAdvisory) return;
    const text = isChhattisgarhi
      ? `${selectedDistrict} म आज के मौसम अऊ दवाई छिड़काव सलाह: ${sprayAdvisory.advisory}`
      : `${selectedDistrict} मौसम एवं छिड़काव सलाह: ${sprayAdvisory.advisory}`;
    speakText(text);
  };

  const handleSharePrescription = (disease) => {
    if (!disease) return;
    notify.info('व्हाट्सएप पर पर्ची साझा की जा रही है...');
    const matched = getMatchingCibrc(disease);
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
${matched ? `⏳ *सुरक्षित तुड़ाई अंतराल (PHI):* ${matched.phiDays} दिन\n🔒 *CIB&RC संदर्भ:* ${matched.cibrcRegRef}` : ''}

🌱 *जैविक / देसी उपचार:*
👉 ${disease.organicRemedy}

🛡️ *बचाव सलाह:*
👉 ${disease.prevention}
━━━━━━━━━━━━━━━━━━
📍 IGKV एवं ICAR वैज्ञानिकों की मानक अनुशंसा आधारित
📲 किसान साथी ऐप: https://kisan.init65.co.in/`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'अति गंभीर':
        return { bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', dot: '🔴' };
      case 'गंभीर':
        return { bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', dot: '🟠' };
      case 'मध्यम':
      default:
        return { bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', dot: '🔵' };
    }
  };

  const matchedCibrc = activeDisease ? getMatchingCibrc(activeDisease) : null;

  return (
    <Box sx={{ pb: 3, pt: 0.5, maxWidth: 900, mx: 'auto' }} className="fade-in">
      {/* 1. Sleek Modern Header */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: '#fee2e2', p: 0.9, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalHospitalIcon sx={{ color: '#dc2626', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '1.1rem', lineHeight: 1.2 }}>
              {isChhattisgarhi ? 'एआई फसल डॉक्टर' : 'एआई फसल डॉक्टर (Crop Doctor)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
              {isChhattisgarhi ? '15L पंप सटीक खुराक • देसी अउ रासायनिक इलाज' : '15L पंप सटीक खुराक • जैविक व रासायनिक समाधान'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <KakaWalkthroughButton featureId="doctor" />
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
            label={isChhattisgarhi ? 'IGKV प्रमाणित' : 'IGKV अनुमोदित'}
            size="small"
            sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700, fontSize: '0.7rem', height: 24 }}
          />
        </Box>
      </Box>

      {/* 2. Compact Live Weather Spray Status Strip */}
      {sprayAdvisory && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: '8px 12px',
            borderRadius: '12px',
            bgcolor: sprayAdvisory.canSpray ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${sprayAdvisory.canSpray ? '#bbf7d0' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            {sprayAdvisory.canSpray ? (
              <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18, flexShrink: 0 }} />
            ) : (
              <WarningAmberIcon sx={{ color: '#d97706', fontSize: 18, flexShrink: 0 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: sprayAdvisory.canSpray ? '#166534' : '#92400e',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {sprayAdvisory.canSpray
                ? `✅ ${selectedDistrict}: आज छिड़काव अनुकूल (${sprayAdvisory.weather?.rainProbability || 0}% वर्षा, ${sprayAdvisory.weather?.windSpeed || 0} km/h हवा)`
                : `⚠️ ${selectedDistrict}: आज छिड़काव टालें — ${sprayAdvisory.advisory}`}
            </Typography>
          </Box>

          <Tooltip title={isChhattisgarhi ? 'मौसम सलाह सुनव' : 'मौसम सलाह सुनें'}>
            <IconButton
              size="small"
              onClick={handleVoiceReadWeather}
              sx={{
                p: 0.5,
                color: sprayAdvisory.canSpray ? '#16a34a' : '#d97706',
                bgcolor: '#fff',
                border: '1px solid #e2e8f0'
              }}
            >
              <VolumeUpIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Paper>
      )}

      {/* 3. Clean AI Camera & Gallery Action Card */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          p: 1.8,
          borderRadius: '16px',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          textAlign: 'center'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', mb: 0.3 }}>
          {isChhattisgarhi ? '📸 बीमार पाना या तना के फोटो ले तुरंत जांच करव' : '📸 बीमार पत्ती या पौधे की फोटो से तुरंत जांच करें'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5, fontSize: '0.75rem' }}>
          {isChhattisgarhi
            ? 'कैमरा ले फोटो खींचव या गैलरी ले चुनव • 15L पंप के पक्का नाप तुरंत मिलही'
            : 'कैमरा से सीधी फोटो लें या गैलरी से चुनें • 15L पंप की सटीक खुराक तुरंत मिलेगी'}
        </Typography>

        {/* Pending Offline Scan Queue Badge */}
        {pendingScans.length > 0 && (
          <Box
            sx={{
              mb: 1.5,
              p: 1.2,
              borderRadius: '10px',
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CloudQueueIcon sx={{ color: '#16a34a', fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', fontSize: '0.74rem' }}>
                {isChhattisgarhi ? `📥 ऑफ़लाइन सुरक्षित फोटो (${pendingScans.length})` : `📥 ऑफ़लाइन सुरक्षित स्कैन (${pendingScans.length})`}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              disabled={isSyncingPending || !navigator.onLine}
              onClick={handleProcessAllQueuedScans}
              startIcon={<SyncIcon sx={{ fontSize: 14 }} />}
              sx={{
                bgcolor: '#16a34a',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                py: 0.2,
                px: 1,
                minHeight: 24,
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { bgcolor: '#15803d' }
              }}
            >
              {isSyncingPending ? 'जांच जारी...' : '⚡ सभी जांचें'}
            </Button>
          </Box>
        )}

        {/* Dual Camera / Gallery Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
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
              startIcon={<PhotoCameraIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: '#16a34a',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '12px',
                px: 2,
                py: 0.7,
                boxShadow: 'none',
                textTransform: 'none',
                '&:hover': { bgcolor: '#15803d', boxShadow: 'none' }
              }}
            >
              {isChhattisgarhi ? 'कैमरा ले फोटो खींचव' : 'कैमरा से फोटो खींचें'}
            </Button>
          </label>

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
              startIcon={<PhotoLibraryIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderColor: '#cbd5e1',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: '12px',
                px: 2,
                py: 0.7,
                bgcolor: '#f8fafc',
                textTransform: 'none',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
              }}
            >
              {isChhattisgarhi ? 'गैलरी ले चुनव' : 'गैलरी से चुनें'}
            </Button>
          </label>
        </Box>

        {/* Analyzing Spinner State */}
        {analyzing && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#16a34a' }} />
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}>
              {isChhattisgarhi ? '🔍 एआई फसल के जांच करत हे... कनिहा अगोरव' : '🔍 एआई फोटो का विश्लेषण कर रहा है... कृपया प्रतीक्षा करें'}
            </Typography>
          </Box>
        )}

        {/* AI Report Card upon Scan Success */}
        {uploadedImage && !analyzing && aiReport && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.2,
              bgcolor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              textAlign: 'left'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                component="img"
                src={uploadedImage}
                alt="Plant Scan"
                sx={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.86rem' }}>
                    {aiReport.disease}
                  </Typography>
                  <Chip
                    label={`${aiReport.confidence}% निश्चित`}
                    size="small"
                    sx={{ bgcolor: '#fff', color: '#166534', fontWeight: 800, height: 20, fontSize: '0.66rem' }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block', fontSize: '0.72rem' }}>
                  15L पंप खुराक: <strong>{aiReport.pumpDose}</strong>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleResetScan}
                sx={{ fontSize: '0.7rem', borderRadius: '8px', py: 0.3, px: 1, textTransform: 'none' }}
              >
                {isChhattisgarhi ? 'नवा फोटो' : 'नई फोटो'}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => prescriptionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ bgcolor: '#b91c1c', fontSize: '0.7rem', borderRadius: '8px', py: 0.3, px: 1, textTransform: 'none', '&:hover': { bgcolor: '#991b1b' } }}
              >
                {isChhattisgarhi ? 'पर्ची देखव 👇' : 'पर्ची देखें 👇'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Smart Re-capture Guide if not a plant / blurry */}
        {nonPlantWarning && (
          <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, borderRadius: '12px', bgcolor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b45309', fontSize: '0.84rem', mb: 0.6 }}>
              📷 साफ फोटो के 3 नियम: 1. पत्ती के 10-15 सेमी पास रखें • 2. दिन की रोशनी में खींचें • 3. हाथ स्थिर रखें
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => document.getElementById('crop-camera-capture')?.click()}
                sx={{ bgcolor: '#16a34a', color: '#fff', fontSize: '0.7rem', textTransform: 'none', borderRadius: '8px' }}
              >
                दोबारा फोटो लें
              </Button>
              <Button size="small" onClick={handleResetScan} sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                रीसेट
              </Button>
            </Box>
          </Paper>
        )}

        {/* Scan Error Alert */}
        {scanError && (
          <Alert severity="error" sx={{ mt: 1.5, borderRadius: '12px', textAlign: 'left', fontSize: '0.76rem' }}>
            {scanError}
            {appConfig.debugMode && scanTechnicalError && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {scanTechnicalError}
              </Typography>
            )}
            {uploadedImage && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" onClick={handleSaveCurrentScanOffline} sx={{ bgcolor: '#16a34a', fontSize: '0.7rem', textTransform: 'none' }}>
                  💾 फोटो सुरक्षित करें
                </Button>
                <Button size="small" onClick={handleResetScan} sx={{ fontSize: '0.7rem' }}>
                  रीसेट
                </Button>
              </Box>
            )}
          </Alert>
        )}
      </Card>

      {/* 4. Unified Smart Filter & Search Bar */}
      <Box sx={{ mb: 1.5 }}>
        {/* Search Bar with Mic */}
        <TextField
          fullWidth
          size="small"
          placeholder={isChhattisgarhi ? "रोग, चिन्हारी या दवाई बोलव या खोजव (जैसे: गाभा कीट, केंचुली, माहू)..." : "रोग, लक्षण या दवा बोलें या खोजें (जैसे: तना छेदक, शीथ ब्लाइट, माहू)..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ gap: 0.4 }}>
                {searchQuery && (
                  <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: '#94a3b8', p: 0.3 }}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
                <Tooltip title={isVoiceListening ? "सुन रहे हैं... (रोकने हेतु दबाएं)" : "बोलकर खोजें (माइक दबाएं)"}>
                  <IconButton
                    size="small"
                    onClick={handleToggleVoiceSearch}
                    sx={{
                      color: isVoiceListening ? '#fff' : '#b91c1c',
                      bgcolor: isVoiceListening ? '#b91c1c' : '#fee2e2',
                      p: 0.6,
                      borderRadius: '8px'
                    }}
                  >
                    <MicIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
          sx={{
            mb: 1,
            bgcolor: '#fff',
            borderRadius: '12px',
            '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.82rem' }
          }}
        />

        {/* Clean Crop Selection Pill Strip */}
        <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 0.6, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          <Chip
            label={isChhattisgarhi ? "🌾 सबो फसल" : "🌾 सभी फसलें"}
            clickable
            size="small"
            onClick={() => setSelectedCrop('all')}
            sx={{
              fontWeight: selectedCrop === 'all' ? 800 : 600,
              fontSize: '0.74rem',
              borderRadius: '20px',
              bgcolor: selectedCrop === 'all' ? '#166534' : '#ffffff',
              color: selectedCrop === 'all' ? '#ffffff' : '#475569',
              border: selectedCrop === 'all' ? '1px solid #166534' : '1px solid #e2e8f0',
              flexShrink: 0
            }}
          />
          {cropsList.map((c) => {
            const isSel = selectedCrop === c.id;
            return (
              <Chip
                key={c.id}
                label={c.name}
                clickable
                size="small"
                onClick={() => setSelectedCrop(c.id)}
                sx={{
                  fontWeight: isSel ? 800 : 600,
                  fontSize: '0.74rem',
                  borderRadius: '20px',
                  bgcolor: isSel ? '#166534' : '#ffffff',
                  color: isSel ? '#ffffff' : '#475569',
                  border: isSel ? '1px solid #166534' : '1px solid #e2e8f0',
                  flexShrink: 0
                }}
              />
            );
          })}
        </Box>

        {/* Visual Symptom Filter Strip */}
        <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {VISUAL_SYMPTOMS.map((sym) => {
            const isSel = selectedSymptom === sym.id;
            return (
              <Chip
                key={sym.id}
                icon={<span style={{ fontSize: '12px', marginRight: -2 }}>{sym.icon}</span>}
                label={isChhattisgarhi ? sym.labelCg : sym.label}
                clickable
                size="small"
                onClick={() => setSelectedSymptom(sym.id)}
                sx={{
                  fontWeight: isSel ? 800 : 600,
                  fontSize: '0.72rem',
                  borderRadius: '20px',
                  bgcolor: isSel ? '#b91c1c' : '#f8fafc',
                  color: isSel ? '#ffffff' : '#475569',
                  border: isSel ? '1px solid #b91c1c' : '1px solid #e2e8f0',
                  flexShrink: 0
                }}
              />
            );
          })}
        </Box>

        {/* Filtered Disease Pills Strip */}
        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1 }}>
          {filteredDiseases.map((d) => {
            const isActive = activeDisease?.id === d.id;
            return (
              <Chip
                key={d.id}
                label={`${d.cropName}: ${d.diseaseName.split('/')[0].trim()}`}
                clickable
                size="small"
                onClick={() => {
                  setActiveDisease(d);
                  setTimeout(() => {
                    prescriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }, 80);
                }}
                sx={{
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.74rem',
                  borderRadius: '8px',
                  bgcolor: isActive ? '#dc2626' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  border: isActive ? '1px solid #dc2626' : '1px solid #e2e8f0'
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* 5. Modern Breathable Prescription Card (डॉक्टर की पर्ची - Rx) */}
      {activeDisease ? (
        <Card
          ref={prescriptionRef}
          id="kaka-doctor-card"
          className={highlightDoctorCard ? 'kaka-spotlight-pulse' : ''}
          elevation={0}
          sx={{
            borderRadius: '18px',
            border: '1.5px solid #fecaca',
            boxShadow: '0 4px 16px rgba(185, 28, 28, 0.06)',
            bgcolor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {/* Card Header (Rx Motif) */}
          <Box
            sx={{
              p: 1.8,
              bgcolor: '#fff5f5',
              borderBottom: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.2
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mb: 0.4 }}>
                <Chip
                  label={isChhattisgarhi ? "Rx किसान पर्ची" : "Rx कृषि पर्ची"}
                  size="small"
                  sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 900, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
                />
                <Chip
                  label={activeDisease.cropName}
                  size="small"
                  sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
                />
                {(() => {
                  const s = getSeverityStyle(activeDisease.severity);
                  return (
                    <Chip
                      label={`${s.dot} ${activeDisease.severity || 'गंभीर'}`}
                      size="small"
                      sx={{ bgcolor: s.bgcolor, color: s.color, border: s.border, fontWeight: 700, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
                    />
                  );
                })()}
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '1.05rem', lineHeight: 1.2 }}>
                {activeDisease.diseaseName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                कारक: <strong>{activeDisease.pathogen || 'पादप रोग / कीट'}</strong>
              </Typography>
            </Box>

            {/* Header Action Buttons */}
            <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
              <Button
                variant={isVoicePlaying ? 'contained' : 'outlined'}
                size="small"
                startIcon={isVoicePlaying ? <VolumeOffIcon sx={{ fontSize: 15 }} /> : <VolumeUpIcon sx={{ fontSize: 15 }} />}
                onClick={() => {
                  if (isVoicePlaying) {
                    stopSpeech();
                  } else {
                    handleVoiceReadRemedy(activeDisease);
                  }
                }}
                sx={{
                  bgcolor: isVoicePlaying ? '#dc2626' : '#fff',
                  color: isVoicePlaying ? '#fff' : '#dc2626',
                  borderColor: '#fca5a5',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: '10px',
                  py: 0.4,
                  px: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: isVoicePlaying ? '#b91c1c' : '#fee2e2' }
                }}
              >
                {isVoicePlaying ? 'रोकें ⏹️' : 'इलाज सुनें 🔊'}
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<WhatsAppIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleSharePrescription(activeDisease)}
                sx={{
                  bgcolor: '#16a34a',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: '10px',
                  py: 0.4,
                  px: 1.2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#15803d', boxShadow: 'none' }
                }}
              >
                दुकानदार पर्ची 💬
              </Button>
            </Box>
          </Box>

          <CardContent sx={{ p: 2 }}>
            {/* HERO METRIC: 15L Knapsack Spray Pump Dosage Banner */}
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: '14px',
                bgcolor: '#fffbeb',
                border: '1.5px solid #fde68a',
                textAlign: 'left'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#b45309', display: 'block', fontSize: '0.72rem', mb: 0.2 }}>
                🎒 15 लीटर स्प्रे पंप (टंकी) पक्का नाप (Knapsack Pump Dose):
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 900, color: '#9a3412', fontSize: '1rem', mb: 0.3 }}>
                👉 {activeDisease.pumpDose || (isChhattisgarhi ? '15-20 ग्राम प्रति 15 लीटर टंकी' : '15-20 ग्राम प्रति 15 लीटर पंप')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#78350f', fontSize: '0.72rem', display: 'block' }}>
                💧 <strong>एकड़ नाप:</strong> 1 एकड़ में 150-200 लीटर पानी (लगभग 10-12 टंकी) • सुबह 8-11 या शाम 4-6 बजे शांत मौसम में छिड़काव करें।
              </Typography>
            </Box>

            {/* Segmented Control Pill Switch: Chemical vs Organic */}
            <Box sx={{ mb: 1.8, display: 'flex', bgcolor: '#f1f5f9', p: 0.4, borderRadius: '12px' }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ScienceIcon sx={{ fontSize: 16 }} />}
                onClick={() => setPrescriptionTab('chemical')}
                sx={{
                  py: 0.6,
                  borderRadius: '9px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: prescriptionTab === 'chemical' ? '#ffffff' : 'transparent',
                  color: prescriptionTab === 'chemical' ? '#1d4ed8' : '#64748b',
                  boxShadow: prescriptionTab === 'chemical' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': { bgcolor: prescriptionTab === 'chemical' ? '#ffffff' : 'transparent' }
                }}
              >
                💊 रासायनिक दवा (Chemical)
              </Button>
              <Button
                fullWidth
                size="small"
                startIcon={<SpaIcon sx={{ fontSize: 16 }} />}
                onClick={() => setPrescriptionTab('organic')}
                sx={{
                  py: 0.6,
                  borderRadius: '9px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: prescriptionTab === 'organic' ? '#ffffff' : 'transparent',
                  color: prescriptionTab === 'organic' ? '#166534' : '#64748b',
                  boxShadow: prescriptionTab === 'organic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': { bgcolor: prescriptionTab === 'organic' ? '#ffffff' : 'transparent' }
                }}
              >
                🌿 जैविक / देसी उपाय (Organic)
              </Button>
            </Box>

            {/* Tab 1: Chemical Remedy & CIB&RC Regulatory Label Claim */}
            {prescriptionTab === 'chemical' && (
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8, flexWrap: 'wrap', gap: 0.6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', fontSize: '0.84rem' }}>
                    अनुशंसित रासायनिक दवा:
                  </Typography>
                  {matchedCibrc ? (
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: '#1d4ed8 !important' }} />}
                      label="CIB&RC सरकारी अनुमोदित"
                      size="small"
                      sx={{ bgcolor: '#fff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.66rem', height: 20, border: '1px solid #bfdbfe' }}
                    />
                  ) : null}
                </Box>
                <Typography variant="body2" sx={{ color: '#1e3a8a', fontSize: '0.82rem', lineHeight: 1.5, mb: 1 }}>
                  {activeDisease.chemicalRemedy}
                </Typography>

                {/* CIB&RC Label Claim Box */}
                {matchedCibrc ? (
                  <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 0.6 }}>
                      <Chip
                        label={`⏳ सुरक्षित तुड़ाई अंतराल (PHI): ${matchedCibrc.phiDays} दिन`}
                        size="small"
                        sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                      />
                      <Chip
                        label={`🎒 15L पंप: ${matchedCibrc.dosagePerPump15L}`}
                        size="small"
                        sx={{ bgcolor: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                      <Chip
                        label={`💧 प्रति एकड़: ${matchedCibrc.dosagePerAcre}`}
                        size="small"
                        sx={{ bgcolor: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                      🔒 <strong>सुरक्षा:</strong> {matchedCibrc.safetyEquipment} • {matchedCibrc.cibrcRegRef}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            )}

            {/* Tab 2: Organic / Biological Remedy */}
            {prescriptionTab === 'organic' && (
              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.84rem', mb: 0.5 }}>
                  जैविक एवं देसी उपाय:
                </Typography>
                <Typography variant="body2" sx={{ color: '#14532d', fontSize: '0.82rem', lineHeight: 1.55 }}>
                  {activeDisease.organicRemedy}
                </Typography>
              </Box>
            )}

            {/* Collapsible Symptoms & Prevention Accordion */}
            <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', mb: 1.8 }}>
              <Box
                onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                sx={{
                  p: 1.2,
                  bgcolor: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  userSelect: 'none'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem' }}>
                  📋 लक्षण व बचाव विवरण (Symptoms & Prevention)
                </Typography>
                {showDetailedInfo ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#64748b' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#64748b' }} />}
              </Box>

              <Collapse in={showDetailedInfo}>
                <Box sx={{ p: 1.5, bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#991b1b', display: 'block', mb: 0.2 }}>
                      रोग के लक्षण (Visible Symptoms):
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      {activeDisease.symptoms}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block', mb: 0.2 }}>
                      भविष्य में बचाव व बीजोपचार (Prevention):
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      {activeDisease.prevention}
                    </Typography>
                  </Box>
                </Box>
              </Collapse>
            </Box>

            {/* 6. Multi-Turn AI Doctor Follow-Up Consultation */}
            <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <ChatIcon sx={{ color: '#1d4ed8', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
                    डॉक्टर से और पूछें (Follow-up Chat)
                  </Typography>
                </Box>
                <Chip label="⚡ 100% लाइव AI" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.66rem', height: 20 }} />
              </Box>

              {/* 4 Zero-Typing Quick Question Chips */}
              <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1.2 }}>
                {[
                  { label: isChhattisgarhi ? '💊 दूसरी दवाई बताव' : '💊 दूसरी दवा बताएं', text: `${activeDisease.diseaseName} के लिए कोई दूसरी अनुमोदित दवा और 15L पंप खुराक बताएं` },
                  { label: isChhattisgarhi ? '🌿 देसी काढ़ा उपाय' : '🌿 देसी काढ़ा उपचार', text: `${activeDisease.diseaseName} की रोकथाम हेतु देसी काढ़ा कैसे तैयार करें?` },
                  { label: isChhattisgarhi ? '⏰ स्प्रे के सही बेरा' : '⏰ स्प्रे का सही समय', text: 'इस दवा का छिड़काव सुबह करना चाहिए या शाम को?' },
                  { label: isChhattisgarhi ? '🌧️ बारिश हो जाए त?' : '🌧️ बारिश हो जाए तो?', text: 'कीटनाशक छिड़कने के कितने घंटे बाद बारिश होने पर दवा काम करेगी?' }
                ].map((chip, idx) => (
                  <Chip
                    key={idx}
                    label={chip.label}
                    clickable
                    disabled={chatLoading}
                    onClick={() => handleSendChatMessage(chip.text)}
                    sx={{
                      bgcolor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      borderRadius: '16px',
                      '&:hover': { bgcolor: '#f1f5f9', borderColor: '#1d4ed8' }
                    }}
                  />
                ))}
              </Box>

              {/* Chat Message Transcript */}
              {chatMessages.length > 0 && (
                <Box sx={{ maxHeight: 220, overflowY: 'auto', mb: 1.2, p: 1, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                  {chatMessages.map((msg, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%',
                        p: 1,
                        borderRadius: msg.sender === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                        bgcolor: msg.sender === 'user' ? '#1d4ed8' : msg.isError ? '#fee2e2' : '#f0fdf4',
                        color: msg.sender === 'user' ? '#ffffff' : msg.isError ? '#991b1b' : '#0f172a',
                        border: msg.sender === 'user' ? 'none' : msg.isError ? '1px solid #fecaca' : '1px solid #bbf7d0'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', color: msg.sender === 'user' ? '#bfdbfe' : '#166534' }}>
                          {msg.sender === 'user' ? 'आप:' : '👨‍⚕️ कृषि वैज्ञानिक:'}
                        </Typography>
                        {msg.sender === 'doctor' && !msg.isError && (
                          <IconButton size="small" onClick={() => speakText(msg.voiceAdvice || msg.text)} sx={{ p: 0.2, color: '#16a34a' }}>
                            <VolumeUpIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  ))}
                  {chatLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, p: 0.8, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                      <CircularProgress size={14} sx={{ color: '#1d4ed8' }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        डॉक्टर सलाह लिख रहे हैं...
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Chat Input Bar */}
              <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={isChhattisgarhi ? "सवाल लिखव या बोलव..." : "सवाल लिखें या बोलें..."}
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
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.78rem' }
                  }}
                />
                <Tooltip title={isChatListening ? "माइक बंद करें" : "बोलकर सवाल पूछें"}>
                  <IconButton
                    onClick={handleToggleVoiceChat}
                    disabled={chatLoading}
                    sx={{
                      bgcolor: isChatListening ? '#dc2626' : '#eff6ff',
                      color: isChatListening ? '#fff' : '#1d4ed8',
                      p: 0.8,
                      borderRadius: '10px'
                    }}
                  >
                    <MicIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  disabled={chatLoading || !chatInput.trim()}
                  onClick={() => handleSendChatMessage()}
                  sx={{
                    bgcolor: '#1d4ed8',
                    color: '#fff',
                    fontWeight: 800,
                    px: 1.5,
                    py: 0.8,
                    borderRadius: '10px',
                    minWidth: 'auto',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#1e40af', boxShadow: 'none' }
                  }}
                >
                  <SendIcon sx={{ fontSize: 16 }} />
                </Button>
              </Box>
            </Box>

            {/* Scientific Attribution Footer */}
            <Box sx={{ mt: 1.8, display: 'flex', alignItems: 'center', gap: 0.8, p: 0.8, bgcolor: '#f8fafc', borderRadius: '8px' }}>
              <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 15 }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                CIB&RC (केंद्रीय कीटनाशी बोर्ड), ICAR एवं IGKV रायपुर अनुशंसा आधारित • स्रोत: डेटा.गॉव.इन (GODL-India)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : null}
    </Box>
  );
};

export default CropDoctorTab;
