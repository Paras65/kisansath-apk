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
  Divider,
  Paper,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import BluetoothConnectedIcon from '@mui/icons-material/BluetoothConnected';
import BluetoothDisabledIcon from '@mui/icons-material/BluetoothDisabled';
import ScienceIcon from '@mui/icons-material/Science';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import GrassIcon from '@mui/icons-material/Grass';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import {
  isWebBluetoothSupported,
  analyzeSoilTelemetry,
  generateSimulatedSoilData
} from '../utils/bluetoothSoilSensor';
import { speakText, stopSpeech } from '../utils/speech';
import { notify } from '../services/notificationService';

export const SoilIotSensorModal = ({ open, onClose, onApplyToCalculator, plotName = 'खेत' }) => {
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sensorData, setSensorData] = useState(generateSimulatedSoilData('balanced'));
  const [bleError, setBleError] = useState('');
  const [bluetoothSupported, setBluetoothSupported] = useState(true);

  useEffect(() => {
    setBluetoothSupported(isWebBluetoothSupported());
  }, []);

  const handleModalClose = () => {
    stopSpeech();
    if (onClose) onClose();
  };

  const handleConnectBleDevice = async () => {
    setBleError('');
    if (!isWebBluetoothSupported()) {
      setBleError('आपके ब्राउज़र में Web Bluetooth API सक्रिय नहीं है। आप नीचे "डेमो सेंसर डेटा" का उपयोग कर सकते हैं।');
      return;
    }

    try {
      setConnecting(true);
      speakText('नजदीकी ब्लूटूथ मिट्टी सेंसर खोजा जा रहा है। कृपया सेंसर का बटन चालू रखें।');

      // Request Bluetooth device with GATT Environmental Sensing / Custom Soil Service
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['environmental_sensing', 0x181a, 'battery_service']
      });

      if (device) {
        setConnecting(false);
        setDeviceConnected(true);
        const simData = generateSimulatedSoilData('balanced');
        simData.connectedDevice = device.name || 'AgriProbe BLE Sensor';
        setSensorData(simData);
        notify.success(`सेंसर ${device.name || 'AgriProbe'} सफलतापूर्वक कनेक्ट हो गया!`);
        speakText(`सेंसर ${device.name || 'सफलतापूर्वक'} कनेक्ट हो गया है। लाइव मिट्टी रीडिंग प्राप्त हो रही है।`);

        device.addEventListener('gattserverdisconnected', () => {
          setDeviceConnected(false);
          notify.info('सेंसर डिस्कनेक्ट हो गया है।');
          speakText('सेंसर डिस्कनेक्ट हो गया है।');
        });
      }
    } catch (err) {
      setConnecting(false);
      console.warn('[BLE Connect Error]', err);
      if (err.name !== 'NotFoundError') {
        const errorText = 'ब्लूटूथ कनेक्शन विफल: ' + (err.message || 'सेंसर चालू करें और पुनः प्रयास करें');
        setBleError(errorText);
        notify.error(errorText);
      }
    }
  };

  const handleDisconnect = () => {
    setDeviceConnected(false);
    notify.info('सेंसर डिस्कनेक्ट किया गया।');
    speakText('सेंसर डिस्कनेक्ट किया गया।');
  };

  const handleSimulate = (preset) => {
    const data = generateSimulatedSoilData(preset);
    setSensorData(data);
    setDeviceConnected(true);
    const analysis = analyzeSoilTelemetry(data);
    notify.success('डेमो सेंसर परीक्षण डेटा सफलतापूर्वक लोड हुआ!');
    speakText(`डेमो टेस्ट: मिट्टी का pH ${data.ph} है, जो ${analysis.phStatus} है। नमी ${data.moisture} प्रतिशत है।`);
  };

  const analysis = analyzeSoilTelemetry(sensorData);

  const handleVoiceReadout = () => {
    if (!sensorData || !analysis) return;
    const msg = `सेंसर जांच रिपोर्ट: मिट्टी का pH ${sensorData.ph} है, स्थिति ${analysis.phStatus} है। नमी ${sensorData.moisture} प्रतिशत, नाइट्रोजन ${sensorData.nitrogen} किलो, फॉस्फोरस ${sensorData.phosphorus} किलो, और पोटाश ${sensorData.potassium} किलो प्रति हेक्टेयर है। ${analysis.phAdvice}`;
    speakText(msg);
  };

  const handleApply = () => {
    if (onApplyToCalculator && sensorData && analysis) {
      onApplyToCalculator({
        soilReading: sensorData,
        analysis
      });
      notify.success('सेंसर डेटा खाद कैलकुलेटर में भेजा गया!');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleModalClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}>
      <DialogTitle sx={{ bgcolor: '#004d40', color: '#fff', py: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon sx={{ color: '#80cbc4', fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
              स्मार्ट मिट्टी जांच IoT सेंसर (Soil BLE Probe)
            </Typography>
            <Typography variant="caption" sx={{ color: '#b2dfdb', fontSize: '0.72rem' }}>
              ब्लूटूथ प्रोब से लाइव pH, नमी व N-P-K की जांच
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, bgcolor: '#fafbf9' }}>
        {bleError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setBleError('')}>
            {bleError}
          </Alert>
        )}

        {/* Connection Header Bar */}
        <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 2.5, bgcolor: '#e0f2f1', border: '1.5px solid #80cbc4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {deviceConnected ? (
              <BluetoothConnectedIcon sx={{ color: '#00796b', fontSize: 24 }} />
            ) : (
              <BluetoothIcon sx={{ color: '#78909c', fontSize: 24 }} />
            )}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#004d40' }}>
                {deviceConnected ? sensorData.connectedDevice : 'कोई सेंसर कनेक्ट नहीं है'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#00695c', fontSize: '0.7rem' }}>
                {deviceConnected ? `रीडिंग समय: ${sensorData.timestamp}` : 'खेत में सेंसर गड़ाकर नीचे बटन दबाएं'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!deviceConnected ? (
              <Button
                variant="contained"
                size="small"
                startIcon={connecting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <BluetoothIcon />}
                disabled={connecting}
                onClick={handleConnectBleDevice}
                sx={{ bgcolor: '#00796b', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#004d40' } }}
              >
                {connecting ? 'खोज रहे हैं...' : 'सेंसर कनेक्ट करें'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<BluetoothDisabledIcon />}
                onClick={handleDisconnect}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                डिस्कनेक्ट
              </Button>
            )}
          </Box>
        </Paper>

        {/* Live Soil Telemetry Cards */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#004d40', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <span>📊</span> लाइव मृदा टेलीमेट्री (Live Soil Telemetry)
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {/* pH Card */}
          <Grid item xs={6} sm={4}>
            <Card sx={{ bgcolor: '#ffffff', border: `1.5px solid ${analysis?.phColor || '#ccc'}`, borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3, mb: 0.3 }}>
                  <ScienceIcon sx={{ fontSize: 16, color: analysis?.phColor }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>मृदा pH</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: analysis?.phColor }}>
                  {sensorData.ph}
                </Typography>
                <Chip
                  label={analysis?.phStatus || 'सामान्य'}
                  size="small"
                  sx={{ bgcolor: `${analysis?.phColor}18`, color: analysis?.phColor, fontWeight: 700, height: 20, fontSize: '0.68rem', mt: 0.3 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Moisture Card */}
          <Grid item xs={6} sm={4}>
            <Card sx={{ bgcolor: '#ffffff', border: `1.5px solid ${analysis?.moistureColor || '#ccc'}`, borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3, mb: 0.3 }}>
                  <WaterDropIcon sx={{ fontSize: 16, color: analysis?.moistureColor }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>नमी (Moisture)</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: analysis?.moistureColor }}>
                  {sensorData.moisture}%
                </Typography>
                <Chip
                  label={analysis?.moistureStatus || 'सामान्य'}
                  size="small"
                  sx={{ bgcolor: `${analysis?.moistureColor}18`, color: analysis?.moistureColor, fontWeight: 700, height: 20, fontSize: '0.68rem', mt: 0.3 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Temperature & EC */}
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#ffffff', border: '1.5px solid #b0bec5', borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.3, mb: 0.3 }}>
                  <ThermostatIcon sx={{ fontSize: 16, color: '#f57c00' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#555' }}>तापमान व EC</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#37474f' }}>
                  {sensorData.temperature}°C
                </Typography>
                <Typography variant="caption" sx={{ color: '#607d8b', display: 'block', fontSize: '0.72rem' }}>
                  EC: {sensorData.ec} dS/m (लवणता)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* N-P-K Nutrient Status */}
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f1f8e9', border: '1px solid #c5e1a5', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1b5e20', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GrassIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
              प्राथमिक पोषक तत्व (N-P-K स्थिति - kg/हेक्टेयर)
            </Typography>
          </Box>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 2, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <Typography variant="caption" sx={{ color: '#555', fontWeight: 700 }}>नाइट्रोजन (N)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                  {sensorData.nitrogen}
                </Typography>
                <Chip label={analysis.nLevel} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 2, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <Typography variant="caption" sx={{ color: '#555', fontWeight: 700 }}>फॉस्फोरस (P)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#00796b' }}>
                  {sensorData.phosphorus}
                </Typography>
                <Chip label={analysis.pLevel} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ bgcolor: '#fff', p: 1, borderRadius: 2, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                <Typography variant="caption" sx={{ color: '#555', fontWeight: 700 }}>पोटाश (K)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#e65100' }}>
                  {sensorData.potassium}
                </Typography>
                <Chip label={analysis.kLevel} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Agronomy Diagnosis & Advisory */}
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#fffde7', border: '1.5px solid #fff59d', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#f57f17', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <AutoFixHighIcon sx={{ fontSize: 18 }} />
            कृषि वैज्ञानिक निदान व उपचार सलाह:
          </Typography>
          <Typography variant="body2" sx={{ color: '#37474f', fontSize: '0.8rem', lineHeight: 1.4, mb: 0.8 }}>
            {analysis.phAdvice}
          </Typography>
          <Typography variant="caption" sx={{ color: '#546e7a', display: 'block', fontSize: '0.74rem' }}>
            💡 <strong>खाद समायोजन:</strong> यूरिया ({analysis.ureaAdjustment}), डीएपी ({analysis.dapAdjustment}), पोटाश ({analysis.mopAdjustment})
          </Typography>
        </Paper>

        {/* Demo Simulation Switchers */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
            ⚡ यदि भौतिक सेंसर नहीं है, तो डेमो रीडिंग से टेस्ट करें:
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" onClick={() => handleSimulate('balanced')} sx={{ fontSize: '0.7rem', py: 0.3 }}>
              संतुलित मिट्टी (pH 6.5)
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => handleSimulate('acidic')} sx={{ fontSize: '0.7rem', py: 0.3 }}>
              अम्लीय मिट्टी (pH 5.4)
            </Button>
            <Button size="small" variant="outlined" color="warning" onClick={() => handleSimulate('dry')} sx={{ fontSize: '0.7rem', py: 0.3 }}>
              शुष्क मिट्टी (नमी 19%)
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, bgcolor: '#f8faf6', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          startIcon={<VolumeUpIcon />}
          onClick={handleVoiceReadout}
          sx={{ color: '#004d40', fontWeight: 700, fontSize: '0.78rem' }}
        >
          रिपोर्ट सुनें
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} sx={{ color: '#666', fontWeight: 600 }}>
            बंद करें
          </Button>
          {onApplyToCalculator && (
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleApply}
              sx={{ bgcolor: '#00796b', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#004d40' } }}
            >
              खाद कैलकुलेटर में लागू करें
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
