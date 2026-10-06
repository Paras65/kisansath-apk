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
  Snackbar,
  Alert,
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

export const ShareModal = ({ open, onClose }) => {
  const [toastMessage, setToastMessage] = useState('');
  const { apkUrl, webUrl, solutions } = getShareDetails();

  const handleCopy = async (text, label) => {
    const success = await copyShareText(text);
    if (success) {
      setToastMessage(`${label} कॉपी हो गया!`);
    } else {
      setToastMessage('कॉपी करने में समस्या आई।');
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
              किसान साथी ऐप साझा करें
            </Typography>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem' }}>
              फसल से लेकर बिक्री तक सम्पूर्ण कृषि समाधान
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
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
                🌾 ऐप में किसानों के लिए उपलब्ध समाधान:
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {solutions.map((sol, index) => (
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
                  📲 Android App (APK डाउनलोड लिंक)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
                <Chip label={`v${appConfig.appVersion}`} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800, bgcolor: '#e8f5e9', color: '#1b5e20' }} />
                <Chip label="1.5 MB" size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700 }} />
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '0.72rem' }}>
              फ़ोन में सीधे इंस्टॉल करने हेतु (ऑफ़लाइन सपोर्ट, इंटरनेट के बिना भी चालू)
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
                लेबल: आधिकारिक Android APK इंस्टॉलर
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleCopy(apkUrl, 'APK डाउनलोड लिंक')}
                sx={{ borderRadius: 2, fontSize: '0.72rem', py: 0.4, fontWeight: 700, flex: 1 }}
              >
                लिंक कॉपी करें
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
                  🌐 ऑनलाइन वेब पोर्टल (Web PWA)
                </Typography>
              </Box>
              <Chip
                label="बिना डाउनलोड"
                color="info"
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, fontSize: '0.72rem' }}>
              बिना ऐप डाउनलोड किए किसी भी फोन या कंप्यूटर के ब्राउज़र में सीधे चलाएं
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
                लेबल: आधिकारिक किसान साथी वेब पोर्टल
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleCopy(webUrl, 'वेबसाइट लिंक')}
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
                लिंक कॉपी करें
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
                वेबसाइट खोलें
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
            व्हाट्सएप (WhatsApp) पर शेयर करें
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="medium"
              startIcon={<ContentCopyIcon />}
              onClick={() => handleCopy(null, 'सम्पूर्ण समाधान संदेश')}
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
              पूरा विवरण कॉपी करें
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
              अन्य ऐप्स पर शेयर
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, bgcolor: '#fafbf9', borderTop: '1px solid #e0e0e0', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: '#777', fontSize: '0.72rem' }}>
          📞 किसान हेल्पलाइन: {appConfig.helpline.label} (निःशुल्क)
        </Typography>
      </DialogActions>

      {/* Copy Notification Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ borderRadius: 3, fontWeight: 700 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
