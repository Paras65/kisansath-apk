import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import BugReportIcon from '@mui/icons-material/BugReport';
import TerminalIcon from '@mui/icons-material/Terminal';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { appConfig } from '../../config/appConfig';

export const AdminAuditLogsSection = ({
  auditStats,
  auditFilter,
  setAuditFilter,
  auditSearch,
  setAuditSearch,
  loadAuditLogs,
  loadingAudit,
  handleClearAudit,
  handleCopyAuditReport,
  copiedAuditReport,
  auditLogs,
  setSelectedConsoleLog,
  handleLogout,
  onExit,
}) => {
  return (
    <>
      {/* ========================================================
          REAL-TIME SECURITY & ERROR AUDIT LOGS (Zero-PII Stream)
          ======================================================== */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3.5,
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            bgcolor: '#ffffff',
          }}
        >
          {/* Card Header & Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ color: '#0f172a', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  🛡️ रीयल-टाइम सुरक्षा व सिस्टम एरर ऑडिट लॉग्स
                </Typography>
                <Chip
                  label="Zero-PII Secure Buffer"
                  size="small"
                  sx={{ fontWeight: 700, fontSize: '0.68rem', bgcolor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                मेमोरी-बाउंड सुरक्षा रिंग बफ़र (अधिकतम 150 लॉग्स) — सर्वर 500 एरर्स, अनधिकृत अनुरोधों (401/403/429) व भविष्य के सुरक्षा सुधारों की लाइव टेलीमेट्री।
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={copiedAuditReport ? <CheckIcon sx={{ color: '#16a34a' }} /> : <ContentCopyIcon />}
                onClick={handleCopyAuditReport}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderColor: copiedAuditReport ? '#16a34a' : '#cbd5e1',
                  color: copiedAuditReport ? '#16a34a' : '#334155',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                }}
              >
                {copiedAuditReport ? 'कॉपी हो गया!' : 'रिपोर्ट कॉपी करें'}
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={loadingAudit ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => loadAuditLogs()}
                disabled={loadingAudit}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                }}
              >
                रिफ्रेश
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAudit}
                disabled={loadingAudit || auditLogs.length === 0}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                लॉग्स साफ़ करें
              </Button>
            </Box>
          </Box>

          {/* 4 Summary KPI Metric Cards */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={6} sm={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                  कुल रिकॉर्डेड इवेंट्स
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', mt: 0.5 }}>
                  {auditStats?.total || auditLogs.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  सक्रिय मेमोरी बफर (Max 150)
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: (auditStats?.serverErrors || auditStats?.high || 0) > 0 ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${(auditStats?.serverErrors || auditStats?.high || 0) > 0 ? '#fecaca' : '#e2e8f0'}`,
                }}
              >
                <Typography variant="caption" sx={{ color: (auditStats?.serverErrors || auditStats?.high || 0) > 0 ? '#b91c1c' : '#64748b', fontWeight: 700, display: 'block' }}>
                  सर्वर एरर्स (500 High)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: (auditStats?.serverErrors || auditStats?.high || 0) > 0 ? '#dc2626' : '#0f172a', mt: 0.5 }}>
                  {auditStats?.serverErrors || auditStats?.high || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: (auditStats?.serverErrors || auditStats?.high || 0) > 0 ? '#ef4444' : '#94a3b8', fontSize: '0.7rem' }}>
                  गंभीर तकनीकी अपवाद
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: (auditStats?.securityAlerts || 0) > 0 ? '#fffbeb' : '#f8fafc',
                  border: `1px solid ${(auditStats?.securityAlerts || 0) > 0 ? '#fde68a' : '#e2e8f0'}`,
                }}
              >
                <Typography variant="caption" sx={{ color: (auditStats?.securityAlerts || 0) > 0 ? '#b45309' : '#64748b', fontWeight: 700, display: 'block' }}>
                  सुरक्षा अलर्ट्स (401/403/429)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: (auditStats?.securityAlerts || 0) > 0 ? '#d97706' : '#0f172a', mt: 0.5 }}>
                  {auditStats?.securityAlerts || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: (auditStats?.securityAlerts || 0) > 0 ? '#f59e0b' : '#94a3b8', fontSize: '0.7rem' }}>
                  पासकी / प्रमाणीकरण रुकावटें
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  bgcolor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                }}
              >
                <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 700, display: 'block' }}>
                  क्लाइंट चेतावनियां (Minor)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#0284c7', mt: 0.5 }}>
                  {auditStats?.low || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#38bdf8', fontSize: '0.7rem' }}>
                  400/404 सामान्य इनपुट त्रुटियां
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filter & Search Bar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
              mb: 2,
            }}
          >
            {/* Severity Filters */}
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'सभी (All)', count: auditStats?.total || auditLogs.length },
                { key: 'high', label: '🚨 सर्वर एरर्स (500)', count: auditStats?.serverErrors || auditStats?.high || 0 },
                { key: 'security', label: '🛡️ सुरक्षा (401/403/429)', count: auditStats?.securityAlerts || 0 },
                { key: 'low', label: '⚠️ चेतावनियां (Low)', count: auditStats?.low || 0 },
              ].map((btn) => (
                <Chip
                  key={btn.key}
                  label={`${btn.label} (${btn.count})`}
                  clickable
                  onClick={() => setAuditFilter(btn.key)}
                  variant={auditFilter === btn.key ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    bgcolor: auditFilter === btn.key ? '#0f172a' : 'transparent',
                    color: auditFilter === btn.key ? '#ffffff' : '#475569',
                    borderColor: auditFilter === btn.key ? '#0f172a' : '#cbd5e1',
                    '&:hover': {
                      bgcolor: auditFilter === btn.key ? '#1e293b' : '#f1f5f9',
                    },
                  }}
                />
              ))}
            </Box>

            {/* Search Field */}
            <TextField
              size="small"
              placeholder="एंडपॉइंट, संदेश, IP या डिवाइस खोजें..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 280 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Audit Logs Table */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              maxHeight: 440,
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#475569', width: 130 }}>समय (Time)</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#475569', width: 120 }}>गंभीरता (Level)</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#475569', width: 160 }}>स्टेटस व रूट (Route)</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#475569', width: 170 }}>क्लाइंट (Zero-PII IP)</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#475569' }}>समस्या व तकनीकी विवरण (Message & Error)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const filtered = auditLogs.filter((log) => {
                    if (auditFilter === 'high' && log.severity !== 'high' && log.statusCode < 500) return false;
                    if (auditFilter === 'security' && log.type !== 'security' && log.type !== 'auth' && ![401, 403, 429].includes(log.statusCode)) return false;
                    if (auditFilter === 'low' && log.severity !== 'low') return false;
                    if (auditSearch.trim()) {
                      const q = auditSearch.toLowerCase().trim();
                      return (
                        log.endpoint?.toLowerCase().includes(q) ||
                        log.message?.toLowerCase().includes(q) ||
                        log.technicalError?.toLowerCase().includes(q) ||
                        log.ipMasked?.toLowerCase().includes(q) ||
                        log.platform?.toLowerCase().includes(q) ||
                        String(log.statusCode).includes(q)
                      );
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ py: 6, textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 44 }} />
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#166534' }}>
                              {auditSearch ? 'खोज के अनुरूप कोई ऑडिट लॉग नहीं मिला।' : 'सब कुछ सुरक्षित और सामान्य है!'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {auditSearch ? 'कृपया कोई भिन्न खोज शब्द दर्ज करें।' : 'वर्तमान में कोई सक्रिय सुरक्षा चेतावनी या 500 सर्वर विफलता रिकॉर्ड नहीं हुई है।'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return filtered.map((log) => {
                    const is500 = log.statusCode >= 500;
                    const isSecurity = [401, 403, 429].includes(log.statusCode) || log.type === 'security' || log.type === 'auth';
                    const dateObj = new Date(log.timestamp);
                    const timeStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : log.timestamp;
                    const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' }) : '';

                    return (
                      <TableRow
                        key={log.id}
                        hover
                        sx={{
                          bgcolor: is500 ? '#fff5f5' : isSecurity ? '#fffdf5' : 'inherit',
                          '&:hover': { bgcolor: is500 ? '#fee2e2 !important' : isSecurity ? '#fef3c7 !important' : '#f8fafc !important' },
                        }}
                      >
                        {/* Timestamp */}
                        <TableCell sx={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                          <Tooltip title={dateObj.toLocaleString('hi-IN')}>
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block' }}>
                                {timeStr}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                                {dateStr}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>

                        {/* Severity & Type */}
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'flex-start' }}>
                            <Chip
                              label={log.severity === 'high' ? 'High' : log.severity === 'medium' ? 'Medium' : 'Low'}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                height: 20,
                                bgcolor: log.severity === 'high' ? '#fecaca' : log.severity === 'medium' ? '#fed7aa' : '#e0f2fe',
                                color: log.severity === 'high' ? '#b91c1c' : log.severity === 'medium' ? '#c2410c' : '#0369a1',
                              }}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                              {log.type}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Status & Route */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Chip
                              label={log.statusCode || 500}
                              size="small"
                              sx={{
                                fontWeight: 900,
                                fontSize: '0.72rem',
                                height: 22,
                                bgcolor: is500 ? '#dc2626' : isSecurity ? '#d97706' : log.statusCode >= 400 ? '#f97316' : '#16a34a',
                                color: '#ffffff',
                              }}
                            />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', wordBreak: 'break-all' }}>
                              {log.method} {log.endpoint}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Client IP & Platform */}
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LockIcon sx={{ fontSize: 13, color: '#64748b' }} />
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                                {log.ipMasked || '127.0.***.***'}
                              </Typography>
                            </Box>
                            <Chip
                              label={log.platform || 'Web/Browser'}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 18,
                                bgcolor: log.platform?.includes('Android') ? '#e0f2fe' : '#f1f5f9',
                                color: log.platform?.includes('Android') ? '#0284c7' : '#475569',
                              }}
                            />
                          </Box>
                        </TableCell>

                        {/* Message & Technical Details */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem', lineHeight: 1.4 }}>
                              {log.message}
                            </Typography>
                            {log.technicalError && log.technicalError !== log.message && (
                              <Box
                                sx={{
                                  mt: 0.6,
                                  p: 0.8,
                                  bgcolor: '#f8fafc',
                                  borderRadius: 1.5,
                                  border: '1px dashed #cbd5e1',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 0.8,
                                }}
                              >
                                <BugReportIcon sx={{ color: '#64748b', fontSize: 15, mt: 0.2 }} />
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.72rem', wordBreak: 'break-all', display: 'block' }}>
                                  {log.technicalError}
                                </Typography>
                              </Box>
                            )}
                            <Box sx={{ mt: 0.8 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<TerminalIcon sx={{ fontSize: 13 }} />}
                                onClick={() => setSelectedConsoleLog(log)}
                                sx={{
                                  fontSize: '0.68rem',
                                  py: 0.2,
                                  px: 1,
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderColor: '#cbd5e1',
                                  color: '#0f172a',
                                  bgcolor: '#f1f5f9',
                                  '&:hover': { bgcolor: '#e2e8f0', borderColor: '#94a3b8' },
                                }}
                              >
                                💻 विस्तृत कंसोल लॉग व स्टैक देखें ({log.technicalDetails?.errorName || 'Details'})
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* ========================================================
          SECURITY AUDIT CHECKLIST
          ======================================================== */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            🛡️ सुरक्षा अनुपालन व ऑडिट चेकलिस्ट
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
            OWASP एवं ISO 27001 मानकों के अनुरूप लागू सुरक्षा उपाय
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
            {[
              { title: 'HMAC-SHA256 JWT टोकन सत्यापन', desc: 'प्रत्येक अनुरोध डिजिटल रूप से हस्ताक्षरित टोकन से सुरक्षित है।' },
              { title: 'IDOR रोकथाम एवं टेनेंट आइसोलेशन', desc: 'क्रॉस-अकाउंट डेटा हेरफेर को सर्वर स्तर पर ब्लॉक किया जाता है।' },
              { title: 'Zero-PII डेटा सुरक्षा नीति', desc: 'आधार, बैंक खाता या संवेदनशील पहचान कभी क्लाइंट पर उजागर नहीं होती।' },
              { title: 'अल्पकालिक सत्र (Zero-Persistence)', desc: 'एडमिन टोकन केवल sessionStorage में रहता है और टैब बंद होते ही नष्ट हो जाता है।' },
              { title: '15-मिनट निष्क्रियता ऑटो-लॉक', desc: '15 मिनट तक कोई कार्य न होने पर सुरक्षा कारणों से सत्र स्वतः समाप्त होता है।' },
              { title: 'ब्रूट-फोर्स सुरक्षा एवं टाइमिंग-सेफ तुलना', desc: 'लगातार 5 असफल प्रयासों पर सुरक्षा लॉक एवं टाइमिंग-अटैक रोकथाम।' },
              { title: '2-घंटे हार्ड टोकन एक्सपायरी', desc: 'सुरक्षा टोकन 2 घंटे बाद स्वतः अमान्य हो जाता है।' },
            ].map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2 }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* ========================================================
          SYSTEM & ENVIRONMENT SETTINGS
          ======================================================== */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            ⚙️ सिस्टम एवं एनवायरनमेंट सेटिंग्स
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
            appConfig व पर्यावरण वैरिएबल्स की वर्तमान स्थिति
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ऐप का नाम</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{appConfig.appName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>संस्करण (Version)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#16a34a' }}>v{appConfig.appVersion}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>राज्य (State)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{appConfig.stateName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>डिफ़ॉल्ट ज़िला</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{appConfig.defaultDistrict}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>API Base URL</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>{appConfig.apiBaseUrl}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>धान उपार्जन दर</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#16a34a' }}>₹{appConfig.paddyScheme.totalRate}/क्विंटल</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>किसान कॉल सेंटर (कृषि विभाग)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{appConfig.helpline.label} (खेती-किसानी परामर्श)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ऐप तकनीकी सहायता ईमेल</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0284c7' }}>{appConfig.supportEmail || 'support@init65.co.in'} (Init65)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              सत्र समाप्त करें (Logout)
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<ArrowBackIcon />}
              onClick={onExit}
              sx={{ bgcolor: '#0f172a', fontWeight: 800, borderRadius: 2 }}
            >
              किसान ऐप पर लौटें
            </Button>
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

