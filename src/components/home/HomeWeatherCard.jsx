import React from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  LinearProgress
} from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { stopSpeech } from '../../utils/speech';
import { KakaWalkthroughButton } from '../KakaWalkthroughButton';

export const HomeWeatherCard = ({
  weather = null,
  weatherLoading = false,
  selectedDistrict = 'रायपुर',
  exactLocation = '',
  isGpsLocation = false,
  isChhattisgarhi = false,
  highlightWeatherCard = false,
  detectingGps = false,
  handleDetectLiveGps = () => {},
  handleReadAdvisory = () => {},
  setOpenDistrictPicker = () => {},
  onNavigate = () => {}
}) => {
  return (
    <Card
      id="kaka-weather-card"
      className={highlightWeatherCard ? 'kaka-spotlight-pulse' : ''}
      sx={{
        mb: 2.5,
        p: { xs: 1.8, sm: 2.2 },
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #bae6fd',
        boxShadow: '0 4px 18px rgba(2, 132, 199, 0.06)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Row: Temp, Condition, District Picker & Spray Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1.2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
          <Typography sx={{ fontSize: { xs: '2.1rem', sm: '2.4rem' }, lineHeight: 1 }}>
            {weather?.conditionIcon || '🌤️'}
          </Typography>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1, fontSize: { xs: '1.85rem', sm: '2.2rem' } }}>
                {weather ? `${weather.temp}°` : (weatherLoading ? '--°' : '30°')}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#334155', fontWeight: 800, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                {weather
                  ? (isChhattisgarhi ? (weather.conditionTextCg || weather.conditionText) : weather.conditionText)
                  : (weatherLoading ? (isChhattisgarhi ? 'लाइव मौसम लोड होत हे...' : 'लाइव मौसम लोड हो रहा है...') : (isChhattisgarhi ? 'उघरा अकास' : 'साफ मौसम'))}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.4, flexWrap: 'wrap' }}>
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
                  px: 0.8,
                  py: 0.2,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  '&:hover': { bgcolor: '#dcfce7' }
                }}
              >
                📍 {exactLocation || selectedDistrict} <span style={{ fontSize: '0.64rem', color: '#16a34a' }}>({isChhattisgarhi ? 'बदलव ▾' : 'बदलें ▾'})</span>
              </Typography>

              {isGpsLocation ? (
                <Chip
                  size="small"
                  icon={<MyLocationIcon sx={{ fontSize: '11px !important', color: '#1b5e20 !important' }} />}
                  label={isChhattisgarhi ? 'लाइव GPS' : 'लाइव GPS'}
                  sx={{
                    height: 22,
                    fontSize: '0.66rem',
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
                    py: 0.15,
                    px: 0.9,
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
            sx={{ bgcolor: '#f1f5f9', color: '#1b5e20', p: 0.6, '&:hover': { bgcolor: '#e2e8f0' } }}
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
            <WaterDropIcon sx={{ fontSize: 13, color: '#0288d1' }} /> {isChhattisgarhi ? 'पानी (बरसात)' : 'वर्षा संभावना'}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
            {weather ? `${weather.rainProbability}%` : (weatherLoading ? '--' : '0%')}
          </Typography>
        </Box>
        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
            <AirIcon sx={{ fontSize: 13, color: '#00897b' }} /> {isChhattisgarhi ? 'हवा के गति' : 'हवा की गति'}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
            {weather ? `${weather.windSpeed} km/h` : (weatherLoading ? '--' : '0 km/h')}
          </Typography>
        </Box>
        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
            💧 {isChhattisgarhi ? 'उमस (नमी)' : 'हवा में नमी'}
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
          {(isChhattisgarhi ? (weather?.sprayAdvisory?.advisoryCg || weather?.sprayAdvisory?.advisory) : weather?.sprayAdvisory?.advisory) ||
            (isChhattisgarhi ? 'धान म कल्ला अऊ बाली आवत बेरा खेत म 2-3 सेमी पानी राखव। शांत मौसम म कीटनाशक छिड़कव।' : 'धान में कल्ले और बालियां आते समय खेत में 2-3 सेमी जलस्तर रखें। शांत मौसम में कीटनाशक छिड़काव करें।')}
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
  );
};

