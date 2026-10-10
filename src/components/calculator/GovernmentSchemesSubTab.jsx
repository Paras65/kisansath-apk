import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { speakText } from '../../utils/speech';
import { useLanguage } from '../../utils/i18n';

export const GovernmentSchemesSubTab = ({ schemesList = [], loadFromMongo }) => {
  const { isChhattisgarhi } = useLanguage();

  if (schemesList.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          my: 2,
          textAlign: 'center',
          borderRadius: '16px',
          bgcolor: '#f8fafc',
          border: '1.5px dashed #cbd5e1'
        }}
      >
        <PolicyIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
          {isChhattisgarhi ? 'कोनो सरकारी योजना के जानकारी नइये' : 'कोई सरकारी योजना डेटा उपलब्ध नहीं है'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 440, mx: 'auto', mb: 2 }}>
          {isChhattisgarhi
            ? 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत बिना जांचे कोनो योजना जानकारी नइ दिखाय जाय। नवा योजना लोड करे बर इंटरनेट कनेक्ट कर फेर लोड करव।'
            : 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत बिना सत्यापन के कोई भी योजना जानकारी नहीं दिखाई जाती। नवीनतम सरकारी योजनाएं लोड करने हेतु इंटरनेट कनेक्ट कर पुनः लोड करें।'}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={loadFromMongo}
          sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: 2 }}
        >
          {isChhattisgarhi ? 'फेर लोड करव (Retry)' : 'पुनः लोड करें (Retry)'}
        </Button>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      {schemesList.map((scheme) => (
        <Grid item xs={12} md={6} key={scheme.id}>
          <Card
            className="touch-card"
            sx={{
              borderRadius: 3.5,
              border: '1.2px solid #e2e8f0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }
            }}
          >
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Chip
                      label={scheme.badge}
                      size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem', mb: 0.5 }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.98rem', lineHeight: 1.25 }}>
                      {scheme.title}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
                    onClick={() => speakText(`${scheme.title}. ${scheme.summary}`)}
                    sx={{ color: '#2e7d32', fontSize: '0.72rem', p: 0.5 }}
                  >
                    {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
                  </Button>
                </Box>

                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.84rem', mb: 1.5, lineHeight: 1.5 }}>
                  {scheme.summary}
                </Typography>

                <Box sx={{ mb: 1.5, pl: 0.5 }}>
                  {scheme.keyPoints.map((pt, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 15, color: '#16a34a', mt: 0.2 }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.78rem', lineHeight: 1.4 }}>
                        {pt}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <Divider sx={{ my: 1.2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<LaunchIcon sx={{ fontSize: 15 }} />}
                    href={scheme.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      bgcolor: '#1b7a2d',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      borderRadius: 2.5,
                      '&:hover': { bgcolor: '#125420' }
                    }}
                  >
                    {scheme.linkText}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

