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
  CircularProgress,
  Tooltip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';
import DnsIcon from '@mui/icons-material/Dns';
import PublicIcon from '@mui/icons-material/Public';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/Error';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import BugReportIcon from '@mui/icons-material/BugReport';

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
  checkAllApisHealth,
  getAdminExternalConfig,
  getAdminAuditLogs,
  clearAdminAuditLogs,
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

  // Live API Health Check states
  const [apiHealth, setApiHealth] = useState(null);
  const [checkingApis, setCheckingApis] = useState(false);
  const [apiFilter, setApiFilter] = useState('all');
  const [externalConfig, setExternalConfig] = useState(null);

  // Security & Error Audit Logs states (Zero-PII bounded stream)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditStats, setAuditStats] = useState({ total: 0, high: 0, medium: 0, low: 0, securityAlerts: 0, serverErrors: 0 });
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [copiedAuditReport, setCopiedAuditReport] = useState(false);

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
      const [statsData, broadcastsData, farmersData, listingsData, qaData, auditData] = await Promise.all([
        getAdminStats(),
        getAdminBroadcasts(),
        getAdminFarmers({ district: farmerDistrictFilter, search: farmerSearch }),
        getMarketplaceListings(),
        getCommunityQA(),
        getAdminAuditLogs({ severity: auditFilter, search: auditSearch }),
      ]);
      setStats(statsData);
      setBroadcasts(broadcastsData || []);
      setFarmers(farmersData || []);
      setListings(listingsData || []);
      setQaList(qaData || []);
      if (auditData && auditData.success) {
        setAuditLogs(auditData.logs || []);
        if (auditData.stats) setAuditStats(auditData.stats);
      }
    } catch (err) {
      console.warn('[Admin Portal Data Load Error]', err);
    } finally {
      setLoading(false);
    }
  }, [farmerDistrictFilter, farmerSearch, auditFilter, auditSearch]);

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

  const handleCheckApiHealth = useCallback(async () => {
    setCheckingApis(true);
    try {
      const [data, configData] = await Promise.all([
        checkAllApisHealth(),
        getAdminExternalConfig(),
      ]);
      setApiHealth(data);
      if (configData?.config) {
        setExternalConfig(configData.config);
      }
      if (data?.overallStatus === 'optimal') {
        notify.success('सभी एक्सटर्नल एपीआई एवं सेवाएं पूर्णतः सक्रिय हैं!');
      } else if (data?.overallStatus === 'degraded' || (data?.summary?.offline || 0) > 0) {
        notify.warning(`${data?.summary?.offline || 1} सेवाएं ऑफलाइन या पहुंच से बाहर पाई गईं।`);
      } else {
        notify.info('एपीआई कनेक्टिविटी स्वास्थ्य जांच पूर्ण हुई।');
      }
    } catch (err) {
      console.warn('[API Health Check Error]', err);
      notify.error('कनेक्टिविटी जांच में त्रुटि आई।');
    } finally {
      setCheckingApis(false);
    }
  }, []);

  // Security & Error Audit Log Handlers
  const loadAuditLogs = useCallback(async (filters = {}) => {
    setLoadingAudit(true);
    try {
      const activeSeverity = filters.severity !== undefined ? filters.severity : auditFilter;
      const activeType = filters.type !== undefined ? filters.type : 'all';
      const activeSearch = filters.search !== undefined ? filters.search : auditSearch;

      const data = await getAdminAuditLogs({
        severity: activeSeverity,
        type: activeType,
        search: activeSearch,
      });

      if (data && data.success) {
        setAuditLogs(data.logs || []);
        if (data.stats) setAuditStats(data.stats);
      }
    } catch (err) {
      console.warn('[Admin Audit Logs Load Error]', err);
    } finally {
      setLoadingAudit(false);
    }
  }, [auditFilter, auditSearch]);

  const handleClearAudit = async () => {
    if (!window.confirm('क्या आप सुरक्षा व सिस्टम ऑडिट लॉग्स साफ़ (Clear) करना चाहते हैं?')) return;
    const res = await clearAdminAuditLogs();
    if (res && res.success) {
      notify.success('ऑडिट लॉग्स सफलतापूर्वक साफ़ किए गए।');
      setAuditLogs([]);
      setAuditStats({ total: 0, high: 0, medium: 0, low: 0, securityAlerts: 0, serverErrors: 0 });
    } else {
      notify.error(res?.error || 'ऑडिट लॉग्स साफ़ करने में त्रुटि आई।');
    }
  };

  const handleCopyAuditReport = () => {
    try {
      const reportText = [
        `=== KISAN SAATHI SECURITY & ERROR AUDIT REPORT ===`,
        `Generated: ${new Date().toLocaleString('hi-IN')}`,
        `Total Events: ${auditStats.total} | Server Errors (500): ${auditStats.serverErrors || auditStats.high} | Security Alerts: ${auditStats.securityAlerts} | Minor/Warnings: ${auditStats.low}`,
        `--------------------------------------------------`,
        ...(auditLogs.length === 0
          ? ['[No active security threats or errors recorded]']
          : auditLogs.map(
              (log, i) =>
                `[${i + 1}] ${new Date(log.timestamp).toLocaleTimeString('hi-IN')} | [${(log.severity || 'INFO').toUpperCase()}] [${log.type}] Status: ${log.statusCode || 'N/A'} | IP: ${log.ipMasked} | Platform: ${log.platform} | Route: ${log.method || ''} ${log.endpoint || ''} | Msg: ${log.message}${log.technicalError ? ` | Technical: ${log.technicalError}` : ''}`
            )),
      ].join('\n');

      navigator.clipboard.writeText(reportText);
      setCopiedAuditReport(true);
      notify.success('ऑडिट रिपोर्ट क्लिपबोर्ड में कॉपी की गई!');
      setTimeout(() => setCopiedAuditReport(false), 3000);
    } catch {
      notify.error('रिपोर्ट कॉपी करने में विफल।');
    }
  };

  // Auto-run API health check & audit logs on entering Module 5
  useEffect(() => {
    if (isAuth && currentModule === 5) {
      if (!apiHealth && !checkingApis) {
        handleCheckApiHealth();
      }
      loadAuditLogs();
    }
  }, [isAuth, currentModule, apiHealth, checkingApis, handleCheckApiHealth, loadAuditLogs]);





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
                        {stats?.totalFarmers !== undefined && stats?.totalFarmers !== null ? stats.totalFarmers : (stats?.isOffline ? '—' : 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#3b82f6' }}>
                        {stats?.isOffline ? 'सर्वर ऑफ़लाइन' : 'सत्यापित खाते'}
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
                        {stats?.totalAcres !== undefined && stats?.totalAcres !== null ? stats.totalAcres : (stats?.isOffline ? '—' : 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#22c55e' }}>
                        {stats?.isOffline ? 'डेटाबेस डिस्कनेक्टेड' : 'लाइव पंजीकृत खेत'}
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
                        {listings ? listings.length : 0}
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
                        {broadcasts ? broadcasts.length : 0}
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
                        {qaList ? qaList.length : 0}
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

                    {/* Weather & Portals Card */}
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
