import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
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
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';

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
import { appConfig } from '../config/appConfig';

const NAV_MODULES = [
  { id: 0, label: 'मुख्य सांख्यिकी (Metrics)', icon: AnalyticsIcon },
  { id: 1, label: 'आपातकालीन प्रसारण (Broadcasts)', icon: CampaignIcon },
  { id: 2, label: 'किसान व फसल रजिस्ट्री (Farmers)', icon: PeopleIcon },
  { id: 3, label: 'मंडी उपज मॉडरेशन (Marketplace)', icon: StorefrontIcon },
  { id: 4, label: 'चौपाल मंच मॉडरेशन (Community)', icon: ForumIcon },
  { id: 5, label: 'सुरक्षा व सिस्टम ऑडिट (Security)', icon: SecurityIcon },
];

export const AdminPortal = ({ onExit }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [isAuth, setIsAuth] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState(0);

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
      console.warn('[Admin Portal Data Load Error]', err);
    } finally {
      setLoading(false);
    }
  }, [farmerDistrictFilter, farmerSearch]);

  // Check auth state on mount
  useEffect(() => {
    const authenticated = isAdminLoggedIn();
    setIsAuth(authenticated);
    if (authenticated) {
      loadAllData();
    }
  }, [loadAllData]);

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
      notify.success('कृषि प्रशासन पोर्टल में आपका स्वागत है!');
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
    notify.info('प्रशासक सत्र सुरक्षित समाप्त हुआ।');
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
    if (!window.confirm('क्या आप इस चौपाल चर्चा को हटाना चाहते हैं?')) return;
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

  // ==========================================
  // 🔐 ADMIN LOGIN FULL-PAGE WORKSTATION
  // ==========================================
  if (!isAuth) {
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
  }

  // ==========================================
  // 🏢 DEDICATED ADMIN WORKSTATION LAYOUT
  // ==========================================
  const renderSidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1e293b', color: '#ffffff' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box
          sx={{
            p: 0.8,
            bgcolor: 'rgba(56, 189, 248, 0.15)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AgricultureIcon sx={{ color: '#38bdf8', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
            कृषि प्रशासन कक्ष
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            {appConfig.stateName} Agritech Command
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_MODULES.map((mod) => {
          const IconComp = mod.icon;
          const isSelected = currentModule === mod.id;
          return (
            <ListItem key={mod.id} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  setCurrentModule(mod.id);
                  if (!isDesktop) setMobileDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.1,
                  px: 1.8,
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  bgcolor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255,255,255,0.04)',
                    color: '#ffffff',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <IconComp sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={mod.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.86rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#0f172a' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ShieldIcon sx={{ color: '#22c55e', fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            सत्र सुरक्षित (15m Auto-Lock)
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={onExit}
          sx={{
            color: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.2)',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 2,
            mb: 1,
            '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          🌾 किसान पोर्टल पर जाएं
        </Button>
        <Button
          fullWidth
          variant="contained"
          size="small"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          लॉगआउट (Logout)
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* Desktop Sidebar (Permanent) */}
      {isDesktop ? (
        <Box sx={{ width: 260, flexShrink: 0 }}>
          <Box sx={{ width: 260, position: 'fixed', top: 0, bottom: 0, zIndex: 1200 }}>
            {renderSidebarContent()}
          </Box>
        </Box>
      ) : (
        /* Mobile / Tablet Drawer */
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{ sx: { width: 270, bgcolor: '#1e293b' } }}
        >
          {renderSidebarContent()}
        </Drawer>
      )}

      {/* Main Workstation View Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        {/* Top Sticky Admin Navbar */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            px: { xs: 2, sm: 3, md: 4 },
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {!isDesktop && (
              <IconButton onClick={() => setMobileDrawerOpen(true)} sx={{ color: '#334155' }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                {NAV_MODULES[currentModule].label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: { xs: 'none', sm: 'block' } }}>
                कृषि विस्तार एवं डिजिटल निगरानी केंद्र • {appConfig.stateName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="लाइव आंकड़े रीफ़्रेश करें">
              <IconButton onClick={loadAllData} sx={{ color: '#475569', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={onExit}
              sx={{
                color: '#1b5e20',
                borderColor: '#a5d6a7',
                fontWeight: 800,
                fontSize: '0.75rem',
                borderRadius: 2,
                display: { xs: 'none', sm: 'inline-flex' },
                '&:hover': { bgcolor: '#e8f5e9', borderColor: '#2e7d32' },
              }}
            >
              किसान ऐप
            </Button>

            <Tooltip title="लॉगआउट करें">
              <IconButton onClick={handleLogout} sx={{ color: '#ef4444', bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && <LinearProgress color="info" />}

        {/* Workstation Content Canvas */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1600px',
            width: '100%',
            mx: 'auto',
          }}
        >
          {/* ========================================================
              MODULE 0: EXECUTIVE OVERVIEW & PLATFORM METRICS
              ======================================================== */}
          {currentModule === 0 && (
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
                        {stats?.totalFarmers || '1,248'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                        +14 आज नए
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
                        {stats?.totalAcres || '4,820'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#22c55e' }}>
                        94% धान/खरीफ
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
                        {listings.length || '38'}
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
                        {broadcasts.length || '3'}
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
                        {qaList.length || '82'}
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
          )}

          {/* ========================================================
              MODULE 1: EMERGENCY BROADCAST ADVISORIES
              ======================================================== */}
          {currentModule === 1 && (
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
          )}

          {/* ========================================================
              MODULE 2: FARMERS DATABASE & CROP REGISTRY
              ======================================================== */}
          {currentModule === 2 && (
            <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              {/* Filter Strip */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 280 }}>
                  <TextField
                    placeholder="किसान का नाम, गांव या फसल से खोजें..."
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>जिला फिल्टर</InputLabel>
                    <Select
                      value={farmerDistrictFilter}
                      label="जिला फिल्टर"
                      onChange={(e) => setFarmerDistrictFilter(e.target.value)}
                    >
                      <MenuItem value="all">समस्त जिले</MenuItem>
                      <MenuItem value="रायपुर">रायपुर</MenuItem>
                      <MenuItem value="दुर्ग">दुर्ग</MenuItem>
                      <MenuItem value="बिलासपुर">बिलासपुर</MenuItem>
                      <MenuItem value="राजनांदगांव">राजनांदगांव</MenuItem>
                      <MenuItem value="जांजगीर-चांपा">जांजगीर-चांपा</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Button variant="contained" onClick={handleFilterFarmers} sx={{ bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2 }}>
                  फ़िल्टर लागू करें
                </Button>
              </Box>

              {/* Farmers Table */}
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5 }}>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>किसान का नाम व संपर्क</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>ज़िला व गांव</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>कुल रकबा</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>मुख्य फसल व अवस्था</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>KCC ऋण स्थिति</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>स्थिति</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {farmers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                          कोई किसान रिकॉर्ड नहीं मिला।
                        </TableCell>
                      </TableRow>
                    ) : (
                      farmers.map((f) => (
                        <TableRow key={f.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {f.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {f.phone ? `📱 ${f.phone}` : 'फोन उपलब्ध नहीं'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#334155' }}>
                              {f.district}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {f.village || 'ग्राम पंचायत'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={`${f.acres} एकड़`} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534' }}>
                              {f.crop}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              {f.stage || 'कल्ले फूटने की अवस्था'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: f.kccApproved ? '#16a34a' : '#ea580c' }}>
                              {f.kccApproved ? '₹1,50,000 स्वीकृत' : 'लंबित'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                              label="सत्यापित"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* ========================================================
              MODULE 3: MARKETPLACE MODERATION
              ======================================================== */}
          {currentModule === 3 && (
            <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    🏪 सीधी खरीद-बिक्री मंडी मॉडरेशन ({listings.length})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    अनुचित या भ्रामक पोस्ट्स को हटाएं ताकि किसान सुरक्षित व्यापार कर सकें
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                {listings.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
                      कोई लिस्टिंग उपलब्ध नहीं है।
                    </Typography>
                  </Grid>
                ) : (
                  listings.map((l) => (
                    <Grid item xs={12} sm={6} md={4} key={l.id}>
                      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Chip label={l.crop} size="small" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800 }} />
                            <IconButton size="small" color="error" onClick={() => handleDeleteListing(l.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                            {l.variety || l.crop} • {l.quantity}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1b5e20', my: 0.5 }}>
                            ₹{l.pricePerQuintal || l.price}/क्विंटल
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                            📍 {l.district} • {l.sellerName} ({l.phone})
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Paper>
          )}

          {/* ========================================================
              MODULE 4: COMMUNITY FORUM MODERATION
              ======================================================== */}
          {currentModule === 4 && (
            <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                💬 किसान चौपाल मंच मॉडरेशन ({qaList.length})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
                समुदाय में पूछे गए प्रश्नों और मशीनरी रेंटल पोस्ट्स का निरीक्षण करें
              </Typography>

              <Grid container spacing={2}>
                {qaList.map((q) => (
                  <Grid item xs={12} md={6} key={q.id}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Chip label={q.crop || 'कृषि चर्चा'} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }} />
                          <IconButton size="small" color="error" onClick={() => handleDeleteQA(q.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                          {q.question}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                          पूछा: {q.author} ({q.district}) • {q.answers?.length || 0} उत्तर
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* ========================================================
              MODULE 5: PLATFORM SECURITY & AUDIT TRAIL
              ======================================================== */}
          {currentModule === 5 && (
            <Grid container spacing={3}>
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
                          <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>हेल्पलाइन</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{appConfig.helpline.label}</TableCell>
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
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPortal;
