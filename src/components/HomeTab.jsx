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
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CampaignIcon from '@mui/icons-material/Campaign';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScienceIcon from '@mui/icons-material/Science';
import { speakText } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { fetchLiveWeather } from '../services/weatherService';
import { MeraKhetModal } from './MeraKhetModal';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';

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
  const [weather, setWeather] = useState(null);

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
        </CardContent>
      </Card>

      {/* 🌾 मेरा खेत: बहु-फसली स्मार्ट ट्रैकर बैनर */}
      <Card
        onClick={() => setOpenMeraKhet(true)}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>
                  🌾 मेरा खेत: बहु-फसली स्मार्ट ट्रैकर
                </Typography>
                <Chip
                  label="नया"
                  size="small"
                  sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.78rem', display: 'block', mt: 0.4, lineHeight: 1.3 }}>
                धान, चना, सब्जी आदि सभी फसलों का A to Z हिसाब व दैनिक मौसम-कार्य
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
            खोलें
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

      {/* Quick Action Grid (त्वरित सेवाएं) */}
      <Typography variant="h6" sx={{ fontSize: { xs: '1.05rem', md: '1.2rem' }, fontWeight: 800, color: '#134e19', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>🚀</span> त्वरित समाधान व टूल्स (Quick Agricultural Tools)
      </Typography>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mb: 3.5 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => onNavigate('doctor')}
            sx={{
              p: { xs: 1.6, sm: 2 },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MedicalServicesIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.96rem' } }}>
                  फसल डॉक्टर
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4 }}>
                रोग व कीट पहचान, फोटो जांचें और सही उपचार जानें
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => onNavigate('schemes')}
            sx={{
              p: { xs: 1.6, sm: 2 },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <Box sx={{ bgcolor: '#e8f5e9', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalculateIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.96rem' } }}>
                  खाद कैलकुलेटर
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4 }}>
                एकड़ अनुसार यूरिया, DAP, पोटाश और मिट्टी सलाह
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => onNavigate('mandi')}
            sx={{
              p: { xs: 1.6, sm: 2 },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StorefrontIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.96rem' } }}>
                  लाइव मंडी भाव
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4 }}>
                छत्तीसगढ़ व राष्ट्रीय मंडियों के आज के ताजा भाव
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <Card
            className="touch-card"
            onClick={() => onNavigate('schemes')}
            sx={{
              p: { xs: 1.6, sm: 2 },
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                <Box sx={{ bgcolor: '#fff8e1', p: 1, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MonetizationOnIcon sx={{ color: '#f57f17', fontSize: 24 }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.96rem' } }}>
                  ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} धान योजना
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4 }}>
                कृषक उन्नति योजना व टोकन तुंहर हाथ की सीधी गाइड
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={4} lg={2}>
          <Card
            className="touch-card"
            onClick={() => setOpenGpsTracker(true)}
            sx={{
              p: { xs: 1.6, sm: 2 },
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
                <Chip label="नया" size="small" sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.96rem' } }}>
                खेत सीमा जीपीएस मापक
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4, mt: 0.5 }}>
                मेड़ पर चलकर एकड़, डिसमिल व सीमा नापें
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={4} lg={2}>
          <Card
            className="touch-card"
            onClick={() => setOpenSoilIot(true)}
            sx={{
              p: { xs: 1.6, sm: 2 },
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
                <Chip label="IoT" size="small" sx={{ bgcolor: '#00796b', color: '#fff', fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.9rem', sm: '0.96rem' } }}>
                स्मार्ट मिट्टी IoT सेंसर
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.76rem', lineHeight: 1.4, mt: 0.5 }}>
                ब्लूटूथ प्रोब से pH, नमी, N-P-K जांच व सलाह
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Field GPS Tracker Modal */}
      <FieldGpsTrackerModal
        open={openGpsTracker}
        onClose={() => setOpenGpsTracker(false)}
        onSaveArea={(acres) => {
          setOpenMeraKhet(true);
        }}
      />

      {/* Soil IoT Sensor Modal */}
      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        onApplyToCalculator={() => onNavigate('schemes')}
      />


      {/* Complete Lifecycle Stepper (फसल से लेकर बिक्री तक 6 चरण) */}
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b5e20' }}>
            🌱 फसल से लेकर बिक्री तक (6 चरण)
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
            प्रत्येक चरण पर टैप करके सम्पूर्ण जानकारी और आवाज में सुनें
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        {LIFECYCLE_STEPS.map((item) => (
          <Accordion
            key={item.step}
            expanded={expandedStep === item.step}
            onChange={() => setExpandedStep(expandedStep === item.step ? null : item.step)}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    onClick={() => onNavigate('schemes')}
                    sx={{ color: '#2e7d32', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    खाद कैलकुलेटर खोलें
                  </Button>
                )}
                {item.step === 4 && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onNavigate('doctor')}
                    sx={{ color: '#c62828', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    रोग डॉक्टर देखें
                  </Button>
                )}
                {item.step === 6 && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => onNavigate('mandi')}
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
    </Box>
  );
};
