import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Typography,
  Button,
  CssBaseline
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';

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
import { speakText, stopSpeech, subscribeSpeechState } from './utils/speech';
import {
  startVoiceRecognition,
  stopVoiceRecognition,
  subscribeVoiceState,
  isVoiceSupported,
  extractAcreage,
} from './utils/voiceRecognition';
import { queryKakaBrain } from './services/kakaBrainService';
import { DraggableVoiceButton } from './components/DraggableVoiceButton';
import { useLanguage } from './utils/i18n';
import { detectCurrentLocationDistrict, CG_DISTRICT_COORDS, getCachedWeather } from './services/weatherService';
import { getActiveFarmer } from './services/farmerService';
import { DeviceHubModal } from './components/DeviceHubModal';
import { SuperAdminModal } from './components/SuperAdminModal';
import { AdminPortal } from './components/AdminPortal';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import AndroidIcon from '@mui/icons-material/Android';
import ShareIcon from '@mui/icons-material/Share';
import PublicIcon from '@mui/icons-material/Public';
import SyncIcon from '@mui/icons-material/Sync';
import { checkForAppUpdate } from './services/updateService';

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
  const { isChhattisgarhi, t } = useLanguage();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    try {
      const saved = localStorage.getItem('kisan_selected_district');
      if (saved && CG_DISTRICT_COORDS[saved]) return saved;
      const farmer = getActiveFarmer();
      if (farmer?.district && CG_DISTRICT_COORDS[farmer.district]) return farmer.district;
    } catch (e) {}
    return appConfig.defaultDistrict || 'रायपुर';
  });
  const [isGpsLocation, setIsGpsLocation] = useState(() => {
    try {
      return localStorage.getItem('kisan_is_gps_location') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Handler for district changes (manual or GPS)
  const handleDistrictChange = (newDistrict, fromGps = false) => {
    setSelectedDistrict(newDistrict);
    setIsGpsLocation(fromGps);
    try {
      localStorage.setItem('kisan_selected_district', newDistrict);
      localStorage.setItem('kisan_is_gps_location', fromGps ? 'true' : 'false');
    } catch (e) {}
  };

  // Automatically detect user's current GPS location on app mount
  useEffect(() => {
    let isCancelled = false;
    detectCurrentLocationDistrict(false)
      .then((res) => {
        if (!isCancelled && res?.district) {
          setSelectedDistrict(res.district);
          setIsGpsLocation(true);
          try {
            localStorage.setItem('kisan_selected_district', res.district);
            localStorage.setItem('kisan_is_gps_location', 'true');
          } catch (e) {}
        }
      })
      .catch((err) => {
        // Silent fallback - if GPS denied or timeout, preserve cached/fallback district
        console.log('[GPS Auto-detect] Geolocation fallback:', err?.message || err);
      });
    return () => {
      isCancelled = true;
    };
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [openDeviceHub, setOpenDeviceHub] = useState(false);
  const [openAdminModal, setOpenAdminModal] = useState(false);
  const [globalCheckingUpdate, setGlobalCheckingUpdate] = useState(false);

  const handleGlobalCheckUpdate = async () => {
    setGlobalCheckingUpdate(true);
    try {
      const info = await checkForAppUpdate(true);
      if (info && info.hasUpdate) {
        notify.success(`🎉 नया अपडेट उपलब्ध है: v${info.latestVersion}!`);
      } else {
        notify.info(`आप पहले से ही नवीनतम संस्करण (v${appConfig.appVersion}) चला रहे हैं।`);
      }
    } catch {
      notify.info(`वर्तमान संस्करण v${appConfig.appVersion} सक्रिय है।`);
    } finally {
      setGlobalCheckingUpdate(false);
    }
  };

  const [portalMode, setPortalMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || window.location.hash === '#admin') {
        return 'admin';
      }
    }
    return 'farmer';
  });

  // Synchronize hash / URL changes for dedicated Admin Portal routing
  useEffect(() => {
    const handleHashOrPopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (window.location.hash === '#admin' || params.get('portal') === 'admin') {
        setPortalMode('admin');
      } else {
        setPortalMode('farmer');
      }
    };
    window.addEventListener('hashchange', handleHashOrPopState);
    window.addEventListener('popstate', handleHashOrPopState);
    return () => {
      window.removeEventListener('hashchange', handleHashOrPopState);
      window.removeEventListener('popstate', handleHashOrPopState);
    };
  }, []);

  const handleOpenAdminPortal = () => {
    window.location.hash = 'admin';
    setPortalMode('admin');
  };

  const handleExitAdminPortal = () => {
    if (window.location.hash === '#admin') {
      try {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }
    setPortalMode('farmer');
  };

  // Synchronize global speech state
  useEffect(() => {
    const unsubscribe = subscribeSpeechState((speaking) => {
      setIsSpeakingActive(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Synchronize voice recognition listening state
  useEffect(() => {
    const unsubscribe = subscribeVoiceState(({ listening }) => {
      setIsVoiceListening(listening);
    });
    return () => unsubscribe();
  }, []);

  // Safe modal dismissal before voice navigation
  const closeAllActiveModals = () => {
    setOpenDeviceHub(false);
    setOpenAdminModal(false);
    if (typeof document !== 'undefined') {
      const openDialog = document.querySelector('.MuiDialog-root');
      if (openDialog) {
        const closeBtn =
          openDialog.querySelector('button[aria-label="close"]') ||
          openDialog.querySelector('button[aria-label="Close"]') ||
          openDialog.querySelector('button[data-action="close"]');
        if (closeBtn) {
          try { closeBtn.click(); } catch {}
        }
      }
    }
  };

  // Green pill FAB handler:
  // • If TTS is speaking → stop it
  // • If voice is listening → stop it
  // • Otherwise → start voice recognition and route on result with spoken audio feedback
  const handleVoiceFab = () => {
    if (isSpeakingActive) { stopSpeech(); return; }
    if (isVoiceListening) { stopVoiceRecognition(); return; }
    if (!isVoiceSupported()) {
      notify.warning('आपका browser आवाज़ पहचान support नहीं करता।');
      speakText(isChhattisgarhi ? 'फोन म आवाज़ पहचान सुविधा नई हे।' : 'फोन में आवाज़ पहचान की सुविधा उपलब्ध नहीं है।');
      return;
    }

    startVoiceRecognition(
      (transcript, route) => {
        if (!transcript) return;

        // In-Modal Action 1: Close active modal
        if (route?.type === 'modal_action' && route?.action === 'close') {
          closeAllActiveModals();
          notify.info(isChhattisgarhi ? 'डायलॉग बंद होगे' : 'डायलॉग बंद किया गया');
          speakText(isChhattisgarhi ? route.spokenCg : route.spokenHi);
          return;
        }

        // In-Modal Action 2: Save / Submit active modal form
        if (route?.type === 'modal_action' && route?.action === 'save') {
          const openDialog = document.querySelector('.MuiDialog-root');
          if (openDialog) {
            const submitBtn =
              openDialog.querySelector('button[type="submit"]') ||
              Array.from(openDialog.querySelectorAll('button')).find((b) =>
                /सहेजें|सबमिट|save|submit|जोड़ें/i.test(b.textContent || '')
              );
            if (submitBtn) {
              submitBtn.click();
              notify.success(isChhattisgarhi ? '💾 सहेजे के आदेश पूरा होगे' : '💾 जानकारी सहेज दी गई');
              speakText(isChhattisgarhi ? route.spokenCg : route.spokenHi);
              return;
            }
          }
        }

        // Always query Bhaira Kaka AI Brain first for deep agricultural intelligence & direct answers
        const cachedWeather = getCachedWeather(selectedDistrict);
        const brain = queryKakaBrain(transcript, isChhattisgarhi, {
          weather: cachedWeather,
          selectedDistrict,
        });

        // In-Modal Action 3: Acreage fill inside active modal if open
        const acreVal = brain.extractedAcre || extractAcreage(transcript);
        const openDialog = document.querySelector('.MuiDialog-root');
        if (acreVal && openDialog) {
          const acreInput = openDialog.querySelector('input[type="number"], input[name*="acre"], input[id*="acre"]');
          if (acreInput) {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (nativeSetter) {
              nativeSetter.call(acreInput, acreVal);
              acreInput.dispatchEvent(new Event('input', { bubbles: true }));
              acreInput.dispatchEvent(new Event('change', { bubbles: true }));
              notify.success(isChhattisgarhi ? `🌾 ${acreVal} एकड़ सेट होगे` : `🌾 ${acreVal} एकड़ सेट हो गया`);
              speakText(isChhattisgarhi ? `हव बेटा, ${acreVal} एकड़ सेट कर देगेंव!` : `जी भैया, ${acreVal} एकड़ सेट कर दिया गया है।`);
              return;
            }
          }
        }

        // Determine destination route (from brain or keyword route)
        const targetRoute = brain.route || route;
        const spokenResponse = isChhattisgarhi
          ? (brain.textCg || route?.spokenCg)
          : (brain.textHi || route?.spokenHi);

        // 1. Spoken Audio: Speak the direct concrete answer immediately!
        if (spokenResponse) {
          speakText(spokenResponse);
        }

        // 2. Visual Notification Toast
        if (targetRoute) {
          notify.success(isChhattisgarhi ? `👴🏻 काका: ${brain.textCg || route?.spokenCg}` : `👴🏻 काका: ${brain.textHi || route?.spokenHi}`);
        } else {
          notify.info(isChhattisgarhi ? `👴🏻 काका: ${brain.textCg}` : `👴🏻 काका: ${brain.textHi}`);
        }

        // 3. Seamless Navigation to Target Screen
        if (targetRoute) {
          closeAllActiveModals();
          if (targetRoute.type === 'tab') {
            handleTabChange(targetRoute.target);
          } else if (targetRoute.target === 'token') {
            handleTabChange('mandi');
            window.dispatchEvent(new CustomEvent('kisan-open-modal', { detail: { modal: 'token' } }));
          } else if (targetRoute.target === 'motor' || targetRoute.target === 'khet') {
            handleTabChange('home');
            window.dispatchEvent(new CustomEvent('kisan-open-modal', { detail: { modal: targetRoute.target } }));
          }
        }

        // 4. Dispatch Agentic Action Event (Immediate + 300ms post-render for component spotlight & auto-calculation)
        if (brain.action) {
          window.dispatchEvent(new CustomEvent('kisan_kaka_action', { detail: brain.action }));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('kisan_kaka_action', { detail: brain.action }));
          }, 300);
        }
      },
      (errMsg, errCode) => {
        notify.warning(errMsg);
        if (errCode === 'not-allowed') {
          speakText(
            isChhattisgarhi
              ? 'अरे बेटा, तोर मोबाइल के माइक बंद हे! सेटिंग म जाके चालू करव तभे न तोर काका सुनही!'
              : 'अरे भैया, मोबाइल का माइक बंद है! सेटिंग में जाकर चालू करें तभी आपका काका सुनेगा!'
          );
        } else if (errCode === 'network') {
          speakText(
            isChhattisgarhi
              ? 'इंटरनेट थोरकिन सुस्त चलत हे संगी, थोड़ा धीरज धरव, काका सुनत हे!'
              : 'इंटरनेट धीमा चल रहा है भैया, थोड़ा धीरज रखें, काका सुन रहा है!'
          );
        } else if (errCode === 'no-speech' || errCode === 'timeout') {
          speakText(
            isChhattisgarhi
              ? 'अरे भइया, कछु बोलव त सही! तोर बहिरा काका कान लगाके बइठे हे!'
              : 'अरे भैया, कुछ बोलिए तो सही! आपका काका कान लगाकर बैठा है!'
          );
        }
      }
    );
  };

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

  // Hardware back button & modal stack unwinding for Android TWA / PWA / Native
  useEffect(() => {
    const handlePopState = (e) => {
      stopSpeech(); // Stop any active speech on back navigation

      // 1) First check if an open MUI Dialog/Modal is active (safe stack unwinding)
      const openDialog = document.querySelector('.MuiDialog-root');
      if (openDialog) {
        const closeBtn =
          openDialog.querySelector('button[aria-label="close"]') ||
          openDialog.querySelector('button[aria-label="Close"]') ||
          openDialog.querySelector('button[data-action="close"]');
        if (closeBtn) {
          closeBtn.click();
          return;
        }
      }

      // 2) Return smoothly to home tab if on another tab
      if (e.state && e.state.tab) {
        setCurrentTab(e.state.tab);
      } else if (currentTab !== 'home') {
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
        if (newTab === 'home') {
          window.history.replaceState({ tab: 'home' }, '', window.location.pathname);
        } else {
          // Push state for non-home tabs so Android/browser back button returns to home cleanly
          window.history.pushState({ tab: newTab }, '', window.location.pathname + `?tab=${newTab}`);
        }
      } catch (e) {}
      setCurrentTab(newTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (portalMode === 'admin') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AdminPortal onExit={handleExitAdminPortal} />
        <GlobalNotification />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalNotification />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8faf6' }}>
        {/* Top Header (Adaptive Desktop Nav & Mobile Header) */}
        <Header
          selectedDistrict={selectedDistrict}
          onDistrictChange={handleDistrictChange}
          isGpsLocation={isGpsLocation}
          onInstallClick={handleInstallClick}
          isInstallable={Boolean(deferredPrompt)}
          currentTab={currentTab}
          onNavigate={handleTabChange}
          onOpenDeviceHub={() => setOpenDeviceHub(true)}
          onOpenAdmin={handleOpenAdminPortal}
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
            maxWidth: '1536px',
            mx: 'auto',
            px: { xs: 1.5, sm: 2.5, md: 3, lg: 4, xl: 5 },
            py: { xs: 1.5, sm: 2.5, md: 3 },
            pb: { xs: '76px', md: '28px' }
          }}
        >
          <ErrorBoundary key={currentTab} onReset={() => handleTabChange('home')}>
            {currentTab === 'home' && (
              <HomeTab
                onNavigate={handleTabChange}
                selectedDistrict={selectedDistrict}
                isGpsLocation={isGpsLocation}
                onDistrictChange={handleDistrictChange}
              />
            )}
            {currentTab === 'doctor' && <CropDoctorTab selectedDistrict={selectedDistrict} />}
            {currentTab === 'schemes' && <CalculatorSchemesTab selectedDistrict={selectedDistrict} />}
            {currentTab === 'mandi' && <MandiTab selectedDistrict={selectedDistrict} />}
            {currentTab === 'chaupal' && <ChaupalTab selectedDistrict={selectedDistrict} />}
          </ErrorBoundary>

          {/* Mobile Farmer Informational Footer Card (Visible only on xs and sm) */}
          <Box
            component="footer"
            sx={{
              display: { xs: 'block', md: 'none' },
              mt: 3,
              mb: 1,
              p: 2,
              borderRadius: 3,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              textAlign: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.8 }}>
              <Box
                component="img"
                src="/icons/kisan-icon-512.png"
                onError={(e) => { e.currentTarget.src = '/icons/kisan-icon.svg'; }}
                alt={appConfig.appName}
                sx={{ width: 28, height: 28, borderRadius: 1.5 }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.88rem' }}>
                {appConfig.appName} • {appConfig.appTagline}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.74rem', display: 'block', mb: 0.8 }}>
              {appConfig.stateName} के किसानों का भरोसेमंद डिजिटल मंच
            </Typography>

            {/* User Reference Image 1: Compact Dark Capsule Pill */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <Box
                onClick={handleGlobalCheckUpdate}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.2,
                  bgcolor: '#1c1917',
                  border: '1.2px solid #3f3f46',
                  borderRadius: '9999px',
                  px: 2,
                  py: 0.55,
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  '&:hover': { bgcolor: '#27272a', borderColor: '#71717a' }
                }}
              >
                <PublicIcon sx={{ fontSize: 17, color: '#38bdf8' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>
                  v{appConfig.appVersion}
                </Typography>
                <SyncIcon
                  sx={{
                    fontSize: 15,
                    color: '#f59e0b',
                    animation: globalCheckingUpdate ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                  {globalCheckingUpdate
                    ? (isChhattisgarhi ? 'जांचत हन...' : 'जांच...')
                    : (isChhattisgarhi ? 'अपडेट जांचव' : 'अपडेट जांचें')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', pt: 0.8, borderTop: '1px dashed #e2e8f0' }}>
              <Typography
                component="a"
                href={`tel:${appConfig.helpline?.phone || '18001801551'}`}
                variant="caption"
                sx={{ color: '#1b5e20', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                📞 कृषि सलाह (किसान कॉल सेंटर): {appConfig.helpline?.phone || '1800-180-1551'}
              </Typography>
              <Typography
                component="a"
                href={`mailto:${appConfig.supportEmail || 'support@init65.co.in'}`}
                variant="caption"
                sx={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                ✉️ ऐप तकनीकी सहायता: {appConfig.supportEmail || 'support@init65.co.in'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                🔒 100% सुरक्षित • ऑफलाइन सुलभ
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Desktop Agricultural Portal Footer (Visible on md and above) */}
        <Box
          component="footer"
          sx={{
            display: { xs: 'none', md: 'block' },
            bgcolor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            mt: 'auto',
            pt: 4,
            pb: 3,
            px: { md: 4, lg: 6 }
          }}
        >
          <Box sx={{ maxWidth: '1536px', mx: 'auto' }}>
            {/* 3-Column Structured Layout */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { md: '1.25fr 1.15fr 1fr' },
                gap: 4,
                mb: 3
              }}
            >
              {/* Column 1: Branding & State Agriculture Identity */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    component="img"
                    src="/icons/kisan-icon-512.png"
                    onError={(e) => { e.currentTarget.src = '/icons/kisan-icon.svg'; }}
                    alt={appConfig.appName}
                    sx={{ width: 44, height: 44, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.15rem', lineHeight: 1.2 }}>
                      {appConfig.appName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, fontSize: '0.78rem' }}>
                      {appConfig.appTagline}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.6, mb: 1.5 }}>
                  {appConfig.stateName} के किसान भाइयों के लिए बुआई पूर्व मिट्टी परीक्षण, संतुलित NPK पोषण, फसल रोग निदान से लेकर ₹3,100/क्विंटल धान उपार्जन एवं मंडी बिक्री तक का संपूर्ण डिजिटल समाधान।
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', px: 1.2, py: 0.4, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.74rem' }}>
                    🌿 संस्करण v{appConfig.appVersion} • {isNativePlatform() ? 'Android TWA/APK' : 'Web PWA'}
                  </Typography>
                </Box>
              </Box>

              {/* Column 2: Government Crop Advisory vs App Technical Support */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  📞 आधिकारिक हेल्पलाइन व ऐप सहायता
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <PhoneInTalkIcon sx={{ fontSize: 18, color: '#16a34a', mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.8rem', display: 'block' }}>
                        सरकारी किसान कॉल सेंटर (कृषि विभाग): {appConfig.helpline.phone}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        सुबह 6:00 से रात 10:00 बजे तक (केवल फसल, रोग, खाद व खेती सलाह हेतु)
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 18, color: '#0284c7', mt: 0.2 }} />
                    <Box>
                      <Typography
                        component="a"
                        href={`mailto:${appConfig.supportEmail || 'support@init65.co.in'}`}
                        variant="caption"
                        sx={{ color: '#0284c7', fontWeight: 800, fontSize: '0.8rem', display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        ऐप तकनीकी सहायता: {appConfig.supportEmail || 'support@init65.co.in'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        किसान साथी ऐप में समस्या, लॉगिन कठिनाई या सुझाव हेतु (Init65 सपोर्ट)
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <SecurityIcon sx={{ fontSize: 18, color: '#0284c7', mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, fontSize: '0.8rem', display: 'block' }}>
                        सुरक्षा व डेटा गोपनीयता (Zero-PII)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        OWASP / ISO 27001 दिशानिर्देशों का अनुपालन • संवेदनशील किसान डेटा डिवाइस पर सुरक्षित
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Column 3: Quick Administrative & Download Actions */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem', mb: 1.5 }}>
                  ⚙️ त्वरित पोर्टल व सेवाएं
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AdminPanelSettingsIcon sx={{ fontSize: 17 }} />}
                    onClick={handleOpenAdminPortal}
                    sx={{
                      justifyContent: 'flex-start',
                      color: '#0284c7',
                      borderColor: '#bae6fd',
                      bgcolor: '#f0f9ff',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      py: 0.6,
                      px: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#e0f2fe', borderColor: '#0284c7' }
                    }}
                  >
                    कृषि प्रशासन पोर्टल (Admin)
                  </Button>
                  {appConfig.apkDownloadUrl && !isNativePlatform() && (
                    <Button
                      size="small"
                      variant="outlined"
                      component="a"
                      href={appConfig.apkDownloadUrl}
                      target="_blank"
                      download
                      startIcon={<AndroidIcon sx={{ fontSize: 17 }} />}
                      sx={{
                        justifyContent: 'flex-start',
                        color: '#166534',
                        borderColor: '#bbf7d0',
                        bgcolor: '#f0fdf4',
                        fontWeight: 800,
                        fontSize: '0.76rem',
                        py: 0.6,
                        px: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#dcfce7', borderColor: '#16a34a' }
                      }}
                    >
                      Android APK डाउनलोड (v{appConfig.appVersion})
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: appConfig.appName,
                          text: `${appConfig.appName} - ${appConfig.appTagline}`,
                          url: window.location.origin
                        }).catch(() => {});
                      }
                    }}
                    sx={{
                      justifyContent: 'flex-start',
                      color: '#475569',
                      borderColor: '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      py: 0.6,
                      px: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
                    }}
                  >
                    {isChhattisgarhi ? 'किसान संगी मन ला शेयर करव' : 'किसान भाइयों को शेयर करें'}
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Bottom Copyright Sub-Bar */}
            <Box
              sx={{
                pt: 2.5,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                © {new Date().getFullYear()} {appConfig.appName} • {appConfig.stateName} किसान कल्याण मंच • सर्वाधिकार सुरक्षित
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                Made with ❤️ for Indian Farmers • Offline-First PWA & Android TWA
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Mobile-Only Sticky Bottom Navigation Bar (Hidden on Desktop md and above) */}
        <Paper
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1200,
            bgcolor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
            pb: 'env(safe-area-inset-bottom, 0px)'
          }}
          elevation={4}
        >
          <Box sx={{ maxWidth: { xs: '100%', md: 680 }, mx: 'auto', width: '100%' }}>
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
              label={t('tab_home')}
              value="home"
              icon={<HomeIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label={t('tab_doctor')}
              value="doctor"
              icon={<LocalHospitalIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label={t('tab_schemes')}
              value="schemes"
              icon={<CalculateIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label={t('tab_mandi')}
              value="mandi"
              icon={<StorefrontIcon sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label={t('tab_chaupal')}
              value="chaupal"
              icon={<ForumIcon sx={{ fontSize: 24 }} />}
            />
          </BottomNavigation>
          </Box>
        </Paper>

        {/* ── Adaptive & Draggable Smart Voice Assistant (Option 2 + Option 3) ──
            • Mobile touch & Desktop draggable so it never blocks any button
            • In-Modal/Form mode: Automatically transforms into a compact 48px floating bubble
            • In-Modal Smart Actions: Speaks "सहेजें", "बंद करव", "2 एकड़" to interact directly with forms
        */}
        <DraggableVoiceButton
          isSpeakingActive={isSpeakingActive}
          isVoiceListening={isVoiceListening}
          onVoiceClick={handleVoiceFab}
          isChhattisgarhi={isChhattisgarhi}
        />
        {/* Centralized Smart Device & Hardware Hub */}
        <DeviceHubModal
          open={openDeviceHub}
          onClose={() => setOpenDeviceHub(false)}
        />
        {/* Super Admin & Extension Worker Command Center */}
        <SuperAdminModal
          open={openAdminModal}
          onClose={() => setOpenAdminModal(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;

