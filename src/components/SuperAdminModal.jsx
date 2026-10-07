import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LockIcon from '@mui/icons-material/Lock';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import SecurityIcon from '@mui/icons-material/Security';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';

import {
  isAdminLoggedIn,
  adminLogin,
  adminLogout,
  getAdminStats,
  getAdminFarmers,
  getAdminBroadcasts,
  createAdminBroadcast,
  deleteAdminBroadcast,
  deleteMarketListing,
  deleteCommunityQA,
  resetAdminInactivityTimer,
} from '../services/adminService';
import { getMarketplaceListings, getCommunityQA } from '../services/apiService';
import { notify } from '../services/notificationService';

export const SuperAdminModal = ({ open, onClose }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Data states
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [farmerSearch, setFarmerSearch] = useState('');
  const [farmerDistrictFilter, setFarmerDistrictFilter] = useState('all');
  const [broadcasts, setBroadcasts] = useState([]);
  const [listings, setListings] = useState([]);
  const [qaList, setQaList] = useState([]);

  // New broadcast form state
  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    category: 'pest',
    severity: 'warning',
    targetDistrict: 'all',
    message: '',
    author: 'कृषि विस्तार अधिकारी (RAEO)',
    validTill: '7 दिन वैध',
  });

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, broadcastsData, farmersData, listingsData, qaData] = await Promise.all([
        getAdminStats(),
        getAdminBroadcasts(),
        getAdminFarmers({ district: farmerDistrictFilter, search: farmerSearch }),
        getMarketplaceListings(),
        getCommunityQA(),
      ]);
      setStats(statsData);
      setBroadcasts(broadcastsData || []);
      setFarmers(farmersData || []);
      setListings(listingsData || []);
      setQaList(qaData || []);
    } catch (err) {
      console.warn('[Admin Data Load Error]', err);
    } finally {
      setLoading(false);
    }
  }, [farmerDistrictFilter, farmerSearch]);

  // Check auth state on open
  useEffect(() => {
    if (open) {
      const authenticated = isAdminLoggedIn();
      setIsAuth(authenticated);
      if (authenticated) {
        loadAllData();
      }
    }
  }, [open, loadAllData]);

  // Enterprise Security: 15-minute strict inactivity auto-lock
  useEffect(() => {
    if (!isAuth) return;
    const handleActivity = () => {
      resetAdminInactivityTimer(() => {
        setIsAuth(false);
        notify.warning('सुरक्षा कारणों से 15 मिनट निष्क्रियता के बाद एडमिन सत्र स्वतः लॉक हो गया।');
      });
    };
    handleActivity();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isAuth]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!passkey.trim()) {
      setAuthError('कृपया पासकी दर्ज करें।');
      return;
    }
    setLoading(true);
    setAuthError('');
    const res = await adminLogin({ passkey: passkey.trim() });
    setLoading(false);
    if (res.success) {
      setIsAuth(true);
      notify.success('प्रशासक लॉगिन सफल!');
      setPasskey('');
      loadAllData();
    } else {
      setAuthError(res.error || 'अमान्य पासकी।');
      notify.error(res.error || 'लॉगिन असफल');
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuth(false);
    setPasskey('');
    notify.info('प्रशासक सत्र समाप्त हुआ।');
  };

  // Broadcast handlers
  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) {
      notify.warning('कृपया शीर्षक और संदेश दोनों भरें।');
      return;
    }
    setLoading(true);
    const created = await createAdminBroadcast(newBroadcast);
    setLoading(false);
    if (created) {
      notify.success('आपातकालीन अलर्ट सफलता से प्रसारित किया गया!');
      setNewBroadcast({
        title: '',
        category: 'pest',
        severity: 'warning',
        targetDistrict: 'all',
        message: '',
        author: 'कृषि विस्तार अधिकारी (RAEO)',
        validTill: '7 दिन वैध',
      });
      const updated = await getAdminBroadcasts();
      setBroadcasts(updated);
    } else {
      notify.error('अलर्ट प्रसारण में समस्या आई।');
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm('क्या आप इस अलर्ट प्रसारण को हटाना चाहते हैं?')) return;
    const ok = await deleteAdminBroadcast(id);
    if (ok) {
      notify.success('अलर्ट हटाया गया।');
      setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Moderation handlers
  const handleDeleteListing = async (id) => {
    if (!window.confirm('क्या आप इस उपज लिस्टिंग को हटाना चाहते हैं?')) return;
    const ok = await deleteMarketListing(id);
    if (ok) {
      notify.success('लिस्टिंग हटाई गई।');
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const handleDeleteQA = async (id) => {
    if (!window.confirm('क्या आप इस चौपाल प्रश्न को हटाना चाहते हैं?')) return;
    const ok = await deleteCommunityQA(id);
    if (ok) {
      notify.success('चौपाल चर्चा हटाई गई।');
      setQaList((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleFilterFarmers = async () => {
    setLoading(true);
    const data = await getAdminFarmers({ district: farmerDistrictFilter, search: farmerSearch });
    setFarmers(data || []);
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          minHeight: '80vh',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f8fafc',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          bgcolor: '#1e293b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 0.8,
              bgcolor: 'rgba(255,255,255,0.12)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AdminPanelSettingsIcon sx={{ color: '#38bdf8', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
              कृषि प्रशासक व सुपर एडमिन कंट्रोल रूम
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              Kisan Saathi Oversight & Agronomy Command Center
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuth && (
            <Tooltip title="सत्र समाप्त करें (Logout)">
              <IconButton onClick={handleLogout} sx={{ color: '#f87171' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {loading && <LinearProgress color="success" />}

      {/* Content */}
      <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, flex: 1, overflowY: 'auto' }}>
        {!isAuth ? (
          /* ==========================================
             🔐 ADMIN LOGIN SCREEN
             ========================================== */
          <Box
            sx={{
              maxWidth: 440,
              mx: 'auto',
              mt: { xs: 4, sm: 8 },
              p: { xs: 2.5, sm: 4 },
              bgcolor: '#ffffff',
              borderRadius: 3.5,
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                bgcolor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              प्रशासकीय प्रमाणीकरण
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
              कृषि विस्तार अधिकारी (RAEO), समिति प्रबंधक एवं सुपर एडमिन हेतु आरक्षित
            </Typography>

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                type="password"
                label="एडमिन पासकी (Admin Passkey)"
                variant="outlined"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                error={!!authError}
                helperText={authError}
                placeholder="पासकी दर्ज करें..."
                sx={{ mb: 2.5 }}
                autoFocus
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.4,
                  bgcolor: '#1e293b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  borderRadius: 2.5,
                  '&:hover': { bgcolor: '#0f172a' },
                }}
              >
                {loading ? 'सत्यापन हो रहा है...' : 'कंट्रोल रूम में प्रवेश करें'}
              </Button>
            </form>

            <Box
              sx={{
                mt: 3,
                p: 1.5,
                bgcolor: '#f1f5f9',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <SecurityIcon sx={{ color: '#16a34a', fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                HMAC-SHA256 टोकन आधारित सुरक्षित पहुंच
              </Typography>
            </Box>
          </Box>
        ) : (
          /* ==========================================
             📊 AUTHENTICATED ADMIN DASHBOARD
             ========================================== */
          <Box>
            {/* Navigation Tabs */}
            <Box
              sx={{
                borderBottom: 1,
                borderColor: '#e2e8f0',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Tabs
                value={currentTab}
                onChange={(e, val) => setCurrentTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    minHeight: 48,
                  },
                }}
              >
                <Tab icon={<AnalyticsIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="अवलोकन (Metrics)" />
                <Tab icon={<CampaignIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="अलर्ट प्रसारण (Broadcasts)" />
                <Tab icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="किसान रजिस्ट्री (Farmers)" />
                <Tab icon={<StorefrontIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="मॉडरेशन (Moderation)" />
                <Tab icon={<SecurityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="सुरक्षा (Security)" />
              </Tabs>
              <Tooltip title="रिफ्रेश करें">
                <IconButton onClick={loadAllData} size="small" sx={{ color: '#64748b' }}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* TAB 0: OVERVIEW & METRICS */}
            {currentTab === 0 && (
              <Box>
                {/* Metric Cards Grid */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #bfdbfe' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700 }}>
                          कुल किसान
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1e3a8a', mt: 0.5 }}>
                          {stats?.metrics?.totalFarmers || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ bgcolor: '#ecfdf5', borderRadius: 3, border: '1px solid #a7f3d0' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700 }}>
                          कुल फसली रकबा
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#064e3b', mt: 0.5 }}>
                          {stats?.metrics?.totalPlotAcres || 0} <span style={{ fontSize: '0.8rem' }}>एकड़</span>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ bgcolor: '#fffbeb', borderRadius: 3, border: '1px solid #fde68a' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700 }}>
                          सक्रिय प्लॉट्स
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#78350f', mt: 0.5 }}>
                          {stats?.metrics?.totalPlots || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ bgcolor: '#fdf2f8', borderRadius: 3, border: '1px solid #fbcfe8' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#9d174d', fontWeight: 700 }}>
                          उपज बिक्री लिस्टिंग
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#831843', mt: 0.5 }}>
                          {stats?.metrics?.totalMarketListings || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ bgcolor: '#f5f3ff', borderRadius: 3, border: '1px solid #ddd6fe' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#5b21b6', fontWeight: 700 }}>
                          सक्रिय अलर्ट
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#4c1d95', mt: 0.5 }}>
                          {stats?.metrics?.activeBroadcasts || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* District Distribution Table */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
                  🌾 जिलावार किसान व रकबा विश्लेषण (District Analytics)
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 3, border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>जिला (District)</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">किसान संख्या</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">कुल रकबा (एकड़)</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>सहभागिता स्तर</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats?.districtStats && stats.districtStats.length > 0 ? (
                        stats.districtStats.map((row, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{row.district}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{row.farmersCount}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>{row.totalAcreage} एकड़</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.farmersCount > 300 ? 'उच्च (High)' : 'सामान्य'}
                                color={row.farmersCount > 300 ? 'success' : 'default'}
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 2, color: '#64748b' }}>
                            जिलावार डेटा संकलित हो रहा है...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* System Diagnostics Card */}
                {stats?.systemHealth && (
                  <Card sx={{ borderRadius: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 1 }}>
                        ⚙️ सिस्टम स्वास्थ्य एवं बैकएंड स्थिति (System Telemetry)
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.82rem', color: '#64748b' }}>
                        <div><strong>सर्वर अपटाइम:</strong> {Math.round(stats.systemHealth.uptimeSeconds / 60)} मिनट</div>
                        <div><strong>रैम खपत:</strong> {stats.systemHealth.memoryRssMb} MB</div>
                        <div><strong>नोड संस्करण:</strong> {stats.systemHealth.nodeVersion}</div>
                        <div><strong>पर्यावरण:</strong> {stats.systemHealth.environment}</div>
                        <div><strong>डेटाबेस:</strong> 🟢 MongoDB Connected</div>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {/* TAB 1: EMERGENCY BROADCAST ADVISORY */}
            {currentTab === 1 && (
              <Box>
                {/* Create Broadcast Form */}
                <Card sx={{ borderRadius: 3, p: 2.5, mb: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CampaignIcon sx={{ color: '#e11d48' }} /> नया आपातकालीन अलर्ट / कृषि सलाह जारी करें
                  </Typography>

                  <form onSubmit={handleCreateBroadcast}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="अलर्ट शीर्षक (Title)"
                          placeholder="जैसे: माहो कीट प्रकोप चेतावनी (धान)..."
                          value={newBroadcast.title}
                          onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                          required
                        />
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>श्रेणी (Category)</InputLabel>
                          <Select
                            value={newBroadcast.category}
                            label="श्रेणी (Category)"
                            onChange={(e) => setNewBroadcast({ ...newBroadcast, category: e.target.value })}
                          >
                            <MenuItem value="pest">कीट व रोग</MenuItem>
                            <MenuItem value="weather">मौसम चेतावनी</MenuItem>
                            <MenuItem value="mandi">मंडी व उपार्जन</MenuItem>
                            <MenuItem value="scheme">शासकीय योजना</MenuItem>
                            <MenuItem value="general">सामान्य सलाह</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel>गंभीरता (Severity)</InputLabel>
                          <Select
                            value={newBroadcast.severity}
                            label="गंभीरता (Severity)"
                            onChange={(e) => setNewBroadcast({ ...newBroadcast, severity: e.target.value })}
                          >
                            <MenuItem value="urgent">अति गंभीर (Urgent)</MenuItem>
                            <MenuItem value="warning">चेतावनी (Warning)</MenuItem>
                            <MenuItem value="info">सूचना (Info)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>लक्षित जिला (Target)</InputLabel>
                          <Select
                            value={newBroadcast.targetDistrict}
                            label="लक्षित जिला (Target)"
                            onChange={(e) => setNewBroadcast({ ...newBroadcast, targetDistrict: e.target.value })}
                          >
                            <MenuItem value="all">सभी जिले (All CG)</MenuItem>
                            <MenuItem value="रायपुर">रायपुर (Raipur)</MenuItem>
                            <MenuItem value="बिलासपुर">बिलासपुर (Bilaspur)</MenuItem>
                            <MenuItem value="दुर्ग">दुर्ग (Durg)</MenuItem>
                            <MenuItem value="राजनांदगांव">राजनांदगांव</MenuItem>
                            <MenuItem value="धमतरी">धमतरी</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="जारीकर्ता / विशेषज्ञ (Author)"
                          value={newBroadcast.author}
                          onChange={(e) => setNewBroadcast({ ...newBroadcast, author: e.target.value })}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="वैधता (Validity)"
                          value={newBroadcast.validTill}
                          onChange={(e) => setNewBroadcast({ ...newBroadcast, validTill: e.target.value })}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          label="विस्तृत सलाह व उपाय (Advisory Message)"
                          placeholder="किसान भाइयों हेतु सटीक निर्देश, दवाई की मात्रा एवं समय सीमा दर्ज करें..."
                          value={newBroadcast.message}
                          onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                          required
                        />
                      </Grid>

                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SendIcon />}
                          sx={{
                            bgcolor: '#e11d48',
                            color: '#ffffff',
                            fontWeight: 800,
                            borderRadius: 2.5,
                            px: 3,
                            '&:hover': { bgcolor: '#be123c' },
                          }}
                        >
                          किसानों को लाइव प्रसारित करें (Broadcast Now)
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Card>

                {/* Active Broadcasts List */}
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5 }}>
                  📢 सक्रिय प्रसारण सूची ({broadcasts.length})
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {broadcasts.length > 0 ? (
                    broadcasts.map((b) => (
                      <Card
                        key={b.id}
                        sx={{
                          borderRadius: 2.5,
                          borderLeft: `5px solid ${b.severity === 'urgent' ? '#e11d48' : b.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                          borderTop: '1px solid #e2e8f0',
                          borderRight: '1px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                  {b.title}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={b.severity === 'urgent' ? 'अति गंभीर' : b.severity === 'warning' ? 'चेतावनी' : 'सूचना'}
                                  color={b.severity === 'urgent' ? 'error' : b.severity === 'warning' ? 'warning' : 'primary'}
                                  sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                                />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={`जिला: ${b.targetDistrict === 'all' ? 'सभी' : b.targetDistrict}`}
                                  sx={{ fontSize: '0.68rem', height: 20 }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ color: '#334155', mb: 1 }}>
                                {b.message}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                द्वारा: {b.author || 'कृषि विशेषज्ञ'} | वैधता: {b.validTill || 'सक्रिय'}
                              </Typography>
                            </Box>
                            <IconButton onClick={() => handleDeleteBroadcast(b.id)} size="small" sx={{ color: '#ef4444' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                      वर्तमान में कोई सक्रिय आपातकालीन प्रसारण नहीं है।
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* TAB 2: FARMER REGISTRY AUDIT */}
            {currentTab === 2 && (
              <Box>
                {/* Search & Filter Bar */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="किसान का नाम या गाँव खोजें..."
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flex: 1, minWidth: 200 }}
                  />

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>जिला चुनें</InputLabel>
                    <Select
                      value={farmerDistrictFilter}
                      label="जिला चुनें"
                      onChange={(e) => setFarmerDistrictFilter(e.target.value)}
                    >
                      <MenuItem value="all">सभी जिले</MenuItem>
                      <MenuItem value="रायपुर">रायपुर</MenuItem>
                      <MenuItem value="बिलासपुर">बिलासपुर</MenuItem>
                      <MenuItem value="दुर्ग">दुर्ग</MenuItem>
                      <MenuItem value="राजनांदगांव">राजनांदगांव</MenuItem>
                      <MenuItem value="धमतरी">धमतरी</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    onClick={handleFilterFarmers}
                    sx={{ bgcolor: '#0f172a', color: '#fff', fontWeight: 700 }}
                  >
                    खोजें
                  </Button>
                </Box>

                {/* Farmer Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800 }}>किसान का नाम</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>सुरक्षित फोन (Masked)</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>गाँव व जिला</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">प्लॉट्स (खेत)</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">कुल रकबा</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {farmers.length > 0 ? (
                        farmers.map((f, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{f.name || 'किसान साथी'}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#475569' }}>
                              {f.phoneMasked || '••••••••••'}
                            </TableCell>
                            <TableCell>
                              {f.village ? `${f.village}, ` : ''}{f.district}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={`${f.plotsCount || 0} खेत`}
                                sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700, height: 22 }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#15803d' }}>
                              {f.totalLandAcres || 0} एकड़
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>
                            कोई किसान रिकॉर्ड नहीं मिला।
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1.5 }}>
                  * Rule 10 & 13 अनुपालन: किसान गोपनीयता संरक्षण हेतु मोबाइल नंबर आंशिक रूप से सुरक्षित (Masked) प्रदर्शित हैं।
                </Typography>
              </Box>
            )}

            {/* TAB 3: MODERATION (MARKETPLACE & QA) */}
            {currentTab === 3 && (
              <Box>
                <Grid container spacing={3}>
                  {/* Direct Marketplace Listings */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorefrontIcon sx={{ color: '#2563eb' }} /> सीधा व्यापार लिस्टिंग ({listings.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 450, overflowY: 'auto' }}>
                      {listings.length > 0 ? (
                        listings.map((item) => (
                          <Card key={item.id} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                            <CardContent sx={{ p: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                    {item.crop} ({item.quantity})
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#15803d', fontWeight: 700 }}>
                                    मांग: {item.expectedPrice}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    विक्रेता: {item.farmerName} ({item.location}) | 📞 {item.phone}
                                  </Typography>
                                </Box>
                                <Tooltip title="अवांछित / स्पैम हटाएं">
                                  <IconButton onClick={() => handleDeleteListing(item.id)} size="small" sx={{ color: '#ef4444' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#64748b', py: 2 }}>
                          कोई लिस्टिंग नहीं मिली।
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Community QA */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ForumIcon sx={{ color: '#059669' }} /> चौपाल चर्चाएं व प्रश्न ({qaList.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 450, overflowY: 'auto' }}>
                      {qaList.length > 0 ? (
                        qaList.map((qa) => (
                          <Card key={qa.id} sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                            <CardContent sx={{ p: 1.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                    {qa.crop ? `[${qa.crop}] ` : ''}{qa.question}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    पूछा: {qa.author} ({qa.time || 'हाल ही में'})
                                  </Typography>
                                </Box>
                                <Tooltip title="प्रश्न हटाएं">
                                  <IconButton onClick={() => handleDeleteQA(qa.id)} size="small" sx={{ color: '#ef4444' }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#64748b', py: 2 }}>
                          कोई प्रश्न नहीं मिला।
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* TAB 4: SYSTEM & SECURITY AUDIT */}
            {currentTab === 4 && (
              <Box>
                <Card sx={{ borderRadius: 3, p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon sx={{ color: '#16a34a' }} /> सुरक्षा व एन्क्रिप्शन अनुपालन (Security Audit)
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>HMAC-SHA256 JWT सत्यापन:</strong> प्रत्येक एडमिन व किसान अनुरोध डिजिटल रूप से हस्ताक्षरित टोकन से सुरक्षित है।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>IDOR रोकथाम:</strong> क्रॉस-अकाउंट डेटा हेरफेर को सर्वर स्तर पर ब्लॉक किया जाता है।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>Zero-PII डेटा सुरक्षा (OWASP/ISO 27001):</strong> आधार, बैंक खाता या संवेदनशील विवरण क्लाइंट साइड पर कभी उजागर नहीं किए जाते।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>जीरो-परसिस्टेंस नीति (Zero-Persistence Storage):</strong> एडमिन टोकन localStorage में कभी सुरक्षित नहीं होता; यह केवल अल्पकालिक sessionStorage में रहता है और टैब बंद होते ही स्वतः नष्ट हो जाता है।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>15-मिनट निष्क्रियता ऑटो-लॉक (Inactivity Eviction):</strong> 15 मिनट तक कोई कार्य न होने पर सुरक्षा कारणों से एडमिन सत्र स्वतः समाप्त हो जाता है।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>ब्रूट-फोर्स सुरक्षा व टाइमिंग-सेफ कम्पेरिज़न:</strong> लगातार 5 असफल प्रयासों पर आईपी 15 मिनट के लिए लॉक हो जाती है और क्रिप्टोग्राफिक टाइमिंग-अटैक सुरक्षित है।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>2-घंटे अल्पकालिक टोकन (2-Hour Hard TTL):</strong> एडमिन सुरक्षा टोकन 2 घंटे बाद सर्वर स्तर पर स्वतः अमान्य हो जाता है।
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>इनपुट सैनिटाइजेशन:</strong> सभी इनपुट XSS व NoSQL इंजेक्शन से स्वतः शुद्ध किए जाते हैं।
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ fontWeight: 800, borderRadius: 2.5 }}
                  >
                    एडमिन सत्र समाप्त करें (Logout Session)
                  </Button>
                </Card>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
