import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

export const AdminBroadcastsModule = ({
  broadcasts,
  newBroadcast,
  setNewBroadcast,
  handleCreateBroadcast,
  handleDeleteBroadcast,
  loading,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            📢 नया आपातकालीन अलर्ट जारी करें
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
            यह चेतावनी राज्य भर के किसानों की होम स्क्रीन पर तत्काल दिखाई देगी
          </Typography>

          <Box component="form" onSubmit={handleCreateBroadcast} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="अलर्ट का शीर्षक (Title)"
              value={newBroadcast.title}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
              placeholder="उदा: धान में तना छेदक कीट का तीव्र प्रकोप..."
              required
              fullWidth
              size="small"
            />

            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>श्रेणी (Category)</InputLabel>
                  <Select
                    value={newBroadcast.category}
                    label="श्रेणी (Category)"
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, category: e.target.value })}
                  >
                    <MenuItem value="pest">🐛 कीट प्रकोप (Pest)</MenuItem>
                    <MenuItem value="weather">🌧️ मौसम अलर्ट (Weather)</MenuItem>
                    <MenuItem value="scheme">🏛️ सरकारी योजना (Scheme)</MenuItem>
                    <MenuItem value="market">📈 मंडी सूचना (Mandi)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>तीव्रता (Severity)</InputLabel>
                  <Select
                    value={newBroadcast.severity}
                    label="तीव्रता (Severity)"
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, severity: e.target.value })}
                  >
                    <MenuItem value="warning">⚠️ चेतावनी (Warning)</MenuItem>
                    <MenuItem value="high">🚨 अति-गंभीर (High)</MenuItem>
                    <MenuItem value="info">ℹ️ सामान्य सूचना (Info)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth size="small">
              <InputLabel>लक्ष्य जिला (Target District)</InputLabel>
              <Select
                value={newBroadcast.targetDistrict}
                label="लक्ष्य जिला (Target District)"
                onChange={(e) => setNewBroadcast({ ...newBroadcast, targetDistrict: e.target.value })}
              >
                <MenuItem value="all">समस्त राज्य (All Districts)</MenuItem>
                <MenuItem value="रायपुर">रायपुर</MenuItem>
                <MenuItem value="दुर्ग">दुर्ग</MenuItem>
                <MenuItem value="बिलासपुर">बिलासपुर</MenuItem>
                <MenuItem value="राजनांदगांव">राजनांदगांव</MenuItem>
                <MenuItem value="जांजगीर-चांपा">जांजगीर-चांपा</MenuItem>
                <MenuItem value="बलौदाबाजार">बलौदाबाजार</MenuItem>
                <MenuItem value="धमतरी">धमतरी</MenuItem>
                <MenuItem value="महासमुंद">महासमुंद</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="विस्तृत सलाह व निवारक उपाय (Message)"
              value={newBroadcast.message}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
              placeholder="किसानों के लिए अनुशंसित दवा, स्प्रे मात्रा व सावधानी..."
              required
              multiline
              rows={4}
              fullWidth
              size="small"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<SendIcon />}
              sx={{
                py: 1.2,
                bgcolor: '#1b5e20',
                color: '#ffffff',
                fontWeight: 800,
                borderRadius: 2.5,
                '&:hover': { bgcolor: '#14532d' },
              }}
            >
              तत्काल अलर्ट प्रसारित करें (Broadcast Alert)
            </Button>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
            📋 सक्रिय अलर्ट इतिहास ({broadcasts.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {broadcasts.map((b) => (
              <Paper
                key={b.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderColor: b.severity === 'high' ? '#fca5a5' : '#fed7aa',
                  bgcolor: b.severity === 'high' ? '#fff5f5' : '#fffaf0',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                      <Chip
                        label={b.severity === 'high' ? '🚨 अति-गंभीर' : '⚠️ चेतावनी'}
                        size="small"
                        color={b.severity === 'high' ? 'error' : 'warning'}
                        sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                      />
                      <Chip
                        label={b.targetDistrict === 'all' ? 'समस्त छत्तीसगढ़' : b.targetDistrict}
                        size="small"
                        sx={{ bgcolor: '#e2e8f0', color: '#334155', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {b.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', mt: 0.5, lineHeight: 1.4 }}>
                      {b.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                      जारीकर्ता: {b.author} • वैधता: {b.validTill || '7 दिन'}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => handleDeleteBroadcast(b.id)} sx={{ color: '#ef4444' }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

