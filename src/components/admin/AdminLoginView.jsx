import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { appConfig } from '../../config/appConfig';

export const AdminLoginView = ({
  passkey,
  setPasskey,
  authError,
  loading,
  handleLogin,
  onExit,
}) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#0f172a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          bgcolor: '#1e293b',
          borderRadius: 4,
          border: '1.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
      >
        {/* Header Strip */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'rgba(15, 23, 42, 0.75)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 1.5,
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <AdminPanelSettingsIcon sx={{ fontSize: 34 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', fontSize: '1.25rem' }}>
            समर्पित कृषि प्रशासन पोर्टल
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
            {appConfig.appName} • Directorate of Agriculture Oversight Room
          </Typography>
        </Box>

        {/* Form Area */}
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2.5, textAlign: 'center', fontSize: '0.85rem' }}>
            कृषि विस्तार अधिकारी (RAEO), जिला कृषि उप-संचालक एवं सुपर एडमिन हेतु आरक्षित सुरक्षित सत्र।
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              type="password"
              label="प्रशासक पासकी (Admin Passkey)"
              variant="outlined"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              error={!!authError}
              helperText={authError}
              placeholder="सुरक्षित पासकी दर्ज करें..."
              autoFocus
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  bgcolor: '#0f172a',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#38bdf8' },
                  '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
                },
                '& .MuiInputLabel-root': { color: '#94a3b8' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
                '& .MuiFormHelperText-root': { color: '#f87171' },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={<LockIcon />}
              sx={{
                py: 1.4,
                bgcolor: '#0284c7',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                borderRadius: 2.5,
                '&:hover': { bgcolor: '#0369a1' },
              }}
            >
              {loading ? 'सत्यापन हो रहा है...' : 'प्रशासन कक्ष में प्रवेश करें'}
            </Button>
          </form>

          <Box
            sx={{
              mt: 3,
              p: 1.5,
              bgcolor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <SecurityIcon sx={{ color: '#22c55e', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.3 }}>
              HMAC-SHA256 टोकन आधारित एन्क्रिप्शन • 15-मिनट निष्क्रियता ऑटो-लॉक सुरक्षा सक्रिय।
            </Typography>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Button
            fullWidth
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={onExit}
            sx={{
              color: '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            🌾 किसान साथी होम पर लौटें (Return to App)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

