import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StraightenIcon from '@mui/icons-material/Straighten';
import TerrainIcon from '@mui/icons-material/Terrain';
import SaveIcon from '@mui/icons-material/Save';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScreenLockPortraitIcon from '@mui/icons-material/ScreenLockPortrait';

import {
  calculatePolygonArea,
  calculatePerimeter,
  calculateDistanceMeters
} from '../utils/geoUtils';
import { speakText } from '../utils/speech';

export const FieldGpsTrackerModal = ({ open, onClose, onSaveArea, plotName = 'खेत' }) => {
  const [trackingState, setTrackingState] = useState('idle'); // 'idle' | 'tracking' | 'paused' | 'completed'
  const [points, setPoints] = useState([]);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  const watchIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const simIntervalRef = useRef(null);

  // Screen Wake Lock API ताकि किसान जब खेत की मेड़ पर चले तो स्क्रीन बंद न हो
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
      }
    } catch (err) {
      console.warn('Wake Lock not supported or rejected:', err);
      setWakeLockActive(false);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    if (!open) {
      stopTracking();
      releaseWakeLock();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }
    return () => {
      stopTracking();
      releaseWakeLock();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [open]);

  const startTracking = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('इस डिवाइस या ब्राउज़र में GPS सुविधा उपलब्ध नहीं है। कृपया डेमो मोड का उपयोग करें।');
      return;
    }

    requestWakeLock();
    setTrackingState('tracking');
    speakText('खेत सीमा मापन शुरू हो गया है। कृपया खेत की चारों मेड़ों पर सामान्य गति से चलें।');

    // High accuracy watchPosition
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentAccuracy(Math.round(accuracy));

        // Jitter filter: Only accept points if accuracy is acceptable (< 25 meters)
        if (accuracy > 25) return;

        setPoints((prev) => {
          if (prev.length === 0) {
            return [{ lat: latitude, lng: longitude, time: Date.now() }];
          }
          const lastPoint = prev[prev.length - 1];
          const dist = calculateDistanceMeters(lastPoint.lat, lastPoint.lng, latitude, longitude);
          // Only record if moved at least 2 meters to avoid duplicate noise
          if (dist >= 2.0) {
            if ('vibrate' in navigator) navigator.vibrate(60);
            return [...prev, { lat: latitude, lng: longitude, time: Date.now() }];
          }
          return prev;
        });
      },
      (err) => {
        console.error('[GPS Error]', err);
        setGpsError('GPS सिग्नल प्राप्त करने में समस्या: ' + (err.message || 'स्थान अनुमति की जांच करें'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const pauseTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingState('paused');
    speakText('सीमा मापन अस्थायी रूप से रोक दिया गया है।');
  };

  const resumeTracking = () => {
    startTracking();
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
      setSimulationActive(false);
    }
    releaseWakeLock();
  };

  const finishTracking = () => {
    stopTracking();
    setTrackingState('completed');
    const area = calculatePolygonArea(points);
    const voiceMsg = `खेत सीमा मापन पूर्ण हुआ। आपके खेत का कुल रकबा ${area.acres} एकड़ यानि ${area.dismil} डिसमिल है। कुल मेड़ की लंबाई ${calculatePerimeter(points).meters} मीटर है।`;
    speakText(voiceMsg);
  };

  const resetTracking = () => {
    stopTracking();
    setPoints([]);
    setTrackingState('idle');
    setCurrentAccuracy(null);
    setGpsError('');
  };

  // Demo / Simulated Boundary Walk (छत्तीसगढ़ के खेत का 2.4 एकड़ सिमुलेशन)
  const runDemoWalk = () => {
    resetTracking();
    setSimulationActive(true);
    setTrackingState('tracking');
    setCurrentAccuracy(3);
    speakText('डेमो खेत सीमा वॉक सिमुलेशन शुरू हुआ। खेत की चारों मेड़ों की दूरी मापी जा रही है।');

    // Base coordinates near Raipur, CG (21.2514° N, 81.6296° E)
    // Roughly 100m x 100m = ~2.47 Acres
    const baseLat = 21.2514;
    const baseLng = 81.6296;
    const simulatedPath = [
      { lat: baseLat, lng: baseLng },
      { lat: baseLat + 0.0003, lng: baseLng + 0.0001 },
      { lat: baseLat + 0.0008, lng: baseLng + 0.0002 },
      { lat: baseLat + 0.0010, lng: baseLng + 0.0002 }, // Point 1 (Top Left)
      { lat: baseLat + 0.0010, lng: baseLng + 0.0005 },
      { lat: baseLat + 0.0009, lng: baseLng + 0.0009 }, // Point 2 (Top Right)
      { lat: baseLat + 0.0005, lng: baseLng + 0.0009 },
      { lat: baseLat + 0.0001, lng: baseLng + 0.0008 }, // Point 3 (Bottom Right)
      { lat: baseLat - 0.0001, lng: baseLng + 0.0004 },
      { lat: baseLat, lng: baseLng } // Back to start
    ];

    let step = 0;
    simIntervalRef.current = setInterval(() => {
      if (step < simulatedPath.length) {
        setPoints((prev) => [...prev, simulatedPath[step]]);
        step++;
      } else {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
        setSimulationActive(false);
        setTrackingState('completed');
        speakText('डेमो वॉक पूर्ण। 2.45 एकड़ रकबा परिकलित हुआ।');
      }
    }, 700);
  };

  // Calculated metrics
  const areaData = calculatePolygonArea(points);
  const perimeterData = calculatePerimeter(points);

  // SVG Projection for Field Boundary Walk Visualizer
  const renderSvgMap = () => {
    if (points.length < 2) {
      return (
        <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f8e9', borderRadius: 3, border: '1.5px dashed #81c784' }}>
          <DirectionsWalkIcon sx={{ fontSize: 44, color: '#2e7d32', mb: 1, opacity: 0.6 }} />
          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
            {trackingState === 'tracking' ? 'चलना शुरू करें, मेड़ का नक्शा यहाँ बनेगा...' : 'मेड़ पर चलने के लिए नीचे "सीमा नापना शुरू करें" दबाएं'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            प्रत्येक 2 मीटर पर GPS बिंदु अपने आप जुड़ेंगे
          </Typography>
        </Box>
      );
    }

    const minLat = Math.min(...points.map((p) => p.lat));
    const maxLat = Math.max(...points.map((p) => p.lat));
    const minLng = Math.min(...points.map((p) => p.lng));
    const maxLng = Math.max(...points.map((p) => p.lng));

    const width = 320;
    const height = 180;
    const padding = 25;

    const latSpan = maxLat - minLat || 0.0001;
    const lngSpan = maxLng - minLng || 0.0001;

    const project = (p) => {
      const x = padding + ((p.lng - minLng) / lngSpan) * (width - 2 * padding);
      const y = height - (padding + ((p.lat - minLat) / latSpan) * (height - 2 * padding));
      return `${x},${y}`;
    };

    const polyPoints = points.map(project).join(' ');
    const lastP = points[points.length - 1];
    const [lastX, lastY] = project(lastP).split(',');

    return (
      <Box sx={{ width: '100%', height: 200, bgcolor: '#e8f5e9', borderRadius: 3, overflow: 'hidden', position: 'relative', border: '1.5px solid #81c784' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
          {/* Grid lines */}
          <line x1="0" y1="45" x2={width} y2="45" stroke="#c8e6c9" strokeDasharray="3,3" />
          <line x1="0" y1="90" x2={width} y2="90" stroke="#c8e6c9" strokeDasharray="3,3" />
          <line x1="0" y1="135" x2={width} y2="135" stroke="#c8e6c9" strokeDasharray="3,3" />
          <line x1="80" y1="0" x2="80" y2={height} stroke="#c8e6c9" strokeDasharray="3,3" />
          <line x1="160" y1="0" x2="160" y2={height} stroke="#c8e6c9" strokeDasharray="3,3" />
          <line x1="240" y1="0" x2="240" y2={height} stroke="#c8e6c9" strokeDasharray="3,3" />

          {/* Polygon Fill when completed or 3+ points */}
          {points.length >= 3 && (
            <polygon points={polyPoints} fill="rgba(76, 175, 80, 0.28)" stroke="#1b5e20" strokeWidth="2.5" />
          )}

          {/* Path Line */}
          {points.length < 3 && (
            <polyline points={polyPoints} fill="none" stroke="#2e7d32" strokeWidth="2.5" strokeDasharray="4,2" />
          )}

          {/* Start Point */}
          {points.length > 0 && (
            <circle cx={project(points[0]).split(',')[0]} cy={project(points[0]).split(',')[1]} r="6" fill="#1b5e20" stroke="#fff" strokeWidth="2" />
          )}

          {/* Current Live Point (Pulsing) */}
          <circle cx={lastX} cy={lastY} r="7" fill="#d32f2f" stroke="#fff" strokeWidth="2" />
        </svg>

        {/* Live Legend */}
        <Box sx={{ position: 'absolute', bottom: 8, left: 10, bgcolor: 'rgba(255,255,255,0.85)', px: 1, py: 0.3, borderRadius: 1.5, display: 'flex', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem' }}>
            🟢 प्रारंभिक बिंदु
          </Typography>
          <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 700, fontSize: '0.7rem' }}>
            🔴 वर्तमान स्थान
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleApplyToMeraKhet = () => {
    if (onSaveArea && areaData.acres > 0) {
      onSaveArea(areaData.acres);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}>
      <DialogTitle sx={{ bgcolor: '#1b5e20', color: '#fff', py: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DirectionsWalkIcon sx={{ color: '#ffeb3b', fontSize: 26 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
              खेत सीमा मापक (GPS Walk Tracking)
            </Typography>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem' }}>
              मेड़ पर चलकर सटीक रकबा व सीमा नापें
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, bgcolor: '#fafbf9' }}>
        {gpsError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setGpsError('')}>
            {gpsError}
          </Alert>
        )}

        {/* Status & Accuracy Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Chip
              label={
                trackingState === 'tracking'
                  ? '🟢 ट्रैकिंग चालू (मेड़ पर चलें)'
                  : trackingState === 'paused'
                  ? '⏸️ अस्थायी रुका हुआ'
                  : trackingState === 'completed'
                  ? '✅ मापन पूर्ण'
                  : '⚪ तैयार (Standby)'
              }
              color={trackingState === 'tracking' ? 'success' : trackingState === 'completed' ? 'primary' : 'default'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
            {wakeLockActive && (
              <Chip
                icon={<ScreenLockPortraitIcon sx={{ fontSize: 14 }} />}
                label="स्क्रीन ऑन"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.68rem', height: 24 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#555', fontWeight: 600 }}>
              {currentAccuracy ? `सटीकता: ±${currentAccuracy}m` : 'GPS सिग्नल खोज रहे हैं...'}
            </Typography>
            <Chip label={`बिंदु: ${points.length}`} size="small" sx={{ height: 22, fontSize: '0.72rem' }} />
          </Box>
        </Box>

        {/* Visual Map */}
        <Box sx={{ mb: 2 }}>{renderSvgMap()}</Box>

        {/* Real-time Calculated Metrics */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#e8f5e9', border: '1.5px solid #a5d6a7', borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <TerrainIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                    कुल रकबा (क्षेत्रफल)
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1b5e20' }}>
                  {areaData.acres} <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>एकड़</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.72rem' }}>
                  {areaData.dismil} डिसमिल • {areaData.hectares} हेक्टेयर
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#fff8e1', border: '1.5px solid #ffe082', borderRadius: 2.5 }}>
              <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <StraightenIcon sx={{ fontSize: 18, color: '#f57f17' }} />
                  <Typography variant="caption" sx={{ color: '#f57f17', fontWeight: 700 }}>
                    मेड़ की कुल लंबाई (परिधि)
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#b78103' }}>
                  {perimeterData.meters} <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>मीटर</Typography>
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', fontSize: '0.72rem' }}>
                  लगभग {perimeterData.feet} फीट
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Instructions for Farmer */}
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155', mb: 0.5 }}>
            💡 मेड़ नापने के आसान निर्देश:
          </Typography>
          <Typography variant="caption" sx={{ color: '#475569', display: 'block', lineHeight: 1.4 }}>
            1. खेत के किसी भी एक कोने पर खड़े होकर "सीमा नापना शुरू करें" दबाएं।<br />
            2. खेत की चारों तरफ की मेड़ पर सामान्य गति से पैदल चलें (फोन हाथ में या जेब में रखें)।<br />
            3. वापस उसी शुरुआती कोने पर पहुंचकर "नाप पूरा करें" दबाएं। ऐप तुरंत एकड़ और डिसमिल बता देगा।
          </Typography>
        </Paper>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {trackingState === 'idle' && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={startTracking}
              sx={{ bgcolor: '#1b5e20', py: 1.2, fontWeight: 800, borderRadius: 2.5, '&:hover': { bgcolor: '#2e7d32' } }}
            >
              🚶‍♂️ सीमा नापना शुरू करें (Start Walk)
            </Button>
          )}

          {trackingState === 'tracking' && (
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PauseIcon />}
                  onClick={pauseTracking}
                  sx={{ py: 1, fontWeight: 700, borderRadius: 2.5 }}
                >
                  अस्थायी रोकें
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={finishTracking}
                  sx={{ bgcolor: '#2e7d32', py: 1, fontWeight: 800, borderRadius: 2.5, '&:hover': { bgcolor: '#1b5e20' } }}
                >
                  🏁 नाप पूरा करें
                </Button>
              </Grid>
            </Grid>
          )}

          {trackingState === 'paused' && (
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={resumeTracking}
                  sx={{ bgcolor: '#1b5e20', py: 1, fontWeight: 700, borderRadius: 2.5 }}
                >
                  फिर से शुरू करें
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={finishTracking}
                  sx={{ bgcolor: '#2e7d32', py: 1, fontWeight: 800, borderRadius: 2.5 }}
                >
                  नाप समाप्त करें
                </Button>
              </Grid>
            </Grid>
          )}

          {trackingState === 'completed' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {onSaveArea && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleApplyToMeraKhet}
                  sx={{ bgcolor: '#1b5e20', py: 1.2, fontWeight: 800, borderRadius: 2.5, '&:hover': { bgcolor: '#2e7d32' } }}
                >
                  ✅ {areaData.acres} एकड़ रकबा "{plotName}" में सुरक्षित करें
                </Button>
              )}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<RefreshIcon />}
                onClick={resetTracking}
                sx={{ py: 0.8, borderRadius: 2.5 }}
              >
                नया खेत दोबारा नापें
              </Button>
            </Box>
          )}

          {/* Quick Demo Walk Simulation Button (In case indoors or testing) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Button
              size="small"
              onClick={runDemoWalk}
              disabled={trackingState === 'tracking' && !simulationActive}
              sx={{ color: '#455a64', fontSize: '0.72rem', textTransform: 'none' }}
            >
              ⚡ 2.4 एकड़ डेमो वॉक टेस्ट करें (सिमुलेशन)
            </Button>
            {areaData.acres > 0 && (
              <Button
                size="small"
                startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                onClick={() => speakText(`आपके खेत का रकबा ${areaData.acres} एकड़, यानि ${areaData.dismil} डिसमिल है। मेड़ की लंबाई ${perimeterData.meters} मीटर है।`)}
                sx={{ color: '#1b5e20', fontSize: '0.72rem', fontWeight: 700 }}
              >
                सुनें
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 1.5, bgcolor: '#f8faf6', borderTop: '1px solid #e0e0e0' }}>
        <Button onClick={onClose} sx={{ color: '#666', fontWeight: 600 }}>
          बंद करें
        </Button>
      </DialogActions>
    </Dialog>
  );
};
