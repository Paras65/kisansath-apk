import React, { useState } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import SearchIcon from '@mui/icons-material/Search';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import EmailIcon from '@mui/icons-material/Email';

import { useLanguage } from '../utils/i18n';
import { appConfig } from '../config/appConfig';
import { speakText, stopSpeech } from '../utils/speech';
import { notify } from '../services/notificationService';

export const FAQ_ITEMS = [
  {
    id: 'call-center-vs-app',
    category: 'help',
    qHi: 'क्या टोल-फ्री 1800-180-1551 पर ऐप की तकनीकी समस्या बता सकते हैं?',
    qCg: 'का टोल-फ्री 1800-180-1551 म ऐप के खराबी बता सकथन?',
    aHi: 'नहीं! 1800-180-1551 भारत सरकार व कृषि विभाग का सरकारी किसान कॉल सेंटर है, जो केवल फसल, खाद, कीट व मौसम जैसी खेती की सलाह देता है। किसान साथी ऐप की तकनीकी समस्या या सुझाव हेतु केवल support@init65.co.in पर संपर्क करें।',
    aCg: 'नोहय! 1800-180-1551 कृषि विभाग के सरकारी कॉल सेंटर हे, वो केवल खेती-किसानी अउ फसल के सलाह देथे। ऐप म कोनो तकनीकी खराबी बर हमर सपोर्ट ईमेल support@init65.co.in म लिखव।',
    badge: 'महत्वपूर्ण • कृषि कॉल सेंटर'
  },
  {
    id: 'app-support',
    category: 'help',
    qHi: 'ऐप में लॉगिन या अन्य कोई समस्या आने पर कहाँ संपर्क करें?',
    qCg: 'ऐप म लॉगिन या कोनो तकनीकी दिक्कत आए म कहां संपर्क करबो?',
    aHi: `किसान साथी ऐप में किसी भी तकनीकी खराबी, लॉगिन समस्या या सुझाव हेतु सीधे हमारी आधिकारिक ईमेल ${appConfig.supportEmail || 'support@init65.co.in'} पर लिखें। हमारी टीम 24 घंटे में सहायता करेगी।`,
    aCg: `ऐप म कोनो भी तकनीकी खराबी या सुझाव बर हमर ईमेल ${appConfig.supportEmail || 'support@init65.co.in'} म लिखव संगी। हमर टीम 24 घंटा म समाधान करही।`,
    badge: 'ऐप तकनीकी सहायता'
  },
  {
    id: 'zero-paperwork',
    category: 'privacy',
    qHi: 'क्या इस ऐप में खसरा नंबर, बी-1 या जमीन के दस्तावेज डालने होते हैं?',
    qCg: 'का ऐप म खसरा नंबर या जमीन के कागजात देना पड़ही?',
    aHi: 'बिल्कुल नहीं! किसान साथी 100% कागजात-मुक्त और सुरक्षित ऐप है। इसमें कोई भी खसरा नंबर, ऋण पुस्तिका या जमीन के सरकारी दस्तावेज नहीं मांगे जाते। आप बिना किसी डर के सीधे एकड़ चुनकर खाद व फसल का हिसाब लगा सकते हैं।',
    aCg: 'बिलुकुल नोहय! किसान साथी 100% सुरक्षित अउ कागजात-मुक्त हे। कोनो खसरा नंबर या जमीन के कागजात नई लगे। बिना कोनो डर के सीधा एकड़ चुनके उपयोग करव।',
    badge: '100% कागजात-मुक्त'
  },
  {
    id: 'offline-mode',
    category: 'offline',
    qHi: 'क्या खेत में बिना इंटरनेट (नेटवर्क न होने पर) भी ऐप काम करता है?',
    qCg: 'का खेत म बिना इंटरनेट के ऐप चलही?',
    aHi: 'हाँ, 100%! किसान साथी ऑफ़लाइन-फर्स्ट तकनीक पर बना है। खाद कैलकुलेटर, खेत सीमा GPS मापक, मेरी फसल डायरी और पहले लोड किया गया मौसम डेटा बिना इंटरनेट भी पूरी तरह सुचारू रूप से काम करता है।',
    aCg: 'हव संगी, 100%! खाद कैलकुलेटर, खेत मेड़ GPS नाप, डायरी अउ मौसम बिना इंटरनेट के घलो पूरा काम करथे।',
    badge: '100% ऑफ़लाइन सुलभ'
  },
  {
    id: 'kaka-voice',
    category: 'kaka',
    qHi: 'बहिरा काका से बोलकर कैसे पूछें? क्या हाथ गंदे होने पर भी बात कर सकते हैं?',
    qCg: 'बहिरा काका ले बोलके कइसे पूछबो? का हाथ माटी म सने रहे म घलो बात कर सकथन?',
    aHi: 'स्क्रीन पर दिख रहे बहिरा काका के गोल बटन पर टैप करके बोलें। खेत में हाथ मिट्टी या पानी से सने होने पर फोन को 2 बार हल्का हिलाएं (Shake-to-Talk); काका तुरंत कान लगाकर सुनने लगेंगे।',
    aCg: 'स्क्रीन म काका के गोल बटन दबाके बोलव। अगर खेत म हाथ माटी म सने हे, त मोबाइल ला बस 2 बार हिलाव (Double Shake); काका कान लगाके सुनही!',
    badge: 'Shake-to-Talk खेत मोड'
  },
  {
    id: 'fertilizer-calc',
    category: 'farming',
    qHi: 'खाद की सही मात्रा और बोरियों का हिसाब कैसे मिलता है?',
    qCg: 'खाद के सही नाप अउ बोरी के हिसाब कइसे मिलही?',
    aHi: 'खाद कैलकुलेटर में अपनी फसल और एकड़ दर्ज करें। ऐप इंदिरा गांधी कृषि विश्वविद्यालय (IGKV Raipur) के वैज्ञानिक फॉर्मूले के अनुसार यूरिया, DAP और पोटाश की सटीक बोरियों की संख्या तुरंत निकाल देता है।',
    aCg: 'खाद कैलकुलेटर म फसल अउ एकड़ चुनव। IGKV रायपुर के वैज्ञानिक नाप ले यूरिया, DAP अउ पोटाश के बोरी तुरते स्क्रीन म आ जही।',
    badge: 'IGKV रायपुर सिफारिश'
  },
  {
    id: 'paddy-mandi',
    category: 'farming',
    qHi: 'छत्तीसगढ़ में ₹3,100 समर्थन मूल्य पर धान बेचने के मुख्य नियम क्या हैं?',
    qCg: 'छत्तीसगढ़ म ₹3,100 समर्थन मूल्य म धान कइसे बिकही?',
    aHi: 'छत्तीसगढ़ में प्रति एकड़ 21 क्विंटल की सीमा से ₹3,100 प्रति क्विंटल (MSP + बोनस) पर धान खरीदा जाता है। टोकन तुंहर हाथ से 7 दिन पूर्व स्लॉट बुक करें और धान को 17% नमी मानक पर सुखाकर लाएं।',
    aCg: 'प्रति एकड़ 21 क्विंटल के हिसाब ले ₹3,100 म धान खरीदी होथे। टोकन तुंहर हाथ ले 7 दिन पहिले टोकन कटाव अउ धान ला 17% नमी तक सुखा के ले जावव।',
    badge: '₹3,100 धान उपार्जन'
  },
  {
    id: 'crop-doctor',
    category: 'farming',
    qHi: 'फसल में बीमारी या कीड़ा लगने पर सही दवा कैसे पता करें?',
    qCg: 'फसल म कोनो बीमारी या कीरा लग गे त का करबो?',
    aHi: 'फसल डॉक्टर टैब में जाएं और बीमार पौधे या पत्ते की फोटो लें। AI तुरंत रोग (जैसे माहू, शीथ ब्लाइट, तना छेदक) पहचानकर बाजार में मिलने वाली दवा का नाम और छिड़काव मात्रा बता देता है।',
    aCg: 'फसल डॉक्टर म जाके पाना के फोटो खींचव। AI तुरते रोग पहचान के सही दवाई के नाम अउ छिड़काव के नाप बता दिही।',
    badge: 'AI फसल डॉक्टर'
  },
  {
    id: 'gps-tracker',
    category: 'farming',
    qHi: 'खेत का सही रकबा (एकड़ व डिसमिल) मेड़ पर चलकर कैसे नापें?',
    qCg: 'अपन खेत के रकबा कइसे नापबो?',
    aHi: 'खेत सीमा GPS मापक खोलें और खेत की मेड़ पर चारों ओर चलें। सैटेलाइट GPS द्वारा आपके खेत का वास्तविक क्षेत्रफल (एकड़ व डिसमिल) और मेड़ की कुल परिधि स्वतः निकल जाती है।',
    aCg: 'खेत सीमा GPS मापक खोलव अउ खेत के मेड़-मेड़ म रेंगव। मोबाइल के GPS ले सही एकड़ अउ डिसमिल तुरंत निकल जही।',
    badge: 'मेड़ नाप GPS'
  },
  {
    id: 'app-install',
    category: 'help',
    qHi: 'इस ऐप को हमेशा के लिए मोबाइल में कैसे इंस्टॉल करें?',
    qCg: 'ए ऐप ला हमेशा बर मोबाइल म कइसे रखबो?',
    aHi: 'स्क्रीन के नीचे दिए गए "Android APK डाउनलोड" बटन से सीधे APK फाइल डाउनलोड करके इंस्टॉल करें, या Chrome ब्राउज़र में 3 बिंदु दबाकर "Add to Home Screen" चुनें।',
    aCg: 'नीचे "Android APK डाउनलोड" ले ऐप डाउनलोड करव, या क्रोम ब्राउज़र म 3 बिंदु दबाके "Add to Home screen" चुनव।',
    badge: 'PWA व Android APK'
  }
];

export const FaqModal = ({ open, onClose }) => {
  const { isChhattisgarhi } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState('call-center-vs-app');
  const [speakingId, setSpeakingId] = useState(null);

  const categories = [
    { id: 'all', labelHi: 'सब सवाल', labelCg: 'सबो सवाल' },
    { id: 'help', labelHi: '📞 सहायता व कॉल सेंटर', labelCg: '📞 सहायता अऊ कॉल सेंटर' },
    { id: 'privacy', labelHi: '🔒 शून्य-कागजात', labelCg: '🔒 कोनो कागजात नई' },
    { id: 'offline', labelHi: '🌐 ऑफ़लाइन उपयोग', labelCg: '🌐 ऑफ़लाइन' },
    { id: 'kaka', labelHi: '👴🏻 बहिरा काका वॉयस', labelCg: '👴🏻 बहिरा काका' },
    { id: 'farming', labelHi: '🌾 खाद, फसल व मंडी', labelCg: '🌾 खाद, फसल अऊ मंडी' },
  ];

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const hayHi = `${item.qHi} ${item.aHi}`.toLowerCase();
    const hayCg = `${item.qCg} ${item.aCg}`.toLowerCase();
    return hayHi.includes(q) || hayCg.includes(q);
  });

  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpandedId(isExpanded ? id : false);
  };

  const handleSpeakFaq = (e, item) => {
    e.stopPropagation();
    if (speakingId === item.id) {
      stopSpeech();
      setSpeakingId(null);
      return;
    }

    stopSpeech();
    setSpeakingId(item.id);
    const textToSpeak = isChhattisgarhi
      ? `सवाल: ${item.qCg}। काका के जवाब: ${item.aCg}`
      : `सवाल: ${item.qHi}। काका का उत्तर: ${item.aHi}`;

    speakText(textToSpeak, () => {
      setSpeakingId(null);
    });
    notify.info(isChhattisgarhi ? '👴🏻 काका समझावत हें...' : '👴🏻 काका उत्तर बोल रहे हैं...');
  };

  const handleClose = () => {
    stopSpeech();
    setSpeakingId(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(27,94,32,0.25)',
          maxHeight: '92vh',
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#1b5e20',
          color: '#fff',
          py: 1.5,
          px: 2.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <HelpOutlineIcon sx={{ color: '#ffeb3b', fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff', fontSize: '1.05rem' }}>
              {isChhattisgarhi ? 'जरूरी सवाल-जवाब (काका ले पूछव)' : 'अक्सर पूछे जाने वाले सवाल (FAQs)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.74rem' }}>
              {isChhattisgarhi ? 'किसान संगी मन के सबो शंका के समाधान • बोलके सुनव' : 'किसानों की हर शंका का समाधान • बोलकर सुनें'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#fff' }} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: '#f8fafc' }}>
        {/* Search Bar */}
        <Box sx={{ mb: 1.8 }}>
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isChhattisgarhi ? 'अपन सवाल खोजव... (उदा. कॉल सेंटर, खसरा, खाद, ऑफ़लाइन)' : 'अपना सवाल खोजें... (उदा. कॉल सेंटर, खसरा, खाद, ऑफ़लाइन)'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#1b5e20', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: '#fff',
                borderRadius: 2.5,
                fontSize: '0.86rem',
                '& fieldset': { borderColor: '#cbd5e1' },
                '&:hover fieldset': { borderColor: '#1b5e20' }
              }
            }}
          />
        </Box>

        {/* Category Filter Chips */}
        <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1.2, mb: 1.5 }}>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={isChhattisgarhi ? cat.labelCg : cat.labelHi}
              size="small"
              clickable
              onClick={() => setSelectedCategory(cat.id)}
              sx={{
                fontWeight: 700,
                fontSize: '0.74rem',
                borderRadius: 2,
                bgcolor: selectedCategory === cat.id ? '#1b5e20' : '#ffffff',
                color: selectedCategory === cat.id ? '#ffffff' : '#334155',
                border: '1px solid',
                borderColor: selectedCategory === cat.id ? '#1b5e20' : '#e2e8f0',
                '&:hover': { bgcolor: selectedCategory === cat.id ? '#144a19' : '#f1f5f9' }
              }}
            />
          ))}
        </Box>

        {/* Important Callout: Agri Call Center vs App Support */}
        <Box
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 2.5,
            bgcolor: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.2,
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneInTalkIcon sx={{ color: '#16a34a', fontSize: 22 }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.78rem', display: 'block' }}>
                {isChhattisgarhi ? 'सरकारी किसान कॉल सेंटर: 1800-180-1551 (केवल खेती-किसानी सलाह)' : 'सरकारी किसान कॉल सेंटर: 1800-180-1551 (केवल फसल व खेती सलाह)'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                {isChhattisgarhi ? 'ये कृषि विभाग के नंबर हे। ऐप के खराबी बर एमा फोन झन लगावहू।' : 'यह कृषि विभाग का नंबर है। ऐप समस्या हेतु इस पर फोन न करें।'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ color: '#0284c7', fontSize: 22 }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 800, fontSize: '0.78rem', display: 'block' }}>
                {isChhattisgarhi ? `ऐप सहायता ईमेल: ${appConfig.supportEmail || 'support@init65.co.in'}` : `ऐप तकनीकी सहायता: ${appConfig.supportEmail || 'support@init65.co.in'}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                {isChhattisgarhi ? 'किसान साथी ऐप लॉगिन, खराबी या सुझाव बर।' : 'किसान साथी ऐप लॉगिन, बग व सुझाव हेतु।'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* FAQ Accordions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filteredItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fff', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {isChhattisgarhi ? 'कोनो सवाल नई मिलिस। दूसरा शब्द खोजव।' : 'कोई सवाल नहीं मिला। दूसरा शब्द खोजें।'}
              </Typography>
            </Box>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              const isCurrentlySpeaking = speakingId === item.id;

              return (
                <Accordion
                  key={item.id}
                  expanded={isExpanded}
                  onChange={handleAccordionChange(item.id)}
                  sx={{
                    borderRadius: '12px !important',
                    border: '1px solid #e2e8f0',
                    boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    '&:before': { display: 'none' },
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#1b5e20' }} />}
                    sx={{
                      bgcolor: isExpanded ? '#f0fdf4' : '#ffffff',
                      px: 2,
                      py: 0.5,
                      '&:hover': { bgcolor: '#f8fafc' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1, gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: isExpanded ? '#1b5e20' : '#1e293b',
                            fontSize: { xs: '0.84rem', sm: '0.9rem' },
                            lineHeight: 1.3
                          }}
                        >
                          {isChhattisgarhi ? item.qCg : item.qHi}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexShrink: 0 }}>
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              bgcolor: '#e2e8f0',
                              color: '#334155',
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              height: 20,
                              display: { xs: 'none', sm: 'inline-flex' }
                            }}
                          />
                        )}
                        <Tooltip title={isCurrentlySpeaking ? (isChhattisgarhi ? "काका ला रोकव" : "काका को रोकें") : (isChhattisgarhi ? "काका ले सुनव" : "काका से सुनें")}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleSpeakFaq(e, item)}
                            sx={{
                              bgcolor: isCurrentlySpeaking ? '#ef4444' : '#1b5e20',
                              color: '#fff',
                              width: 30,
                              height: 30,
                              '&:hover': { bgcolor: isCurrentlySpeaking ? '#dc2626' : '#15803d' }
                            }}
                            aria-label="बोलकर सुनो"
                          >
                            <VolumeUpIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, py: 1.8, bgcolor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#334155',
                        fontSize: { xs: '0.82rem', sm: '0.86rem' },
                        lineHeight: 1.6,
                        fontWeight: 500
                      }}
                    >
                      {isChhattisgarhi ? item.aCg : item.aHi}
                    </Typography>
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
                        onClick={(e) => handleSpeakFaq(e, item)}
                        sx={{
                          color: '#1b5e20',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'none'
                        }}
                      >
                        {isCurrentlySpeaking ? (isChhattisgarhi ? '🛑 रोकव' : '🛑 रोकें') : (isChhattisgarhi ? '👴🏻 काका ले सुनव' : '👴🏻 काका से सुनें')}
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.8, bgcolor: '#f1f5f9', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
          {isChhattisgarhi ? '🔒 100% सुरक्षित • कोनो कागजात नई चाही • किसान साथी' : '🔒 100% सुरक्षित • शून्य कागज़ात • किसान कल्याण मंच'}
        </Typography>
        <Button
          onClick={handleClose}
          variant="contained"
          size="small"
          sx={{
            bgcolor: '#1b5e20',
            fontWeight: 800,
            borderRadius: 2,
            px: 2.5,
            '&:hover': { bgcolor: '#144a19' }
          }}
        >
          {isChhattisgarhi ? 'समझ गेन (बंद करव)' : 'समझ गया (बंद करें)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
