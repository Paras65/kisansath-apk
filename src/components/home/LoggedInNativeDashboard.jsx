import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Paper,
  IconButton,
  LinearProgress
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
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import { appConfig } from '../../config/appConfig';
import { analyzePlotLifecycle } from '../../utils/cropLifecycleEngine';
import { notify } from '../../services/notificationService';
import { stopSpeech } from '../../utils/speech';
import { KakaWalkthroughButton } from '../KakaWalkthroughButton';
import { MandiPulseCard } from './MandiPulseCard';
import { QuickLauncherGrid } from './QuickLauncherGrid';

export const LoggedInNativeDashboard = ({
  activeFarmer,
  farmerPlots = [],
  selectedPlotIndex = 0,
  setSelectedPlotIndex = () => {},
  weather = null,
  weatherLoading = false,
  selectedDistrict = 'रायपुर',
  exactLocation = '',
  isChhattisgarhi = false,
  highlightWeatherCard = false,
  deviceRegistry = {},
  liveMandiRates = [],
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
            <MandiPulseCard
              liveMandiRates={liveMandiRates}
              selectedDistrict={selectedDistrict}
              isChhattisgarhi={isChhattisgarhi}
              onNavigate={onNavigate}
            />
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

