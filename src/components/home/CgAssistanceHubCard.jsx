import React from 'react';
import { Card, Box, Typography, Chip, IconButton, Button, Paper } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { appConfig } from '../../config/appConfig';
import { speakText, stopSpeech } from '../../utils/speech';
import { getIgkvSeasonalAdvisory } from '../../data/igkvAdvisoryData';

export const CgAssistanceHubCard = ({
  isChhattisgarhi = false,
  onNavigate = () => {},
  onOpenTokenGuide = () => {}
}) => {
  const advisory = getIgkvSeasonalAdvisory(isChhattisgarhi);

  const handleReadHub = () => {
    const fullSpeech = isChhattisgarhi
      ? `छत्तीसगढ़ धान खरीदी अऊ IGKV रायपुर किसानी गोठ। धान समर्थन मूल्य ₹${appConfig.paddyScheme.totalRate} प्रति क्विंटल, 21 क्विंटल प्रति एकड़ सरकारी खरीदी गारंटी हे। टोकन तुंहर हाथ ऑनलाइन बुकिंग ले घर बैठे टोकन कटाव। ${advisory.voiceText}`
      : `छत्तीसगढ़ धान उपार्जन एवं IGKV रायपुर कृषि बुलेटिन। धान समर्थन मूल्य ₹${appConfig.paddyScheme.totalRate} प्रति क्विंटल, 21 क्विंटल प्रति एकड़ उपार्जन गारंटी है। टोकन तुंहर हाथ ऑनलाइन पोर्टल से घर बैठे टोकन प्राप्त करें। ${advisory.voiceText}`;
    speakText(fullSpeech);
  };

  return (
    <Card
      sx={{
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #81c784',
        boxShadow: '0 4px 20px rgba(46, 125, 50, 0.08)',
        overflow: 'hidden',
        mb: 2.5
      }}
    >
      {/* Hub Header Strip */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AgricultureIcon sx={{ color: '#ffeb3b', fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: '0.94rem', color: '#ffffff' }}>
                {isChhattisgarhi ? '🌾 धान खरीदी अऊ समे के किसानी गोठ' : '🌾 धान उपार्जन एवं सामयिक कृषि हब'}
              </Typography>
              <Chip
                label={isChhattisgarhi ? '🏛️ छ.ग. सरकार अऊ IGKV रायपुर' : '🏛️ छ.ग. शासन व IGKV अधिकृत'}
                size="small"
                sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 900, height: 20, fontSize: '0.64rem' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.72rem', display: 'block' }}>
              {isChhattisgarhi
                ? 'टोकन तुंहर हाथ • ₹3,100 समर्थन मूल्य • रायपुर वैज्ञानिक सलाह'
                : 'टोकन तुंहर हाथ • ₹3,100 उपार्जन • रायपुर कृषि वैज्ञानिक परामर्श'}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={handleReadHub}
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
        >
          <VolumeUpIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Part 1: Paddy Procurement & Token Tuhar Hath Live Cards */}
      <Box sx={{ p: { xs: 1.8, sm: 2 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2 }}>
          {/* KPI 1: ₹3,100 Rate & 21 Quintals */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#f0fdf4',
              border: '1.5px solid #86efac',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.74rem' }}>
                  💰 {isChhattisgarhi ? 'धान खरीदी दर (कृषक उन्नति योजना)' : 'धान उपार्जन दर (कृषक उन्नति योजना)'}
                </Typography>
                <Chip
                  label={isChhattisgarhi ? '21 क्विंटल/एकड़' : '21 क्विंटल/एकड़'}
                  size="small"
                  sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 900, fontSize: '0.66rem', height: 20 }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#14532d', fontSize: '1.45rem', lineHeight: 1.2 }}>
                ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}{' '}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>/ क्विंटल धान</span>
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block', mt: 0.4 }}>
                {isChhattisgarhi
                  ? `समर्थन मूल्य ₹${appConfig.paddyScheme.mspRate} + इनपुट सब्सिडी ₹${appConfig.paddyScheme.bonusRate} सीधे बैंक खाता म`
                  : `समर्थन मूल्य ₹${appConfig.paddyScheme.mspRate} + आदान सहायता ₹${appConfig.paddyScheme.bonusRate} सीधे बैंक खाते में`}
              </Typography>
            </Box>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                stopSpeech();
                onNavigate('schemes');
                window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 1 } }));
              }}
              endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
              sx={{
                borderColor: '#16a34a',
                color: '#15803d',
                fontWeight: 800,
                fontSize: '0.72rem',
                borderRadius: 2,
                py: 0.4,
                alignSelf: 'flex-start',
                textTransform: 'none',
                '&:hover': { bgcolor: '#dcfce7' }
              }}
            >
              {isChhattisgarhi ? 'धान-खाद रुपया हिसाब देखव' : 'योजना व आय कैलकुलेटर देखें'}
            </Button>
          </Box>

          {/* KPI 2: Token Tuhar Hath Online Booking */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: '#eff6ff',
              border: '1.5px solid #93c5fd',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 1
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 800, fontSize: '0.74rem' }}>
                  📱 {isChhattisgarhi ? 'टोकन तुंहर हाथ (ऑनलाइन धान खरीदी)' : 'टोकन तुंहर हाथ (ऑनलाइन उपार्जन)'}
                </Typography>
                <Chip
                  label={isChhattisgarhi ? 'घर बैठे टोकन' : 'घर बैठे टोकन'}
                  size="small"
                  sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 900, fontSize: '0.66rem', height: 20 }}
                />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1e3a8a', fontSize: '1.05rem', lineHeight: 1.2 }}>
                {isChhattisgarhi ? 'समिति टोकन ऑनलाइन कटाव' : 'समिति धान उपार्जन टोकन'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', display: 'block', mt: 0.4 }}>
                {isChhattisgarhi
                  ? 'PACS/लैम्प्स सहकारी समिति म धान बेचे के दिन चुनव अऊ लाइन ले बांचव।'
                  : 'PACS/LAMPS प्राथमिक कृषि साख समिति में धान विक्रय हेतु ऑनलाइन टोकन बुक करें।'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => { stopSpeech(); onOpenTokenGuide(); }}
                sx={{
                  bgcolor: '#1d4ed8',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: 2,
                  py: 0.5,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1e40af' }
                }}
              >
                {isChhattisgarhi ? '🎯 टोकन नियम अऊ गाइड' : '🎯 टोकन पात्रता व गाइड'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                href={appConfig.portals?.tokenTuharHathUrl || appConfig.portals?.tokenUrl || 'http://khadya.cg.nic.in/'}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
                sx={{
                  borderColor: '#93c5fd',
                  color: '#1d4ed8',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: 2,
                  py: 0.5,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#dbeafe', borderColor: '#60a5fa' }
                }}
              >
                {isChhattisgarhi ? 'पोर्टल (kisan.cg.nic.in)' : 'पोर्टल (kisan.cg.nic.in)'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Part 2: IGKV Raipur Agro-Scientist Weekly Bulletin */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: '#f8fafc',
            border: '1.2px solid #e2e8f0'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MenuBookIcon sx={{ color: '#1b5e20', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                🏛️ {advisory.monthTitle}
              </Typography>
            </Box>
            <Chip
              label={advisory.seasonBadge}
              size="small"
              sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.84rem', mb: 0.6 }}>
            {advisory.headline}
          </Typography>

          <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.76rem', lineHeight: 1.5, display: 'block', mb: 1.2 }}>
            {advisory.advisoryText}
          </Typography>

          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: '#fffbeb',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mb: 1.2
            }}
          >
            <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 800, fontSize: '0.72rem' }}>
              {advisory.actionAlert}
            </Typography>
            <Typography variant="caption" sx={{ color: '#78350f', fontSize: '0.68rem' }}>
              📞 {isChhattisgarhi ? 'किसान कॉल सेंटर (खेती सलाह):' : 'किसान कॉल सेंटर:'} <strong>{appConfig.helpline.label}</strong> {isChhattisgarhi ? '(मुफ्त)' : '(टोल-फ्री)'}
            </Typography>
          </Box>

          {/* Quick Action Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => { stopSpeech(); onNavigate('doctor'); }}
              sx={{
                borderColor: '#dc2626',
                color: '#dc2626',
                fontWeight: 800,
                fontSize: '0.72rem',
                borderRadius: 2,
                py: 0.4,
                flex: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: '#fef2f2' }
              }}
            >
              {isChhattisgarhi ? '🔍 फसल रोग अऊ कीरा जांचव' : '🔍 फसल रोग व कीट जांचें'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => { stopSpeech(); onNavigate('mandi'); }}
              sx={{
                borderColor: '#2563eb',
                color: '#2563eb',
                fontWeight: 800,
                fontSize: '0.72rem',
                borderRadius: 2,
                py: 0.4,
                flex: 1,
                textTransform: 'none',
                '&:hover': { bgcolor: '#eff6ff' }
              }}
            >
              {isChhattisgarhi ? '📊 आज के मंडी भाव देखव' : '📊 आज के मंडी भाव देखें'}
            </Button>
          </Box>
        </Paper>

        {/* Reassurance Footer Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.2, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
          <CheckCircleIcon sx={{ fontSize: 13, color: '#16a34a' }} />
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
            {isChhattisgarhi
              ? '🔒 100% सुरक्षित • कोनो कागजात नई चाही • खाद्य विभाग टोल-फ्री: 1800-233-3663'
              : '🔒 100% सुरक्षित • शून्य कागज़ात • खाद्य विभाग टोल-फ्री: 1800-233-3663'}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

