import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { notify } from '../../services/notificationService';

export const AdminConsoleLogDialog = ({
  selectedConsoleLog,
  onClose,
}) => {
  return (
    <Dialog
      open={Boolean(selectedConsoleLog)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          bgcolor: '#0b132b',
          color: '#f8fafc',
          border: '1px solid #1e293b',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        },
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <TerminalIcon sx={{ color: '#38bdf8', fontSize: 24 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
              विस्तृत तकनीकी कंसोल लॉग (Technical Console Error Log)
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Single Source of Truth • Real-Time Server Diagnostics
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, maxHeight: '70vh', overflowY: 'auto' }}>
        {selectedConsoleLog && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Top Meta Badges Strip */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Chip
                label={`${selectedConsoleLog.method || 'API'} ${selectedConsoleLog.statusCode || 500}`}
                size="small"
                sx={{
                  fontWeight: 900,
                  bgcolor: (selectedConsoleLog.statusCode || 500) >= 500 ? '#ef4444' : '#f97316',
                  color: '#fff',
                }}
              />
              <Chip
                label={selectedConsoleLog.platform || 'Platform: Unknown'}
                size="small"
                sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}
              />
              <Chip
                label={`IP: ${selectedConsoleLog.ipMasked || '127.***'}`}
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontFamily: 'monospace' }}
              />
              <Chip
                label={new Date(selectedConsoleLog.timestamp).toLocaleString('hi-IN')}
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}
              />
            </Box>

            {/* Endpoint & URL */}
            <Box sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.4 }}>
                🌐 Requested Endpoint & URL:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#f1f5f9', fontWeight: 700, wordBreak: 'break-all' }}>
                {selectedConsoleLog.technicalDetails?.url || selectedConsoleLog.endpoint || 'N/A'}
              </Typography>
            </Box>

            {/* Error Name & Message */}
            <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 1.5, borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <Typography variant="caption" sx={{ color: '#fca5a5', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.4 }}>
                🚨 Error Name & User Message:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#fecaca', mb: 0.5 }}>
                {selectedConsoleLog.technicalDetails?.errorName || 'Error'}: {selectedConsoleLog.technicalDetails?.errorMessage || selectedConsoleLog.technicalError || selectedConsoleLog.message}
              </Typography>
              <Typography variant="caption" sx={{ color: '#e2e8f0', display: 'block' }}>
                यूजर संदेश: {selectedConsoleLog.message}
              </Typography>
            </Box>

            {/* Request Params & Query (if available) */}
            {((selectedConsoleLog.technicalDetails?.params && Object.keys(selectedConsoleLog.technicalDetails.params).length > 0) ||
              (selectedConsoleLog.technicalDetails?.query && Object.keys(selectedConsoleLog.technicalDetails.query).length > 0)) && (
              <Box sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
                  🔍 Request Parameters & Query Strings:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.2,
                    bgcolor: '#030712',
                    borderRadius: 1.5,
                    color: '#c4b5fd',
                    fontSize: '0.74rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                  }}
                >
                  {JSON.stringify(
                    {
                      params: selectedConsoleLog.technicalDetails?.params,
                      query: selectedConsoleLog.technicalDetails?.query,
                    },
                    null,
                    2
                  )}
                </Box>
              </Box>
            )}

            {/* Request Body Payload (if available) */}
            {selectedConsoleLog.technicalDetails?.body && Object.keys(selectedConsoleLog.technicalDetails.body).length > 0 && (
              <Box sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="caption" sx={{ color: '#fb923c', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
                  📦 Sanitized Request Body Payload (Zero-PII):
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.2,
                    bgcolor: '#030712',
                    borderRadius: 1.5,
                    color: '#fdba74',
                    fontSize: '0.74rem',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    border: '1px solid rgba(251, 146, 60, 0.2)',
                  }}
                >
                  {JSON.stringify(selectedConsoleLog.technicalDetails.body, null, 2)}
                </Box>
              </Box>
            )}

            {/* Server Stack Trace */}
            <Box sx={{ bgcolor: 'rgba(15, 23, 42, 0.95)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.6 }}>
                📜 Server Stack Trace & Technical Details:
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  bgcolor: '#030712',
                  borderRadius: 1.5,
                  color: '#86efac',
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  maxHeight: 260,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                }}
              >
                {selectedConsoleLog.technicalDetails?.stack || selectedConsoleLog.technicalError || 'No stack trace available for this event.'}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ContentCopyIcon />}
          onClick={() => {
            if (!selectedConsoleLog) return;
            const copyPayload = JSON.stringify(selectedConsoleLog, null, 2);
            navigator.clipboard?.writeText(copyPayload);
            notify.success('📋 सम्पूर्ण तकनीकी कंसोल डेटा क्लिपबोर्ड पर कॉपी हो गया!');
          }}
          sx={{
            color: '#e2e8f0',
            borderColor: 'rgba(255,255,255,0.2)',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          📋 पूरा JSON कॉपी करें
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ bgcolor: '#38bdf8', color: '#0f172a', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: '#0ea5e9' } }}
        >
          बंद करें (Close)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

