import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  Divider,
  InputAdornment
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScienceIcon from '@mui/icons-material/Science';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import SyncIcon from '@mui/icons-material/Sync';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import PinDropIcon from '@mui/icons-material/PinDrop';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { speakText, stopSpeech } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { fetchLiveWeather } from '../services/weatherService';
import {
  getActiveFarmer,
  loginFarmer,
  logoutFarmer,
  getFarmerPlots
} from '../services/farmerService';
import { notify } from '../services/notificationService';
import { CROP_LIFECYCLE_RULES } from '../utils/cropLifecycleEngine';
import { isNativePlatform } from '../utils/capacitorUtils';
import { shareOnWhatsApp } from '../utils/shareUtils';
import { checkForAppUpdate } from '../services/updateService';
import { getPublicBroadcasts } from '../services/adminService';
import SensorsIcon from '@mui/icons-material/Sensors';
import { MeraKhetModal } from './MeraKhetModal';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { MotorControllerModal } from './MotorControllerModal';
import { DeviceHubModal } from './DeviceHubModal';
import { ShareModal } from './ShareModal';
import { getMandiRates, getCachedModuleData } from '../services/apiService';
import { fetchVillagesByPincode } from '../services/pincodeService';

const LIFECYCLE_STEPS = [
  {
    step: 1,
    title: 'खेत तैयारी व मृदा स्वास्थ्य',
    short: 'मृदा परीक्षण व ग्रीष्मकालीन गहरी जुताई',
    tag: 'खेत तैयारी',
    color: '#5d4037',
    desc: 'गर्मियों में गहरी जुताई करें ताकि हानिकारक कीटों के अंडे व खरपतवार नष्ट हो जाएं। गोबर की सड़ी खाद 4-5 टन प्रति एकड़ डालें और नजदीकी कृषि विज्ञान केंद्र से मिट्टी की जांच कराएं (आदर्श pH: 6.0-7.0)।',
    voice: 'पहला चरण: खेत तैयारी और मृदा स्वास्थ्य। खेत की गहरी जुताई करें। 4 से 5 टन गोबर खाद प्रति एकड़ डालें और मिट्टी का पीएच टेस्ट कराएं।'
  },
  {
    step: 2,
    title: 'बीज चयन व बीजोपचार',
    short: 'प्रमाणित रोगरोधी बीज व फफूंदनाशी उपचार',
    tag: 'बीजोपचार',
    color: '#2e7d32',
    desc: 'प्रमाणित किस्मों (जैसे धान में सरना, महामाया, एचएमटी) का चुनाव करें। बुआई से पूर्व बीजोपचार अवश्य करें: 1 कि.ग्रा. बीज में 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिलाकर 24 घंटे रखें। इससे उकठा व झुलसा रोग नहीं लगता।',
    voice: 'दूसरा चरण: बीज चयन और बीजोपचार। हमेशा प्रमाणित बीज का उपयोग करें और बुआई से पहले ट्राइकोडर्मा या बाविस्टिन से बीजोपचार जरूर करें।'
  },
  {
    step: 3,
    title: 'संतुलित पोषण व खाद प्रबंधन',
    short: 'यूरिया, डीएपी व पोटाश का सही समय',
    tag: 'खाद प्रबंधन',
    color: '#00796b',
    desc: 'बुआई के समय पूरी डीएपी और पोटाश डालें। यूरिया को तीन बराबर भागों में बांटकर दें (बुआई, कल्ले फूटने पर 25 दिन बाद, और बालियां आने से पहले 45 दिन बाद)। जिंक सल्फेट कभी भी डीएपी के साथ मिलाकर न डालें।',
    voice: 'तीसरा चरण: पोषण और खाद प्रबंधन। डीएपी और पोटाश बुआई के समय डालें। यूरिया को तीन भागों में दें। जिंक और डीएपी को कभी मिलाकर न डालें।'
  },
  {
    step: 4,
    title: 'फसल सुरक्षा व रोग निदान',
    short: 'कीट व बीमारी का समय पर नियंत्रण',
    tag: 'फसल सुरक्षा',
    color: '#c62828',
    desc: 'खेत में नियमित निगरानी करें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं। भूरा माहू होने पर खेत का पानी 2 दिन निकालें और नीम तेल या पाइमेट्रोज़िन का छिड़काव तनों पर करें। पत्तियों पर धब्बे दिखने पर ट्राईसाइक्लाजोल का छिड़काव करें।',
    voice: 'चौथा चरण: फसल सुरक्षा और रोग निदान। पत्तियों और तनों का नियमित निरीक्षण करें। लक्षण दिखते ही फसल डॉक्टर टैब में फोटो या लक्षण जांचकर सही दवा छिड़कें।'
  },
  {
    step: 5,
    title: 'कटाई, सुखाना व थ्रेशिंग',
    short: '14-17% नमी पर कटाई व सुरक्षित भंडारण',
    tag: 'कटाई',
    color: '#f57f17',
    desc: 'जब बालियों के 85-90% दाने सुनहरे हो जाएं तब कटाई करें। कटाई के बाद फसल को धूप में अच्छी तरह सुखाएं। उपार्जन केंद्र ले जाने से पहले अनाज में नमी 14-17% से अधिक नहीं होनी चाहिए ताकि वजन में कटौती न हो।',
    voice: 'पांचवां चरण: कटाई और सुखाना। जब 85 से 90 प्रतिशत दाने सुनहरे हो जाएं तब कटाई करें और अनाज को सुखाकर नमी 14 से 17 प्रतिशत तक लाएं।'
  },
  {
    step: 6,
    title: `मंडी भाव व ₹${appConfig.paddyScheme.totalRate} बिक्री`,
    short: 'टोकन तुंहर हाथ व कृषक उन्नति योजना',
    tag: 'बिक्री ₹3,100',
    color: '#1565c0',
    desc: `${appConfig.stateName} कृषक उन्नति योजना के तहत ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} प्रति क्विंटल का भुगतान होता है (प्रति एकड़ ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल)। टोकन तुंहर हाथ ऐप से घर बैठे टोकन काटें, उपार्जन केंद्र में तौल कराएं और सीधे बैंक खाते में भुगतान प्राप्त करें।`,
    voice: `छठा चरण: मंडी भाव और सरकारी बिक्री। ${appConfig.stateName} सरकार की कृषक उन्नति योजना में ${appConfig.paddyScheme.totalRate} रुपये प्रति क्विंटल के भाव से टोकन तुंहर हाथ द्वारा आसानी से धान बेचें।`
  }
];

export const HomeTab = ({ onNavigate, selectedDistrict }) => {
  const [expandedStep, setExpandedStep] = useState(1);
  const [openMeraKhet, setOpenMeraKhet] = useState(false);
  const [openGpsTracker, setOpenGpsTracker] = useState(false);
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [openMotorModal, setOpenMotorModal] = useState(false);
  const [openDeviceHub, setOpenDeviceHub] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);

  // Fetch active department broadcasts
  useEffect(() => {
    let isMounted = true;
    getPublicBroadcasts(selectedDistrict).then((data) => {
      if (isMounted && Array.isArray(data)) {
        setActiveBroadcasts(data);
      }
    });
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  // Refresh active farmer session when Mera Khet modal is closed or session event fires
  useEffect(() => {
    const handleSessionChanged = (e) => {
      setActiveFarmer(e.detail || getActiveFarmer());
    };
    window.addEventListener('kisan_farmer_session_changed', handleSessionChanged);
    return () => {
      window.removeEventListener('kisan_farmer_session_changed', handleSessionChanged);
    };
  }, []);

  useEffect(() => {
    setActiveFarmer(getActiveFarmer());
  }, [openMeraKhet]);

  // Load registered plots for active farmer
  const [farmerPlots, setFarmerPlots] = useState([]);
  useEffect(() => {
    if (activeFarmer && activeFarmer.phone) {
      getFarmerPlots(activeFarmer.phone).then((list) => {
        setFarmerPlots(list || []);
      });
    } else {
      setFarmerPlots([]);
    }
  }, [activeFarmer]);

  // 1-Click Quick Login Modal & Pending Tool Action State
  const [openQuickLogin, setOpenQuickLogin] = useState(false);
  const [pendingToolAction, setPendingToolAction] = useState(null);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [loginForm, setLoginForm] = useState({
    phone: '',
    name: '',
    pin: '1234',
    pincode: '',
    village: '',
    district: '',
    block: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeVillages, setPincodeVillages] = useState([]);
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [customVillageMode, setCustomVillageMode] = useState(false);

  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setLoginForm((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetchVillagesByPincode(clean);
        if (res && res.success) {
          const vList = res.villages || [];
          setPincodeVillages(vList);
          setPincodeInfo({ district: res.district, block: res.block, state: res.state, source: res.source });
          setCustomVillageMode(false);
          setLoginForm((prev) => ({
            ...prev,
            village: vList.length > 0 ? vList[0] : prev.village,
            district: res.district || prev.district,
            block: res.block || prev.block
          }));
          notify.success(`📍 ${res.block ? res.block + ', ' : ''}${res.district || ''}: ${vList.length} गांव मिले!`);
        } else {
          setPincodeVillages([]);
          setPincodeInfo(null);
          setCustomVillageMode(true);
          if (res?.error) notify.info(res.error);
        }
      } catch (err) {
        setCustomVillageMode(true);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      if (clean.length < 6) {
        setPincodeVillages([]);
        setPincodeInfo(null);
      }
    }
  };

  // Require Login Gatekeeper for personalized tools
  const handleRequireLogin = (toolAction) => {
    if (activeFarmer) {
      if (toolAction === 'motor') setOpenMotorModal(true);
      else if (toolAction === 'khet') setOpenMeraKhet(true);
      else if (toolAction === 'soil') setOpenSoilIot(true);
      else if (toolAction === 'hub') setOpenDeviceHub(true);
    } else {
      setPendingToolAction(toolAction);
      setOpenQuickLogin(true);
    }
  };

  const handleQuickLoginSubmit = async () => {
    if (!loginForm.phone || loginForm.phone.length < 10) {
      notify.warning('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (authMode === 'login' && (!loginForm.pin || loginForm.pin.length < 4)) {
      notify.warning('कृपया 4 अंकों का सुरक्षा पिन दर्ज करें।');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await loginFarmer({
        phone: loginForm.phone,
        name: authMode === 'register' ? (loginForm.name || 'किसान साथी') : undefined,
        pin: loginForm.pin || '1234',
        village: authMode === 'register' ? (loginForm.village || '') : undefined,
        district: loginForm.district || selectedDistrict,
      });
      if (res.success) {
        setActiveFarmer(res.farmer);
        setOpenQuickLogin(false);
        notify.success(`स्वागत है, ${res.farmer.name || 'किसान साथी'}! आपका खाता सक्रिय हो गया।`);
        if (pendingToolAction === 'motor') setOpenMotorModal(true);
        else if (pendingToolAction === 'khet') setOpenMeraKhet(true);
        else if (pendingToolAction === 'soil') setOpenSoilIot(true);
        else if (pendingToolAction === 'hub') setOpenDeviceHub(true);
        setPendingToolAction(null);
      } else {
        notify.error(res.error || 'लॉगिन विफल रहा।');
      }
    } catch {
      notify.error('लॉगिन में त्रुटि हुई।');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFarmerLogout = () => {
    logoutFarmer();
    setActiveFarmer(null);
    setFarmerPlots([]);
    notify.info('सफलतापूर्वक लॉगआउट। आपका डेटा सुरक्षित है।');
  };

  // Public Instant Crop & Quick Acre Advisor State (Zero Login Required)
  const [selectedCropKey, setSelectedCropKey] = useState('paddy');
  const [quickAcre, setQuickAcre] = useState(2.0);

  const [updateInfo, setUpdateInfo] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Background check for update on mount
  useEffect(() => {
    let isMounted = true;
    checkForAppUpdate(false).then((info) => {
      if (isMounted && info && info.hasUpdate) {
        setUpdateInfo(info);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    const info = await checkForAppUpdate(true);
    setCheckingUpdate(false);
    setUpdateInfo(info);
    setUpdateDialogOpen(true);
  };

  // Live Weather Fetch (Open-Meteo)
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      const data = await fetchLiveWeather(selectedDistrict);
      if (isMounted) setWeather(data);
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  const handleReadAdvisory = () => {
    const text = weather?.sprayAdvisory?.voice || `आज की कृषि सलाह: मौसम साफ और अनुकूल रहेगा। यूरिया खाद व कीटनाशक छिड़काव का सही समय है।`;
    speakText(text);
  };

  const handleReadStep = (e, step) => {
    e.stopPropagation();
    speakText(step.voice);
  };

  const [liveMandiRates, setLiveMandiRates] = useState(() => {
    const cached = getCachedModuleData('mandi_rates');
    if (cached && cached.data && Array.isArray(cached.data.rates)) {
      return cached.data.rates.slice(0, 3);
    }
    return [];
  });

  // Fetch Mandi Rates (Zero Static Fallback)
  useEffect(() => {
    let isMounted = true;
    const loadMandi = async () => {
      try {
        const res = await getMandiRates();
        if (isMounted && res && res.rates && res.rates.length > 0) {
          setLiveMandiRates(res.rates.slice(0, 3));
        }
      } catch (e) {
        // quiet
      }
    };
    loadMandi();
    return () => { isMounted = false; };
  }, []);

  // Shared Smart Auth Card (Pincode Auto-Discovery + Segmented Register/Login Tabs)
  const renderSmartAuthCard = (inModal = false) => (
    <Box sx={{ width: '100%' }}>
      {/* Top Segmented Tabs */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: inModal ? '#f1f5f9' : '#f0fdf4',
          p: 0.5,
          borderRadius: 3,
          mb: 2,
          border: '1px solid #dcfce7'
        }}
      >
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('register')}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: '0.78rem', sm: '0.84rem' },
            py: 0.9,
            bgcolor: authMode === 'register' ? '#1b5e20' : 'transparent',
            color: authMode === 'register' ? '#ffffff' : '#334155',
            boxShadow: authMode === 'register' ? '0 3px 10px rgba(27,94,32,0.25)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: authMode === 'register' ? '#125420' : '#e2e8f0'
            }
          }}
        >
          🌾 नया किसान पंजीयन
        </Button>
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('login')}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: '0.78rem', sm: '0.84rem' },
            py: 0.9,
            bgcolor: authMode === 'login' ? '#1b5e20' : 'transparent',
            color: authMode === 'login' ? '#ffffff' : '#334155',
            boxShadow: authMode === 'login' ? '0 3px 10px rgba(27,94,32,0.25)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: authMode === 'login' ? '#125420' : '#e2e8f0'
            }
          }}
        >
          🔑 सीधा लॉगिन
        </Button>
      </Box>

      {authMode === 'register' ? (
        /* REGISTER MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: '#ecfdf5',
              borderRadius: 2,
              border: '1px solid #a7f3d0'
            }}
          >
            <PinDropIcon sx={{ color: '#059669', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>
              ⚡ <strong>स्मार्ट सुविधा:</strong> 6-अंक पिन कोड डालते ही आपके क्षेत्र के सभी गांव की सूची तुरंत आ जाएगी।
            </Typography>
          </Box>

          {/* 1. Mobile Number */}
          <TextField
            label="मोबाइल नंबर (10 अंक) *"
            placeholder="98765 43210"
            fullWidth
            size="small"
            value={loginForm.phone}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#334155',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              )
            }}
            helperText={loginForm.phone.length === 10 ? '✓ सुरक्षित किसान पहचान' : '10 अंकों का फोन नंबर दर्ज करें'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 2. Farmer Name */}
          <TextField
            label="किसान का नाम (वैकल्पिक)"
            placeholder="उदा. रामेश्वर साहू"
            fullWidth
            size="small"
            value={loginForm.name}
            onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 3. Postal PIN Code */}
          <TextField
            label="डाक पिन कोड (6 अंक) *"
            placeholder="उदा. 493441 या 492001"
            fullWidth
            size="small"
            value={loginForm.pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {pincodeLoading ? (
                    <CircularProgress size={18} sx={{ color: '#2e7d32' }} />
                  ) : pincodeInfo ? (
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  ) : (
                    <PinDropIcon sx={{ color: '#64748b', fontSize: 20 }} />
                  )}
                </InputAdornment>
              )
            }}
            helperText={
              pincodeLoading ? (
                '🔍 डाक विभाग से गांव खोज रहे हैं...'
              ) : pincodeInfo ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 700 }}>
                  ✓ {pincodeInfo.block ? pincodeInfo.block + ', ' : ''}{pincodeInfo.district || ''} ({pincodeVillages.length} गांव उपलब्ध)
                </Box>
              ) : (
                'पिन कोड डालते ही गांव सूची स्वतः खुलेगी'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: pincodeInfo ? '#f0fdf4' : 'inherit'
              }
            }}
          />

          {/* 4. Village Selection */}
          {pincodeVillages.length > 0 && !customVillageMode ? (
            <TextField
              select
              label="अपना गांव चुनें *"
              fullWidth
              size="small"
              value={loginForm.village || (pincodeVillages[0] || '')}
              onChange={(e) => {
                if (e.target.value === '__CUSTOM__') {
                  setCustomVillageMode(true);
                  setLoginForm({ ...loginForm, village: '' });
                } else {
                  setLoginForm({ ...loginForm, village: e.target.value });
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                  <Typography component="span" variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    📍 पिन कोड द्वारा खोजे गए {pincodeVillages.length} गांव
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setCustomVillageMode(true);
                      setLoginForm({ ...loginForm, village: '' });
                    }}
                    sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1565c0', fontWeight: 700 }}
                  >
                    ✏️ दूसरा गांव लिखें
                  </Button>
                </Box>
              }
            >
              {pincodeVillages.map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: '0.85rem' }}>
                  🏡 {v}
                </MenuItem>
              ))}
              <MenuItem value="__CUSTOM__" sx={{ fontSize: '0.82rem', color: '#1565c0', fontWeight: 700, borderTop: '1px dashed #cbd5e1' }}>
                ✏️ सूची में नहीं है? नया नाम लिखें...
              </MenuItem>
            </TextField>
          ) : (
            <TextField
              label="गांव / ब्लॉक का नाम *"
              placeholder="उदा. आरंग"
              fullWidth
              size="small"
              value={loginForm.village}
              onChange={(e) => setLoginForm({ ...loginForm, village: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText={
                pincodeVillages.length > 0 ? (
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                    <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
                      हाथ से नाम दर्ज करें
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setCustomVillageMode(false)}
                      sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1b5e20', fontWeight: 700 }}
                    >
                      📋 पिन कोड सूची देखें ({pincodeVillages.length})
                    </Button>
                  </Box>
                ) : 'पिन कोड डालें तो सूची अपने आप आ जाएगी या नाम लिखें'
              }
            />
          )}

          {/* 5. Security PIN */}
          <TextField
            label="सुरक्षा पिन (4 अंक) *"
            placeholder="1234"
            type="password"
            fullWidth
            size="small"
            value={loginForm.pin}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            helperText="डिफ़ॉल्ट 1234 • साझा फोन पर आपका डेटा सुरक्षित रहेगा"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || loginForm.phone.length < 10}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)' }
            }}
          >
            {loginLoading ? <CircularProgress size={20} color="inherit" /> : '🚀 किसान खाता बनाएं और शुरू करें'}
          </Button>
        </Box>
      ) : (
        /* LOGIN MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: '#eff6ff',
              borderRadius: 2,
              border: '1px solid #bfdbfe'
            }}
          >
            <LockOpenIcon sx={{ color: '#1d4ed8', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>
              🔑 <strong>त्वरित लॉगिन:</strong> पहले से पंजीकृत किसान सीधे मोबाइल व 4-अंक पिन डालकर तुरंत प्रवेश करें।
            </Typography>
          </Box>

          <TextField
            label="पंजीकृत मोबाइल नंबर (10 अंक) *"
            placeholder="98765 43210"
            fullWidth
            size="small"
            autoFocus
            value={loginForm.phone}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#334155',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              )
            }}
            helperText="जिस नंबर से पहले पंजीयन किया था"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="सुरक्षा पिन (4 अंक) *"
            placeholder="1234"
            type="password"
            fullWidth
            size="small"
            value={loginForm.pin}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            helperText="डिफ़ॉल्ट पिन 1234 (यदि नहीं बदला था)"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || loginForm.phone.length < 10 || loginForm.pin.length < 4}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)' }
            }}
          >
            {loginLoading ? <CircularProgress size={20} color="inherit" /> : '🔑 किसान खाते में प्रवेश करें'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 0.5 }}>
            <Button
              size="small"
              onClick={() => setAuthMode('register')}
              sx={{ color: '#166534', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
            >
              🌾 नया किसान खाता खोलना चाहते हैं? यहां पंजीयन करें
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.5, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
        <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
          शून्य-कागजात • 100% सुरक्षित डेटा • टोल-फ्री: 1800-180-1551
        </Typography>
      </Box>
    </Box>
  );

  // 1. Mandi Rates Pulse Card
  const renderMandiPulseCard = () => {
    const paddyCard = {
      crop: 'धान (सरना/मोटा)',
      rate: `₹${appConfig.paddyScheme.totalRate}`,
      type: 'सरकारी उपार्जन (MSP + बोनस)',
      badge: `₹${appConfig.paddyScheme.totalRate} गारंटी`,
      color: '#1b5e20'
    };

    const liveCards = liveMandiRates.map((item, idx) => ({
      crop: item.crop || 'जिंस',
      rate: `₹${Number(item.modalRate || item.maxRate || 0).toLocaleString('en-IN')}`,
      type: `${item.market || selectedDistrict} मंडी`,
      badge: item.variety ? item.variety : 'APMC लाइव',
      color: idx === 0 ? '#e65100' : idx === 1 ? '#0288d1' : '#2e7d32'
    }));

    const displayRates = [paddyCard, ...liveCards];

    return (
      <Card
        sx={{
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 1.5, px: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#1565c0', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              आज के प्रमुख मंडी भाव (Mandi Pulse)
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            onClick={() => { stopSpeech(); onNavigate('mandi'); }}
            sx={{ color: '#1565c0', fontWeight: 800, fontSize: '0.72rem', p: 0 }}
          >
            सभी 30+ मंडियां
          </Button>
        </Box>

        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1}>
            {displayRates.map((item, idx) => (
              <Grid item xs={6} sm={displayRates.length === 1 ? 12 : 3} md={displayRates.length === 1 ? 12 : 6} key={idx}>
                <Box
                  onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    bgcolor: '#fafafa',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#f0f9ff', borderColor: '#bae6fd' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.76rem' }}>
                      {item.crop.split(' ')[0]}
                    </Typography>
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, bgcolor: `${item.color}15`, color: item.color }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: item.color, fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {item.rate}
                    <Typography component="span" variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', ml: 0.2 }}>
                      /क्विं.
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', display: 'block', mt: 0.2 }}>
                    {item.type.split(' ')[0]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {liveMandiRates.length === 0 && (
            <Box sx={{ mt: 1, p: 0.8, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                🛡️ शून्य गलत डेटा नीति: आज के सत्यापित APMC मंडी भाव देखने हेतु मंडी टैब खोलें।
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    );
  };

  // 2. Platform-Aware Native APK & Share Footer
  const renderApkFooterCard = () => (
    <Card
      sx={{
        p: { xs: 1.8, sm: 2 },
        borderRadius: 3.5,
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d12 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 16px rgba(27,94,32,0.2)',
        border: '1px solid #81c784'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AndroidIcon sx={{ fontSize: 28, color: '#ffeb3b' }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>
                {isNativePlatform() ? 'किसान साथी Android App' : 'किसान साथी Android App (APK)'}
              </Typography>
              <Chip
                label={`v${appConfig.appVersion}`}
                size="small"
                sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.74rem' }}>
              {isNativePlatform() ? 'नवीनतम संस्करण फोन में सक्रिय है' : '1.5 MB लाइटवेट • बिना इंटरनेट चलेगा'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {isNativePlatform() ? (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<WhatsAppIcon />}
                onClick={() => shareOnWhatsApp()}
                sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#128C7E' } }}
              >
                व्हाट्सएप
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={checkingUpdate ? <CircularProgress size={12} color="inherit" /> : <SyncIcon />}
                disabled={checkingUpdate}
                onClick={handleManualCheckUpdate}
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.2, fontSize: '0.75rem' }}
              >
                {checkingUpdate ? 'जांच...' : 'अपडेट जांचें'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<GetAppIcon />}
                href={appConfig.apkDownloadUrl}
                target="_blank"
                download
                sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, borderRadius: 2, px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#fff' } }}
              >
                APK डाउनलोड
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={checkingUpdate ? <CircularProgress size={12} color="inherit" /> : <SyncIcon />}
                disabled={checkingUpdate}
                onClick={handleManualCheckUpdate}
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.2, fontSize: '0.75rem' }}
              >
                {checkingUpdate ? 'जांच...' : 'अपडेट जांचें'}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Card>
  );

  // 3. Public Crop Advisor & Quick Acre Estimator (100% Free & Open, Zero Login Required)
  const renderPublicCropAdvisor = () => {
    const CROP_BENCHMARKS = {
      paddy: {
        name: 'धान (Paddy)',
        rate: appConfig.paddyScheme.totalRate,
        rateLabel: `₹${appConfig.paddyScheme.totalRate}/क्विं. (समर्थन मूल्य + बोनस)`,
        yieldPerAcre: 21,
        dapPerAcre: 50,
        ureaPerAcre: 90,
        potashPerAcre: 30,
        season: 'खरीफ / रबी धान',
        advisory: 'कल्ले फूटते समय 2-3 सेमी पानी बनाए रखें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं।',
        voice: `धान हेतु ₹${appConfig.paddyScheme.totalRate} समर्थन मूल्य गारंटी है। 21 क्विंटल प्रति एकड़ तक सरकारी खरीद होती है।`
      },
      chana: {
        name: 'चना (Gram)',
        rate: 5440,
        rateLabel: '₹5,440/क्विं. (राष्ट्रीय MSP)',
        yieldPerAcre: 10,
        dapPerAcre: 40,
        ureaPerAcre: 15,
        potashPerAcre: 20,
        season: 'रबी दलहन (दलहन विविधीकरण)',
        advisory: 'चने में अधिक यूरिया न डालें। फूल आते समय कभी सिंचाई न करें, केवल घेंटी बनते समय पानी दें।',
        voice: 'चना समर्थन मूल्य ₹5,440 प्रति क्विंटल है। दलहन फसल में अतिरिक्त यूरिया डालने से बचें।'
      },
      wheat: {
        name: 'गेहूं (Wheat)',
        rate: 2425,
        rateLabel: '₹2,425/क्विं. (राष्ट्रीय MSP)',
        yieldPerAcre: 20,
        dapPerAcre: 50,
        ureaPerAcre: 100,
        potashPerAcre: 25,
        season: 'रबी गेहूं',
        advisory: 'बुआई के 21वें दिन ताज जड़ (CRI) अवस्था में पहली सिंचाई अनिवार्य है। पीला रतुआ पर नजर रखें।',
        voice: 'गेहूं का समर्थन मूल्य ₹2,425 प्रति क्विंटल है। 21वें दिन पहली सिंचाई अवश्य करें।'
      },
      maize: {
        name: 'मक्का (Maize)',
        rate: 2225,
        rateLabel: '₹2,225/क्विं. (राष्ट्रीय MSP)',
        yieldPerAcre: 26,
        dapPerAcre: 45,
        ureaPerAcre: 85,
        potashPerAcre: 20,
        season: 'खरीफ / जायद मक्का',
        advisory: 'फॉल आर्मीवर्म कीट के प्रकोप से बचाव हेतु नीम अर्क या अनुशंसित कीटनाशक का गोभ में छिड़काव करें।',
        voice: 'मक्का का समर्थन मूल्य ₹2,225 प्रति क्विंटल है। भुट्टे बनते समय खेत में नमी रखें।'
      },
      tomato: {
        name: 'टमाटर / सब्जी (Tomato)',
        rate: 1500,
        rateLabel: '₹1,500/क्विं. (मंडी औसत दर)',
        yieldPerAcre: 180,
        dapPerAcre: 60,
        ureaPerAcre: 75,
        potashPerAcre: 50,
        season: 'सब्जी नकदी फसल',
        advisory: 'डैम्पिंग ऑफ व पत्ती मरोड़ रोग से बचाव रखें। नियमित तुड़ाई से 3 दिन पहले रासायनिक कीटनाशक न डालें।',
        voice: 'टमाटर नकदी फसल है। फलों की चमक व वजन बढ़ाने हेतु पोटाश का संतुलित छिड़काव करें।'
      }
    };

    const currentCrop = CROP_BENCHMARKS[selectedCropKey] || CROP_BENCHMARKS.paddy;
    const estYield = Math.round(currentCrop.yieldPerAcre * quickAcre * 10) / 10;
    const estIncome = Math.round(estYield * currentCrop.rate);
    const estDap = Math.round(currentCrop.dapPerAcre * quickAcre);
    const estUrea = Math.round(currentCrop.ureaPerAcre * quickAcre);
    const estPotash = Math.round(currentCrop.potashPerAcre * quickAcre);

    return (
      <Card
        sx={{
          p: { xs: 1.8, sm: 2 },
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1.2px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          mb: 2.2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                🌾 त्वरित फसल, खाद व आय सलाहकार (Open Calculator)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                शून्य-लॉगिन • केवल फसल व एकड़ चुनें और तुरंत हिसाब पाएं
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => speakText(`${currentCrop.name} का हिसाब: ${quickAcre} एकड़ में अनुमानित पैदावार ${estYield} क्विंटल और आय लगभग ${estIncome} रुपये होगी। ${currentCrop.voice}`)}
            sx={{ bgcolor: '#f1f8e9', color: '#1b5e20' }}
          >
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 1. Crop Switcher Pills */}
        <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.2, '::-webkit-scrollbar': { display: 'none' } }}>
          {[
            { key: 'paddy', label: '🌾 धान (Paddy)' },
            { key: 'chana', label: '🌱 चना (Gram)' },
            { key: 'wheat', label: '🌾 गेहूं (Wheat)' },
            { key: 'maize', label: '🌽 मक्का (Maize)' },
            { key: 'tomato', label: '🍅 टमाटर / सब्जी' },
          ].map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              clickable
              onClick={() => setSelectedCropKey(c.key)}
              sx={{
                fontWeight: 800,
                fontSize: '0.74rem',
                bgcolor: selectedCropKey === c.key ? '#1b5e20' : '#f1f5f9',
                color: selectedCropKey === c.key ? '#ffffff' : '#334155',
                border: selectedCropKey === c.key ? '1px solid #1b5e20' : '1px solid #e2e8f0',
                '&:hover': { bgcolor: selectedCropKey === c.key ? '#125420' : '#e2e8f0' }
              }}
            />
          ))}
        </Box>

        {/* 2. Acre Quick Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', p: 1, px: 1.5, borderRadius: 2.5, mb: 1.5, border: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>
            रकबा चुनें:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.6 }}>
            {[0.5, 1.0, 2.0, 3.0, 5.0].map((ac) => (
              <Chip
                key={ac}
                label={`${ac} एकड़`}
                size="small"
                clickable
                onClick={() => setQuickAcre(ac)}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 24,
                  bgcolor: quickAcre === ac ? '#2e7d32' : '#ffffff',
                  color: quickAcre === ac ? '#ffffff' : '#475569',
                  border: quickAcre === ac ? '1px solid #2e7d32' : '1px solid #cbd5e1'
                }}
              />
            ))}
          </Box>
        </Box>

        {/* 3. Calculations 4-KPI Grid */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #c8e6c9', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                सरकारी / मंडी दर
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '0.92rem' }}>
                ₹{currentCrop.rate.toLocaleString('en-IN')}<span style={{ fontSize: '0.66rem', fontWeight: 600 }}>/क्विं.</span>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                अनुमानित पैदावार
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#15803d', fontSize: '0.92rem' }}>
                {estYield} क्विंटल
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                अनुमानित आय
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#b45309', fontSize: '0.92rem' }}>
                ₹{estIncome.toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                खाद डोज (DAP/यूरिया)
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.85rem' }}>
                {estDap}k / {estUrea}k
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 4. Advisory Snippet */}
        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
          <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.74rem', lineHeight: 1.4 }}>
            <strong>{currentCrop.season}:</strong> {currentCrop.advisory}
          </Typography>
        </Box>

        {/* 5. Deep Navigation CTA Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => onNavigate('schemes')}
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontSize: '0.74rem', fontWeight: 800, borderRadius: 2, px: 1.5, py: 0.5, flex: 1, '&:hover': { bgcolor: '#1b5e20' } }}
          >
            विस्तृत N:P:K कैलकुलेटर खोलें
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onNavigate('doctor')}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f', fontSize: '0.74rem', fontWeight: 800, borderRadius: 2, px: 1.5, py: 0.5, flex: 1, '&:hover': { bgcolor: '#ffebee' } }}
          >
            फसल रोग जांचें (Doctor)
          </Button>
        </Box>
      </Card>
    );
  };

  // 4. Smart Tools Hub & Farmer Profile Card (Gatekeeper: Public State vs Logged-In State)
  const renderSmartToolsAndFarmerCard = () => (
    <Card
      sx={{
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: activeFarmer ? '1.5px solid #81c784' : '1.5px solid #cbd5e1',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        mb: 2.5
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: activeFarmer ? '#f1f8e9' : '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SensorsIcon sx={{ color: activeFarmer ? '#1b5e20' : '#475569', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: activeFarmer ? '#1b5e20' : '#1e293b', fontSize: '0.9rem' }}>
            {activeFarmer ? '🌾 मेरा किसान कमांड सेंटर' : '📡 स्मार्ट कृषि उपकरण व किसान खाता'}
          </Typography>
        </Box>
        {activeFarmer ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Chip
              label="सक्रिय खाता"
              size="small"
              color="success"
              sx={{ fontWeight: 800, fontSize: '0.66rem', height: 20 }}
            />
            <Button
              size="small"
              startIcon={<LogoutIcon sx={{ fontSize: 13 }} />}
              onClick={handleFarmerLogout}
              sx={{ color: '#d32f2f', fontWeight: 800, fontSize: '0.7rem', p: 0.2 }}
            >
              लॉगआउट
            </Button>
          </Box>
        ) : (
          <Button
            size="small"
            variant="contained"
            startIcon={<LockOpenIcon sx={{ fontSize: 14 }} />}
            onClick={() => setOpenQuickLogin(true)}
            sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2, px: 1.2, py: 0.3 }}
          >
            1-क्लिक लॉगिन
          </Button>
        )}
      </Box>

      {/* Body Content */}
      <Box sx={{ p: 1.8 }}>
        {activeFarmer ? (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                  {activeFarmer.name || 'किसान साथी'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  ग्राम: {activeFarmer.village || 'पंजीकृत'} • {activeFarmer.totalAcres || activeFarmer.totalLandAcres || '3.0'} एकड़ भूमि
                </Typography>
              </Box>
              <Chip
                label={`${farmerPlots.length || 1} खेत सक्रिय`}
                size="small"
                sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem' }}
              />
            </Box>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 1.5, py: 0.5, borderRadius: 2, fontSize: '0.76rem', border: '1px solid #bfdbfe' }}>
            🔒 <strong>व्यक्तिगत टूल्स:</strong> मोटर कंट्रोल व फसल डायरी के सुरक्षित उपयोग हेतु केवल मोबाइल नंबर से लॉगिन करें।
          </Alert>
        )}

        {/* 4 Smart Hardware & Private Tools Grid */}
        <Grid container spacing={1}>
          {/* Tool 1: Motor */}
          <Grid item xs={6}>
            <Box
              onClick={() => handleRequireLogin('motor')}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#e0f2fe', borderColor: '#7dd3fc' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 20 }} />
                <Chip
                  label={activeFarmer ? 'कंट्रोल' : '🔒 लॉगिन'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: activeFarmer ? '#e0f2fe' : '#f1f5f9',
                    color: activeFarmer ? '#0288d1' : '#64748b'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.76rem' }}>
                ट्यूबवेल मोटर
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                GSM स्टार्टर रिमोट
              </Typography>
            </Box>
          </Grid>

          {/* Tool 2: Mera Khet & Diary */}
          <Grid item xs={6}>
            <Box
              onClick={() => handleRequireLogin('khet')}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#f0fdf4', borderColor: '#86efac' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <MenuBookIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                <Chip
                  label={activeFarmer ? 'डायरी' : '🔒 लॉगिन'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: activeFarmer ? '#dcfce7' : '#f1f5f9',
                    color: activeFarmer ? '#15803d' : '#64748b'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.76rem' }}>
                मेरा खेत व डायरी
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                फसल व खर्च रिकॉर्ड
              </Typography>
            </Box>
          </Grid>

          {/* Tool 3: Soil IoT */}
          <Grid item xs={6}>
            <Box
              onClick={() => handleRequireLogin('soil')}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#f0fdfa', borderColor: '#99f6e4' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <ScienceIcon sx={{ color: '#00796b', fontSize: 20 }} />
                <Chip
                  label={activeFarmer ? 'जांचें' : '🔒 लॉगिन'}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: activeFarmer ? '#ccfbf1' : '#f1f5f9',
                    color: activeFarmer ? '#0f766e' : '#64748b'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.76rem' }}>
                मिट्टी सेंसर (IoT)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                pH व NPK प्रोब
              </Typography>
            </Box>
          </Grid>

          {/* Tool 4: Field GPS (Always Open!) */}
          <Grid item xs={6}>
            <Box
              onClick={() => setOpenGpsTracker(true)}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#fef3c7', borderColor: '#fde68a' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <DirectionsWalkIcon sx={{ color: '#d97706', fontSize: 20 }} />
                <Chip
                  label="⚡ खुला"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: '#fef3c7',
                    color: '#b45309'
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.76rem' }}>
                खेत GPS मापक
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                मेड़ों पर चलकर नापें
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );

  // 5. Guest / Public Showcase Landing Page (When !activeFarmer)
  const renderGuestLandingPage = () => (
    <>
      {/* 1. Hero Showcase Section & Registration/Login Card */}
      <Card
        sx={{
          mb: 3.5,
          p: { xs: 2.2, sm: 3, md: 3.8 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #1b5e20 100%)',
          color: '#fff',
          boxShadow: '0 12px 32px rgba(27, 94, 32, 0.2)',
          border: '1px solid rgba(255,255,255,0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={{ xs: 2.5, md: 4 }} alignItems="center">
          {/* Left Column: Brand & Value Highlights */}
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<AgricultureIcon sx={{ color: '#1b5e20 !important', fontSize: '18px !important' }} />}
                label="छत्तीसगढ़ शासन एवं राष्ट्रीय कृषि मंच"
                sx={{
                  bgcolor: '#ffeb3b',
                  color: '#1b5e20',
                  fontWeight: 800,
                  fontSize: { xs: '0.72rem', sm: '0.78rem' },
                  height: 28,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              />
              <Chip
                label="100% निःशुल्क खुला किसान पोर्टल"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 28,
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.5rem' },
                lineHeight: 1.18,
                letterSpacing: '-0.02em',
                mb: 1.5
              }}
            >
              किसान साथी
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  color: '#ffeb3b',
                  fontSize: { xs: '1.15rem', sm: '1.4rem', md: '1.65rem' },
                  fontWeight: 800,
                  mt: 0.5
                }}
              >
                फसल से लेकर बिक्री तक का संपूर्ण डिजिटल साथी
              </Typography>
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#e8f5e9',
                fontSize: { xs: '0.88rem', sm: '0.96rem' },
                lineHeight: 1.6,
                mb: 2.5,
                maxWidth: 620
              }}
            >
              भारतीय किसानों का आधुनिक कृषि केंद्र — सही वैज्ञानिक खाद, 3-दिवसीय मौसम व स्प्रे एडवाइजरी,
              AI फसल डॉक्टर, लाइव APMC मंडी भाव, ₹3,100 धान उपार्जन और मोबाइल ट्यूबवेल मोटर कंट्रोल।
            </Typography>

            {/* 4 Value Pills */}
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.18)' }}>
                  <Box sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 900, fontSize: '0.9rem' }}>
                    ₹
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#fff', lineHeight: 1.2 }}>
                      ₹3,100/क्विं. धान उपार्जन
                    </Typography>
                    <Typography sx={{ color: '#dcedc8', fontSize: '0.72rem' }}>
                      कृषक उन्नति योजना (21 क्विं./एकड़)
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.18)' }}>
                  <Box sx={{ bgcolor: '#ff5252', color: '#fff', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MedicalServicesIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#fff', lineHeight: 1.2 }}>
                      AI फसल डॉक्टर
                    </Typography>
                    <Typography sx={{ color: '#dcedc8', fontSize: '0.72rem' }}>
                      पत्ती फोटो से तुरंत बीमारी व दवा
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.18)' }}>
                  <Box sx={{ bgcolor: '#4fc3f7', color: '#01579b', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PowerSettingsNewIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#fff', lineHeight: 1.2 }}>
                      ट्यूबवेल मोटर रिमोट
                    </Typography>
                    <Typography sx={{ color: '#dcedc8', fontSize: '0.72rem' }}>
                      घर बैठे फोन से मोटर ऑन/ऑफ
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.18)' }}>
                  <Box sx={{ bgcolor: '#ffd54f', color: '#e65100', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUpIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#fff', lineHeight: 1.2 }}>
                      लाइव APMC मंडी भाव
                    </Typography>
                    <Typography sx={{ color: '#dcedc8', fontSize: '0.72rem' }}>
                      30+ मंडियों के आज के ताज़ा रेट
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Trust Footnotes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', pt: 1.2, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
              <Typography variant="caption" sx={{ color: '#f1f8e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 15, color: '#ffeb3b' }} />
                बिना किसी सरकारी कागजात या खसरा के
              </Typography>
              <Typography variant="caption" sx={{ color: '#f1f8e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 15, color: '#ffeb3b' }} />
                100% सुरक्षित व निजी डेटा
              </Typography>
              <Typography variant="caption" sx={{ color: '#f1f8e9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 15, color: '#ffeb3b' }} />
                टोल-फ्री हेल्पलाइन: 1800-180-1551
              </Typography>
            </Box>
          </Grid>

          {/* Right Column: Direct Registration & Login Card */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={10}
              sx={{
                p: { xs: 2.2, sm: 2.8 },
                borderRadius: 4,
                bgcolor: '#ffffff',
                color: '#0f172a',
                border: '1.8px solid #a5d6a7',
                boxShadow: '0 20px 45px -10px rgba(27, 94, 32, 0.22), 0 8px 16px -6px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 5,
                  background: 'linear-gradient(90deg, #1b5e20 0%, #43a047 50%, #ffd54f 100%)'
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2, mt: 0.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #a5d6a7', flexShrink: 0 }}>
                  <LockOpenIcon sx={{ color: '#1b5e20', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.2 }}>
                    किसान साथी डिजिटल सेवा
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                    पंजीयन करें या सीधे लॉगिन करें
                  </Typography>
                </Box>
              </Box>

              {renderSmartAuthCard(false)}
            </Paper>
          </Grid>
        </Grid>
      </Card>

      {/* 2. 6-Feature Showcase Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip
            label="✨ प्रमुख सुविधाएं व टूल्स"
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.76rem', mb: 1, border: '1px solid #c8e6c9' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.1rem' } }}>
            किसान साथी की 6 प्रमुख डिजिटल सेवाएं
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: { xs: '0.82rem', sm: '0.92rem' }, maxWidth: 700, mx: 'auto', mt: 0.5 }}>
            लॉगिन करते ही आपके मोबाइल पर अनलॉक होते हैं ये सभी आधुनिक टूल्स:
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Feature 1: Crop Doctor */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 2.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1.2px solid #ffcdd2',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(211,47,47,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MedicalServicesIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
                </Box>
                <Chip label="AI संचालित" size="small" sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', mb: 0.8 }}>
                🌾 AI फसल डॉक्टर व रोग निदान
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                पत्ती या तने की फोटो खींचते ही Google AI सेकंडों में कीट, उकठा, झुलसा की पहचान कर 15L पंप की दवा खुराक बताता है।
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, fontSize: '0.74rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                  <span>खेत में सीधे कैमरा से लाइव फोटो पहचान</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                  <span>15 लीटर स्प्रे पंप की सटीक रासायनिक खुराक</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                  <span>कमजोर नेटवर्क पर ऑफलाइन फोटो सिंक</span>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onNavigate('doctor')}
                sx={{ borderColor: '#d32f2f', color: '#d32f2f', fontWeight: 800, borderRadius: 2, py: 0.6, fontSize: '0.76rem', '&:hover': { bgcolor: '#ffebee' } }}
              >
                फसल डॉक्टर खोलें
              </Button>
            </Card>
          </Grid>

          {/* Feature 2: Mandi Pulse */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 2.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1.2px solid #bbdefb',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(25,118,210,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StorefrontIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                </Box>
                <Chip label="30+ मंडियां लाइव" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', mb: 0.8 }}>
                📈 लाइव APMC मंडी भाव व ₹3,100 धान
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                राज्य की सभी 30+ मंडियों के न्यूनतम, अधिकतम व मॉडल भाव। Agmarknet सत्यापित लाइव डेटा और ₹3,100 समर्थन मूल्य गाइड।
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, fontSize: '0.74rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#1976d2' }} />
                  <span>धान, चना, गेहूं, मक्का व सब्जियों के लाइव रेट</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#1976d2' }} />
                  <span>₹3,100 कृषक उन्नति योजना व 21 क्विंटल कोटा</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#1976d2' }} />
                  <span>खेत से सीधे खरीदारों व व्यापारियों से संपर्क</span>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onNavigate('mandi')}
                sx={{ borderColor: '#1976d2', color: '#1976d2', fontWeight: 800, borderRadius: 2, py: 0.6, fontSize: '0.76rem', '&:hover': { bgcolor: '#e3f2fd' } }}
              >
                मंडी भाव देखें
              </Button>
            </Card>
          </Grid>

          {/* Feature 3: Fertilizer Calc */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 2.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1.2px solid #c8e6c9',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(46,125,50,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalculateIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                </Box>
                <Chip label="सटीक N:P:K" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', mb: 0.8 }}>
                🧪 वैज्ञानिक खाद कैलकुलेटर
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                एकड़ और फसल के अनुसार यूरिया, DAP, SSP और पोटाश का सही वजन व सही समय पर छिड़काव की वैज्ञानिक खुराक।
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, fontSize: '0.74rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                  <span>धान, चना, गेहूं, मक्का हेतु वैज्ञानिक N:P:K नाप</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                  <span>बुआई, कल्ले फूटने व बाली आने पर 3-चरण खुराक</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#2e7d32' }} />
                  <span>अतिरिक्त खाद के अनावश्यक खर्च से पूरी बचत</span>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onNavigate('schemes')}
                sx={{ borderColor: '#2e7d32', color: '#2e7d32', fontWeight: 800, borderRadius: 2, py: 0.6, fontSize: '0.76rem', '&:hover': { bgcolor: '#e8f5e9' } }}
              >
                खाद कैलकुलेटर खोलें
              </Button>
            </Card>
          </Grid>

          {/* Feature 4: Weather & Spray Guard */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 2.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1.2px solid #b2dfdb',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,121,107,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#e0f2f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WaterDropIcon sx={{ color: '#00796b', fontSize: 24 }} />
                </Box>
                <Chip label="ओपन-मेटियो लाइव" size="small" sx={{ bgcolor: '#e0f2f1', color: '#00796b', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', mb: 0.8 }}>
                🌦️ मौसम रक्षक व स्प्रे एडवाइजरी
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                तापमान, हवा की गति, बारिश की संभावना और क्या आज कीटनाशक छिड़काव अनुकूल है या दवा बहने का खतरा है—सटीक अलर्ट।
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, fontSize: '0.74rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#00796b' }} />
                  <span>आपके जिले का 3-दिवसीय मौसम पूर्वानुमान</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#00796b' }} />
                  <span>तेज हवा/वर्षा में कीटनाशक छिड़काव रोक चेतावनी</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#00796b' }} />
                  <span>पूरी मौसम सलाह हिंदी में बोलकर सुनने की सुविधा</span>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleReadAdvisory}
                sx={{ borderColor: '#00796b', color: '#00796b', fontWeight: 800, borderRadius: 2, py: 0.6, fontSize: '0.76rem', '&:hover': { bgcolor: '#e0f2f1' } }}
              >
                🔊 आज की मौसम सलाह सुनें
              </Button>
            </Card>
          </Grid>

          {/* Feature 5: Smart Motor Controller */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 2.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1.2px solid #b3e5fc',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(2,136,209,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#e1f5fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 24 }} />
                </Box>
                <Chip label="GSM व इंटरनेट" size="small" sx={{ bgcolor: '#e1f5fe', color: '#0288d1', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', mb: 0.8 }}>
                ⚡ ट्यूबवेल मोटर स्टार्टर रिमोट
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                घर बैठे या दूर खेत से मोबाइल कॉल या SMS से बोरवेल मोटर चालू व बंद करें। 3-फेज बिजली व वोल्टेज अलर्ट पाएं।
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, fontSize: '0.74rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#0288d1' }} />
                  <span>बिना इंटरनेट के फोन कॉल या SMS से मोटर ऑन/ऑफ</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#0288d1' }} />
                  <span>3-फेज बिजली उपलब्धता व वोल्टेज गिरावट अलर्ट</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#0288d1' }} />
                  <span>रात में खेत जाने के जोखिम व बिजली बर्बादी से मुक्ति</span>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleRequireLogin('motor')}
                sx={{ borderColor: '#0288d1', color: '#0288d1', fontWeight: 800, borderRadius: 2, py: 0.6, fontSize: '0.76rem', '&:hover': { bgcolor: '#e1f5fe' } }}
              >
                🔒 मोटर रिमोट (लॉगिन करें)
              </Button>
            </Card>
          </Grid>

          {/* Feature 6: Field GPS Tracker & Diary */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                p: 2.2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1.2px solid #fde68a',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(217,119,6,0.12)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DirectionsWalkIcon sx={{ color: '#d97706', fontSize: 24 }} />
                </Box>
                <Chip label="मेड़ों पर नापें" size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1rem', mb: 0.8 }}>
                🗺️ खेत GPS मापक व किसान डायरी
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.5, mb: 1.5, flex: 1 }}>
                खेत की चारों मेड़ों पर चलकर सैटेलाइट GPS से वास्तविक एकड़, डिसमिल व मीटर नापें। खाद, बीज व मजदूरी का बहीखाता रखें।
              </Typography>
              <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2, mb: 1.5, fontSize: '0.74rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#d97706' }} />
                  <span>खेत के कोनों पर चलकर सैटेलाइट GPS से सटीक नाप</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#d97706' }} />
                  <span>बीज, खाद, मजदूरी व कटाई खर्चों का सुरक्षित रिकॉर्ड</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#d97706' }} />
                  <span>KCC ऋण हेतु बैंक-मान्य पीडीएफ रिपोर्ट तैयार करें</span>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenGpsTracker(true)}
                sx={{ borderColor: '#d97706', color: '#d97706', fontWeight: 800, borderRadius: 2, py: 0.6, fontSize: '0.76rem', '&:hover': { bgcolor: '#fef3c7' } }}
              >
                खेत GPS मापक खोलें (खुला टूल)
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* 3. Government Scheme & Helpline Trust Strip */}
      <Card
        sx={{
          mb: 3.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3.5,
          bgcolor: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: '#e8f5e9', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MonetizationOnIcon sx={{ color: '#1b5e20', fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                  धान ₹3,100 समर्थन मूल्य
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  कृषक उन्नति योजना • 21 क्विंटल/एकड़
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CampaignIcon sx={{ color: '#1565c0', fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                  टोकन तुंहर हाथ पोर्टल
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  उपार्जन केंद्र हेतु घर बैठे ऑनलाइन टोकन
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ bgcolor: '#fff3e0', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VerifiedIcon sx={{ color: '#e65100', fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                  किसान हेल्पलाइन 1800-180-1551
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  24x7 राष्ट्रीय टोल-फ्री कृषि परामर्श
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* 4. Native APK & Share Footer */}
      {renderApkFooterCard()}
    </>
  );

  // 6. Logged-In Farmer Command Center Dashboard (When activeFarmer is present)
  const renderFarmerDashboard = () => (
    <>
      {/* 1. Modern Hero Greeting & Profile Card */}
      <Card
        sx={{
          mb: 2,
          p: { xs: 1.8, sm: 2.2 },
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(27, 94, 32, 0.16)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}
            >
              <AgricultureIcon sx={{ fontSize: 28, color: '#ffeb3b' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' }, lineHeight: 1.2 }}>
                {activeFarmer?.name ? `नमस्ते, ${activeFarmer.name} जी` : 'नमस्ते, किसान साथी'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                <span>📍 {activeFarmer?.village ? `${activeFarmer.village}, ` : ''}{selectedDistrict}</span>
                <span>•</span>
                <span style={{ color: '#ffeb3b', fontWeight: 700 }}>
                  {activeFarmer ? `${activeFarmer.totalAcres || activeFarmer.totalLandAcres || '3.0'} एकड़ पंजीकृत` : 'सार्वजनिक कृषि सेवा (खुला पोर्टल)'}
                </span>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{
                bgcolor: '#ffeb3b',
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: 3,
                px: 1.8,
                py: 0.6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#fff' }
              }}
            >
              🌾 मेरा खेत
            </Button>
            <IconButton
              size="small"
              title="लॉगआउट"
              onClick={handleFarmerLogout}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Ticker Notice Inside Hero */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.2,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#f1f8e9',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CampaignIcon sx={{ fontSize: 16, color: '#ffeb3b' }} />
            <span><strong>एग्री-स्टैक / किसान रजिस्ट्री:</strong> ₹3,100 समर्थन मूल्य उपार्जन हेतु अनिवार्य</span>
          </Box>
          <Chip
            label="योजना देखें"
            size="small"
            onClick={() => onNavigate('schemes')}
            sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
          />
        </Box>
      </Card>

      {/* 2. App Update Alert Banner (if update ready) */}
      {updateInfo?.hasUpdate && (
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            px: 1.8,
            mb: 2,
            borderRadius: 3,
            bgcolor: '#e8f5e9',
            border: '1.5px solid #4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SystemUpdateIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.84rem' }}>
                🎉 नया अपडेट उपलब्ध है (v{updateInfo.latestVersion})!
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem' }}>
                नया APK इंस्टॉल करें • पुराना डेटा सुरक्षित रहेगा
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<GetAppIcon sx={{ fontSize: 14 }} />}
            href={updateInfo.downloadUrl}
            target="_blank"
            download
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, fontSize: '0.74rem', borderRadius: 2, px: 1.5, py: 0.5 }}
          >
            अभी अपडेट करें
          </Button>
        </Paper>
      )}

      {/* Responsive 2-Column Agritech Command Center Layout on Desktop */}
      <Grid container spacing={{ xs: 2, md: 2.5, lg: 3 }}>
        {/* Left / Main Column (xs=12, md=8) */}
        <Grid item xs={12} md={8}>
          {/* Official Department Emergency Broadcast Banner */}
          {activeBroadcasts && activeBroadcasts.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2,
                mb: 2,
                borderRadius: 3,
                bgcolor: activeBroadcasts[0].severity === 'urgent' ? '#fff1f2' : activeBroadcasts[0].severity === 'warning' ? '#fffbeb' : '#eff6ff',
                border: `1.5px solid ${activeBroadcasts[0].severity === 'urgent' ? '#fda4af' : activeBroadcasts[0].severity === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CampaignIcon sx={{ color: activeBroadcasts[0].severity === 'urgent' ? '#e11d48' : activeBroadcasts[0].severity === 'warning' ? '#d97706' : '#2563eb', fontSize: 24 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    📢 {activeBroadcasts[0].title}
                  </Typography>
                  <Chip
                    label={activeBroadcasts[0].severity === 'urgent' ? 'अति गंभीर चेतावनी' : activeBroadcasts[0].severity === 'warning' ? 'विभागीय चेतावनी' : 'कृषि परामर्श'}
                    size="small"
                    color={activeBroadcasts[0].severity === 'urgent' ? 'error' : activeBroadcasts[0].severity === 'warning' ? 'warning' : 'primary'}
                    sx={{ fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => speakText(`${activeBroadcasts[0].title}। ${activeBroadcasts[0].message}`)}
                  sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: '#0f172a' }}
                >
                  <VolumeUpIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', lineHeight: 1.4 }}>
                {activeBroadcasts[0].message}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                <span>जारीकर्ता: {activeBroadcasts[0].author || 'कृषि विशेषज्ञ'}</span>
                <span>वैधता: {activeBroadcasts[0].validTill || 'सक्रिय'}</span>
              </Box>
            </Paper>
          )}

          {/* Floating Weather & Spray Card */}
          <Card
            sx={{
              mb: 2.2,
              p: 2,
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            {/* Top Row: Temp, Condition, Spray Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontSize: '2.2rem', lineHeight: 1 }}>
                  {weather?.conditionIcon || '🌤️'}
                </Typography>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                      {weather ? `${weather.temp}°` : '29°'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
                      {weather ? weather.conditionText : 'साफ मौसम'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                    📍 {selectedDistrict} {weather?.isLive ? '• लाइव मौसम' : '• सुरक्षित डेटा'}
                  </Typography>
                </Box>
              </Box>

              {/* Spray Safety Badge & Voice button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Chip
                  label={weather?.sprayAdvisory?.badge || 'छिड़काव अनुकूल'}
                  size="small"
                  sx={{
                    bgcolor: weather?.sprayAdvisory?.canSpray ? '#e8f5e9' : '#fff3e0',
                    color: weather?.sprayAdvisory?.canSpray ? '#1b5e20' : '#e65100',
                    border: weather?.sprayAdvisory?.canSpray ? '1px solid #a5d6a7' : '1px solid #ffcc80',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    height: 26
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleReadAdvisory}
                  sx={{ bgcolor: '#f1f5f9', color: '#1b5e20', p: 0.6 }}
                >
                  <VolumeUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Metrics Strip */}
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              <Grid item xs={4}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    <WaterDropIcon sx={{ fontSize: 13, color: '#0288d1' }} /> वर्षा
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.rainProbability}%` : '10%'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    <AirIcon sx={{ fontSize: 13, color: '#00897b' }} /> हवा
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.windSpeed} km/h` : '10 km/h'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    💧 आर्द्रता
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.humidity}%` : '62%'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Advisory line */}
            <Box sx={{ p: 1.2, bgcolor: '#f1f8e9', borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 1.5, border: '1px solid #dcedc8' }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.76rem', lineHeight: 1.35, fontWeight: 600 }}>
                {weather?.sprayAdvisory?.advisory || 'धान में कल्ले और बालियां आते समय खेत में 2-3 सेमी जलस्तर रखें। शांत मौसम में कीटनाशक छिड़काव करें।'}
              </Typography>
            </Box>

            {/* Compact 3-Day Forecast Strip */}
            {weather?.forecast3Days && (
              <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: '#2e7d32' }} /> 3-दिवसीय मौसम अनुमान:
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {weather.forecast3Days.map((f, idx) => (
                    <Grid item xs={4} key={idx}>
                      <Box sx={{ p: 0.8, bgcolor: idx === 0 ? '#e8f5e9' : '#fafafa', borderRadius: 2, textAlign: 'center', border: idx === 0 ? '1px solid #c8e6c9' : '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: idx === 0 ? '#1b5e20' : '#64748b', fontSize: '0.7rem', display: 'block' }}>
                          {f.day.split(' ')[0]}
                        </Typography>
                        <Typography sx={{ fontSize: '1.1rem', my: 0.2 }}>{f.icon}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem', display: 'block' }}>
                          {f.tempMax}° / {f.tempMin}°
                        </Typography>
                        <Typography variant="caption" sx={{ color: f.rainProb > 40 ? '#d32f2f' : '#0288d1', fontSize: '0.64rem', fontWeight: 700 }}>
                          वर्षा {f.rainProb}%
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Card>

          {/* Public Crop Advisor & Quick Acre Estimator */}
          {renderPublicCropAdvisor()}

          {/* Mandi Rates Pulse (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.5 }}>
            {renderMandiPulseCard()}
          </Box>

          {/* Smart Hardware & Farmer Hub (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.5 }}>
            {renderSmartToolsAndFarmerCard()}
          </Box>

          {/* Unified 8-Tile Modern App Launcher Grid */}
          <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              ⚡ मुख्य कृषि सेवाएं व स्मार्ट टूल्स
            </Typography>
            <Chip
              icon={<SensorsIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
              label="📡 डिवाइस हब"
              clickable
              size="small"
              onClick={() => {
                stopSpeech();
                handleRequireLogin('hub');
              }}
              sx={{
                bgcolor: '#e8f5e9',
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: '6px',
                border: '1px solid #c8e6c9',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#c8e6c9' }
              }}
            />
          </Box>

          <Card
            sx={{
              p: { xs: 1.2, sm: 1.8 },
              mb: 3,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
            }}
          >
            <Grid container spacing={{ xs: 1, sm: 1.5 }}>
              {[
                {
                  title: 'फसल डॉक्टर',
                  icon: <MedicalServicesIcon sx={{ color: '#d32f2f', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#ffebee',
                  border: '#ffcdd2',
                  badge: 'AI',
                  badgeBg: '#d32f2f',
                  action: () => onNavigate('doctor')
                },
                {
                  title: 'खाद कैलकु.',
                  icon: <CalculateIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e8f5e9',
                  border: '#c8e6c9',
                  badge: 'NPK',
                  badgeBg: '#2e7d32',
                  action: () => onNavigate('schemes')
                },
                {
                  title: 'मंडी भाव',
                  icon: <StorefrontIcon sx={{ color: '#1976d2', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e3f2fd',
                  border: '#bbdefb',
                  badge: 'लाइव',
                  badgeBg: '#1976d2',
                  action: () => onNavigate('mandi')
                },
                {
                  title: 'धान योजना',
                  icon: <MonetizationOnIcon sx={{ color: '#f57f17', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#fff8e1',
                  border: '#ffe082',
                  badge: '₹3,100',
                  badgeBg: '#e65100',
                  action: () => onNavigate('schemes')
                },
                {
                  title: 'खेत GPS',
                  icon: <DirectionsWalkIcon sx={{ color: '#00897b', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e0f2f1',
                  border: '#b2dfdb',
                  badge: 'GPS',
                  badgeBg: '#00897b',
                  action: () => setOpenGpsTracker(true)
                },
                {
                  title: 'ट्यूबवेल मोटर',
                  icon: <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e1f5fe',
                  border: '#b3e5fc',
                  badge: activeFarmer ? 'IoT' : '🔒',
                  badgeBg: activeFarmer ? '#0288d1' : '#64748b',
                  action: () => handleRequireLogin('motor')
                },
                {
                  title: 'मिट्टी सेंसर',
                  icon: <ScienceIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e8f5e9',
                  border: '#c8e6c9',
                  badge: activeFarmer ? 'सेंसर' : '🔒',
                  badgeBg: activeFarmer ? '#1b5e20' : '#64748b',
                  action: () => handleRequireLogin('soil')
                },
                {
                  title: 'किसान डायरी',
                  icon: <MenuBookIcon sx={{ color: '#7b1fa2', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#f3e5f5',
                  border: '#e1bee7',
                  badge: activeFarmer ? 'खाता' : '🔒',
                  badgeBg: activeFarmer ? '#7b1fa2' : '#64748b',
                  action: () => handleRequireLogin('khet')
                }
              ].map((tool, idx) => (
                <Grid item xs={3} sm={3} md={3} lg={1.5} key={idx}>
                  <Box
                    className="touch-card"
                    onClick={() => { stopSpeech(); tool.action(); }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      py: { xs: 0.6, sm: 1 },
                      px: 0.3,
                      borderRadius: '12px',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        bgcolor: '#f8fafc',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'scale(0.94)'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', mb: 0.8 }}>
                      <Box
                        sx={{
                          bgcolor: tool.bg,
                          width: { xs: 46, sm: 52 },
                          height: { xs: 46, sm: 52 },
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${tool.border}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        {tool.icon}
                      </Box>
                      {tool.badge && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            bgcolor: tool.badgeBg,
                            color: '#ffffff',
                            fontSize: { xs: '0.54rem', sm: '0.6rem' },
                            fontWeight: 800,
                            px: 0.6,
                            py: 0.1,
                            borderRadius: '6px',
                            border: '1.5px solid #ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tool.badge}
                        </Box>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.74rem', sm: '0.8rem' },
                        color: '#0f172a',
                        lineHeight: 1.25,
                        textAlign: 'center',
                        minHeight: { xs: 28, sm: 30 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        wordBreak: 'break-word'
                      }}
                    >
                      {tool.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>

          {/* Interactive 6-Stage Agricultural Lifecycle Stepper */}
          <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              🌱 फसल से लेकर बिक्री तक (6 चरणीय कृषि यात्रा)
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
              चरण चुनें व जानें
            </Typography>
          </Box>

          {/* Dropdown Selector */}
          <Box sx={{ mb: 1.5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="🌱 कृषि यात्रा चरण चुनें (Select Lifecycle Stage)"
              value={expandedStep}
              onChange={(e) => {
                stopSpeech();
                setExpandedStep(Number(e.target.value));
              }}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 2.5,
                '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
              }}
            >
              {LIFECYCLE_STEPS.map((item) => (
                <MenuItem key={item.step} value={item.step}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {item.step}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.tag}
                      size="small"
                      sx={{
                        ml: 'auto',
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: `${item.color}15`,
                        color: item.color
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Focused Active Stage Card */}
          {(() => {
            const currentStep = LIFECYCLE_STEPS.find((s) => s.step === expandedStep) || LIFECYCLE_STEPS[0];
            return (
              <Card
                sx={{
                  mb: 2.5,
                  p: 2,
                  borderRadius: 3.5,
                  bgcolor: '#ffffff',
                  border: `1.5px solid ${currentStep.color}30`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: currentStep.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      {currentStep.step}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: currentStep.color, fontSize: '0.92rem' }}>
                        {currentStep.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        {currentStep.short}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={currentStep.tag}
                    size="small"
                    sx={{ bgcolor: `${currentStep.color}15`, color: currentStep.color, fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.84rem', lineHeight: 1.6, mb: 1.5 }}>
                  {currentStep.desc}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => handleReadStep(e, currentStep)}
                    sx={{
                      color: currentStep.color,
                      bgcolor: `${currentStep.color}12`,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.4,
                      '&:hover': { bgcolor: `${currentStep.color}25` }
                    }}
                  >
                    आवाज में सुनें
                  </Button>

                  {currentStep.step === 3 && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { stopSpeech(); onNavigate('schemes'); }}
                      sx={{ color: '#2e7d32', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      खाद कैलकुलेटर खोलें
                    </Button>
                  )}
                  {currentStep.step === 4 && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { stopSpeech(); onNavigate('doctor'); }}
                      sx={{ color: '#c62828', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      फसल डॉक्टर खोलें
                    </Button>
                  )}
                  {currentStep.step === 6 && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                      sx={{ color: '#1565c0', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      मंडी भाव देखें
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })()}

          {/* Platform APK & Share Footer (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
            {renderApkFooterCard()}
          </Box>
        </Grid>

        {/* Right / Sidebar Column (Desktop Command Center: md and up) */}
        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 1. Mandi Rates Pulse Widget */}
            {renderMandiPulseCard()}

            {/* 2. Smart Tools Hub & Farmer Command Card */}
            {renderSmartToolsAndFarmerCard()}

            {/* 3. Platform APK & Share Card */}
            {renderApkFooterCard()}
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {!activeFarmer ? renderGuestLandingPage() : renderFarmerDashboard()}

      {/* Modals & Dialogs */}
      <MeraKhetModal
        open={openMeraKhet}
        onClose={() => setOpenMeraKhet(false)}
        selectedDistrict={selectedDistrict}
        weatherContext={weather}
      />

      <FieldGpsTrackerModal
        open={openGpsTracker}
        onClose={() => setOpenGpsTracker(false)}
        onSaveArea={() => setOpenMeraKhet(true)}
      />

      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        onApplyToCalculator={() => onNavigate('schemes')}
      />

      <MotorControllerModal
        open={openMotorModal}
        onClose={() => setOpenMotorModal(false)}
        weatherContext={weather}
      />

      <DeviceHubModal
        open={openDeviceHub}
        onClose={() => setOpenDeviceHub(false)}
        onOpenGpsTracker={() => setOpenGpsTracker(true)}
        onOpenSoilIot={() => setOpenSoilIot(true)}
        onOpenMotorModal={() => setOpenMotorModal(true)}
        onApplySoilToCalc={() => onNavigate('schemes')}
      />

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Quick Farmer Login & Registration Modal (Zero Friction, Public First) */}
      <Dialog
        open={openQuickLogin}
        onClose={() => { if (!loginLoading) setOpenQuickLogin(false); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockOpenIcon sx={{ color: '#2e7d32' }} />
            <span>किसान साथी प्रवेश</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenQuickLogin(false)} disabled={loginLoading}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {renderSmartAuthCard(true)}
        </DialogContent>
      </Dialog>

      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: updateInfo?.hasUpdate ? '#2e7d32' : '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}>
          {updateInfo?.hasUpdate ? <SystemUpdateIcon /> : <CheckCircleIcon />}
          {updateInfo?.hasUpdate ? 'नया अपडेट उपलब्ध है!' : 'ऐप पूरी तरह अपडेटेड है'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {updateInfo?.hasUpdate ? (
            <Box>
              <Typography variant="body2" sx={{ color: '#263238', fontWeight: 600, mb: 1 }}>
                किसान साथी का नवीनतम संस्करण <strong>v{updateInfo.latestVersion}</strong> डाउनलोड के लिए तैयार है।
              </Typography>
              <Box sx={{ bgcolor: '#f1f8e9', p: 1.5, borderRadius: 2, mb: 1.5, border: '1px solid #c8e6c9' }}>
                <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block' }}>
                  • आपका वर्तमान वर्ज़न: v{updateInfo.currentVersion}
                </Typography>
                <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block' }}>
                  • नया उपलब्ध वर्ज़न: v{updateInfo.latestVersion}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#546e7a', display: 'block', mb: 1 }}>
                * नोट: अपडेट करने पर आपका पुराना खाता, खेत व किसान डायरी का रिकॉर्ड बिल्कुल सुरक्षित रहेगा।
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1b5e20', mb: 0.5 }}>
                आप पहले से ही नवीनतम संस्करण (v{updateInfo?.currentVersion || appConfig.appVersion}) का उपयोग कर रहे हैं।
              </Typography>
              <Typography variant="caption" sx={{ color: '#546e7a' }}>
                सभी कृषि योजनाएं, मौसम अलर्ट और मंडी भाव नवीनतम स्थिति में हैं।
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          {updateInfo?.hasUpdate ? (
            <>
              <Button onClick={() => setUpdateDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700 }}>
                बाद में
              </Button>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                href={updateInfo.downloadUrl}
                target="_blank"
                download
                sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, borderRadius: 2 }}
              >
                अपडेट डाउनलोड करें
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setUpdateDialogOpen(false)}
              sx={{ bgcolor: '#1565c0', color: '#fff', fontWeight: 700, borderRadius: 2, mx: 'auto' }}
            >
              ठीक है
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
