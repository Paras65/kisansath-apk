import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { speakText, stopSpeech } from '../utils/speech';
import { useLanguage, tCg } from '../utils/i18n';
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
import { checkForAppUpdate } from '../services/updateService';
import { getPublicBroadcasts } from '../services/adminService';
import { getMandiRates, getCachedModuleData } from '../services/apiService';
import { fetchVillagesByPincode } from '../services/pincodeService';
import {
  getDeviceRegistry,
  updateDevice,
  subscribeDeviceRegistry
} from '../services/deviceManagerService';
import { SmartAuthCard } from './home/SmartAuthCard';
import { LoggedInNativeDashboard } from './home/LoggedInNativeDashboard';
import { GuestDashboard } from './home/GuestDashboard';

const MeraKhetModal = lazy(() => import('./MeraKhetModal').then((m) => ({ default: m.MeraKhetModal })));
const FieldGpsTrackerModal = lazy(() => import('./FieldGpsTrackerModal').then((m) => ({ default: m.FieldGpsTrackerModal })));
const SoilIotSensorModal = lazy(() => import('./SoilIotSensorModal').then((m) => ({ default: m.SoilIotSensorModal })));
const MotorControllerModal = lazy(() => import('./MotorControllerModal').then((m) => ({ default: m.MotorControllerModal })));
const DeviceHubModal = lazy(() => import('./DeviceHubModal').then((m) => ({ default: m.DeviceHubModal })));
const ShareModal = lazy(() => import('./ShareModal').then((m) => ({ default: m.ShareModal })));
const TokenGuideModal = lazy(() => import('./TokenGuideModal').then((m) => ({ default: m.TokenGuideModal })));

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

  // Real-time synchronization with smart device hardware registry
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
    name: '',
    phone: '',
    district: selectedDistrict || 'रायपुर',
    village: '',
    pincode: '',
    acres: '1.0'
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [pincodeVillages, setPincodeVillages] = useState([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState('');
  const [customVillageMode, setCustomVillageMode] = useState(false);

  // Sync district into loginForm when selectedDistrict changes
  useEffect(() => {
    setLoginForm((prev) => ({ ...prev, district: selectedDistrict || 'रायपुर' }));
  }, [selectedDistrict]);

  // Pincode auto-lookup handler
  const handlePincodeChange = async (pin) => {
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);
    setLoginForm((prev) => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      setPincodeInfo('');
      try {
        const result = await fetchVillagesByPincode(cleanPin);
        if (result && result.villages && result.villages.length > 0) {
          setPincodeVillages(result.villages);
          setCustomVillageMode(false);
          setLoginForm((prev) => ({
            ...prev,
            district: result.district || prev.district,
            village: result.villages[0] || ''
          }));
          setPincodeInfo(`✓ ${result.district || ''} (${result.villages.length} ग्राम मिले)`);
          notify.success(isChhattisgarhi ? `पिनकोड ले ${result.villages.length} गांव मिलिस` : `पिनकोड से ${result.villages.length} ग्राम प्राप्त हुए`);
        } else {
          setPincodeVillages([]);
          setCustomVillageMode(true);
          setPincodeInfo(isChhattisgarhi ? 'गांव के नाम हाथ ले लिखव' : 'कृपया ग्राम का नाम स्वयं दर्ज करें');
        }
      } catch {
        setPincodeVillages([]);
        setCustomVillageMode(true);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeVillages([]);
      setPincodeInfo('');
    }
  };

  const handleRequireLogin = (toolKey) => {
    if (activeFarmer) {
      if (toolKey === 'motor') setOpenMotorModal(true);
      else if (toolKey === 'soil') setOpenSoilIot(true);
      else if (toolKey === 'khet') setOpenMeraKhet(true);
      else if (toolKey === 'hub') setOpenDeviceHub(true);
    } else {
      setPendingToolAction(toolKey);
      setOpenQuickLogin(true);
    }
  };

  const handleQuickLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanPhone = (loginForm.phone || '').trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      notify.warning(tCg('कृपया 10 अंक के सही मोबाइल नंबर दर्ज करव', 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें'));
      return;
    }

    if (authMode === 'register' && !(loginForm.name || '').trim()) {
      notify.warning(tCg('कृपया अपन नाम दर्ज करव', 'कृपया अपना नाम दर्ज करें'));
      return;
    }

    setLoginLoading(true);
    try {
      const res = await loginFarmer({
        name: authMode === 'register' ? (loginForm.name || '').trim() : '',
        phone: cleanPhone,
        district: loginForm.district || selectedDistrict || 'रायपुर',
        village: loginForm.village || '',
        pincode: loginForm.pincode || '',
        acres: loginForm.acres || '1.0'
      });

      if (res && res.success) {
        setActiveFarmer(res.farmer);
        setOpenQuickLogin(false);
        notify.success(authMode === 'register'
          ? tCg(`सफलतापूर्वक पंजीकरण होगे! जोहार ${res.farmer.name} जी`, `सफलतापूर्वक पंजीकरण पूर्ण! स्वागत है ${res.farmer.name} जी`)
          : tCg(`सफलतापूर्वक प्रवेश! जोहार ${res.farmer.name} जी`, `सफलतापूर्वक लॉगिन पूर्ण! स्वागत है ${res.farmer.name} जी`));

        if (pendingToolAction === 'motor') setOpenMotorModal(true);
        else if (pendingToolAction === 'soil') setOpenSoilIot(true);
        else if (pendingToolAction === 'khet') setOpenMeraKhet(true);
        else if (pendingToolAction === 'hub') setOpenDeviceHub(true);
        setPendingToolAction(null);
      } else {
        notify.error(res?.message || tCg('प्रवेश म समस्या आईस, फिर प्रयास करव', 'प्रवेश में समस्या आई, पुनः प्रयास करें'));
      }
    } catch {
      notify.error(tCg('नेटवर्क समस्या, कृपया दोबारा प्रयास करव', 'नेटवर्क समस्या, कृपया पुनः प्रयास करें'));
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

  // Root Command Center Switcher (Seamless Dual-Mode: Logged-in Native vs Guest Public)
  const renderFarmerDashboard = () => (
    activeFarmer ? (
      <LoggedInNativeDashboard
        activeFarmer={activeFarmer}
        farmerPlots={farmerPlots}
        selectedPlotIndex={selectedPlotIndex}
        setSelectedPlotIndex={setSelectedPlotIndex}
        weather={weather}
        weatherLoading={weatherLoading}
        selectedDistrict={selectedDistrict}
        exactLocation={exactLocation}
        isChhattisgarhi={isChhattisgarhi}
        highlightWeatherCard={highlightWeatherCard}
        deviceRegistry={deviceRegistry}
        liveMandiRates={liveMandiRates}
        handleDirectMotorToggle={handleDirectMotorToggle}
        handleReadAdvisory={handleReadAdvisory}
        handleFarmerLogout={handleFarmerLogout}
        onNavigate={onNavigate}
        setOpenMeraKhet={setOpenMeraKhet}
        setOpenMotorModal={setOpenMotorModal}
        setOpenSoilIot={setOpenSoilIot}
        setOpenGpsTracker={setOpenGpsTracker}
        setOpenDeviceHub={setOpenDeviceHub}
        setOpenDistrictPicker={setOpenDistrictPicker}
        setOpenTokenGuide={setOpenTokenGuide}
      />
    ) : (
      <GuestDashboard
        updateInfo={updateInfo}
        activeFarmer={activeFarmer}
        farmerPlots={farmerPlots}
        weather={weather}
        weatherLoading={weatherLoading}
        selectedDistrict={selectedDistrict}
        exactLocation={exactLocation}
        isGpsLocation={isGpsLocation}
        isChhattisgarhi={isChhattisgarhi}
        highlightWeatherCard={highlightWeatherCard}
        detectingGps={detectingGps}
        activeBroadcasts={activeBroadcasts}
        liveMandiRates={liveMandiRates}
        handleDetectLiveGps={handleDetectLiveGps}
        handleReadAdvisory={handleReadAdvisory}
        handleRequireLogin={handleRequireLogin}
        onNavigate={onNavigate}
        setOpenMeraKhet={setOpenMeraKhet}
        setOpenMotorModal={setOpenMotorModal}
        setOpenGpsTracker={setOpenGpsTracker}
        setOpenDistrictPicker={setOpenDistrictPicker}
        setPendingToolAction={setPendingToolAction}
        setOpenQuickLogin={setOpenQuickLogin}
        setOpenTokenGuide={setOpenTokenGuide}
      />
    )
  );

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
