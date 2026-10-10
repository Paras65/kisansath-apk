import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Collapse
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ScienceIcon from '@mui/icons-material/Science';
import SpaIcon from '@mui/icons-material/Spa';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { speakText, stopSpeech, subscribeSpeechState } from '../../utils/speech';
import { notify } from '../../services/notificationService';
import { useLanguage } from '../../utils/i18n';

export const CropDoctorPrescriptionCard = ({
  activeDisease,
  matchedCibrc,
  highlightDoctorCard,
  prescriptionRef,
  children
}) => {
  const { isChhattisgarhi } = useLanguage();
  const [prescriptionTab, setPrescriptionTab] = useState('chemical'); // 'chemical' | 'organic'
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeechState((speaking) => {
      setIsVoicePlaying(speaking);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!activeDisease) return null;

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'अति गंभीर':
        return { bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', dot: '🔴' };
      case 'गंभीर':
        return { bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', dot: '🟠' };
      case 'मध्यम':
      default:
        return { bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', dot: '🔵' };
    }
  };

  const handleVoiceReadRemedy = (disease) => {
    if (!disease) return;
    if (disease.voiceAdvice) {
      speakText(disease.voiceAdvice);
      return;
    }
    const text = isChhattisgarhi
      ? `${disease.cropName} म ${disease.diseaseName} के इलाज। 15 लीटर टंकी के दवाई खुराक हे: ${disease.pumpDose || 'नियम अनुसार'}। रासायनिक दवाई हे: ${disease.chemicalRemedy}। जैविक उपाय हे: ${disease.organicRemedy}।`
      : `${disease.cropName} में ${disease.diseaseName} का इलाज। 15 लीटर स्प्रे पंप की खुराक है: ${disease.pumpDose || 'अनुशंसा अनुसार'}। रासायनिक उपाय है: ${disease.chemicalRemedy}। जैविक उपाय है: ${disease.organicRemedy}।`;
    speakText(text);
  };

  const handleSharePrescription = (disease) => {
    if (!disease) return;
    notify.info('व्हाट्सएप पर पर्ची साझा की जा रही है...');
    const matched = matchedCibrc;
    const text = `🌿 *किसान साथी - एआई फसल डॉक्टर पर्ची* 🩺
━━━━━━━━━━━━━━━━━━
🌾 *फसल:* ${disease.cropName}
🔬 *रोग का नाम:* ${disease.diseaseName}
⚠️ *गंभीरता:* ${disease.severity || 'गंभीर'}
🧫 *कारक:* ${disease.pathogen || 'फफूंद / कीट'}

🎒 *15 लीटर स्प्रे पंप (टंकी) खुराक:*
👉 *${disease.pumpDose || 'अनुशंसा अनुसार'}*
💧 पानी: 1 एकड़ में 150-200 लीटर (लगभग 10-12 टंकी)

🧪 *अनुशंसित रासायनिक दवा:*
👉 ${disease.chemicalRemedy}
${matched ? `⏳ *सुरक्षित तुड़ाई अंतराल (PHI):* ${matched.phiDays} दिन\n🔒 *CIB&RC संदर्भ:* ${matched.cibrcRegRef}` : ''}

🌱 *जैविक / देसी उपचार:*
👉 ${disease.organicRemedy}

🛡️ *बचाव सलाह:*
👉 ${disease.prevention}
━━━━━━━━━━━━━━━━━━
📍 IGKV एवं ICAR वैज्ञानिकों की मानक अनुशंसा आधारित
📲 किसान साथी ऐप: https://kisan.init65.co.in/`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const sevStyle = getSeverityStyle(activeDisease.severity);

  return (
    <Card
      ref={prescriptionRef}
      id="kaka-doctor-card"
      className={highlightDoctorCard ? 'kaka-spotlight-pulse' : ''}
      elevation={0}
      sx={{
        borderRadius: '18px',
        border: '1.5px solid #fecaca',
        boxShadow: '0 4px 16px rgba(185, 28, 28, 0.06)',
        bgcolor: '#ffffff',
        overflow: 'hidden'
      }}
    >
      {/* Card Header (Rx Motif) */}
      <Box
        sx={{
          p: 1.8,
          bgcolor: '#fff5f5',
          borderBottom: '1px solid #fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.2
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mb: 0.4 }}>
            <Chip
              label={isChhattisgarhi ? "Rx किसान पर्ची" : "Rx कृषि पर्ची"}
              size="small"
              sx={{ bgcolor: '#dc2626', color: '#fff', fontWeight: 900, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
            />
            <Chip
              label={activeDisease.cropName}
              size="small"
              sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
            />
            <Chip
              label={`${sevStyle.dot} ${activeDisease.severity || 'गंभीर'}`}
              size="small"
              sx={{ bgcolor: sevStyle.bgcolor, color: sevStyle.color, border: sevStyle.border, fontWeight: 700, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '1.05rem', lineHeight: 1.2 }}>
            {activeDisease.diseaseName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
            कारक: <strong>{activeDisease.pathogen || 'पादप रोग / कीट'}</strong>
          </Typography>
        </Box>

        {/* Header Action Buttons */}
        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
          <Button
            variant={isVoicePlaying ? 'contained' : 'outlined'}
            size="small"
            startIcon={isVoicePlaying ? <VolumeOffIcon sx={{ fontSize: 15 }} /> : <VolumeUpIcon sx={{ fontSize: 15 }} />}
            onClick={() => {
              if (isVoicePlaying) {
                stopSpeech();
              } else {
                handleVoiceReadRemedy(activeDisease);
              }
            }}
            sx={{
              bgcolor: isVoicePlaying ? '#dc2626' : '#fff',
              color: isVoicePlaying ? '#fff' : '#dc2626',
              borderColor: '#fca5a5',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '10px',
              py: 0.4,
              px: 1.2,
              textTransform: 'none',
              '&:hover': { bgcolor: isVoicePlaying ? '#b91c1c' : '#fee2e2' }
            }}
          >
            {isVoicePlaying ? 'रोकें ⏹️' : 'इलाज सुनें 🔊'}
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<WhatsAppIcon sx={{ fontSize: 15 }} />}
            onClick={() => handleSharePrescription(activeDisease)}
            sx={{
              bgcolor: '#16a34a',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '10px',
              py: 0.4,
              px: 1.2,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#15803d', boxShadow: 'none' }
            }}
          >
            दुकानदार पर्ची 💬
          </Button>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* HERO METRIC: 15L Knapsack Spray Pump Dosage Banner */}
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '14px',
            bgcolor: '#fffbeb',
            border: '1.5px solid #fde68a',
            textAlign: 'left'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#b45309', display: 'block', fontSize: '0.72rem', mb: 0.2 }}>
            🎒 15 लीटर स्प्रे पंप (टंकी) पक्का नाप (Knapsack Pump Dose):
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 900, color: '#9a3412', fontSize: '1rem', mb: 0.3 }}>
            👉 {activeDisease.pumpDose || (isChhattisgarhi ? '15-20 ग्राम प्रति 15 लीटर टंकी' : '15-20 ग्राम प्रति 15 लीटर पंप')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#78350f', fontSize: '0.72rem', display: 'block' }}>
            💧 <strong>एकड़ नाप:</strong> 1 एकड़ में 150-200 लीटर पानी (लगभग 10-12 टंकी) • सुबह 8-11 या शाम 4-6 बजे शांत मौसम में छिड़काव करें।
          </Typography>
        </Box>

        {/* Segmented Control Pill Switch: Chemical vs Organic */}
        <Box sx={{ mb: 1.8, display: 'flex', bgcolor: '#f1f5f9', p: 0.4, borderRadius: '12px' }}>
          <Button
            fullWidth
            size="small"
            startIcon={<ScienceIcon sx={{ fontSize: 16 }} />}
            onClick={() => setPrescriptionTab('chemical')}
            sx={{
              py: 0.6,
              borderRadius: '9px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: prescriptionTab === 'chemical' ? '#ffffff' : 'transparent',
              color: prescriptionTab === 'chemical' ? '#1d4ed8' : '#64748b',
              boxShadow: prescriptionTab === 'chemical' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              '&:hover': { bgcolor: prescriptionTab === 'chemical' ? '#ffffff' : 'transparent' }
            }}
          >
            💊 रासायनिक दवा (Chemical)
          </Button>
          <Button
            fullWidth
            size="small"
            startIcon={<SpaIcon sx={{ fontSize: 16 }} />}
            onClick={() => setPrescriptionTab('organic')}
            sx={{
              py: 0.6,
              borderRadius: '9px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: prescriptionTab === 'organic' ? '#ffffff' : 'transparent',
              color: prescriptionTab === 'organic' ? '#166534' : '#64748b',
              boxShadow: prescriptionTab === 'organic' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              '&:hover': { bgcolor: prescriptionTab === 'organic' ? '#ffffff' : 'transparent' }
            }}
          >
            🌿 जैविक / देसी उपाय (Organic)
          </Button>
        </Box>

        {/* Tab 1: Chemical Remedy & CIB&RC Regulatory Label Claim */}
        {prescriptionTab === 'chemical' && (
          <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8, flexWrap: 'wrap', gap: 0.6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', fontSize: '0.84rem' }}>
                अनुशंसित रासायनिक दवा:
              </Typography>
              {matchedCibrc ? (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '13px !important', color: '#1d4ed8 !important' }} />}
                  label="CIB&RC सरकारी अनुमोदित"
                  size="small"
                  sx={{ bgcolor: '#fff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.66rem', height: 20, border: '1px solid #bfdbfe' }}
                />
              ) : null}
            </Box>
            <Typography variant="body2" sx={{ color: '#1e3a8a', fontSize: '0.82rem', lineHeight: 1.5, mb: 1 }}>
              {activeDisease.chemicalRemedy}
            </Typography>

            {/* CIB&RC Label Claim Box */}
            {matchedCibrc ? (
              <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 0.6 }}>
                  <Chip
                    label={`⏳ सुरक्षित तुड़ाई अंतराल (PHI): ${matchedCibrc.phiDays} दिन`}
                    size="small"
                    sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                  />
                  <Chip
                    label={`🎒 15L पंप: ${matchedCibrc.dosagePerPump15L}`}
                    size="small"
                    sx={{ bgcolor: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                  />
                  <Chip
                    label={`💧 प्रति एकड़: ${matchedCibrc.dosagePerAcre}`}
                    size="small"
                    sx={{ bgcolor: '#f8fafc', color: '#334155', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                  🔒 <strong>सुरक्षा:</strong> {matchedCibrc.safetyEquipment} • {matchedCibrc.cibrcRegRef}
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}

        {/* Tab 2: Organic / Biological Remedy */}
        {prescriptionTab === 'organic' && (
          <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.84rem', mb: 0.5 }}>
              जैविक एवं देसी उपाय:
            </Typography>
            <Typography variant="body2" sx={{ color: '#14532d', fontSize: '0.82rem', lineHeight: 1.55 }}>
              {activeDisease.organicRemedy}
            </Typography>
          </Box>
        )}

        {/* Collapsible Symptoms & Prevention Accordion */}
        <Box sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', mb: 1.8 }}>
          <Box
            onClick={() => setShowDetailedInfo(!showDetailedInfo)}
            sx={{
              p: 1.2,
              bgcolor: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              userSelect: 'none'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem' }}>
              📋 लक्षण व बचाव विवरण (Symptoms & Prevention)
            </Typography>
            {showDetailedInfo ? <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#64748b' }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#64748b' }} />}
          </Box>

          <Collapse in={showDetailedInfo}>
            <Box sx={{ p: 1.5, bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#991b1b', display: 'block', mb: 0.2 }}>
                  रोग के लक्षण (Visible Symptoms):
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {activeDisease.symptoms}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block', mb: 0.2 }}>
                  भविष्य में बचाव व बीजोपचार (Prevention):
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.5 }}>
                  {activeDisease.prevention}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Embedded Children Slot (e.g. ChatBot) */}
        {children}

        {/* Scientific Attribution Footer */}
        <Box sx={{ mt: 1.8, display: 'flex', alignItems: 'center', gap: 0.8, p: 0.8, bgcolor: '#f8fafc', borderRadius: '8px' }}>
          <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 15 }} />
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
            CIB&RC (केंद्रीय कीटनाशी बोर्ड), ICAR एवं IGKV रायपुर अनुशंसा आधारित • स्रोत: डेटा.गॉव.इन (GODL-India)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

