import React from 'react';
import {
  Card,
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  LinearProgress
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { analyzePlotLifecycle } from '../../utils/cropLifecycleEngine';
import { stopSpeech } from '../../utils/speech';

export const ActivePlotsAndDailyTasksCard = ({
  farmerPlots = [],
  weather = {},
  isChhattisgarhi = false,
  setOpenMeraKhet = () => {},
  setOpenMotorModal = () => {}
}) => {
  return (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #a5d6a7',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: '#f1f8e9',
          borderBottom: '1px solid #c8e6c9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.92rem' }}>
            🌱 {isChhattisgarhi ? 'मोर चालू खेत अऊ आज के किसानी काम' : 'मेरे सक्रिय खेत व आज के कृषि कार्य (Live Field Dashboard)'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${(farmerPlots || []).length} ${isChhattisgarhi ? 'खेत चालू हे' : 'खेत सक्रिय'}`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.7rem' }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2, px: 1.4, py: 0.3 }}
          >
            {isChhattisgarhi ? '📅 नवा फसल तारीख जोड़व' : '📅 फसल बुआई तारीख जोड़ें'}
          </Button>
        </Box>
      </Box>

      {/* Plot Feed Body */}
      <Box sx={{ p: 2 }}>
        {(farmerPlots || []).length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {farmerPlots.map((plot, idx) => {
              const analysis = analyzePlotLifecycle(plot, weather || {});
              return (
                <Paper
                  key={plot.id || idx}
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    bgcolor: '#fafafa',
                    border: '1.2px solid #e0e0e0',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#ffffff', borderColor: '#81c784', boxShadow: '0 3px 12px rgba(0,0,0,0.06)' }
                  }}
                >
                  {/* Plot Header: Crop Name & Stage Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.96rem' }}>
                        🌾 {plot.name || (isChhattisgarhi ? `खेत ${idx + 1}` : `खेत ${idx + 1}`)} ({analysis.cropRule?.name || (isChhattisgarhi ? 'फसल' : 'फसल')})
                      </Typography>
                      {plot.variety && (
                        <Chip label={plot.variety} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#e8f5e9', color: '#1b5e20' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Chip
                        label={`⏱️ ${isChhattisgarhi ? (analysis.dayLabelCg || analysis.dayLabel) : analysis.dayLabel}`}
                        size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                      />
                      <Chip
                        label={analysis.currentStage?.stageName?.split('(')[0] || (isChhattisgarhi ? 'चालू' : 'सक्रिय')}
                        size="small"
                        sx={{
                          bgcolor: `${analysis.currentStage?.statusColor || '#2e7d32'}18`,
                          color: analysis.currentStage?.statusColor || '#2e7d32',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                          border: `1px solid ${analysis.currentStage?.statusColor || '#2e7d32'}40`
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Sowing & Acreage Info */}
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mb: 1 }}>
                    {isChhattisgarhi ? 'रकबा:' : 'रकबा:'} <strong>{plot.areaAcres || '1.0'} {isChhattisgarhi ? 'एकड़' : 'एकड़'}</strong> • {isChhattisgarhi ? 'बोवाई तारीख:' : 'बुआई तिथि:'} {plot.sowDate || (isChhattisgarhi ? 'दर्ज नइ हे' : 'दर्ज नहीं')}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.68rem' }}>
                        {isChhattisgarhi ? 'फसल चक्र बढ़वार' : 'फसल चक्र प्रगति'} ({analysis.cropRule?.totalDays || 120} {isChhattisgarhi ? 'दिन चक्र' : 'दिन चक्र'})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem' }}>
                        {analysis.progressPercent}% {isChhattisgarhi ? 'पूरा' : 'पूर्ण'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.progressPercent}
                      sx={{
                        height: 7,
                        borderRadius: 3.5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { bgcolor: analysis.currentStage?.statusColor || '#2e7d32', borderRadius: 3.5 }
                      }}
                    />
                  </Box>

                  {/* Today's Recommended Action Box */}
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      mb: 1.2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.8
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.74rem', display: 'block' }}>
                        {isChhattisgarhi ? "आज के जरूरी किसानी काम (Today's Advisory):" : "आज का आवश्यक कार्य (Today's Advisory):"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#14532d', fontSize: '0.74rem', lineHeight: 1.35, display: 'block' }}>
                        {analysis.currentStage?.task || (isChhattisgarhi ? 'खेत के रोज देखरेख करव अऊ उचित नमी बना के रखव।' : 'खेत की नियमित निगरानी करें और उचित नमी बनाए रखें।')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Weather Alert (if applicable) */}
                  {analysis.weatherAlert && (
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: analysis.weatherAlert.type === 'warning' ? '#fff1f2' : '#eff6ff',
                        border: `1px solid ${analysis.weatherAlert.type === 'warning' ? '#fecdd3' : '#bfdbfe'}`,
                        mb: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8
                      }}
                    >
                      <Typography variant="caption" sx={{ color: analysis.weatherAlert.type === 'warning' ? '#be123c' : '#1d4ed8', fontWeight: 700, fontSize: '0.72rem' }}>
                        {analysis.weatherAlert.title}: {analysis.weatherAlert.message}
                      </Typography>
                    </Box>
                  )}

                  {/* Plot Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                      onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
                      sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.74rem', p: 0.3 }}
                    >
                      {isChhattisgarhi ? 'खेत के ब्योरा अऊ खर्च डायरी देखव' : 'खेत का विवरण व खर्च डायरी देखें'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PowerSettingsNewIcon sx={{ fontSize: 14 }} />}
                      onClick={() => setOpenMotorModal(true)}
                      sx={{ color: '#0288d1', fontWeight: 800, fontSize: '0.72rem', p: 0.3 }}
                    >
                      {isChhattisgarhi ? 'मोटर चालू/बंद' : 'मोटर कंट्रोल'}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          /* Empty State */
          <Box sx={{ textAlign: 'center', py: 3, px: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
            <AgricultureIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
              {isChhattisgarhi ? 'अभे कोनो फसल तारीख नइ चुने हव' : 'अभी कोई फसल बुआई तारीख नहीं चुनी गई'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, maxWidth: 360, mx: 'auto', fontSize: '0.76rem' }}>
              {isChhattisgarhi
                ? 'अपन फसल के रकबा (एकड़) अऊ बोवाई तारीख चुनव। कोनो खसरा या जमीन के ब्यौरा नइ चाही।'
                : 'अपनी फसल का रकबा (एकड़) और बुआई की तारीख चुनें। किसी खसरा या कागज़ात की आवश्यकता नहीं है।'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, fontSize: '0.78rem', borderRadius: 2.5, px: 2, py: 0.6 }}
            >
              {isChhattisgarhi ? '📅 अपन बोवाई तारीख चुनव (1 मिनट)' : '📅 अपनी बुआई तारीख चुनें (1 मिनट)'}
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
};

