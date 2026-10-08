import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Tabs,
  Tab,
  TextField,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLanguage } from '../utils/i18n';
import { appConfig } from '../config/appConfig';
import { speakText, stopSpeech } from '../utils/speech';
import { calculatePaddyProcurement, stepAcre } from '../utils/unitConverter';

export const TokenGuideModal = ({
  open,
  onClose,
  initialAcres = 1.0,
  farmerName = ''
}) => {
  const { isChhattisgarhi } = useLanguage();
  const [activeTab, setActiveTab] = useState(0); // 0: Calculator, 1: 4-Step Guide, 2: Rules & Documents
  const [acres, setAcres] = useState(initialAcres > 0 ? initialAcres : 1.0);

  // Sync acres with incoming initialAcres
  useEffect(() => {
    if (initialAcres && initialAcres > 0) {
      setAcres(initialAcres);
    }
  }, [initialAcres, open]);

  // Real-time CG Procurement Calculation from centralized unitConverter
  const proc = calculatePaddyProcurement(acres, appConfig.paddyScheme.maxQuintalsPerAcre || 21);

  // Voice speech synthesizer for calculator result
  const handleSpeakCalculation = () => {
    stopSpeech();
    const text = isChhattisgarhi
      ? `${acres} एकड़ रकबा म कुल ${proc.maxQuintals} क्विंटल धान बेचे के पात्रता हे। एखर बर लगभग ${proc.bardanaBags} बोरा बारदाना लगिही। ₹3,100 समर्थन मूल्य के हिसाब ले कुल ₹${proc.totalPayout.toLocaleString('en-IN')} तुंहर बैंक खाता म आही।`
      : `${acres} एकड़ रकबे में कुल ${proc.maxQuintals} क्विंटल धान विक्रय की पात्रता है। इसके लिए लगभग ${proc.bardanaBags} बोरी बारदाना लगेगा। ₹3,100 प्रति क्विंटल की दर से कुल ₹${proc.totalPayout.toLocaleString('en-IN')} की राशि आपके बैंक खाते में आएगी।`;
    speakText(text);
  };

  const handleSpeakGuide = () => {
    stopSpeech();
    const text = isChhattisgarhi
      ? `टोकन तुंहर हाथ म टोकन कटाय के 4 आसान चरण हे: पहिला, kisan.cg.nic.in म अपन 10 अंक के किसान कोड डालव अऊ OTP ले लॉगिन करव। दूसरा, अपन समिति अऊ बचे धान के कोटा देखव। तीसरा, धान बेचे के दिन अऊ क्विंटल चुनव। चौथा, टोकन सुरक्षित करव अऊ पावती पर्ची ले के तय दिन म समिति पहुंचव।`
      : `टोकन तुंहर हाथ में ऑनलाइन टोकन जनरेट करने के 4 आसान चरण हैं: पहला, kisan.cg.nic.in पोर्टल में अपना 10 अंकों का किसान कोड दर्ज कर OTP से लॉगिन करें। दूसरा, अपनी समिति व शेष धान कोटा जांचें। तीसरा, धान बेचने की तारीख व क्विंटल मात्रा चुनें। चौथा, टोकन सुरक्षित करें और डिजिटल पावती लेकर तय तारीख पर समिति पहुंचें।`;
    speakText(text);
  };

  const tokenPortalUrl =
    appConfig.portals.tokenTuharHathUrl ||
    appConfig.portals.tokenUrl ||
    'https://kisan.cg.nic.in/';
  const foodHelpline = appConfig.contacts.foodDeptHelpline || '1800-233-3663';

  return (
    <Dialog
      open={open}
      onClose={() => { stopSpeech(); onClose(); }}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          overflow: 'hidden',
          m: { xs: 1, sm: 2 }
        }
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#ffeb3b', fontSize: { xs: 24, sm: 28 } }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
              {isChhattisgarhi
                ? '🌾 टोकन तुंहर हाथ: धान उपार्जन अऊ बोरी गाइड'
                : '🌾 टोकन तुंहर हाथ: धान उपार्जन, बोरी व टोकन गाइड'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.72rem', display: 'block' }}>
              🔒 {isChhattisgarhi ? '100% सुरक्छित • शून्य कागजात • छत्तीसगढ़ शासन खाद्य विभाग' : '100% सुरक्षित • शून्य कागज़ात • छत्तीसगढ़ शासन खाद्य विभाग'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={() => { stopSpeech(); onClose(); }}
          sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Tabs Bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => { stopSpeech(); setActiveTab(val); }}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontWeight: 800,
              fontSize: { xs: '0.74rem', sm: '0.84rem' },
              textTransform: 'none',
              py: 0.8
            },
            '& .Mui-selected': {
              color: '#1b5e20'
            },
            '& .MuiTabs-indicator': {
              bgcolor: '#1b5e20',
              height: 3
            }
          }}
        >
          <Tab
            icon={<MonetizationOnIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={isChhattisgarhi ? '1. बोरी अऊ पात्रता' : '1. बोरी व पात्रता कैलकुलेटर'}
          />
          <Tab
            icon={<ReceiptLongIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={isChhattisgarhi ? '2. ऑनलाइन टोकन विधि' : '2. 4-चरण टोकन विधि'}
          />
          <Tab
            icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={isChhattisgarhi ? '3. नियम अऊ कागजात' : '3. नियम व आवश्यक कागज़ात'}
          />
        </Tabs>
      </Box>

      {/* Modal Body Content */}
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: '#fafafa' }}>
        {/* ===================== TAB 0: CALCULATOR ===================== */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Acre Input Selector Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: '#ffffff',
                border: '1.5px solid #c8e6c9'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>
                    {isChhattisgarhi ? 'अपन धान के रकबा (एकड़) चुनव:' : 'अपनी धान भूमि का रकबा (एकड़) चुनें:'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                    {farmerName
                      ? (isChhattisgarhi ? `किसान: ${farmerName}` : `किसान: ${farmerName}`)
                      : (isChhattisgarhi ? 'शासकीय सीमा: 21 क्विंटल प्रति एकड़' : 'शासकीय सीमा: 21 क्विंटल प्रति एकड़')}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={handleSpeakCalculation}
                  sx={{ bgcolor: '#e8f5e9', color: '#1b5e20' }}
                  title="आवाज में सुनें"
                >
                  <VolumeUpIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Quick Acre Chips */}
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1.5 }}>
                {[0.5, 1.0, 2.0, 3.0, 5.0, 10.0].map((val) => (
                  <Chip
                    key={val}
                    label={`${val} ${isChhattisgarhi ? 'एकड़' : 'एकड़'}`}
                    clickable
                    color={acres === val ? 'success' : 'default'}
                    variant={acres === val ? 'filled' : 'outlined'}
                    onClick={() => setAcres(val)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      height: 28,
                      borderColor: acres === val ? '#1b5e20' : '#cbd5e1'
                    }}
                  />
                ))}
              </Box>

              {/* Stepper + Input Field */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => setAcres(stepAcre(acres, -0.5))}
                  disabled={acres <= 0.5}
                  sx={{ bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', p: 0.8 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <TextField
                  type="number"
                  size="small"
                  value={acres}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) setAcres(val);
                    else if (e.target.value === '') setAcres(0);
                  }}
                  inputProps={{ step: '0.1', min: '0.1', max: '100' }}
                  sx={{
                    flex: 1,
                    '& input': { textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', color: '#166534' }
                  }}
                />

                <IconButton
                  onClick={() => setAcres(stepAcre(acres, 0.5))}
                  disabled={acres >= 100}
                  sx={{ bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', p: 0.8 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>

            {/* 4-Card Procurement Metric Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: { xs: 1, sm: 1.5 }
              }}
            >
              {/* Card 1: Total Quintals */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.3,
                  borderRadius: 2.5,
                  bgcolor: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                  🌾 {isChhattisgarhi ? 'धान पात्रता' : 'धान पात्रता'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#14532d', my: 0.3, fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                  {proc.maxQuintals}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.68rem', fontWeight: 700 }}>
                  {isChhattisgarhi ? 'क्विंटल (21 क्विं/एकड़)' : 'क्विंटल (21 क्विं/एकड़)'}
                </Typography>
              </Paper>

              {/* Card 2: Bardana Gunny Bags */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.3,
                  borderRadius: 2.5,
                  bgcolor: '#eff6ff',
                  border: '1.5px solid #93c5fd',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                  🎒 {isChhattisgarhi ? 'आवश्यक बारदाना' : 'आवश्यक बारदाना'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e40af', my: 0.3, fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                  {proc.bardanaBags}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.68rem', fontWeight: 700 }}>
                  {isChhattisgarhi ? 'बोरा (40 kg मानक)' : 'बोरी (40 kg मानक)'}
                </Typography>
              </Paper>

              {/* Card 3: Total Payout */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.3,
                  borderRadius: 2.5,
                  bgcolor: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                  💰 {isChhattisgarhi ? 'कुल बैंक भुगतान' : 'कुल बैंक भुगतान'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#92400e', my: 0.3, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                  ₹{proc.totalPayout.toLocaleString('en-IN')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#78350f', fontSize: '0.68rem', fontWeight: 700 }}>
                  @ ₹3,100 {isChhattisgarhi ? 'प्रति क्विंटल' : 'प्रति क्विंटल'}
                </Typography>
              </Paper>

              {/* Card 4: Token Slots */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.3,
                  borderRadius: 2.5,
                  bgcolor: '#faf5ff',
                  border: '1.5px solid #d8b4fe',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: '#7e22ce', fontWeight: 800, fontSize: '0.72rem', display: 'block' }}>
                  🎫 {isChhattisgarhi ? 'टोकन संख्या' : 'अधिकतम टोकन'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#6b21a8', my: 0.3, fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                  {proc.tokenLimit}
                </Typography>
                <Typography variant="caption" sx={{ color: '#581c87', fontSize: '0.68rem', fontWeight: 700 }}>
                  {isChhattisgarhi ? 'बारी म बेच सकथव' : 'बार में बेच सकते हैं'}
                </Typography>
              </Paper>
            </Box>

            {/* Detailed Payment Split Breakdown */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem', mb: 1 }}>
                📊 {isChhattisgarhi ? 'शासकीय भुगतान विवरण (₹3,100 दर ब्रेकडाउन):' : 'शासकीय भुगतान विवरण (₹3,100 दर ब्रेकडाउन):'}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, fontSize: '0.78rem' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>1. {isChhattisgarhi ? 'न्यूनतम समर्थन मूल्य (MSP ₹2,300/क्विं.):' : 'न्यूनतम समर्थन मूल्य (MSP ₹2,300/क्विं.):'}</span>
                  <strong style={{ color: '#0f172a' }}>₹{proc.mspCommon.toLocaleString('en-IN')}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                  <span>2. {isChhattisgarhi ? 'कृषक उन्नति योजना बोनस (₹800/क्विं.):' : 'कृषक उन्नति योजना बोनस (₹800/क्विं.):'}</span>
                  <strong>+ ₹{proc.bonusCommon.toLocaleString('en-IN')}</strong>
                </Box>
                <Divider sx={{ my: 0.4 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#1b5e20', fontWeight: 900, fontSize: '0.86rem' }}>
                  <span>{isChhattisgarhi ? 'कुल गारंटीड भुगतान (₹3,100/क्विं.):' : 'कुल गारंटीड बैंक भुगतान (₹3,100/क्विं.):'}</span>
                  <span>₹{proc.totalPayout.toLocaleString('en-IN')}</span>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.72rem', pt: 0.4 }}>
                  <span>💡 {isChhattisgarhi ? 'स्वयं के बारदाना प्रतिपूर्ति (₹25/बोरा):' : 'स्वयं के बारदाना प्रतिपूर्ति (₹25/बोरी):'}</span>
                  <span>₹{proc.bardanaReimbursement.toLocaleString('en-IN')}</span>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* ===================== TAB 1: 4-STEP ONLINE GUIDE ===================== */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.9rem' }}>
                📱 {isChhattisgarhi ? 'घर बैठे मोबाइल ले टोकन कटाय के 4 चरण:' : 'घर बैठे मोबाइल से ऑनलाइन टोकन जनरेट करने के 4 आसान चरण:'}
              </Typography>
              <IconButton
                size="small"
                onClick={handleSpeakGuide}
                sx={{ bgcolor: '#e0f2fe', color: '#0284c7' }}
                title="आवाज में सुनें"
              >
                <VolumeUpIcon fontSize="small" />
              </IconButton>
            </Box>

            {[
              {
                step: '1',
                title: isChhattisgarhi ? 'किसान कोड अऊ OTP लॉगिन' : 'किसान कोड व OTP लॉगिन',
                desc: isChhattisgarhi
                  ? 'kisan.cg.nic.in पोर्टल म जाके अपन 10 अंक के किसान कोड दर्ज करव। पंजीयन म दर्ज आधार-लिंक्ड मोबाइल म 4-6 अंक के OTP आही, ओला भर के लॉगिन करव।'
                  : 'kisan.cg.nic.in पोर्टल पर जाकर अपना 10 अंकों का किसान कोड दर्ज करें। पंजीकृत आधार-लिंक्ड मोबाइल पर OTP आएगा, उसे भरकर लॉगिन करें।',
                icon: '🔑',
                bg: '#eff6ff',
                border: '#bfdbfe',
                color: '#1d4ed8'
              },
              {
                step: '2',
                title: isChhattisgarhi ? 'समिति अऊ शेष धान कोटा जांचव' : 'समिति व शेष धान कोटा जांचें',
                desc: isChhattisgarhi
                  ? 'लॉगिन होत ही तुंहर नाम, संबद्ध प्राथमिक सहकारी समिति (PACS/लैम्प्स), कुल पंजीकृत रकबा अऊ शेष बचे विक्रय योग्य धान (क्विंटल) दिखही।'
                  : 'लॉगिन होते ही स्क्रीन पर आपका नाम, संबद्ध प्राथमिक सहकारी समिति (PACS/LAMPS), कुल पंजीकृत रकबा और शेष विक्रय योग्य धान (क्विंटल) दिखेगा।',
                icon: '📋',
                bg: '#f0fdf4',
                border: '#bbf7d0',
                color: '#166534'
              },
              {
                step: '3',
                title: isChhattisgarhi ? 'बेचे के दिन अऊ धान के मात्रा चुनव' : 'धान बेचने की तारीख व मात्रा चुनें',
                desc: isChhattisgarhi
                  ? 'कैलेंडर म हरी तारीख दिखही। अपन सुविधानुसार दिन चुनव अऊ ओ दिन कतेक क्विंटल धान ले जाना हे, वो मात्रा भरव (मोटा या पतला धान)।'
                  : 'कैलेंडर में उपलब्ध हरी तारीखों में से अपनी सुविधानुसार दिन चुनें और उस दिन ले जाने वाले धान की मात्रा (क्विंटल) भरें (मोटा या पतला धान)।',
                icon: '📅',
                bg: '#fffbeb',
                border: '#fde68a',
                color: '#b45309'
              },
              {
                step: '4',
                title: isChhattisgarhi ? 'टोकन सुरक्षित करव अऊ पावती स्क्रीनशॉट लेव' : 'टोकन सुरक्षित करें व पावती प्रिंट/SMS लें',
                desc: isChhattisgarhi
                  ? '"टोकन सुरक्षित करव" म दबाते ही टोकन नंबर (TK-XXXX) जारी हो जाही। मोबाइल म SMS आही अऊ डिजिटल रसीद दिखही। स्क्रीनशॉट ले के रख लेव।'
                  : '"टोकन सुरक्षित करें" पर दबाते ही डिजिटल टोकन नंबर (TK-XXXX) जारी होगा। मोबाइल पर SMS आएगा व पावती दिखेगी। स्क्रीनशॉट लेकर रख लें।',
                icon: '📄',
                bg: '#faf5ff',
                border: '#e9d5ff',
                color: '#7e22ce'
              }
            ].map((st) => (
              <Paper
                key={st.step}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: st.bg,
                  border: `1.5px solid ${st.border}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.2
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: st.color,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  {st.step}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: st.color, fontSize: '0.86rem', mb: 0.3 }}>
                    {st.icon} {st.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.78rem', lineHeight: 1.45 }}>
                    {st.desc}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* ===================== TAB 2: RULES & DOCUMENTS ===================== */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Rules Paper */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#166534', fontSize: '0.88rem', mb: 1 }}>
                ⏰ {isChhattisgarhi ? 'टोकन कटाय के नियम अऊ समय:' : 'टोकन जनरेट करने के प्रमुख नियम व समय:'}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, fontSize: '0.78rem', color: '#334155' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                  <span>⏱️</span>
                  <span><strong>{isChhattisgarhi ? 'टोकन समय:' : 'टोकन समय:'}</strong> {isChhattisgarhi ? 'उपार्जन सत्र म रोज बिहनिया 9:30 ले संझा 5:00 बजे तक ऑनलाइन टोकन कटथे।' : 'उपार्जन सत्र में प्रतिदिन सुबह 9:30 बजे से शाम 5:00 बजे तक ऑनलाइन टोकन कटते हैं।'}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                  <span>🎯</span>
                  <span><strong>{isChhattisgarhi ? 'अधिकतम सीमा:' : 'अधिकतम सीमा:'}</strong> {isChhattisgarhi ? '21 क्विंटल प्रति एकड़ (रकबा × 21 = कुल पात्रता)।' : '21 क्विंटल प्रति एकड़ (रकबा × 21 = कुल पात्रता)।'}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                  <span>📅</span>
                  <span><strong>{isChhattisgarhi ? 'टोकन तारीख बाध्यता:' : 'टोकन तारीख बाध्यता:'}</strong> {isChhattisgarhi ? 'टोकन म दर्ज वोही तारीख म धान लेके समिति पहुंचना जरूरी हे।' : 'टोकन में दर्ज निर्धारित तारीख को ही धान लेकर समिति पहुंचना अनिवार्य है।'}</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                  <span>🌾</span>
                  <span><strong>{isChhattisgarhi ? 'नमी मानक:' : 'नमी मानक:'}</strong> {isChhattisgarhi ? 'धान म नमी 17% ले जादा नइ होना चाहि। धूप म सुखा के ले जाव।' : 'धान में नमी की मात्रा 17% से अधिक नहीं होनी चाहिए। अच्छी तरह सुखाकर ले जाएं।'}</span>
                </Box>
              </Box>
            </Paper>

            {/* Required Documents Paper */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#f0fdf4',
                border: '1.5px solid #86efac'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#166534', fontSize: '0.88rem', mb: 1 }}>
                📋 {isChhattisgarhi ? 'समिति म तुलाई बेरा साथ म ले जाए बर कागजात:' : 'समिति में धान तुलाई हेतु साथ ले जाने वाले दस्तावेज़:'}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                {[
                  { icon: '📱', title: isChhattisgarhi ? 'टोकन पर्ची या मोबाइल SMS' : 'टोकन पर्ची या मोबाइल SMS' },
                  { icon: '🆔', title: isChhattisgarhi ? 'किसान कोड / पंजीयन पर्ची' : 'किसान कोड / धान पंजीयन पर्ची' },
                  { icon: '🪪', title: isChhattisgarhi ? 'आधार कार्ड (पहचान पत्र)' : 'आधार कार्ड (पहचान पत्र)' },
                  { icon: '🏦', title: isChhattisgarhi ? 'बैंक पासबुक के फोटोकॉपी' : 'बैंक पासबुक की छायाप्रति' }
                ].map((doc, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1,
                      bgcolor: '#ffffff',
                      borderRadius: 2,
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8
                    }}
                  >
                    <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{doc.icon}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#14532d', fontSize: '0.76rem' }}>
                      {doc.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Offline Fallback Note */}
            <Alert severity="info" sx={{ borderRadius: 2.5, fontSize: '0.76rem', '& .MuiAlert-message': { color: '#1e3a8a' } }}>
              {isChhattisgarhi
                ? '💡 यदि मोबाइल ले ऑनलाइन टोकन नइ काट पावत हव, त अपन ग्राम पंचायत के सहकारी समिति (PACS/लैम्प्स) जाके कंप्यूटर ऑपरेटर ले ऑफ़लाइन टोकन कटा सकथव।'
                : '💡 यदि आप मोबाइल से ऑनलाइन टोकन नहीं जनरेट कर पा रहे हैं, तो सीधे अपनी प्राथमिक सहकारी समिति (PACS/LAMPS) केंद्र जाकर ऑपरेटर से ऑफ़लाइन टोकन कटवा सकते हैं।'}
            </Alert>
          </Box>
        )}
      </DialogContent>

      {/* Action Footer */}
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Button
          size="small"
          variant="outlined"
          href={`tel:${foodHelpline.replace(/[^0-9]/g, '')}`}
          startIcon={<PhoneIcon sx={{ fontSize: 15 }} />}
          sx={{
            color: '#b45309',
            borderColor: '#fde68a',
            bgcolor: '#fffbeb',
            fontWeight: 800,
            fontSize: '0.74rem',
            textTransform: 'none',
            '&:hover': { bgcolor: '#fef3c7', borderColor: '#f59e0b' }
          }}
        >
          {isChhattisgarhi ? `📞 हेल्पलाइन ${foodHelpline}` : `📞 खाद्य हेल्पलाइन ${foodHelpline}`}
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            onClick={() => { stopSpeech(); onClose(); }}
            sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.78rem' }}
          >
            {isChhattisgarhi ? 'बंद करव' : 'बंद करें'}
          </Button>

          <Button
            size="small"
            variant="contained"
            href={tokenPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: '#1d4ed8',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.78rem',
              borderRadius: 2,
              px: 1.8,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(29, 78, 216, 0.25)',
              '&:hover': { bgcolor: '#1e40af' }
            }}
          >
            {isChhattisgarhi ? '📱 टोकन पोर्टल खोलव (kisan.cg.nic.in) ➔' : '📱 टोकन पोर्टल खोलें (kisan.cg.nic.in) ➔'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
