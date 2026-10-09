import React from 'react';
import { Card, Box, Typography, Button, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { appConfig } from '../../config/appConfig';
import { stopSpeech } from '../../utils/speech';

export const MandiPulseCard = ({
  liveMandiRates = [],
  selectedDistrict = 'रायपुर',
  isChhattisgarhi = false,
  onNavigate = () => {}
}) => {
  const paddyCard = {
    crop: isChhattisgarhi ? 'धान (सरना/मोटा)' : 'धान (सरना/मोटा)',
    rate: `₹${appConfig.paddyScheme.totalRate}`,
    type: isChhattisgarhi ? 'सरकारी खरीदी (MSP + बोनस)' : 'सरकारी उपार्जन (MSP + बोनस)',
    badge: `₹${appConfig.paddyScheme.totalRate} ${isChhattisgarhi ? 'गारंटी' : 'गारंटी'}`,
    color: '#1b5e20'
  };

  const liveCards = (liveMandiRates || []).map((item, idx) => ({
    crop: item.crop || (isChhattisgarhi ? 'जिंस' : 'जिंस'),
    rate: `₹${Number(item.modalRate || item.maxRate || 0).toLocaleString('en-IN')}`,
    type: `${item.market || selectedDistrict} ${isChhattisgarhi ? 'मंडी' : 'मंडी'}`,
    badge: item.variety ? item.variety : (isChhattisgarhi ? 'APMC लाइव' : 'APMC लाइव'),
    color: idx === 0 ? '#e65100' : idx === 1 ? '#0288d1' : '#2e7d32'
  }));

  const displayRates = [paddyCard, ...liveCards];

  return (
    <Card
      sx={{
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
            {isChhattisgarhi ? 'आज के मुख्य मंडी भाव (Mandi Pulse)' : 'आज के प्रमुख मंडी भाव (Mandi Pulse)'}
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
          onClick={() => { stopSpeech(); onNavigate('mandi'); }}
          sx={{ color: '#1565c0', fontWeight: 800, fontSize: '0.72rem', p: 0 }}
        >
          {isChhattisgarhi ? 'सबो 30+ मंडी' : 'सभी 30+ मंडियां'}
        </Button>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: displayRates.length === 1 ? '1fr' : 'repeat(4, 1fr)', md: 'repeat(2, 1fr)' }, gap: 1 }}>
          {displayRates.map((item, idx) => (
            <Box
              key={idx}
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
          ))}
        </Box>
        {(!liveMandiRates || liveMandiRates.length === 0) && (
          <Box sx={{ mt: 1, p: 0.8, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
              {isChhattisgarhi ? '🛡️ शून्य गलत डेटा नीति: आज के सत्यापित APMC मंडी भाव देखे बर मंडी टैब खोलव।' : '🛡️ शून्य गलत डेटा नीति: आज के सत्यापित APMC मंडी भाव देखने हेतु मंडी टैब खोलें।'}
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

