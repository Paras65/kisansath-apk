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
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import GetAppIcon from '@mui/icons-material/GetApp';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SensorsIcon from '@mui/icons-material/Sensors';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { appConfig } from '../../config/appConfig';
import { speakText, stopSpeech } from '../../utils/speech';
import { getTodayActionableFarmTask } from '../../utils/cropLifecycleEngine';
import { PublicWelcomeBanner } from './PublicWelcomeBanner';
import { HomeWeatherCard } from './HomeWeatherCard';
import { QuickLauncherGrid } from './QuickLauncherGrid';
import { MandiPulseCard } from './MandiPulseCard';
import { CgAssistanceHubCard } from './CgAssistanceHubCard';

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
    <Box sx={{ width: '100%' }}>
      {/* 1. Top Section: Unauthenticated Guest Welcome Banner with Unambiguous Status Badge */}
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

      {/* ── 3. Four Telemetry KPI Tiles (Harmonized 1:1 with Logged-In Grid) ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, md: 3 }
        }}
      >
        {/* Tile 1: Active Farm Plots & Guest Calendar */}
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
              label={isChhattisgarhi ? 'अतिथि खेत' : 'अतिथि खेत'}
              size="small"
              sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '0.65rem', height: 20 }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi ? 'सक्रिय खेत अऊ रकबा' : 'सक्रिय खेत व कुल रकबा'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.08rem', lineHeight: 1.25, mt: 0.2 }}>
              1 खेत (कैलेंडर मोड)
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
            borderRadius: 3.5,
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
              ₹{appConfig.paddyScheme?.totalRate || 3100} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>/क्विंटल</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, fontSize: '0.68rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.4 }}>
              🌾 {isChhattisgarhi ? '21 क्विंटल/एकड़ सीमा →' : '21 क्विंटल/एकड़ सीमा →'}
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
              {selectedDistrict} • {weather?.condition || (isChhattisgarhi ? 'साफ' : 'साफ')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: weather?.sprayAdvisory ? (weather.sprayAdvisory.canSpray ? '#166534' : '#dc2626') : '#0284c7',
                fontWeight: 700,
                fontSize: '0.68rem',
                mt: 0.4,
                display: 'flex',
                alignItems: 'center',
                gap: 0.4
              }}
            >
              {(isChhattisgarhi ? (weather?.sprayAdvisory?.badgeCg || weather?.sprayAdvisory?.badge) : weather?.sprayAdvisory?.badge) ||
                (isChhattisgarhi ? '🌿 मौसम बने हे • काम जारी' : '🌿 मौसम अनुकूल • कार्य जारी')}
            </Typography>
          </Box>
        </Paper>

        {/* Tile 4: Mandi Bhav Pulse Telemetry */}
        <Paper
          elevation={0}
          onClick={() => { stopSpeech(); onNavigate('mandi'); }}
          sx={{
            p: 1.8,
            borderRadius: 3.5,
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

      {/* ── 4. Harmonized 2-Column Agritech Workstation Layout (Matching Logged-In 1:1) ── */}
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

          {/* Department Emergency Broadcast (if any) */}
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

          {/* 1. Shared Microclimate Weather & Spray Advisory Card (Top of Main Column) */}
          <HomeWeatherCard
            weather={weather}
            weatherLoading={weatherLoading}
            selectedDistrict={selectedDistrict}
            exactLocation={exactLocation}
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

          {/* 3. High-Impact Today's Farm Action Card (🌾 आज खेत में 1 मुख्य काम) */}
          {(() => {
            const todayTask = getTodayActionableFarmTask({ activeFarmer, farmerPlots, weather, selectedDistrict, isChhattisgarhi });
            if (!todayTask) return null;
            return (
              <Card
                sx={{
                  p: { xs: 1.8, sm: 2.2 },
                  mb: 2.5,
                  borderRadius: 4,
                  bgcolor: '#ffffff',
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
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        bgcolor: '#1b5e20',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TaskAltIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#166534', fontSize: '0.94rem', lineHeight: 1.2 }}>
                        {isChhattisgarhi ? '🌾 आज खेत म 1 मुख्य काम' : '🌾 आज खेत में 1 मुख्य काम'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        📍 {selectedDistrict} • {todayTask.zoneName || 'मैदानी क्षेत्र'} (सामान्य कृषि अनुमान)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Chip
                      label={isChhattisgarhi ? '🏛️ ICAR/IGKV सामान्य चक्र' : '🏛️ ICAR/IGKV सामान्य चक्र'}
                      size="small"
                      sx={{
                        bgcolor: '#f0fdf4',
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

                <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700, fontSize: '0.88rem', mb: 0.6 }}>
                  {todayTask.title}
                </Typography>

                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', lineHeight: 1.5, mb: 1.2 }}>
                  {todayTask.task}
                </Typography>

                {/* Transparency & Personalized Plot Onboarding CTA Box */}
                <Box
                  sx={{
                    p: 1.5,
                    mt: 0.8,
                    mb: 1.2,
                    borderRadius: 3,
                    bgcolor: '#f0fdf4',
                    border: '1.2px dashed #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, minWidth: 200, flex: 1 }}>
                    <Typography sx={{ fontSize: '1.3rem', lineHeight: 1, mt: 0.2 }}>📅</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#166534', fontSize: '0.8rem', lineHeight: 1.35, fontWeight: 900, display: 'block' }}>
                        {isChhattisgarhi ? 'का तुंहर बोवाई तारीख अलग हे?' : 'क्या आपकी बुआई तारीख अलग है?'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.72rem', lineHeight: 1.35, display: 'block' }}>
                        {isChhattisgarhi
                          ? 'केवल अपन फसल अऊ बोवाई तारीख चुनव — सही दिन-वार काम पाव।'
                          : 'केवल अपनी फसल व बुआई तारीख चुनें — सही दिन-वार सलाह पाएं।'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.66rem', lineHeight: 1.3, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 0.4, mt: 0.3, bgcolor: '#dcfce7', px: 0.8, py: 0.2, borderRadius: 1 }}>
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
                      setPendingToolAction('khet');
                      setOpenQuickLogin(true);
                    }}
                    sx={{
                      bgcolor: '#16a34a',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      borderRadius: 2.5,
                      px: 1.8,
                      py: 0.7,
                      textTransform: 'none',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                      '&:hover': { bgcolor: '#15803d' }
                    }}
                  >
                    {isChhattisgarhi ? '📅 अपन बोवाई तारीख चुनव ➔' : '📅 अपनी बुआई तारीख चुनें ➔'}
                  </Button>
                </Box>

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
                    }}
                    sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.75rem', py: 0.2, px: 1 }}
                  >
                    {todayTask.actionText || (isChhattisgarhi ? 'आगे देखव ➔' : 'आगे देखें ➔')}
                  </Button>
                </Box>
              </Card>
            );
          })()}

          {/* 4. Mandi Rates Pulse (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.2 }}>
            <MandiPulseCard
              liveMandiRates={liveMandiRates}
              selectedDistrict={selectedDistrict}
              isChhattisgarhi={isChhattisgarhi}
              onNavigate={onNavigate}
            />
          </Box>

          {/* 5. Smart Chhattisgarh Farmer Assistance & Procurement Hub */}
          <CgAssistanceHubCard
            isChhattisgarhi={isChhattisgarhi}
            onNavigate={onNavigate}
            onOpenTokenGuide={() => setOpenTokenGuide(true)}
          />
        </Box>

        {/* RIGHT COLUMN (Desktop Command Center: md and up, ~36%, sticky) */}
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
          {/* Card 1: Paddy MSP Scheme & Procurement Quota Card */}
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
                <span>🌾</span>
                <span>छ.ग. धान उपार्जन गारंटी (2026-27)</span>
              </Typography>
              <Chip
                label="₹3,100 MSP"
                size="small"
                sx={{ bgcolor: '#fde68a', color: '#78350f', fontWeight: 900, fontSize: '0.68rem', height: 22 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, fontSize: '0.82rem' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>सरकारी समर्थन मूल्य:</span>
                <strong style={{ color: '#92400e' }}>₹{appConfig.paddyScheme?.totalRate || 3100} /क्विंटल</strong>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>अधिकतम उपार्जन सीमा:</span>
                <strong style={{ color: '#92400e' }}>21 क्विंटल प्रति एकड़</strong>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>टोकन व्यवस्था:</span>
                <strong style={{ color: '#16a34a' }}>टोकन तुंहर हाथ (ऑनलाइन)</strong>
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
                1 एकड़ पर गारंटीकृत कुल आय:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#b45309', fontSize: '1.45rem', lineHeight: 1.2, my: 0.3 }}>
                ₹65,100
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 800, fontSize: '0.7rem' }}>
                ✓ कृषक उन्नति योजना • 21 क्विंटल @ ₹3,100
              </Typography>
            </Paper>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                stopSpeech();
                setOpenTokenGuide(true);
              }}
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
              टोकन स्लॉट मार्गदर्शिका देखें →
            </Button>
          </Card>

          {/* Card 2: Mandi Rates Pulse Widget */}
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
