import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Tooltip,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ForumIcon from '@mui/icons-material/Forum';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';

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

import { AdminLoginView } from './admin/AdminLoginView';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminMetricsModule } from './admin/AdminMetricsModule';
import { AdminBroadcastsModule } from './admin/AdminBroadcastsModule';
import { AdminFarmersModule } from './admin/AdminFarmersModule';
import { AdminMarketplaceModule } from './admin/AdminMarketplaceModule';
import { AdminCommunityModule } from './admin/AdminCommunityModule';
import { AdminSecurityModule } from './admin/AdminSecurityModule';
import { AdminConsoleLogDialog } from './admin/AdminConsoleLogDialog';

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

  // Auth State
  const [isAuth, setIsAuth] = useState(() => isAdminLoggedIn());
  const [passkey, setPasskey] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModule, setCurrentModule] = useState(0);

  // Platform Data states
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
  const [externalConfig, setExternalConfig] = useState(null);

  // Security & Error Audit Logs states (Zero-PII bounded stream)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditStats, setAuditStats] = useState({ total: 0, high: 0, medium: 0, low: 0, securityAlerts: 0, serverErrors: 0 });
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [copiedAuditReport, setCopiedAuditReport] = useState(false);
  const [selectedConsoleLog, setSelectedConsoleLog] = useState(null);

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

  // Load data when authenticated
  useEffect(() => {
    if (isAuth) {
      loadAllData();
    }
  }, [isAuth, loadAllData]);

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

  // 🔐 ADMIN LOGIN FULL-PAGE WORKSTATION
  if (!isAuth) {
    return (
      <AdminLoginView
        passkey={passkey}
        setPasskey={setPasskey}
        authError={authError}
        loading={loading}
        handleLogin={handleLogin}
        onExit={onExit}
      />
    );
  }

  // 🏢 DEDICATED ADMIN WORKSTATION LAYOUT
  const renderSidebar = () => (
    <AdminSidebar
      currentModule={currentModule}
      setCurrentModule={setCurrentModule}
      isDesktop={isDesktop}
      setMobileDrawerOpen={setMobileDrawerOpen}
      onExit={onExit}
      handleLogout={handleLogout}
      navModules={NAV_MODULES}
    />
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* Desktop Sidebar (Permanent) */}
      {isDesktop ? (
        <Box sx={{ width: 260, flexShrink: 0 }}>
          <Box sx={{ width: 260, position: 'fixed', top: 0, bottom: 0, zIndex: 1200 }}>
            {renderSidebar()}
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
          {renderSidebar()}
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
          {currentModule === 0 && (
            <AdminMetricsModule
              stats={stats}
              listings={listings}
              broadcasts={broadcasts}
              qaList={qaList}
              farmers={farmers}
              handleDeleteBroadcast={handleDeleteBroadcast}
            />
          )}

          {currentModule === 1 && (
            <AdminBroadcastsModule
              broadcasts={broadcasts}
              newBroadcast={newBroadcast}
              setNewBroadcast={setNewBroadcast}
              handleCreateBroadcast={handleCreateBroadcast}
              handleDeleteBroadcast={handleDeleteBroadcast}
              loading={loading}
            />
          )}

          {currentModule === 2 && (
            <AdminFarmersModule
              farmers={farmers}
              farmerSearch={farmerSearch}
              setFarmerSearch={setFarmerSearch}
              farmerDistrictFilter={farmerDistrictFilter}
              setFarmerDistrictFilter={setFarmerDistrictFilter}
              handleFilterFarmers={handleFilterFarmers}
            />
          )}

          {currentModule === 3 && (
            <AdminMarketplaceModule
              listings={listings}
              handleDeleteListing={handleDeleteListing}
            />
          )}

          {currentModule === 4 && (
            <AdminCommunityModule
              qaList={qaList}
              handleDeleteQA={handleDeleteQA}
            />
          )}

          {currentModule === 5 && (
            <AdminSecurityModule
              apiHealth={apiHealth}
              checkingApis={checkingApis}
              handleCheckApiHealth={handleCheckApiHealth}
              externalConfig={externalConfig}
              auditStats={auditStats}
              auditFilter={auditFilter}
              setAuditFilter={setAuditFilter}
              auditSearch={auditSearch}
              setAuditSearch={setAuditSearch}
              loadAuditLogs={loadAuditLogs}
              loadingAudit={loadingAudit}
              handleClearAudit={handleClearAudit}
              handleCopyAuditReport={handleCopyAuditReport}
              copiedAuditReport={copiedAuditReport}
              auditLogs={auditLogs}
              setSelectedConsoleLog={setSelectedConsoleLog}
              handleLogout={handleLogout}
              onExit={onExit}
            />
          )}

          {/* Technical Console Log & Stack Trace Terminal Modal */}
          <AdminConsoleLogDialog
            selectedConsoleLog={selectedConsoleLog}
            onClose={() => setSelectedConsoleLog(null)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPortal;
