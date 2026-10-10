import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PolicyIcon from '@mui/icons-material/Policy';
import { appConfig } from '../config/appConfig';
import { getFertilizers, getSchemes, getCachedModuleData, getDistrictSoilHealth } from '../services/apiService';
import { useLanguage } from '../utils/i18n';
import { FERTILIZER_DOSES, SCHEMES } from '../data/kisanData';
import { FertilizerCalculatorSubTab } from './calculator/FertilizerCalculatorSubTab';
import { DhanMspCalculatorSubTab } from './calculator/DhanMspCalculatorSubTab';
import { GovernmentSchemesSubTab } from './calculator/GovernmentSchemesSubTab';

export const CalculatorSchemesTab = ({ selectedDistrict = 'रायपुर' }) => {
  const [subTab, setSubTab] = useState(0);

  // 100% Real Statutory & IGKV Baseline Initialization (Guaranteed Zero Empty Screen on cold start)
  const [fertData, setFertData] = useState(() => {
    const cached = getCachedModuleData('fertilizers');
    if (cached && cached.data && Object.keys(cached.data).length > 0) return cached.data;
    return FERTILIZER_DOSES;
  });

  const [schemesList, setSchemesList] = useState(() => {
    const cached = getCachedModuleData('schemes');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return SCHEMES;
  });

  // District Soil Health Card Survey State (DAC&FW / OGD India)
  const [districtSoilHealth, setDistrictSoilHealth] = useState(null);

  // Fertilizer Calculator State (Controlled at coordinator level for agentic Kaka interop)
  const { isChhattisgarhi } = useLanguage();
  const [fertCrop, setFertCrop] = useState('paddy');
  const [fertUnit, setFertUnit] = useState('acre'); // 'acre' | 'dismil'
  const [fertAcres, setFertAcres] = useState(1);

  // Spotlight glow state for Kaka agentic interactions
  const [highlightCard, setHighlightCard] = useState(null);

  useEffect(() => {
    const handleKakaAction = (e) => {
      const action = e.detail;
      if (!action) return;

      if (action.type === 'AUTO_CALC_FERTILIZER') {
        setSubTab(0);
        if (action.acre) {
          setFertAcres(action.acre);
          setFertUnit('acre');
        }
        if (action.crop) {
          setFertCrop(action.crop);
        }
        setHighlightCard('fert-result');
        const scrollCardWithRetry = (elementId, retries = 5, delay = 100) => {
          let attempt = 0;
          const tryScroll = () => {
            const el = document.getElementById(elementId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (attempt < retries) {
              attempt++;
              setTimeout(tryScroll, delay);
            }
          };
          tryScroll();
        };
        scrollCardWithRetry('kaka-fert-result-card');
        setTimeout(() => setHighlightCard(null), 3500);
      } else if (action.type === 'ASK_ACRES') {
        setSubTab(0);
        setHighlightCard('fert-input');
        const scrollCardWithRetry = (elementId, retries = 5, delay = 100) => {
          let attempt = 0;
          const tryScroll = () => {
            const el = document.getElementById(elementId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (attempt < retries) {
              attempt++;
              setTimeout(tryScroll, delay);
            }
          };
          tryScroll();
        };
        scrollCardWithRetry('kaka-fert-input-card');
        setTimeout(() => setHighlightCard(null), 3500);
      }
    };

    window.addEventListener('kisan_kaka_action', handleKakaAction);
    return () => window.removeEventListener('kisan_kaka_action', handleKakaAction);
  }, []);

  // URL subtab parsing and inter-tab event listener
  useEffect(() => {
    const parseSubTab = (val) => {
      if (val === null || val === undefined) return null;
      const lower = String(val).toLowerCase();
      if (['dhan', 'paddy', 'msp', '1'].includes(lower)) return 1;
      if (['schemes', 'yojana', 'yojna', '2'].includes(lower)) return 2;
      if (['fert', 'fertilizer', 'khad', '0'].includes(lower)) return 0;
      return null;
    };

    const params = new URLSearchParams(window.location.search);
    const subtabParam = params.get('subtab');
    const parsed = parseSubTab(subtabParam);
    if (parsed !== null) {
      setSubTab(parsed);
    }

    const handleSwitchSubTab = (e) => {
      const target = e?.detail?.subTab ?? e?.detail?.subtab;
      const p = parseSubTab(target);
      if (p !== null) {
        setSubTab(p);
      }
    };

    window.addEventListener('kisan_switch_subtab', handleSwitchSubTab);
    return () => window.removeEventListener('kisan_switch_subtab', handleSwitchSubTab);
  }, []);

  const handleSubTabChange = (idx) => {
    setSubTab(idx);
    try {
      const url = new URL(window.location.href);
      const subtabNames = ['fert', 'dhan', 'yojana'];
      url.searchParams.set('subtab', subtabNames[idx]);
      window.history.replaceState(window.history.state, '', url.pathname + url.search);
    } catch {}
  };

  const loadFromMongo = async () => {
    const liveFert = await getFertilizers();
    if (liveFert && Object.keys(liveFert).length > 0) setFertData(liveFert);
    const liveSchemes = await getSchemes();
    if (liveSchemes && Array.isArray(liveSchemes)) setSchemesList(liveSchemes);
  };

  useEffect(() => {
    loadFromMongo();
  }, []);

  // Fetch official DAC&FW District Soil Health Card baseline
  useEffect(() => {
    let isMounted = true;
    const fetchSoilHealth = async () => {
      try {
        const res = await getDistrictSoilHealth(selectedDistrict);
        if (isMounted && res && res.data) {
          setDistrictSoilHealth(res.data);
        }
      } catch (e) {
        console.warn('[Soil Health Fetch Error]', e);
      }
    };
    fetchSoilHealth();
    return () => {
      isMounted = false;
    };
  }, [selectedDistrict]);

  return (
    <Box sx={{ pb: 1, pt: 0 }} className="fade-in">
      {/* Modern Capsule Tab Switcher */}
      <Box sx={{ mb: 2.5, display: 'flex', gap: 1, p: 0.6, bgcolor: '#f1f5f9', borderRadius: '14px', maxWidth: { xs: '100%', md: 680 }, mx: 'auto' }}>
        {[
          { label: isChhattisgarhi ? 'खाद हिसाब' : 'खाद कैलकुलेटर', icon: <CalculateIcon sx={{ fontSize: 18 }} /> },
          { label: isChhattisgarhi ? `धान ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}` : `धान ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}`, icon: <MonetizationOnIcon sx={{ fontSize: 18 }} /> },
          { label: isChhattisgarhi ? 'सरकारी योजना' : 'सरकारी योजनाएं', icon: <PolicyIcon sx={{ fontSize: 18 }} /> },
        ].map((item, idx) => (
          <Button
            key={idx}
            fullWidth
            onClick={() => handleSubTabChange(idx)}
            startIcon={item.icon}
            sx={{
              py: 0.9,
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: subTab === idx ? '#ffffff' : 'transparent',
              color: subTab === idx ? '#1b5e20' : '#64748b',
              boxShadow: subTab === idx ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: subTab === idx ? '#ffffff' : 'rgba(255,255,255,0.5)',
                color: '#1b5e20'
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* SUBTAB 0: FERTILIZER CALCULATOR */}
      {subTab === 0 && (
        <FertilizerCalculatorSubTab
          fertData={fertData}
          fertCrop={fertCrop}
          setFertCrop={setFertCrop}
          fertUnit={fertUnit}
          setFertUnit={setFertUnit}
          fertAcres={fertAcres}
          setFertAcres={setFertAcres}
          highlightCard={highlightCard}
          districtSoilHealth={districtSoilHealth}
          loadFromMongo={loadFromMongo}
        />
      )}

      {/* SUBTAB 1: PADDY ₹3100 KHARIDI CALCULATOR */}
      {subTab === 1 && (
        <DhanMspCalculatorSubTab />
      )}

      {/* SUBTAB 2: GOVERNMENT SCHEMES & PORTALS */}
      {subTab === 2 && (
        <GovernmentSchemesSubTab
          schemesList={schemesList}
          loadFromMongo={loadFromMongo}
        />
      )}
    </Box>
  );
};
