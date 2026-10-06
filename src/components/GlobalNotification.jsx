import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { subscribeNotifications, hideNotification } from '../services/notificationService';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

const SEVERITY_CONFIG = {
  success: {
    icon: <CheckCircleIcon sx={{ color: '#1b5e20', fontSize: 22 }} />,
    bgcolor: '#e8f5e9',
    borderColor: '#81c784',
    textColor: '#1b5e20'
  },
  error: {
    icon: <ErrorIcon sx={{ color: '#c62828', fontSize: 22 }} />,
    bgcolor: '#ffebee',
    borderColor: '#e57373',
    textColor: '#b71c1c'
  },
  warning: {
    icon: <WarningAmberIcon sx={{ color: '#e65100', fontSize: 22 }} />,
    bgcolor: '#fff8e1',
    borderColor: '#ffd54f',
    textColor: '#bf360c'
  },
  info: {
    icon: <InfoOutlinedIcon sx={{ color: '#0d47a1', fontSize: 22 }} />,
    bgcolor: '#e3f2fd',
    borderColor: '#90caf9',
    textColor: '#0d47a1'
  }
};

export const GlobalNotification = () => {
  const [currentToast, setCurrentToast] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((toast) => {
      setCurrentToast(toast);
    });
    return () => unsubscribe();
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    hideNotification();
  };

  if (!currentToast) return null;

  const config = SEVERITY_CONFIG[currentToast.severity] || SEVERITY_CONFIG.info;

  return (
    <Snackbar
      open={Boolean(currentToast)}
      autoHideDuration={currentToast.duration || 3200}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        // Positioned safely above mobile bottom navigation bar (64px + safe insets)
        bottom: { xs: '76px !important', md: '28px !important' },
        zIndex: 2500,
        width: { xs: '92%', sm: 'auto' },
        maxWidth: 420
      }}
    >
      <Box
        sx={{
          width: '100%',
          bgcolor: config.bgcolor,
          border: `1.5px solid ${config.borderColor}`,
          borderRadius: 3.5,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
          p: 1.5,
          px: 1.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {config.icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            {currentToast.title && (
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: config.textColor,
                  fontSize: '0.84rem',
                  lineHeight: 1.2,
                  mb: 0.2
                }}
              >
                {currentToast.title}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                fontSize: '0.82rem',
                lineHeight: 1.35
              }}
            >
              {currentToast.message}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: '#64748b',
            p: 0.4,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' }
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
};
