import React, { useState, Suspense, lazy } from 'react';
import { Box, Paper, Typography, Button, IconButton, Tooltip } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import AndroidIcon from '@mui/icons-material/Android';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { appConfig } from '../config/appConfig';
import { useLanguage } from '../utils/i18n';
import {
  isAppAlreadyInstalled,
  isInstallBannerDismissed,
  dismissInstallBanner,
} from '../utils/capacitorUtils';

const ShareModal = lazy(() => import('./ShareModal').then((m) => ({ default: m.ShareModal })));

export const InstallPrompt = ({ onInstall, onDismiss }) => {
  const { isChhattisgarhi } = useLanguage();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Suppress banner if already installed in standalone/TWA/APK or dismissed by farmer
  if (isAppAlreadyInstalled() || isInstallBannerDismissed()) {
    return null;
  }

  const handleDismiss = () => {
    dismissInstallBanner();
    if (onDismiss) onDismiss();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1536px', mx: 'auto', px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 } }}>
      <Paper
        elevation={2}
        sx={{
          my: 0.8,
          py: { xs: 0.7, sm: 1 },
          px: { xs: 1, sm: 1.5 },
          borderRadius: 2.5,
          bgcolor: '#f1f8e9',
          border: '1.2px solid #a5d6a7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 0.8, sm: 1.5 },
          boxShadow: '0 2px 8px rgba(27,94,32,0.08)',
        }}
      >
        {/* Left: App Icon & Crisp Single-Line Text */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
          <Box
            component="img"
            src="/icons/kisan-icon-512.webp"
            onError={(e) => { e.currentTarget.src = '/icons/kisan-icon.svg'; }}
            alt={appConfig.appName}
            width="34"
            height="34"
            sx={{ width: 34, height: 34, borderRadius: 1.8, flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 800,
                color: '#1b5e20',
                fontSize: { xs: '0.8rem', sm: '0.88rem' },
                lineHeight: 1.2,
              }}
            >
              {appConfig.appName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: '#2e7d32',
                display: 'block',
                fontSize: { xs: '0.68rem', sm: '0.74rem' },
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {isChhattisgarhi ? 'बिना इंटरनेट खेत म भी चालू' : 'बिना इंटरनेट खेत में भी चालू'}
            </Typography>
          </Box>
        </Box>

        {/* Right: Short & Sweet Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.6, sm: 0.8 }, flexShrink: 0 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<GetAppIcon sx={{ fontSize: '15px !important' }} />}
            onClick={onInstall}
            sx={{
              bgcolor: '#2e7d32',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              py: 0.4,
              px: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              boxShadow: 'none',
              minWidth: 'auto',
              '&:hover': { bgcolor: '#1b5e20', boxShadow: 'none' }
            }}
          >
            {isChhattisgarhi ? 'इंस्टॉल करव' : 'इंस्टॉल'}
          </Button>

          {appConfig.apkDownloadUrl && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AndroidIcon sx={{ fontSize: '15px !important' }} />}
              href={appConfig.apkDownloadUrl}
              target="_blank"
              download
              sx={{
                borderColor: '#81c784',
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
                py: 0.35,
                px: { xs: 0.8, sm: 1.2 },
                borderRadius: 2,
                minWidth: 'auto',
                '&:hover': { bgcolor: '#c8e6c9', borderColor: '#2e7d32' }
              }}
            >
              APK
            </Button>
          )}

          <Tooltip title={isChhattisgarhi ? 'शेयर करव' : 'शेयर करें'}>
            <IconButton
              size="small"
              onClick={() => setShareModalOpen(true)}
              sx={{
                color: '#2e7d32',
                p: 0.4,
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: '#e8f5e9' }
              }}
            >
              <ShareIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isChhattisgarhi ? 'हटाव' : 'हटाएं'}>
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{
                color: '#78909c',
                p: 0.4,
                '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Share Modal (On-Demand Lazy Loaded) */}
        <Suspense fallback={null}>
          {shareModalOpen && (
            <ShareModal
              open={shareModalOpen}
              onClose={() => setShareModalOpen(false)}
            />
          )}
        </Suspense>
      </Paper>
    </Box>
  );
};
