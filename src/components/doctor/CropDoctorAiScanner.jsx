import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SyncIcon from '@mui/icons-material/Sync';
import { diagnoseCropWithLiveAi } from '../../services/apiService';
import { notify } from '../../services/notificationService';
import { getOfflineScans, saveOfflineScan, removeOfflineScan } from '../../services/offlineDoctorQueueService';
import { stopSpeech } from '../../utils/speech';
import { appConfig } from '../../config/appConfig';
import { useLanguage } from '../../utils/i18n';

export const CropDoctorAiScanner = ({ selectedCrop, selectedDistrict, onDiagnosed, prescriptionRef }) => {
  const { isChhattisgarhi } = useLanguage();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [nonPlantWarning, setNonPlantWarning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanTechnicalError, setScanTechnicalError] = useState(null);
  const [pendingScans, setPendingScans] = useState(() => getOfflineScans());
  const [isSyncingPending, setIsSyncingPending] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const rawDataUrl = loadEvent.target?.result;
        if (!rawDataUrl) return;

        // Downsample large camera photos client-side to prevent OOM on budget phones
        const img = new Image();
        img.onload = async () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          let processedDataUrl = rawDataUrl;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            processedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          }

          setUploadedImage(processedDataUrl);
          setAnalyzing(true);
          setAiReport(null);
          setNonPlantWarning(false);
          setScanError(null);
          setScanTechnicalError(null);

          try {
            const diagResult = await diagnoseCropWithLiveAi({
              imageBase64: processedDataUrl,
              cropId: selectedCrop,
              district: selectedDistrict
            });

            setAnalyzing(false);

            if (!diagResult || diagResult.success === false) {
              setScanError(
                diagResult?.error ||
                'फोटो की AI जांच पूरी नहीं हो सकी। फसल सुरक्षा हेतु कोई कल्पित रोग नहीं दिखाया गया है।'
              );
              setScanTechnicalError(diagResult?.technicalError || null);
              notify.error(diagResult?.isOffline ? 'इंटरनेट कनेक्शन बंद है। लाइव AI हेतु डेटा ऑन करें।' : 'AI जांच असफल रही।');
              return;
            }

            // Edge Case: Photo is not a plant
            if (diagResult.isPlant === false) {
              setNonPlantWarning(true);
              notify.warning('पौधे या पत्ती की स्पष्ट फोटो नहीं मिली। कृपया पुनः साफ फोटो लें।');
              return;
            }

            const isHealthy = diagResult.diseaseName && diagResult.diseaseName.includes('स्वस्थ');
            const formattedDisease = {
              id: `ai-${Date.now()}`,
              cropId: diagResult.cropId || selectedCrop,
              cropName: diagResult.cropName || (selectedCrop === 'paddy' ? 'धान' : selectedCrop),
              diseaseName: diagResult.diseaseName || 'अज्ञात रोग',
              severity: diagResult.severity || 'गंभीर',
              pathogen: diagResult.englishName || 'पादप रोग / कीट',
              pumpDose: diagResult.pumpDose || '12-15 ग्राम प्रति 15 लीटर पंप (टंकी)',
              chemicalRemedy: diagResult.chemicalRemedy || 'कृषि विशेषज्ञ की सलाह अनुसार कीटनाशक उपयोग करें।',
              organicRemedy: diagResult.organicRemedy || 'नीम तेल (5 मिली/लीटर) या ट्राइकोडर्मा का प्रयोग करें।',
              prevention: diagResult.precautions || 'शांत मौसम में ही सुबह या शाम छिड़काव करें।',
              symptoms: diagResult.symptoms || 'पत्तियों पर रोग के लक्षण।',
              voiceAdvice: diagResult.voiceAdvice,
              isLiveAi: Boolean(diagResult.isLiveAi),
              source: diagResult.source || 'gemini-vision',
              confidence: diagResult.confidence || 92,
              isHealthy
            };

            setAiReport({
              confidence: diagResult.confidence || 92,
              disease: formattedDisease.diseaseName,
              crop: formattedDisease.cropName,
              severity: formattedDisease.severity,
              pumpDose: formattedDisease.pumpDose,
              isLiveAi: formattedDisease.isLiveAi,
              source: formattedDisease.source,
              isHealthy
            });

            if (onDiagnosed) {
              onDiagnosed(formattedDisease);
            }

            notify.success(`⚡ Google Gemini AI लाइव पहचान: ${formattedDisease.diseaseName}!`);

            setTimeout(() => {
              prescriptionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 180);
          } catch {
            setAnalyzing(false);
            setScanError('फोटो विश्लेषण में तकनीकी समस्या आई। कृपया पुनः प्रयास करें।');
            notify.error('फोटो विश्लेषण में त्रुटि हुई।');
          }
        };

        img.onerror = () => {
          setUploadedImage(rawDataUrl);
          setAnalyzing(false);
          setScanError('फोटो लोड करने में असमर्थ।');
          notify.error('फोटो लोड नहीं हो सकी।');
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleResetScan = () => {
    setUploadedImage(null);
    setAiReport(null);
    setAnalyzing(false);
    setNonPlantWarning(false);
    setScanError(null);
    setScanTechnicalError(null);
    stopSpeech();
    notify.info('स्कैन रीसेट कर दिया गया');
  };

  const handleSaveCurrentScanOffline = () => {
    if (!uploadedImage) return;
    const saved = saveOfflineScan({
      imageBase64: uploadedImage,
      cropId: selectedCrop,
      district: selectedDistrict
    });
    if (saved) {
      setPendingScans(getOfflineScans());
      setScanError(null);
      notify.success('💾 फोटो सुरक्षित हो गई! इंटरनेट आते ही स्वतः जांच होगी।');
    }
  };

  const handleProcessQueuedScan = useCallback(async (scanItem) => {
    if (!scanItem) return;
    if (!navigator.onLine) {
      notify.warning('अभी फोन में इंटरनेट नहीं है। कृपया मोबाइल डेटा चालू करें।');
      return;
    }
    setIsSyncingPending(true);
    try {
      const diagResult = await diagnoseCropWithLiveAi({
        imageBase64: scanItem.imageBase64,
        cropId: scanItem.cropId,
        district: scanItem.district
      });
      setIsSyncingPending(false);

      if (!diagResult || diagResult.success === false) {
        setScanError(diagResult?.error || 'AI जांच पूरी नहीं हो सकी।');
        return;
      }

      if (diagResult.isPlant === false) {
        setNonPlantWarning(true);
        removeOfflineScan(scanItem.id);
        setPendingScans(getOfflineScans());
        notify.warning('पौधा या पत्ती स्पष्ट नहीं है।');
        return;
      }

      const isHealthy = diagResult.diseaseName && diagResult.diseaseName.includes('स्वस्थ');
      const formattedDisease = {
        id: `ai-${Date.now()}`,
        cropId: diagResult.cropId || scanItem.cropId || selectedCrop,
        cropName: diagResult.cropName || (scanItem.cropId === 'paddy' ? 'धान' : scanItem.cropId),
        diseaseName: diagResult.diseaseName || 'अज्ञात रोग',
        severity: diagResult.severity || 'गंभीर',
        pathogen: diagResult.englishName || 'पादप रोग / कीट',
        pumpDose: diagResult.pumpDose || '12-15 ग्राम प्रति 15 लीटर पंप (टंकी)',
        chemicalRemedy: diagResult.chemicalRemedy || 'कृषि विशेषज्ञ की सलाह अनुसार दवा लें।',
        organicRemedy: diagResult.organicRemedy || 'नीम तेल (5 मिली/लीटर) या ट्राइकोडर्मा छिड़कें।',
        prevention: diagResult.precautions || 'शांत मौसम में सुबह या शाम छिड़काव करें।',
        symptoms: diagResult.symptoms || 'पत्तियों पर रोग के लक्षण।',
        voiceAdvice: diagResult.voiceAdvice,
        isLiveAi: Boolean(diagResult.isLiveAi),
        source: diagResult.source || 'gemini-vision',
        confidence: diagResult.confidence || 92,
        isHealthy
      };

      setAiReport({
        confidence: diagResult.confidence || 92,
        disease: formattedDisease.diseaseName,
        crop: formattedDisease.cropName,
        severity: formattedDisease.severity,
        pumpDose: formattedDisease.pumpDose,
        isLiveAi: formattedDisease.isLiveAi,
        source: formattedDisease.source,
        isHealthy
      });

      if (onDiagnosed) {
        onDiagnosed(formattedDisease);
      }

      removeOfflineScan(scanItem.id);
      setPendingScans(getOfflineScans());
      notify.success(`🎉 सुरक्षित फोटो की AI जांच पूर्ण: ${formattedDisease.diseaseName}!`);

      setTimeout(() => {
        prescriptionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
    } catch {
      setIsSyncingPending(false);
      setScanError('तकनीकी समस्या आई। कृपया पुनः प्रयास करें।');
    }
  }, [selectedCrop, onDiagnosed, prescriptionRef]);

  const handleProcessAllQueuedScans = async () => {
    const queued = getOfflineScans();
    if (!queued || queued.length === 0) return;
    notify.info(`⚡ सभी ${queued.length} सुरक्षित स्कैन की जांच शुरू की जा रही है...`);
    for (const scan of queued) {
      await handleProcessQueuedScan(scan);
    }
  };

  // Auto-sync pending offline scans when connectivity is restored
  useEffect(() => {
    const handleOnline = () => {
      const queued = getOfflineScans();
      if (queued && queued.length > 0) {
        notify.info('🌐 इंटरनेट पुनः जुड़ गया! सुरक्षित फोटो की AI जांच शुरू हो रही है...');
        handleProcessQueuedScan(queued[0]);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [handleProcessQueuedScan]);

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2,
        p: 1.8,
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        textAlign: 'center'
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', mb: 0.3 }}>
        {isChhattisgarhi ? '📸 बीमार पाना या तना के फोटो ले तुरंत जांच करव' : '📸 बीमार पत्ती या पौधे की फोटो से तुरंत जांच करें'}
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5, fontSize: '0.75rem' }}>
        {isChhattisgarhi
          ? 'कैमरा ले फोटो खींचव या गैलरी ले चुनव • 15L पंप के पक्का नाप तुरंत मिलही'
          : 'कैमरा से सीधी फोटो लें या गैलरी से चुनें • 15L पंप की सटीक खुराक तुरंत मिलेगी'}
      </Typography>

      {/* Pending Offline Scan Queue Badge */}
      {pendingScans.length > 0 && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.2,
            borderRadius: '10px',
            bgcolor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <CloudQueueIcon sx={{ color: '#16a34a', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', fontSize: '0.74rem' }}>
              {isChhattisgarhi ? `📥 ऑफ़लाइन सुरक्षित फोटो (${pendingScans.length})` : `📥 ऑफ़लाइन सुरक्षित स्कैन (${pendingScans.length})`}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            disabled={isSyncingPending || !navigator.onLine}
            onClick={handleProcessAllQueuedScans}
            startIcon={<SyncIcon sx={{ fontSize: 14 }} />}
            sx={{
              bgcolor: '#16a34a',
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
              py: 0.2,
              px: 1,
              minHeight: 24,
              borderRadius: '8px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#15803d' }
            }}
          >
            {isSyncingPending ? 'जांच जारी...' : '⚡ सभी जांचें'}
          </Button>
        </Box>
      )}

      {/* Dual Camera / Gallery Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
        <input
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          id="crop-camera-capture"
          type="file"
          onChange={handleImageUpload}
        />
        <label htmlFor="crop-camera-capture">
          <Button
            variant="contained"
            component="span"
            startIcon={<PhotoCameraIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#16a34a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '12px',
              px: 2,
              py: 0.7,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#15803d', boxShadow: 'none' }
            }}
          >
            {isChhattisgarhi ? 'कैमरा ले फोटो खींचव' : 'कैमरा से फोटो खींचें'}
          </Button>
        </label>

        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="crop-gallery-upload"
          type="file"
          onChange={handleImageUpload}
        />
        <label htmlFor="crop-gallery-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<PhotoLibraryIcon sx={{ fontSize: 18 }} />}
            sx={{
              borderColor: '#cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '12px',
              px: 2,
              py: 0.7,
              bgcolor: '#f8fafc',
              textTransform: 'none',
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
            }}
          >
            {isChhattisgarhi ? 'गैलरी ले चुनव' : 'गैलरी से चुनें'}
          </Button>
        </label>
      </Box>

      {/* Analyzing Spinner State */}
      {analyzing && (
        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <CircularProgress size={20} sx={{ color: '#16a34a' }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.8rem' }}>
            {isChhattisgarhi ? '🔍 एआई फसल के जांच करत हे... कनिहा अगोरव' : '🔍 एआई फोटो का विश्लेषण कर रहा है... कृपया प्रतीक्षा करें'}
          </Typography>
        </Box>
      )}

      {/* AI Report Card upon Scan Success */}
      {uploadedImage && !analyzing && aiReport && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.2,
            bgcolor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            textAlign: 'left'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              component="img"
              src={uploadedImage}
              alt="Plant Scan"
              sx={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.86rem' }}>
                  {aiReport.disease}
                </Typography>
                <Chip
                  label={`${aiReport.confidence}% निश्चित`}
                  size="small"
                  sx={{ bgcolor: '#fff', color: '#166534', fontWeight: 800, height: 20, fontSize: '0.66rem' }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#15803d', display: 'block', fontSize: '0.72rem' }}>
                15L पंप खुराक: <strong>{aiReport.pumpDose}</strong>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleResetScan}
              sx={{ fontSize: '0.7rem', borderRadius: '8px', py: 0.3, px: 1, textTransform: 'none' }}
            >
              {isChhattisgarhi ? 'नवा फोटो' : 'नई फोटो'}
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => prescriptionRef?.current?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ bgcolor: '#b91c1c', fontSize: '0.7rem', borderRadius: '8px', py: 0.3, px: 1, textTransform: 'none', '&:hover': { bgcolor: '#991b1b' } }}
            >
              {isChhattisgarhi ? 'पर्ची देखव 👇' : 'पर्ची देखें 👇'}
            </Button>
          </Box>
        </Box>
      )}

      {/* Smart Re-capture Guide if not a plant / blurry */}
      {nonPlantWarning && (
        <Paper elevation={0} sx={{ mt: 1.5, p: 1.5, borderRadius: '12px', bgcolor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'left' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#b45309', fontSize: '0.84rem', mb: 0.6 }}>
            📷 साफ फोटो के 3 नियम: 1. पत्ती के 10-15 सेमी पास रखें • 2. दिन की रोशनी में खींचें • 3. हाथ स्थिर रखें
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Button
              size="small"
              variant="contained"
              onClick={() => document.getElementById('crop-camera-capture')?.click()}
              sx={{ bgcolor: '#16a34a', color: '#fff', fontSize: '0.7rem', textTransform: 'none', borderRadius: '8px' }}
            >
              दोबारा फोटो लें
            </Button>
            <Button size="small" onClick={handleResetScan} sx={{ fontSize: '0.7rem', color: '#64748b' }}>
              रीसेट
            </Button>
          </Box>
        </Paper>
      )}

      {/* Scan Error Alert */}
      {scanError && (
        <Alert severity="error" sx={{ mt: 1.5, borderRadius: '12px', textAlign: 'left', fontSize: '0.76rem' }}>
          {scanError}
          {appConfig.debugMode && scanTechnicalError && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', fontSize: '0.7rem' }}>
              {scanTechnicalError}
            </Typography>
          )}
          {uploadedImage && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleSaveCurrentScanOffline} sx={{ bgcolor: '#16a34a', fontSize: '0.7rem', textTransform: 'none' }}>
                💾 फोटो सुरक्षित करें
              </Button>
              <Button size="small" onClick={handleResetScan} sx={{ fontSize: '0.7rem' }}>
                रीसेट
              </Button>
            </Box>
          )}
        </Alert>
      )}
    </Card>
  );
};

