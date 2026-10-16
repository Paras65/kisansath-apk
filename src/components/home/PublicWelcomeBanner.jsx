import React from 'react';
import { Card, Box, Typography, Chip, Button } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonIcon from '@mui/icons-material/Person';
import CampaignIcon from '@mui/icons-material/Campaign';
import { stopSpeech } from '../../utils/speech';

export const PublicWelcomeBanner = ({
  isChhattisgarhi = false,
  exactLocation = '',
  selectedDistrict = 'रायपुर',
  isGpsLocation = false,
  onOpenQuickLogin = () => {},
  onNavigate = () => {}
}) => {
  return (
    <Card
      sx={{
        mb: 2.5,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 4,
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(27, 94, 32, 0.16)',
        position: 'relative',
        overflow: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.2)'
      }}
    >
      {/* Top Amber Accent Strip (Distinguishes Guest state immediately) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #f59e0b, #eab308, #10b981)'
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.8, pt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.6 }}>
          {/* Guest Avatar Circle */}
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255,235,59,0.5)',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <PersonIcon sx={{ fontSize: 32, color: '#ffeb3b' }} />
          </Box>

          <Box>
            {/* Unambiguous Guest Mode Status Chip */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 0.6 }}>
              <Chip
                label={isChhattisgarhi ? '👤 अतिथि किसान मोड (Guest Mode) • 🔓 लॉगिन नहीं है' : '👤 अतिथि किसान मोड (Guest Mode) • 🔓 लॉगिन नहीं है'}
                size="small"
                sx={{
                  bgcolor: '#fffbeb',
                  color: '#92400e',
                  border: '1.5px solid #fde68a',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  height: 24,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                }}
              />
              <Chip
                label={isChhattisgarhi ? '🏛️ 100% खुला मंच' : '🏛️ 100% खुला पोर्टल'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.22)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.66rem',
                  height: 22
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: { xs: '1.15rem', sm: '1.35rem' }, lineHeight: 1.25 }}>
              {isChhattisgarhi ? 'जय जोहार, अतिथि किसान संगवारी!' : 'नमस्ते, अतिथि किसान साथी!'}
            </Typography>

            <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.78rem', display: 'block', mt: 0.4, lineHeight: 1.4 }}>
              📍 {exactLocation || selectedDistrict}{isGpsLocation ? ' (लाइव GPS)' : ''} • {isChhattisgarhi
                ? 'मौसम, मंडी भाव अऊ फसल सलाह सबो बर खुला हे। अपन खेत अऊ उपकरण डेटा सहेजे बर लॉगिन करव।'
                : 'मौसम, मंडी भाव व फसल सलाह सभी के लिए खुली है। अपना खेत, उपकरण व फसल डायरी सहेजने के लिए लॉगिन करें।'}
            </Typography>
          </Box>
        </Box>

        {/* High-Contrast 1-Tap Login Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            size="medium"
            startIcon={<LockOpenIcon sx={{ fontSize: 20 }} />}
            onClick={() => { stopSpeech(); onOpenQuickLogin(); }}
            sx={{
              bgcolor: '#ffeb3b',
              color: '#1b5e20',
              fontWeight: 900,
              fontSize: '0.86rem',
              borderRadius: 3,
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#ffffff',
                transform: 'scale(1.02)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
              }
            }}
          >
            {isChhattisgarhi ? '🔑 1-क्लिक किसान लॉगिन / खाता खोलव' : '🔑 1-क्लिक किसान लॉगिन / खाता खोलें'}
          </Button>
          <Typography variant="caption" sx={{ color: '#fef08a', fontSize: '0.68rem', textAlign: 'center', fontWeight: 700 }}>
            ⚡ केवल 10 सेकंड • 100% निशुल्क व सुरक्षित
          </Typography>
        </Box>
      </Box>

      {/* Ticker Notice Inside Hero */}
      <Box
        sx={{
          mt: 2,
          pt: 1.2,
          borderTop: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.76rem',
          color: '#f1f8e9',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <CampaignIcon sx={{ fontSize: 18, color: '#ffeb3b' }} />
          <span>
            <strong>{isChhattisgarhi ? 'कृषक उन्नति योजना:' : 'कृषक उन्नति योजना:'}</strong>{' '}
            {isChhattisgarhi
              ? 'धान ₹3,100 समर्थन मूल्य खरीदी | 21 क्विंटल/एकड़ सीमा • टोकन तुंहर हाथ'
              : 'धान ₹3,100 समर्थन मूल्य उपार्जन | 21 क्विंटल/एकड़ सीमा • टोकन तुंहर हाथ'}
          </span>
        </Box>
        <Chip
          label={isChhattisgarhi ? 'योजना देखव →' : 'योजना देखें →'}
          size="small"
          onClick={() => {
            onNavigate('schemes');
            window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 1 } }));
          }}
          sx={{
            bgcolor: 'rgba(255,255,255,0.25)',
            color: '#fff',
            fontWeight: 800,
            height: 22,
            fontSize: '0.68rem',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' }
          }}
        />
      </Box>
    </Card>
  );
};
