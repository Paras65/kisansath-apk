import React, { useState } from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import AndroidIcon from '@mui/icons-material/Android';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { appConfig } from '../config/appConfig';
import { shareApp } from '../utils/shareUtils';
import { ShareModal } from './ShareModal';

export const InstallPrompt = ({ onInstall, onDismiss }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  return (
    <Paper
      elevation={4}
      sx={{
        m: 1.5,
        p: 1.5,
        borderRadius: 3,
        bgcolor: '#e8f5e9',
        border: '1.5px solid #81c784',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box
          component="img"
          src="/icons/kisan-icon-512.png"
          onError={(e) => { e.currentTarget.src = '/icons/kisan-icon.svg'; }}
          alt="Icon"
          sx={{ width: 44, height: 44, borderRadius: 2 }}
        />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', lineHeight: 1.2 }}>
            किसान साथी ऐप इंस्टॉल करें
          </Typography>
          <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', fontSize: '0.75rem' }}>
            बिना इंटरनेट खेत में भी तेजी से उपयोग करें
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 'auto' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<GetAppIcon />}
          onClick={onInstall}
          sx={{
            bgcolor: '#2e7d32',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            py: 0.6,
            px: 1.5,
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          इंस्टॉल करें
        </Button>

        {appConfig.apkDownloadUrl && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AndroidIcon />}
            href={appConfig.apkDownloadUrl}
            target="_blank"
            download
            sx={{
              borderColor: '#2e7d32',
              color: '#1b5e20',
              fontWeight: 700,
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              py: 0.5,
              px: 1.2,
              '&:hover': { bgcolor: '#c8e6c9' }
            }}
          >
            APK डाउनलोड
          </Button>
        )}

        <Button
          variant="outlined"
          size="small"
          startIcon={<ShareIcon />}
          onClick={() => setShareModalOpen(true)}
          sx={{
            borderColor: '#81c784',
            color: '#1b5e20',
            fontWeight: 700,
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            py: 0.5,
            px: 1.2,
            '&:hover': { bgcolor: '#c8e6c9' }
          }}
        >
          शेयर करें
        </Button>

        <IconButton size="small" onClick={onDismiss} sx={{ color: '#558b2f' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </Paper>
  );
};
