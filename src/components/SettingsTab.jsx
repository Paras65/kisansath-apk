import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  CircularProgress,
  IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SensorsIcon from '@mui/icons-material/Sensors';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import ShareIcon from '@mui/icons-material/Share';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScienceIcon from '@mui/icons-material/Science';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import { useLanguage, tCg } from '../utils/i18n';
import { appConfig } from '../config/appConfig';
import { getActiveFarmer, logoutFarmer, loginFarmer } from '../services/farmerService';
import { speakText } from '../utils/speech';
import { checkForAppUpdate } from '../services/updateService';
import { notify } from '../services/notificationService';
import { CG_DISTRICT_COORDS, detectCurrentLocationDistrict } from '../services/weatherService';
import { isNativePlatform } from '../utils/capacitorUtils';
import { DeviceHubModal } from './DeviceHubModal';
import { FaqModal } from './FaqModal';
import { ShareModal } from './ShareModal';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { MotorControllerModal } from './MotorControllerModal';

export const SettingsTab = ({
  selectedDistrict,
  onDistrictChange,
  isGpsLocation = false,
  onOpenAdmin = () => {},
  onNavigate = () => {}
}) => {
  const { isChhattisgarhi, isHindi, setLanguage } = useLanguage();
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());
  const [detectingGps, setDetectingGps] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [openDistrictDialog, setOpenDistrictDialog] = useState(false);

  // Modals
  const [openDeviceHub, setOpenDeviceHub] = useState(false);
  const [openFaq, setOpenFaq] = useState(false);
  const [openShare, setShareModalOpen] = useState(false);
  const [openGpsTracker, setOpenGpsTracker] = useState(false);
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [openMotorModal, setOpenMotorModal] = useState(false);

  // Login Modal
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: '', name: '', pin: '1234' });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const handleSessionChange = (e) => {
      setActiveFarmer(e.detail || getActiveFarmer());
    };
    window.addEventListener('kisan_farmer_session_changed', handleSessionChange);
    return () => {
      window.removeEventListener('kisan_farmer_session_changed', handleSessionChange);
    };
  }, []);

  // 1-Tap GPS Location Detection
  const handleDetectGps = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      notify.warning(tCg('मोबाइल म GPS सुविधा नइये।', 'डिवाइस में GPS सुविधा उपलब्ध नहीं है।'));
      return;
    }
    setDetectingGps(true);
    notify.info(tCg('📡 GPS ले तीर के मौसम केंद्र खोजे जावत हे...', '📡 GPS द्वारा नजदीकी कृषि मौसम केंद्र का पता लगाया जा रहा है...'));
    try {
      const res = await detectCurrentLocationDistrict(true);
      setDetectingGps(false);
      if (res && res.district) {
        if (typeof onDistrictChange === 'function') {
          onDistrictChange(res.district, true);
        }
        notify.success(tCg(`📍 GPS ले मिले जगह: ${res.district}`, `📍 वर्तमान स्थान सेट हुआ: ${res.district}`));
        speakText(isChhattisgarhi ? `अपन जगह ${res.district} सेट होगे` : `आपके स्थान ${res.district} सेट हो गया`);
      }
    } catch {
      setDetectingGps(false);
      notify.warning(tCg('GPS अनुमति नइ मिलिस। लोकेशन चालू करव।', 'GPS अनुमति नहीं मिली। कृपया लोकेशन चालू करें।'));
    }
  };

  // App Update Check
  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    notify.info(tCg('🔄 नवा अपडेट जांचे जावत हे...', '🔄 नए ऐप अपडेट की जांच हो रही है...'));
    try {
      const res = await checkForAppUpdate(true);
      setCheckingUpdate(false);
      if (res && res.hasUpdate) {
        notify.success(tCg(`🎉 नवा अपडेट उपलब्ध हे (v${res.latestVersion})!`, `🎉 नया अपडेट उपलब्ध है (v${res.latestVersion})!`));
      } else {
        notify.success(tCg('✓ तुंहर ऐप एकदम नवीनतम वर्ज़न म हे।', '✓ आपकी ऐप एकदम नवीनतम संस्करण पर है।'));
      }
    } catch {
      setCheckingUpdate(false);
      notify.info('ऐप अपडेट जांच पूर्ण।');
    }
  };

  // Farmer Logout
  const handleLogout = () => {
    logoutFarmer();
    setActiveFarmer(null);
    notify.info(tCg('सफलतापूर्वक लॉगआउट। आपके सबो डेटा सुरक्षित हे।', 'सफलतापूर्वक लॉगआउट। आपका डेटा सुरक्षित है।'));
  };

  // Farmer Quick Login Submit
  const handleLoginSubmit = async () => {
    if (!loginForm.phone || loginForm.phone.length < 10) {
      notify.warning('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await loginFarmer({
        phone: loginForm.phone,
        name: loginForm.name || 'किसान साथी',
        pin: loginForm.pin || '1234',
        district: selectedDistrict
      });
      if (res.success) {
        setActiveFarmer(res.farmer);
        setOpenLoginDialog(false);
        notify.success(tCg(`स्वागत हे, ${res.farmer.name || 'किसान साथी'}!`, `स्वागत है, ${res.farmer.name || 'किसान साथी'}!`));
      } else {
        notify.error(res.error || 'लॉगिन असफल रहा।');
      }
    } catch {
      notify.error('लॉगिन में त्रुटि हुई।');
    } finally {
      setLoginLoading(false);
    }
  };

  // Clear App Cache & Reset
  const handleClearCache = () => {
    if (window.confirm(isChhattisgarhi ? 'का आप ऑफ़लाइन कैशे साफ करना चाहत हव?' : 'क्या आप ऐप का ऑफलाइन कैशे साफ करना चाहते हैं?')) {
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      notify.success(isChhattisgarhi ? 'कैशे साफ होगे। ऐप एकदम ताज़ा हे।' : 'कैश साफ हो गया। ऐप अब ताज़ा है।');
    }
  };

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', pb: 4 }} className="fade-in">
      
      {/* 1. Header Banner */}
      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          boxShadow: '0 6px 20px rgba(27,94,32,0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#ffeb3b',
              fontSize: 26
            }}
          >
            <SettingsIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: '1.15rem', sm: '1.3rem' }, lineHeight: 1.2 }}>
              {isChhattisgarhi ? 'किसान सेटिंग्स व प्रोफ़ाइल' : 'सेटिंग्स व किसान प्रोफ़ाइल'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.78rem' }}>
              {isChhattisgarhi
                ? 'भाषा, जिला GPS, स्मार्ट डिवाइस, ऐप अपडेट अऊ खाता सेटिंग्स'
                : 'भाषा, जिला GPS, स्मार्ट डिवाइस, ऐप अपडेट व खाता नियंत्रण'}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`v${appConfig.appVersion} • ${isNativePlatform() ? 'Android TWA' : 'PWA'}`}
          size="small"
          sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 900, fontSize: '0.72rem', height: 24 }}
        />
      </Box>

      {/* 2. Farmer Account / Profile Card */}
      <Card
        sx={{
          mb: 2.5,
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 1.5, px: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ color: '#166534', fontSize: 22 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {isChhattisgarhi ? '👤 किसान खाता व पहचान' : '👤 किसान खाता व पहचान'}
            </Typography>
          </Box>
          {activeFarmer ? (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#166534 !important' }} />}
              label={isChhattisgarhi ? 'सत्यापित किसान' : 'प्रमाणित किसान'}
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
            />
          ) : (
            <Chip
              label={isChhattisgarhi ? 'अतिथि किसान (Guest)' : 'अतिथि किसान (Guest)'}
              size="small"
              sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
            />
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          {activeFarmer ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>
                    {activeFarmer.name || (isChhattisgarhi ? 'किसान साथी' : 'किसान साथी')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                    📱 +91 {activeFarmer.phone} • 📍 {activeFarmer.village ? `${activeFarmer.village}, ` : ''}{activeFarmer.district || selectedDistrict}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
                  onClick={handleLogout}
                  sx={{ borderRadius: 2, fontWeight: 800, fontSize: '0.74rem', textTransform: 'none' }}
                >
                  {isChhattisgarhi ? 'लॉगआउट करव' : 'लॉगआउट'}
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1, bgcolor: '#f8fafc', p: 1.5, borderRadius: 2.5, border: '1px solid #f1f5f9' }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                    कुल दर्ज रकबा:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    {activeFarmer.totalAcres || activeFarmer.totalLandAcres || '1.0'} एकड़
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                    धान उपार्जन दर:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100' }}>
                    ₹{appConfig.paddyScheme.totalRate}/क्विं.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                    सुरक्षा पिन स्थिति:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
                    सक्रिय (4-अंक)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                    क्लाउड बैकअप:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                    ✓ सुरक्षित सिंक
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {isChhattisgarhi ? 'अपन किसान खाता खोलव' : 'अपना किसान खाता खोलें'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {isChhattisgarhi
                    ? '10 सेकंड म मोबाइल नंबर ले खाता बनाव • कोनो खसरा या जमीन के कागजात नइ लगे'
                    : '10 सेकंड में मोबाइल से खाता बनाएं • शून्य कागज़ात, कोई खसरा नंबर नहीं चाहिए'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<LockOpenIcon sx={{ fontSize: 17 }} />}
                onClick={() => setOpenLoginDialog(true)}
                sx={{
                  bgcolor: '#1b5e20',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.8,
                  '&:hover': { bgcolor: '#14532d' }
                }}
              >
                {isChhattisgarhi ? '🔑 खाता खोलव / लॉगिन' : '🔑 खाता खोलें / लॉगिन'}
              </Button>
            </Box>
          )}
        </Box>
      </Card>

      {/* 3. Settings Grid (Language, District, Audio) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
        
        {/* Card A: Language & Voice Assistant */}
        <Card sx={{ borderRadius: 3.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LanguageIcon sx={{ color: '#166534', fontSize: 22 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {isChhattisgarhi ? 'बोली अऊ भाषा चयन (Language)' : 'भाषा एवं बोली चयन (Language)'}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <Paper
              elevation={0}
              onClick={() => {
                setLanguage('cg');
                notify.info('🌾 बोली बदलिस: छत्तीसगढ़ी म सेट हे');
                speakText('जय जोहार संगवारी! छत्तीसगढ़ी भाषा सेट होगे।');
              }}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                border: isChhattisgarhi ? '2px solid #16a34a' : '1px solid #e2e8f0',
                bgcolor: isChhattisgarhi ? '#f0fdf4' : '#fafafa',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: isChhattisgarhi ? '#14532d' : '#334155' }}>
                🌾 छत्तीसगढ़ी
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                डिफ़ॉल्ट बोली (मातृभाषा)
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              onClick={() => {
                setLanguage('hi');
                notify.info('भाषा बदली: हिंदी में सेट है');
                speakText('नमस्ते किसान साथी! हिंदी भाषा सेट हो गई है।');
              }}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                border: isHindi ? '2px solid #16a34a' : '1px solid #e2e8f0',
                bgcolor: isHindi ? '#f0fdf4' : '#fafafa',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: isHindi ? '#14532d' : '#334155' }}>
                🇮🇳 मानक हिंदी
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                सरल व शुद्ध हिंदी
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                🔊 बोलकर सुनो (Voice Assistant)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                बहिरा काका वॉयस अवतार व ऑडियो सलाह
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
              onClick={() => speakText(isChhattisgarhi ? 'जय जोहार! किसान साथी ऐप म तुंहर स्वागत हे।' : 'नमस्ते! किसान साथी ऐप में आपका स्वागत है।')}
              sx={{ borderRadius: 2, fontWeight: 800, fontSize: '0.72rem', color: '#166534', borderColor: '#a7f3d0' }}
            >
              आवाज़ टेस्ट
            </Button>
          </Box>
        </Card>

        {/* Card B: District & GPS Location */}
        <Card sx={{ borderRadius: 3.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LocationOnIcon sx={{ color: '#166534', fontSize: 22 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {isChhattisgarhi ? 'जिला अऊ कृषि मौसम केंद्र' : 'जिला एवं कृषि मौसम केंद्र'}
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #f1f5f9', mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>
                वर्तमान चयनित जिला:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#166534', fontSize: '1.1rem' }}>
                📍 {activeFarmer?.village ? `${activeFarmer.village}, ` : ''}{selectedDistrict} {isGpsLocation && <span style={{ fontSize: '0.72rem', color: '#15803d' }}>(लाइव GPS)</span>}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              onClick={() => setOpenDistrictDialog(true)}
              sx={{ bgcolor: '#16a34a', color: '#fff', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2 }}
            >
              बदलें ▾
            </Button>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleDetectGps}
            disabled={detectingGps}
            startIcon={<MyLocationIcon sx={{ fontSize: 16 }} />}
            sx={{
              py: 0.8,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.78rem',
              color: '#0284c7',
              borderColor: '#bae6fd',
              bgcolor: '#f0f9ff',
              '&:hover': { bgcolor: '#e0f2fe', borderColor: '#38bdf8' }
            }}
          >
            {detectingGps
              ? (isChhattisgarhi ? '📡 खोजत हन...' : '📡 खोज रहे हैं...')
              : (isChhattisgarhi ? '🎯 अपन लाइव जगह खोजव (1-टैप GPS)' : '🎯 मेरी लाइव लोकेशन लें (1-टैप GPS)')}
          </Button>
        </Card>
      </Box>

      {/* 4. Smart Devices & Hardware Hub */}
      <Card sx={{ mb: 2.5, borderRadius: 3.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SensorsIcon sx={{ color: '#166534', fontSize: 22 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {isChhattisgarhi ? '📡 स्मार्ट डिवाइस व ब्लूटूथ हार्डवेयर हब' : '📡 स्मार्ट डिवाइस व ब्लूटूथ हार्डवेयर हब'}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setOpenDeviceHub(true)}
            sx={{ borderRadius: 2, fontWeight: 800, fontSize: '0.72rem', color: '#166534', borderColor: '#a7f3d0' }}
          >
            डिवाइस हब खोलें ➔
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {/* Motor IoT */}
          <Paper
            elevation={0}
            onClick={() => setOpenMotorModal(true)}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#f0f9ff',
              border: '1px solid #bae6fd',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#e0f2fe' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369a1', fontSize: '0.84rem' }}>
                ट्यूबवेल मोटर
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block' }}>
              घर बैठे बोरवेल मोटर चालू/बंद करें
            </Typography>
          </Paper>

          {/* Soil IoT */}
          <Paper
            elevation={0}
            onClick={() => setOpenSoilIot(true)}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#dcfce7' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <ScienceIcon sx={{ color: '#16a34a', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803d', fontSize: '0.84rem' }}>
                स्मार्ट मिट्टी सेंसर
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block' }}>
              ब्लूटूथ से लाइव NPK पोषण जांचें
            </Typography>
          </Paper>

          {/* Field GPS */}
          <Paper
            elevation={0}
            onClick={() => setOpenGpsTracker(true)}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#fdf4ff',
              border: '1px solid #f5d0fe',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#fae8ff' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <DirectionsWalkIcon sx={{ color: '#a855f7', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#9333ea', fontSize: '0.84rem' }}>
                खेत सीमा GPS
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block' }}>
              मेड़ पर चलकर खेत का रकबा नापें
            </Typography>
          </Paper>
        </Box>
      </Card>

      {/* 5. System, Updates & Zero-PII Offline Data */}
      <Card sx={{ mb: 2.5, borderRadius: 3.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <SecurityIcon sx={{ color: '#166534', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {isChhattisgarhi ? 'सुरक्षा, डेटा व सिस्टम अपडेट' : 'सुरक्षा, डेटा एवं सिस्टम अपडेट'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Row 1: Check Update */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: '#f8fafc', borderRadius: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
                ऐप संस्करण (App Version): v{appConfig.appVersion}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                नवीनतम सुरक्षित रिलीज • {isNativePlatform() ? 'Android TWA' : 'Web PWA'}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              sx={{ borderRadius: 2, fontWeight: 800, fontSize: '0.72rem', color: '#166534', borderColor: '#a7f3d0' }}
            >
              {checkingUpdate ? 'जांच जारी...' : 'अपडेट जांचें'}
            </Button>
          </Box>

          {/* Row 2: Offline Zero-PII Policy */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803d', fontSize: '0.84rem' }}>
                🔒 100% सुरक्षित शून्य-PII ऑफ़लाइन नीति
              </Typography>
              <Typography variant="caption" sx={{ color: '#166534', fontSize: '0.72rem' }}>
                कोई खसरा, बी-1 या जमीन दस्तावेज स्टोर नहीं होता • पूर्णतः गोपनीय
              </Typography>
            </Box>
            <Button
              size="small"
              variant="text"
              color="error"
              startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
              onClick={handleClearCache}
              sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'none' }}
            >
              कैशे साफ करें
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 6. Help, Share & Admin Link */}
      <Card sx={{ borderRadius: 3.5, bgcolor: '#ffffff', border: '1px solid #e2e8f0', p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
          📞 {isChhattisgarhi ? 'सहायता अऊ सीधा संपर्क' : 'सहायता व सीधा संपर्क'}
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mb: 2 }}>
          {/* Call Center */}
          <Button
            component="a"
            href={`tel:${appConfig.helpline?.phone || '18001801551'}`}
            variant="outlined"
            startIcon={<PhoneInTalkIcon />}
            sx={{
              py: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.76rem',
              color: '#166534',
              borderColor: '#a7f3d0',
              bgcolor: '#f0fdf4',
              textTransform: 'none'
            }}
          >
            कॉल सेंटर: {appConfig.helpline?.phone || '1800-180-1551'}
          </Button>

          {/* FAQs */}
          <Button
            variant="outlined"
            onClick={() => setOpenFaq(true)}
            startIcon={<HelpOutlineIcon />}
            sx={{
              py: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.76rem',
              color: '#0284c7',
              borderColor: '#bae6fd',
              bgcolor: '#f0f9ff',
              textTransform: 'none'
            }}
          >
            अक्सर पूछे जाने वाले सवाल
          </Button>

          {/* Share App */}
          <Button
            variant="outlined"
            onClick={() => setShareModalOpen(true)}
            startIcon={<ShareIcon />}
            sx={{
              py: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.76rem',
              color: '#7c3aed',
              borderColor: '#ddd6fe',
              bgcolor: '#faf5ff',
              textTransform: 'none'
            }}
          >
            किसान साथी शेयर करें
          </Button>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Dedicated Admin Portal Direct Link */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.2, bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
              🏛️ कृषि प्रशासन व सुपर एडमिन पोर्टल
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
              कृषि विस्तार अधिकारी (RAEO) एवं व्यवस्थापक हेतु आरक्षित सुरक्षित कक्ष
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 17 }} />}
            onClick={onOpenAdmin}
            sx={{
              bgcolor: '#0284c7',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.75rem',
              borderRadius: 2,
              '&:hover': { bgcolor: '#0369a1' }
            }}
          >
            एडमिन प्रवेश
          </Button>
        </Box>
      </Card>

      {/* District Picker Dialog */}
      <Dialog
        open={openDistrictDialog}
        onClose={() => setOpenDistrictDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ color: '#2e7d32' }} />
            <span>{isChhattisgarhi ? '🗺️ अपन जिला चुनव' : '🗺️ अपना जिला चुनें'}</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenDistrictDialog(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
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
                    setOpenDistrictDialog(false);
                    notify.success(tCg(`📍 जिला सेट होगे: ${distKey}`, `📍 जिला सेट हुआ: ${distKey}`));
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

      {/* Quick Farmer Login Dialog */}
      <Dialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockOpenIcon sx={{ color: '#2e7d32' }} />
            <span>किसान साथी प्रवेश</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenLoginDialog(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label="मोबाइल नंबर (10 अंक) *"
              placeholder="98765 43210"
              fullWidth
              size="small"
              value={loginForm.phone}
              onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            />
            <TextField
              label="किसान का नाम (वैकल्पिक)"
              placeholder="उदा. रामेश्वर साहू"
              fullWidth
              size="small"
              value={loginForm.name}
              onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
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
              helperText="डिफ़ॉल्ट 1234 • साझा फोन पर आपका डेटा सुरक्षित रहेगा"
            />
            <Button
              variant="contained"
              fullWidth
              disabled={loginLoading || loginForm.phone.length < 10}
              onClick={handleLoginSubmit}
              sx={{
                bgcolor: '#1b5e20',
                color: '#fff',
                fontWeight: 800,
                py: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: '#14532d' }
              }}
            >
              {loginLoading ? <CircularProgress size={20} color="inherit" /> : 'खाता सक्रिय करें ➔'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Shared Modals */}
      <DeviceHubModal
        open={openDeviceHub}
        onClose={() => setOpenDeviceHub(false)}
        onOpenGpsTracker={() => setOpenGpsTracker(true)}
        onOpenSoilIot={() => setOpenSoilIot(true)}
        onOpenMotorModal={() => setOpenMotorModal(true)}
        onApplySoilToCalc={() => onNavigate('schemes')}
      />
      <FaqModal open={openFaq} onClose={() => setOpenFaq(false)} />
      <ShareModal open={openShare} onClose={() => setShareModalOpen(false)} />
      <FieldGpsTrackerModal open={openGpsTracker} onClose={() => setOpenGpsTracker(false)} />
      <SoilIotSensorModal open={openSoilIot} onClose={() => setOpenSoilIot(false)} onApplyToCalculator={() => onNavigate('schemes')} />
      <MotorControllerModal open={openMotorModal} onClose={() => setOpenMotorModal(false)} />

    </Box>
  );
};

