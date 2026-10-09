import React from 'react';
import { Card, Box, Typography, Chip, Button } from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LockOpenIcon from '@mui/icons-material/LockOpen';
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
        mb: 2,
        p: { xs: 2, sm: 2.5 },
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
              width: 50,
              height: 50,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              flexShrink: 0
            }}
          >
            <AgricultureIcon sx={{ fontSize: 30, color: '#ffeb3b' }} />
          </Box>
          <Box>
            <Chip
              label={isChhattisgarhi ? '🏛️ सार्वजनिक किसान सुविधा मंच (100% खुला)' : '🏛️ सार्वजनिक किसान सुविधा पोर्टल (100% खुला)'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#ffeb3b',
                fontWeight: 800,
                fontSize: '0.68rem',
                height: 22,
                mb: 0.5
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.3rem' }, lineHeight: 1.2 }}>
              {isChhattisgarhi ? 'जय जोहार, किसान संगवारी' : 'नमस्ते, किसान साथी'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.78rem', display: 'block', mt: 0.3 }}>
              📍 {exactLocation || selectedDistrict}{isGpsLocation ? (isChhattisgarhi ? ' (लाइव GPS)' : ' (लाइव GPS)') : ''} • {isChhattisgarhi ? 'मौसम, मंडी भाव अऊ खाद हिसाब सबो बर मुफ्त अऊ खुला हे' : 'मौसम, मंडी भाव व खाद गणना सभी के लिए निशुल्क व खुली'}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="medium"
          startIcon={<LockOpenIcon sx={{ fontSize: 18 }} />}
          onClick={() => { stopSpeech(); onOpenQuickLogin(); }}
          sx={{
            bgcolor: '#ffeb3b',
            color: '#1b5e20',
            fontWeight: 900,
            fontSize: '0.82rem',
            borderRadius: 3,
            px: 2.2,
            py: 0.8,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            '&:hover': { bgcolor: '#ffffff' }
          }}
        >
          {isChhattisgarhi ? '🔑 अपन खाता खोलव / लॉगिन (10 सेकंड)' : '🔑 किसान खाता खोलें / लॉगिन (10 सेकंड)'}
        </Button>
      </Box>

      {/* Ticker Notice Inside Hero */}
      <Box
        sx={{
          mt: 1.8,
          pt: 1.2,
          borderTop: '1px solid rgba(255,255,255,0.18)',
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
          <span><strong>{isChhattisgarhi ? 'कृषक उन्नति योजना:' : 'कृषक उन्नति योजना:'}</strong> {isChhattisgarhi ? 'धान ₹3,100 समर्थन मूल्य खरीदी | टोकन तुंहर हाथ' : 'धान ₹3,100 समर्थन मूल्य उपार्जन | टोकन तुंहर हाथ'}</span>
        </Box>
        <Chip
          label={isChhattisgarhi ? 'योजना देखव' : 'योजना देखें'}
          size="small"
          onClick={() => {
            onNavigate('schemes');
            window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 1 } }));
          }}
          sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
        />
      </Box>
    </Card>
  );
};

