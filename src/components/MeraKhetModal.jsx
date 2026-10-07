import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Grid,
  Divider,
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { notify } from '../services/notificationService';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PinDropIcon from '@mui/icons-material/PinDrop';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { fetchVillagesByPincode } from '../services/pincodeService';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScienceIcon from '@mui/icons-material/Science';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PrintIcon from '@mui/icons-material/Print';
import { generateAndPrintKccReport } from '../utils/printReportHelper';

import {
  getActiveFarmer,
  loginFarmer,
  logoutFarmer,
  getFarmerPlots,
  saveFarmerPlot,
  deleteFarmerPlot,
  togglePlotTask
} from '../services/farmerService';
import {
  CROP_LIFECYCLE_RULES,
  analyzePlotLifecycle
} from '../utils/cropLifecycleEngine';
import { getFertilizers, getCachedModuleData } from '../services/apiService';
import { speakText, stopSpeech } from '../utils/speech';
import { fetchLiveWeather } from '../services/weatherService';
import { appConfig } from '../config/appConfig';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { MotorControllerModal } from './MotorControllerModal';
import { useLanguage } from '../utils/i18n';

export const MeraKhetModal = ({ open, onClose, selectedDistrict = 'रायपुर', weatherContext }) => {
  const { isChhattisgarhi } = useLanguage();
  const [farmer, setFarmer] = useState(getActiveFarmer());
  const [plots, setPlots] = useState([]);
  const [activePlotIndex, setActivePlotIndex] = useState(0);
  const [openAddPlotDialog, setOpenAddPlotDialog] = useState(false);
  const [openGpsTracker, setOpenGpsTracker] = useState(false);
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [fertData, setFertData] = useState(() => {
    const cached = getCachedModuleData('fertilizers');
    return cached && cached.data ? cached.data : null;
  });

  useEffect(() => {
    let isMounted = true;
    getFertilizers().then((data) => {
      if (isMounted && data && Object.keys(data).length > 0) setFertData(data);
    });
    return () => { isMounted = false; };
  }, []);
  const [openMotorModal, setOpenMotorModal] = useState(false);
  const [liveWeather, setLiveWeather] = useState(weatherContext || null);

  useEffect(() => {
    if (open) {
      if (weatherContext) {
        setLiveWeather(weatherContext);
      } else {
        fetchLiveWeather(selectedDistrict).then((w) => setLiveWeather(w));
      }
    }
  }, [open, selectedDistrict, weatherContext]);

  const handleModalClose = () => {
    stopSpeech();
    if (onClose) onClose();
  };

  // Login Form State (सरल व बिना किसी जमीन की बाध्यता के)
  const [loginForm, setLoginForm] = useState({
    phone: '',
    name: '',
    pin: '1234',
    pincode: '',
    village: '',
    district: '',
    block: ''
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeVillages, setPincodeVillages] = useState([]);
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [customVillageMode, setCustomVillageMode] = useState(false);

  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setLoginForm((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetchVillagesByPincode(clean);
        if (res && res.success) {
          const vList = res.villages || [];
          setPincodeVillages(vList);
          setPincodeInfo({ district: res.district, block: res.block, state: res.state });
          setCustomVillageMode(false);
          setLoginForm((prev) => ({
            ...prev,
            village: vList.length > 0 ? vList[0] : prev.village,
            district: res.district || prev.district,
            block: res.block || prev.block
          }));
          notify.success(`📍 ${res.block ? res.block + ', ' : ''}${res.district || ''}: ${vList.length} गांव मिले!`);
        } else {
          setPincodeVillages([]);
          setPincodeInfo(null);
          setCustomVillageMode(true);
        }
      } catch {
        setCustomVillageMode(true);
      } finally {
        setPincodeLoading(false);
      }
    } else if (clean.length < 6) {
      setPincodeVillages([]);
      setPincodeInfo(null);
    }
  };

  // New Plot Form State
  const [newPlot, setNewPlot] = useState({
    plotName: '',
    cropId: 'paddy',
    cropName: 'धान (Paddy)',
    areaAcres: '1.0',
    sowDate: new Date().toISOString().split('T')[0],
    season: 'खरीफ (Kharif)',
    notes: '',
  });

  // Load Farmer and Plots on mount or open
  useEffect(() => {
    if (open) {
      const active = getActiveFarmer();
      setFarmer(active);
      if (active && active.phone) {
        loadPlots(active.phone);
      }
    }
  }, [open]);

  const loadPlots = async (phone) => {
    const list = await getFarmerPlots(phone);
    setPlots(list || []);
    if (list && list.length > 0 && activePlotIndex >= list.length) {
      setActivePlotIndex(0);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.phone || loginForm.phone.length < 10) {
      notify.warning(isChhattisgarhi ? 'कृपा करके 10 अंक के मोबाइल नंबर दर्ज करव।' : 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    const res = await loginFarmer({
      phone: loginForm.phone,
      name: loginForm.name,
      pin: loginForm.pin || '1234',
      village: loginForm.village,
      district: loginForm.district || selectedDistrict,
    });
    if (res.success) {
      setFarmer(res.farmer);
      loadPlots(res.farmer.phone);
      notify.success(isChhattisgarhi ? `स्वागत हे, ${res.farmer.name || 'किसान संगी'}! आपके खेत सुरक्षित लोड होगे।` : `स्वागत है, ${res.farmer.name || 'किसान साथी'}! आपका खेत सुरक्षित लोड हो गया।`);
    } else {
      notify.error(res.error || (isChhattisgarhi ? 'लॉगिन विफल रहिस।' : 'लॉगिन विफल रहा।'));
    }
  };

  const handleLogout = () => {
    logoutFarmer();
    setFarmer(null);
    setPlots([]);
    setActivePlotIndex(0);
    notify.info(isChhattisgarhi ? 'सफलतापूर्वक बाहिर निकल गे। आपके डेटा सुरक्षित हे।' : 'सफलतापूर्वक लॉगआउट। आपका डेटा सुरक्षित है।');
  };

  const handleAddPlot = async () => {
    if (!newPlot.plotName || !newPlot.areaAcres) {
      notify.warning(isChhattisgarhi ? 'कृपा करके खेत के नाव अउ एकड़ दर्ज करव।' : 'कृपया खेत का नाम और एकड़ दर्ज करें।');
      return;
    }

    const cropRule = CROP_LIFECYCLE_RULES[newPlot.cropId];
    const cropName = cropRule ? cropRule.name : 'धान';

    const updated = await saveFarmerPlot(farmer.phone, {
      ...newPlot,
      cropName,
    });

    setPlots(updated || []);
    setOpenAddPlotDialog(false);
    notify.success(isChhattisgarhi ? 'नवा खेत अउ फसल सफलतापूर्वक जुड़ गे!' : 'नया खेत व फसल सफलतापूर्वक जुड़ गई!');
    setNewPlot({
      plotName: '',
      cropId: 'paddy',
      cropName: 'धान (Paddy)',
      areaAcres: '1.0',
      sowDate: new Date().toISOString().split('T')[0],
      season: 'खरीफ (Kharif)',
      notes: '',
    });
  };

  const handleDeletePlot = async (plotId) => {
    if (window.confirm(isChhattisgarhi ? 'का आप सचमुच ए खेत ल हटाना चाहत हौ?' : 'क्या आप वाकई इस खेत/प्लॉट को हटाना चाहते हैं?')) {
      const updated = await deleteFarmerPlot(farmer.phone, plotId);
      setPlots(updated || []);
      setActivePlotIndex(0);
      notify.info(isChhattisgarhi ? 'खेत सफलतापूर्वक हटा दिए गे।' : 'खेत सफलतापूर्वक हटाया गया।');
    }
  };

  const handleToggleTask = async (plotId, taskId) => {
    const updated = await togglePlotTask(farmer.phone, plotId, taskId);
    setPlots(updated || []);
  };

  // Calculations for Multi-Plot Consolidation
  const totalAllocatedAcres = plots.reduce((acc, p) => acc + (parseFloat(p.areaAcres) || 0), 0);

  const activePlot = plots[activePlotIndex];
  const plotAnalysis = activePlot
    ? analyzePlotLifecycle(
        activePlot,
        liveWeather
          ? {
              condition: liveWeather.conditionName,
              humidity: liveWeather.humidity,
              temp: liveWeather.temp,
              rainProbability: liveWeather.rainProbability,
            }
          : {
              condition: 'Sunny',
              humidity: 60,
              temp: 30,
            }
      )
    : null;

  // Consolidated Gross Yield & Revenue
  const consolidatedStats = plots.reduce(
    (acc, plot) => {
      const analysis = analyzePlotLifecycle(plot, liveWeather || {});
      return {
        yield: acc.yield + analysis.estimatedYieldQuintals,
        income: acc.income + analysis.estimatedGrossIncome,
      };
    },
    { yield: 0, income: 0 }
  );

  const handleReadTodayAction = () => {
    if (plotAnalysis) {
      let text = isChhattisgarhi
        ? `${activePlot.plotName} - ${plotAnalysis.cropRule.name}। आज दिन ${plotAnalysis.daysElapsed} हे। अवस्था: ${plotAnalysis.currentStage.stageName}। आज के काम: ${plotAnalysis.currentStage.task}। सावधानी: ${plotAnalysis.currentStage.warning}`
        : `${activePlot.plotName} - ${plotAnalysis.cropRule.name}। आज का दिन ${plotAnalysis.daysElapsed} है। अवस्था: ${plotAnalysis.currentStage.stageName}। आज का कार्य: ${plotAnalysis.currentStage.task}। सावधानियां: ${plotAnalysis.currentStage.warning}`;
      if (plotAnalysis.weatherAlert) {
        text += isChhattisgarhi ? `। मौसम चेतावनी: ${plotAnalysis.weatherAlert.message}` : `। मौसम चेतावनी: ${plotAnalysis.weatherAlert.message}`;
      }
      speakText(text);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleModalClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: { xs: 2.5, sm: 3.5 },
            maxHeight: '94vh',
            bgcolor: '#f8faf6',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            bgcolor: '#1b5e20',
            color: '#fff',
            py: 1.5,
            px: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AgricultureIcon sx={{ color: '#81c784', fontSize: 26 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
              {isChhattisgarhi ? '🌾 मोर खेत: बहु-फसली स्मार्ट डैशबोर्ड' : '🌾 मेरा खेत: बहु-फसली स्मार्ट डैशबोर्ड'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {/* ========================================================= */}
          {/* SCREEN 1: LOGIN / REGISTRATION (IF NOT LOGGED IN) */}
          {/* ========================================================= */}
          {!farmer ? (
            <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, maxWidth: 500, mx: 'auto', my: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <LockOpenIcon sx={{ fontSize: 44, color: '#2e7d32', mb: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                  {isChhattisgarhi ? 'किसान लॉगिन / मोर खाता' : 'किसान लॉगिन / मेरा खाता'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.82rem' }}>
                  {isChhattisgarhi ? 'हर एक किसान के खेत, फसल अउ खाद के हिसाब-किताब अलग अउ 100% सुरक्षित रहिथे।' : 'प्रत्येक किसान का खेत, फसलें व खाद का हिसाब अलग और 100% सुरक्षित रहता है।'}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}>
                {isChhattisgarhi ? (
                  <span>🔒 <strong>पुरो तरहा सुरक्षित:</strong> कोनो खसरा, बी-1 या कुल भुइयां बताय के जरूरत नइये। सिरिफ मोबाइल नंबर ले तुरते सुरू करव।</span>
                ) : (
                  <span>🔒 <strong>पूर्णतः सुरक्षित:</strong> किसी खसरा, बी-1 या कुल जमीन के खुलासे की आवश्यकता नहीं। केवल मोबाइल नंबर से तुरंत शुरू करें।</span>
                )}
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                <TextField
                  label={isChhattisgarhi ? 'मोबाइल नंबर (10 अंक) *' : 'मोबाइल नंबर (10 अंक) *'}
                  placeholder="98765 43210"
                  fullWidth
                  size="small"
                  value={loginForm.phone}
                  onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ bgcolor: '#f1f5f9', px: 0.8, py: 0.2, borderRadius: 1, fontWeight: 800, fontSize: '0.78rem', color: '#334155' }}>
                          🇮🇳 +91
                        </Box>
                      </InputAdornment>
                    )
                  }}
                  helperText={isChhattisgarhi ? 'ये ह आपके सुरक्षित किसान पहचान आय' : 'यह आपकी सुरक्षित किसान पहचान है'}
                />
                <TextField
                  label={isChhattisgarhi ? 'किसान के नाव (वैकल्पिक)' : 'किसान का नाम (वैकल्पिक)'}
                  placeholder="उदा. रामेश्वर साहू"
                  fullWidth
                  size="small"
                  value={loginForm.name}
                  onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
                />
                <TextField
                  label={isChhattisgarhi ? 'डाक पिन कोड (6 अंक)' : 'डाक पिन कोड (6 अंक)'}
                  placeholder="उदा. 493441 या 492001"
                  fullWidth
                  size="small"
                  value={loginForm.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {pincodeLoading ? (
                          <CircularProgress size={18} sx={{ color: '#2e7d32' }} />
                        ) : pincodeInfo ? (
                          <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                        ) : (
                          <PinDropIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        )}
                      </InputAdornment>
                    )
                  }}
                  helperText={
                    pincodeLoading
                      ? (isChhattisgarhi ? '🔍 डाक विभाग ले गांव खोजत हन...' : '🔍 डाक विभाग से गांव खोज रहे हैं...')
                      : pincodeInfo
                      ? `✓ ${pincodeInfo.block ? pincodeInfo.block + ', ' : ''}${pincodeInfo.district || ''} (${pincodeVillages.length} ${isChhattisgarhi ? 'गांव उपलब्ध' : 'गांव उपलब्ध'})`
                      : (isChhattisgarhi ? 'पिन कोड डारतेच गांव के सूची अपने-आप खुलही' : 'पिन कोड डालते ही गांव सूची स्वतः खुलेगी')
                  }
                />
                {pincodeVillages.length > 0 && !customVillageMode ? (
                  <TextField
                    select
                    label={isChhattisgarhi ? 'अपन गांव चुनव *' : 'अपना गांव चुनें *'}
                    fullWidth
                    size="small"
                    value={loginForm.village || (pincodeVillages[0] || '')}
                    onChange={(e) => {
                      if (e.target.value === '__CUSTOM__') {
                        setCustomVillageMode(true);
                        setLoginForm({ ...loginForm, village: '' });
                      } else {
                        setLoginForm({ ...loginForm, village: e.target.value });
                      }
                    }}
                    helperText={
                      <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{isChhattisgarhi ? '📍 पिन कोड ले खोजे गे गांव' : '📍 पिन कोड से खोजे गए गांव'}</span>
                        <Button
                          size="small"
                          onClick={() => { setCustomVillageMode(true); setLoginForm({ ...loginForm, village: '' }); }}
                          sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1565c0', fontWeight: 700 }}
                        >
                          {isChhattisgarhi ? '✏️ दूसर गांव लिखव' : '✏️ दूसरा गांव लिखें'}
                        </Button>
                      </Box>
                    }
                  >
                    {pincodeVillages.map((v) => (
                      <MenuItem key={v} value={v} sx={{ fontSize: '0.85rem' }}>
                        🏡 {v}
                      </MenuItem>
                    ))}
                    <MenuItem value="__CUSTOM__" sx={{ fontSize: '0.82rem', color: '#1565c0', fontWeight: 700 }}>
                      {isChhattisgarhi ? '✏️ सूची म नइये? नवा नाव लिखव...' : '✏️ सूची में नहीं है? नया नाम लिखें...'}
                    </MenuItem>
                  </TextField>
                ) : (
                  <TextField
                    label={isChhattisgarhi ? 'गांव / ब्लॉक के नाव' : 'गांव / ब्लॉक का नाम'}
                    placeholder="उदा. आरंग"
                    fullWidth
                    size="small"
                    value={loginForm.village}
                    onChange={(e) => setLoginForm({ ...loginForm, village: e.target.value })}
                    helperText={
                      pincodeVillages.length > 0 ? (
                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{isChhattisgarhi ? 'हाथ ले नाव दर्ज करव' : 'हाथ से नाम दर्ज करें'}</span>
                          <Button
                            size="small"
                            onClick={() => setCustomVillageMode(false)}
                            sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1b5e20', fontWeight: 700 }}
                          >
                            {isChhattisgarhi ? `📋 पिन कोड सूची देखव (${pincodeVillages.length})` : `📋 पिन कोड सूची देखें (${pincodeVillages.length})`}
                          </Button>
                        </Box>
                      ) : (isChhattisgarhi ? 'पिन कोड डारव या हाथ ले नाव लिखव' : 'पिन कोड डालें या हाथ से नाम लिखें')
                    }
                  />
                )}
                <TextField
                  label={isChhattisgarhi ? 'सुरक्षा पिन (4 अंक, डिफ़ॉल्ट: 1234)' : 'सुरक्षा पिन (4 अंक, डिफ़ॉल्ट: 1234)'}
                  placeholder="1234"
                  type="password"
                  fullWidth
                  size="small"
                  value={loginForm.pin}
                  onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.slice(0, 6) })}
                  helperText={isChhattisgarhi ? 'साझा फोन म आपके बिना कोनो दूसर फसल रिकॉर्ड झन बदल सके' : 'साझा फोन पर आपके अलावा कोई दूसरा फसल रिकॉर्ड न बदल सके'}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loginForm.phone.length < 10}
                  onClick={handleLogin}
                  sx={{
                    bgcolor: '#2e7d32',
                    color: '#fff',
                    fontWeight: 800,
                    py: 1.2,
                    borderRadius: 2.5,
                    boxShadow: '0 4px 14px rgba(46,125,50,0.3)',
                    '&:hover': { bgcolor: '#1b5e20' },
                  }}
                >
                  {isChhattisgarhi ? '🌾 मोर खेत खोलव (Login)' : '🌾 मेरा खेत खोलें (Login)'}
                </Button>
              </Box>
            </Paper>
          ) : (
            /* ========================================================= */
            /* SCREEN 2: ACTIVE FARMER MULTI-PLOT DASHBOARD */
            /* ========================================================= */
            <Box>
              {/* Farmer Profile & Overview Bar */}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2.5,
                  bgcolor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                  border: '1px solid #e0e6db',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20', lineHeight: 1.2 }}>
                    👤 {farmer.name || (isChhattisgarhi ? 'किसान संगी' : 'किसान साथी')} {farmer.village ? `• ${farmer.village}` : ''} ({farmer.district || selectedDistrict})
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#555', fontSize: '0.8rem' }}>
                    🌾 <strong>{plots.length} {isChhattisgarhi ? 'फसल/खेत दर्ज' : 'फसलें/खेत दर्ज'}</strong> {totalAllocatedAcres > 0 ? `• ${isChhattisgarhi ? 'कुल रकबा' : 'कुल क्षेत्रफल'}: ${totalAllocatedAcres} एकड़` : ''}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {liveWeather && (
                    <Chip
                      size="small"
                      label={`${liveWeather.conditionIcon || '🌤️'} ${liveWeather.temp}°C • ${liveWeather.sprayAdvisory?.status || (isChhattisgarhi ? 'मौसम सामान्य हे' : 'मौसम सामान्य')}`}
                      sx={{
                        bgcolor: liveWeather.sprayAdvisory?.canSpray ? '#e8f5e9' : '#ffebee',
                        color: liveWeather.sprayAdvisory?.canSpray ? '#1b5e20' : '#c62828',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        border: liveWeather.sprayAdvisory?.canSpray ? '1px solid #a5d6a7' : '1px solid #ef9a9a',
                      }}
                    />
                  )}
                  {plots.length > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PrintIcon />}
                      onClick={() => {
                        generateAndPrintKccReport({
                          farmerName: farmer.name || (isChhattisgarhi ? 'सम्मानित किसान' : 'सम्मानित किसान'),
                          phone: farmer.phone || '',
                          village: farmer.village || 'ग्राम',
                          district: farmer.district || selectedDistrict,
                          items: plots.map((p) => ({
                            cropName: p.cropName,
                            areaAcres: p.areaAcres,
                            sowDate: p.sowDate,
                            stage: p.plotName,
                            nextAction: `किस्म: ${p.variety || 'उन्नत'} • मिट्टी: ${p.soilType || 'मटासी'}`
                          }))
                        });
                      }}
                      sx={{
                        borderColor: '#2e7d32',
                        color: '#1b5e20',
                        fontWeight: 800,
                        fontSize: '0.74rem',
                        py: 0.4,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#e8f5e9' }
                      }}
                    >
                      🖨️ KCC प्रिंट
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', py: 0.4 }}
                  >
                    {isChhattisgarhi ? 'बाहिर निकलव' : 'लॉगआउट'}
                  </Button>
                </Box>
              </Paper>

              {/* Multi-Plot Dropdown Selector & Add Button (Zero Horizontal Scroll Architecture) */}
              <Grid container spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={plots.length > 0 ? 8 : 12}>
                  {plots.length > 0 ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={isChhattisgarhi ? '🌾 चालू खेत / फसल चुनव (Select Active Plot)' : '🌾 सक्रिय खेत / फसल चुनें (Select Active Plot)'}
                      value={activePlotIndex < plots.length ? activePlotIndex : 0}
                      onChange={(e) => setActivePlotIndex(Number(e.target.value))}
                      sx={{ bgcolor: '#ffffff', borderRadius: 2 }}
                    >
                      {plots.map((plot, idx) => (
                        <MenuItem key={plot.plotId} value={idx}>
                          🌱 {plot.plotName} — {plot.areaAcres} एकड़ ({plot.cropName})
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                      {isChhattisgarhi ? 'अभी कोनो खेत दर्ज नइये। नीचे ले पहिला खेत जोड़व।' : 'अभी कोई खेत दर्ज नहीं है। नीचे से पहला खेत जोड़ें।'}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={plots.length > 0 ? 4 : 12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenAddPlotDialog(true)}
                    sx={{
                      bgcolor: '#2e7d32',
                      color: '#fff',
                      fontWeight: 800,
                      borderRadius: 2,
                      py: 0.8,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(46,125,50,0.2)',
                      '&:hover': { bgcolor: '#1b5e20' },
                    }}
                  >
                    {isChhattisgarhi ? '+ नवा खेत / फसल जोड़व' : '+ नया खेत / फसल जोड़ें'}
                  </Button>
                </Grid>
              </Grid>

              {/* NO PLOTS ADDED STATE */}
              {plots.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: '#ffffff', my: 2 }}>
                  <AgricultureIcon sx={{ fontSize: 52, color: '#81c784', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                    {isChhattisgarhi ? 'अभी कोनो खेत नइये जोड़े गे हे' : 'अभी कोई खेत नहीं जोड़ा गया है'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2, maxWidth: 420, mx: 'auto' }}>
                    {isChhattisgarhi ? 'अपन खेत अउ फसल (जइसे धान, चना, गेहूं या साग-भाजी) ल इहां जोड़व अउ बुआई ले लेके कटाई तक खाद, पानी अउ मौसम के सटीक हिसाब रखव।' : 'अपने खेतों व फसलों (जैसे धान, चना, गेहूं या सब्जी) को यहां जोड़ें और प्रत्येक का बुआई से लेकर कटाई तक का खाद, पानी व मौसम का सटीक हिसाब रखें।'}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenAddPlotDialog(true)}
                    sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800 }}
                  >
                    {isChhattisgarhi ? 'पहिला खेत जोड़व' : 'पहला खेत जोड़ें'}
                  </Button>
                </Paper>
              ) : activePlot && plotAnalysis ? (
                /* ACTIVE PLOT DETAILED LIFECYCLE & WEATHER ADVISORY CARD */
                <Card sx={{ borderRadius: 3, mb: 2.5, boxShadow: '0 3px 12px rgba(0,0,0,0.06)', border: '1px solid #dcedc8' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    {/* Plot Title & Days Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.15rem' }}>
                            {activePlot.plotName} • {activePlot.cropName}
                          </Typography>
                          <Chip
                            label={`${activePlot.areaAcres} एकड़`}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {isChhattisgarhi ? `बुआई के तारीख: ${activePlot.sowDate} • मौसम: ${activePlot.season}` : `बुआई की तारीख: ${activePlot.sowDate} • मौसम: ${activePlot.season}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DirectionsWalkIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setOpenGpsTracker(true)}
                            sx={{ fontSize: '0.7rem', py: 0.2, px: 1, borderRadius: 2, borderColor: '#a5d6a7', color: '#1b5e20', fontWeight: 700 }}
                          >
                            {isChhattisgarhi ? '📍 GPS मेड़ नापव' : '📍 GPS सीमा नापें'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ScienceIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setOpenSoilIot(true)}
                            sx={{ fontSize: '0.7rem', py: 0.2, px: 1, borderRadius: 2, borderColor: '#80cbc4', color: '#004d40', fontWeight: 700 }}
                          >
                            {isChhattisgarhi ? '🔬 माटी IoT जांच' : '🔬 मिट्टी IoT जांच'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PowerSettingsNewIcon sx={{ fontSize: 16 }} />}
                            onClick={() => setOpenMotorModal(true)}
                            sx={{ fontSize: '0.7rem', py: 0.2, px: 1, borderRadius: 2, borderColor: '#81d4fa', color: '#01579b', fontWeight: 700 }}
                          >
                            {isChhattisgarhi ? '⚡ बोरवेल मोटर' : '⚡ बोरवेल मोटर'}
                          </Button>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleReadTodayAction}
                          title={isChhattisgarhi ? 'आज के काम सुनव' : 'आज का कार्य सुनें'}
                          sx={{ bgcolor: '#e8f5e9' }}
                        >
                          <VolumeUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePlot(activePlot.plotId)}
                          title={isChhattisgarhi ? 'खेत हटावव' : 'खेत हटाएं'}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Lifecycle Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                          {isChhattisgarhi ? `दिन: ${plotAnalysis.daysElapsed} / ${plotAnalysis.cropRule.totalDays} दिन` : `दिन: ${plotAnalysis.daysElapsed} / ${plotAnalysis.cropRule.totalDays} दिन`}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                          {isChhattisgarhi ? `${plotAnalysis.progressPercent}% पूरा` : `${plotAnalysis.progressPercent}% पूर्ण`}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={plotAnalysis.progressPercent}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: plotAnalysis.currentStage.statusColor || '#2e7d32',
                          },
                        }}
                      />
                      <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={plotAnalysis.currentStage.stageName}
                          size="small"
                          sx={{
                            bgcolor: plotAnalysis.currentStage.statusColor,
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </Box>

                    {/* DYNAMIC WEATHER OVERRIDE ALERT (IF APPLICABLE) */}
                    {plotAnalysis.weatherAlert && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: 2.5,
                          bgcolor: '#fff3e0',
                          border: '1.5px solid #ffb74d',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', mb: 0.3 }}>
                          {plotAnalysis.weatherAlert.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#5d4037', fontSize: '0.84rem', lineHeight: 1.35 }}>
                          {plotAnalysis.weatherAlert.message}
                        </Typography>
                      </Paper>
                    )}

                    {/* TODAY'S MAIN ACTION (आज का कार्य) */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        mb: 2,
                        borderRadius: 2.5,
                        bgcolor: '#e8f5e9',
                        border: '1.5px solid #a5d6a7',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', mb: 0.5 }}>
                        {isChhattisgarhi ? "🎯 आज के मुख्य काम (Today's Action):" : "🎯 आज का मुख्य कार्य (Today's Action):"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1b5e20', fontSize: '0.9rem', lineHeight: 1.4, mb: 1 }}>
                        {plotAnalysis.currentStage.task}
                      </Typography>

                      <Divider sx={{ my: 1, borderColor: '#c8e6c9' }} />

                      <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block', fontWeight: 600 }}>
                        {isChhattisgarhi ? `⚠️ सावधानी अउ कीट रोकथाम: ${plotAnalysis.currentStage.warning}` : `⚠️ सावधानी व कीट नियंत्रण: ${plotAnalysis.currentStage.warning}`}
                      </Typography>

                      {/* Task Completion Toggle */}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={activePlot.completedTasks?.includes(`stage-${plotAnalysis.daysElapsed}`)}
                            onChange={() => handleToggleTask(activePlot.plotId, `stage-${plotAnalysis.daysElapsed}`)}
                            color="success"
                            icon={<RadioButtonUncheckedIcon />}
                            checkedIcon={<CheckCircleIcon />}
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                            {isChhattisgarhi ? 'मैं ये काम पूरा कर ले हंव (Mark as Done)' : 'मैंने यह कार्य पूरा कर लिया है (Mark as Done)'}
                          </Typography>
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Paper>

                    {/* PLOT FERTILIZER REQUIREMENT */}
                    {(() => {
                      const area = parseFloat(activePlot.areaAcres) || 1.0;
                      const fert = fertData ? (fertData[activePlot.cropId] || fertData.paddy || Object.values(fertData)[0]) : null;
                      if (!fert) return null;
                      const uBags = ((fert.ureaTotal * area) / 45).toFixed(1);
                      const dBags = ((fert.dapTotal * area) / 50).toFixed(1);
                      const mBags = ((fert.mopTotal * area) / 50).toFixed(1);

                      return (
                        <Box sx={{ mb: 2, p: 1.5, bgcolor: '#fbfdf9', borderRadius: 2.5, border: '1px dashed #a5d6a7' }}>
                          <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, display: 'block', mb: 0.8 }}>
                            {isChhattisgarhi ? `🧪 ए खेत (${activePlot.areaAcres} एकड़ ${activePlot.cropName}) बर जरूरी खाद:` : `🧪 इस खेत (${activePlot.areaAcres} एकड़ ${activePlot.cropName}) हेतु अनुशंसित खाद:`}
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', bgcolor: '#e8f5e9', p: 0.8, borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, display: 'block', fontSize: '0.8rem' }}>
                                  ~{uBags} बोरी
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.68rem', fontWeight: 600 }}>यूरिया (Urea)</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', bgcolor: '#e3f2fd', p: 0.8, borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 800, display: 'block', fontSize: '0.8rem' }}>
                                  ~{dBags} बोरी
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#1565c0', fontSize: '0.68rem', fontWeight: 600 }}>DAP</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', bgcolor: '#fff3e0', p: 0.8, borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ color: '#bf360c', fontWeight: 800, display: 'block', fontSize: '0.8rem' }}>
                                  ~{mBags} बोरी
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.68rem', fontWeight: 600 }}>पोटाश (MOP)</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      );
                    })()}

                    {/* ESTIMATED YIELD & INCOME FOR THIS PLOT */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#f1f8e9',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                          {isChhattisgarhi ? 'अनुमानित उपज' : 'अनुमानित उत्पादन'}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                          ~{plotAnalysis.estimatedYieldQuintals} {isChhattisgarhi ? 'क्विंटल' : 'क्विंटल'}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                          {isChhattisgarhi ? 'बजार / सरकारी भाव' : 'बाजार / सरकारी भाव'}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0d47a1' }}>
                          ₹{plotAnalysis.cropRule.marketRatePerQuintal.toLocaleString('en-IN')}/{isChhattisgarhi ? 'क्विं.' : 'क्विं.'}
                        </Typography>
                      </Box>
                      <Divider orientation="vertical" flexItem />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                          {isChhattisgarhi ? 'अनुमानित कुल आमदनी' : 'अनुमानित संभावित आय'}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                          ~₹{plotAnalysis.estimatedGrossIncome.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Paper>
                  </CardContent>
                </Card>
              ) : null}

              {/* CONSOLIDATED SUMMARY ACROSS ALL PLOTS */}
              {plots.length > 1 && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
                    color: '#fff',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    {isChhattisgarhi ? `📊 कुल उपज अउ आमदनी (सबो ${plots.length} खेत के कुल अनुमान):` : `📊 समेकित उत्पादन व आय (सभी ${plots.length} खेतों का कुल अनुमान):`}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#c8e6c9' }}>
                        {isChhattisgarhi ? 'सबो खेत के उपज' : 'कुल अनुमानित उत्पादन'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>
                        ~{consolidatedStats.yield} क्विंटल
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#c8e6c9' }}>
                        {isChhattisgarhi ? 'सबो खेत ले आय' : 'कुल अनुमानित आय'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffeb3b' }}>
                        ~₹{consolidatedStats.income.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* 1-TAP GOVERNMENT SERVICES & HELPLINE CONNECTORS */}
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: '#ffffff',
                  border: '1px solid #e0e6db',
                }}
              >
                <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, display: 'block', mb: 1 }}>
                  {isChhattisgarhi ? '🏛️ उपयोगी सरकारी पोर्टल अउ मुफ़्त हेल्पलाइन:' : '🏛️ उपयोगी सरकारी पोर्टल्स एवं निःशुल्क हेल्पलाइन:'}
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(appConfig.portals.tokenUrl, '_blank')}
                      sx={{ fontSize: '0.72rem', py: 0.6, borderColor: '#c8e6c9', color: '#1b5e20', fontWeight: 700 }}
                    >
                      🌾 टोकन तुंहर हाथ
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(appConfig.portals.agristackUrl, '_blank')}
                      sx={{ fontSize: '0.72rem', py: 0.6, borderColor: '#c8e6c9', color: '#1b5e20', fontWeight: 700 }}
                    >
                      🆔 एग्री-स्टैक आईडी
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(appConfig.portals.bhuiyanUrl, '_blank')}
                      sx={{ fontSize: '0.72rem', py: 0.6, borderColor: '#c8e6c9', color: '#1b5e20', fontWeight: 700 }}
                    >
                      📑 भुइयां (खसरा/नक्शा)
                    </Button>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      onClick={() => window.location.href = `tel:${appConfig.helpline.phone}`}
                      sx={{ fontSize: '0.72rem', py: 0.6, bgcolor: '#2e7d32', color: '#fff', fontWeight: 800 }}
                    >
                      📞 किसान कॉल (1800)
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5, bgcolor: '#f0f4ec' }}>
          <Button onClick={onClose} sx={{ color: '#2e7d32', fontWeight: 700 }}>
            {isChhattisgarhi ? 'बंद करव' : 'बंद करें'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 2: ADD NEW PLOT MODAL */}
      {/* ========================================================= */}
      <Dialog
        open={openAddPlotDialog}
        onClose={() => setOpenAddPlotDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#fff', py: 1.5 }}>
          {isChhattisgarhi ? '🌾 नवा खेत / फसल जोड़व' : '🌾 नया खेत / फसल जोड़ें'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={isChhattisgarhi ? 'खेत के नाव / पहचान' : 'खेत का नाम / पहचान'}
            placeholder="उदा. खेत 1 - नहर पार"
            fullWidth
            size="small"
            value={newPlot.plotName}
            onChange={(e) => setNewPlot({ ...newPlot, plotName: e.target.value })}
            sx={{ mt: 1 }}
          />

          <TextField
            select
            label={isChhattisgarhi ? 'फसल के नाव' : 'फसल का नाम'}
            fullWidth
            size="small"
            value={newPlot.cropId}
            onChange={(e) => {
              const rule = CROP_LIFECYCLE_RULES[e.target.value];
              setNewPlot({
                ...newPlot,
                cropId: e.target.value,
                cropName: rule ? rule.name : 'धान',
              });
            }}
          >
            <MenuItem value="paddy">{isChhattisgarhi ? 'धान (धान - Paddy)' : 'धान (Paddy)'}</MenuItem>
            <MenuItem value="wheat">{isChhattisgarhi ? 'गेहूं (गेहूं - Wheat)' : 'गेहूं (Wheat)'}</MenuItem>
            <MenuItem value="chana">{isChhattisgarhi ? 'चना (चना - दलहन)' : 'चना (Chickpea - दलहन)'}</MenuItem>
            <MenuItem value="tomato">{isChhattisgarhi ? 'टमाटर / साग-भाजी (Tomato)' : 'टमाटर / सब्जी (Tomato)'}</MenuItem>
            <MenuItem value="maize">{isChhattisgarhi ? 'मक्का (जौनरा - Maize)' : 'मक्का (Maize)'}</MenuItem>
          </TextField>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              label={isChhattisgarhi ? 'रकबा (एकड़ म)' : 'रकबा (एकड़ में)'}
              placeholder="1.0"
              type="number"
              fullWidth
              size="small"
              value={newPlot.areaAcres}
              onChange={(e) => setNewPlot({ ...newPlot, areaAcres: e.target.value })}
              helperText={isChhattisgarhi ? 'उदा. 0.5 या 1.0 एकड़' : 'उदा. 0.5 या 1.0 एकड़'}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenGpsTracker(true)}
              sx={{ minWidth: 96, height: 40, whiteSpace: 'nowrap', borderColor: '#2e7d32', color: '#1b5e20', fontWeight: 700, fontSize: '0.72rem' }}
            >
              {isChhattisgarhi ? '📍 GPS नापव' : '📍 GPS नापें'}
            </Button>
          </Box>

          <TextField
            label={isChhattisgarhi ? 'बुआई के तारीख' : 'बुआई की तारीख'}
            type="date"
            fullWidth
            size="small"
            value={newPlot.sowDate}
            onChange={(e) => setNewPlot({ ...newPlot, sowDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label={isChhattisgarhi ? 'मौसम (Season)' : 'मौसम (Season)'}
            fullWidth
            size="small"
            value={newPlot.season}
            onChange={(e) => setNewPlot({ ...newPlot, season: e.target.value })}
          >
            <MenuItem value="खरीफ (Kharif)">खरीफ (Kharif)</MenuItem>
            <MenuItem value="रबी (Rabi)">रबी (Rabi)</MenuItem>
            <MenuItem value="जायद (Zaid)">{isChhattisgarhi ? 'जायद / गरमा (Zaid)' : 'जायद / ग्रीष्म (Zaid)'}</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddPlotDialog(false)} color="inherit">
            {isChhattisgarhi ? 'रद्द करव' : 'रद्द करें'}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPlot}
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800 }}
          >
            {isChhattisgarhi ? 'खेत सहेजव' : 'खेत सहेजें'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Field GPS Tracker Modal */}
      <FieldGpsTrackerModal
        open={openGpsTracker}
        onClose={() => setOpenGpsTracker(false)}
        plotName={openAddPlotDialog ? newPlot.plotName || (isChhattisgarhi ? 'नवा खेत' : 'नया खेत') : activePlot?.plotName || (isChhattisgarhi ? 'खेत' : 'खेत')}
        onSaveArea={(acres) => {
          if (openAddPlotDialog) {
            setNewPlot((prev) => ({ ...prev, areaAcres: String(acres) }));
            notify.success(isChhattisgarhi ? `GPS ले ${acres} एकड़ रकबा दर्ज होगे!` : `GPS से ${acres} एकड़ रकबा दर्ज किया गया!`);
          } else if (activePlot) {
            const updated = { ...activePlot, areaAcres: Number(acres) };
            saveFarmerPlot(farmer.phone, updated);
            loadPlots(farmer.phone);
            notify.success(isChhattisgarhi ? `"${activePlot.plotName}" के रकबा अपडेट होके ${acres} एकड़ होगे!` : `"${activePlot.plotName}" का रकबा अपडेट होकर ${acres} एकड़ हुआ!`);
          }
        }}
      />

      {/* Soil IoT Sensor Modal */}
      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        plotName={activePlot?.plotName || 'खेत'}
      />

      {/* Smart Tubewell Motor Controller Modal */}
      <MotorControllerModal
        open={openMotorModal}
        onClose={() => setOpenMotorModal(false)}
        weatherContext={liveWeather}
      />
    </>
  );
};

export default MeraKhetModal;
