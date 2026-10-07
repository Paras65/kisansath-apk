import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Button
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import GetAppIcon from '@mui/icons-material/GetApp';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import AndroidIcon from '@mui/icons-material/Android';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SensorsIcon from '@mui/icons-material/Sensors';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { speakText, stopSpeech, subscribeSpeechState } from '../utils/speech';
import { isNativePlatform } from '../utils/capacitorUtils';
import { appConfig } from '../config/appConfig';
import { shareApp } from '../utils/shareUtils';
import { ShareModal } from './ShareModal';
import { notify } from '../services/notificationService';
import { CG_DISTRICT_COORDS } from '../services/weatherService';

const NAV_ITEMS = [
  { id: 'home', label: 'होम', icon: HomeIcon },
  { id: 'doctor', label: 'फसल डॉक्टर', icon: LocalHospitalIcon },
  { id: 'schemes', label: 'खाद व योजना', icon: CalculateIcon },
  { id: 'mandi', label: 'मंडी भाव', icon: StorefrontIcon },
  { id: 'chaupal', label: 'चौपाल व रेंटल', icon: ForumIcon },
];

export const Header = ({
  selectedDistrict,
  onDistrictChange,
  onInstallClick,
  isInstallable,
  currentTab = 'home',
  onNavigate = () => {},
  onOpenDeviceHub = () => {},
  onOpenAdmin = () => {}
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [speaking, setSpeaking] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      notify.warning('आपके डिवाइस में GPS सुविधा उपलब्ध नहीं है।');
      return;
    }
    setDetectingGps(true);
    notify.info('📡 GPS द्वारा नजदीकी कृषि मौसम केंद्र का पता लगाया जा रहा है...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        let closestDistrict = 'रायपुर';
        let minDistance = Infinity;
        Object.entries(CG_DISTRICT_COORDS).forEach(([dist, coords]) => {
          const d = Math.hypot(coords.lat - latitude, coords.lon - longitude);
          if (d < minDistance) {
            minDistance = d;
            closestDistrict = dist;
          }
        });
        onDistrictChange(closestDistrict);
        notify.success(`📍 GPS स्थान प्राप्त: ${closestDistrict} (लाइव मौसम सक्रिय)`);
      },
      (err) => {
        setDetectingGps(false);
        notify.info('GPS अनुमति नहीं मिली। कृपया सूची से अपना जिला चुनें।');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notify.success('इंटरनेट कनेक्शन पुनः स्थापित हुआ (ऑनलाइन मोड)');
    };
    const handleOffline = () => {
      setIsOnline(false);
      notify.warning('इंटरनेट बंद है। ऐप सुरक्षित ऑफलाइन मोड में काम कर रहा है।');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
      const text = `${appConfig.appName} ऐप में आपका स्वागत है। फसल बुआई, खाद कैलकुलेटर, रोग निदान, कृषक उन्नति योजना और मंडी भाव के लिए नीचे दिए गए विकल्पों का चयन करें।`;
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
            maxWidth: '1280px',
            mx: 'auto',
            px: { xs: 1.5, sm: 2.5, md: 3, lg: 4 },
            py: 0.6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#dcedc8'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AgricultureIcon sx={{ fontSize: 16, color: '#fbc02d' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#e2f5d5', fontSize: '0.74rem' }}>
              {appConfig.stateName} किसान कल्याण एवं कृषि विकास मंच
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isOnline && (
              <Chip
                icon={<WifiOffIcon sx={{ fontSize: '13px !important', color: '#ffcc80' }} />}
                label="ऑफ़लाइन"
                size="small"
                sx={{ bgcolor: '#d84315', color: '#fff', height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            )}
            <Button
              size="small"
              startIcon={<PhoneInTalkIcon sx={{ fontSize: 13 }} />}
              onClick={handleCallHelpline}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.12)',
                py: 0.2,
                px: 1.2,
                fontSize: '0.7rem',
                borderRadius: 4,
                fontWeight: 700,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
              }}
            >
              हेल्पलाइन: {appConfig.helpline.label}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Bar */}
      <Toolbar
        sx={{
          maxWidth: '1280px',
          mx: 'auto',
          width: '100%',
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2.5, md: 3, lg: 4 },
          minHeight: { xs: 60, md: 68 },
          gap: { xs: 1, md: 1.5 }
        }}
      >
        {/* App Logo, Name & Universal Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 }, flexShrink: 0 }}>
          {currentTab !== 'home' && (
            <Tooltip title="होम स्क्रीन पर वापस जाएं">
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
              src="/icons/kisan-icon-512.png"
              onError={(e) => { e.currentTarget.src = '/icons/kisan-icon.svg'; }}
              alt={appConfig.appName}
              sx={{
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                borderRadius: 2.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem', lg: '1.32rem' }, fontWeight: 800, lineHeight: 1.1, color: '#ffffff' }}>
                {appConfig.appName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.7rem', letterSpacing: 0.3, display: { xs: 'none', sm: 'block' } }}>
                {appConfig.appTagline}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Desktop Navigation Links (Visible on md and above) */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: { md: 0.5, lg: 0.8 } }}>
          {NAV_ITEMS.map((item) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {/* District selector & GPS locator */}
          <Tooltip title="📍 मेरा वर्तमान स्थान (GPS द्वारा स्वतः पहचानें)">
            <IconButton
              onClick={handleGpsLocation}
              disabled={detectingGps}
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: detectingGps ? '#4ade80' : '#fff',
                width: 36,
                height: 36,
                borderRadius: 2.5,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <MyLocationIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <FormControl size="small" sx={{ minWidth: { xs: 110, sm: 135 } }}>
            <Select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              sx={{
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                bgcolor: 'rgba(255,255,255,0.14)',
                borderRadius: 2.5,
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#fff' },
                '.MuiSvgIcon-root': { color: '#fff' },
                height: 36
              }}
            >
              <MenuItem value="रायपुर">रायपुर (Raipur)</MenuItem>
              <MenuItem value="बिलासपुर">बिलासपुर (Bilaspur)</MenuItem>
              <MenuItem value="दुर्ग">दुर्ग (Durg)</MenuItem>
              <MenuItem value="राजनांदगांव">राजनांदगांव (Rajnandgaon)</MenuItem>
              <MenuItem value="धमतरी">धमतरी (Dhamtari)</MenuItem>
              <MenuItem value="कवर्धा">कबीरधाम / कवर्धा</MenuItem>
              <MenuItem value="बलौदाबाजार">बलौदाबाजार</MenuItem>
              <MenuItem value="जगदलपुर">बस्तर / जगदलपुर</MenuItem>
              <MenuItem value="महासमुंद">महासमुंद (Mahasamund)</MenuItem>
              <MenuItem value="जांजगीर-चांपा">जांजगीर-चांपा</MenuItem>
              <MenuItem value="रायगढ़">रायगढ़ (Raigarh)</MenuItem>
              <MenuItem value="कोरबा">कोरबा (Korba)</MenuItem>
              <MenuItem value="अंबिकापुर">सरगुजा / अंबिकापुर</MenuItem>
              <MenuItem value="कांकेर">उत्तर बस्तर कांकेर</MenuItem>
              <MenuItem value="बेमेतरा">बेमेतरा (Bemetara)</MenuItem>
              <MenuItem value="बालोद">बालोद (Balod)</MenuItem>
              <MenuItem value="गरियाबंद">गरियाबंद (Gariaband)</MenuItem>
              <MenuItem value="मुंगेली">मुंगेली (Mungeli)</MenuItem>
            </Select>
          </FormControl>

          {/* Smart Centralized Device Hub Button */}
          <Tooltip title="स्मार्ट डिवाइस व ब्लूटूथ हब">
            <IconButton
              onClick={onOpenDeviceHub}
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: 2.5,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <SensorsIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Dedicated Admin Portal Button (Desktop Only) */}
          <Tooltip title="समर्पित कृषि प्रशासन पोर्टल (Admin Portal)">
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

          {/* Voice Assistance Button */}
          <Tooltip title={speaking ? 'आवाज बंद करें' : 'हिंदी में आवाज में सुनें'}>
            <IconButton
              onClick={handleVoiceWelcome}
              sx={{
                bgcolor: speaking ? '#f59e0b' : 'rgba(255,255,255,0.14)',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: 2.5,
                boxShadow: speaking ? '0 0 12px rgba(245,158,11,0.6)' : 'none',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: speaking ? '#d97706' : 'rgba(255,255,255,0.25)' }
              }}
            >
              {speaking ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Compact APK Download Icon (Suppressed in Native APK & Hidden on Mobile xs) */}
          {appConfig.apkDownloadUrl && !isNativePlatform() && (
            <Tooltip title={`Android APK डाउनलोड करें (v${appConfig.appVersion})`}>
              <IconButton
                component="a"
                href={appConfig.apkDownloadUrl}
                target="_blank"
                download
                aria-label="Android APK डाउनलोड"
                sx={{
                  bgcolor: 'rgba(255,235,59,0.18)',
                  color: '#ffeb3b',
                  width: 36,
                  height: 36,
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

          {/* Share App Button */}
          <Tooltip title="किसान भाइयों को ऐप शेयर करें">
            <IconButton
              onClick={() => setShareModalOpen(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: 2.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </AppBar>
  );
};

