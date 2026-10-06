import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Typography,
  Button,
  CssBaseline,
  Fab
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import { theme } from './theme';
import { Header } from './components/Header';
import { InstallPrompt } from './components/InstallPrompt';
import { HomeTab } from './components/HomeTab';
import { CropDoctorTab } from './components/CropDoctorTab';
import { CalculatorSchemesTab } from './components/CalculatorSchemesTab';
import { MandiTab } from './components/MandiTab';
import { ChaupalTab } from './components/ChaupalTab';
import { GlobalNotification } from './components/GlobalNotification';
import { notify } from './services/notificationService';
import { appConfig } from './config/appConfig';
import { isNativePlatform, setNativeNavContext } from './utils/capacitorUtils';
import { stopSpeech, subscribeSpeechState } from './utils/speech';
import { DeviceHubModal } from './components/DeviceHubModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Kisan Saathi ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#fff8e1', border: '1.5px solid #ffe082', maxWidth: 450, mx: 'auto' }}>
            <Typography variant="h6" sx={{ color: '#b78103', fontWeight: 800, mb: 1 }}>
              ⚠️ जानकारी लोड करने में समस्या आई
            </Typography>
            <Typography variant="body2" sx={{ color: '#5d4037', mb: 2 }}>
              कृपया पुनः प्रयास करें या होम स्क्रीन पर लौटें।
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onReset) this.props.onReset();
              }}
              sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#1b5e20' } }}
            >
              होम पर लौटें
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedDistrict, setSelectedDistrict] = useState(appConfig.defaultDistrict);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);
  const [openDeviceHub, setOpenDeviceHub] = useState(false);

  // Synchronize global speech state
  useEffect(() => {
    const unsubscribe = subscribeSpeechState((speaking) => {
      setIsSpeakingActive(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Read URL query param if opened from PWA shortcut
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['home', 'doctor', 'schemes', 'mandi', 'chaupal'].includes(tabParam)) {
      setCurrentTab(tabParam);
    }
  }, []);

  // Listen for PWA beforeinstallprompt event (suppressed in native APK)
  useEffect(() => {
    if (isNativePlatform()) {
      setShowInstallBanner(false);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      notify.info('ऐप इंस्टॉल करने के लिए ब्राउज़र के 3 बिंदुओं (Menu) पर दबाकर "Add to Home screen" चुनें।');
    }
  };

  // Synchronize native Android APK navigation state with Capacitor hardware back button
  useEffect(() => {
    setNativeNavContext({
      currentTab,
      onNavigateHome: (tab) => handleTabChange(tab)
    });
  }, [currentTab]);

  // Hardware back button support for Android TWA / PWA
  useEffect(() => {
    const handlePopState = () => {
      stopSpeech(); // Stop any active speech on back navigation
      if (currentTab !== 'home') {
        setCurrentTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentTab]);

  const handleTabChange = (newTab) => {
    stopSpeech(); // Stop any active speech when switching tabs
    if (newTab !== currentTab) {
      try {
        // Use replaceState so history stack doesn't endlessly accumulate across tabs
        window.history.replaceState({ tab: newTab }, '', window.location.pathname + (newTab === 'home' ? '' : `?tab=${newTab}`));
      } catch (e) {}
      setCurrentTab(newTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalNotification />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8faf6' }}>
        {/* Top Header (Adaptive Desktop Nav & Mobile Header) */}
        <Header
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          onInstallClick={handleInstallClick}
          isInstallable={Boolean(deferredPrompt)}
          currentTab={currentTab}
          onNavigate={handleTabChange}
          onOpenDeviceHub={() => setOpenDeviceHub(true)}
        />

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <InstallPrompt
            onInstall={handleInstallClick}
            onDismiss={() => setShowInstallBanner(false)}
          />
        )}

        {/* Responsive Content Container: Mobile edge-to-edge with padding, Desktop spacious max-width */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: '1280px',
            mx: 'auto',
            px: { xs: 1.5, sm: 2.5, md: 3 },
            py: { xs: 1.5, sm: 2.5, md: 3 },
            pb: { xs: 11, md: 4 } // generous padding on mobile so bottom bar never obscures content
          }}
        >
          <ErrorBoundary key={currentTab} onReset={() => handleTabChange('home')}>
            {currentTab === 'home' && (
              <HomeTab
                onNavigate={handleTabChange}
                selectedDistrict={selectedDistrict}
              />
            )}
            {currentTab === 'doctor' && <CropDoctorTab selectedDistrict={selectedDistrict} />}
            {currentTab === 'schemes' && <CalculatorSchemesTab selectedDistrict={selectedDistrict} />}
            {currentTab === 'mandi' && <MandiTab selectedDistrict={selectedDistrict} />}
            {currentTab === 'chaupal' && <ChaupalTab selectedDistrict={selectedDistrict} />}
          </ErrorBoundary>
        </Box>

        {/* Mobile-Only Android/iOS Native Bottom Navigation Bar (Hidden on desktop md and up) */}
        <Paper
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1200,
            bgcolor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
            pb: 'env(safe-area-inset-bottom, 0px)'
          }}
          elevation={4}
        >
          <BottomNavigation
            value={currentTab}
            onChange={(e, newTab) => handleTabChange(newTab)}
            showLabels
            sx={{
              height: 64,
              bgcolor: 'transparent',
              '& .MuiBottomNavigationAction-root': {
                color: '#64748b',
                minWidth: 0,
                px: 0.5,
                py: 0.6,
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                '& .MuiSvgIcon-root': {
                  fontSize: 22,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderRadius: '14px',
                  px: 1,
                  py: 0.2
                },
                '&.Mui-selected': {
                  color: '#1b7a2d',
                  fontWeight: 800,
                  '& .MuiSvgIcon-root': {
                    bgcolor: '#e8f5e9',
                    color: '#1b5e20',
                    transform: 'scale(1.06)'
                  },
                  '& .MuiBottomNavigationAction-label': {
                    fontWeight: 900,
                    fontSize: '0.76rem',
                    color: '#1b5e20'
                  }
                }
              }
            }}
          >
            <BottomNavigationAction
              label="होम"
              value="home"
              icon={<HomeIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label="फसल डॉक्टर"
              value="doctor"
              icon={<LocalHospitalIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label="खाद व योजना"
              value="schemes"
              icon={<CalculateIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label="मंडी भाव"
              value="mandi"
              icon={<StorefrontIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label="चौपाल व रेंटल"
              value="chaupal"
              icon={<ForumIcon sx={{ fontSize: 24 }} />}
            />
          </BottomNavigation>
        </Paper>

        {/* Floating Global Stop Voice Button (बोलना बंद करें) */}
        {isSpeakingActive && (
          <Fab
            variant="extended"
            onClick={stopSpeech}
            sx={{
              position: 'fixed',
              bottom: { xs: 74, md: 24 },
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 3000,
              bgcolor: '#c62828',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.86rem',
              boxShadow: '0 6px 22px rgba(198, 40, 40, 0.55)',
              px: 2.5,
              py: 1,
              '&:hover': { bgcolor: '#b71c1c' },
              border: '2px solid #ffffff',
              textTransform: 'none'
            }}
          >
            <VolumeOffIcon sx={{ mr: 1, fontSize: 20 }} />
            🛑 बोलना बंद करें (Stop Voice)
          </Fab>
        )}
        {/* Centralized Smart Device & Hardware Hub */}
        <DeviceHubModal
          open={openDeviceHub}
          onClose={() => setOpenDeviceHub(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;

