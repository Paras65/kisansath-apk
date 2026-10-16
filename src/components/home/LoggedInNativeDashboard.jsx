import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  IconButton
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import VerifiedIcon from '@mui/icons-material/Verified';
import LogoutIcon from '@mui/icons-material/Logout';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';
import ScienceIcon from '@mui/icons-material/Science';
import SyncIcon from '@mui/icons-material/Sync';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import { appConfig } from '../../config/appConfig';
import { calculatePaddyProcurement } from '../../utils/unitConverter';
import { analyzePlotLifecycle } from '../../utils/cropLifecycleEngine';
import { notify } from '../../services/notificationService';
import { stopSpeech } from '../../utils/speech';
import { HomeWeatherCard } from './HomeWeatherCard';
import { QuickLauncherGrid } from './QuickLauncherGrid';
import { MandiPulseCard } from './MandiPulseCard';
import { CgAssistanceHubCard } from './CgAssistanceHubCard';

export const LoggedInNativeDashboard = ({
  activeFarmer,
  farmerPlots = [],
  selectedPlotIndex = 0,
  setSelectedPlotIndex = () => {},
  weather = null,
  weatherLoading = false,
  selectedDistrict = 'रायपुर',
  exactLocation = '',
  isGpsLocation = false,
  isChhattisgarhi = false,
  highlightWeatherCard = false,
  detectingGps = false,
  deviceRegistry = {},
  liveMandiRates = [],
  handleDetectLiveGps = () => {},
  handleDirectMotorToggle = () => {},
  handleReadAdvisory = () => {},
  handleFarmerLogout = () => {},
  onNavigate = () => {},
  setOpenMeraKhet = () => {},
  setOpenMotorModal = () => {},
  setOpenSoilIot = () => {},
  setOpenGpsTracker = () => {},
  setOpenDeviceHub = () => {},
  setOpenDistrictPicker = () => {},
  setOpenTokenGuide = () => {}
}) => {
  const safePlots = Array.isArray(farmerPlots) ? farmerPlots : [];
  const farmerAcres = Number(activeFarmer?.totalAcres || activeFarmer?.totalLandAcres || activeFarmer?.acres) || (safePlots.reduce((sum, p) => sum + (Number(p?.areaAcres) || 0), 0)) || 1.0;
  const activePlot = (safePlots && safePlots.length > 0) ? (safePlots[selectedPlotIndex] || safePlots[0]) : {
    name: isChhattisgarhi ? 'खेत 1' : 'खेत 1',
    crop: 'धान',
    variety: 'महामाया',
    areaAcres: farmerAcres,
    sowDate: '2026-07-15'
  };
  const activePlotAnalysis = analyzePlotLifecycle(activePlot || {}, weather || {});
  const paddyProcurement = calculatePaddyProcurement(farmerAcres, appConfig.paddyScheme?.maxQuintalsPerAcre || 21);
  const totalPaddyQtl = paddyProcurement.maxQuintals;
  const totalMspPayout = paddyProcurement.totalPayout;

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── 1. Modern Certified Farmer Identity Passbook Banner (Crystal Clear Logged-In State) ── */}
      <Card
        sx={{
          mb: 2.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(6, 78, 59, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(167, 243, 208, 0.3)'
        }}
      >
        {/* Top Gold & Emerald Accent Strip */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #10b981, #f59e0b, #fbbf24)'
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.8, pt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.6 }}>
            {/* Farmer Avatar Box with Golden Badge */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 900,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                border: '2px solid #fde68a',
                flexShrink: 0
              }}
            >
              {activeFarmer?.name ? activeFarmer.name.charAt(0) : '🌾'}
            </Box>

            <Box>
              {/* Unambiguous Logged-In Mode Status Badge */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 0.6 }}>
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '15px !important', color: '#065f46 !important' }} />}
                  label={isChhattisgarhi ? '🌾 प्रमाणित किसान पासबुक • 🟢 खाता सक्रिय' : '🌾 प्रमाणित किसान पासबुक • 🟢 खाता सक्रिय (Logged In)'}
                  size="small"
                  sx={{
                    bgcolor: '#ecfdf5',
                    color: '#065f46',
                    border: '1.5px solid #6ee7b7',
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    height: 24,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                  }}
                />
                <Chip
                  label={`${farmerAcres} एकड़ पंजीकृत`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fef08a',
                    fontWeight: 800,
                    fontSize: '0.66rem',
                    height: 22
                  }}
                />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: '1.18rem', sm: '1.38rem' }, lineHeight: 1.25, color: '#ffffff' }}>
                {isChhattisgarhi ? `जय जोहार, ${activeFarmer?.name || 'किसान साथी'} जी!` : `नमस्ते, ${activeFarmer?.name || 'किसान साथी'} जी!`}
              </Typography>

              {/* Farmer Profile Metadata Strip */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 }, mt: 0.4, flexWrap: 'wrap', fontSize: '0.8rem', color: '#d1fae5' }}>
                <Typography
                  variant="caption"
                  onClick={() => setOpenDistrictPicker(true)}
                  sx={{
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: 'pointer',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    px: 0.9,
                    py: 0.25,
                    borderRadius: 1.5,
                    border: '1px solid rgba(255,255,255,0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                  }}
                >
                  📍 {activeFarmer?.village ? `${activeFarmer.village}, ${activeFarmer.district || selectedDistrict}` : selectedDistrict} ▾
                </Typography>
                <span>•</span>
                <Typography variant="caption" sx={{ color: '#d1fae5' }}>
                  📱 +91 {activeFarmer?.phone}
                </Typography>
                <span>•</span>
                <Typography variant="caption" sx={{ color: '#fef08a', fontWeight: 800 }}>
                  🌾 {safePlots.length || 1} खेत सक्रिय
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons: My Plots & Logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={<AgricultureIcon sx={{ fontSize: 18 }} />}
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{
                bgcolor: '#ffeb3b',
                color: '#1b5e20',
                fontWeight: 900,
                fontSize: '0.82rem',
                borderRadius: 2.8,
                px: 2,
                py: 0.8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                textTransform: 'none',
                '&:hover': { bgcolor: '#ffffff' }
              }}
            >
              {isChhattisgarhi ? '🌾 मोर खेत अऊ पासबुक' : '🌾 मेरा खेत व पासबुक'}
            </Button>
            <Button
              size="medium"
              onClick={handleFarmerLogout}
              startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                color: '#fee2e2',
                border: '1px solid rgba(254, 202, 202, 0.4)',
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: 2.8,
                px: 1.6,
                py: 0.8,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.25)', borderColor: '#fca5a5' }
              }}
            >
              {isChhattisgarhi ? 'लॉगआउट' : 'लॉगआउट'}
            </Button>
          </Box>
        </Box>

        {/* Certified Account Sync Notice at Bottom */}
        <Box
          sx={{
            mt: 2,
            pt: 1.2,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: '#ecfdf5',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <span>🔒</span>
            <span>
              <strong>{isChhattisgarhi ? 'सुरक्षित किसान डेटा:' : 'सुरक्षित किसान डेटा:'}</strong>{' '}
              {isChhattisgarhi
                ? 'तुंहर फसल, उपकरण अऊ हिसाब क्लाउड म सुरक्षित हे'
                : 'आपकी फसल, उपकरण व हिसाब सुरक्षित रूप से सिंक हैं'}
            </span>
          </Box>
          <Chip
            label={isChhattisgarhi ? 'टोकन कोटा देखव →' : 'टोकन कोटा देखें →'}
            size="small"
            onClick={() => setOpenTokenGuide(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: '#fff',
              fontWeight: 800,
              height: 22,
              fontSize: '0.68rem',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
            }}
          />
        </Box>
      </Card>

      {/* ── 2. Four Telemetry KPI Tiles (Harmonized 1:1 with Guest Grid) ── */}
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
              label={`${safePlots.length || 1} ${isChhattisgarhi ? 'खेत चालू' : 'खेत सक्रिय'}`}
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi ? 'सक्रिय फसलें अऊ रकबा' : 'सक्रिय फसलें व कुल रकबा'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.08rem', lineHeight: 1.25, mt: 0.2 }}>
              {farmerAcres} एकड़ ({safePlots.length || 1} खेत)
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

        {/* Tile 3: Live Microclimate Weather */}
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
              नमी {weather?.soilMoisture?.percentage || 44}% • {weather?.sprayAdvisory?.canSpray ? (isChhattisgarhi ? 'छिड़काव सही' : 'छिड़काव सही') : (isChhattisgarhi ? 'सावधानी' : 'सावधानी')}
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
              label={`${(deviceRegistry?.motor ? 1 : 0) + (deviceRegistry?.soilProbe ? 1 : 0)} उपकरण सक्रिय`}
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

      {/* ── 3. Harmonized 2-Column Agritech Workstation Layout (Matching Guest Hierarchy 1:1) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.8fr) minmax(0, 1.05fr)' },
          gap: { xs: 2, md: 2.5, lg: 3 },
          alignItems: 'start'
        }}
      >
        {/* LEFT / MAIN COLUMN */}
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* 1. Shared Microclimate Weather & Spray Advisory Card (Top of Main Column) */}
          <HomeWeatherCard
            weather={weather}
            weatherLoading={weatherLoading}
            selectedDistrict={selectedDistrict}
            exactLocation={exactLocation || (activeFarmer?.village ? `${activeFarmer.village}, ${selectedDistrict}` : selectedDistrict)}
            isGpsLocation={isGpsLocation}
            isChhattisgarhi={isChhattisgarhi}
            highlightWeatherCard={highlightWeatherCard}
            detectingGps={detectingGps}
            handleDetectLiveGps={handleDetectLiveGps}
            handleReadAdvisory={handleReadAdvisory}
            setOpenDistrictPicker={setOpenDistrictPicker}
            onNavigate={onNavigate}
          />

          {/* 2. Unified 8-Tile Modern App Launcher Grid */}
          <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              {isChhattisgarhi ? '⚡ मुख्य कृषि सेवा अऊ स्मार्ट टूल्स' : '⚡ मुख्य कृषि सेवाएं व स्मार्ट टूल्स'}
            </Typography>
            <Chip
              icon={<SensorsIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
              label={isChhattisgarhi ? '📡 डिवाइस हब' : '📡 डिवाइस हब'}
              clickable
              size="small"
              onClick={() => { stopSpeech(); setOpenDeviceHub(true); }}
              sx={{
                bgcolor: '#e8f5e9',
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: '6px',
                border: '1px solid #c8e6c9',
                '&:hover': { bgcolor: '#c8e6c9' }
              }}
            />
          </Box>

          <QuickLauncherGrid
            isChhattisgarhi={isChhattisgarhi}
            activeFarmer={activeFarmer}
            onNavigate={onNavigate}
            onOpenGpsTracker={() => setOpenGpsTracker(true)}
            onOpenMotorModal={() => setOpenMotorModal(true)}
            onOpenSoilIot={() => setOpenSoilIot(true)}
            onOpenMeraKhet={() => setOpenMeraKhet(true)}
          />

          {/* 3. Live Plot Workstation Card with Multi-Plot Switcher Tabs & 5-Step Visual Timeline */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
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
                + {isChhattisgarhi ? 'नवा फसल/कैलेंडर जोड़व' : 'नई फसल/कैलेंडर जोड़ें'}
              </Button>
            </Box>

            {/* Multi-Plot Switcher Tabs (if more than 1 plot) */}
            {safePlots.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f1f5f9', p: 0.5, borderRadius: 3, mb: 1.8, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                {safePlots.map((p, idx) => (
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
                <Box sx={{ position: 'absolute', top: 14, left: 24, right: 24, height: 4, bgcolor: '#cbd5e1', zIndex: 1, borderRadius: 2 }} />
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

          {/* 4. Smart Farm Devices & IoT Management Hub */}
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
                  {isChhattisgarhi ? '⚡ स्मार्ट कृषि यंत्र अऊ डिवाइस प्रबंधन' : '⚡ स्मार्ट कृषि यंत्र व डिवाइस प्रबंधन (IoT Hub)'}
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
          </Card>

          {/* 5. Mandi Rates Pulse (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.2 }}>
            <MandiPulseCard
              liveMandiRates={liveMandiRates}
              selectedDistrict={selectedDistrict}
              isChhattisgarhi={isChhattisgarhi}
              onNavigate={onNavigate}
            />
          </Box>

          {/* 6. Smart Chhattisgarh Farmer Assistance & Procurement Hub */}
          <CgAssistanceHubCard
            isChhattisgarhi={isChhattisgarhi}
            onNavigate={onNavigate}
            onOpenTokenGuide={() => setOpenTokenGuide(true)}
          />
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
                <span>{activeFarmer?.name || 'किसान'} जी का धान विक्रय कोटा हिसाब</span>
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
          <MandiPulseCard
            liveMandiRates={liveMandiRates}
            selectedDistrict={selectedDistrict}
            isChhattisgarhi={isChhattisgarhi}
            onNavigate={onNavigate}
          />

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
