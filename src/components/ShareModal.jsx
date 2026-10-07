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
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GetAppIcon from '@mui/icons-material/GetApp';
import AgricultureIcon from '@mui/icons-material/Agriculture';

import { getShareDetails, shareOnWhatsApp, copyShareText, shareApp } from '../utils/shareUtils';
import { appConfig } from '../config/appConfig';
import { notify } from '../services/notificationService';
import { useLanguage } from '../utils/i18n';

export const ShareModal = ({ open, onClose }) => {
  const { isChhattisgarhi } = useLanguage();
  const { apkUrl, webUrl, solutions } = getShareDetails();

  const cgSolutions = [
    '🧪 सटीक खाद कैलकुलेटर (यूरिया, DAP, पोटाश के सही नाप अउ खरचा बचत)',
    '🩺 AI फसल डॉक्टर (पाना के फोटो ले रोग पहचान अउ तुरते दवाई)',
    `📈 लाइव मंडी भाव अउ धान उपार्जन (${appConfig.stateName} ₹${appConfig.paddyScheme.totalRate}/क्विंटल योजना)`,
    '🚶‍♂️ खेत मेड़ GPS नाप (मेड़ म रेंगत सही एकड़ अउ डिसमिल रकबा नापव)',
    '💧 स्मार्ट ट्यूबवेल मोटर कंट्रोलर (घर बइठे मोबाइल ले बोरवेल चालू/बंद)',
    '🚜 कृषि चौपाल अउ यंत्र रेंटल (ट्रैक्टर, हार्वेस्टर किराया अउ किसान गोठ-बात)',
  ];

  const activeSolutions = isChhattisgarhi ? cgSolutions : solutions;

  const handleCopy = async (text, label) => {
    const success = await copyShareText(text);
    if (success) {
      notify.success(`${label} ${isChhattisgarhi ? 'कॉपी होगे!' : 'कॉपी हो गया!'}`);
    } else {
      notify.error(isChhattisgarhi ? 'कॉपी करे म समस्या आइस।' : 'कॉपी करने में समस्या आई।');
    }
  };

  const handleNativeShare = async () => {
    await shareApp();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(27,94,32,0.25)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#1b5e20',
          color: '#fff',
          py: 1.5,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon sx={{ color: '#ffeb3b', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
              {isChhattisgarhi ? 'किसान साथी ऐप साझा करव' : 'किसान साथी ऐप साझा करें'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem' }}>
              {isChhattisgarhi ? 'फसल ले लेके बिक्री तक सबो किसानी समाधान' : 'फसल से लेकर बिक्री तक सम्पूर्ण कृषि समाधान'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, bgcolor: '#fafbf9' }}>
        {/* Solution Highlights Banner */}
        <Card
          sx={{
            mb: 2,
            bgcolor: '#e8f5e9',
            border: '1.5px solid #a5d6a7',
            borderRadius: 2.5,
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <AgricultureIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.86rem' }}>
                {isChhattisgarhi ? '🌾 ऐप म किसान मन बर उपलब्ध समाधान:' : '🌾 ऐप में किसानों के लिए उपलब्ध समाधान:'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {activeSolutions.map((sol, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    color: '#2e7d32',
                    fontSize: '0.75rem',
                    lineHeight: 1.35,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.5,
                  }}
                >
                  <span>•</span>
                  <span>{sol}</span>
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Labeled Link 1: Android APK */}
        <Card
          sx={{
            mb: 1.5,
            border: '1.5px solid #81c784',
            borderRadius: 2.5,
            boxShadow: '0 2px 8px rgba(46, 125, 50, 0.08)',
          }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <AndroidIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.84rem' }}>
                  {isChhattisgarhi ? '📲 Android App (APK डाउनलोड लिंक)' : '📲 Android App (APK डाउनलोड लिंक)'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                <Chip label={`v${appConfig.appVersion}`} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: '#e8f5e9', color: '#1b5e20' }} />
                <Chip label="1.5 MB" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }} />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '0.72rem' }}>
              {isChhattisgarhi ? 'फ़ोन म सीधा इंस्टॉल करे बर (ऑफ़लाइन सपोर्ट, बिना नेट के भी चालू)' : 'फ़ोन में सीधे इंस्टॉल करने हेतु (ऑफ़लाइन सपोर्ट, इंटरनेट के बिना भी चालू)'}
            </Typography>

            <Box
              sx={{
                p: 1,
                bgcolor: '#f1f8e9',
                borderRadius: 2,
                border: '1px dashed #a5d6a7',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: '#2e7d32' }} />
              <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, fontSize: '0.74rem' }}>
                {isChhattisgarhi ? 'लेबल: आधिकारिक Android APK इंस्टॉलर' : 'लेबल: आधिकारिक Android APK इंस्टॉलर'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleCopy(apkUrl, isChhattisgarhi ? 'APK डाउनलोड लिंक' : 'APK डाउनलोड लिंक')}
                sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0.4, fontWeight: 700, flex: 1 }}
              >
                {isChhattisgarhi ? 'लिंक कॉपी करव' : 'लिंक कॉपी करें'}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<GetAppIcon sx={{ fontSize: 14 }} />}
                href={apkUrl}
                target="_blank"
                download
                sx={{
                  borderRadius: 2,
                  fontSize: '0.72rem',
                  py: 0.4,
                  fontWeight: 700,
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' },
                  flex: 1,
                }}
              >
                APK डाउनलोड
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Labeled Link 2: Web App (PWA) */}
        <Card
          sx={{
            mb: 2,
            border: '1.5px solid #90caf9',
            borderRadius: 2.5,
            boxShadow: '0 2px 8px rgba(21, 101, 192, 0.08)',
          }}
        >
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <LanguageIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565c0', fontSize: '0.84rem' }}>
                  {isChhattisgarhi ? '🌐 ऑनलाइन वेब पोर्टल (Web PWA)' : '🌐 ऑनलाइन वेब पोर्टल (Web PWA)'}
                </Typography>
              </Box>
              <Chip
                label={isChhattisgarhi ? 'बिना डाउनलोड' : 'बिना डाउनलोड'}
                color="info"
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '0.72rem' }}>
              {isChhattisgarhi ? 'बिना ऐप डाउनलोड करे कोनो भी फोन या कंप्यूटर म सीधा चलावव' : 'बिना ऐप डाउनलोड किए किसी भी फोन या कंप्यूटर के ब्राउज़र में सीधे चलाएं'}
            </Typography>

            <Box
              sx={{
                p: 1,
                bgcolor: '#e3f2fd',
                borderRadius: 2,
                border: '1px dashed #90caf9',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.2,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 16, color: '#1565c0' }} />
              <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 700, fontSize: '0.74rem' }}>
                {isChhattisgarhi ? 'लेबल: आधिकारिक किसान साथी वेब पोर्टल' : 'लेबल: आधिकारिक किसान साथी वेब पोर्टल'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleCopy(webUrl, isChhattisgarhi ? 'वेबसाइट लिंक' : 'वेबसाइट लिंक')}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.72rem',
                  py: 0.4,
                  fontWeight: 700,
                  color: '#1565c0',
                  borderColor: '#1565c0',
                  flex: 1,
                }}
              >
                {isChhattisgarhi ? 'लिंक कॉपी करव' : 'लिंक कॉपी करें'}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                href={webUrl}
                target="_blank"
                sx={{
                  borderRadius: 2,
                  fontSize: '0.72rem',
                  py: 0.4,
                  fontWeight: 700,
                  bgcolor: '#1565c0',
                  '&:hover': { bgcolor: '#0d47a1' },
                  flex: 1,
                }}
              >
                {isChhattisgarhi ? 'वेबसाइट खोलव' : 'वेबसाइट खोलें'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons: WhatsApp & Native Share */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<WhatsAppIcon sx={{ fontSize: 24 }} />}
            onClick={shareOnWhatsApp}
            sx={{
              bgcolor: '#25D366',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9rem',
              py: 1.2,
              borderRadius: 2.5,
              boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
              '&:hover': { bgcolor: '#128C7E' },
            }}
          >
            {isChhattisgarhi ? 'व्हाट्सएप (WhatsApp) म शेयर करव' : 'व्हाट्सएप (WhatsApp) पर शेयर करें'}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ContentCopyIcon />}
              onClick={() => handleCopy(null, isChhattisgarhi ? 'सबो समाधान संदेश' : 'सम्पूर्ण समाधान संदेश')}
              sx={{
                flex: 1,
                borderRadius: 2.5,
                py: 0.9,
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: '#1b5e20',
                color: '#1b5e20',
              }}
            >
              {isChhattisgarhi ? 'पूरा विवरण कॉपी करव' : 'पूरा विवरण कॉपी करें'}
            </Button>

            <Button
              variant="contained"
              size="medium"
              startIcon={<ShareIcon />}
              onClick={handleNativeShare}
              sx={{
                flex: 1,
                borderRadius: 2.5,
                py: 0.9,
                fontWeight: 700,
                fontSize: '0.78rem',
                bgcolor: '#1b5e20',
                '&:hover': { bgcolor: '#2e7d32' },
              }}
            >
              {isChhattisgarhi ? 'दूसर ऐप्स म शेयर' : 'अन्य ऐप्स पर शेयर'}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, bgcolor: '#fafbf9', borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem' }}>
          {isChhattisgarhi ? `📞 किसान हेल्पलाइन: ${appConfig.helpline.label} (मुफ़्त)` : `📞 किसान हेल्पलाइन: ${appConfig.helpline.label} (निःशुल्क)`}
        </Typography>
      </DialogActions>
    </Dialog>
  );
};
