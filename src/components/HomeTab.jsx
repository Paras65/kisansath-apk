import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import ShareIcon from '@mui/icons-material/Share';
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
import { MeraKhetModal } from './MeraKhetModal';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { MotorControllerModal } from './MotorControllerModal';
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
    title: 'खेत तैयारी व मृदा स्वास्थ्य (Soil Prep)',
    short: 'मृदा परीक्षण व गहरी जुताई',
    tag: 'बुआई पूर्व',
    color: '#5d4037',
    desc: 'गर्मियों में गहरी जुताई करें ताकि हानिकारक कीटों के अंडे व खरपतवार नष्ट हो जाएं। गोबर की सड़ी खाद 4-5 टन प्रति एकड़ डालें और नजदीकी कृषि विज्ञान केंद्र से मिट्टी की जांच कराएं (आदर्श pH: 6.0-7.0)।',
    voice: 'पहला चरण: खेत तैयारी और मृदा स्वास्थ्य। खेत की गहरी जुताई करें। 4 से 5 टन गोबर खाद प्रति एकड़ डालें और मिट्टी का पीएच टेस्ट कराएं।'
  },
  {
    step: 2,
    title: 'बीज चयन व बीजोपचार (Seed & Sowing)',
    short: 'प्रमाणित बीज व फफूंदनाशी उपचार',
    tag: 'बुआई',
    color: '#2e7d32',
    desc: 'प्रमाणित किस्मों (जैसे धान में सरना, महामाया, एचएमटी) का चुनाव करें। बुआई से पूर्व बीजोपचार अवश्य करें: 1 कि.ग्रा. बीज में 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिलाकर 24 घंटे रखें। इससे उकठा व झुलसा रोग नहीं लगता।',
    voice: 'दूसरा चरण: बीज चयन और बीजोपचार। हमेशा प्रमाणित बीज का उपयोग करें और बुआई से पहले ट्राइकोडर्मा या बाविस्टिन से बीजोपचार जरूर करें।'
  },
  {
    step: 3,
    title: 'संतुलित पोषण व खाद प्रबंधन (Nutrition)',
    short: 'यूरिया, डीएपी व पोटाश का सही समय',
    tag: 'वृद्धि अवस्था',
    color: '#00796b',
    desc: 'बुआई के समय पूरी डीएपी और पोटाश डालें। यूरिया को तीन बराबर भागों में बांटकर दें (बुआई, कल्ले फूटने पर 25 दिन बाद, और बालियां आने से पहले 45 दिन बाद)। जिंक सल्फेट कभी भी डीएपी के साथ मिलाकर न डालें।',
    voice: 'तीसरा चरण: पोषण और खाद प्रबंधन। डीएपी और पोटाश बुआई के समय डालें। यूरिया को तीन भागों में दें। जिंक और डीएपी को कभी मिलाकर न डालें।'
  },
  {
    step: 4,
    title: 'फसल सुरक्षा व रोग निदान (Crop Protection)',
    short: 'कीट व बीमारी का समय पर नियंत्रण',
    tag: 'सुरक्षा',
    color: '#c62828',
    desc: 'खेत में नियमित निगरानी करें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं। भूरा माहू होने पर खेत का पानी 2 दिन निकालें और नीम तेल या पाइमेट्रोज़िन का छिड़काव तनों पर करें। पत्तियों पर धब्बे दिखने पर ट्राईसाइक्लाजोल का छिड़काव करें।',
    voice: 'चौथा चरण: फसल सुरक्षा और रोग निदान। पत्तियों और तनों का नियमित निरीक्षण करें। लक्षण दिखते ही फसल डॉक्टर टैब में फोटो या लक्षण जांचकर सही दवा छिड़कें।'
  },
  {
    step: 5,
    title: 'कटाई व सुखाना (Harvest & Threshing)',
    short: 'सही नमी पर कटाई व भंडारण',
    tag: 'कटाई',
    color: '#f57f17',
    desc: 'जब बालियों के 85-90% दाने सुनहरे हो जाएं तब कटाई करें। कटाई के बाद फसल को धूप में अच्छी तरह सुखाएं। उपार्जन केंद्र ले जाने से पहले अनाज में नमी 14-17% से अधिक नहीं होनी चाहिए ताकि वजन में कटौती न हो।',
    voice: 'पांचवां चरण: कटाई और सुखाना। जब 85 से 90 प्रतिशत दाने सुनहरे हो जाएं तब कटाई करें और अनाज को सुखाकर नमी 14 से 17 प्रतिशत तक लाएं।'
  },
  {
    step: 6,
    title: `मंडी भाव व सरकारी बिक्री (Mandi & ₹${appConfig.paddyScheme.totalRate})`,
    short: 'टोकन तुंहर हाथ व कृषक उन्नति योजना',
    tag: 'बिक्री',
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

  // Live Zero-Key Weather Fetch (Open-Meteo)
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
      {/* Government Notification Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: '#fff8e1',
          border: '1.5px solid #ffe082',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5
        }}
      >
        <CampaignIcon sx={{ color: '#f57f17', mt: 0.2, fontSize: 24 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b78103', fontSize: '0.9rem' }}>
            आवश्यक सूचना: एग्री-स्टैक / किसान रजिस्ट्री अनिवार्य
          </Typography>
          <Typography variant="body2" sx={{ color: '#5d4037', fontSize: '0.82rem', mt: 0.3, lineHeight: 1.35 }}>
            धान समर्थन मूल्य पर ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} प्रति क्विंटल बेचने हेतु <strong>Agri-Stack / किसान रजिस्ट्री पोर्टल</strong> पर पंजीकरण जरूरी है। नजदीकी समिति या लोक सेवा केंद्र से सत्यापन करवाएं।
          </Typography>
        </Box>
      </Paper>

      {/* 🚀 New App Update Available Banner */}
      {updateInfo?.hasUpdate && (
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 3,
            bgcolor: '#e8f5e9',
            border: '2px solid #2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <SystemUpdateIcon sx={{ color: '#2e7d32', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.9rem' }}>
                🎉 नया अपडेट उपलब्ध है (v{updateInfo.latestVersion})!
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.75rem', display: 'block' }}>
                वर्तमान वर्ज़न: v{updateInfo.currentVersion} • नया APK इंस्टॉल करें, पुराना डेटा सुरक्षित रहेगा
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<GetAppIcon />}
            href={updateInfo.downloadUrl}
            target="_blank"
            download
            sx={{
              bgcolor: '#2e7d32',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.78rem',
              borderRadius: 2,
              px: 1.8,
              py: 0.6,
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            अभी अपडेट करें
          </Button>
        </Paper>
      )}

      {/* Weather & Daily Advisory Card */}
      <Card
        sx={{
          mb: 2.5,
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: '#ffffff',
          borderRadius: 3.5,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.4rem' }}>
                {weather?.conditionIcon || '🌤️'}
              </Typography>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>
                  आज का मौसम • {selectedDistrict}
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.7rem' }}>
                  {weather?.isLive ? '🔴 लाइव मौसम (Open-Meteo)' : '📦 सुरक्षित ऑफ़लाइन डेटा'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={weather?.sprayAdvisory?.badge || 'सामान्य अनुकूल'}
              size="small"
              sx={{
                bgcolor: weather?.sprayAdvisory?.canSpray ? 'rgba(255,255,255,0.22)' : '#d32f2f',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            />
          </Box>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#c8e6c9', display: 'block', fontSize: '0.72rem' }}>तापमान</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                  {weather ? `${weather.temp}°C` : '29°C'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.68rem' }}>
                  {weather ? weather.conditionText : 'धूप व बादल'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3 }}>
                  <WaterDropIcon sx={{ fontSize: 13, color: '#81d4fa' }} />
                  <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem' }}>नमी / वर्षा</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                  {weather ? `${weather.humidity}%` : '62%'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.68rem' }}>
                  {weather ? `बारिश: ${weather.rainProbability}%` : 'संभावना 10%'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 1, borderRadius: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3 }}>
                  <AirIcon sx={{ fontSize: 13, color: '#e0e0e0' }} />
                  <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem' }}>हवा की गति</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                  {weather ? `${weather.windSpeed} km/h` : '11 km/h'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.68rem' }}>
                  {weather?.windSpeed > 15 ? 'तेज हवा' : 'शांत हवा'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Daily Agricultural Spray Advisory */}
          <Box
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.22)',
              p: 1.5,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              border: weather?.sprayAdvisory?.canSpray ? '1px solid rgba(255,255,255,0.2)' : '1px solid #ef5350'
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#ffeb3b', fontWeight: 800, fontSize: '0.75rem', display: 'block' }}>
                {weather?.sprayAdvisory?.status || '💡 आज की खास कृषि सलाह'}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#f1f8e9', lineHeight: 1.35 }}>
                {weather?.sprayAdvisory?.advisory || 'धान में कल्ले और बालियां आते समय खेत में 2-3 सेमी जलस्तर बनाकर रखें। कीटनाशक छिड़काव के लिए शाम का समय चुनें।'}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
              onClick={handleReadAdvisory}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                whiteSpace: 'nowrap',
                fontSize: '0.72rem',
                py: 0.4,
                px: 1,
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#fff' }
              }}
            >
              सुनें
            </Button>
          </Box>

          {/* 3-Day Agricultural Forecast Strip */}
          {weather?.forecast3Days && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontWeight: 800, fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 15, color: '#ffeb3b' }} />
                अगले 3 दिनों का कृषि मौसम व वर्षा पूर्वानुमान:
              </Typography>
              <Grid container spacing={1}>
                {weather.forecast3Days.map((f, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Box
                      sx={{
                        bgcolor: idx === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
                        p: 1,
                        borderRadius: 2,
                        textAlign: 'center',
                        border: idx === 0 ? '1px solid rgba(255,255,255,0.35)' : 'none'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: idx === 0 ? '#ffeb3b' : '#c8e6c9', fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                        {f.day}
                      </Typography>
                      <Typography sx={{ fontSize: '1.2rem', my: 0.2 }}>
                        {f.icon}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.84rem' }}>
                        {f.tempMax}° / {f.tempMin}°
                      </Typography>
                      <Typography variant="caption" sx={{ color: f.rainProb > 40 ? '#ff8a80' : '#81d4fa', fontSize: '0.66rem', fontWeight: 700 }}>
                        वर्षा: {f.rainProb}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 🌾 आज के प्रमुख मंडी भाव (Mandi Price Pulse Card) */}
      <Card
        sx={{
          mb: 2.5,
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1.5px solid #bbdefb',
          boxShadow: '0 4px 14px rgba(25, 118, 210, 0.08)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 1.8, bgcolor: '#f0f7ff', borderBottom: '1px solid #e3f2fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ bgcolor: '#e3f2fd', p: 0.8, borderRadius: 2 }}>
              <TrendingUpIcon sx={{ color: '#1976d2', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0d47a1', fontSize: '0.92rem', lineHeight: 1.2 }}>
                आज के प्रमुख मंडी भाव (Live Mandi Pulse)
              </Typography>
              <Typography variant="caption" sx={{ color: '#546e7a', fontSize: '0.72rem' }}>
                छत्तीसगढ़ समर्थन मूल्य (₹3,100) व प्रमुख मंडियों के ताजा भाव
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={() => { stopSpeech(); onNavigate('mandi'); }}
            sx={{
              bgcolor: '#1976d2',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.72rem',
              borderRadius: 2,
              py: 0.4,
              px: 1.2,
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            सभी भाव
          </Button>
        </Box>

        <CardContent sx={{ p: 1.5 }}>
          <Grid container spacing={1}>
            {FEATURED_MANDI_RATES.map((item, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Paper
                  elevation={0}
                  onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    bgcolor: '#fafafa',
                    border: '1px solid #eeeeee',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: '#f0f9ff', borderColor: '#90caf9' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#263238' }}>
                      {item.crop}
                    </Typography>
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{ bgcolor: `${item.color}15`, color: item.color, fontWeight: 800, fontSize: '0.62rem', height: 18 }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: item.color, fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {item.rate}
                    <Typography component="span" variant="caption" sx={{ color: '#78909c', fontSize: '0.68rem', ml: 0.3 }}>
                      /क्विं.
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#78909c', fontSize: '0.68rem', display: 'block', mt: 0.3 }}>
                    {item.type}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* 🌾 मेरा खेत: किसान प्रोफाइल व बहु-फसली स्मार्ट ट्रैकर बैनर */}
      <Card
        onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
        sx={{
          mb: 2.5,
          cursor: 'pointer',
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(27,94,32,0.22)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          border: '1.5px solid #81c784',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(27,94,32,0.3)' }
        }}
      >
        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                p: 1.2,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AgricultureIcon sx={{ fontSize: 32, color: '#ffeb3b' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>
                  {activeFarmer?.name ? `नमस्ते, ${activeFarmer.name} जी` : '🌾 मेरा खेत: बहु-फसली स्मार्ट ट्रैकर'}
                </Typography>
                <Chip
                  label={activeFarmer?.name ? 'सक्रिय किसान' : 'नया'}
                  size="small"
                  sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.78rem', display: 'block', mt: 0.4, lineHeight: 1.3 }}>
                {activeFarmer?.name
                  ? `गांव: ${activeFarmer.village || selectedDistrict} • फसलें, मेड़ जीपीएस, ट्यूबवेल व दैनिक कृषि कार्य`
                  : 'धान, चना, सब्जी आदि सभी फसलों का A to Z हिसाब व दैनिक मौसम-कार्य'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#ffeb3b',
              color: '#1b5e20',
              fontWeight: 800,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              borderRadius: 2,
              px: 1.8,
              '&:hover': { bgcolor: '#fff' }
            }}
          >
            {activeFarmer?.name ? 'खेत देखें' : 'खोलें'}
          </Button>
        </CardContent>
      </Card>

      {/* Mera Khet Modal */}
      <MeraKhetModal
        open={openMeraKhet}
        onClose={() => setOpenMeraKhet(false)}
        selectedDistrict={selectedDistrict}
        weatherContext={weather}
      />

      {/* 🚀 मुख्य कृषि सेवाएं (Core Agricultural Hub - 4 Cards) */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, fontWeight: 800, color: '#134e19', display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <span>🚀</span> मुख्य कृषि सेवाएं (Core Agricultural Hub)
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); onNavigate('doctor'); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #ffcdd2',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(211, 47, 47, 0.06)',
              '&:hover': { borderColor: '#e53935', boxShadow: '0 6px 20px rgba(211, 47, 47, 0.15)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MedicalServicesIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
                </Box>
                <Chip label="कैमरा AI" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                फसल डॉक्टर
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                पत्ती की फोटो खींचें, रोग पहचानें व तुरंत सटीक दवा इलाज पाएं
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); onNavigate('schemes'); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #c8e6c9',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(46, 125, 50, 0.06)',
              '&:hover': { borderColor: '#2e7d32', boxShadow: '0 6px 20px rgba(46, 125, 50, 0.15)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#e8f5e9', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalculateIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                </Box>
                <Chip label="मात्रा कैलकुलेटर" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                खाद कैलकुलेटर
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                एकड़ अनुसार यूरिया, DAP, पोटाश व जैविक खाद की सटीक बोरी नापें
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); onNavigate('mandi'); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #bbdefb',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(25, 118, 210, 0.06)',
              '&:hover': { borderColor: '#1976d2', boxShadow: '0 6px 20px rgba(25, 118, 210, 0.15)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StorefrontIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                </Box>
                <Chip label="ताजा भाव" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                लाइव मंडी भाव
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                छत्तीसगढ़ व राष्ट्रीय प्रमुख मंडियों के दैनिक फसल आवक व रेट
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); onNavigate('schemes'); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #ffe082',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(245, 127, 23, 0.06)',
              '&:hover': { borderColor: '#f57f17', boxShadow: '0 6px 20px rgba(245, 127, 23, 0.15)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#fff8e1', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MonetizationOnIcon sx={{ color: '#f57f17', fontSize: 24 }} />
                </Box>
                <Chip label="₹3,100" size="small" sx={{ bgcolor: '#fff8e1', color: '#e65100', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} धान योजना
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                कृषक उन्नति योजना, टोकन तुंहर हाथ व 21 क्विंटल उपार्जन गाइड
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ⚡ स्मार्ट कृषि टूल्स व IoT (4 Balanced Precision Tools) */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, fontWeight: 800, color: '#134e19', display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <span>⚡</span> स्मार्ट कृषि टूल्स व IoT (Precision & Smart Farming)
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3.5 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); setOpenGpsTracker(true); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #a5d6a7',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(46, 125, 50, 0.08)',
              '&:hover': { borderColor: '#2e7d32', boxShadow: '0 6px 20px rgba(46, 125, 50, 0.18)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#e8f5e9', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DirectionsWalkIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                </Box>
                <Chip label="GPS नाप" size="small" sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                खेत सीमा GPS मापक
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                मेड़ पर चलकर एकड़, डिसमिल, वर्गमीटर व परिमाप सटीक नापें
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); setOpenMotorModal(true); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #81d4fa',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(1, 87, 155, 0.08)',
              '&:hover': { borderColor: '#0288d1', boxShadow: '0 6px 20px rgba(1, 87, 155, 0.18)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#e1f5fe', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 24 }} />
                </Box>
                <Chip label="IoT/GSM" size="small" sx={{ bgcolor: '#0288d1', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                स्मार्ट ट्यूबवेल कंट्रोलर
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                घर बैठे फोन कॉल/SMS से मोटर ऑन-ऑफ व 3-फेज बिजली जांच
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); setOpenSoilIot(true); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #80cbc4',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0, 121, 107, 0.08)',
              '&:hover': { borderColor: '#00796b', boxShadow: '0 6px 20px rgba(0, 121, 107, 0.18)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#e0f2f1', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ScienceIcon sx={{ color: '#00796b', fontSize: 24 }} />
                </Box>
                <Chip label="Bluetooth" size="small" sx={{ bgcolor: '#00796b', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                स्मार्ट मिट्टी IoT सेंसर
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                ब्लूटूथ प्रोब से मिट्टी का pH, नमी, N-P-K और उर्वरता लाइव परखें
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
            sx={{
              p: { xs: 1.5, sm: 2 },
              height: '100%',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              border: '1.5px solid #d1c4e9',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(103, 58, 183, 0.08)',
              '&:hover': { borderColor: '#673ab7', boxShadow: '0 6px 20px rgba(103, 58, 183, 0.18)' }
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ bgcolor: '#ede7f6', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MenuBookIcon sx={{ color: '#673ab7', fontSize: 24 }} />
                </Box>
                <Chip label="डायरी" size="small" sx={{ bgcolor: '#673ab7', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.62rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.88rem', sm: '0.95rem' } }}>
                डिजिटल किसान डायरी
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.74rem', lineHeight: 1.4, mt: 0.3 }}>
                खेत की लागत, खाद-बीज खर्च, आमदनी व फसल चक्र का पूरा हिसाब
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Field GPS Tracker Modal */}
      <FieldGpsTrackerModal
        open={openGpsTracker}
        onClose={() => setOpenGpsTracker(false)}
        onSaveArea={() => {
          setOpenMeraKhet(true);
        }}
      />

      {/* Soil IoT Sensor Modal */}
      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        onApplyToCalculator={() => onNavigate('schemes')}
      />

      {/* Smart Tubewell Motor Controller Modal */}
      <MotorControllerModal
        open={openMotorModal}
        onClose={() => setOpenMotorModal(false)}
        weatherContext={weather}
      />

      {/* Enhanced Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Complete Lifecycle Stepper (फसल से लेकर बिक्री तक 6 चरण) */}
      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b5e20' }}>
            🌱 फसल से लेकर बिक्री तक (6 चरण)
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
            चरण चुनें, सम्पूर्ण वैज्ञानिक कार्यविधि देखें व आवाज में सुनें
          </Typography>
        </Box>
      </Box>

      {/* 🧭 Horizontal Quick Step Selector Chips */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          mb: 1.5,
          '::-webkit-scrollbar': { height: 4 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#c8e6c9', borderRadius: 4 }
        }}
      >
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
                bgcolor: isActive ? item.color : '#f1f5f9',
                color: isActive ? '#fff' : '#334155',
                fontWeight: 800,
                fontSize: '0.78rem',
                py: 2,
                px: 0.8,
                borderRadius: 2.5,
                border: isActive ? `1.5px solid ${item.color}` : '1px solid #cbd5e1',
                boxShadow: isActive ? `0 2px 8px ${item.color}40` : 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: isActive ? item.color : '#e2e8f0'
                }
              }}
            />
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        {LIFECYCLE_STEPS.map((item) => (
          <Accordion
            key={item.step}
            expanded={expandedStep === item.step}
            onChange={() => {
              stopSpeech();
              setExpandedStep(expandedStep === item.step ? null : item.step);
            }}
            sx={{
              borderRadius: '14px !important',
              border: expandedStep === item.step ? `1.5px solid ${item.color}` : '1px solid #e0e0e0',
              boxShadow: expandedStep === item.step ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: item.color }} />}
              sx={{ px: 1.8, py: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}
                >
                  {item.step}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#222' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', fontSize: '0.74rem' }}>
                    {item.short}
                  </Typography>
                </Box>
                <Chip
                  label={item.tag}
                  size="small"
                  sx={{
                    bgcolor: `${item.color}15`,
                    color: item.color,
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    height: 22
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="body2" sx={{ color: '#444', fontSize: '0.84rem', lineHeight: 1.5, mb: 1.5 }}>
                {item.desc}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                  onClick={(e) => handleReadStep(e, item)}
                  sx={{
                    color: item.color,
                    bgcolor: `${item.color}10`,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                    '&:hover': { bgcolor: `${item.color}25` }
                  }}
                >
                  आवाज में सुनें
                </Button>
                {item.step === 3 && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => { stopSpeech(); onNavigate('schemes'); }}
                    sx={{ color: '#2e7d32', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    खाद कैलकुलेटर खोलें
                  </Button>
                )}
                {item.step === 4 && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => { stopSpeech(); onNavigate('doctor'); }}
                    sx={{ color: '#c62828', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    रोग डॉक्टर देखें
                  </Button>
                )}
                {item.step === 6 && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                    sx={{ color: '#1565c0', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    मंडी भाव देखें
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* 📲 Platform-Aware App Banner (APK vs Share in Native) */}
      <Card
        sx={{
          mt: 3,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d12 100%)',
          color: '#ffffff',
          p: { xs: 2, sm: 2.5 },
          boxShadow: '0 4px 18px rgba(27,94,32,0.25)',
          border: '1.5px solid #81c784'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 1.2, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AndroidIcon sx={{ fontSize: 36, color: '#ffeb3b' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem', lineHeight: 1.2 }}>
                  {isNativePlatform() ? '📱 किसान साथी Android App' : '📱 किसान साथी Android App (APK)'}
                </Typography>
                <Chip
                  label={`v${appConfig.appVersion}`}
                  size="small"
                  sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
                />
                {isNativePlatform() && (
                  <Chip
                    label="सक्रिय"
                    size="small"
                    sx={{ bgcolor: '#81c784', color: '#0d3d12', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#c8e6c9', display: 'block', fontSize: '0.76rem', mt: 0.3 }}>
                {isNativePlatform()
                  ? `नवीनतम संस्करण v${appConfig.appVersion} फोन में सक्रिय है • अन्य किसान भाइयों को शेयर करें`
                  : `नवीनतम संस्करण v${appConfig.appVersion} • 1.5 MB लाइटवेट • बिना इंटरनेट भी चलेगा`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {isNativePlatform() ? (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<WhatsAppIcon />}
                  onClick={() => shareOnWhatsApp()}
                  sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 800, borderRadius: 2, px: 2, py: 0.8, fontSize: '0.8rem', '&:hover': { bgcolor: '#128C7E' } }}
                >
                  व्हाट्सएप शेयर
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={checkingUpdate ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
                  disabled={checkingUpdate}
                  onClick={handleManualCheckUpdate}
                  sx={{ borderColor: 'rgba(255,255,255,0.7)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.6, py: 0.8, fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#fff' } }}
                >
                  {checkingUpdate ? 'जांच जारी...' : 'अपडेट जांचें'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareModalOpen(true)}
                  sx={{ borderColor: 'rgba(255,255,255,0.7)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.8, py: 0.8, fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#fff' } }}
                >
                  अन्य विकल्प
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
                  sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, borderRadius: 2, px: 2, py: 0.8, fontSize: '0.8rem', '&:hover': { bgcolor: '#fff' } }}
                >
                  APK डाउनलोड (v{appConfig.appVersion})
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={checkingUpdate ? <CircularProgress size={14} color="inherit" /> : <SyncIcon />}
                  disabled={checkingUpdate}
                  onClick={handleManualCheckUpdate}
                  sx={{ borderColor: 'rgba(255,255,255,0.7)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.6, py: 0.8, fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#fff' } }}
                >
                  {checkingUpdate ? 'जांच जारी...' : 'अपडेट जांचें'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareModalOpen(true)}
                  sx={{ borderColor: 'rgba(255,255,255,0.7)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.8, py: 0.8, fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: '#fff' } }}
                >
                  शेयर करें
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Card>

      {/* 🔄 Update Status Dialog */}
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
                वर्तमान संस्करण v{appConfig.appVersion}
              </Typography>
              <Typography variant="body2" sx={{ color: '#546e7a' }}>
                आप पहले से ही किसान साथी के नवीनतम संस्करण का उपयोग कर रहे हैं। कोई नया अपडेट लंबित नहीं है।
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          {updateInfo?.hasUpdate ? (
            <>
              <Button onClick={() => setUpdateDialogOpen(false)} sx={{ color: '#78909c' }}>
                बाद में
              </Button>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                href={updateInfo.downloadUrl}
                target="_blank"
                download
                onClick={() => setUpdateDialogOpen(false)}
                sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, borderRadius: 2, '&:hover': { bgcolor: '#1b5e20' } }}
              >
                अभी अपडेट करें
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setUpdateDialogOpen(false)}
              sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 700, borderRadius: 2, px: 2.5 }}
            >
              ठीक है
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
