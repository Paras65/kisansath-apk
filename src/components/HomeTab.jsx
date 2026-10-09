import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress
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
import GetAppIcon from '@mui/icons-material/GetApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import PinDropIcon from '@mui/icons-material/PinDrop';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SettingsIcon from '@mui/icons-material/Settings';
import SyncIcon from '@mui/icons-material/Sync';
import { speakText, stopSpeech } from '../utils/speech';
import { useLanguage, tCg } from '../utils/i18n';
import { appConfig } from '../config/appConfig';
import {
  fetchLiveWeather,
  getCachedWeather,
  detectCurrentLocationDistrict,
  CG_DISTRICT_COORDS
} from '../services/weatherService';
import {
  getActiveFarmer,
  loginFarmer,
  logoutFarmer,
  getFarmerPlots
} from '../services/farmerService';
import { notify } from '../services/notificationService';
import { analyzePlotLifecycle, getTodayActionableFarmTask } from '../utils/cropLifecycleEngine';
import { checkForAppUpdate } from '../services/updateService';
import { getPublicBroadcasts } from '../services/adminService';
import SensorsIcon from '@mui/icons-material/Sensors';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';
import { getMandiRates, getCachedModuleData } from '../services/apiService';
import { fetchVillagesByPincode } from '../services/pincodeService';
import {
  getDeviceRegistry,
  updateDevice,
  subscribeDeviceRegistry
} from '../services/deviceManagerService';

const MeraKhetModal = lazy(() => import('./MeraKhetModal').then((m) => ({ default: m.MeraKhetModal })));
const FieldGpsTrackerModal = lazy(() => import('./FieldGpsTrackerModal').then((m) => ({ default: m.FieldGpsTrackerModal })));
const SoilIotSensorModal = lazy(() => import('./SoilIotSensorModal').then((m) => ({ default: m.SoilIotSensorModal })));
const MotorControllerModal = lazy(() => import('./MotorControllerModal').then((m) => ({ default: m.MotorControllerModal })));
const DeviceHubModal = lazy(() => import('./DeviceHubModal').then((m) => ({ default: m.DeviceHubModal })));
const ShareModal = lazy(() => import('./ShareModal').then((m) => ({ default: m.ShareModal })));
const TokenGuideModal = lazy(() => import('./TokenGuideModal').then((m) => ({ default: m.TokenGuideModal })));
import { getIgkvSeasonalAdvisory } from '../data/igkvAdvisoryData';
import { MandiPulseCard } from './home/MandiPulseCard';
import { CgAssistanceHubCard } from './home/CgAssistanceHubCard';
import { PublicWelcomeBanner } from './home/PublicWelcomeBanner';
import { QuickLauncherGrid } from './home/QuickLauncherGrid';
import { SmartAuthCard } from './home/SmartAuthCard';

export const HomeTab = ({
  onNavigate,
  selectedDistrict,
  exactLocation = '',
  isGpsLocation = false,
  onDistrictChange
}) => {
  const { isChhattisgarhi } = useLanguage();
  const [openMeraKhet, setOpenMeraKhet] = useState(false);
  const [openGpsTracker, setOpenGpsTracker] = useState(false);
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [openMotorModal, setOpenMotorModal] = useState(false);
  const [openDeviceHub, setOpenDeviceHub] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [openTokenGuide, setOpenTokenGuide] = useState(false);
  const [openDistrictPicker, setOpenDistrictPicker] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [weather, setWeather] = useState(() => getCachedWeather(selectedDistrict));
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [selectedPlotIndex, setSelectedPlotIndex] = useState(0);
  const [deviceRegistry, setDeviceRegistry] = useState(() => getDeviceRegistry());

  // Subscribe to Centralized Device Registry updates
  useEffect(() => {
    const unsub = subscribeDeviceRegistry((updated) => {
      setDeviceRegistry(updated);
    });
    return () => unsub();
  }, []);

  // 1-Tap Direct Motor On/Off Toggle Handler
  const handleDirectMotorToggle = () => {
    const currentStatus = deviceRegistry?.motor?.status === 'ON';
    const nextStatus = currentStatus ? 'OFF' : 'ON';
    updateDevice('motor', { status: nextStatus });
    if (nextStatus === 'ON') {
      notify.success(isChhattisgarhi ? '⚡ ट्यूबवेल मोटर चालू करे के निर्देश भेजे गे।' : '⚡ ट्यूबवेल मोटर चालू करने का निर्देश भेजा गया।');
      speakText(isChhattisgarhi ? 'ट्यूबवेल मोटर चालू होगे' : 'ट्यूबवेल मोटर चालू हो गई');
    } else {
      notify.info(isChhattisgarhi ? '🛑 ट्यूबवेल मोटर बंद कर दिए गे।' : '🛑 ट्यूबवेल मोटर बंद कर दी गई।');
      speakText(isChhattisgarhi ? 'ट्यूबवेल मोटर बंद होगे' : 'ट्यूबवेल मोटर बंद हो गई');
    }
  };

  // 1-Tap Live GPS Location Detection
  const handleDetectLiveGps = async () => {
    const hasBridgeGps = typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.getNativeLocation === 'function';
    if (!hasBridgeGps && (typeof navigator === 'undefined' || !navigator.geolocation)) {
      notify.warning(isChhattisgarhi ? 'मोबाइल म GPS सुविधा नइये।' : 'डिवाइस में GPS सुविधा उपलब्ध नहीं है।');
      return;
    }
    setDetectingGps(true);
    notify.info(isChhattisgarhi ? '📡 GPS ले तीर के मौसम केंद्र खोजे जावत हे...' : '📡 GPS द्वारा नजदीकी कृषि मौसम केंद्र का पता लगाया जा रहा है...');
    try {
      const res = await detectCurrentLocationDistrict(true);
      setDetectingGps(false);
      if (res && res.district) {
        const resolvedExact = res.exactLocation || res.district;
        if (typeof onDistrictChange === 'function') {
          onDistrictChange(res.district, true, resolvedExact);
        }
        notify.success(isChhattisgarhi ? `📍 लाइव जगह मिलिस: ${resolvedExact}` : `📍 वर्तमान स्थान सेट हुआ: ${resolvedExact}`);
        speakText(isChhattisgarhi ? `अपन जगह ${resolvedExact} के मौसम सेट होगे` : `आपके स्थान ${resolvedExact} का मौसम सेट हो गया`);
      }
    } catch {
      setDetectingGps(false);
      notify.warning(isChhattisgarhi ? 'GPS अनुमति नइ मिलिस। फोन के Location चालू करव।' : 'GPS अनुमति नहीं मिली। कृपया फोन की Location चालू करें।');
      speakText(isChhattisgarhi ? 'GPS अनुमति नइ मिलिस। फोन के लोकेशन चालू करव।' : 'GPS अनुमति नहीं मिली। कृपया लोकेशन चालू करें।');
    }
  };

  // Voice Navigation Modal Trigger Listener
  const [highlightWeatherCard, setHighlightWeatherCard] = useState(false);

  useEffect(() => {
    const handleVoiceModal = (e) => {
      const modal = e?.detail?.modal;
      if (modal === 'motor') setOpenMotorModal(true);
      else if (modal === 'khet') setOpenMeraKhet(true);
      else if (modal === 'token') setOpenTokenGuide(true);
    };
    window.addEventListener('kisan-open-modal', handleVoiceModal);

    const handleKakaAction = (e) => {
      const action = e?.detail;
      if (!action) return;
      if (action.type === 'SHOW_WEATHER') {
        setHighlightWeatherCard(true);
        const scrollCardWithRetry = (elementId, retries = 5, delay = 100) => {
          let attempt = 0;
          const tryScroll = () => {
            const el = document.getElementById(elementId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (attempt < retries) {
              attempt++;
              setTimeout(tryScroll, delay);
            }
          };
          tryScroll();
        };
        scrollCardWithRetry('kaka-weather-card');
        setTimeout(() => setHighlightWeatherCard(false), 3500);
      }
    };
    window.addEventListener('kisan_kaka_action', handleKakaAction);

    return () => {
      window.removeEventListener('kisan-open-modal', handleVoiceModal);
      window.removeEventListener('kisan_kaka_action', handleKakaAction);
    };
  }, []);

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
  }, [activeFarmer, openMeraKhet]);

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
      } catch {
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
      notify.warning(tCg('कृपया 10 अंक के मोबाइल नंबर डारव।', 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'));
      return;
    }
    if (authMode === 'login' && (!loginForm.pin || loginForm.pin.length < 4)) {
      notify.warning(tCg('कृपया 4 अंक के सुरक्षा पिन डारव।', 'कृपया 4 अंकों का सुरक्षा पिन दर्ज करें।'));
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
        notify.success(tCg('स्वागत हे, {name}! आपके खाता खुल गे।', 'स्वागत है, {name}! आपका खाता सक्रिय हो गया।', { name: res.farmer.name || 'किसान साथी' }));
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
    notify.info(tCg('सफलतापूर्वक लॉगआउट। आपके सबो डेटा सुरक्षित हे।', 'सफलतापूर्वक लॉगआउट। आपका डेटा सुरक्षित है।'));
  };

  const [updateInfo, setUpdateInfo] = useState(null);

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

  // Live Weather Fetch (Open-Meteo)
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      setWeatherLoading(true);
      const data = await fetchLiveWeather(selectedDistrict);
      if (isMounted) {
        setWeather(data);
        setWeatherLoading(false);
      }
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  const handleReadAdvisory = () => {
    const fallbackText = tCg(
      'आज के किसानी सलाह: मौसम साफ अऊ बने रहिही। यूरिया खाद अऊ दवाई छिड़काव बर बने समय हे।',
      'आज की कृषि सलाह: मौसम साफ और अनुकूल रहेगा। यूरिया खाद व कीटनाशक छिड़काव का सही समय है।'
    );
    let parts = [];

    // Live weather summary preamble
    if (weather) {
      parts.push(
        isChhattisgarhi
          ? `जय जोहार संगवारी! ${selectedDistrict} म आज तापमान ${weather.temp} डिग्री, पानी गिरे के संका ${weather.rainProbability} प्रतिशत अऊ हवा ${weather.windSpeed} किलोमीटर प्रति घंटा हे।`
          : `नमस्ते किसान साथी! ${selectedDistrict} में आज तापमान ${weather.temp} डिग्री, वर्षा संभावना ${weather.rainProbability} प्रतिशत और हवा ${weather.windSpeed} किमी प्रति घंटा है।`
      );
    }

    if (weather?.mawathaAlert?.hasRisk) {
      parts.push(isChhattisgarhi ? (weather.mawathaAlert.adviceCg || weather.mawathaAlert.advice) : weather.mawathaAlert.advice);
    }

    if (weather?.lightningRisk?.hasRisk) {
      parts.push(isChhattisgarhi ? (weather.lightningRisk.adviceCg || weather.lightningRisk.advice) : weather.lightningRisk.advice);
    }

    const sprayVoice = isChhattisgarhi
      ? (weather?.sprayAdvisory?.voiceCg || weather?.sprayAdvisory?.voice)
      : weather?.sprayAdvisory?.voice;
    if (sprayVoice) parts.push(sprayVoice);

    if (weather?.harvestDryingWindow) {
      parts.push(isChhattisgarhi ? (weather.harvestDryingWindow.adviceCg || weather.harvestDryingWindow.advice) : weather.harvestDryingWindow.advice);
    }

    if (weather?.soilMoisture) {
      parts.push(isChhattisgarhi ? weather.soilMoisture.adviceCg : weather.soilMoisture.advice);
    }
    if (weather?.diseaseRisk && weather.diseaseRisk.riskLevel === 'high') {
      parts.push(isChhattisgarhi ? weather.diseaseRisk.adviceCg : weather.diseaseRisk.advice);
    }

    const fullText = parts.length > 0 ? parts.join(' ') : fallbackText;
    speakText(fullText.trim());
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
      } catch {
        // quiet
      }
    };
    loadMandi();
    return () => { isMounted = false; };
  }, []);

  // Shared Smart Auth Card (Pincode Auto-Discovery + Segmented Register/Login Tabs)
  const renderSmartAuthCard = (inModal = false) => (
    <SmartAuthCard
      authMode={authMode}
      setAuthMode={setAuthMode}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      loginLoading={loginLoading}
      handleQuickLoginSubmit={handleQuickLoginSubmit}
      handlePincodeChange={handlePincodeChange}
      pincodeLoading={pincodeLoading}
      pincodeVillages={pincodeVillages}
      pincodeInfo={pincodeInfo}
      customVillageMode={customVillageMode}
      setCustomVillageMode={setCustomVillageMode}
      isChhattisgarhi={isChhattisgarhi}
      inModal={inModal}
    />
  );

  // 1. Mandi Rates Pulse Card
  const renderMandiPulseCard = () => (
    <MandiPulseCard
      liveMandiRates={liveMandiRates}
      selectedDistrict={selectedDistrict}
      isChhattisgarhi={isChhattisgarhi}
      onNavigate={onNavigate}
    />
  );
  // 3. Smart Chhattisgarh Farmer Assistance & Procurement Hub (धान उपार्जन + IGKV बुलेटिन)
  const renderCgAssistanceHubCard = () => (
    <CgAssistanceHubCard
      isChhattisgarhi={isChhattisgarhi}
      onNavigate={onNavigate}
      onOpenTokenGuide={() => setOpenTokenGuide(true)}
    />
  );

  // 4A. Traditional Public Gateway Welcome Banner (When !activeFarmer)
  const renderPublicWelcomeBanner = () => (
    <PublicWelcomeBanner
      isChhattisgarhi={isChhattisgarhi}
      exactLocation={exactLocation}
      selectedDistrict={selectedDistrict}
      isGpsLocation={isGpsLocation}
      onOpenQuickLogin={() => { stopSpeech(); setOpenQuickLogin(true); }}
      onNavigate={onNavigate}
    />
  );

  // 4C. Official Digital Farmer Passbook Card (When activeFarmer - Legacy/Alt)
  const _renderDigitalFarmerPassbookCard = () => (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '2px solid #2e7d32',
        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.14)',
        overflow: 'hidden'
      }}
    >
      {/* Official Header Strip */}
      <Box
        sx={{
          p: 1.4,
          px: 2,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#ffeb3b', fontSize: 24 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: 0.3 }}>
            🏛️ {isChhattisgarhi ? 'किसान पहचान पत्र अऊ पासबुक' : 'किसान पहचान पत्र व पासबुक (Digital Passbook)'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#1b5e20 !important' }} />}
            label={isChhattisgarhi ? 'सत्यापित किसान' : 'प्रमाणित किसान'}
            size="small"
            sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 900, fontSize: '0.68rem', height: 22 }}
          />
          <Button
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: 13 }} />}
            onClick={handleFarmerLogout}
            sx={{ color: '#ffcdd2', fontWeight: 800, fontSize: '0.7rem', p: 0.2, minWidth: 'auto', '&:hover': { color: '#ffffff' } }}
          >
            {isChhattisgarhi ? 'लॉगआउट' : 'लॉगआउट'}
          </Button>
        </Box>
      </Box>

      {/* Passbook Details Grid */}
      <Box sx={{ p: { xs: 1.8, sm: 2.2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: '#e8f5e9',
                color: '#1b5e20',
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                border: '2px solid #a5d6a7'
              }}
            >
              {activeFarmer.name ? activeFarmer.name.charAt(0) : '🌾'}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
                {isChhattisgarhi ? `जय जोहार, ${activeFarmer.name || 'किसान साथी'} जी` : `${activeFarmer.name || 'किसान साथी'}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                {isChhattisgarhi ? `दर्ज मोबाइल: +91 ${activeFarmer.phone}` : `पंजीकृत मोबाइल: +91 ${activeFarmer.phone}`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AgricultureIcon sx={{ fontSize: 16 }} />}
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{
                bgcolor: '#1b5e20',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: 2.5,
                px: 1.8,
                py: 0.6,
                boxShadow: '0 3px 8px rgba(27,94,32,0.2)',
                '&:hover': { bgcolor: '#14532d' }
              }}
            >
              {isChhattisgarhi ? '🌾 मोर खेत अऊ डायरी' : '🌾 मेरा खेत व डायरी'}
            </Button>
          </Box>
        </Box>

        {/* 4-Item Details Strip */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1,
            bgcolor: '#f8fafc',
            p: 1.2,
            borderRadius: 2.5,
            border: '1px solid #e2e8f0'
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              📍 {isChhattisgarhi ? 'गांव / ब्लॉक' : 'ग्राम / ब्लॉक'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
              {activeFarmer.village || (isChhattisgarhi ? 'दर्ज' : 'पंजीकृत')}, {activeFarmer.district || selectedDistrict}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              🌾 {isChhattisgarhi ? 'कुल दर्ज रकबा' : 'कुल पंजीकृत रकबा'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.86rem' }}>
              {(activeFarmer.totalAcres || activeFarmer.totalLandAcres) ? `${activeFarmer.totalAcres || activeFarmer.totalLandAcres} ${isChhattisgarhi ? 'एकड़ जमीन' : 'एकड़ भूमि'}` : (isChhattisgarhi ? 'अघोषित' : 'अघोषित')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              🌱 {isChhattisgarhi ? 'दर्ज खेत' : 'पंजीकृत खेत'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
              {(farmerPlots || []).length} {isChhattisgarhi ? 'खेत चालू हे' : 'खेत सक्रिय'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              💰 {isChhattisgarhi ? 'समर्थन मूल्य भाव' : 'समर्थन मूल्य दर'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.86rem' }}>
              ₹{appConfig.paddyScheme.totalRate}/क्विंटल धान
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );

  // 4D. Live Registered Plots & Daily Farm Tasks Feed (When activeFarmer)
  const renderActivePlotsAndDailyTasksCard = () => (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #a5d6a7',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: '#f1f8e9',
          borderBottom: '1px solid #c8e6c9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.92rem' }}>
            🌱 {isChhattisgarhi ? 'मोर चालू खेत अऊ आज के किसानी काम' : 'मेरे सक्रिय खेत व आज के कृषि कार्य (Live Field Dashboard)'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${(farmerPlots || []).length} ${isChhattisgarhi ? 'खेत चालू हे' : 'खेत सक्रिय'}`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.7rem' }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2, px: 1.4, py: 0.3 }}
          >
            {isChhattisgarhi ? '📅 नवा फसल तारीख जोड़व' : '📅 फसल बुआई तारीख जोड़ें'}
          </Button>
        </Box>
      </Box>

      {/* Plot Feed Body */}
      <Box sx={{ p: 2 }}>
        {(farmerPlots || []).length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {farmerPlots.map((plot, idx) => {
              const analysis = analyzePlotLifecycle(plot, weather || {});
              return (
                <Paper
                  key={plot.id || idx}
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    bgcolor: '#fafafa',
                    border: '1.2px solid #e0e0e0',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#ffffff', borderColor: '#81c784', boxShadow: '0 3px 12px rgba(0,0,0,0.06)' }
                  }}
                >
                  {/* Plot Header: Crop Name & Stage Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.96rem' }}>
                        🌾 {plot.name || (isChhattisgarhi ? `खेत ${idx + 1}` : `खेत ${idx + 1}`)} ({analysis.cropRule?.name || (isChhattisgarhi ? 'फसल' : 'फसल')})
                      </Typography>
                      {plot.variety && (
                        <Chip label={plot.variety} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#e8f5e9', color: '#1b5e20' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Chip
                        label={`⏱️ ${isChhattisgarhi ? (analysis.dayLabelCg || analysis.dayLabel) : analysis.dayLabel}`}
                        size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                      />
                      <Chip
                        label={analysis.currentStage?.stageName?.split('(')[0] || (isChhattisgarhi ? 'चालू' : 'सक्रिय')}
                        size="small"
                        sx={{
                          bgcolor: `${analysis.currentStage?.statusColor || '#2e7d32'}18`,
                          color: analysis.currentStage?.statusColor || '#2e7d32',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                          border: `1px solid ${analysis.currentStage?.statusColor || '#2e7d32'}40`
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Sowing & Acreage Info */}
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mb: 1 }}>
                    {isChhattisgarhi ? 'रकबा:' : 'रकबा:'} <strong>{plot.areaAcres || '1.0'} {isChhattisgarhi ? 'एकड़' : 'एकड़'}</strong> • {isChhattisgarhi ? 'बोवाई तारीख:' : 'बुआई तिथि:'} {plot.sowDate || (isChhattisgarhi ? 'दर्ज नइ हे' : 'दर्ज नहीं')}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.68rem' }}>
                        {isChhattisgarhi ? 'फसल चक्र बढ़वार' : 'फसल चक्र प्रगति'} ({analysis.cropRule?.totalDays || 120} {isChhattisgarhi ? 'दिन चक्र' : 'दिन चक्र'})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem' }}>
                        {analysis.progressPercent}% {isChhattisgarhi ? 'पूरा' : 'पूर्ण'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.progressPercent}
                      sx={{
                        height: 7,
                        borderRadius: 3.5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { bgcolor: analysis.currentStage?.statusColor || '#2e7d32', borderRadius: 3.5 }
                      }}
                    />
                  </Box>

                  {/* Today's Recommended Action Box */}
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      mb: 1.2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.8
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.74rem', display: 'block' }}>
                        {isChhattisgarhi ? "आज के जरूरी किसानी काम (Today's Advisory):" : "आज का आवश्यक कार्य (Today's Advisory):"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#14532d', fontSize: '0.74rem', lineHeight: 1.35, display: 'block' }}>
                        {analysis.currentStage?.task || (isChhattisgarhi ? 'खेत के रोज देखरेख करव अऊ उचित नमी बना के रखव।' : 'खेत की नियमित निगरानी करें और उचित नमी बनाए रखें।')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Weather Alert (if applicable) */}
                  {analysis.weatherAlert && (
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: analysis.weatherAlert.type === 'warning' ? '#fff1f2' : '#eff6ff',
                        border: `1px solid ${analysis.weatherAlert.type === 'warning' ? '#fecdd3' : '#bfdbfe'}`,
                        mb: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8
                      }}
                    >
                      <Typography variant="caption" sx={{ color: analysis.weatherAlert.type === 'warning' ? '#be123c' : '#1d4ed8', fontWeight: 700, fontSize: '0.72rem' }}>
                        {analysis.weatherAlert.title}: {analysis.weatherAlert.message}
                      </Typography>
                    </Box>
                  )}

                  {/* Plot Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                      onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
                      sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.74rem', p: 0.3 }}
                    >
                      {isChhattisgarhi ? 'खेत के ब्योरा अऊ खर्च डायरी देखव' : 'खेत का विवरण व खर्च डायरी देखें'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PowerSettingsNewIcon sx={{ fontSize: 14 }} />}
                      onClick={() => setOpenMotorModal(true)}
                      sx={{ color: '#0288d1', fontWeight: 800, fontSize: '0.72rem', p: 0.3 }}
                    >
                      {isChhattisgarhi ? 'मोटर चालू/बंद' : 'मोटर कंट्रोल'}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          /* Empty State */
          <Box sx={{ textAlign: 'center', py: 3, px: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
            <AgricultureIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
              {isChhattisgarhi ? 'अभे कोनो फसल तारीख नइ चुने हव' : 'अभी कोई फसल बुआई तारीख नहीं चुनी गई'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, maxWidth: 360, mx: 'auto', fontSize: '0.76rem' }}>
              {isChhattisgarhi
                ? 'अपन फसल के रकबा (एकड़) अऊ बोवाई तारीख चुनव। कोनो खसरा या जमीन के ब्यौरा नइ चाही।'
                : 'अपनी फसल का रकबा (एकड़) और बुआई की तारीख चुनें। किसी खसरा या कागज़ात की आवश्यकता नहीं है।'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, fontSize: '0.78rem', borderRadius: 2.5, px: 2, py: 0.6 }}
            >
              {isChhattisgarhi ? '📅 अपन बोवाई तारीख चुनव (1 मिनट)' : '📅 अपनी बुआई तारीख चुनें (1 मिनट)'}
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );

  // 5A. Modern Native Agritech Workstation Layout for Authenticated Farmer (Active Passbook & IoT Hub)
  const renderLoggedInNativeDashboard = () => {
    const farmerAcres = Number(activeFarmer?.totalAcres || activeFarmer?.totalLandAcres || activeFarmer?.acres) || (farmerPlots.reduce((sum, p) => sum + (Number(p.areaAcres) || 0), 0)) || 1.0;
    const activePlot = (farmerPlots && farmerPlots.length > 0) ? (farmerPlots[selectedPlotIndex] || farmerPlots[0]) : {
      name: isChhattisgarhi ? 'खेत 1' : 'खेत 1',
      crop: 'धान',
      variety: 'महामाया',
      areaAcres: farmerAcres,
      sowDate: '15 जुलाई'
    };
    const activePlotAnalysis = analyzePlotLifecycle(activePlot, weather || {});
    const totalPaddyQtl = (farmerAcres * 21).toFixed(1);
    const totalMspPayout = Math.round(farmerAcres * 21 * (appConfig.paddyScheme?.totalRate || 3100));

    return (
      <Box sx={{ width: '100%' }}>
        {/* ── 1. Modern Native Executive Farmer Identity Passbook Card ── */}
        <Card
          sx={{
            mb: 2.5,
            p: { xs: 1.8, sm: 2.2 },
            borderRadius: 4,
            bgcolor: '#ffffff',
            border: '1.5px solid #a7f3d0',
            boxShadow: '0 4px 20px rgba(22, 101, 52, 0.06)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top Gradient Decorative Edge */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #1b5e20, #10b981, #f59e0b)'
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, pt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  boxShadow: '0 4px 14px rgba(27,94,32,0.25)',
                  border: '2px solid #bbf7d0',
                  flexShrink: 0
                }}
              >
                {activeFarmer?.name ? activeFarmer.name.charAt(0) : '🌾'}
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.15rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
                    {activeFarmer?.name || (isChhattisgarhi ? 'किसान साथी' : 'किसान साथी')}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#065f46 !important' }} />}
                    label={isChhattisgarhi ? 'प्रमाणित किसान पासबुक' : 'प्रमाणित किसान पासबुक'}
                    size="small"
                    sx={{
                      bgcolor: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #6ee7b7',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.5 }, mt: 0.4, flexWrap: 'wrap', fontSize: '0.8rem', color: '#475569' }}>
                  <Typography
                    variant="caption"
                    onClick={() => setOpenDistrictPicker(true)}
                    sx={{
                      fontWeight: 800,
                      color: '#1b5e20',
                      cursor: 'pointer',
                      bgcolor: '#f0fdf4',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1.5,
                      border: '1px solid #bbf7d0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.4,
                      '&:hover': { bgcolor: '#dcfce7' }
                    }}
                  >
                    📍 {activeFarmer?.village ? `${activeFarmer.village}, ${activeFarmer.district || selectedDistrict}` : selectedDistrict} ▾
                  </Typography>
                  <span>•</span>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                    🌾 <strong>{farmerAcres} एकड़</strong> {isChhattisgarhi ? 'पंजीकृत रकबा' : 'पंजीकृत रकबा'}
                  </Typography>
                  <span>•</span>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    📱 +91 {activeFarmer?.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AgricultureIcon sx={{ fontSize: 16 }} />}
                onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
                sx={{
                  bgcolor: '#1b5e20',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  borderRadius: 2.5,
                  px: 1.8,
                  py: 0.7,
                  boxShadow: '0 3px 10px rgba(27,94,32,0.25)',
                  '&:hover': { bgcolor: '#14532d' }
                }}
              >
                {isChhattisgarhi ? '🌾 मोर खेत अऊ पासबुक' : '🌾 मेरा खेत व पासबुक'}
              </Button>
              <Button
                size="small"
                onClick={handleFarmerLogout}
                startIcon={<LogoutIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: 2.5,
                  px: 1.4,
                  py: 0.6,
                  '&:hover': { bgcolor: '#fee2e2' }
                }}
              >
                {isChhattisgarhi ? 'लॉगआउट' : 'लॉगआउट'}
              </Button>
            </Box>
          </Box>
        </Card>

        {/* ── 2. Four Telemetry KPI Tiles (Personalized Data) ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 2.5, md: 3 }
          }}
        >
          {/* Tile 1: Active Farm Plots */}
          <Paper
            elevation={0}
            onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
            sx={{
              p: 1.8,
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1.5px solid #bbf7d0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 10px rgba(22, 101, 52, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': { borderColor: '#16a34a', transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(22, 101, 52, 0.12)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AgricultureIcon sx={{ fontSize: 22 }} />
              </Box>
              <Chip
                label={`${farmerPlots.length || 1} ${isChhattisgarhi ? 'खेत चालू' : 'खेत सक्रिय'}`}
                size="small"
                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
                {isChhattisgarhi ? 'सक्रिय फसलें अऊ रकबा' : 'सक्रिय फसलें व कुल रकबा'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.08rem', lineHeight: 1.25, mt: 0.2 }}>
                {farmerAcres} एकड़ ({farmerPlots.length || 1} प्लॉट)
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                🌾 {activePlot?.crop || 'धान'} ({activePlot?.sowDate ? 'सक्रिय' : 'कैलेंडर'}) →
              </Typography>
            </Box>
          </Paper>

          {/* Tile 2: Paddy MSP Quota & Value */}
          <Paper
            elevation={0}
            onClick={() => { stopSpeech(); setOpenTokenGuide(true); }}
            sx={{
              p: 1.8,
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1.5px solid #fde68a',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 10px rgba(180, 83, 9, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': { borderColor: '#f59e0b', transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(180, 83, 9, 0.12)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MonetizationOnIcon sx={{ fontSize: 22 }} />
              </Box>
              <Chip
                label={`₹${appConfig.paddyScheme?.totalRate || 3100} समर्थन मूल्य`}
                size="small"
                sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
                {isChhattisgarhi ? 'धान सरकारी उपार्जन कोटा' : 'धान सरकारी उपार्जन कोटा'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.25, mt: 0.2 }}>
                {totalPaddyQtl} क्विं • ₹{totalMspPayout.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                🌾 21 क्विंटल/एकड़ सीमा • टोकन स्लॉट →
              </Typography>
            </Box>
          </Paper>

          {/* Tile 3: Live Microclimate & Soil Moisture */}
          <Paper
            elevation={0}
            onClick={() => { stopSpeech(); setOpenDistrictPicker(true); }}
            sx={{
              p: 1.8,
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1.5px solid #bae6fd',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': { borderColor: '#0284c7', transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(2, 132, 199, 0.12)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WbSunnyIcon sx={{ fontSize: 22 }} />
              </Box>
              <Chip
                label={weather ? `${weather.temp}°C ${weather.condition || 'साफ'}` : '30°C'}
                size="small"
                sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
                {activeFarmer?.village ? `${activeFarmer.village}` : selectedDistrict} {isChhattisgarhi ? 'मौसम अऊ नमी' : 'मौसम व मिट्टी नमी'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.02rem', lineHeight: 1.25, mt: 0.2 }}>
                नमी {weather?.soilMoisture?.percentage || 44}% • {weather?.sprayAdvisory?.canSpray ? (isChhattisgarhi ? 'छिड़काव बने हे' : 'छिड़काव सही') : (isChhattisgarhi ? 'सावधानी' : 'सावधानी')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                🌿 हवा {weather?.windSpeed || 7} km/h • यूरिया छिड़काव अनुकूल →
              </Typography>
            </Box>
          </Paper>

          {/* Tile 4: Smart Devices Connected */}
          <Paper
            elevation={0}
            onClick={() => { stopSpeech(); setOpenDeviceHub(true); }}
            sx={{
              p: 1.8,
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1.5px solid #a7f3d0',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': { borderColor: '#10b981', transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.12)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SensorsIcon sx={{ fontSize: 22 }} />
              </Box>
              <Chip
                label={`${(deviceRegistry?.motor ? 1 : 0) + (deviceRegistry?.soilProbe ? 1 : 0)} डिवाइस सक्रिय`}
                size="small"
                sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
                {isChhattisgarhi ? 'स्मार्ट कृषि डिवाइस स्थिति' : 'स्मार्ट कृषि डिवाइस स्थिति'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem', lineHeight: 1.25, mt: 0.2 }}>
                {isChhattisgarhi ? 'मोटर + माटी सेंसर' : 'मोटर + मिट्टी सेंसर'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                📶 {deviceRegistry?.motor?.status === 'ON' ? '⚡ मोटर चालू' : '● सभी ऑनलाइन'} • मैनेज करें →
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* ── 3. Balanced 2-Column Agritech Workstation Layout ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.8fr) minmax(0, 1.05fr)' },
            gap: { xs: 2, md: 2.5, lg: 3 },
            alignItems: 'start'
          }}
        >
          {/* LEFT COLUMN (Workstation Primary Stream) */}
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>

            {/* CARD A: Smart Farm Devices & IoT Management Hub */}
            <Card
              sx={{
                p: { xs: 1.8, sm: 2.2 },
                mb: 2.5,
                borderRadius: 4,
                bgcolor: '#ffffff',
                border: '1.5px solid #a7f3d0',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.06)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SensorsIcon sx={{ color: '#059669', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                    {isChhattisgarhi ? '⚡ स्मार्ट कृषि यंत्र अऊ डिवाइस प्रबंधन' : '⚡ स्मार्ट कृषि यंत्र व डिवाइस प्रबंधन (IoT Device Hub)'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setOpenDeviceHub(true)}
                  sx={{
                    bgcolor: '#1b5e20',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    borderRadius: 2.5,
                    px: 1.5,
                    py: 0.4,
                    boxShadow: '0 2px 6px rgba(27,94,32,0.2)',
                    '&:hover': { bgcolor: '#14532d' }
                  }}
                >
                  + {isChhattisgarhi ? 'नवा डिवाइस जोड़व' : 'नया डिवाइस जोड़ें'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* Device 1: GSM Tubewell Motor Starter */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#ffffff', borderColor: '#10b981', boxShadow: '0 3px 12px rgba(0,0,0,0.04)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PowerSettingsNewIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                          {isChhattisgarhi ? 'ट्यूबवेल मोटर स्टार्टर (5 HP)' : 'ट्यूबवेल मोटर स्टार्टर (5 HP)'}
                        </Typography>
                        <Chip
                          label={deviceRegistry?.motor?.status === 'ON' ? (isChhattisgarhi ? '● चलत हे (चालू)' : '● चल रही है (चालू)') : (isChhattisgarhi ? '● स्टैंडबाय (बंद)' : '● ऑनलाइन (स्टैंडबाय)')}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            bgcolor: deviceRegistry?.motor?.status === 'ON' ? '#fee2e2' : '#dcfce7',
                            color: deviceRegistry?.motor?.status === 'ON' ? '#b91c1c' : '#166534'
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mt: 0.2 }}>
                        {deviceRegistry?.motor?.phone ? `SIM: +91 ${deviceRegistry.motor.phone}` : 'SIM: +91 98270-XXXXX'} • 3-फेज बिजली उपलब्ध • ऑटो कट-ऑफ सक्रिय
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleDirectMotorToggle}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        px: 2,
                        py: 0.6,
                        bgcolor: deviceRegistry?.motor?.status === 'ON' ? '#ef4444' : '#10b981',
                        color: '#fff',
                        boxShadow: deviceRegistry?.motor?.status === 'ON' ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(16, 185, 129, 0.3)',
                        '&:hover': { bgcolor: deviceRegistry?.motor?.status === 'ON' ? '#dc2626' : '#059669' }
                      }}
                    >
                      {deviceRegistry?.motor?.status === 'ON' ? (isChhattisgarhi ? 'बंद करव' : 'बंद करें') : (isChhattisgarhi ? 'चालू करव' : 'चालू करें')}
                    </Button>
                    <IconButton size="small" onClick={() => setOpenMotorModal(true)} sx={{ bgcolor: '#f1f5f9', color: '#475569', p: 0.8, borderRadius: 2 }}>
                      <SettingsIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Paper>

                {/* Device 2: Bluetooth Soil Moisture & NPK Sensor */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#ffffff', borderColor: '#10b981', boxShadow: '0 3px 12px rgba(0,0,0,0.04)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ScienceIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                          {isChhattisgarhi ? 'ब्लूटूथ माटी सेंसर प्रोब (BLE)' : 'ब्लूटूथ सॉइल सेंसर प्रोब (BLE)'}
                        </Typography>
                        <Chip
                          label={deviceRegistry?.soilProbe?.connected ? '● कनेक्टेड (BLE 5.0)' : '● स्टैंडबाय (BLE 5.0)'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: '#dcfce7', color: '#166534' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mt: 0.2 }}>
                        मिट्टी नमी: {weather?.soilMoisture?.percentage || 44}% • pH: 6.8 • बैटरी: {deviceRegistry?.soilProbe?.battery || 88}% • अंतिम सिंक: आज
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        notify.success(isChhattisgarhi ? 'माटी डेटा रिफ्रेश होगे!' : 'मिट्टी डेटा रिफ्रेश हो गया!');
                        setOpenSoilIot(true);
                      }}
                      startIcon={<SyncIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        borderColor: '#a7f3d0',
                        color: '#065f46',
                        bgcolor: '#ecfdf5',
                        '&:hover': { bgcolor: '#d1fae5', borderColor: '#6ee7b7' }
                      }}
                    >
                      {isChhattisgarhi ? 'डेटा सिंक' : 'डेटा सिंक'}
                    </Button>
                    <IconButton size="small" onClick={() => setOpenSoilIot(true)} sx={{ bgcolor: '#f1f5f9', color: '#475569', p: 0.8, borderRadius: 2 }}>
                      <SettingsIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Paper>

                {/* Device 3: Field GPS Boundary Tracker */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.6,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#ffffff', borderColor: '#f59e0b', boxShadow: '0 3px 12px rgba(0,0,0,0.04)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#fefce8', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DirectionsWalkIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                          {isChhattisgarhi ? 'खेत सीमा GPS नाप ट्रैकर' : 'खेत GPS सीमा नाप ट्रैकर'}
                        </Typography>
                        <Chip
                          label="● GPS सैटेलाइट रेडी"
                          size="small"
                          sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: '#fef3c7', color: '#92400e' }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mt: 0.2 }}>
                        सटीकता: ±1.2m • 8 उपग्रह कनेक्टेड • पैदल चलकर नापने हेतु तैयार
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setOpenGpsTracker(true)}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      bgcolor: '#b45309',
                      color: '#fff',
                      px: 1.8,
                      py: 0.6,
                      '&:hover': { bgcolor: '#92400e' }
                    }}
                  >
                    🚶‍♂️ {isChhattisgarhi ? 'खेत नापव' : 'खेत नापें'}
                  </Button>
                </Paper>
              </Box>

              {/* Broad Pairing CTA Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenDeviceHub(true)}
                sx={{
                  mt: 1.8,
                  py: 1,
                  borderRadius: 3,
                  borderStyle: 'dashed',
                  borderWidth: '1.5px',
                  borderColor: '#10b981',
                  bgcolor: '#ecfdf5',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#d1fae5', borderColor: '#059669' }
                }}
              >
                📶 <strong>{isChhattisgarhi ? 'नवा स्मार्ट डिवाइस कनेक्ट करव' : 'नया स्मार्ट डिवाइस कनेक्ट करें'}</strong>&nbsp;({isChhattisgarhi ? 'ब्लूटूथ सेंसर, GSM स्टार्टर, ऑटो ड्रिप' : 'ब्लूटूथ सेंसर, GSM स्टार्टर, ऑटो ड्रिप'})
              </Button>
            </Card>

            {/* CARD B: Live Plot Workstation Card with Multi-Plot Switcher Tabs & 5-Step Visual Timeline */}
            <Card
              sx={{
                p: { xs: 1.8, sm: 2.2 },
                mb: 2.5,
                borderRadius: 4,
                bgcolor: '#ffffff',
                border: '1.5px solid #a5d6a7',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'gap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AgricultureIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                    {isChhattisgarhi ? '🌱 मोर सक्रिय खेत अऊ आज के किसानी काम' : '🌱 मेरे सक्रिय खेत व आज के कृषि कार्य (Live Field Workstation)'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setOpenMeraKhet(true)}
                  sx={{
                    bgcolor: '#2e7d32',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    borderRadius: 2,
                    px: 1.4,
                    py: 0.3
                  }}
                >
                  + {isChhattisgarhi ? 'नवा खेत जोड़व' : 'नया खेत जोड़ें'}
                </Button>
              </Box>

              {/* Multi-Plot Switcher Tabs (if more than 1 plot) */}
              {farmerPlots.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f1f5f9', p: 0.5, borderRadius: 3, mb: 1.8, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                  {farmerPlots.map((p, idx) => (
                    <Button
                      key={p.id || idx}
                      size="small"
                      onClick={() => setSelectedPlotIndex(idx)}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        py: 0.7,
                        px: 1.5,
                        whiteSpace: 'nowrap',
                        bgcolor: selectedPlotIndex === idx ? '#1b5e20' : 'transparent',
                        color: selectedPlotIndex === idx ? '#ffffff' : '#475569',
                        boxShadow: selectedPlotIndex === idx ? '0 2px 8px rgba(27,94,32,0.25)' : 'none',
                        '&:hover': { bgcolor: selectedPlotIndex === idx ? '#14532d' : '#e2e8f0' }
                      }}
                    >
                      🌾 {p.name || `खेत #${idx + 1}`} ({p.crop || 'धान'}{p.areaAcres ? `, ${p.areaAcres} एकड़` : ''})
                    </Button>
                  ))}
                </Box>
              )}

              {/* Stage Visual Timeline Box */}
              <Box
                sx={{
                  p: 1.8,
                  borderRadius: 3,
                  bgcolor: '#f0fdf4',
                  border: '1.5px solid #bbf7d0',
                  mb: 1.8
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.94rem' }}>
                    🌾 {activePlot.name || 'खेत 1'} ({activePlotAnalysis.cropRule?.name || activePlot.crop || 'धान'}{activePlot.variety ? ` - ${activePlot.variety}` : ''}) — {activePlot.areaAcres || farmerAcres} एकड़
                  </Typography>
                  <Chip
                    label={`⏱️ ${isChhattisgarhi ? (activePlotAnalysis.dayLabelCg || activePlotAnalysis.dayLabel) : activePlotAnalysis.dayLabel}`}
                    size="small"
                    sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                  />
                </Box>

                {/* 5-Step Visual Checkpoints Progression */}
                <Box sx={{ position: 'relative', my: 2.2, px: 1 }}>
                  {/* Background track line */}
                  <Box sx={{ position: 'absolute', top: 14, left: 24, right: 24, height: 4, bgcolor: '#cbd5e1', zIndex: 1, borderRadius: 2 }} />
                  {/* Dynamic progress line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 14,
                      left: 24,
                      width: `${Math.min(Math.max(activePlotAnalysis.progressPercent || 35, 10), 92)}%`,
                      height: 4,
                      bgcolor: '#16a34a',
                      zIndex: 2,
                      borderRadius: 2,
                      transition: 'width 0.4s ease'
                    }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 3 }}>
                    {[
                      { label: isChhattisgarhi ? 'बोवाई/रोपाई' : 'बुआई/रोपाई', minP: 0, doneP: 20 },
                      { label: isChhattisgarhi ? 'कल्ले फूटना' : 'कल्ले फूटना', minP: 20, doneP: 45 },
                      { label: isChhattisgarhi ? 'गभोट/फूल' : 'गभोट/फूल', minP: 45, doneP: 70 },
                      { label: isChhattisgarhi ? 'दूधिया/बाली' : 'दूधिया/बाली', minP: 70, doneP: 90 },
                      { label: isChhattisgarhi ? 'कटाई अऊ मंडी' : 'कटाई व मंडी', minP: 90, doneP: 100 }
                    ].map((step, sIdx) => {
                      const pct = activePlotAnalysis.progressPercent || 35;
                      const isDone = pct >= step.doneP;
                      const isActive = pct >= step.minP && pct < step.doneP;
                      return (
                        <Box key={sIdx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: isDone ? '#16a34a' : '#ffffff',
                              color: isDone ? '#ffffff' : (isActive ? '#16a34a' : '#64748b'),
                              border: `3px solid ${isDone ? '#16a34a' : (isActive ? '#16a34a' : '#cbd5e1')}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 900,
                              boxShadow: isActive ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none'
                            }}
                          >
                            {isDone ? '✓' : sIdx + 1}
                          </Box>
                          <Typography variant="caption" sx={{ fontSize: '0.66rem', fontWeight: isActive ? 800 : 700, color: isActive ? '#166534' : '#64748b', whiteSpace: 'nowrap' }}>
                            {step.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Today's Recommended Action Box */}
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 2.5,
                    bgcolor: '#ffffff',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1
                  }}
                >
                  <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>💡</Typography>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.78rem', display: 'block' }}>
                      {isChhattisgarhi ? `आज के जरूरी काम (${activeFarmer.name || 'किसान साथी'} बर):` : `आज का आवश्यक कृषि कार्य (${activeFarmer.name || 'किसान साथी'} के लिए):`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#14532d', fontSize: '0.76rem', lineHeight: 1.4, display: 'block', mt: 0.2 }}>
                      {activePlotAnalysis.currentStage?.task || (isChhattisgarhi ? 'खेत के रोज देखरेख करव अऊ उचित नमी बना के रखव।' : 'खेत की नियमित निगरानी करें और उचित नमी बनाए रखें।')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Quick Action Navigation Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => { stopSpeech(); onNavigate('doctor'); }}
                  sx={{
                    flex: 1,
                    py: 0.8,
                    borderRadius: 2.5,
                    borderColor: '#a7f3d0',
                    bgcolor: '#f0fdf4',
                    color: '#166534',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#dcfce7', borderColor: '#86efac' }
                  }}
                >
                  🔍 {isChhattisgarhi ? 'फसल रोग अऊ कीरा जांचव' : 'फसल रोग व कीट जांचें'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    stopSpeech();
                    onNavigate('schemes');
                    window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 0 } }));
                  }}
                  sx={{
                    flex: 1,
                    py: 0.8,
                    borderRadius: 2.5,
                    borderColor: '#bae6fd',
                    bgcolor: '#f0f9ff',
                    color: '#0369a1',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#e0f2fe', borderColor: '#38bdf8' }
                  }}
                >
                  🧮 {activePlot.areaAcres || farmerAcres} {isChhattisgarhi ? 'एकड़ के सटीक खाद हिसाब' : 'एकड़ का सटीक खाद हिसाब'}
                </Button>
              </Box>
            </Card>

            {/* CARD C: Floating Weather & Spray Card */}
            <Card
              id="kaka-weather-card"
              className={highlightWeatherCard ? 'kaka-spotlight-pulse' : ''}
              sx={{
                mb: 2.2,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                  <Typography sx={{ fontSize: { xs: '1.9rem', sm: '2.2rem' }, lineHeight: 1 }}>
                    {weather?.conditionIcon || '🌤️'}
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
                        {weather ? `${weather.temp}°` : (weatherLoading ? '--°' : '30°')}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>
                        {weather
                          ? (isChhattisgarhi ? (weather.conditionTextCg || weather.conditionText) : weather.conditionText)
                          : (weatherLoading ? (isChhattisgarhi ? 'लाइव मौसम लोड होत हे...' : 'लाइव मौसम लोड हो रहा है...') : (isChhattisgarhi ? 'उघरा अकास' : 'साफ मौसम'))}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3, flexWrap: 'wrap' }}>
                      <Typography
                        variant="caption"
                        onClick={() => setOpenDistrictPicker(true)}
                        sx={{
                          color: '#1b5e20',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.3,
                          borderRadius: 1.5,
                          px: 0.7,
                          py: 0.15,
                          bgcolor: 'rgba(27,94,32,0.08)',
                          '&:hover': { bgcolor: 'rgba(27,94,32,0.16)' }
                        }}
                      >
                        📍 {exactLocation || (activeFarmer?.village ? `${activeFarmer.village}, ${selectedDistrict}` : selectedDistrict)} <span style={{ fontSize: '0.64rem', color: '#2e7d32' }}>({isChhattisgarhi ? 'बदलव ▾' : 'बदलें ▾'})</span>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                  <KakaWalkthroughButton featureId="home" />
                  <Chip
                    label={(isChhattisgarhi ? (weather?.sprayAdvisory?.badgeCg || weather?.sprayAdvisory?.badge) : weather?.sprayAdvisory?.badge) || (isChhattisgarhi ? 'छिड़काव बर बने हे' : 'छिड़काव अनुकूल')}
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
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    <WaterDropIcon sx={{ fontSize: 13, color: '#0288d1' }} /> {isChhattisgarhi ? 'पानी (बरसात)' : 'वर्षा'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.rainProbability}%` : (weatherLoading ? '--' : '0%')}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    <AirIcon sx={{ fontSize: 13, color: '#00897b' }} /> {isChhattisgarhi ? 'हवा के गति' : 'हवा'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.windSpeed} km/h` : (weatherLoading ? '--' : '0 km/h')}
                  </Typography>
                </Box>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    💧 {isChhattisgarhi ? 'उमस (नमी)' : 'आर्द्रता'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.humidity}%` : (weatherLoading ? '--' : '0%')}
                  </Typography>
                </Box>
              </Box>

              {/* Satellite Soil Moisture & Smart Irrigation Meter (0-9cm root zone) */}
              {weather?.soilMoisture && (
                <Box
                  sx={{
                    p: 1.2,
                    mb: 1.5,
                    borderRadius: 2.5,
                    bgcolor: weather.soilMoisture.bg || '#f0fdf4',
                    border: `1px solid ${weather.soilMoisture.color || '#2e7d32'}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>🌱</Typography>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: weather.soilMoisture.color || '#166534', fontSize: '0.8rem' }}>
                          {isChhattisgarhi ? 'खेत माटी नमी (0-9 सेमी जड़ क्षेत्र):' : 'खेत मिट्टी नमी (0-9 सेमी जड़ क्षेत्र):'} <strong>{weather.soilMoisture.percentage}%</strong>
                        </Typography>
                        <Chip
                          label={isChhattisgarhi ? weather.soilMoisture.labelCg : weather.soilMoisture.label}
                          size="small"
                          sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#ffffff', color: weather.soilMoisture.color || '#166534', border: `1px solid ${weather.soilMoisture.color || '#166534'}` }}
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={weather.soilMoisture.percentage}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { bgcolor: weather.soilMoisture.color || '#166534', borderRadius: 3 }, mb: 0.4 }}
                      />
                      <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block', lineHeight: 1.3 }}>
                        {isChhattisgarhi ? weather.soilMoisture.adviceCg : weather.soilMoisture.advice}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Card>

            {/* CARD D: Unified 8-Tile Modern App Launcher Grid */}
            <QuickLauncherGrid
              isChhattisgarhi={isChhattisgarhi}
              activeFarmer={activeFarmer}
              onNavigate={onNavigate}
              onOpenGpsTracker={() => setOpenGpsTracker(true)}
              onOpenMotorModal={() => setOpenMotorModal(true)}
              onOpenSoilIot={() => setOpenSoilIot(true)}
              onOpenMeraKhet={() => setOpenMeraKhet(true)}
            />

            {/* Mandi Rates Pulse (Mobile Only: xs & sm) */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.2 }}>
              {renderMandiPulseCard()}
            </Box>
          </Box>

          {/* RIGHT COLUMN (Workstation Intelligence Hub: md and up, ~36%, sticky) */}
          <Box
            component="aside"
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              gap: 2.5,
              minWidth: 0,
              position: { md: 'sticky' },
              top: { md: '80px' }
            }}
          >
            {/* Card 1: Personalized Paddy MSP & Token Quota Card */}
            <Card
              sx={{
                p: 2.2,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #fefce8 0%, #fffbeb 100%)',
                border: '1.5px solid #fde68a',
                boxShadow: '0 4px 16px rgba(180, 83, 9, 0.06)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#92400e', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>🧮</span>
                  <span>{activeFarmer.name || 'किसान'} जी का धान विक्रय कोटा हिसाब</span>
                </Typography>
                <Chip
                  label="₹3,100 MSP"
                  size="small"
                  sx={{ bgcolor: '#fde68a', color: '#78350f', fontWeight: 900, fontSize: '0.68rem', height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, fontSize: '0.82rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>कुल पंजीकृत रकबा:</span>
                  <strong style={{ color: '#92400e' }}>{farmerAcres} एकड़</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>धान उपार्जन सीमा (21 क्विं/एकड़):</span>
                  <strong style={{ color: '#92400e' }}>{totalPaddyQtl} क्विंटल</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>सरकारी समर्थन मूल्य दर:</span>
                  <strong style={{ color: '#92400e' }}>₹{appConfig.paddyScheme?.totalRate || 3100} /क्विंटल</strong>
                </Box>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1.5px solid #f59e0b',
                  textAlign: 'center',
                  mb: 1.8
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
                  अनुमानित कुल बैंक भुगतान:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#b45309', fontSize: '1.45rem', lineHeight: 1.2, my: 0.3 }}>
                  ₹{totalMspPayout.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 800, fontSize: '0.7rem' }}>
                  ✓ कृषक उन्नति योजना • सीधा DBT बैंक ट्रांसफर
                </Typography>
              </Paper>

              <Button
                fullWidth
                variant="contained"
                onClick={() => setOpenTokenGuide(true)}
                sx={{
                  py: 1,
                  borderRadius: 2.5,
                  bgcolor: '#b45309',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#92400e' }
                }}
              >
                टोकन स्लॉट तारीख बुक करें →
              </Button>
            </Card>

            {/* Card 2: Live Mandi Rates Pulse Widget */}
            {renderMandiPulseCard()}

            {/* Card 3: 24x7 Farmer Helpline */}
            <Card
              sx={{
                p: 1.8,
                borderRadius: 3.5,
                bgcolor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>📞</Typography>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.86rem' }}>
                    किसान कॉल सेंटर (टोल-फ्री)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                    कृषि वैज्ञानिक सीधी बात: {appConfig.helpline?.label || '1800-180-1551'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                size="small"
                href={`tel:${appConfig.helpline?.number || '18001801551'}`}
                sx={{
                  bgcolor: '#1b5e20',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  px: 1.5,
                  '&:hover': { bgcolor: '#14532d' }
                }}
              >
                कॉल
              </Button>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  };

  // 5B. Traditional Public Gateway Dashboard for Guest Mode (100% Unchanged)
  const renderGuestDashboard = () => (
    <>
      {/* 1. Top Section: Unauthenticated Guest: Official Public Gateway Welcome Banner */}
      {renderPublicWelcomeBanner()}

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
                {isChhattisgarhi ? `🎉 नवा अपडेट उपलब्ध हे (v${updateInfo.latestVersion})!` : `🎉 नया अपडेट उपलब्ध है (v${updateInfo.latestVersion})!`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem' }}>
                {isChhattisgarhi ? 'नवा APK इंस्टॉल करव • पुरना डेटा सुरक्षित रहिही' : 'नया APK इंस्टॉल करें • पुराना डेटा सुरक्षित रहेगा'}
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
            {isChhattisgarhi ? 'अभी अपडेट करव' : 'अभी अपडेट करें'}
          </Button>
        </Paper>
      )}

      {/* ── 3. Farmer Command Center Telemetry KPI Tiles (Admin-Grade Precision) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, md: 3 }
        }}
      >
        {/* Tile 1: Active Farm Plots & Registered Acreage */}
        <Paper
          elevation={0}
          onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
          sx={{
            p: 1.8,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1.5px solid #bbf7d0',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 10px rgba(22, 101, 52, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: '#16a34a',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 18px rgba(22, 101, 52, 0.12)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: '#f0fdf4',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AgricultureIcon sx={{ fontSize: 22 }} />
            </Box>
            <Chip
              label={isChhattisgarhi ? 'खेत डैशबोर्ड' : 'खेत डैशबोर्ड'}
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi ? 'सक्रिय खेत अऊ रकबा' : 'सक्रिय खेत व कुल रकबा'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.08rem', lineHeight: 1.25, mt: 0.2 }}>
              {activeFarmer
                ? `${(farmerPlots || []).length} खेत • ${activeFarmer.acres || 0} एकड़`
                : (isChhattisgarhi ? 'अपन खेत जोड़व' : 'खेत जोड़ें / बुआई')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
              📅 {isChhattisgarhi ? 'बुआई ले कटाई कैलेंडर →' : 'बुआई से कटाई कैलेंडर →'}
            </Typography>
          </Box>
        </Paper>

        {/* Tile 2: Paddy MSP ₹3,100 Procurement Telemetry */}
        <Paper
          elevation={0}
          onClick={() => {
            stopSpeech();
            onNavigate('schemes');
            window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 1 } }));
          }}
          sx={{
            p: 1.8,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1.5px solid #fde68a',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 10px rgba(180, 83, 9, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: '#f59e0b',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 18px rgba(180, 83, 9, 0.12)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: '#fffbeb',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MonetizationOnIcon sx={{ fontSize: 22 }} />
            </Box>
            <Chip
              label={isChhattisgarhi ? '₹3,100 गारंटी' : '₹3,100 गारंटी'}
              size="small"
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi ? 'धान सरकारी उपार्जन' : 'धान सरकारी उपार्जन दर'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.08rem', lineHeight: 1.25, mt: 0.2 }}>
              ₹{appConfig.paddyScheme.totalRate} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>/क्विंटल</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
              🌾 {isChhattisgarhi ? '21 क्विंटल/एकड़ सीमा →' : '21 क्विंटल/एकड़ सीमा →'}
            </Typography>
          </Box>
        </Paper>

        {/* Tile 3: Live Microclimate Weather & Spray Suitability */}
        <Paper
          elevation={0}
          onClick={() => {
            stopSpeech();
            const el = document.getElementById('kaka-weather-card');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else setOpenDistrictPicker(true);
          }}
          sx={{
            p: 1.8,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1.5px solid #bae6fd',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: '#0284c7',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 18px rgba(2, 132, 199, 0.12)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: '#f0f9ff',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <WbSunnyIcon sx={{ fontSize: 22 }} />
            </Box>
            <Chip
              label={weather ? `${weather.temp}°C` : selectedDistrict}
              size="small"
              sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi ? 'लाइव मौसम अऊ छिड़काव' : 'लाइव मौसम व छिड़काव'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.02rem', lineHeight: 1.25, mt: 0.2 }}>
              {activeFarmer?.village ? `${activeFarmer.village}, ${selectedDistrict}` : selectedDistrict} • {weather?.condition || (isChhattisgarhi ? 'साफ' : 'साफ')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: (weather?.rainProbability || 0) > 40 ? '#dc2626' : (weather?.windSpeed || 0) > 15 ? '#d97706' : '#0284c7',
                fontWeight: 700,
                fontSize: '0.68rem',
                mt: 0.4,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4
              }}
            >
              {(weather?.rainProbability || 0) > 40
                ? (isChhattisgarhi ? '⚠️ पानी के संका • स्प्रे रोकव' : '⚠️ वर्षा संभावना • स्प्रे रोकें')
                : (weather?.windSpeed || 0) > 15
                ? (isChhattisgarhi ? '💨 तेज हवा • स्प्रे नइ करव' : '💨 तेज हवा • स्प्रे न करें')
                : (isChhattisgarhi ? '🌿 मौसम बने हे • काम जारी' : '🌿 मौसम अनुकूल • कार्य जारी')}
            </Typography>
          </Box>
        </Paper>

        {/* Tile 4: Mandi Bhav Pulse Telemetry */}
        <Paper
          elevation={0}
          onClick={() => { stopSpeech(); onNavigate('mandi'); }}
          sx={{
            p: 1.8,
            borderRadius: 3,
            bgcolor: '#ffffff',
            border: '1.5px solid #e9d5ff',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 10px rgba(109, 40, 217, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '&:hover': {
              borderColor: '#9333ea',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 18px rgba(109, 40, 217, 0.12)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: '#faf5ff',
                color: '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StorefrontIcon sx={{ fontSize: 22 }} />
            </Box>
            <Chip
              label={isChhattisgarhi ? 'मंडी दरें' : 'मंडी दरें'}
              size="small"
              sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi ? 'मंडी भाव पल्स' : 'मंडी भाव व दलहन दरें'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.08rem', lineHeight: 1.25, mt: 0.2 }}>
              {isChhattisgarhi ? 'दैनिक मॉडल भाव' : 'दैनिक मॉडल भाव'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7e22ce', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
              🏪 {isChhattisgarhi ? '33 जिला के मंडी भाव →' : '33 जिलों के मंडी भाव →'}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Responsive 2-Column Agritech Command Center Layout on Desktop */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.8fr) minmax(0, 1fr)' },
          gap: { xs: 2, md: 2.5, lg: 3 },
          alignItems: 'start'
        }}
      >
        {/* Left / Main Column (Mobile: full width, Desktop: ~64%) */}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
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
                    label={activeBroadcasts[0].severity === 'urgent' ? (isChhattisgarhi ? 'अति गंभीर चेतावनी' : 'अति गंभीर चेतावनी') : activeBroadcasts[0].severity === 'warning' ? (isChhattisgarhi ? 'विभागीय चेतावनी' : 'विभागीय चेतावनी') : (isChhattisgarhi ? 'खेती सलाह' : 'कृषि परामर्श')}
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
                <span>{isChhattisgarhi ? 'जारीकर्ता:' : 'जारीकर्ता:'} {activeBroadcasts[0].author || (isChhattisgarhi ? 'कृषि विशेषज्ञ' : 'कृषि विशेषज्ञ')}</span>
                <span>{isChhattisgarhi ? 'वैधता:' : 'वैधता:'} {activeBroadcasts[0].validTill || (isChhattisgarhi ? 'सक्रिय' : 'सक्रिय')}</span>
              </Box>
            </Paper>
          )}

          {/* If Logged In: Live Plots Feed & Daily Tasks at Top of Main Column */}
          {activeFarmer && renderActivePlotsAndDailyTasksCard()}

          {/* Floating Weather & Spray Card */}
          <Card
            id="kaka-weather-card"
            className={highlightWeatherCard ? 'kaka-spotlight-pulse' : ''}
            sx={{
              mb: 2.2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Top Row: Temp, Condition, Spray Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Typography sx={{ fontSize: { xs: '1.9rem', sm: '2.2rem' }, lineHeight: 1 }}>
                  {weather?.conditionIcon || '🌤️'}
                </Typography>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
                      {weather ? `${weather.temp}°` : (weatherLoading ? '--°' : '30°')}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>
                      {weather
                        ? (isChhattisgarhi ? (weather.conditionTextCg || weather.conditionText) : weather.conditionText)
                        : (weatherLoading ? (isChhattisgarhi ? 'लाइव मौसम लोड होत हे...' : 'लाइव मौसम लोड हो रहा है...') : (isChhattisgarhi ? 'उघरा अकास' : 'साफ मौसम'))}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.3, flexWrap: 'wrap' }}>
                    <Typography
                      variant="caption"
                      onClick={() => setOpenDistrictPicker(true)}
                      sx={{
                        color: '#1b5e20',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.3,
                        borderRadius: 1.5,
                        px: 0.7,
                        py: 0.15,
                        bgcolor: 'rgba(27,94,32,0.08)',
                        '&:hover': { bgcolor: 'rgba(27,94,32,0.16)' }
                      }}
                    >
                      📍 {activeFarmer?.village ? `${activeFarmer.village}, ${selectedDistrict}` : selectedDistrict} <span style={{ fontSize: '0.64rem', color: '#2e7d32' }}>({isChhattisgarhi ? 'बदलव ▾' : 'बदलें ▾'})</span>
                    </Typography>

                    {isGpsLocation ? (
                      <Chip
                        size="small"
                        icon={<MyLocationIcon sx={{ fontSize: '11px !important', color: '#1b5e20 !important' }} />}
                        label={isChhattisgarhi ? 'लाइव GPS' : 'लाइव GPS'}
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          bgcolor: '#e8f5e9',
                          color: '#1b5e20',
                          border: '1px solid #a5d6a7'
                        }}
                      />
                    ) : (
                      <Button
                        size="small"
                        onClick={handleDetectLiveGps}
                        disabled={detectingGps}
                        startIcon={<MyLocationIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{
                          py: 0.1,
                          px: 0.8,
                          minWidth: 0,
                          height: 22,
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          bgcolor: '#eff6ff',
                          color: '#0284c7',
                          borderRadius: 3,
                          textTransform: 'none',
                          border: '1px solid #bae6fd',
                          '&:hover': { bgcolor: '#e0f2fe', borderColor: '#38bdf8' }
                        }}
                      >
                        {detectingGps
                          ? (isChhattisgarhi ? 'खोजत हे...' : 'खोज रहे हैं...')
                          : (isChhattisgarhi ? '🎯 अपन जगह खोजव (GPS)' : '🎯 वर्तमान जगह लें (GPS)')}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Spray Safety Badge & Voice button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <KakaWalkthroughButton featureId="home" />
                <Chip
                  label={(isChhattisgarhi ? (weather?.sprayAdvisory?.badgeCg || weather?.sprayAdvisory?.badge) : weather?.sprayAdvisory?.badge) || (isChhattisgarhi ? 'छिड़काव बर बने हे' : 'छिड़काव अनुकूल')}
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

            {/* Mawatha (Unseasonal Cyclonic Rain) Emergency Warning Banner */}
            {weather?.mawathaAlert?.hasRisk && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: '#fff7ed',
                  border: '2px solid #ea580c',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.6
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>🌾🌧️</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#c2410c', fontSize: '0.86rem' }}>
                      {isChhattisgarhi ? (weather.mawathaAlert.titleCg || weather.mawathaAlert.title) : weather.mawathaAlert.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={isChhattisgarhi ? (weather.mawathaAlert.badgeCg || weather.mawathaAlert.badge) : weather.mawathaAlert.badge}
                    size="small"
                    sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 900, fontSize: '0.66rem', height: 22, border: '1px solid #fdba74' }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#9a3412', fontSize: '0.76rem', lineHeight: 1.35, fontWeight: 700 }}>
                  {isChhattisgarhi ? (weather.mawathaAlert.adviceCg || weather.mawathaAlert.advice) : weather.mawathaAlert.advice}
                </Typography>
              </Box>
            )}

            {/* Lightning & Severe Squall Emergency Warning Banner */}
            {weather?.lightningRisk?.hasRisk && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: '#fff1f2',
                  border: '2px solid #e11d48',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.6
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <FlashOnIcon sx={{ color: '#e11d48', fontSize: 22 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#be123c', fontSize: '0.86rem' }}>
                      {isChhattisgarhi ? (weather.lightningRisk.titleCg || weather.lightningRisk.title) : weather.lightningRisk.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={isChhattisgarhi ? (weather.lightningRisk.badgeCg || weather.lightningRisk.badge) : weather.lightningRisk.badge}
                    size="small"
                    color="error"
                    sx={{ fontWeight: 900, fontSize: '0.66rem', height: 22 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#881337', fontSize: '0.76rem', lineHeight: 1.35, fontWeight: 700 }}>
                  {isChhattisgarhi ? (weather.lightningRisk.adviceCg || weather.lightningRisk.advice) : weather.lightningRisk.advice}
                </Typography>
              </Box>
            )}

            {/* Metrics Strip */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                  <WaterDropIcon sx={{ fontSize: 13, color: '#0288d1' }} /> {isChhattisgarhi ? 'पानी (बरसात)' : 'वर्षा'}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                  {weather ? `${weather.rainProbability}%` : (weatherLoading ? '--' : '0%')}
                </Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                  <AirIcon sx={{ fontSize: 13, color: '#00897b' }} /> {isChhattisgarhi ? 'हवा के गति' : 'हवा'}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                  {weather ? `${weather.windSpeed} km/h` : (weatherLoading ? '--' : '0 km/h')}
                </Typography>
              </Box>
              <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                  💧 {isChhattisgarhi ? 'उमस (नमी)' : 'आर्द्रता'}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                  {weather ? `${weather.humidity}%` : (weatherLoading ? '--' : '0%')}
                </Typography>
              </Box>
            </Box>

            {/* Satellite Soil Moisture & Smart Irrigation Meter (0-9cm root zone) */}
            {weather?.soilMoisture && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: weather.soilMoisture.bg || '#f0fdf4',
                  border: `1px solid ${weather.soilMoisture.color || '#2e7d32'}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200 }}>
                  <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>🌱</Typography>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: weather.soilMoisture.color || '#166534', fontSize: '0.8rem' }}>
                        {isChhattisgarhi ? 'खेत माटी नमी (0-9 सेमी जड़ क्षेत्र):' : 'खेत मिट्टी नमी (0-9 सेमी जड़ क्षेत्र):'} <strong>{weather.soilMoisture.percentage}%</strong>
                      </Typography>
                      <Chip
                        label={isChhattisgarhi ? weather.soilMoisture.labelCg : weather.soilMoisture.label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          bgcolor: '#ffffff',
                          color: weather.soilMoisture.color || '#166534',
                          border: `1px solid ${weather.soilMoisture.color || '#166534'}`,
                          borderRadius: '6px'
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={weather.soilMoisture.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(0,0,0,0.06)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: weather.soilMoisture.color || '#166534',
                          borderRadius: 3
                        },
                        mb: 0.4
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block', lineHeight: 1.3 }}>
                      {isChhattisgarhi ? weather.soilMoisture.adviceCg : weather.soilMoisture.advice}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* 48-Hour Fungal / Blast Disease Outbreak Early Warning Banner */}
            {weather?.diseaseRisk && weather.diseaseRisk.riskLevel !== 'low' && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: weather.diseaseRisk.riskLevel === 'high' ? '#fff1f2' : '#fffbeb',
                  border: `1.5px solid ${weather.diseaseRisk.riskLevel === 'high' ? '#fda4af' : '#fde68a'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.6
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>
                      {weather.diseaseRisk.riskLevel === 'high' ? '⚠️' : '🟡'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: weather.diseaseRisk.riskLevel === 'high' ? '#be123c' : '#b45309', fontSize: '0.82rem' }}>
                      {isChhattisgarhi ? weather.diseaseRisk.titleCg : weather.diseaseRisk.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={isChhattisgarhi ? weather.diseaseRisk.badgeCg : weather.diseaseRisk.badge}
                    size="small"
                    color={weather.diseaseRisk.riskLevel === 'high' ? 'error' : 'warning'}
                    sx={{ fontWeight: 800, fontSize: '0.66rem', height: 20 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.74rem', lineHeight: 1.35 }}>
                  {isChhattisgarhi ? weather.diseaseRisk.adviceCg : weather.diseaseRisk.advice}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.4, borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: weather.diseaseRisk.riskLevel === 'high' ? '#9f1239' : '#92400e', fontSize: '0.71rem' }}>
                    👉 {isChhattisgarhi ? weather.diseaseRisk.recommendedActionCg : weather.diseaseRisk.recommendedAction}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => { stopSpeech(); onNavigate('doctor'); }}
                    sx={{ fontSize: '0.7rem', py: 0.2, px: 1, color: '#d32f2f', fontWeight: 800, textTransform: 'none' }}
                  >
                    {isChhattisgarhi ? 'दवाई जांचव ➔' : 'दवा जांचें ➔'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Advisory line */}
            <Box sx={{ p: 1.2, bgcolor: '#f1f8e9', borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 1.5, border: '1px solid #dcedc8' }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.76rem', lineHeight: 1.35, fontWeight: 600 }}>
                {(isChhattisgarhi ? (weather?.sprayAdvisory?.advisoryCg || weather?.sprayAdvisory?.advisory) : weather?.sprayAdvisory?.advisory) || (isChhattisgarhi ? 'धान म कल्ला अऊ बाली आवत बेरा खेत म 2-3 सेमी पानी राखव। शांत मौसम म कीटनाशक छिड़कव।' : 'धान में कल्ले और बालियां आते समय खेत में 2-3 सेमी जलस्तर रखें। शांत मौसम में कीटनाशक छिड़काव करें।')}
              </Typography>
            </Box>

            {/* 72-Hour Safe Harvest & Sun-Drying Window */}
            {weather?.harvestDryingWindow && (
              <Box
                sx={{
                  p: 1.2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  bgcolor: weather.harvestDryingWindow.bg || '#f0fdf4',
                  border: `1.5px solid ${weather.harvestDryingWindow.borderColor || '#bbf7d0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.6
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <WbSunnyIcon sx={{ color: weather.harvestDryingWindow.color || '#166534', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: weather.harvestDryingWindow.color || '#166534', fontSize: '0.82rem' }}>
                      {isChhattisgarhi ? (weather.harvestDryingWindow.titleCg || weather.harvestDryingWindow.title) : weather.harvestDryingWindow.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={isChhattisgarhi ? (weather.harvestDryingWindow.badgeCg || weather.harvestDryingWindow.badge) : weather.harvestDryingWindow.badge}
                    size="small"
                    sx={{
                      bgcolor: '#ffffff',
                      color: weather.harvestDryingWindow.color || '#166534',
                      border: `1px solid ${weather.harvestDryingWindow.color || '#166534'}`,
                      fontWeight: 800,
                      fontSize: '0.66rem',
                      height: 20
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.74rem', lineHeight: 1.35 }}>
                  {isChhattisgarhi ? (weather.harvestDryingWindow.adviceCg || weather.harvestDryingWindow.advice) : weather.harvestDryingWindow.advice}
                </Typography>
              </Box>
            )}

            {/* Compact 3-Day Forecast Strip */}
            {weather?.forecast3Days && (
              <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: '#2e7d32' }} /> {isChhattisgarhi ? '3 दिन के मौसम अनुमान:' : '3-दिवसीय मौसम अनुमान:'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {weather.forecast3Days.map((f, idx) => (
                    <Box key={idx} sx={{ p: 0.8, bgcolor: idx === 0 ? '#e8f5e9' : '#fafafa', borderRadius: 2, textAlign: 'center', border: idx === 0 ? '1px solid #c8e6c9' : '1px solid #f1f5f9' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: idx === 0 ? '#1b5e20' : '#64748b', fontSize: '0.7rem', display: 'block' }}>
                        {isChhattisgarhi ? (f.dayCg || (idx === 0 ? 'आज' : idx === 1 ? 'बिहान' : 'पर्सों')) : f.day.split(' ')[0]}
                      </Typography>
                      <Typography sx={{ fontSize: '1.1rem', my: 0.2 }}>{f.icon}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem', display: 'block' }}>
                        {f.tempMax}° / {f.tempMin}°
                      </Typography>
                      <Typography variant="caption" sx={{ color: f.rainProb > 40 ? '#d32f2f' : '#0288d1', fontSize: '0.64rem', fontWeight: 700 }}>
                        {isChhattisgarhi ? 'पानी' : 'वर्षा'} {f.rainProb}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Card>

          {/* Unified 8-Tile Modern App Launcher Grid (Prominently Placed Under Weather) */}
          <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              {isChhattisgarhi ? '⚡ मुख्य कृषि सेवा अऊ स्मार्ट टूल्स' : '⚡ मुख्य कृषि सेवाएं व स्मार्ट टूल्स'}
            </Typography>
            <Chip
              icon={<SensorsIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
              label={isChhattisgarhi ? '📡 डिवाइस हब' : '📡 डिवाइस हब'}
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

          <QuickLauncherGrid
            isChhattisgarhi={isChhattisgarhi}
            activeFarmer={activeFarmer}
            onNavigate={onNavigate}
            onOpenGpsTracker={() => setOpenGpsTracker(true)}
            onOpenMotorModal={() => handleRequireLogin('motor')}
            onOpenSoilIot={() => handleRequireLogin('soil')}
            onOpenMeraKhet={() => handleRequireLogin('khet')}
          />

          {/* High-Impact Today's Farm Action Card (🌾 आज खेत में 1 मुख्य काम) */}
          {(() => {
            const todayTask = getTodayActionableFarmTask({ activeFarmer, farmerPlots, weather, selectedDistrict, isChhattisgarhi });
            if (!todayTask) return null;
            return (
              <Card
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  mb: 2.2,
                  borderRadius: 3.5,
                  bgcolor: '#fafffa',
                  border: '1.5px solid #86efac',
                  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.08)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: '#1b5e20',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TaskAltIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#166534', fontSize: '0.92rem', lineHeight: 1.2 }}>
                        {isChhattisgarhi ? '🌾 आज खेत म 1 मुख्य काम' : '🌾 आज खेत में 1 मुख्य काम'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        {todayTask.source === 'plot'
                          ? (isChhattisgarhi ? `तुंहर खेत: ${todayTask.plotName} (${todayTask.cropName})` : `आपका पंजीकृत खेत: ${todayTask.plotName} (${todayTask.cropName})`)
                          : (isChhattisgarhi ? `📍 ${selectedDistrict} • ${todayTask.zoneName || 'मैदानी क्षेत्र'} (सामान्य कृषि अनुमान)` : `📍 ${selectedDistrict} • ${todayTask.zoneName || 'मैदानी क्षेत्र'} (सामान्य कृषि अनुमान)`)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Chip
                      label={todayTask.source === 'plot'
                        ? (isChhattisgarhi ? `🟢 मोर खेत (${todayTask.daysElapsed} दिन)` : `🟢 मेरा खेत (${todayTask.daysElapsed} दिन)`)
                        : (isChhattisgarhi ? `🏛️ ICAR/IGKV सामान्य चक्र` : `🏛️ ICAR/IGKV सामान्य चक्र`)}
                      size="small"
                      sx={{
                        bgcolor: todayTask.source === 'plot' ? '#e8f5e9' : '#f0fdf4',
                        color: '#1b5e20',
                        border: '1px solid #a5d6a7',
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        height: 22
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => speakText(`${todayTask.title}। ${todayTask.task}`)}
                      sx={{ bgcolor: '#f1f8e9', color: '#1b5e20', p: 0.6 }}
                    >
                      <VolumeUpIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.86rem', mb: 0.5 }}>
                  {todayTask.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', lineHeight: 1.5, mb: 1 }}>
                  {todayTask.task}
                </Typography>

                {/* Transparency & Personalized Plot Onboarding CTA Box (When in ICAR Normal Window Mode) */}
                {todayTask.source !== 'plot' && (
                  <Box
                    sx={{
                      p: 1.3,
                      mt: 0.8,
                      mb: 1.2,
                      borderRadius: 2.5,
                      bgcolor: '#f0fdf4',
                      border: '1.2px dashed #86efac',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 200, flex: 1 }}>
                      <Typography sx={{ fontSize: '1.2rem', lineHeight: 1, mt: 0.2 }}>📅</Typography>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#166534', fontSize: '0.78rem', lineHeight: 1.35, fontWeight: 800, display: 'block' }}>
                          {isChhattisgarhi
                            ? 'का तुंहर बोवाई तारीख अलग हे?'
                            : 'क्या आपकी बुआई तारीख अलग है?'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.7rem', lineHeight: 1.35, display: 'block' }}>
                          {isChhattisgarhi
                            ? 'केवल अपन फसल अऊ बोवाई तारीख चुनव — सही दिन-वार काम पाव।'
                            : 'केवल अपनी फसल व बुआई तारीख चुनें — सही दिन-वार सलाह पाएं।'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.66rem', lineHeight: 1.3, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.4, mt: 0.3, bgcolor: '#dcfce7', px: 0.8, py: 0.2, borderRadius: 1 }}>
                          <span>🔒</span>
                          {isChhattisgarhi
                            ? '100% सुरक्छित • कोनो कागजात या खसरा नइ लगे'
                            : '100% सुरक्षित • कोई कागज़ात या खसरा नहीं चाहिए'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        stopSpeech();
                        if (activeFarmer) setOpenMeraKhet(true);
                        else {
                          setPendingToolAction('khet');
                          setOpenQuickLogin(true);
                        }
                      }}
                      sx={{
                        bgcolor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        borderRadius: 2,
                        px: 1.6,
                        py: 0.6,
                        textTransform: 'none',
                        boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                        '&:hover': { bgcolor: '#15803d' }
                      }}
                    >
                      {isChhattisgarhi ? '📅 अपन बोवाई तारीख चुनव ➔' : '📅 अपनी बुआई तारीख चुनें ➔'}
                    </Button>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px dashed #cbd5e1', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>📌</span> {isChhattisgarhi ? 'समय ले काम निपटाव अऊ पैदावार बढ़ाव' : 'समय पर काम पूरा कर भरपूर पैदावार पाएं'}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                    onClick={() => {
                      stopSpeech();
                      if (todayTask.targetTab) onNavigate(todayTask.targetTab);
                      else if (todayTask.source === 'plot') setOpenMeraKhet(true);
                    }}
                    sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.75rem', py: 0.2, px: 1 }}
                  >
                    {todayTask.actionText || (isChhattisgarhi ? 'आगे देखव ➔' : 'आगे देखें ➔')}
                  </Button>
                </Box>
              </Card>
            );
          })()}

          {/* Mandi Rates Pulse (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.2 }}>
            {renderMandiPulseCard()}
          </Box>

          {/* Smart Chhattisgarh Farmer Assistance & Procurement Hub */}
          {renderCgAssistanceHubCard()}
        </Box>

        {/* Right / Sidebar Column (Desktop Command Center: md and up, ~36%, sticky) */}
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            gap: 2.5,
            minWidth: 0,
            position: { md: 'sticky' },
            top: { md: '80px' }
          }}
        >
          {/* 1. Mandi Rates Pulse Widget */}
          {renderMandiPulseCard()}
        </Box>
      </Box>
    </>
  );

  // 5C. Root Command Center Switcher (Seamless Dual-Mode: Logged-in Native vs Guest Public)
  const renderFarmerDashboard = () => (activeFarmer ? renderLoggedInNativeDashboard() : renderGuestDashboard());

  return (
    <Box sx={{ pb: 1, pt: 0 }} className="fade-in">
      {renderFarmerDashboard()}

      {/* Modals & Dialogs (On-Demand Lazy Loaded) */}
      <Suspense fallback={null}>
        {openMeraKhet && (
          <MeraKhetModal
            open={openMeraKhet}
            onClose={() => setOpenMeraKhet(false)}
            selectedDistrict={selectedDistrict}
            weatherContext={weather}
          />
        )}

        {openGpsTracker && (
          <FieldGpsTrackerModal
            open={openGpsTracker}
            onClose={() => setOpenGpsTracker(false)}
            onSaveArea={() => setOpenMeraKhet(true)}
          />
        )}

        {openSoilIot && (
          <SoilIotSensorModal
            open={openSoilIot}
            onClose={() => setOpenSoilIot(false)}
            onApplyToCalculator={() => onNavigate('schemes')}
          />
        )}

        {openMotorModal && (
          <MotorControllerModal
            open={openMotorModal}
            onClose={() => setOpenMotorModal(false)}
            weatherContext={weather}
          />
        )}

        {openDeviceHub && (
          <DeviceHubModal
            open={openDeviceHub}
            onClose={() => setOpenDeviceHub(false)}
            onOpenGpsTracker={() => setOpenGpsTracker(true)}
            onOpenSoilIot={() => setOpenSoilIot(true)}
            onOpenMotorModal={() => setOpenMotorModal(true)}
            onApplySoilToCalc={() => onNavigate('schemes')}
          />
        )}

        {shareModalOpen && (
          <ShareModal
            open={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
          />
        )}

        {openTokenGuide && (
          <TokenGuideModal
            open={openTokenGuide}
            onClose={() => setOpenTokenGuide(false)}
            initialAcres={Number(activeFarmer?.totalAcres || activeFarmer?.totalLandAcres) || 1.0}
            farmerName={activeFarmer?.name || ''}
          />
        )}
      </Suspense>

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
            <span>{isChhattisgarhi ? 'किसान साथी प्रवेश' : 'किसान साथी प्रवेश'}</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenQuickLogin(false)} disabled={loginLoading}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {renderSmartAuthCard(true)}
        </DialogContent>
      </Dialog>

      {/* 1-Tap Visual District & Live GPS Location Picker Modal */}
      <Dialog
        open={openDistrictPicker}
        onClose={() => setOpenDistrictPicker(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MyLocationIcon sx={{ color: '#2e7d32' }} />
            <span>{isChhattisgarhi ? '🗺️ अपन जिला चुनव' : '🗺️ अपना जिला चुनें'}</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenDistrictPicker(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {/* Top 1-Tap Live GPS Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setOpenDistrictPicker(false);
              handleDetectLiveGps();
            }}
            disabled={detectingGps}
            startIcon={<MyLocationIcon />}
            sx={{
              py: 1.2,
              mb: 2,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '0.92rem',
              bgcolor: '#1b5e20',
              '&:hover': { bgcolor: '#2e7d32' }
            }}
          >
            {isChhattisgarhi ? '🎯 अपन लाइव जगह (GPS ले खोजव)' : '🎯 मेरी लाइव लोकेशन (GPS द्वारा पहचानें)'}
          </Button>

          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, mb: 1, display: 'block' }}>
            {isChhattisgarhi ? 'या नीचे दिए सूची ले जिला छू के चुनव:' : 'या नीचे दी गई सूची से 1-टैप में जिला चुनें:'}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
            {Object.entries(CG_DISTRICT_COORDS).map(([distKey, info]) => {
              const isSelected = distKey === selectedDistrict;
              return (
                <Button
                  key={distKey}
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => {
                    if (typeof onDistrictChange === 'function') {
                      onDistrictChange(distKey, false);
                    }
                    setOpenDistrictPicker(false);
                    notify.success(isChhattisgarhi ? `📍 जिला सेट होगे: ${distKey}` : `📍 जिला सेट हुआ: ${distKey}`);
                  }}
                  sx={{
                    py: 1,
                    px: 0.8,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'none',
                    bgcolor: isSelected ? '#1b5e20' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    borderColor: isSelected ? '#1b5e20' : '#cbd5e1',
                    '&:hover': {
                      bgcolor: isSelected ? '#2e7d32' : '#f1f5f9',
                      borderColor: '#1b5e20'
                    }
                  }}
                >
                  {info.name || distKey}
                </Button>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
