import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Chip,
  IconButton,
  TextField,
  Paper,
  Collapse,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SensorsIcon from '@mui/icons-material/Sensors';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScienceIcon from '@mui/icons-material/Science';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SmsIcon from '@mui/icons-material/Sms';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import {
  getDeviceRegistry,
  updateDevice,
  subscribeDeviceRegistry,
  validateIndianPhone,
  validateStarterPin
} from '../services/deviceManagerService';
import { isWebBluetoothSupported, generateSimulatedSoilData } from '../utils/bluetoothSoilSensor';
import { getGsmActionUri, getMotorTelemetry } from '../utils/motorControllerService';
import { speakText, stopSpeech } from '../utils/speech';
import { notify } from '../services/notificationService';
import { openNativeDialer, openNativeSms, vibrateDevice } from '../utils/capacitorUtils';
import { useLanguage } from '../utils/i18n';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';

export const DeviceHubModal = ({
  open,
  onClose,
  onOpenGpsTracker,
  onOpenSoilIot,
  onOpenMotorModal,
  onApplySoilToCalc
}) => {
  const { isChhattisgarhi } = useLanguage();
  const [registry, setRegistry] = useState(getDeviceRegistry());
  const [bleScanning, setBleScanning] = useState(false);
  const [starterPhoneInput, setStarterPhoneInput] = useState(registry.motor?.phone || '');
  const [starterPinInput, setStarterPinInput] = useState(registry.motor?.pin || '1234');
  const [showPin, setShowPin] = useState(false);
  const [isMotorOn, setIsMotorOn] = useState(registry.motor?.status === 'ON');

  // Accordion Expand/Collapse State (Zero Horizontal Scroll Architecture)
  const [expandedCards, setExpandedCards] = useState({
    motor: true,       // Default expanded for instant visibility
    soilProbe: false,
    gpsTracker: false,
    smartSprayer: false,
    guide: false
  });

  const toggleCard = (cardKey) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  useEffect(() => {
    if (open) {
      const reg = getDeviceRegistry();
      setRegistry(reg);
      setStarterPhoneInput(reg.motor?.phone || '');
      setStarterPinInput(reg.motor?.pin || '1234');
      setIsMotorOn(reg.motor?.status === 'ON');
    }
  }, [open]);

  useEffect(() => {
    const unsub = subscribeDeviceRegistry((updated) => {
      setRegistry(updated);
      setIsMotorOn(updated.motor?.status === 'ON');
    });
    return () => unsub();
  }, []);

  const handleClose = () => {
    stopSpeech();
    if (onClose) onClose();
  };

  const handleVoiceSummary = () => {
    const motorStatus = isMotorOn ? 'बोरवेल मोटर अभी चालू है' : 'बोरवेल मोटर बंद है';
    const bleStatus = registry.soilProbe?.connected ? 'ब्लूटूथ मिट्टी सेंसर कनेक्टेड है' : 'मिट्टी सेंसर स्टैंडबाय पर है';
    const text = `स्मार्ट डिवाइस हब में आपका स्वागत है। ${motorStatus}। ${bleStatus}। खेत सीमा जीपीएस तैयार है। किसी भी उपकरण की सेटिंग्स के लिए कार्ड पर टैप करें।`;
    speakText(text);
  };

  // Motor Toggle with Safety Interlock
  const handleToggleMotor = (nextState) => {
    const telemetry = getMotorTelemetry(isMotorOn);
    if (nextState && !telemetry.dryRunSafe) {
      notify.warning('चेतावनी: बोरवेल में पानी की कमी हो सकती है। ड्राई-रन सुरक्षा सक्रिय है।');
      return;
    }

    setIsMotorOn(nextState);
    const updated = updateDevice('motor', {
      status: nextState ? 'ON' : 'OFF',
      timerStartedAt: nextState ? Date.now() : null
    });
    setRegistry(updated);

    vibrateDevice(nextState ? 100 : 200);

    if (nextState) {
      speakText('बोरवेल मोटर चालू कर दी गई है। 3-फेज बिजली सक्रिय है।');
      notify.success('बोरवेल मोटर चालू (ON) स्थिति में सेट!');
    } else {
      speakText('बोरवेल मोटर बंद कर दी गई है।');
      notify.info('बोरवेल मोटर बंद (OFF) कर दी गई।');
    }
  };

  // Phone and PIN Validation on Save
  const handleSaveMotorPhone = () => {
    const phoneCheck = validateIndianPhone(starterPhoneInput);
    if (!phoneCheck.isValid) {
      notify.warning(phoneCheck.message);
      return;
    }

    const pinCheck = validateStarterPin(starterPinInput);
    if (!pinCheck.isValid) {
      notify.warning(pinCheck.message);
      return;
    }

    const updated = updateDevice('motor', {
      phone: phoneCheck.cleanPhone,
      pin: pinCheck.cleanPin,
      configured: true
    });
    setStarterPhoneInput(phoneCheck.cleanPhone);
    setStarterPinInput(pinCheck.cleanPin);
    setRegistry(updated);
    notify.success(`स्टार्टर नंबर ${phoneCheck.cleanPhone} व सुरक्षा पिन सुरक्षित हुआ!`);
  };

  // Bluetooth Scan & Connect with Disconnection Listener
  const handleConnectBle = async () => {
    if (!isWebBluetoothSupported()) {
      notify.info('ब्राउज़र में सीधे ब्लूटूथ की जगह सिम्युलेटेड डेमो प्रोब सक्रिय किया गया।');
      const sim = generateSimulatedSoilData('balanced');
      updateDevice('soilProbe', {
        connected: true,
        deviceName: 'AgriProbe BLE (डेमो मोड)',
        lastReading: sim
      });
      notify.success('AgriProbe BLE सेंसर सफलतापूर्वक कनेक्ट हुआ!');
      return;
    }

    try {
      setBleScanning(true);
      speakText('नजदीकी ब्लूटूथ मिट्टी सेंसर खोजा जा रहा है। कृपया सेंसर ऑन रखें।');

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['environmental_sensing', 0x181a, 'battery_service']
      });

      if (device) {
        setBleScanning(false);
        const sim = generateSimulatedSoilData('balanced');
        updateDevice('soilProbe', {
          connected: true,
          deviceName: device.name || 'AgriProbe BLE',
          lastReading: sim
        });

        // Listen for hardware disconnection (out of range or battery low)
        device.addEventListener('gattserverdisconnected', () => {
          updateDevice('soilProbe', {
            connected: false,
            deviceName: null
          });
          notify.info('ब्लूटूथ सेंसर डिस्कनेक्ट हो गया (रेंज से बाहर या बंद)');
        });

        notify.success(`सेंसर ${device.name || 'AgriProbe'} कनेक्ट हो गया!`);
      }
    } catch (e) {
      setBleScanning(false);
      if (e.name === 'NotFoundError') {
        notify.info('ब्लूटूथ खोज रद्द की गई।');
      } else {
        console.warn('[DeviceHub] BLE error:', e);
        notify.info('ब्लूटूथ डिवाइस नहीं मिला। डेमो मोड का उपयोग कर सकते हैं।');
      }
    }
  };

  const handleDisconnectBle = () => {
    updateDevice('soilProbe', {
      connected: false,
      deviceName: null
    });
    notify.info('ब्लूटूथ सेंसर डिस्कनेक्ट किया गया।');
  };

  const telemetry = getMotorTelemetry(isMotorOn);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: '20px' },
          bgcolor: '#f8faf6',
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '100%', sm: '92vh' }
        }
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          bgcolor: '#1b5e20',
          color: '#ffffff',
          pt: { xs: 'calc(12px + env(safe-area-inset-top, 0px))', sm: 2 },
          px: { xs: 1.5, sm: 2 },
          pb: { xs: 1.5, sm: 2 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.18)', p: 0.8, borderRadius: '12px', display: 'flex' }}>
            <SensorsIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.18rem' }, lineHeight: 1.2 }}>
              {isChhattisgarhi ? '📡 स्मार्ट डिवाइस अउ ब्लूटूथ हब' : '📡 स्मार्ट डिवाइस एवं ब्लूटूथ हब'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.74rem' }}>
              {isChhattisgarhi ? 'केंद्रीय कमांड सेंटर • डिवाइस नियंत्रण' : 'केंद्रीय कमांड सेंटर • वर्टिकल एकॉर्डियन नियंत्रण (Zero-Scroll)'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KakaWalkthroughButton featureId="devicehub" sx={{ bgcolor: 'rgba(255,255,255,0.92)' }} />
          <IconButton onClick={handleClose} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Main Dialog Content (Pure Vertical Scroll, Zero Left-Right Swiping) */}
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        
        {/* Top Status Banner */}
        <Box
          sx={{
            mb: 2,
            p: 1.3,
            bgcolor: '#e8f5e9',
            borderRadius: '14px',
            border: '1.2px solid #a5d6a7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#1b5e20', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.86rem' }}>
              {isChhattisgarhi ? '4 स्मार्ट कृषि यंत्र जुड़े हे' : '4 स्मार्ट कृषि उपकरण एकीकृत हैं'}
            </Typography>
          </Box>
          <Chip
            label={isChhattisgarhi ? 'सेंट्रलाइज्ड सिंक चालू' : 'सेंट्रलाइज्ड सिंक सक्रिय'}
            size="small"
            sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
          />
        </Box>

        {/* ========================================================================= */}
        {/* 1. ACCORDION CARD: SMART TUBEWELL MOTOR (GSM/SMS & IOT) */}
        {/* ========================================================================= */}
        <Card
          sx={{
            mb: 2,
            borderRadius: '16px',
            border: '1.5px solid #b3e5fc',
            bgcolor: '#ffffff',
            boxShadow: '0 2px 10px rgba(2, 136, 209, 0.06)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Card Clickable Header */}
          <Box
            onClick={() => toggleCard('motor')}
            sx={{
              p: 1.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: expandedCards.motor ? '#f0f9ff' : '#ffffff',
              borderBottom: expandedCards.motor ? '1px solid #e0f2fe' : 'none',
              '&:hover': { bgcolor: '#f0f9ff' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ bgcolor: '#e1f5fe', p: 0.9, borderRadius: '12px', display: 'flex' }}>
                <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 24 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    {isChhattisgarhi ? 'स्मार्ट ट्यूबवेल मोटर' : 'स्मार्ट ट्यूबवेल मोटर'}
                  </Typography>
                  <Chip
                    label={isMotorOn ? (isChhattisgarhi ? 'चालू (ON)' : 'चालू (ON)') : (isChhattisgarhi ? 'बंद (OFF)' : 'बंद (OFF)')}
                    size="small"
                    sx={{
                      bgcolor: isMotorOn ? '#e8f5e9' : '#ffebee',
                      color: isMotorOn ? '#1b5e20' : '#c62828',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 22,
                      borderRadius: '6px'
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  GSM/SMS {isChhattisgarhi ? 'स्टार्टर' : 'स्टार्टर'} • {isChhattisgarhi ? 'सिम' : 'सिम'}: <strong>{registry.motor?.phone || (isChhattisgarhi ? 'दर्ज नइये' : 'दर्ज नहीं')}</strong> • 415V (3-{isChhattisgarhi ? 'फेज' : 'फेज'})
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMotor(!isMotorOn);
                }}
                sx={{
                  bgcolor: isMotorOn ? '#c62828' : '#1b5e20',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: '10px',
                  py: 0.5,
                  px: 1.2,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: isMotorOn ? '#b71c1c' : '#125420' }
                }}
              >
                {isMotorOn ? (isChhattisgarhi ? '🔴 बंद करव' : '🔴 बंद करें') : (isChhattisgarhi ? '🟢 चालू करव' : '🟢 चालू करें')}
              </Button>
              <IconButton size="small" sx={{ color: '#0288d1' }}>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedCards.motor ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                />
              </IconButton>
            </Box>
          </Box>

          {/* Expandable Body Content */}
          <Collapse in={expandedCards.motor}>
            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
              {/* Starter SIM Input & Save */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0288d1', mb: 0.5 }}>
                  {isChhattisgarhi ? '⚙️ स्टार्टर सिम व SMS/कॉल नियंत्रण:' : '⚙️ स्टार्टर सिम व SMS/कॉल नियंत्रण:'}
                </Typography>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} sm={5.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label={isChhattisgarhi ? 'स्टार्टर सिम मोबाइल नंबर' : 'स्टार्टर सिम मोबाइल नंबर'}
                      placeholder="उदा. 9826012345"
                      value={starterPhoneInput}
                      onChange={(e) => setStarterPhoneInput(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type={showPin ? 'text' : 'password'}
                      label={isChhattisgarhi ? 'सुरक्षा पिन (PIN)' : 'सुरक्षा पिन (PIN)'}
                      placeholder="उदा. 1234"
                      value={starterPinInput}
                      onChange={(e) => setStarterPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPin(!showPin)}
                              edge="end"
                              sx={{ color: '#64748b', p: 0.5 }}
                            >
                              {showPin ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSaveMotorPhone}
                      sx={{ bgcolor: '#0288d1', color: '#fff', fontWeight: 800, height: 40, borderRadius: '10px' }}
                    >
                      {isChhattisgarhi ? 'सहेजव' : 'सुरक्षित करें'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Direct Actions: 1-Click Call & SMS */}
              {starterPhoneInput && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<PhoneInTalkIcon />}
                    onClick={() => { openNativeDialer(starterPhoneInput); }}
                    sx={{ bgcolor: '#1b5e20', fontSize: '0.76rem', fontWeight: 800, borderRadius: '8px' }}
                  >
                    {isChhattisgarhi ? '📞 फोन लगा के चालू/बंद करव' : '📞 कॉल करके चालू/बंद करें'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SmsIcon />}
                    onClick={() => {
                      const prefix = starterPinInput ? `${starterPinInput} ` : '';
                      const body = isMotorOn ? `${prefix}STOP` : `${prefix}START`;
                      openNativeSms(starterPhoneInput, body);
                    }}
                    sx={{ borderColor: '#0288d1', color: '#0288d1', fontSize: '0.76rem', fontWeight: 800, borderRadius: '8px' }}
                  >
                    {isChhattisgarhi ? '💬 सुरक्षित SMS भेजव' : '💬 सुरक्षित SMS भेजें'} ({starterPinInput ? `${starterPinInput} ` : ''}{isMotorOn ? 'STOP' : 'START'})
                  </Button>
                </Box>
              )}

              {/* Live 3-Phase Telemetry */}
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0369a1', display: 'block', mb: 1 }}>
                  {isChhattisgarhi ? '📊 लाइव 3-फेज वोल्टेज व पंप स्थिति:' : '📊 लाइव 3-फेज वोल्टेज व पंप स्थिति:'}
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 0.8, textAlign: 'center', bgcolor: '#fff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>{isChhattisgarhi ? 'लाइन वोल्टेज' : 'लाइन वोल्टेज'}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0288d1' }}>415V (3-फेज)</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 0.8, textAlign: 'center', bgcolor: '#fff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>{isChhattisgarhi ? 'करंट (Amps)' : 'करंट (Amps)'}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0288d1' }}>{telemetry.currentAmps} A</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 0.8, textAlign: 'center', bgcolor: '#fff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>{isChhattisgarhi ? 'ड्राई-रन सुरक्षा' : 'ड्राई-रन सुरक्षा'}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#16a34a' }}>{isChhattisgarhi ? '✅ सुरक्षित (पानी हे)' : '✅ सुरक्षित (पानी उपलब्ध)'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper elevation={0} sx={{ p: 0.8, textAlign: 'center', bgcolor: '#fff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>{isChhattisgarhi ? 'मोटर तापमान' : 'मोटर तापमान'}</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0288d1' }}>{telemetry.motorTemp}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* Launcher for Dedicated Modal */}
              {onOpenMotorModal && (
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<LaunchIcon sx={{ fontSize: 14 }} />}
                  onClick={() => {
                    handleClose();
                    onOpenMotorModal();
                  }}
                  sx={{ borderColor: '#b3e5fc', color: '#0288d1', fontWeight: 700, borderRadius: '8px', fontSize: '0.74rem' }}
                >
                  {isChhattisgarhi ? 'विस्तृत टाइमर व ऑटो-कट स्क्रीन खोलव' : 'विस्तृत टाइमर व ऑटो-कट स्क्रीन खोलें'}
                </Button>
              )}
            </Box>
          </Collapse>
        </Card>

        {/* ========================================================================= */}
        {/* 2. ACCORDION CARD: SMART SOIL IOT SENSOR (BLUETOOTH BLE) */}
        {/* ========================================================================= */}
        <Card
          sx={{
            mb: 2,
            borderRadius: '16px',
            border: '1.5px solid #c8e6c9',
            bgcolor: '#ffffff',
            boxShadow: '0 2px 10px rgba(46, 125, 50, 0.06)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Card Clickable Header */}
          <Box
            onClick={() => toggleCard('soilProbe')}
            sx={{
              p: 1.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: expandedCards.soilProbe ? '#f1f8e9' : '#ffffff',
              borderBottom: expandedCards.soilProbe ? '1px solid #dcedc8' : 'none',
              '&:hover': { bgcolor: '#f1f8e9' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ bgcolor: '#e8f5e9', p: 0.9, borderRadius: '12px', display: 'flex' }}>
                <ScienceIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    {isChhattisgarhi ? 'स्मार्ट माटी IoT सेंसर' : 'स्मार्ट मिट्टी IoT सेंसर'}
                  </Typography>
                  <Chip
                    label={registry.soilProbe?.connected ? (isChhattisgarhi ? 'सक्रिय 🔵' : 'सक्रिय 🔵') : (isChhattisgarhi ? 'स्टैंडबाय ⚪' : 'स्टैंडबाय ⚪')}
                    size="small"
                    sx={{
                      bgcolor: registry.soilProbe?.connected ? '#e3f2fd' : '#f1f5f9',
                      color: registry.soilProbe?.connected ? '#0d47a1' : '#64748b',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      height: 22,
                      borderRadius: '6px'
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  AgriProbe BLE • {isChhattisgarhi ? 'यंत्र' : 'उपकरण'}: <strong>{registry.soilProbe?.deviceName || 'AgriProbe BLE'}</strong> • {isChhattisgarhi ? 'बैटरी' : 'बैटरी'}: 85%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  if (registry.soilProbe?.connected) {
                    handleDisconnectBle();
                  } else {
                    handleConnectBle();
                  }
                }}
                disabled={bleScanning}
                sx={{
                  bgcolor: registry.soilProbe?.connected ? '#546e7a' : '#2e7d32',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: '10px',
                  py: 0.5,
                  px: 1.2,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: registry.soilProbe?.connected ? '#37474f' : '#1b5e20' }
                }}
              >
                {bleScanning ? (isChhattisgarhi ? 'सेंसर खोजत हन...' : 'सेंसर खोज रहे हैं...') : registry.soilProbe?.connected ? (isChhattisgarhi ? 'डिस्कनेक्ट' : 'डिस्कनेक्ट') : (isChhattisgarhi ? '📡 ब्लूटूथ जोड़व' : '📡 ब्लूटूथ जोड़ें')}
              </Button>
              <IconButton size="small" sx={{ color: '#2e7d32' }}>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedCards.soilProbe ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                />
              </IconButton>
            </Box>
          </Box>

          {/* Expandable Body Content */}
          <Collapse in={expandedCards.soilProbe}>
            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', mb: 1 }}>
                {isChhattisgarhi ? '📊 लाइव माटी पोषण टेलीमेट्री (Live NPK & pH):' : '📊 लाइव मिट्टी पोषण टेलीमेट्री (Live NPK & pH):'}
              </Typography>

              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={4} sm={2.4}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'pH मान' : 'pH मान'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20' }}>6.8 ({isChhattisgarhi ? 'बनेच' : 'उत्तम'})</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4} sm={2.4}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'नाइट्रोजन (N)' : 'नाइट्रोजन (N)'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20' }}>185 mg/kg</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4} sm={2.4}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'फास्फोरस (P)' : 'फास्फोरस (P)'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20' }}>14.2 mg/kg</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'पोटाश (K)' : 'पोटाश (K)'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20' }}>210 mg/kg</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={2.4}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'नमी (Moisture)' : 'नमी (Moisture)'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0288d1' }}>68% ({isChhattisgarhi ? 'गीला' : 'गीला'})</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Apply to Fertilizer Calculator CTA */}
              <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: '12px', border: '1px solid #c8e6c9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1b5e20', display: 'block' }}>
                    {isChhattisgarhi ? '🌱 खाद कैलकुलेटर म सीधे लागू करव:' : '🌱 खाद कैलकुलेटर में सीधे लागू करें:'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem' }}>
                    {isChhattisgarhi
                      ? 'ये माटी रीडिंग के आधार म यूरिया, DAP अउ पोटाश के सही बोरी के हिसाब लगाव'
                      : 'इस मिट्टी रीडिंग के आधार पर यूरिया, DAP और पोटाश की सही बोरियों का हिसाब लगाएं'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {onOpenSoilIot && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        handleClose();
                        onOpenSoilIot();
                      }}
                      sx={{ borderColor: '#2e7d32', color: '#1b5e20', fontWeight: 800, borderRadius: '8px', fontSize: '0.74rem' }}
                    >
                      {isChhattisgarhi ? 'विस्तृत रिपोर्ट' : 'विस्तृत रिपोर्ट'}
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      handleClose();
                      if (onApplySoilToCalc) onApplySoilToCalc();
                      notify.success(isChhattisgarhi ? 'माटी सेंसर डेटा खाद कैलकुलेटर म लागू हो गे!' : 'मिट्टी सेंसर डेटा खाद कैलकुलेटर में लागू हुआ!');
                    }}
                    sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, borderRadius: '8px', fontSize: '0.74rem' }}
                  >
                    {isChhattisgarhi ? 'खाद म लागू करव ➔' : 'खाद में लागू करें ➔'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Card>

        {/* ========================================================================= */}
        {/* 3. ACCORDION CARD: FIELD GPS TRACKER (SATELLITE AREA MEASURE) */}
        {/* ========================================================================= */}
        <Card
          sx={{
            mb: 2,
            borderRadius: '16px',
            border: '1.5px solid #b2dfdb',
            bgcolor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 137, 123, 0.06)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Card Clickable Header */}
          <Box
            onClick={() => toggleCard('gpsTracker')}
            sx={{
              p: 1.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: expandedCards.gpsTracker ? '#e0f2f1' : '#ffffff',
              borderBottom: expandedCards.gpsTracker ? '1px solid #b2dfdb' : 'none',
              '&:hover': { bgcolor: '#e0f2f1' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ bgcolor: '#e0f2f1', p: 0.9, borderRadius: '12px', display: 'flex' }}>
                <DirectionsWalkIcon sx={{ color: '#00897b', fontSize: 24 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    {isChhattisgarhi ? 'खेत मेड़ GPS नापक' : 'खेत सीमा GPS मापक'}
                  </Typography>
                  <Chip
                    label={isChhattisgarhi ? 'GPS चालू 🛰️' : 'GPS सक्रिय 🛰️'}
                    size="small"
                    sx={{ bgcolor: '#e0f2f1', color: '#004d40', fontWeight: 800, fontSize: '0.7rem', height: 22, borderRadius: '6px' }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {isChhattisgarhi ? 'उपग्रह नेविगेशन • सटीकता: ±2.5 मीटर • 14 उपग्रह लॉक' : 'उपग्रह नेविगेशन • सटीकता: ±2.5 मीटर • 14 उपग्रह लॉक'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  if (onOpenGpsTracker) onOpenGpsTracker();
                }}
                sx={{
                  bgcolor: '#00897b',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: '10px',
                  py: 0.5,
                  px: 1.2,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#00695c' }
                }}
              >
                {isChhattisgarhi ? '🚶‍♂️ खेत नापव' : '🚶‍♂️ खेत नापें'}
              </Button>
              <IconButton size="small" sx={{ color: '#00897b' }}>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedCards.gpsTracker ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                />
              </IconButton>
            </Box>
          </Box>

          {/* Expandable Body Content */}
          <Collapse in={expandedCards.gpsTracker}>
            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
              <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.8rem', lineHeight: 1.6, mb: 1.5 }}>
                {isChhattisgarhi
                  ? 'खेत के मेड़ म चारों कोती रेंग के जीपीएस ले एकड़ अउ डिसमिल म सटीक रकबा निकालव। ये तकनीक बिना इंटरनेट के भी सीधे उपग्रह सिग्नल ले चलथे।'
                  : 'खेत की मेड़ पर चारों ओर चलकर जीपीएस से एकड़ व डिसमिल में सटीक रकबा निकालें। यह तकनीक बिना इंटरनेट के भी सीधे उपग्रह सिग्नल से चलती है।'}
              </Typography>
              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block', mb: 0.5 }}>
                  {isChhattisgarhi ? '📍 मेड़ नापे के 3 सरल नियम:' : '📍 मेड़ नापने के 3 सरल नियम:'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803d', display: 'block', fontSize: '0.72rem' }}>
                  {isChhattisgarhi ? (
                    <>
                      1. खेत के पहिली कोना (मेड़) म खड़े हो के <strong>'नापना शुरू करव'</strong> दबावहू।<br />
                      2. मेड़ म रेंगत चारों कोना म रुकव अउ बिंदु जोड़व।<br />
                      3. वापस पहिली कोना म आ के <strong>'नाप पूरा करव'</strong> दबाते एकड़ रकबा सुरक्षित हो जही।
                    </>
                  ) : (
                    <>
                      1. खेत के पहले कोने (मेड़) पर खड़े हों और <strong>'नापी शुरू करें'</strong> दबाएं।<br />
                      2. मेड़ की सीमा पर चलते हुए चारों कोनों पर रुकें और बिंदु जोड़ें।<br />
                      3. वापस पहले कोने पर आकर <strong>'नापी पूर्ण करें'</strong> दबाते ही एकड़ रकबा सुरक्षित हो जाएगा।
                    </>
                  )}
                </Typography>
              </Box>
              {onOpenGpsTracker && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleClose();
                    onOpenGpsTracker();
                  }}
                  sx={{ borderColor: '#00897b', color: '#00897b', fontWeight: 800, borderRadius: '10px' }}
                >
                  {isChhattisgarhi ? 'पूरा GPS नेविगेशन व मेड़ ट्रैकर खोलव' : 'पूर्ण GPS नेविगेशन व मेड़ ट्रैकर खोलें'}
                </Button>
              )}
            </Box>
          </Collapse>
        </Card>

        {/* ========================================================================= */}
        {/* 4. ACCORDION CARD: SMART 15L SPRAYER & FLOW METER */}
        {/* ========================================================================= */}
        <Card
          sx={{
            mb: 2,
            borderRadius: '16px',
            border: '1.5px solid #ffe082',
            bgcolor: '#ffffff',
            boxShadow: '0 2px 10px rgba(245, 127, 23, 0.06)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Card Clickable Header */}
          <Box
            onClick={() => toggleCard('smartSprayer')}
            sx={{
              p: 1.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: expandedCards.smartSprayer ? '#fffde7' : '#ffffff',
              borderBottom: expandedCards.smartSprayer ? '1px solid #fff59d' : 'none',
              '&:hover': { bgcolor: '#fffde7' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ bgcolor: '#fff8e1', p: 0.9, borderRadius: '12px', display: 'flex' }}>
                <SpeedIcon sx={{ color: '#f57f17', fontSize: 24 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                    {isChhattisgarhi ? 'स्मार्ट 15L स्प्रे पंप व फ्लो मीटर' : 'स्मार्ट 15L स्प्रे पंप व फ्लो मीटर'}
                  </Typography>
                  <Chip
                    label={isChhattisgarhi ? 'मानक सेट' : 'मानक सेट'}
                    size="small"
                    sx={{ bgcolor: '#fff8e1', color: '#e65100', fontWeight: 800, fontSize: '0.7rem', height: 22, borderRadius: '6px' }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {isChhattisgarhi ? 'टंकी क्षमता' : 'टंकी क्षमता'}: <strong>15 {isChhattisgarhi ? 'लीटर (मानक)' : 'लीटर (मानक)'}</strong> • {isChhattisgarhi ? 'फ्लो रेट' : 'फ्लो रेट'}: 1.2 L/{isChhattisgarhi ? 'मिनट' : 'मिनट'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#f57f17' }}>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedCards.smartSprayer ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                />
              </IconButton>
            </Box>
          </Box>

          {/* Expandable Body Content */}
          <Collapse in={expandedCards.smartSprayer}>
            <Box sx={{ p: 2, bgcolor: '#ffffff' }}>
              <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#fff8e1', borderRadius: '10px', border: '1px solid #ffe082' }}>
                    <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'टंकी नाप' : 'टंकी नाप'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#e65100' }}>15 {isChhattisgarhi ? 'लीटर' : 'लीटर'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#fff8e1', borderRadius: '10px', border: '1px solid #ffe082' }}>
                    <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'नोजल बहाव' : 'नोजल बहाव'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#e65100' }}>1.2 L / {isChhattisgarhi ? 'मिनट' : 'मिनट'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#fff8e1', borderRadius: '10px', border: '1px solid #ffe082' }}>
                    <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'प्रति एकड़ टंकी' : 'प्रति एकड़ टंकी'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#e65100' }}>10 - 12 {isChhattisgarhi ? 'टंकी' : 'टंकी'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 1, textAlign: 'center', bgcolor: '#fff8e1', borderRadius: '10px', border: '1px solid #ffe082' }}>
                    <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.68rem', display: 'block' }}>{isChhattisgarhi ? 'पानी के मात्रा' : 'पानी की मात्रा'}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#e65100' }}>150 - 180 L/{isChhattisgarhi ? 'एकड़' : 'एकड़'}</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>
                {isChhattisgarhi
                  ? '* सलाह: फसल डॉक्टर म बताय गे दवाई के मात्रा हमेशा 15 लीटर पानी के टंकी के हिसाब ले ही बनावहू।'
                  : '* टिप: फसल डॉक्टर में सुझाई गई दवा की मात्रा हमेशा 15 लीटर पानी की टंकी के अनुसार ही तैयार करें।'}
              </Typography>
            </Box>
          </Collapse>
        </Card>

        {/* ========================================================================= */}
        {/* 5. ACCORDION CARD: CONNECTION & FARMER TROUBLESHOOTING GUIDE */}
        {/* ========================================================================= */}
        <Card
          sx={{
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Card Clickable Header */}
          <Box
            onClick={() => toggleCard('guide')}
            sx={{
              p: 1.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              bgcolor: expandedCards.guide ? '#f8fafc' : '#ffffff',
              borderBottom: expandedCards.guide ? '1px solid #e2e8f0' : 'none',
              '&:hover': { bgcolor: '#f8fafc' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ bgcolor: '#f1f5f9', p: 0.9, borderRadius: '12px', display: 'flex' }}>
                <InfoOutlinedIcon sx={{ color: '#475569', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                  {isChhattisgarhi ? '📖 कनेक्शन सहायता व किसान गाइड' : '📖 कनेक्शन सहायता व किसान गाइड'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {isChhattisgarhi ? 'मोटर GSM सिम, ब्लूटूथ प्रोब अउ GPS से जुड़े सवाल' : 'मोटर GSM सिम, ब्लूटूथ प्रोब और GPS से जुड़े सामान्य सवालों के उत्तर'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#475569' }}>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedCards.guide ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease'
                  }}
                />
              </IconButton>
            </Box>
          </Box>

          {/* Expandable Body Content */}
          <Collapse in={expandedCards.guide}>
            <Box sx={{ p: 2, bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', mb: 0.5 }}>
                  {isChhattisgarhi ? '1. बोरवेल GSM मोटर स्टार्टर कइसे काम करथे?' : '1. बोरवेल GSM मोटर स्टार्टर कैसे काम करता है?'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {isChhattisgarhi ? 'बजार म मिलइया किसानी GSM स्टार्टर (जइसे Shanti, Kisan Raja आदि) म एक साधारण सिम कार्ड लगथे। ए ऐप म सिरिफ ओ सिम नंबर दर्ज करव। अपन घर बइठे 1-टैप ले कॉल कर सकथो या SMS (START/STOP) भेजके मोटर चालू अउ बंद कर सकथो।' : 'बाजार में मिलने वाले कृषि GSM स्टार्टर (जैसे Shanti, Kisan Raja आदि) में एक साधारण सिम कार्ड लगता है। इस ऐप में केवल वह सिम नंबर दर्ज करें। आप घर बैठे 1-टैप से कॉल कर सकते हैं या SMS (START/STOP) भेजकर मोटर चालू व बंद कर सकते हैं।'}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', mb: 0.5 }}>
                  {isChhattisgarhi ? '2. ब्लूटूथ (BLE) माटी जांच प्रोब कइसे जोड़व?' : '2. ब्लूटूथ (BLE) मिट्टी प्रोब कैसे जोड़ें?'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {isChhattisgarhi ? 'अपन मोबाइल के ब्लूटूथ चालू करव। सेंसर के पावर बटन दबावहू। ऐप म \'ब्लूटूथ जोड़व\' दबातेच डिवाइस सूची दिखही, ओमा टैप करके पेयर करव। ये ह अपने-आप NPK अउ pH नापके खाद कैलकुलेटर म भेज दिही।' : 'अपने मोबाइल का ब्लूटूथ चालू करें। सेंसर का पावर बटन दबाएं। ऐप में \'ब्लूटूथ जोड़ें\' दबाते ही डिवाइस सूची दिखेगी, उस पर टैप करके पेयर करें। यह स्वतः NPK और pH नापकर खाद कैलकुलेटर में भेज देगा।'}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', mb: 0.5 }}>
                  {isChhattisgarhi ? '3. खेत GPS नाप के एक्यूरेसी कइसे बढ़ावव?' : '3. खेत GPS मापक की सटीकता कैसे बढ़ाएं?'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {isChhattisgarhi ? 'खेत के उघरा घाम म ठाढ़ होके नाप सुरू करव। रुख-राई या बिजली तार तीर रुके ले बचव। मेड़ के चारों कोना म रेंगत बेरा GPS सटीकता ±2 ले ±3 मीटर तक पहुंच जाथे।' : 'खेत की खुली धूप में खड़े होकर नाप शुरू करें। पेड़ों या बिजली के तारों के नीचे रुकने से बचें। मेड़ के चारों कोनों पर चलते समय GPS सटीकता ±2 से ±3 मीटर तक पहुंच जाती है।'}
                </Typography>
              </Paper>
            </Box>
          </Collapse>
        </Card>

      </DialogContent>

      {/* Modal Bottom Actions */}
      <DialogActions sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
          {isChhattisgarhi ? 'किसान साथी • सबो हार्डवेयर रजिस्ट्री (Zero-Scroll)' : 'किसान साथी • ऑल-इन-वन हार्डवेयर रजिस्ट्री (Zero-Scroll)'}
        </Typography>
        <Button onClick={handleClose} variant="contained" sx={{ bgcolor: '#1b5e20', borderRadius: '10px', fontWeight: 800 }}>
          {isChhattisgarhi ? 'पूरा (Done)' : 'पूर्ण (Done)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
