import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScienceIcon from '@mui/icons-material/Science';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import SyncIcon from '@mui/icons-material/Sync';
import { speakText, stopSpeech } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { fetchLiveWeather } from '../services/weatherService';
import { getActiveFarmer } from '../services/farmerService';
import { isNativePlatform } from '../utils/capacitorUtils';
import { shareOnWhatsApp } from '../utils/shareUtils';
import { checkForAppUpdate } from '../services/updateService';
import SensorsIcon from '@mui/icons-material/Sensors';
import { MeraKhetModal } from './MeraKhetModal';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { MotorControllerModal } from './MotorControllerModal';
import { DeviceHubModal } from './DeviceHubModal';
import { ShareModal } from './ShareModal';

const FEATURED_MANDI_RATES = [
  {
    crop: 'धान (सरना/मोटा)',
    rate: `₹${appConfig.paddyScheme.totalRate}`,
    mktRate: '₹2,320',
    type: 'सरकारी उपार्जन (MSP + बोनस)',
    badge: '₹3,100 गारंटी',
    color: '#1b5e20'
  },
  {
    crop: 'चना (देसी चना)',
    rate: '₹5,950',
    mktRate: '₹5,600',
    type: 'राजनांदगांव / रायपुर मंडी',
    badge: '+₹210 तेजी',
    color: '#e65100'
  },
  {
    crop: 'मक्का (Maize)',
    rate: '₹2,225',
    mktRate: '₹2,090',
    type: 'बस्तर / जगदलपुर मंडी',
    badge: 'मजबूत मांग',
    color: '#f57f17'
  },
  {
    crop: 'सोयाबीन (पीला)',
    rate: '₹4,892',
    mktRate: '₹4,650',
    type: 'बेमेतरा / दुर्ग मंडी',
    badge: 'MSP स्थिर',
    color: '#2e7d32'
  }
];

const LIFECYCLE_STEPS = [
  {
    step: 1,
    title: 'खेत तैयारी व मृदा स्वास्थ्य',
    short: 'मृदा परीक्षण व ग्रीष्मकालीन गहरी जुताई',
    tag: 'खेत तैयारी',
    color: '#5d4037',
    desc: 'गर्मियों में गहरी जुताई करें ताकि हानिकारक कीटों के अंडे व खरपतवार नष्ट हो जाएं। गोबर की सड़ी खाद 4-5 टन प्रति एकड़ डालें और नजदीकी कृषि विज्ञान केंद्र से मिट्टी की जांच कराएं (आदर्श pH: 6.0-7.0)।',
    voice: 'पहला चरण: खेत तैयारी और मृदा स्वास्थ्य। खेत की गहरी जुताई करें। 4 से 5 टन गोबर खाद प्रति एकड़ डालें और मिट्टी का पीएच टेस्ट कराएं।'
  },
  {
    step: 2,
    title: 'बीज चयन व बीजोपचार',
    short: 'प्रमाणित रोगरोधी बीज व फफूंदनाशी उपचार',
    tag: 'बीजोपचार',
    color: '#2e7d32',
    desc: 'प्रमाणित किस्मों (जैसे धान में सरना, महामाया, एचएमटी) का चुनाव करें। बुआई से पूर्व बीजोपचार अवश्य करें: 1 कि.ग्रा. बीज में 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिलाकर 24 घंटे रखें। इससे उकठा व झुलसा रोग नहीं लगता।',
    voice: 'दूसरा चरण: बीज चयन और बीजोपचार। हमेशा प्रमाणित बीज का उपयोग करें और बुआई से पहले ट्राइकोडर्मा या बाविस्टिन से बीजोपचार जरूर करें।'
  },
  {
    step: 3,
    title: 'संतुलित पोषण व खाद प्रबंधन',
    short: 'यूरिया, डीएपी व पोटाश का सही समय',
    tag: 'खाद प्रबंधन',
    color: '#00796b',
    desc: 'बुआई के समय पूरी डीएपी और पोटाश डालें। यूरिया को तीन बराबर भागों में बांटकर दें (बुआई, कल्ले फूटने पर 25 दिन बाद, और बालियां आने से पहले 45 दिन बाद)। जिंक सल्फेट कभी भी डीएपी के साथ मिलाकर न डालें।',
    voice: 'तीसरा चरण: पोषण और खाद प्रबंधन। डीएपी और पोटाश बुआई के समय डालें। यूरिया को तीन भागों में दें। जिंक और डीएपी को कभी मिलाकर न डालें।'
  },
  {
    step: 4,
    title: 'फसल सुरक्षा व रोग निदान',
    short: 'कीट व बीमारी का समय पर नियंत्रण',
    tag: 'फसल सुरक्षा',
    color: '#c62828',
    desc: 'खेत में नियमित निगरानी करें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं। भूरा माहू होने पर खेत का पानी 2 दिन निकालें और नीम तेल या पाइमेट्रोज़िन का छिड़काव तनों पर करें। पत्तियों पर धब्बे दिखने पर ट्राईसाइक्लाजोल का छिड़काव करें।',
    voice: 'चौथा चरण: फसल सुरक्षा और रोग निदान। पत्तियों और तनों का नियमित निरीक्षण करें। लक्षण दिखते ही फसल डॉक्टर टैब में फोटो या लक्षण जांचकर सही दवा छिड़कें।'
  },
  {
    step: 5,
    title: 'कटाई, सुखाना व थ्रेशिंग',
    short: '14-17% नमी पर कटाई व सुरक्षित भंडारण',
    tag: 'कटाई',
    color: '#f57f17',
    desc: 'जब बालियों के 85-90% दाने सुनहरे हो जाएं तब कटाई करें। कटाई के बाद फसल को धूप में अच्छी तरह सुखाएं। उपार्जन केंद्र ले जाने से पहले अनाज में नमी 14-17% से अधिक नहीं होनी चाहिए ताकि वजन में कटौती न हो।',
    voice: 'पांचवां चरण: कटाई और सुखाना। जब 85 से 90 प्रतिशत दाने सुनहरे हो जाएं तब कटाई करें और अनाज को सुखाकर नमी 14 से 17 प्रतिशत तक लाएं।'
  },
  {
    step: 6,
    title: `मंडी भाव व ₹${appConfig.paddyScheme.totalRate} बिक्री`,
    short: 'टोकन तुंहर हाथ व कृषक उन्नति योजना',
    tag: 'बिक्री ₹3,100',
    color: '#1565c0',
    desc: `${appConfig.stateName} कृषक उन्नति योजना के तहत ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} प्रति क्विंटल का भुगतान होता है (प्रति एकड़ ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल)। टोकन तुंहर हाथ ऐप से घर बैठे टोकन काटें, उपार्जन केंद्र में तौल कराएं और सीधे बैंक खाते में भुगतान प्राप्त करें।`,
    voice: `छठा चरण: मंडी भाव और सरकारी बिक्री। ${appConfig.stateName} सरकार की कृषक उन्नति योजना में ${appConfig.paddyScheme.totalRate} रुपये प्रति क्विंटल के भाव से टोकन तुंहर हाथ द्वारा आसानी से धान बेचें।`
  }
];

export const HomeTab = ({ onNavigate, selectedDistrict }) => {
  const [expandedStep, setExpandedStep] = useState(1);
  const [openMeraKhet, setOpenMeraKhet] = useState(false);
  const [openGpsTracker, setOpenGpsTracker] = useState(false);
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [openMotorModal, setOpenMotorModal] = useState(false);
  const [openDeviceHub, setOpenDeviceHub] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());

  // Refresh active farmer session when Mera Khet modal is closed
  useEffect(() => {
    setActiveFarmer(getActiveFarmer());
  }, [openMeraKhet]);

  const [updateInfo, setUpdateInfo] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Background check for update on mount
  useEffect(() => {
    let isMounted = true;
    checkForAppUpdate(false).then((info) => {
      if (isMounted && info && info.hasUpdate) {
        setUpdateInfo(info);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    const info = await checkForAppUpdate(true);
    setCheckingUpdate(false);
    setUpdateInfo(info);
    setUpdateDialogOpen(true);
  };

  // Live Weather Fetch (Open-Meteo)
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      const data = await fetchLiveWeather(selectedDistrict);
      if (isMounted) setWeather(data);
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  const handleReadAdvisory = () => {
    const text = weather?.sprayAdvisory?.voice || `आज की कृषि सलाह: मौसम साफ और अनुकूल रहेगा। यूरिया खाद व कीटनाशक छिड़काव का सही समय है।`;
    speakText(text);
  };

  const handleReadStep = (e, step) => {
    e.stopPropagation();
    speakText(step.voice);
  };

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* 1. Modern Hero Greeting & Profile Card */}
      <Card
        sx={{
          mb: 2,
          p: { xs: 1.8, sm: 2.2 },
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(27, 94, 32, 0.16)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}
            >
              <AgricultureIcon sx={{ fontSize: 28, color: '#ffeb3b' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.05rem', sm: '1.2rem' }, lineHeight: 1.2 }}>
                {activeFarmer?.name ? `नमस्ते, ${activeFarmer.name} जी` : 'नमस्ते, किसान साथी'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                <span>📍 {activeFarmer?.village ? `${activeFarmer.village}, ` : ''}{selectedDistrict}</span>
                <span>•</span>
                <span style={{ color: '#ffeb3b', fontWeight: 700 }}>धान व रबी 2026-27</span>
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
            sx={{
              bgcolor: '#ffeb3b',
              color: '#1b5e20',
              fontWeight: 800,
              fontSize: '0.78rem',
              borderRadius: 3,
              px: 2,
              py: 0.7,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': { bgcolor: '#fff' }
            }}
          >
            🌾 मेरा खेत {activeFarmer?.totalAcres ? `(${activeFarmer.totalAcres} एकड़)` : ''}
          </Button>
        </Box>

        {/* Ticker Notice Inside Hero */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.2,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#f1f8e9',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CampaignIcon sx={{ fontSize: 16, color: '#ffeb3b' }} />
            <span><strong>एग्री-स्टैक / किसान रजिस्ट्री:</strong> ₹3,100 समर्थन मूल्य उपार्जन हेतु अनिवार्य</span>
          </Box>
          <Chip
            label="योजना देखें"
            size="small"
            onClick={() => onNavigate('schemes')}
            sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
          />
        </Box>
      </Card>

      {/* 2. New App Update Alert Banner (if update ready) */}
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
                🎉 नया अपडेट उपलब्ध है (v{updateInfo.latestVersion})!
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem' }}>
                नया APK इंस्टॉल करें • पुराना डेटा सुरक्षित रहेगा
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
            अभी अपडेट करें
          </Button>
        </Paper>
      )}

      {/* 3. Modern Floating Weather & Spray Card */}
      <Card
        sx={{
          mb: 2.2,
          p: 2,
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}
      >
        {/* Top Row: Temp, Condition, Spray Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '2.2rem', lineHeight: 1 }}>
              {weather?.conditionIcon || '🌤️'}
            </Typography>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                  {weather ? `${weather.temp}°` : '29°'}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.9rem' }}>
                  {weather ? weather.conditionText : 'साफ मौसम'}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                📍 {selectedDistrict} {weather?.isLive ? '• लाइव मौसम' : '• सुरक्षित डेटा'}
              </Typography>
            </Box>
          </Box>

          {/* Spray Safety Badge & Voice button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Chip
              label={weather?.sprayAdvisory?.badge || 'छिड़काव अनुकूल'}
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
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={4}>
            <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <WaterDropIcon sx={{ fontSize: 13, color: '#0288d1' }} /> वर्षा
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                {weather ? `${weather.rainProbability}%` : '10%'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                <AirIcon sx={{ fontSize: 13, color: '#00897b' }} /> हवा
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                {weather ? `${weather.windSpeed} km/h` : '10 km/h'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                💧 आर्द्रता
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                {weather ? `${weather.humidity}%` : '62%'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Advisory line */}
        <Box sx={{ p: 1.2, bgcolor: '#f1f8e9', borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 1.5, border: '1px solid #dcedc8' }}>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
          <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.76rem', lineHeight: 1.35, fontWeight: 600 }}>
            {weather?.sprayAdvisory?.advisory || 'धान में कल्ले और बालियां आते समय खेत में 2-3 सेमी जलस्तर रखें। शांत मौसम में कीटनाशक छिड़काव करें।'}
          </Typography>
        </Box>

        {/* Compact 3-Day Forecast Strip */}
        {weather?.forecast3Days && (
          <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 14, color: '#2e7d32' }} /> 3-दिवसीय मौसम अनुमान:
              </Typography>
            </Box>
            <Grid container spacing={1}>
              {weather.forecast3Days.map((f, idx) => (
                <Grid item xs={4} key={idx}>
                  <Box sx={{ p: 0.8, bgcolor: idx === 0 ? '#e8f5e9' : '#fafafa', borderRadius: 2, textAlign: 'center', border: idx === 0 ? '1px solid #c8e6c9' : '1px solid #f1f5f9' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: idx === 0 ? '#1b5e20' : '#64748b', fontSize: '0.7rem', display: 'block' }}>
                      {f.day.split(' ')[0]}
                    </Typography>
                    <Typography sx={{ fontSize: '1.1rem', my: 0.2 }}>{f.icon}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem', display: 'block' }}>
                      {f.tempMax}° / {f.tempMin}°
                    </Typography>
                    <Typography variant="caption" sx={{ color: f.rainProb > 40 ? '#d32f2f' : '#0288d1', fontSize: '0.64rem', fontWeight: 700 }}>
                      वर्षा {f.rainProb}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Card>

      {/* 4. Mandi Rates Pulse (Financial Style Agritech Cards) */}
      <Card
        sx={{
          mb: 2.5,
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 1.5, px: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#1565c0', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              आज के प्रमुख मंडी भाव (Mandi Pulse)
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            onClick={() => { stopSpeech(); onNavigate('mandi'); }}
            sx={{ color: '#1565c0', fontWeight: 800, fontSize: '0.72rem', p: 0 }}
          >
            सभी 30+ मंडियां
          </Button>
        </Box>

        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1}>
            {FEATURED_MANDI_RATES.map((item, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Box
                  onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    bgcolor: '#fafafa',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#f0f9ff', borderColor: '#bae6fd' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.76rem' }}>
                      {item.crop.split(' ')[0]}
                    </Typography>
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, bgcolor: `${item.color}15`, color: item.color }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: item.color, fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {item.rate}
                    <Typography component="span" variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', ml: 0.2 }}>
                      /क्विं.
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', display: 'block', mt: 0.2 }}>
                    {item.type.split(' ')[0]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Card>

      {/* 5. Unified 8-Tile Modern App Launcher Grid (PhonePe/GPay Style 4x2 Matrix) */}
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
          ⚡ मुख्य कृषि सेवाएं व स्मार्ट टूल्स
        </Typography>
        <Chip
          icon={<SensorsIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
          label="📡 डिवाइस हब"
          clickable
          size="small"
          onClick={() => {
            stopSpeech();
            setOpenDeviceHub(true);
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

      <Card
        sx={{
          p: { xs: 1.2, sm: 1.8 },
          mb: 3,
          borderRadius: '16px',
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
        }}
      >
        <Grid container spacing={{ xs: 1, sm: 1.5 }}>
          {[
            {
              title: 'फसल डॉक्टर',
              icon: <MedicalServicesIcon sx={{ color: '#d32f2f', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#ffebee',
              border: '#ffcdd2',
              badge: 'AI',
              badgeBg: '#d32f2f',
              action: () => onNavigate('doctor')
            },
            {
              title: 'खाद कैलकु.',
              icon: <CalculateIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#e8f5e9',
              border: '#c8e6c9',
              badge: 'NPK',
              badgeBg: '#2e7d32',
              action: () => onNavigate('schemes')
            },
            {
              title: 'मंडी भाव',
              icon: <StorefrontIcon sx={{ color: '#1976d2', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#e3f2fd',
              border: '#bbdefb',
              badge: 'लाइव',
              badgeBg: '#1976d2',
              action: () => onNavigate('mandi')
            },
            {
              title: 'धान योजना',
              icon: <MonetizationOnIcon sx={{ color: '#f57f17', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#fff8e1',
              border: '#ffe082',
              badge: '₹3,100',
              badgeBg: '#e65100',
              action: () => onNavigate('schemes')
            },
            {
              title: 'खेत GPS',
              icon: <DirectionsWalkIcon sx={{ color: '#00897b', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#e0f2f1',
              border: '#b2dfdb',
              badge: 'GPS',
              badgeBg: '#00897b',
              action: () => setOpenGpsTracker(true)
            },
            {
              title: 'ट्यूबवेल मोटर',
              icon: <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#e1f5fe',
              border: '#b3e5fc',
              badge: 'IoT',
              badgeBg: '#0288d1',
              action: () => setOpenMotorModal(true)
            },
            {
              title: 'मिट्टी सेंसर',
              icon: <ScienceIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#e8f5e9',
              border: '#c8e6c9',
              badge: 'सेंसर',
              badgeBg: '#1b5e20',
              action: () => setOpenSoilIot(true)
            },
            {
              title: 'किसान डायरी',
              icon: <MenuBookIcon sx={{ color: '#7b1fa2', fontSize: { xs: 24, sm: 26 } }} />,
              bg: '#f3e5f5',
              border: '#e1bee7',
              badge: 'खाता',
              badgeBg: '#7b1fa2',
              action: () => setOpenMeraKhet(true)
            }
          ].map((tool, idx) => (
            <Grid item xs={3} sm={3} md={1.5} key={idx}>
              <Box
                className="touch-card"
                onClick={() => { stopSpeech(); tool.action(); }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  py: { xs: 0.6, sm: 1 },
                  px: 0.3,
                  borderRadius: '12px',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    transform: 'translateY(-2px)'
                  },
                  '&:active': {
                    transform: 'scale(0.94)'
                  }
                }}
              >
                <Box sx={{ position: 'relative', mb: 0.8 }}>
                  <Box
                    sx={{
                      bgcolor: tool.bg,
                      width: { xs: 46, sm: 52 },
                      height: { xs: 46, sm: 52 },
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${tool.border}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    {tool.icon}
                  </Box>
                  {tool.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        bgcolor: tool.badgeBg,
                        color: '#ffffff',
                        fontSize: { xs: '0.54rem', sm: '0.6rem' },
                        fontWeight: 800,
                        px: 0.6,
                        py: 0.1,
                        borderRadius: '6px',
                        border: '1.5px solid #ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        lineHeight: 1.15,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tool.badge}
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.74rem', sm: '0.8rem' },
                    color: '#0f172a',
                    lineHeight: 1.25,
                    textAlign: 'center',
                    minHeight: { xs: 28, sm: 30 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  {tool.title}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 6. Interactive 6-Stage Agricultural Lifecycle Stepper */}
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
          🌱 फसल से लेकर बिक्री तक (6 चरणीय कृषि यात्रा)
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
          चरण चुनें व जानें
        </Typography>
      </Box>

      {/* Horizontal Stepper Chips */}
      <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.2, scrollbarWidth: 'none' }}>
        {LIFECYCLE_STEPS.map((item) => {
          const isActive = expandedStep === item.step;
          return (
            <Chip
              key={item.step}
              clickable
              onClick={() => {
                stopSpeech();
                setExpandedStep(item.step);
              }}
              label={`${item.step}. ${item.tag}`}
              sx={{
                bgcolor: isActive ? item.color : '#f8fafc',
                color: isActive ? '#fff' : '#475569',
                border: isActive ? `1.5px solid ${item.color}` : '1px solid #e2e8f0',
                fontWeight: 800,
                fontSize: '0.76rem',
                borderRadius: 2.5,
                py: 1.8,
                px: 0.8,
                whiteSpace: 'nowrap',
                boxShadow: isActive ? `0 2px 8px ${item.color}35` : 'none',
                transition: 'all 0.18s ease'
              }}
            />
          );
        })}
      </Box>

      {/* Focused Active Stage Card */}
      {(() => {
        const currentStep = LIFECYCLE_STEPS.find((s) => s.step === expandedStep) || LIFECYCLE_STEPS[0];
        return (
          <Card
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: `1.5px solid ${currentStep.color}30`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: currentStep.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem'
                  }}
                >
                  {currentStep.step}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: currentStep.color, fontSize: '0.92rem' }}>
                    {currentStep.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                    {currentStep.short}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={currentStep.tag}
                size="small"
                sx={{ bgcolor: `${currentStep.color}15`, color: currentStep.color, fontWeight: 800, fontSize: '0.68rem', height: 22 }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.84rem', lineHeight: 1.6, mb: 1.5 }}>
              {currentStep.desc}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Button
                size="small"
                startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                onClick={(e) => handleReadStep(e, currentStep)}
                sx={{
                  color: currentStep.color,
                  bgcolor: `${currentStep.color}12`,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.4,
                  '&:hover': { bgcolor: `${currentStep.color}25` }
                }}
              >
                आवाज में सुनें
              </Button>

              {currentStep.step === 3 && (
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => { stopSpeech(); onNavigate('schemes'); }}
                  sx={{ color: '#2e7d32', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  खाद कैलकुलेटर खोलें
                </Button>
              )}
              {currentStep.step === 4 && (
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => { stopSpeech(); onNavigate('doctor'); }}
                  sx={{ color: '#c62828', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  फसल डॉक्टर खोलें
                </Button>
              )}
              {currentStep.step === 6 && (
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                  onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                  sx={{ color: '#1565c0', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  मंडी भाव देखें
                </Button>
              )}
            </Box>
          </Card>
        );
      })()}

      {/* 7. Platform-Aware Native APK & Share Footer */}
      <Card
        sx={{
          mt: 2,
          p: { xs: 1.8, sm: 2 },
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d12 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(27,94,32,0.2)',
          border: '1px solid #81c784'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AndroidIcon sx={{ fontSize: 28, color: '#ffeb3b' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>
                  {isNativePlatform() ? 'किसान साथी Android App' : 'किसान साथी Android App (APK)'}
                </Typography>
                <Chip
                  label={`v${appConfig.appVersion}`}
                  size="small"
                  sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.74rem' }}>
                {isNativePlatform() ? 'नवीनतम संस्करण फोन में सक्रिय है' : '1.5 MB लाइटवेट • बिना इंटरनेट चलेगा'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {isNativePlatform() ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => shareOnWhatsApp()}
                  sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#128C7E' } }}
                >
                  व्हाट्सएप
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={checkingUpdate ? <CircularProgress size={12} color="inherit" /> : <SyncIcon />}
                  disabled={checkingUpdate}
                  onClick={handleManualCheckUpdate}
                  sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.2, fontSize: '0.75rem' }}
                >
                  {checkingUpdate ? 'जांच...' : 'अपडेट जांचें'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<GetAppIcon />}
                  href={appConfig.apkDownloadUrl}
                  target="_blank"
                  download
                  sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, borderRadius: 2, px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#fff' } }}
                >
                  APK डाउनलोड
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={checkingUpdate ? <CircularProgress size={12} color="inherit" /> : <SyncIcon />}
                  disabled={checkingUpdate}
                  onClick={handleManualCheckUpdate}
                  sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.2, fontSize: '0.75rem' }}
                >
                  {checkingUpdate ? 'जांच...' : 'अपडेट जांचें'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Card>

      {/* Modals & Dialogs */}
      <MeraKhetModal
        open={openMeraKhet}
        onClose={() => setOpenMeraKhet(false)}
        selectedDistrict={selectedDistrict}
        weatherContext={weather}
      />

      <FieldGpsTrackerModal
        open={openGpsTracker}
        onClose={() => setOpenGpsTracker(false)}
        onSaveArea={() => setOpenMeraKhet(true)}
      />

      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        onApplyToCalculator={() => onNavigate('schemes')}
      />

      <MotorControllerModal
        open={openMotorModal}
        onClose={() => setOpenMotorModal(false)}
        weatherContext={weather}
      />

      <DeviceHubModal
        open={openDeviceHub}
        onClose={() => setOpenDeviceHub(false)}
        onOpenGpsTracker={() => setOpenGpsTracker(true)}
        onOpenSoilIot={() => setOpenSoilIot(true)}
        onOpenMotorModal={() => setOpenMotorModal(true)}
        onApplySoilToCalc={() => onNavigate('schemes')}
      />

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: updateInfo?.hasUpdate ? '#2e7d32' : '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}>
          {updateInfo?.hasUpdate ? <SystemUpdateIcon /> : <CheckCircleIcon />}
          {updateInfo?.hasUpdate ? 'नया अपडेट उपलब्ध है!' : 'ऐप पूरी तरह अपडेटेड है'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {updateInfo?.hasUpdate ? (
            <Box>
              <Typography variant="body2" sx={{ color: '#263238', fontWeight: 600, mb: 1 }}>
                किसान साथी का नवीनतम संस्करण <strong>v{updateInfo.latestVersion}</strong> डाउनलोड के लिए तैयार है।
              </Typography>
              <Box sx={{ bgcolor: '#f1f8e9', p: 1.5, borderRadius: 2, mb: 1.5, border: '1px solid #c8e6c9' }}>
                <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block' }}>
                  • आपका वर्तमान वर्ज़न: v{updateInfo.currentVersion}
                </Typography>
                <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block' }}>
                  • नया उपलब्ध वर्ज़न: v{updateInfo.latestVersion}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#546e7a', display: 'block', mb: 1 }}>
                * नोट: अपडेट करने पर आपका पुराना खाता, खेत व किसान डायरी का रिकॉर्ड बिल्कुल सुरक्षित रहेगा।
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1b5e20', mb: 0.5 }}>
                आप पहले से ही नवीनतम संस्करण (v{updateInfo?.currentVersion || appConfig.appVersion}) का उपयोग कर रहे हैं।
              </Typography>
              <Typography variant="caption" sx={{ color: '#546e7a' }}>
                सभी कृषि योजनाएं, मौसम अलर्ट और मंडी भाव नवीनतम स्थिति में हैं।
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          {updateInfo?.hasUpdate ? (
            <>
              <Button onClick={() => setUpdateDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700 }}>
                बाद में
              </Button>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                href={updateInfo.downloadUrl}
                target="_blank"
                download
                sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, borderRadius: 2 }}
              >
                अपडेट डाउनलोड करें
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setUpdateDialogOpen(false)}
              sx={{ bgcolor: '#1565c0', color: '#fff', fontWeight: 700, borderRadius: 2, mx: 'auto' }}
            >
              ठीक है
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
