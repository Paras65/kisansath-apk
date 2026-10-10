import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Button,
  CircularProgress
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import AndroidIcon from '@mui/icons-material/Android';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SensorsIcon from '@mui/icons-material/Sensors';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { speakText, stopSpeech, subscribeSpeechState } from '../utils/speech';
import { isNativePlatform } from '../utils/capacitorUtils';
import { appConfig } from '../config/appConfig';
import { notify } from '../services/notificationService';
import { useLanguage } from '../utils/i18n';

export const Header = ({
  selectedDistrict = 'रायपुर',
  exactLocation = '',
  isGpsLocation = false,
  detectingGps = false,
  onDetectLiveGps = () => {},
  currentTab = 'home',
  onNavigate = () => {},
  onOpenDeviceHub = () => {},
  onOpenAdmin = () => {}
}) => {
  const { isChhattisgarhi, isHindi, setLanguage, t, tCg } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [speaking, setSpeaking] = useState(false);

  const navItems = [
    { id: 'home', label: t('tab_home'), icon: HomeIcon },
    { id: 'doctor', label: t('tab_doctor'), icon: LocalHospitalIcon },
    { id: 'schemes', label: t('tab_schemes'), icon: CalculateIcon },
    { id: 'mandi', label: t('tab_mandi'), icon: StorefrontIcon },
    { id: 'chaupal', label: t('tab_chaupal'), icon: ForumIcon },
  ];

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notify.success(tCg('इंटरनेट चालू होगे (ऑनलाइन मोड)', 'इंटरनेट कनेक्शन पुनः स्थापित हुआ (ऑनलाइन मोड)'));
    };
    const handleOffline = () => {
      setIsOnline(false);
      notify.warning(tCg('इंटरनेट बंद हे। ऐप सुरक्षित ऑफ़लाइन मोड म काम करत हे।', 'इंटरनेट बंद है। ऐप सुरक्षित ऑफलाइन मोड में काम कर रहा है।'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tCg]);

  // Sync Header speaker icon with global speech engine
  useEffect(() => {
    const unsub = subscribeSpeechState((isSpeaking) => {
      setSpeaking(isSpeaking);
    });
    return () => unsub();
  }, []);

  const handleVoiceWelcome = () => {
    if (speaking) {
      stopSpeech();
    } else {
      const text = tCg(
        `${appConfig.appName} ऐप म आप मन के स्वागत हे! फसल बुआई, खाद कैलकुलेटर, रोग निदान, कृषक उन्नति योजना अऊ मंडी भाव बर नीचे दिए गए विकल्प मन ला चुनव।`,
        `${appConfig.appName} ऐप में आपका स्वागत है। फसल बुआई, खाद कैलकुलेटर, रोग निदान, कृषक उन्नति योजना और मंडी भाव के लिए नीचे दिए गए विकल्पों का चयन करें।`
      );
      speakText(text);
    }
  };

  const handleCallHelpline = () => {
    window.location.href = `tel:${appConfig.helpline.phone}`;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        bgcolor: 'rgba(19, 78, 25, 0.98)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        zIndex: 1100,
        pt: 'env(safe-area-inset-top, 0px)'
      }}
    >
      {/* Top Banner / Emergency line */}
      <Box
        sx={{
          bgcolor: '#0e3814',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Box
          sx={{
            maxWidth: '1536px',
            mx: 'auto',
            px: { xs: 1.2, sm: 2, md: 3, lg: 4, xl: 5 },
            py: 0.4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.74rem',
            color: '#dcedc8'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
            <AgricultureIcon sx={{ fontSize: 15, color: '#fbc02d', flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#e2f5d5',
                fontSize: { xs: '0.68rem', sm: '0.74rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {appConfig.stateName} किसान कल्याण मंच
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0 }}>
            {!isOnline && (
              <Chip
                icon={<WifiOffIcon sx={{ fontSize: '12px !important', color: '#ffcc80' }} />}
                label="ऑफ़लाइन"
                size="small"
                sx={{ bgcolor: '#d84315', color: '#fff', height: 18, fontSize: '0.64rem', fontWeight: 700 }}
              />
            )}
            <Tooltip title="सरकारी किसान कॉल सेंटर (कृषि विभाग): केवल फसल, कीट व खेती सलाह हेतु">
              <Button
                size="small"
                startIcon={<PhoneInTalkIcon sx={{ fontSize: 12 }} />}
                onClick={handleCallHelpline}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  py: 0.1,
                  px: 1,
                  fontSize: { xs: '0.66rem', sm: '0.7rem' },
                  borderRadius: 4,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
                }}
              >
                कृषि सलाह: {appConfig.helpline.label}
              </Button>
            </Tooltip>
            <Tooltip title="किसान साथी ऐप सहायता: ऐप में तकनीकी समस्या, बग या सुझाव हेतु">
              <Button
                size="small"
                component="a"
                href={`mailto:${appConfig.supportEmail || 'support@init65.co.in'}`}
                startIcon={<EmailIcon sx={{ fontSize: 12 }} />}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  py: 0.1,
                  px: 1,
                  fontSize: { xs: '0.66rem', sm: '0.7rem' },
                  borderRadius: 4,
                  fontWeight: 700,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
                }}
              >
                ऐप सहायता: {appConfig.supportEmail || 'support@init65.co.in'}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Main Bar */}
      <Toolbar
        sx={{
          maxWidth: '1536px',
          mx: 'auto',
          width: '100%',
          justifyContent: 'space-between',
          px: { xs: 1.2, sm: 2, md: 3, lg: 4, xl: 5 },
          minHeight: { xs: 56, md: 66 },
          gap: { xs: 0.6, md: 1.5 }
        }}
      >
        {/* App Logo, Name & Universal Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 }, flexShrink: 0 }}>
          {currentTab !== 'home' && (
            <Tooltip title={isChhattisgarhi ? "होम स्क्रीन म वापस जावव" : "होम स्क्रीन पर वापस जाएं"}>
              <IconButton
                onClick={() => {
                  stopSpeech();
                  onNavigate('home');
                }}
                aria-label="वापस होम"
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(255,255,255,0.18)',
                  width: { xs: 34, sm: 38 },
                  height: { xs: 34, sm: 38 },
                  borderRadius: 2.5,
                  border: '1px solid rgba(255,255,255,0.25)',
                  mr: 0.4,
                  flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Tooltip>
          )}

          <Box
            onClick={() => {
              stopSpeech();
              onNavigate('home');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', flexShrink: 0 }}
          >
            <Box
              component="img"
              src="/icons/kisan-icon-512.webp"
              onError={(e) => { e.currentTarget.src = '/icons/kisan-icon.svg'; }}
              alt={appConfig.appName}
              width="42"
              height="42"
              sx={{
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                borderRadius: 2.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
            <Box>
              <Typography variant="h6" component="h1" sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem', lg: '1.32rem' }, fontWeight: 800, lineHeight: 1.1, color: '#ffffff' }}>
                {appConfig.appName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.7rem', letterSpacing: 0.3, display: { xs: 'none', sm: 'block' } }}>
                {t('app_tagline')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Desktop Navigation Links (Visible on md and above) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: { md: 0.5, lg: 0.8 } }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                startIcon={<IconComponent sx={{ fontSize: { md: 17, lg: 19 } }} />}
                sx={{
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.84)',
                  bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  backdropFilter: isActive ? 'blur(8px)' : 'none',
                  border: isActive ? '1px solid rgba(255,255,255,0.28)' : '1px solid transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: { md: '0.8rem', lg: '0.86rem' },
                  px: { md: 1.2, lg: 1.6 },
                  py: { md: 0.6, lg: 0.8 },
                  borderRadius: 2.5,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.12)',
                    color: '#ffffff'
                  }
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, sm: 1 }, flexShrink: 0 }}>
          {/* Exact Live GPS Location Pill (Matches User Uploaded Badge - 100% Live, Zero Map) */}
          <Tooltip
            title={
              isGpsLocation
                ? (isChhattisgarhi
                    ? `📍 लाइव GPS सक्रिय: ${exactLocation || selectedDistrict} (स्थान रिफ्रेश करे बर दबाओ)`
                    : `📍 लाइव GPS सक्रिय: ${exactLocation || selectedDistrict} (लोकेशन रिफ्रेश करने हेतु दबाएं)`)
                : (isChhattisgarhi
                    ? "🎯 अपन लाइव जगह खोजव (1-टैप GPS)"
                    : "🎯 मेरी लाइव लोकेशन लें (1-टैप GPS)")
            }
          >
            <Button
              size="small"
              onClick={onDetectLiveGps}
              disabled={detectingGps}
              startIcon={
                detectingGps ? (
                  <CircularProgress size={13} sx={{ color: '#166534' }} />
                ) : (
                  <MyLocationIcon sx={{ fontSize: 16, color: '#166534' }} />
                )
              }
              sx={{
                bgcolor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #86efac',
                borderRadius: '9999px',
                height: { xs: 32, sm: 35 },
                px: { xs: 1, sm: 1.4 },
                fontWeight: 800,
                fontSize: { xs: '0.72rem', sm: '0.78rem' },
                textTransform: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: '#dcfce7',
                  borderColor: '#4ade80',
                  transform: 'scale(1.02)',
                  boxShadow: '0 2px 8px rgba(22, 101, 52, 0.16)'
                }
              }}
            >
              {detectingGps ? (
                <span>{isChhattisgarhi ? 'खोजत हन...' : 'खोज रहे हैं...'}</span>
              ) : (
                <Box
                  component="span"
                  sx={{
                    maxWidth: { xs: 105, sm: 160, md: 220 },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    verticalAlign: 'bottom'
                  }}
                >
                  {exactLocation ? exactLocation : (isGpsLocation ? `लाइव GPS • ${selectedDistrict}` : 'लाइव GPS')}
                </Box>
              )}
            </Button>
          </Tooltip>

          {/* Language Switcher Segmented Capsule [ 🌾 छत्ती. | हिंदी ] */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 2.5,
              height: { xs: 34, sm: 36 },
              p: 0.3,
              gap: 0.3
            }}
          >
            <Button
              size="small"
              onClick={() => {
                setLanguage('cg');
                notify.info('🌾 बोली बदलिस: छत्तीसगढ़ी म सेट हे');
              }}
              sx={{
                py: 0.2,
                px: { xs: 0.7, sm: 1 },
                minWidth: 0,
                height: '100%',
                borderRadius: 2,
                fontSize: { xs: '0.68rem', sm: '0.74rem' },
                fontWeight: isChhattisgarhi ? 900 : 600,
                bgcolor: isChhattisgarhi ? '#ffeb3b' : 'transparent',
                color: isChhattisgarhi ? '#1b5e20' : 'rgba(255,255,255,0.85)',
                boxShadow: isChhattisgarhi ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                textTransform: 'none',
                lineHeight: 1,
                '&:hover': {
                  bgcolor: isChhattisgarhi ? '#fdd835' : 'rgba(255,255,255,0.15)'
                }
              }}
            >
              छत्ती.
            </Button>
            <Button
              size="small"
              onClick={() => {
                setLanguage('hi');
                notify.info('🌾 भाषा बदली: हिंदी में सेट है');
              }}
              sx={{
                py: 0.2,
                px: { xs: 0.7, sm: 1 },
                minWidth: 0,
                height: '100%',
                borderRadius: 2,
                fontSize: { xs: '0.68rem', sm: '0.74rem' },
                fontWeight: isHindi ? 900 : 600,
                bgcolor: isHindi ? '#ffeb3b' : 'transparent',
                color: isHindi ? '#1b5e20' : 'rgba(255,255,255,0.85)',
                boxShadow: isHindi ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
                textTransform: 'none',
                lineHeight: 1,
                '&:hover': {
                  bgcolor: isHindi ? '#fdd835' : 'rgba(255,255,255,0.15)'
                }
              }}
            >
              हिंदी
            </Button>
          </Box>

          {/* Smart Centralized Device Hub Button (Tablet & Desktop Only) */}
          <Tooltip title={isChhattisgarhi ? "स्मार्ट डिवाइस अउ ब्लूटूथ हब" : "स्मार्ट डिवाइस व ब्लूटूथ हब"}>
            <IconButton
              onClick={onOpenDeviceHub}
              aria-label="स्मार्ट डिवाइस हब"
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#fff',
                width: { xs: 34, sm: 36 },
                height: { xs: 34, sm: 36 },
                borderRadius: 2.5,
                display: { xs: 'none', md: 'inline-flex' },
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <SensorsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Dedicated Admin Portal Button (Desktop Only) */}
          <Tooltip title={isChhattisgarhi ? "कृषि प्रशासन पोर्टल (Admin Portal)" : "समर्पित कृषि प्रशासन पोर्टल (Admin Portal)"}>
            <Button
              onClick={onOpenAdmin}
              startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 17 }} />}
              sx={{
                bgcolor: 'rgba(56,189,248,0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56,189,248,0.3)',
                fontSize: '0.74rem',
                fontWeight: 800,
                py: 0.4,
                px: 1.2,
                borderRadius: 2.5,
                display: { xs: 'none', lg: 'inline-flex' },
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(56,189,248,0.28)', color: '#ffffff', borderColor: '#38bdf8' }
              }}
            >
              एडमिन पोर्टल
            </Button>
          </Tooltip>

          {/* Voice Assistance Button (Tablet & Desktop Only to avoid Mobile Header Crowding) */}
          <Tooltip title={speaking ? (isChhattisgarhi ? 'आवाज बंद करव' : 'आवाज बंद करें') : (isChhattisgarhi ? 'छत्तीसगढ़ी आवाज म सुनव' : 'हिंदी में आवाज में सुनें')}>
            <IconButton
              onClick={handleVoiceWelcome}
              aria-label="आवाज सहायता"
              sx={{
                bgcolor: speaking ? '#f59e0b' : 'rgba(255,255,255,0.14)',
                color: '#fff',
                width: { xs: 34, sm: 36 },
                height: { xs: 34, sm: 36 },
                borderRadius: 2.5,
                display: { xs: 'none', sm: 'inline-flex' },
                boxShadow: speaking ? '0 0 12px rgba(245,158,11,0.6)' : 'none',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: speaking ? '#d97706' : 'rgba(255,255,255,0.25)' }
              }}
            >
              {speaking ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Compact APK Download Icon (Suppressed in Native APK & Hidden on Mobile) */}
          {appConfig.apkDownloadUrl && !isNativePlatform() && (
            <Tooltip title={isChhattisgarhi ? `Android APK डाउनलोड करव (v${appConfig.appVersion})` : `Android APK डाउनलोड करें (v${appConfig.appVersion})`}>
              <IconButton
                component="a"
                href={appConfig.apkDownloadUrl}
                target="_blank"
                download
                aria-label="Android APK डाउनलोड"
                sx={{
                  bgcolor: 'rgba(255,235,59,0.18)',
                  color: '#ffeb3b',
                  width: { xs: 34, sm: 36 },
                  height: { xs: 34, sm: 36 },
                  borderRadius: 2.5,
                  border: '1px solid rgba(255,235,59,0.38)',
                  display: { xs: 'none', md: 'inline-flex' },
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255,235,59,0.32)',
                    color: '#ffffff',
                    borderColor: '#ffeb3b'
                  }
                }}
              >
                <AndroidIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Settings & Profile Hub Button (Universal on all screens - Mobile & Desktop) */}
          <Tooltip title={isChhattisgarhi ? "ऐप सेटिंग्स अउ किसान प्रोफ़ाइल" : "ऐप सेटिंग्स व किसान प्रोफ़ाइल"}>
            <IconButton
              onClick={() => onNavigate('settings')}
              aria-label="सेटिंग्स व प्रोफ़ाइल"
              sx={{
                bgcolor: currentTab === 'settings' ? '#ffeb3b' : 'rgba(255,255,255,0.14)',
                color: currentTab === 'settings' ? '#1b5e20' : '#ffffff',
                width: { xs: 34, sm: 36 },
                height: { xs: 34, sm: 36 },
                borderRadius: 2.5,
                border: currentTab === 'settings' ? '1.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                boxShadow: currentTab === 'settings' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: currentTab === 'settings' ? '#fff59d' : 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <SettingsIcon sx={{ fontSize: { xs: 19, sm: 21 } }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

