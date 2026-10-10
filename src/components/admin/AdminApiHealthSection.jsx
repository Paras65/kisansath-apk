import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import DnsIcon from '@mui/icons-material/Dns';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PublicIcon from '@mui/icons-material/Public';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TuneIcon from '@mui/icons-material/Tune';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const AdminApiHealthSection = ({
  apiHealth,
  checkingApis,
  handleCheckApiHealth,
  externalConfig,
}) => {
  const [apiFilter, setApiFilter] = useState('all');

  return (
    <>
      {/* ========================================================
          LIVE API & EXTERNAL SERVICES CONNECTION CHECKER
          ======================================================== */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 3.5,
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            background: '#ffffff',
          }}
        >
          {/* Top Bar: Title, badges and re-test button */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                  📡 लाइव एपीआई व एक्सटर्नल सर्विस कनेक्टिविटी जांच
                </Typography>
                {apiHealth?.overallStatus === 'optimal' && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '15px !important' }} />}
                    label="100% सक्रिय"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                  />
                )}
                {apiHealth?.overallStatus === 'partial' && (
                  <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: '15px !important' }} />}
                    label="आंशिक सक्रिय"
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                  />
                )}
                {apiHealth?.overallStatus === 'degraded' && (
                  <Chip
                    icon={<ErrorOutlineIcon sx={{ fontSize: '15px !important' }} />}
                    label="ध्यान दें"
                    size="small"
                    color="error"
                    sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                बाह्य सरकारी पोर्टल्स (Agri-Stack, Bhuiyan, CG Khadya, PM-Kisan), data.gov.in मंडी स्ट्रीम, Gemini AI, Weather API व MongoDB Atlas की लाइव कनेक्टिविटी स्थिति
              </Typography>
            </Box>

            {/* Re-test button */}
            <Button
              variant="contained"
              onClick={handleCheckApiHealth}
              disabled={checkingApis}
              startIcon={
                <RefreshIcon
                  sx={{
                    animation: checkingApis ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              }
              sx={{
                bgcolor: '#16a34a',
                '&:hover': { bgcolor: '#15803d' },
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                alignSelf: { xs: 'stretch', md: 'auto' },
              }}
            >
              {checkingApis ? 'कनेक्टिविटी जांची जा रही है...' : 'सभी एपीआई पुनः जांचें (Re-test All)'}
            </Button>
          </Box>

          {/* Progress bar during testing */}
          {checkingApis && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress color="success" sx={{ borderRadius: 2, height: 6 }} />
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, mt: 0.5, display: 'block' }}>
                सभी बाह्य सर्वरों और डेटाबेस क्लस्टर से पिंग परीक्षण चल रहा है...
              </Typography>
            </Box>
          )}

          {/* Summary Metric Cards */}
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#f0fdf4', borderColor: '#bbf7d0', borderRadius: 2 }}>
                <CardContent sx={{ p: '12px !important' }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block' }}>
                    🟢 सक्रिय सेवाएं
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#166534' }}>
                    {apiHealth?.summary?.connected ?? '—'} / {apiHealth?.summary?.total ?? '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#fffbeb', borderColor: '#fef3c7', borderRadius: 2 }}>
                <CardContent sx={{ p: '12px !important' }}>
                  <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, display: 'block' }}>
                    🟡 चेतावनी / गाइड मोड
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#b45309' }}>
                    {apiHealth?.summary?.warning ?? '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#fef2f2', borderColor: '#fecaca', borderRadius: 2 }}>
                <CardContent sx={{ p: '12px !important' }}>
                  <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700, display: 'block' }}>
                    🔴 ऑफलाइन / विफल
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#b91c1c' }}>
                    {apiHealth?.summary?.offline ?? '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 2 }}>
                <CardContent sx={{ p: '12px !important' }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block' }}>
                    ⏱️ कुल परीक्षण समय
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a' }}>
                    {apiHealth?.durationMs ? `${apiHealth.durationMs} ms` : '—'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filter Pills */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 2 }}>
            {[
              { key: 'all', label: 'सभी सेवाएं (All)' },
              { key: 'core', label: 'डेटाबेस व कोर API' },
              { key: 'data', label: 'मंडी व मौसम (Data APIs)' },
              { key: 'portals', label: 'सरकारी गेटवे (Gov Portals)' },
            ].map((tab) => (
              <Chip
                key={tab.key}
                label={tab.label}
                clickable
                onClick={() => setApiFilter(tab.key)}
                variant={apiFilter === tab.key ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  bgcolor: apiFilter === tab.key ? '#0f172a' : 'transparent',
                  color: apiFilter === tab.key ? '#ffffff' : '#475569',
                  borderColor: '#cbd5e1',
                }}
              />
            ))}
          </Box>

          {/* Services Health Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>सेवा / API नाम</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>होस्ट / एंडपॉइंट</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>स्थिति (Status)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>विलंबता (Latency)</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#334155' }}>विवरण व संदेश</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!apiHealth?.services ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                      {checkingApis ? 'कनेक्टिविटी स्थिति जांची जा रही है...' : 'कोई डेटा नहीं। कृपया "सभी एपीआई पुनः जांचें" पर क्लिक करें।'}
                    </TableCell>
                  </TableRow>
                ) : (
                  apiHealth.services
                    .filter((s) => {
                      if (apiFilter === 'core') return s.id === 'mongodb' || s.id === 'gemini_ai' || s.id === 'kisan_api_server';
                      if (apiFilter === 'data') return s.id === 'data_gov_in' || s.id === 'open_meteo';
                      if (apiFilter === 'portals') return ['agristack', 'bhuiyan', 'khadya', 'pmkisan', 'creda'].includes(s.id);
                      return true;
                    })
                    .map((srv) => {
                      const isGreen = srv.status === 'connected';
                      const isYellow = srv.status === 'degraded' || srv.status === 'not_configured';
                      const isRed = srv.status === 'offline';

                      return (
                        <TableRow key={srv.id} hover>
                          {/* Service Name & Category */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {srv.id === 'mongodb' && <DnsIcon sx={{ color: '#0369a1', fontSize: 20 }} />}
                              {srv.id === 'gemini_ai' && <SecurityIcon sx={{ color: '#7c3aed', fontSize: 20 }} />}
                              {srv.id === 'open_meteo' && <SpeedIcon sx={{ color: '#0284c7', fontSize: 20 }} />}
                              {srv.id === 'data_gov_in' && <StorefrontIcon sx={{ color: '#16a34a', fontSize: 20 }} />}
                              {['agristack', 'bhuiyan', 'khadya', 'pmkisan', 'creda'].includes(srv.id) && (
                                <PublicIcon sx={{ color: '#475569', fontSize: 20 }} />
                              )}
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                  {srv.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                                  {srv.category}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Host / Endpoint */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>
                                {srv.target}
                              </Typography>
                              {srv.url && (
                                <IconButton
                                  size="small"
                                  href={srv.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ p: 0.3, color: '#64748b' }}
                                >
                                  <OpenInNewIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>

                          {/* Status Chip */}
                          <TableCell>
                            {isGreen && (
                              <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                                label={srv.statusLabel || 'सक्रिय'}
                                size="small"
                                color="success"
                                variant="filled"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            )}
                            {isYellow && (
                              <Chip
                                icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
                                label={srv.statusLabel || 'चेतावनी'}
                                size="small"
                                color="warning"
                                variant="filled"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            )}
                            {isRed && (
                              <Chip
                                icon={<ErrorOutlineIcon sx={{ fontSize: '14px !important' }} />}
                                label={srv.statusLabel || 'ऑफलाइन'}
                                size="small"
                                color="error"
                                variant="filled"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            )}
                          </TableCell>

                          {/* Latency */}
                          <TableCell>
                            {srv.latencyMs > 0 ? (
                              <Chip
                                label={`${srv.latencyMs} ms`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  bgcolor:
                                    srv.latencyMs < 300
                                      ? '#dcfce7'
                                      : srv.latencyMs < 1000
                                      ? '#fef3c7'
                                      : '#fee2e2',
                                  color:
                                    srv.latencyMs < 300
                                      ? '#15803d'
                                      : srv.latencyMs < 1000
                                      ? '#b45309'
                                      : '#b91c1c',
                                }}
                              />
                            ) : (
                              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                —
                              </Typography>
                            )}
                          </TableCell>

                          {/* Details Message */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.78rem' }}>
                              {srv.message}
                            </Typography>
                            {srv.compliance && (
                              <Chip
                                label={`⚖️ ${srv.compliance}`}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.4, height: 18, fontSize: '0.64rem', fontWeight: 700, color: '#0369a1', borderColor: '#bae6fd' }}
                              />
                            )}
                            {srv.lastChecked && (
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block' }}>
                                जांच: {new Date(srv.lastChecked).toLocaleTimeString('hi-IN')}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* ========================================================
          EXTERNAL API CONFIGURATION & HOT-PATCHING GUIDE
          ======================================================== */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3.5,
            border: '1px solid #cbd5e1',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TuneIcon sx={{ color: '#16a34a', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  ⚡ बाह्य API डायनामिक कॉन्फ़िगरेशन व लाइव समस्या निवारण (Zero-Hardcoding Guide)
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  मंडी, जेमिनी विज़न AI, मौसम व सरकारी पोर्टल्स के एंडपॉइंट, मॉडल कैस्केड व टाइमआउट बिना कोड बदले सीधे .env से प्रबंधित होते हैं।
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<BuildCircleIcon sx={{ fontSize: '15px !important' }} />}
              label="ज़ीरो-हार्डकोडिंग आर्किटेक्चर सक्रिय"
              size="small"
              sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.72rem' }}
            />
          </Box>

          <Grid container spacing={2}>
            {/* Mandi API Card */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.2,
                  borderRadius: 2.5,
                  borderColor: '#e2e8f0',
                  bgcolor: '#f8fafc',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      🌾 Agmarknet मंडी दर API (data.gov.in)
                    </Typography>
                    <Chip
                      label={externalConfig?.mandi?.isKeyConfigured ? '🟢 कुंजी सक्रिय' : '🟡 मानक संदर्भ मोड'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: externalConfig?.mandi?.isKeyConfigured ? '#dcfce7' : '#fef3c7',
                        color: externalConfig?.mandi?.isKeyConfigured ? '#15803d' : '#b45309',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>API कुंजी स्थिति:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {externalConfig?.mandi?.apiKeyMasked || '****'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Resource ID:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0369a1' }}>
                        {externalConfig?.mandi?.resourceId || '9ef84268...0070'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>टाइमआउट / लिमिट:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                        {externalConfig?.mandi?.timeoutMs || 8000} ms / {externalConfig?.mandi?.limit || 60} रिकॉर्ड्स
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>बैकअप मिरर:</Typography>
                      <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        Render Cloud Mirror (स्वतः सक्रिय)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Accordion disableGutters elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 36, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369a1' }}>
                      🛠️ त्रुटि समाधान व डिबगिंग निर्देश (.env)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155', mb: 0.5 }}>
                      • <strong>HTTP 401/403:</strong> <code>DATA_GOV_IN_API_KEY</code> को <code>.env</code> में बदलें।
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155', mb: 0.5 }}>
                      • <strong>HTTP 404 (कैटलॉग बदला):</strong> <code>DATA_GOV_IN_RESOURCE_ID</code> में नया ID डालें।
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155' }}>
                      • <strong>धीमा सर्वर:</strong> <code>MANDI_API_TIMEOUT_MS=12000</code> करें, विफल होने पर बैकअप मिरर दरें देगा।
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>

            {/* Gemini AI Card */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.2,
                  borderRadius: 2.5,
                  borderColor: '#e2e8f0',
                  bgcolor: '#f8fafc',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      🤖 Google Gemini विज़न AI (फसल डॉक्टर)
                    </Typography>
                    <Chip
                      label={externalConfig?.gemini?.isKeyConfigured ? '🟢 विज़न AI सक्रिय' : '🟡 लक्षण गाइड मोड'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: externalConfig?.gemini?.isKeyConfigured ? '#f3e8ff' : '#fef3c7',
                        color: externalConfig?.gemini?.isKeyConfigured ? '#7e22ce' : '#b45309',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>मॉडल कैस्केड (Fallback):</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
                        {(externalConfig?.gemini?.models || ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash']).join(' ➔ ')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>API कुंजी स्थिति:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {externalConfig?.gemini?.apiKeyMasked || '****'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>टाइमआउट / टेम्परेचर:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                        {externalConfig?.gemini?.timeoutMs || 16000} ms / {externalConfig?.gemini?.temperature ?? 0.15}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>ऑटो-रिकवरी:</Typography>
                      <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700 }}>
                        429/404 पर अगले मॉडल पर स्वतः स्विच
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Accordion disableGutters elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 36, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                      🛠️ त्रुटि समाधान व डिबगिंग निर्देश (.env)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155', mb: 0.5 }}>
                      • <strong>HTTP 429 (कोटा समाप्त):</strong> <code>GEMINI_API_KEY</code> में नई कुंजी डालें; प्रणाली स्वतः बैकअप मॉडल आज़माती है।
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155', mb: 0.5 }}>
                      • <strong>HTTP 404 (मॉडल रिटायर):</strong> <code>GEMINI_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite</code> अपडेट करें।
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155' }}>
                      • <strong>धीमा फोटो अपलोड:</strong> <code>GEMINI_API_TIMEOUT_MS=20000</code> तक बढ़ा सकते हैं।
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>

            {/* Weather Card */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.2,
                  borderRadius: 2.5,
                  borderColor: '#e2e8f0',
                  bgcolor: '#f8fafc',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      🌦️ Open-Meteo मौसम व वर्षा पूर्वानुमान
                    </Typography>
                    <Chip
                      label="🟢 लाइव सैटेलाइट"
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#e0f2fe', color: '#0369a1' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>एंडपॉइंट Base:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        api.open-meteo.com
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>टाइमआउट / कैशे नीति:</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                        {externalConfig?.weather?.timeoutMs || 5000} ms / 15-मिनट ब्राउज़र कैशे
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>पर्यावरण चर (.env):</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                        WEATHER_API_BASE_URL
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Accordion disableGutters elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 36, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0284c7' }}>
                      🛠️ त्रुटि समाधान व डिबगिंग निर्देश (.env)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155' }}>
                      • <strong>रेट लिमिट / ब्लॉक:</strong> ओपन-मीटियो में प्रति दिन 10,000 फ्री कॉल की सीमा है। यदि दर सीमित हो, तो <code>WEATHER_API_BASE_URL</code> में वैकल्पिक मौसम प्रदाता URL दर्ज करें।
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>

            {/* Government Portals Gateway Card */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.2,
                  borderRadius: 2.5,
                  borderColor: '#e2e8f0',
                  bgcolor: '#f8fafc',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      🏛️ सरकारी कृषि पोर्टल्स गेटवे (Gov Portals)
                    </Typography>
                    <Chip
                      label="🟢 5/5 पोर्टल्स लिंक"
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: '#f0fdf4', color: '#166534' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>एग्री-स्टैक / भुइयां:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        cgfr.agristack.gov.in / bhuiyan.cg.nic.in
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>खाद्य / पीएम-किसान / क्रेडा:</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        khadya.cg.nic.in / pmkisan / creda
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>पर्यावरण चर (.env):</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#166534' }}>
                        VITE_PORTAL_*_URL
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Accordion disableGutters elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 36, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534' }}>
                      🛠️ त्रुटि समाधान व डिबगिंग निर्देश (.env)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#334155' }}>
                      • <strong>पोर्टल डोमेन परिवर्तन:</strong> यदि विभाग नया URL जारी करता है, तो बिना कोड बदले केवल <code>.env</code> में <code>VITE_PORTAL_AGRISTACK_URL</code> या संबंधित चर अपडेट करें।
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>
          </Grid>

          {/* Hot-Patching Summary Banner */}
          <Box
            sx={{
              mt: 2.5,
              p: 1.8,
              borderRadius: 2.5,
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 24, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, lineHeight: 1.5 }}>
              <strong>हॉट-पैचिंग नियम (Zero Code Change):</strong> किसी भी बाह्य API में एंडपॉइंट, मॉडल या कुंजी बदलने के लिए कोड में कोई संपादन न करें। सीधे <code>.env</code> फ़ाइल में मान अपडेट करें और सर्वर पुनः लोड करें — किसान ऐप निर्बाध गति से कार्य करता रहेगा।
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

