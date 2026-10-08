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
  CardContent,
  Chip,
  Alert,
  IconButton,
  TextField,
  Divider,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import SmsIcon from '@mui/icons-material/Sms';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';

import {
  getStoredMotorConfig,
  saveMotorConfig,
  getGsmActionUri,
  getMotorTelemetry
} from '../utils/motorControllerService';
import { validateIndianPhone, updateDevice } from '../services/deviceManagerService';
import { speakText, stopSpeech } from '../utils/speech';
import { notify } from '../services/notificationService';
import { openNativeSms, vibrateDevice } from '../utils/capacitorUtils';
import { useLanguage } from '../utils/i18n';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';

export const MotorControllerModal = ({ open, onClose, weatherContext }) => {
  const { isChhattisgarhi } = useLanguage();
  const [config, setConfig] = useState(getStoredMotorConfig());
  const [isMotorOn, setIsMotorOn] = useState(config.lastState === 'ON');
  const [timerSelected, setTimerSelected] = useState(config.timerMinutes || 60);
  const [showConfigEdit, setShowConfigEdit] = useState(false);
  const [starterPhoneInput, setStarterPhoneInput] = useState(config.starterPhone || '');
  const [noticeMsg, setNoticeMsg] = useState('');

  useEffect(() => {
    if (open) {
      const stored = getStoredMotorConfig();
      setConfig(stored);
      setIsMotorOn(stored.lastState === 'ON');
      setStarterPhoneInput(stored.starterPhone || '');
    }
  }, [open]);

  const handleModalClose = () => {
    stopSpeech();
    if (onClose) onClose();
  };

  const telemetry = getMotorTelemetry(isMotorOn);

  const handleToggleMotor = (nextState) => {
    setIsMotorOn(nextState);
    const updatedConfig = { ...config, lastState: nextState ? 'ON' : 'OFF' };
    setConfig(updatedConfig);
    saveMotorConfig(updatedConfig);
    updateDevice('motor', { status: nextState ? 'ON' : 'OFF' });

    vibrateDevice(nextState ? 100 : 200);

    if (nextState) {
      const msg = isChhattisgarhi
        ? `बोरवेल मोटर चालू कर दे गे हे। 3-फेज 415 वोल्ट बिजली चालू हे। टाइमर ${timerSelected} मिनट सेट हे।`
        : `बोरवेल मोटर चालू कर दी गई है। 3-फेज 415 वोल्ट बिजली सक्रिय है। टाइमर ${timerSelected} मिनट सेट है।`;
      speakText(msg);
      const text = isChhattisgarhi
        ? `✅ बोरवेल मोटर चालू! टाइमर: ${timerSelected} मिनट बाद अपने-आप बंद होही।`
        : `✅ बोरवेल मोटर चालू! टाइमर: ${timerSelected} मिनट बाद स्वतः बंद होगी।`;
      setNoticeMsg(text);
      notify.success(text);
    } else {
      const msg = isChhattisgarhi ? 'बोरवेल मोटर बंद कर दे गे हे।' : 'बोरवेल मोटर बंद कर दी गई है।';
      speakText(msg);
      const text = isChhattisgarhi ? '🛑 बोरवेल मोटर सुरक्षित रूप ले बंद हो गे।' : '🛑 बोरवेल मोटर सुरक्षित रूप से बंद की गई।';
      setNoticeMsg(text);
      notify.info(text);
    }
  };

  const handleSendGsmSms = (action) => {
    if (!config.starterPhone) {
      setShowConfigEdit(true);
      const text = 'कृपया पहले अपने खेत के GSM स्टार्टर का सिम नंबर दर्ज करें।';
      setNoticeMsg(text);
      notify.warning(text);
      return;
    }
    const prefix = config.pin ? `${config.pin} ` : '';
    const body = action === 'ON' ? `${prefix}START` : action === 'OFF' ? `${prefix}STOP` : `${prefix}STATUS`;
    openNativeSms(config.starterPhone, body);
    handleToggleMotor(action === 'ON');
  };

  const handleSavePhone = () => {
    const phoneCheck = validateIndianPhone(starterPhoneInput);
    if (!phoneCheck.isValid) {
      notify.warning(phoneCheck.message);
      return;
    }
    const updated = { ...config, starterPhone: phoneCheck.cleanPhone };
    setConfig(updated);
    saveMotorConfig(updated);
    updateDevice('motor', { phone: phoneCheck.cleanPhone, configured: true });
    setShowConfigEdit(false);
    const text = `स्टार्टर सिम नंबर ${phoneCheck.cleanPhone} सुरक्षित कर लिया गया है!`;
    setNoticeMsg(text);
    notify.success(text);
  };

  const handleVoiceReport = () => {
    const statusText = isMotorOn ? (isChhattisgarhi ? 'चालू' : 'चालू') : (isChhattisgarhi ? 'बंद' : 'बंद');
    const msg = isChhattisgarhi
      ? `ट्यूबवेल के हाल: मोटर अभी ${statusText} हे। खेत म 3-फेज 415 वोल्ट बिजली आवत हे। बोरवेल म बनेच पानी हे अउ मोटर सुरक्षित हे।`
      : `ट्यूबवेल की स्थिति: मोटर अभी ${statusText} है। खेत में 3-फेज 415 वोल्ट बिजली आ रही है। बोरवेल में पर्याप्त जलस्तर है और मोटर सुरक्षित है।`;
    speakText(msg);
  };

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}>
      <DialogTitle sx={{ bgcolor: '#01579b', color: '#fff', py: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PowerSettingsNewIcon sx={{ color: '#81d4fa', fontSize: 28 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
              {isChhattisgarhi ? 'स्मार्ट ट्यूबवेल व मोटर कंट्रोलर' : 'स्मार्ट ट्यूबवेल व मोटर कंट्रोलर'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b3e5fc', fontSize: '0.72rem' }}>
              {isChhattisgarhi ? 'घर बैठे बोरवेल मोटर चालू/बंद व 3-फेज बिजली स्थिति' : 'घर बैठे बोरवेल मोटर चालू/बंद व 3-फेज बिजली स्थिति'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KakaWalkthroughButton featureId="motor" sx={{ bgcolor: 'rgba(255,255,255,0.92)' }} />
          <IconButton size="small" onClick={handleModalClose} sx={{ color: '#fff' }} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, bgcolor: '#fafbf9' }}>
        {noticeMsg && (
          <Alert severity={isMotorOn ? 'success' : 'info'} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setNoticeMsg('')}>
            {noticeMsg}
          </Alert>
        )}

        {/* Weather Rain Interlock Alert */}
        {weatherContext?.rainProbability > 40 && (
          <Paper elevation={0} sx={{ p: 1.3, mb: 2, borderRadius: 2.5, bgcolor: '#e1f5fe', border: '1.5px solid #81d4fa', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudQueueIcon sx={{ color: '#0288d1', fontSize: 26 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#01579b', display: 'block' }}>
                {isChhattisgarhi
                  ? `🌧️ मौसम चेतावनी (पानी गिरे के संभावना: ${weatherContext.rainProbability}%)`
                  : `🌧️ मौसम चेतावनी (बारिश संभावना: ${weatherContext.rainProbability}%)`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0277bd', fontSize: '0.73rem', lineHeight: 1.3, display: 'block' }}>
                {isChhattisgarhi
                  ? 'आज पानी गिरे के संभावना हे। खेत म अगर पानी हे त मोटर मत चलावहू, बिजली अउ पानी बाचही।'
                  : 'आज बारिश होने का पूर्वानुमान है। यदि खेत में पर्याप्त नमी है, तो मोटर चलाने से बचें और बिजली व पानी बचाएं।'}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Main Big Motor Power Switch Card */}
        <Card
          sx={{
            mb: 2,
            borderRadius: 3.5,
            border: isMotorOn ? '2px solid #2e7d32' : '2px solid #c62828',
            bgcolor: isMotorOn ? '#f1f8e9' : '#ffebee',
            textAlign: 'center',
            p: 2,
            boxShadow: isMotorOn ? '0 6px 20px rgba(46,125,50,0.18)' : '0 6px 20px rgba(198,40,40,0.12)',
            transition: 'all 0.3s'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#555', mb: 1 }}>
            {config.starterName} ({config.motorHp})
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => handleToggleMotor(!isMotorOn)}
              sx={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                bgcolor: isMotorOn ? '#2e7d32' : '#c62828',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isMotorOn ? '0 0 24px rgba(46,125,50,0.6)' : '0 0 16px rgba(198,40,40,0.4)',
                '&:hover': {
                  bgcolor: isMotorOn ? '#1b5e20' : '#b71c1c'
                }
              }}
            >
              <PowerSettingsNewIcon sx={{ fontSize: 52, mb: 0.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.05rem', lineHeight: 1 }}>
                {isMotorOn ? (isChhattisgarhi ? 'मोटर चालू' : 'मोटर ON') : (isChhattisgarhi ? 'मोटर बंद' : 'मोटर OFF')}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.9 }}>
                {isMotorOn ? (isChhattisgarhi ? 'दबा के बंद करव' : 'दबाकर बंद करें') : (isChhattisgarhi ? 'दबा के चालू करव' : 'दबाकर चालू करें')}
              </Typography>
            </Button>
          </Box>

          <Chip
            icon={isMotorOn ? <WaterDropIcon sx={{ fontSize: 16 }} /> : <ElectricBoltIcon sx={{ fontSize: 16 }} />}
            label={isMotorOn
              ? (isChhattisgarhi ? '🟢 मोटर चालू हे (पानी बोहावत हे)' : '🟢 मोटर चालू है (पानी बह रहा है)')
              : (isChhattisgarhi ? '🔴 मोटर बंद हे' : '🔴 मोटर बंद है')}
            color={isMotorOn ? 'success' : 'default'}
            sx={{ fontWeight: 800, fontSize: '0.78rem', py: 0.3 }}
          />
        </Card>

        {/* Live Telemetry Status Grid */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {/* 3-Phase Power */}
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#fff', border: '1.5px solid #bbdefb', borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.3, '&:last-child': { pb: 1.3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <ElectricBoltIcon sx={{ fontSize: 18, color: '#0288d1' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0277bd' }}>
                    {isChhattisgarhi ? '3-Phase बिजली स्थिति' : '3-Phase बिजली स्थिति'}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#01579b' }}>
                  {telemetry.voltageL1}V • {isChhattisgarhi ? 'सक्रिय (ठीक हे)' : 'सक्रिय (OK)'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.68rem', display: 'block' }}>
                  L1: {telemetry.voltageL1}V | L2: {telemetry.voltageL2}V | L3: {telemetry.voltageL3}V
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Current & Dry Run */}
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#fff', border: '1.5px solid #c8e6c9', borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.3, '&:last-child': { pb: 1.3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <SecurityIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {isChhattisgarhi ? 'ड्राई-रन सुरक्षा' : 'ड्राई-रन सुरक्षा (Dry Run)'}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                  {isChhattisgarhi ? 'सुरक्षित (पर्याप्त पानी)' : 'सुरक्षित (पर्याप्त पानी)'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.68rem', display: 'block' }}>
                  करंट: {telemetry.currentAmps}A • तापमान: {telemetry.motorTemp}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Auto-Cut Irrigation Timer */}
        <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 2.5, bgcolor: '#f0f4f8', border: '1px solid #d0d7de' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <TimerIcon sx={{ color: '#01579b', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#01579b', fontSize: '0.85rem' }}>
              {isChhattisgarhi
                ? '⏱️ ऑटो-कट टाइमर (ओतका बेरा बाद अपने आप बंद होही):'
                : '⏱️ ऑटो-कट टाइमर (निर्धारित समय बाद खुद बंद होगी):'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {[30, 60, 120, 180].map((mins) => (
              <Chip
                key={mins}
                label={mins < 60 ? `${mins} ${isChhattisgarhi ? 'मिनट' : 'मिनट'}` : `${mins / 60} ${isChhattisgarhi ? 'घंटा' : 'घंटा'}`}
                clickable
                color={timerSelected === mins ? 'primary' : 'default'}
                variant={timerSelected === mins ? 'filled' : 'outlined'}
                onClick={() => setTimerSelected(mins)}
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Paper>

        {/* GSM / Starter Sim Connection Box */}
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#fff8e1', border: '1.5px solid #ffe082', mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <PhoneAndroidIcon sx={{ color: '#f57f17', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b78103', fontSize: '0.82rem' }}>
                {isChhattisgarhi
                  ? `GSM स्टार्टर सिम नंबर: ${config.starterPhone || '(सेट नइये)'}`
                  : `GSM स्टार्टर सिम नंबर: ${config.starterPhone || '(सेट नहीं है)'}`}
              </Typography>
            </Box>
            <Button size="small" onClick={() => setShowConfigEdit(!showConfigEdit)} sx={{ fontSize: '0.72rem', color: '#b78103', fontWeight: 700 }}>
              {showConfigEdit ? (isChhattisgarhi ? 'रद्द करव' : 'रद्द करें') : (isChhattisgarhi ? 'बदलव' : 'बदलें')}
            </Button>
          </Box>

          {showConfigEdit ? (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="उदा. 98XXXXXXXX (स्टार्टर सिम नंबर)"
                value={starterPhoneInput}
                onChange={(e) => setStarterPhoneInput(e.target.value)}
              />
              <Button variant="contained" size="small" onClick={handleSavePhone} sx={{ bgcolor: '#f57f17', fontWeight: 800, borderRadius: 2, whiteSpace: 'nowrap' }}>
                {isChhattisgarhi ? 'सहेजव' : 'सहेजें'}
              </Button>
            </Box>
          ) : (
            <Typography variant="caption" sx={{ color: '#795548', display: 'block', fontSize: '0.72rem' }}>
              {isChhattisgarhi
                ? 'अगर खेत म इंटरनेट नइये, त नीचे 1-क्लिक SMS ले स्टार्टर ल सीधा ON/OFF कर सकथो।'
                : 'यदि खेत में इंटरनेट नहीं है, तो आप नीचे 1-क्लिक SMS से सीधे स्टार्टर को ON/OFF कमांड भेज सकते हैं।'}
            </Typography>
          )}

          {config.starterPhone && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                variant="outlined"
                color="success"
                size="small"
                fullWidth
                startIcon={<SmsIcon />}
                onClick={() => handleSendGsmSms('ON')}
                sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: 2 }}
              >
                {isChhattisgarhi ? 'SMS ले चालू करव' : 'SMS से ON करें'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                startIcon={<SmsIcon />}
                onClick={() => handleSendGsmSms('OFF')}
                sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: 2 }}
              >
                {isChhattisgarhi ? 'SMS ले बंद करव' : 'SMS से OFF करें'}
              </Button>
            </Box>
          )}
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, bgcolor: '#f8faf6', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<VolumeUpIcon />}
          onClick={handleVoiceReport}
          sx={{ color: '#01579b', fontWeight: 700, fontSize: '0.78rem' }}
        >
          {isChhattisgarhi ? 'आवाज म सुनव' : 'आवाज में सुनें'}
        </Button>
        <Button onClick={onClose} sx={{ color: '#666', fontWeight: 600 }}>
          {isChhattisgarhi ? 'बंद करव' : 'बंद करें'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
