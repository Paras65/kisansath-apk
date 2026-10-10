import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { speakText } from '../../utils/speech';
import { useLanguage } from '../../utils/i18n';

export const CropDoctorSprayWeatherStrip = ({ sprayAdvisory, selectedDistrict }) => {
  const { isChhattisgarhi } = useLanguage();

  if (!sprayAdvisory) return null;

  const handleVoiceReadWeather = () => {
    const text = isChhattisgarhi
      ? `${selectedDistrict} म आज के मौसम अऊ दवाई छिड़काव सलाह: ${sprayAdvisory.advisory}`
      : `${selectedDistrict} मौसम एवं छिड़काव सलाह: ${sprayAdvisory.advisory}`;
    speakText(text);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        p: '8px 12px',
        borderRadius: '12px',
        bgcolor: sprayAdvisory.canSpray ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${sprayAdvisory.canSpray ? '#bbf7d0' : '#fde68a'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        {sprayAdvisory.canSpray ? (
          <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18, flexShrink: 0 }} />
        ) : (
          <WarningAmberIcon sx={{ color: '#d97706', fontSize: 18, flexShrink: 0 }} />
        )}
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: sprayAdvisory.canSpray ? '#166534' : '#92400e',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {sprayAdvisory.canSpray
            ? `✅ ${selectedDistrict}: आज छिड़काव अनुकूल (${sprayAdvisory.weather?.rainProbability || 0}% वर्षा, ${sprayAdvisory.weather?.windSpeed || 0} km/h हवा)`
            : `⚠️ ${selectedDistrict}: आज छिड़काव टालें — ${sprayAdvisory.advisory}`}
        </Typography>
      </Box>

      <Tooltip title={isChhattisgarhi ? 'मौसम सलाह सुनव' : 'मौसम सलाह सुनें'}>
        <IconButton
          size="small"
          onClick={handleVoiceReadWeather}
          sx={{
            p: 0.5,
            color: sprayAdvisory.canSpray ? '#16a34a' : '#d97706',
            bgcolor: '#fff',
            border: '1px solid #e2e8f0'
          }}
        >
          <VolumeUpIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

