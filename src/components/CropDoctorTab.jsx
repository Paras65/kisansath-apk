import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useLanguage } from '../utils/i18n';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';
import { startVoiceRecognition, stopVoiceRecognition, normalizeSpokenQuery } from '../utils/speechRecognition';
import { getCrops, getDiseases, getCachedModuleData, getCibrcPesticides } from '../services/apiService';
import { fetchLiveWeather, getSprayAdvisory, getCachedWeather } from '../services/weatherService';
import { notify } from '../services/notificationService';
import { CROPS, CROP_DISEASES, CIBRC_PESTICIDES } from '../data/kisanData';

import { CropDoctorSprayWeatherStrip } from './doctor/CropDoctorSprayWeatherStrip';
import { CropDoctorAiScanner } from './doctor/CropDoctorAiScanner';
import { CropDoctorDiseaseSelector, VISUAL_SYMPTOMS } from './doctor/CropDoctorDiseaseSelector';
import { CropDoctorPrescriptionCard } from './doctor/CropDoctorPrescriptionCard';
import { CropDoctorChatBot } from './doctor/CropDoctorChatBot';

export const CropDoctorTab = ({ selectedDistrict = 'रायपुर' }) => {
  const { isChhattisgarhi } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [selectedSymptom, setSelectedSymptom] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // 100% Real Statutory & ICAR Baseline Initialization (Guaranteed Zero Empty Screen on cold start)
  const [cropsList, setCropsList] = useState(() => {
    const cached = getCachedModuleData('crops');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return CROPS;
  });

  const [diseasesList, setDiseasesList] = useState(() => {
    const cached = getCachedModuleData('diseases_all') || getCachedModuleData('diseases');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return CROP_DISEASES;
  });

  const [activeDisease, setActiveDisease] = useState(() => {
    const cached = getCachedModuleData('diseases_all') || getCachedModuleData('diseases');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data[0];
    return CROP_DISEASES[0] || null;
  });

  const [cibrcList, setCibrcList] = useState(() => {
    const cached = getCachedModuleData('cibrc_all_all') || getCachedModuleData('cibrc_paddy_all');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return CIBRC_PESTICIDES;
  });

  // Live Weather Spray Advisory State
  const [sprayAdvisory, setSprayAdvisory] = useState(() => {
    const cached = getCachedWeather(selectedDistrict);
    if (cached) {
      return { ...getSprayAdvisory(cached), weather: cached };
    }
    return null;
  });

  const prescriptionRef = useRef(null);
  const [highlightDoctorCard, setHighlightDoctorCard] = useState(false);

  // Listen to Bhaira Kaka Voice Action
  useEffect(() => {
    const handleKakaAction = (e) => {
      const action = e.detail;
      if (!action || action.type !== 'SHOW_DISEASE') return;

      if (action.symptom) {
        setSelectedSymptom(action.symptom);
      }
      if (diseasesList && diseasesList.length > 0) {
        const found = diseasesList.find(
          (d) =>
            (action.disease && (d.diseaseName?.includes(action.disease) || action.disease?.includes(d.diseaseName))) ||
            (action.symptom === 'bph' && (d.diseaseName?.includes('माहू') || d.symptoms?.includes('माहू'))) ||
            (action.symptom === 'spot' && (d.diseaseName?.includes('झुलसा') || d.diseaseName?.includes('खैरा') || d.symptoms?.includes('धब्बे'))) ||
            (action.symptom === 'stemborer' && (d.diseaseName?.includes('तना') || d.symptoms?.includes('गोभ')))
        );
        if (found) {
          setActiveDisease(found);
        }
      }
      setHighlightDoctorCard(true);
      const tryScroll = () => {
        const el = document.getElementById('kaka-doctor-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      tryScroll();
      setTimeout(() => setHighlightDoctorCard(false), 3500);
    };

    window.addEventListener('kisan_kaka_action', handleKakaAction);
    return () => window.removeEventListener('kisan_kaka_action', handleKakaAction);
  }, [diseasesList]);

  // Voice recognition mic toggle for search
  const handleToggleVoiceSearch = () => {
    if (isVoiceListening) {
      stopVoiceRecognition();
      setIsVoiceListening(false);
    } else {
      startVoiceRecognition({
        onResult: (normalized, raw) => {
          setSearchQuery(normalized || raw);
        },
        onListeningChange: (listening) => {
          setIsVoiceListening(listening);
        },
        onError: (msg) => {
          notify.info(msg);
          setIsVoiceListening(false);
        }
      });
    }
  };

  // Load live weather spray advisory for selectedDistrict
  useEffect(() => {
    let isMounted = true;
    const loadSprayWeather = async () => {
      try {
        const weather = await fetchLiveWeather(selectedDistrict);
        if (isMounted && weather) {
          const advisory = getSprayAdvisory(weather);
          setSprayAdvisory({ ...advisory, weather });
        }
      } catch (e) {
        console.warn('[CropDoctor] Weather advisory error:', e);
      }
    };
    loadSprayWeather();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  // Load live data from MongoDB
  const loadFromMongo = async () => {
    try {
      const liveCrops = await getCrops();
      if (liveCrops && Array.isArray(liveCrops) && liveCrops.length > 0) setCropsList(liveCrops);
      const liveDiseases = await getDiseases();
      if (liveDiseases && Array.isArray(liveDiseases) && liveDiseases.length > 0) {
        setDiseasesList(liveDiseases);
        setActiveDisease((prev) => prev || liveDiseases[0]);
      }
    } catch (e) {
      console.warn('[CropDoctor] Mongo load warning:', e);
    }
  };

  useEffect(() => {
    loadFromMongo();
  }, []);

  // Synchronize official CIB&RC certified formulations
  useEffect(() => {
    let isMounted = true;
    const fetchCibrc = async () => {
      try {
        const res = await getCibrcPesticides(selectedCrop);
        if (isMounted && res && Array.isArray(res.data) && res.data.length > 0) {
          setCibrcList(res.data);
        }
      } catch (e) {
        console.warn('[CIBRC Pesticides Fetch Error]', e);
      }
    };
    fetchCibrc();
    return () => {
      isMounted = false;
    };
  }, [selectedCrop]);

  const getMatchingCibrc = (disease) => {
    const list = cibrcList && cibrcList.length > 0 ? cibrcList : CIBRC_PESTICIDES;
    if (!disease || !list || list.length === 0) return null;
    const dName = (disease.diseaseName || '').toLowerCase();
    const dSym = (disease.symptoms || '').toLowerCase();
    const dChem = (disease.chemicalRemedy || '').toLowerCase();

    return (
      list.find((item) => {
        const pName = (item.targetPest || '').toLowerCase().slice(0, 4);
        const gName = (item.genericName || '').toLowerCase().slice(0, 6);
        return (
          (item.cropId === disease.cropId || disease.cropId === 'all') &&
          (dName.includes(pName) || dChem.includes(gName) || dSym.includes(pName))
        );
      }) || null
    );
  };

  // Filter diseases based on selected crop, symptom, and search text
  const filteredDiseases = diseasesList.filter((d) => {
    const matchesCrop = selectedCrop === 'all' || d.cropId === selectedCrop;

    let matchesSymptom = true;
    if (selectedSymptom !== 'all') {
      const symptomDef = VISUAL_SYMPTOMS.find((s) => s.id === selectedSymptom);
      if (symptomDef && symptomDef.match) {
        const needle = symptomDef.match.toLowerCase();
        matchesSymptom =
          (d.symptomTag && d.symptomTag.toLowerCase().includes(needle)) ||
          (d.symptoms && d.symptoms.toLowerCase().includes(needle)) ||
          (d.diseaseName && d.diseaseName.toLowerCase().includes(needle));
      }
    }

    const needle = searchQuery.toLowerCase().trim();
    const normalizedNeedle = normalizeSpokenQuery(needle);
    const matchesSearch =
      !needle ||
      d.diseaseName.toLowerCase().includes(needle) ||
      d.symptoms.toLowerCase().includes(needle) ||
      d.cropName.toLowerCase().includes(needle) ||
      (d.chemicalRemedy && d.chemicalRemedy.toLowerCase().includes(needle)) ||
      (normalizedNeedle && (
        d.diseaseName.toLowerCase().includes(normalizedNeedle) ||
        d.symptoms.toLowerCase().includes(normalizedNeedle) ||
        d.cropName.toLowerCase().includes(normalizedNeedle)
      ));

    return matchesCrop && matchesSymptom && matchesSearch;
  });

  const matchedCibrc = activeDisease ? getMatchingCibrc(activeDisease) : null;

  return (
    <Box sx={{ pb: 3, pt: 0.5, maxWidth: 900, mx: 'auto' }} className="fade-in">
      {/* 1. Header Strip */}
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: '#fee2e2', p: 0.9, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalHospitalIcon sx={{ color: '#dc2626', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#991b1b', fontSize: '1.1rem', lineHeight: 1.2 }}>
              {isChhattisgarhi ? 'एआई फसल डॉक्टर' : 'एआई फसल डॉक्टर (Crop Doctor)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
              {isChhattisgarhi ? '15L पंप सटीक खुराक • देसी अउ रासायनिक इलाज' : '15L पंप सटीक खुराक • जैविक व रासायनिक समाधान'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <KakaWalkthroughButton featureId="doctor" />
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#16a34a !important' }} />}
            label={isChhattisgarhi ? 'IGKV प्रमाणित' : 'IGKV अनुमोदित'}
            size="small"
            sx={{ bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700, fontSize: '0.7rem', height: 24 }}
          />
        </Box>
      </Box>

      {/* 2. Weather Spray Status Strip */}
      <CropDoctorSprayWeatherStrip
        sprayAdvisory={sprayAdvisory}
        selectedDistrict={selectedDistrict}
      />

      {/* 3. AI Camera & Gallery Action Card */}
      <CropDoctorAiScanner
        selectedCrop={selectedCrop}
        selectedDistrict={selectedDistrict}
        onDiagnosed={setActiveDisease}
        prescriptionRef={prescriptionRef}
      />

      {/* 4. Filter & Search Bar */}
      <CropDoctorDiseaseSelector
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isVoiceListening={isVoiceListening}
        handleToggleVoiceSearch={handleToggleVoiceSearch}
        selectedCrop={selectedCrop}
        setSelectedCrop={setSelectedCrop}
        cropsList={cropsList}
        selectedSymptom={selectedSymptom}
        setSelectedSymptom={setSelectedSymptom}
        filteredDiseases={filteredDiseases}
        activeDisease={activeDisease}
        onSelectDisease={setActiveDisease}
        prescriptionRef={prescriptionRef}
      />

      {/* 5. Prescription Card with Integrated AI Follow-up Chatbot */}
      {activeDisease ? (
        <CropDoctorPrescriptionCard
          activeDisease={activeDisease}
          matchedCibrc={matchedCibrc}
          highlightDoctorCard={highlightDoctorCard}
          prescriptionRef={prescriptionRef}
        >
          <CropDoctorChatBot
            activeDisease={activeDisease}
            selectedDistrict={selectedDistrict}
            selectedCrop={selectedCrop}
          />
        </CropDoctorPrescriptionCard>
      ) : null}
    </Box>
  );
};

export default CropDoctorTab;
