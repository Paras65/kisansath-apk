import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export const AdminMetricsModule = ({
  stats,
  listings,
  broadcasts,
  qaList,
  farmers,
  handleDeleteBroadcast,
}) => {
  return (
    <Box>
      {/* Telemetry Tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #bfdbfe', height: '100%' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700 }}>
                कुल पंजीकृत किसान
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e3a8a', mt: 0.5 }}>
                {stats?.totalFarmers !== undefined && stats?.totalFarmers !== null ? stats.totalFarmers : (stats?.isOffline ? '—' : 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                {stats?.isOffline ? 'सर्वर ऑफ़लाइन' : 'सत्यापित खाते'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#f0fdf4', borderRadius: 3, border: '1px solid #bbf7d0', height: '100%' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                कुल दर्ज रकबा (एकड़)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#14532d', mt: 0.5 }}>
                {stats?.totalAcres !== undefined && stats?.totalAcres !== null ? stats.totalAcres : (stats?.isOffline ? '—' : 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#22c55e' }}>
                {stats?.isOffline ? 'डेटाबेस डिस्कनेक्टेड' : 'लाइव पंजीकृत खेत'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#fffbeb', borderRadius: 3, border: '1px solid #fde68a', height: '100%' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700 }}>
                सक्रिय मंडी लिस्टिंग
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#78350f', mt: 0.5 }}>
                {listings ? listings.length : 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                सीधी खेत बिक्री
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#fef2f2', borderRadius: 3, border: '1px solid #fecaca', height: '100%' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700 }}>
                सक्रिय आपातकालीन अलर्ट
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#7f1d1d', mt: 0.5 }}>
                {broadcasts ? broadcasts.length : 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ef4444' }}>
                कीट व मौसम चेतावनी
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ bgcolor: '#faf5ff', borderRadius: 3, border: '1px solid #e9d5ff', height: '100%' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#6b21a8', fontWeight: 700 }}>
                चौपाल चर्चा व रेंटल
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#581c87', mt: 0.5 }}>
                {qaList ? qaList.length : 0}
              </Typography>
              <Typography variant="caption" sx={{ color: '#a855f7' }}>
                सक्रिय संवाद
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2-Column Overview Canvas */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                📢 सक्रिय आपातकालीन अलर्ट व प्रसार (Active Broadcasts)
              </Typography>
              <Chip label={`${broadcasts.length} सक्रिय`} size="small" color="error" sx={{ fontWeight: 800 }} />
            </Box>
            {broadcasts.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#64748b', py: 3, textAlign: 'center' }}>
                कोई सक्रिय प्रसारण नहीं है।
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {broadcasts.map((b) => (
                  <Paper
                    key={b.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      borderColor: b.severity === 'high' ? '#fecaca' : '#fed7aa',
                      bgcolor: b.severity === 'high' ? '#fff5f5' : '#fffaf0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          {b.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mt: 0.5 }}>
                          {b.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.8, display: 'block' }}>
                          लक्ष्य जिला: <strong>{b.targetDistrict === 'all' ? 'समस्त छत्तीसगढ़' : b.targetDistrict}</strong> • जारीकर्ता: {b.author}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleDeleteBroadcast(b.id)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2.5, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              ⚡ हालिया पंजीकृत किसान (Recent Farmers)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {farmers.slice(0, 5).map((f) => (
                <Box
                  key={f.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {f.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {f.district} • {f.crop} ({f.acres} एकड़)
                    </Typography>
                  </Box>
                  <Chip label={f.kccApproved ? 'KCC स्वीकृत' : 'सामान्य'} size="small" color={f.kccApproved ? 'success' : 'default'} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

