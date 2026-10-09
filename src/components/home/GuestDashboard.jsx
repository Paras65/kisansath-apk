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
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import GetAppIcon from '@mui/icons-material/GetApp';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SensorsIcon from '@mui/icons-material/Sensors';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { appConfig } from '../../config/appConfig';
import { speakText, stopSpeech } from '../../utils/speech';
import { getTodayActionableFarmTask } from '../../utils/cropLifecycleEngine';
import { KakaWalkthroughButton } from '../KakaWalkthroughButton';
import { PublicWelcomeBanner } from './PublicWelcomeBanner';
import { QuickLauncherGrid } from './QuickLauncherGrid';
import { MandiPulseCard } from './MandiPulseCard';
import { CgAssistanceHubCard } from './CgAssistanceHubCard';
import { ActivePlotsAndDailyTasksCard } from './ActivePlotsAndDailyTasksCard';

export const GuestDashboard = ({
  updateInfo = null,
  activeFarmer = null,
  farmerPlots = [],
  weather = null,
  weatherLoading = false,
  selectedDistrict = 'रायपुर',
  exactLocation = '',
  isGpsLocation = false,
  isChhattisgarhi = false,
  highlightWeatherCard = false,
  detectingGps = false,
  activeBroadcasts = [],
  liveMandiRates = [],
  handleDetectLiveGps = () => {},
  handleReadAdvisory = () => {},
  handleRequireLogin = () => {},
  onNavigate = () => {},
  setOpenMeraKhet = () => {},
  setOpenMotorModal = () => {},
  setOpenGpsTracker = () => {},
  setOpenDistrictPicker = () => {},
  setPendingToolAction = () => {},
  setOpenQuickLogin = () => {},
  setOpenTokenGuide = () => {}
}) => {
  return (
    <>
      {/* 1. Top Section: Unauthenticated Guest: Official Public Gateway Welcome Banner */}
      <PublicWelcomeBanner
        isChhattisgarhi={isChhattisgarhi}
        exactLocation={exactLocation}
        selectedDistrict={selectedDistrict}
        isGpsLocation={isGpsLocation}
        onOpenQuickLogin={() => { stopSpeech(); setOpenQuickLogin(true); }}
        onNavigate={onNavigate}
      />

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
          {activeFarmer && (
            <ActivePlotsAndDailyTasksCard
              farmerPlots={farmerPlots}
              weather={weather}
              isChhattisgarhi={isChhattisgarhi}
              setOpenMeraKhet={setOpenMeraKhet}
              setOpenMotorModal={setOpenMotorModal}
            />
          )}

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
            <MandiPulseCard
              liveMandiRates={liveMandiRates}
              selectedDistrict={selectedDistrict}
              isChhattisgarhi={isChhattisgarhi}
              onNavigate={onNavigate}
            />
          </Box>

          {/* Smart Chhattisgarh Farmer Assistance & Procurement Hub */}
          <CgAssistanceHubCard
            isChhattisgarhi={isChhattisgarhi}
            onNavigate={onNavigate}
            onOpenTokenGuide={() => setOpenTokenGuide(true)}
          />
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
          <MandiPulseCard
            liveMandiRates={liveMandiRates}
            selectedDistrict={selectedDistrict}
            isChhattisgarhi={isChhattisgarhi}
            onNavigate={onNavigate}
          />
        </Box>
      </Box>
    </>
  );
};

