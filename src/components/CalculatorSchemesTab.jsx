import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Button,
  Chip,
  Paper,
  Divider,
  Alert,
  Collapse
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PolicyIcon from '@mui/icons-material/Policy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ScienceIcon from '@mui/icons-material/Science';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { speakText, stopSpeech } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { getFertilizers, getSchemes, getCachedModuleData, getDistrictSoilHealth } from '../services/apiService';
import { CG_SOIL_PROFILES } from '../services/weatherService';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { TokenGuideModal } from './TokenGuideModal';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';
import { notify } from '../services/notificationService';
import { useLanguage } from '../utils/i18n';
import { acreToDismil, dismilToAcre, stepAcre, stepDismil, calculatePaddyProcurement } from '../utils/unitConverter';
import { FERTILIZER_DOSES, SCHEMES } from '../data/kisanData';

export const CalculatorSchemesTab = ({ selectedDistrict = 'रायपुर' }) => {
  const [subTab, setSubTab] = useState(0);
  const [openTokenGuide, setOpenTokenGuide] = useState(false);

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

  // Fertilizer Calculator State
  const { isChhattisgarhi, t } = useLanguage();
  const [fertCrop, setFertCrop] = useState('paddy');
  const [fertUnit, setFertUnit] = useState('acre'); // 'acre' | 'dismil'
  const [fertAcres, setFertAcres] = useState(1);
  const [soilType, setSoilType] = useState('सामान्य');
  const [topography, setTopography] = useState('dand'); // 'dand' | 'bahra'
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [soilSensorData, setSoilSensorData] = useState(null);
  const [showAdvancedSoil, setShowAdvancedSoil] = useState(false);

  // Paddy Kharidi Calculator State
  const [paddyUnit, setPaddyUnit] = useState('acre'); // 'acre' | 'dismil'
  const [paddyAcres, setPaddyAcres] = useState(2.5);

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

  const activeFert = fertData ? (fertData[fertCrop] || fertData.paddy || Object.values(fertData)[0]) : null;
  const acresNum = fertUnit === 'dismil' ? dismilToAcre(fertAcres) : (parseFloat(fertAcres) || 0);

  // Multipliers based on live Soil IoT probe readings
  let nMult = 1.0;
  let pMult = 1.0;
  let kMult = 1.0;
  if (soilSensorData && soilSensorData.analysis) {
    if (soilSensorData.analysis.nLevel === 'कम') nMult = 1.15;
    else if (soilSensorData.analysis.nLevel === 'अधिक') nMult = 0.8;
    if (soilSensorData.analysis.pLevel === 'कम') pMult = 1.2;
    else if (soilSensorData.analysis.pLevel === 'अधिक') pMult = 0.85;
    if (soilSensorData.analysis.kLevel === 'कम') kMult = 1.25;
    else if (soilSensorData.analysis.kLevel === 'अधिक') kMult = 0.8;
  }

  const totalUreaKg = activeFert ? Math.round(activeFert.ureaTotal * acresNum * nMult) : 0;
  const totalDapKg = activeFert ? Math.round(activeFert.dapTotal * acresNum * pMult) : 0;
  const totalMopKg = activeFert ? Math.round(activeFert.mopTotal * acresNum * kMult) : 0;
  const totalZincKg = activeFert ? Math.round((activeFert.zincSulfate || 0) * acresNum) : 0;

  // Bags estimation (Urea 45kg bag, DAP 50kg bag, MOP 50kg bag)
  const ureaBags = (totalUreaKg / 45).toFixed(1);
  const dapBags = (totalDapKg / 50).toFixed(1);
  const mopBags = (totalMopKg / 50).toFixed(1);

  // Paddy Kharidi Math - Fully Environment Driven & Bardana Engine
  const pAcresNum = paddyUnit === 'dismil' ? dismilToAcre(paddyAcres) : (parseFloat(paddyAcres) || 0);
  const paddyMath = calculatePaddyProcurement(pAcresNum, appConfig.paddyScheme.maxQuintalsPerAcre);
  const maxQuintals = paddyMath.maxQuintals.toFixed(1);
  const totalPaddyAmount = paddyMath.totalPayout;
  const mspPart = paddyMath.mspCommon;
  const bonusPart = paddyMath.bonusCommon;

  const handleToggleFertUnit = (newUnit) => {
    if (newUnit === fertUnit) return;
    if (newUnit === 'dismil') {
      setFertAcres(acreToDismil(fertAcres));
    } else {
      setFertAcres(dismilToAcre(fertAcres));
    }
    setFertUnit(newUnit);
  };

  const handleStepFert = (delta) => {
    if (fertUnit === 'dismil') {
      setFertAcres((prev) => stepDismil(prev, delta * 50));
    } else {
      setFertAcres((prev) => stepAcre(prev, delta));
    }
  };

  const handleTogglePaddyUnit = (newUnit) => {
    if (newUnit === paddyUnit) return;
    if (newUnit === 'dismil') {
      setPaddyAcres(acreToDismil(paddyAcres));
    } else {
      setPaddyAcres(dismilToAcre(paddyAcres));
    }
    setPaddyUnit(newUnit);
  };

  const handleStepPaddy = (delta) => {
    if (paddyUnit === 'dismil') {
      setPaddyAcres((prev) => stepDismil(prev, delta * 50));
    } else {
      setPaddyAcres((prev) => stepAcre(prev, delta));
    }
  };

  const handleReadFertSummary = () => {
    if (!activeFert) {
      speakText('खाद डेटा अभी उपलब्ध नहीं है। कृपया इंटरनेट कनेक्ट कर पुनः लोड करें।');
      return;
    }
    const text = isChhattisgarhi
      ? `${acresNum} एकड़ (${Math.round(acresNum * 100)} डिसमिल) ${activeFert.name} बर कुल ${totalUreaKg} किलो यूरिया, ${totalDapKg} किलो डीएपी अऊ ${totalMopKg} किलो पोटाश के जरूरत परही।`
      : `${acresNum} एकड़ ${activeFert.name} के लिए कुल ${totalUreaKg} किलो यूरिया, ${totalDapKg} किलो डीएपी और ${totalMopKg} किलो पोटाश की आवश्यकता होगी।`;
    speakText(text);
  };

  const handleShareFert = () => {
    if (!activeFert) return;
    notify.info('व्हाट्सएप पर खाद हिसाब साझा किया जा रहा है...');
    const text = `🌾 *किसान साथी - खाद नाप-जोख हिसाब* 🧮
━━━━━━━━━━━━━━━━━━
🌾 *फसल:* ${activeFert.name}
📐 *रकबा:* ${acresNum} एकड़ (${Math.round(acresNum * 100)} डिसमिल)

📦 *कुल आवश्यक खाद मात्रा:*
🟢 *यूरिया (46% N):* ${ureaBags} बोरी (${totalUreaKg} kg)
🔵 *डीएपी (18:46:0):* ${dapBags} बोरी (${totalDapKg} kg)
🟠 *पोटाश (60% K):* ${mopBags} बोरी (${totalMopKg} kg)
🟣 *जिंक सल्फेट (21% Zn):* ${totalZincKg} kg
━━━━━━━━━━━━━━━━━━
📍 IGKV रायपुर कृषि वैज्ञानिक अनुशंसा आधारित
📲 किसान साथी ऐप: ${appConfig.webPortalUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleReadPaddyMath = () => {
    const text = isChhattisgarhi
      ? `${pAcresNum} एकड़ (${paddyMath.dismil} डिसमिल) रकबा म 21 क्विंटल प्रति एकड़ हिसाब ले आप अधिकतम ${paddyMath.maxQuintals} क्विंटल धान बेच सकथो। ₹${paddyMath.totalPayout.toLocaleString('en-IN')} के कुल भुगतान मिलही। ${paddyMath.bardanaBags} जूट बारदाना लगही, जेकर ₹${paddyMath.bardanaReimbursement.toLocaleString('en-IN')} प्रतिपूर्ति अलग ले मिलही।`
      : `${pAcresNum} एकड़ रकबे में ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल प्रति एकड़ के हिसाब से आप अधिकतम ${paddyMath.maxQuintals} क्विंटल धान बेच सकते हैं। ₹${paddyMath.totalPayout.toLocaleString('en-IN')} की कुल राशि बनेगी। कुल ${paddyMath.bardanaBags} बारदाने लगेंगे।`;
    speakText(text);
  };

  const handleSharePaddy = () => {
    notify.info('व्हाट्सएप पर धान हिसाब साझा किया जा रहा है...');
    const text = `🌾 *किसान साथी - सरकारी धान उपार्जन रसीद हिसाब* 🌾
━━━━━━━━━━━━━━━━━━
📍 *राज्य:* ${appConfig.stateName} (कृषक उन्नति योजना)
📐 *दर्ज रकबा:* ${pAcresNum} एकड़ (${paddyMath.dismil} डिसमिल)
⚖️ *अधिकतम धान खरीदी:* ${maxQuintals} क्विंटल (${appConfig.paddyScheme.maxQuintalsPerAcre} क्विं/एकड़)
💰 *कुल बैंक भुगतान (@ ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}):* ₹${totalPaddyAmount.toLocaleString('en-IN')}

📊 *भुगतान विवरण:*
1. समिति MSP (@ ₹${appConfig.paddyScheme.mspRate.toLocaleString('en-IN')}): ₹${mspPart.toLocaleString('en-IN')}
2. अंतर राशि / बोनस DBT (@ ₹${appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')}): ₹${bonusPart.toLocaleString('en-IN')}

🎒 *बारदाना व टोकन:*
• जूट बोरी (40kg मानक): ~${paddyMath.bardanaBags} बोरी
• शासन प्रतिपूर्ति: ₹${paddyMath.bardanaReimbursement.toLocaleString('en-IN')} (₹25/बोरा वापसी)
• टोकन तुंहर हाथ कोटा: अधिकतम ${paddyMath.tokenLimit} टोकन
━━━━━━━━━━━━━━━━━━
📲 किसान साथी ऐप: ${appConfig.webPortalUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Box sx={{ pb: 1, pt: 0 }} className="fade-in">
      {/* Sub Header Tabs */}
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

      {/* TAB 0: FERTILIZER CALCULATOR */}
      {subTab === 0 && (
        <Box>
          <Card
            sx={{
              p: { xs: 1.8, sm: 2.5 },
              mb: 2.5,
              borderRadius: '20px',
              border: '1.5px solid #c8e6c9',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 16px rgba(27, 94, 32, 0.06)'
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  {isChhattisgarhi ? '🌾 खाद नाप-जोख (खाद हिसाब)' : '🌾 स्मार्ट खाद मात्रा कैलकुलेटर'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                  {isChhattisgarhi ? 'इंदिरा गांधी कृषि वि.वि. (IGKV) अनुशंसित वैज्ञानिक पैमाना' : 'इंदिरा गांधी कृषि विश्वविद्यालय (IGKV) अनुशंसित वैज्ञानिक मानक'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <KakaWalkthroughButton featureId="calculator" />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                  onClick={handleReadFertSummary}
                  sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderRadius: '8px', color: '#1b5e20', borderColor: '#a5d6a7' }}
                >
                  {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} />}
                  onClick={handleShareFert}
                  sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderRadius: '8px', color: '#1b5e20', borderColor: '#a5d6a7' }}
                >
                  {isChhattisgarhi ? 'शेयर' : 'शेयर'}
                </Button>
              </Box>
            </Box>

            {/* Input Console: Crop + Rakba with Steppers */}
            <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', mb: 2 }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={isChhattisgarhi ? 'फसल चुनव' : 'फसल चुनें'}
                    value={fertCrop}
                    onChange={(e) => setFertCrop(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#ffffff' } }}
                  >
                    <MenuItem value="paddy">{isChhattisgarhi ? 'धान (चांउर)' : 'धान (Paddy)'}</MenuItem>
                    <MenuItem value="wheat">{isChhattisgarhi ? 'गेहूं (गहुं)' : 'गेहूं (Wheat)'}</MenuItem>
                    <MenuItem value="chana">{isChhattisgarhi ? 'चना (बूट)' : 'चना (Chickpea)'}</MenuItem>
                    <MenuItem value="maize">{isChhattisgarhi ? 'मक्का (जुनहरी)' : 'मक्का (Maize)'}</MenuItem>
                  </TextField>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  id="kaka-fert-input-card"
                  className={highlightCard === 'fert-input' ? 'kaka-spotlight-pulse' : ''}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>
                        {fertUnit === 'acre' ? (isChhattisgarhi ? 'खेत के रकबा (एकड़)' : 'खेत का रकबा (एकड़)') : (isChhattisgarhi ? 'खेत के रकबा (डिसमिल)' : 'खेत का रकबा (डिसमिल)')}
                      </Typography>
                      {/* Unit Switcher */}
                      <Box sx={{ display: 'inline-flex', bgcolor: '#e2e8f0', p: 0.2, borderRadius: 1.5 }}>
                        <Button
                          size="small"
                          onClick={() => handleToggleFertUnit('acre')}
                          sx={{
                            py: 0.1,
                            px: 0.8,
                            minWidth: 0,
                            fontSize: '0.66rem',
                            fontWeight: fertUnit === 'acre' ? 800 : 600,
                            bgcolor: fertUnit === 'acre' ? '#1b5e20' : 'transparent',
                            color: fertUnit === 'acre' ? '#fff' : '#475569',
                            borderRadius: 1,
                            textTransform: 'none',
                            lineHeight: 1.2
                          }}
                        >
                          {isChhattisgarhi ? 'एकड़' : 'एकड़'}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleToggleFertUnit('dismil')}
                          sx={{
                            py: 0.1,
                            px: 0.8,
                            minWidth: 0,
                            fontSize: '0.66rem',
                            fontWeight: fertUnit === 'dismil' ? 800 : 600,
                            bgcolor: fertUnit === 'dismil' ? '#1b5e20' : 'transparent',
                            color: fertUnit === 'dismil' ? '#fff' : '#475569',
                            borderRadius: 1,
                            textTransform: 'none',
                            lineHeight: 1.2
                          }}
                        >
                          {isChhattisgarhi ? 'डिसमिल' : 'डिसमिल'}
                        </Button>
                      </Box>
                    </Box>

                    {/* Input with Steppers */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStepFert(-0.5)}
                        aria-label="रकबा घटाएं"
                        sx={{
                          minWidth: 36,
                          height: 40,
                          p: 0,
                          borderRadius: '10px',
                          borderColor: '#cbd5e1',
                          color: '#1b5e20',
                          fontWeight: 900,
                          bgcolor: '#ffffff'
                        }}
                      >
                        <RemoveIcon sx={{ fontSize: 18 }} />
                      </Button>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{
                          min: fertUnit === 'dismil' ? 10 : 0.25,
                          step: fertUnit === 'dismil' ? 5 : 0.25,
                          inputMode: 'decimal',
                          style: { fontSize: '1.05rem', fontWeight: 800, textAlign: 'center' }
                        }}
                        value={fertAcres}
                        onChange={(e) => setFertAcres(e.target.value)}
                        helperText={
                          fertUnit === 'acre'
                            ? `≈ ${Math.round(parseFloat(fertAcres || 0) * 100)} डिसमिल`
                            : `≈ ${(parseFloat(fertAcres || 0) / 100).toFixed(2)} एकड़`
                        }
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#ffffff' }, '& .MuiFormHelperText-root': { textAlign: 'center', mt: 0.3 } }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStepFert(0.5)}
                        aria-label="रकबा बढ़ाएं"
                        sx={{
                          minWidth: 36,
                          height: 40,
                          p: 0,
                          borderRadius: '10px',
                          borderColor: '#cbd5e1',
                          color: '#1b5e20',
                          fontWeight: 900,
                          bgcolor: '#ffffff'
                        }}
                      >
                        <AddIcon sx={{ fontSize: 18 }} />
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Quick Acre Chips */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.6, display: 'block', fontSize: '0.74rem' }}>
                  {isChhattisgarhi ? `⚡ तुरंत ${fertUnit === 'acre' ? 'एकड़' : 'डिसमिल'} चुनव:` : `⚡ त्वरित ${fertUnit === 'acre' ? 'एकड़' : 'डिसमिल'} चुनें:`}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.8 }}>
                  {(fertUnit === 'acre' ? [0.5, 1, 2, 3, 5] : [50, 75, 100, 150, 250]).map((val) => {
                    const isSelected = parseFloat(fertAcres) === val;
                    return (
                      <Button
                        key={val}
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => setFertAcres(val)}
                        sx={{
                          py: 0.4,
                          px: 0.5,
                          fontSize: { xs: '0.72rem', sm: '0.78rem' },
                          fontWeight: isSelected ? 800 : 600,
                          bgcolor: isSelected ? '#1b5e20' : '#fff',
                          color: isSelected ? '#fff' : '#1b5e20',
                          borderColor: '#a5d6a7',
                          minWidth: 0,
                          borderRadius: '10px',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: isSelected ? '#144a19' : '#e8f5e9',
                            borderColor: '#2e7d32'
                          }
                        }}
                      >
                        {val} {fertUnit === 'acre' ? (isChhattisgarhi ? 'एकड़' : 'एकड़') : (isChhattisgarhi ? 'डिस.' : 'डिस.')}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* DIRECT HERO SACK METRIC CARDS (Immediate results without scroll fatigue) */}
            {!activeFert ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  my: 2,
                  textAlign: 'center',
                  borderRadius: '16px',
                  bgcolor: '#f8fafc',
                  border: '1.5px dashed #cbd5e1'
                }}
              >
                <ScienceIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                  {isChhattisgarhi ? 'खाद सिफारिश के जानकारी नइये' : 'खाद सिफारिश डेटा उपलब्ध नहीं है'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 440, mx: 'auto', mb: 2 }}>
                  {isChhattisgarhi
                    ? 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत कोनो भी अनुमानित खाद मात्रा नइ दिखाय जाय। सटीक कृषि विश्वविद्यालय अनुशंसित पोषण लोड करे बर इंटरनेट कनेक्ट कर फेर लोड करव।'
                    : 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत कोई भी अनुमानित या मनगढ़ंत खाद मात्रा नहीं दिखाई जाती। सटीक कृषि विश्वविद्यालय अनुशंसित पोषण लोड करने हेतु इंटरनेट कनेक्ट कर पुनः लोड करें।'}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={loadFromMongo}
                  sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: 2 }}
                >
                  {isChhattisgarhi ? 'फेर लोड करव (Retry)' : 'पुनः लोड करें (Retry)'}
                </Button>
              </Paper>
            ) : (
              <Box
                id="kaka-fert-result-card"
                className={highlightCard === 'fert-result' ? 'kaka-spotlight-pulse' : ''}
                sx={{ borderRadius: 3, mb: 2.5 }}
              >
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800, mb: 1.2, display: 'block', fontSize: '0.82rem' }}>
                  {isChhattisgarhi ? `📦 कुल जरूरी खाद के बोरी अउ मात्रा (${acresNum} एकड़ बर):` : `📦 कुल आवश्यक खाद की बोरी व मात्रा (${acresNum} एकड़ हेतु):`}
                </Typography>

                <Grid container spacing={1.5}>
                  {/* Urea */}
                  <Grid item xs={6} sm={3} sx={{ display: 'flex' }}>
                    <Paper
                      elevation={0}
                      className="touch-card"
                      sx={{
                        p: { xs: 1.2, sm: 1.5 },
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#ffffff',
                        border: '1.5px solid #a5d6a7',
                        borderTop: '4px solid #2e7d32',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, fontSize: { xs: '0.78rem', sm: '0.82rem' } }}>
                          यूरिया (Urea)
                        </Typography>
                        <Chip
                          label="46% N"
                          size="small"
                          sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.62rem', borderRadius: '6px' }}
                        />
                      </Box>
                      <Box sx={{ my: 0.5, textAlign: 'center' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1 }}>
                            {ureaBags}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2e7d32', fontSize: '0.86rem' }}>
                            बोरी
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                          {isChhattisgarhi ? 'जम्मा' : 'कुल'}: <strong>{totalUreaKg} kg</strong> (45kg/{isChhattisgarhi ? 'बोरी' : 'बोरी'})
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#f1f8e9', p: 0.5, borderRadius: '8px', textAlign: 'center', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#33691e', fontSize: '0.66rem', fontWeight: 700 }}>
                          {isChhattisgarhi ? 'नाइट्रोजन पोषण' : 'नाइट्रोजन पोषण'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* DAP */}
                  <Grid item xs={6} sm={3} sx={{ display: 'flex' }}>
                    <Paper
                      elevation={0}
                      className="touch-card"
                      sx={{
                        p: { xs: 1.2, sm: 1.5 },
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#ffffff',
                        border: '1.5px solid #90caf9',
                        borderTop: '4px solid #1565c0',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 800, fontSize: { xs: '0.78rem', sm: '0.82rem' } }}>
                          डीएपी (DAP)
                        </Typography>
                        <Chip
                          label="18:46:0"
                          size="small"
                          sx={{ bgcolor: '#e3f2fd', color: '#0d47a1', fontWeight: 800, height: 18, fontSize: '0.62rem', borderRadius: '6px' }}
                        />
                      </Box>
                      <Box sx={{ my: 0.5, textAlign: 'center' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0d47a1', fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1 }}>
                            {dapBags}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565c0', fontSize: '0.86rem' }}>
                            बोरी
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                          {isChhattisgarhi ? 'जम्मा' : 'कुल'}: <strong>{totalDapKg} kg</strong> (50kg/{isChhattisgarhi ? 'बोरी' : 'बोरी'})
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#e3f2fd', p: 0.5, borderRadius: '8px', textAlign: 'center', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#0d47a1', fontSize: '0.66rem', fontWeight: 700 }}>
                          {isChhattisgarhi ? 'फास्फोरस व जड़ विकास' : 'फास्फोरस व जड़ विकास'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* MOP (Potash) */}
                  <Grid item xs={6} sm={3} sx={{ display: 'flex' }}>
                    <Paper
                      elevation={0}
                      className="touch-card"
                      sx={{
                        p: { xs: 1.2, sm: 1.5 },
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#ffffff',
                        border: '1.5px solid #ffcc80',
                        borderTop: '4px solid #e65100',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(230, 81, 0, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#bf360c', fontWeight: 800, fontSize: { xs: '0.78rem', sm: '0.82rem' } }}>
                          पोटाश (MOP)
                        </Typography>
                        <Chip
                          label="60% K"
                          size="small"
                          sx={{ bgcolor: '#fff3e0', color: '#bf360c', fontWeight: 800, height: 18, fontSize: '0.62rem', borderRadius: '6px' }}
                        />
                      </Box>
                      <Box sx={{ my: 0.5, textAlign: 'center' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#bf360c', fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1 }}>
                            {mopBags}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.86rem' }}>
                            बोरी
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                          {isChhattisgarhi ? 'जम्मा' : 'कुल'}: <strong>{totalMopKg} kg</strong> (50kg/{isChhattisgarhi ? 'बोरी' : 'बोरी'})
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#fff3e0', p: 0.5, borderRadius: '8px', textAlign: 'center', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#bf360c', fontSize: '0.66rem', fontWeight: 700 }}>
                          {isChhattisgarhi ? 'दाने चमक व रोग प्रतिरोध' : 'दाने चमक व रोग प्रतिरोध'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Zinc Sulfate */}
                  <Grid item xs={6} sm={3} sx={{ display: 'flex' }}>
                    <Paper
                      elevation={0}
                      className="touch-card"
                      sx={{
                        p: { xs: 1.2, sm: 1.5 },
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        bgcolor: '#ffffff',
                        border: '1.5px solid #ce93d8',
                        borderTop: '4px solid #7b1fa2',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.06)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 0.4 }}>
                        <Typography variant="caption" sx={{ color: '#4a148c', fontWeight: 800, fontSize: { xs: '0.78rem', sm: '0.82rem' } }}>
                          जिंक सल्फेट
                        </Typography>
                        <Chip
                          label="21% Zn"
                          size="small"
                          sx={{ bgcolor: '#f3e5f5', color: '#4a148c', fontWeight: 800, height: 18, fontSize: '0.62rem', borderRadius: '6px' }}
                        />
                      </Box>
                      <Box sx={{ my: 0.5, textAlign: 'center' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.5 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#4a148c', fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1 }}>
                            {totalZincKg}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#7b1fa2', fontSize: '0.86rem' }}>
                            kg
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', display: 'block', mt: 0.3 }}>
                          {isChhattisgarhi ? 'हर एकड़ 10 kg पैमाना' : 'प्रति एकड़ 10 kg मानक'}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: '#f3e5f5', p: 0.5, borderRadius: '8px', textAlign: 'center', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#4a148c', fontSize: '0.66rem', fontWeight: 700 }}>
                          {isChhattisgarhi ? 'खैरा बीमारी ले बचाव' : 'खैरा रोग से बचाव'}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* COLLAPSIBLE ADVANCED SOIL & IOT TRAY */}
            <Box sx={{ mb: 2.5 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setShowAdvancedSoil((prev) => !prev)}
                endIcon={showAdvancedSoil ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                sx={{
                  py: 1,
                  borderRadius: '12px',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  bgcolor: showAdvancedSoil ? '#f1f5f9' : '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: 1.5,
                  '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <span>🌾</span>
                  <span>{isChhattisgarhi ? 'उन्नत समायोजन (माटी प्रकार, ढलान अऊ IoT सेंसर)' : 'उन्नत समायोजन (मिट्टी प्रकार, ढलान व IoT सेंसर)'}</span>
                  {(soilType !== 'सामान्य' || topography !== 'dand' || soilSensorData) && (
                    <Chip label="सक्रिय" size="small" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.62rem' }} />
                  )}
                </Box>
              </Button>

              <Collapse in={showAdvancedSoil}>
                <Box sx={{ pt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Soil Type Selector */}
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={isChhattisgarhi ? 'माटी के प्रकार' : 'मिट्टी का प्रकार'}
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  >
                    <MenuItem value="सामान्य">{isChhattisgarhi ? 'सामान्य (दोमट माटी)' : 'सामान्य (मानक दोमट)'}</MenuItem>
                    <MenuItem value="मटासी">{isChhattisgarhi ? 'मटासी (पियरा-दोमट)' : 'मटासी (पीली-दोमट)'}</MenuItem>
                    <MenuItem value="डोर्सा">{isChhattisgarhi ? 'डोर्सा (मध्यम भारी)' : 'डोर्सा (मध्यम भारी)'}</MenuItem>
                    <MenuItem value="कन्हार">{isChhattisgarhi ? 'कन्हार (करिया चिकनी माटी)' : 'कन्हार (काली चिकनी)'}</MenuItem>
                    <MenuItem value="भाठा">{isChhattisgarhi ? 'भाठा (लाल कंकरीली माटी)' : 'भाठा (लाल कंकरीली)'}</MenuItem>
                  </TextField>

                  {/* Topography Selector (डांड/टिकरा vs बाहरा/गहिरा) */}
                  <Box sx={{ bgcolor: '#f8fafc', p: 1.4, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8, flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800, fontSize: '0.78rem' }}>
                        {isChhattisgarhi ? '🏞️ खेत के ढलान व स्थिति:' : '🏞️ खेत के ढलान व स्थिति (Topography):'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.6 }}>
                        <Chip
                          label={isChhattisgarhi ? 'डांड / टिकरा (ऊंचा खेत)' : 'डांड / टिकरा (ऊंचा)'}
                          size="small"
                          onClick={() => setTopography('dand')}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: topography === 'dand' ? 800 : 600,
                            bgcolor: topography === 'dand' ? '#e8f5e9' : '#fff',
                            color: topography === 'dand' ? '#1b5e20' : '#64748b',
                            border: topography === 'dand' ? '1.5px solid #2e7d32' : '1px solid #cbd5e1',
                            fontSize: '0.72rem'
                          }}
                        />
                        <Chip
                          label={isChhattisgarhi ? 'बाहरा / गहिरा (निचला खेत)' : 'बाहरा / गहिरा (निचला)'}
                          size="small"
                          onClick={() => setTopography('bahra')}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: topography === 'bahra' ? 800 : 600,
                            bgcolor: topography === 'bahra' ? '#e0f2fe' : '#fff',
                            color: topography === 'bahra' ? '#0369a1' : '#64748b',
                            border: topography === 'bahra' ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                            fontSize: '0.72rem'
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.74rem', display: 'block', lineHeight: 1.35 }}>
                      💡 <strong>{isChhattisgarhi ? 'सलाह:' : 'छत्तीसगढ़ी सलाह:'}</strong> {topography === 'dand' ? t('topo_dand_tip') : t('topo_bahra_tip')}
                    </Typography>
                  </Box>

                  {/* Smart Soil IoT Sensor Integration */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0f2f1', p: 1.4, borderRadius: '12px', border: '1.2px solid #80cbc4', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScienceIcon sx={{ color: '#00796b', fontSize: 24 }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#004d40' }}>
                          {isChhattisgarhi ? '🔬 माटी IoT सेंसर' : '🔬 स्मार्ट मिट्टी IoT सेंसर'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#00695c', fontSize: '0.73rem', display: 'block' }}>
                          {soilSensorData ? `सेंसर सक्रिय: pH ${soilSensorData.soilReading.ph} (${soilSensorData.analysis.phStatus}) • N: ${soilSensorData.soilReading.nitrogen}, P: ${soilSensorData.soilReading.phosphorus}, K: ${soilSensorData.soilReading.potassium} kg/ha` : (isChhattisgarhi ? 'ब्लूटूथ ले असली pH अऊ N-P-K नाप के सटीक खाद मात्रा पाव' : 'ब्लूटूथ प्रोब से वास्तविक pH व N-P-K मापकर सटीक संशोधित खाद मात्रा पाएं')}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setOpenSoilIot(true)}
                      sx={{ bgcolor: '#00796b', color: '#fff', fontSize: '0.72rem', fontWeight: 700, borderRadius: '8px', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#004d40' } }}
                    >
                      {soilSensorData ? (isChhattisgarhi ? 'फेर जांचव' : 'पुनः जांचें') : (isChhattisgarhi ? 'सेंसर जोड़व' : 'सेंसर कनेक्ट करें')}
                    </Button>
                  </Box>

                  {soilSensorData && (
                    <Alert
                      severity={soilSensorData.soilReading?.isDemo ? 'warning' : 'success'}
                      sx={{ borderRadius: '12px', fontSize: '0.8rem' }}
                      onClose={() => setSoilSensorData(null)}
                    >
                      <strong>
                        {soilSensorData.soilReading?.isDemo ? '⚠️ डेमो खाद समायोजन लागू (केवल तकनीकी परीक्षण हेतु): ' : '🟢 लाइव स्मार्ट खाद समायोजन लागू: '}
                      </strong>
                      यूरिया ({soilSensorData.analysis.ureaAdjustment}), डीएपी ({soilSensorData.analysis.dapAdjustment}), पोटाश ({soilSensorData.analysis.mopAdjustment})। {soilSensorData.analysis.phAdvice}
                    </Alert>
                  )}

                  {/* Official DAC&FW Soil Health Card Baseline Insight */}
                  {districtSoilHealth && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.6,
                        borderRadius: '14px',
                        bgcolor: districtSoilHealth.isDistrictVerified ? '#f0fdf4' : '#fffbeb',
                        border: `1.5px solid ${districtSoilHealth.isDistrictVerified ? '#86efac' : '#fde68a'}`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <ScienceIcon sx={{ color: districtSoilHealth.isDistrictVerified ? '#16a34a' : '#d97706', fontSize: 20 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: districtSoilHealth.isDistrictVerified ? '#15803d' : '#b45309', fontSize: '0.86rem' }}>
                            🧪 {districtSoilHealth.district} मृदा स्वास्थ्य कार्ड (DAC&FW Soil Health Survey)
                          </Typography>
                        </Box>
                        <Chip
                          icon={districtSoilHealth.isDistrictVerified ? <CheckCircleIcon sx={{ fontSize: '13px !important' }} /> : <InfoOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                          label={districtSoilHealth.statusLabel}
                          size="small"
                          sx={{
                            bgcolor: districtSoilHealth.isDistrictVerified ? '#dcfce7' : '#fef3c7',
                            color: districtSoilHealth.isDistrictVerified ? '#166534' : '#92400e',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 22
                          }}
                        />
                      </Box>

                      {/* Nutrient Status Chips */}
                      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1 }}>
                        <Chip
                          label={`नाइट्रोजन (N): ${districtSoilHealth.nitrogenStatus}`}
                          size="small"
                          sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.68rem', color: '#334155' }}
                        />
                        <Chip
                          label={`फास्फोरस (P): ${districtSoilHealth.phosphorusStatus}`}
                          size="small"
                          sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.68rem', color: '#334155' }}
                        />
                        <Chip
                          label={`पोटाश (K): ${districtSoilHealth.potashStatus}`}
                          size="small"
                          sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.68rem', color: '#334155' }}
                        />
                        <Chip
                          label={`pH: ${districtSoilHealth.phAverage}`}
                          size="small"
                          sx={{ bgcolor: '#fff', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.68rem', color: '#334155' }}
                        />
                      </Box>

                      {districtSoilHealth.micronutrientDeficiencies && districtSoilHealth.micronutrientDeficiencies.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1 }}>
                          {districtSoilHealth.micronutrientDeficiencies.map((m, idx) => (
                            <Chip
                              key={idx}
                              label={`⚠️ ${m.nutrient}: ${m.deficiencyPercent}% खेतों में कमी (${m.severity})`}
                              size="small"
                              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                            />
                          ))}
                        </Box>
                      )}

                      <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.78rem', lineHeight: 1.45, mb: 0.5 }}>
                        💡 <strong>जिला विशिष्ट खाद समायोजन:</strong> {districtSoilHealth.fertilizerRecommendationNote}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                        📜 {districtSoilHealth.officialSurveySource} • शून्य फर्जी डेटा नीति अनुपालित
                      </Typography>
                    </Paper>
                  )}

                  {/* Regional Soil Health Advisory Box */}
                  {soilType !== 'सामान्य' && CG_SOIL_PROFILES[soilType] && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.4,
                        borderRadius: '12px',
                        bgcolor: '#f1f8e9',
                        border: '1.2px solid #aed581'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2e7d32', fontSize: '0.85rem' }}>
                          🌱 {CG_SOIL_PROFILES[soilType].name}
                        </Typography>
                        <Chip
                          label={`pH: ${CG_SOIL_PROFILES[soilType].phRange}`}
                          size="small"
                          sx={{ bgcolor: '#dcedc8', color: '#1b5e20', fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                        />
                        <Chip
                          label={`जलधारण: ${CG_SOIL_PROFILES[soilType].waterRetention}`}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: '0.68rem', height: 20 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#33691e', fontSize: '0.78rem', display: 'block', lineHeight: 1.35 }}>
                        💡 <strong>कृषि सलाह:</strong> {CG_SOIL_PROFILES[soilType].advice}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Collapse>
            </Box>

            {/* FERTILIZER APPLICATION TIMELINE */}
            {activeFert && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 1.2, fontSize: '0.85rem' }}>
                  {isChhattisgarhi ? '⏱️ खाद कब अउ कतका डाले के हे (समय सारिणी):' : '⏱️ खाद कब और कितनी मात्रा में डालें (समय सारिणी):'}
                </Typography>

                <Grid container spacing={1.5}>
                  {activeFert.schedule && activeFert.schedule.map((step, idx) => (
                    <Grid item xs={12} md={6} key={idx} sx={{ display: 'flex' }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.4,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px'
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
                            <Chip
                              label={isChhattisgarhi ? `पायरी ${idx + 1}` : `चरण ${idx + 1}`}
                              size="small"
                              sx={{ bgcolor: '#2e7d32', color: '#fff', height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                              {step.stage}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.6, fontSize: '0.74rem' }}>
                            {isChhattisgarhi ? 'बेरा' : 'समय'}: <strong>{step.time}</strong>
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 0.6 }}>
                            {step.urea && <Chip label={`यूरिया: ${step.urea}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem', borderColor: '#a5d6a7', color: '#1b5e20', fontWeight: 700 }} />}
                            {step.dap && <Chip label={`DAP: ${step.dap}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem', borderColor: '#90caf9', color: '#0d47a1', fontWeight: 700 }} />}
                            {step.mop && <Chip label={`पोटाश: ${step.mop}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem', borderColor: '#ffcc80', color: '#bf360c', fontWeight: 700 }} />}
                            {step.zinc && <Chip label={`जिंक: ${step.zinc}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem', borderColor: '#ce93d8', color: '#4a148c', fontWeight: 700 }} />}
                          </Box>
                        </Box>
                        {step.note && (
                          <Typography variant="caption" sx={{ color: '#d84315', display: 'block', fontSize: '0.72rem', fontWeight: 600, mt: 0.5 }}>
                            {isChhattisgarhi ? '⚠️ सुरता राखव: ' : '⚠️ सावधानी: '}{step.note}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Card>
        </Box>
      )}

      {/* TAB 1: PADDY ₹3100 KHARIDI CALCULATOR (Unified Digital Passbook Slip UI) */}
      {subTab === 1 && (
        <Box>
          <Card
            sx={{
              p: { xs: 1.8, sm: 2.5 },
              mb: 2.5,
              borderRadius: '20px',
              border: '1.5px solid #a5d6a7',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 16px rgba(27, 94, 32, 0.06)',
              maxWidth: { xs: '100%', md: 760 },
              mx: 'auto'
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  🌾 {appConfig.stateName} {isChhattisgarhi ? 'कृषक उन्नति धान खरीदी हिसाब' : 'कृषक उन्नति धान उपार्जन कैलकुलेटर'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#556958', fontSize: '0.74rem' }}>
                  {appConfig.paddyScheme.maxQuintalsPerAcre} {isChhattisgarhi ? `क्विंटल/एकड़ सीमा • ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्विंटल पक्का भाव` : `क्विंटल/एकड़ सीमा • ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्विंटल सुनिश्चित मूल्य`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                  onClick={handleReadPaddyMath}
                  sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderRadius: '8px', color: '#1b5e20', borderColor: '#a5d6a7' }}
                >
                  {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} />}
                  onClick={handleSharePaddy}
                  sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderRadius: '8px', color: '#1b5e20', borderColor: '#a5d6a7' }}
                >
                  {isChhattisgarhi ? 'शेयर' : 'शेयर'}
                </Button>
              </Box>
            </Box>

            {/* Input Console */}
            <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>
                  {isChhattisgarhi
                    ? (paddyUnit === 'acre' ? 'अपन खेत के रकबा (एकड़ म)' : 'अपन खेत के रकबा (डिसमिल म)')
                    : (paddyUnit === 'acre' ? 'अपनी जमीन का रकबा (एकड़ में)' : 'अपनी जमीन का रकबा (डिसमिल में)')}
                </Typography>
                {/* Unit Switcher */}
                <Box sx={{ display: 'inline-flex', bgcolor: '#e2e8f0', p: 0.2, borderRadius: 1.5 }}>
                  <Button
                    size="small"
                    onClick={() => handleTogglePaddyUnit('acre')}
                    sx={{
                      py: 0.1,
                      px: 0.8,
                      minWidth: 0,
                      fontSize: '0.66rem',
                      fontWeight: paddyUnit === 'acre' ? 800 : 600,
                      bgcolor: paddyUnit === 'acre' ? '#1b5e20' : 'transparent',
                      color: paddyUnit === 'acre' ? '#fff' : '#475569',
                      borderRadius: 1,
                      textTransform: 'none',
                      lineHeight: 1.2
                    }}
                  >
                    {isChhattisgarhi ? 'एकड़' : 'एकड़'}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleTogglePaddyUnit('dismil')}
                    sx={{
                      py: 0.1,
                      px: 0.8,
                      minWidth: 0,
                      fontSize: '0.66rem',
                      fontWeight: paddyUnit === 'dismil' ? 800 : 600,
                      bgcolor: paddyUnit === 'dismil' ? '#1b5e20' : 'transparent',
                      color: paddyUnit === 'dismil' ? '#fff' : '#475569',
                      borderRadius: 1,
                      textTransform: 'none',
                      lineHeight: 1.2
                    }}
                  >
                    {isChhattisgarhi ? 'डिसमिल' : 'डिसमिल'}
                  </Button>
                </Box>
              </Box>

              {/* Steppers */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleStepPaddy(-0.5)}
                  aria-label={isChhattisgarhi ? 'रकबा घटाव' : 'रकबा घटाएं'}
                  sx={{
                    minWidth: 36,
                    height: 40,
                    p: 0,
                    borderRadius: '10px',
                    borderColor: '#cbd5e1',
                    color: '#1b5e20',
                    fontWeight: 900,
                    bgcolor: '#ffffff'
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 18 }} />
                </Button>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  inputProps={{
                    min: paddyUnit === 'dismil' ? 10 : 0.1,
                    step: paddyUnit === 'dismil' ? 10 : 0.1,
                    inputMode: 'decimal',
                    style: { fontSize: '1.05rem', fontWeight: 800, textAlign: 'center' }
                  }}
                  value={paddyAcres}
                  onChange={(e) => setPaddyAcres(e.target.value)}
                  helperText={
                    paddyUnit === 'acre'
                      ? `≈ ${Math.round(parseFloat(paddyAcres || 0) * 100)} डिसमिल`
                      : `≈ ${(parseFloat(paddyAcres || 0) / 100).toFixed(2)} एकड़`
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#ffffff' }, '& .MuiFormHelperText-root': { textAlign: 'center', mt: 0.3 } }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleStepPaddy(0.5)}
                  aria-label={isChhattisgarhi ? 'रकबा बढ़ाव' : 'रकबा बढ़ाएं'}
                  sx={{
                    minWidth: 36,
                    height: 40,
                    p: 0,
                    borderRadius: '10px',
                    borderColor: '#cbd5e1',
                    color: '#1b5e20',
                    fontWeight: 900,
                    bgcolor: '#ffffff'
                  }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </Button>
              </Box>

              {/* Quick Chips */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.6, display: 'block', fontSize: '0.74rem' }}>
                  {isChhattisgarhi ? `⚡ झटपट ${paddyUnit === 'acre' ? 'एकड़' : 'डिसमिल'} चुनव:` : `⚡ त्वरित ${paddyUnit === 'acre' ? 'एकड़' : 'डिसमिल'} चुनें:`}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.8 }}>
                  {(paddyUnit === 'acre' ? [1, 2, 2.5, 5, 10] : [50, 100, 200, 250, 500]).map((val) => {
                    const isSelected = parseFloat(paddyAcres) === val;
                    return (
                      <Button
                        key={val}
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => setPaddyAcres(val)}
                        sx={{
                          py: 0.4,
                          px: 0.5,
                          fontSize: { xs: '0.72rem', sm: '0.78rem' },
                          fontWeight: isSelected ? 800 : 600,
                          bgcolor: isSelected ? '#1b5e20' : '#fff',
                          color: isSelected ? '#fff' : '#1b5e20',
                          borderColor: '#a5d6a7',
                          minWidth: 0,
                          borderRadius: '10px',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: isSelected ? '#144a19' : '#e8f5e9',
                            borderColor: '#2e7d32'
                          }
                        }}
                      >
                        {val} {paddyUnit === 'acre' ? (isChhattisgarhi ? 'एकड़' : 'एकड़') : (isChhattisgarhi ? 'डिस.' : 'डिस.')}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* UNIFIED DIGITAL PASSBOOK RECEIPT CARD (Integrated Bardana & Reimbursement) */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1.5px solid #a5d6a7',
                bgcolor: '#fafdf9',
                mb: 2.5,
                boxShadow: '0 3px 12px rgba(27, 94, 32, 0.05)'
              }}
            >
              {/* Receipt Header Banner */}
              <Box
                sx={{
                  bgcolor: '#1b5e20',
                  color: '#ffffff',
                  p: { xs: 1.8, sm: 2.2 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
                    {isChhattisgarhi ? 'सरकारी धान खरीदी रसीद हिसाब' : 'सरकारी उपार्जन रसीद अनुमान'}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffeb3b', lineHeight: 1.1, mt: 0.3, fontSize: { xs: '1.6rem', sm: '2rem' } }}>
                    ₹ {totalPaddyAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Chip
                  label={`₹${appConfig.paddyScheme.totalRate}/क्विंटल`}
                  sx={{ bgcolor: '#ffb300', color: '#000', fontWeight: 900, fontSize: '0.82rem', height: 28, borderRadius: '8px' }}
                />
              </Box>

              {/* Receipt Breakdown Table */}
              <Box sx={{ p: { xs: 1.8, sm: 2.2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #e8f5e9' }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                    {isChhattisgarhi ? 'जम्मा दर्ज रकबा:' : 'कुल दर्ज रकबा:'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {pAcresNum} एकड़
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #e8f5e9' }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                    {isChhattisgarhi ? `ज्यादा ले ज्यादा धान खरीदी (${appConfig.paddyScheme.maxQuintalsPerAcre} क्विं/एकड़):` : `अधिकतम खरीदी धान (${appConfig.paddyScheme.maxQuintalsPerAcre} क्विं/एकड़):`}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.92rem' }}>
                    {maxQuintals} क्विंटल
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #e8f5e9' }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                    1. समिति तौल भुगतान (MSP @ ₹{appConfig.paddyScheme.mspRate.toLocaleString('en-IN')}):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.88rem' }}>
                    ₹ {mspPart.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1.5px dashed #81c784' }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                    2. अंतर राशि / बोनस DBT (@ ₹{appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')}):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.88rem' }}>
                    ₹ {bonusPart.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                {/* Total Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '0.95rem' }}>
                    {isChhattisgarhi ? 'जम्मा बैंक खाता म भुगतान:' : 'कुल बैंक खाता भुगतान:'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.15rem' }}>
                    ₹ {totalPaddyAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>

                {/* Inline Integrated Bardana & Token Strip */}
                <Box sx={{ mt: 1.5, p: 1.4, bgcolor: '#fffbf5', borderRadius: '14px', border: '1px solid #ffe082' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                    <Inventory2Icon sx={{ color: '#e65100', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#bf360c', fontSize: '0.82rem' }}>
                      {t('bardana_card_title')}
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#ffffff', p: 1, borderRadius: '10px', border: '1px solid #ffecb3', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#795548', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                          जूट बारदाना (40kg मानक)
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#e65100', lineHeight: 1.2, my: 0.2 }}>
                          ~{paddyMath.bardanaBags} {isChhattisgarhi ? 'बोरा' : 'बोरी'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8d6e63', fontSize: '0.65rem' }}>
                          1 क्विंटल = 2.5 बारदाना
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#ffffff', p: 1, borderRadius: '10px', border: '1px solid #ffecb3', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#795548', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                          {t('bardana_reimbursement')}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#2e7d32', lineHeight: 1.2, my: 0.2 }}>
                          ₹{paddyMath.bardanaReimbursement.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#388e3c', fontSize: '0.65rem' }}>
                          ₹25/बोरा शासन वापसी
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" sx={{ color: '#5d4037', fontSize: '0.72rem', display: 'block', mt: 1 }}>
                    📱 <strong>टोकन कोटा:</strong> {isChhattisgarhi
                      ? (pAcresNum <= 10 ? 'तुंहर रकबा (≤10 एकड़) बर "टोकन तुंहर हाथ" म अधिकतम 2 टोकन कटही।' : 'तुंहर रकबा (>10 एकड़) बर "टोकन तुंहर हाथ" म अधिकतम 3 टोकन तक जारी हो सकत हे।')
                      : (pAcresNum <= 10 ? 'आपके रकबे (≤10 एकड़) हेतु "टोकन तुंहर हाथ" में अधिकतम 2 टोकन कटेंगे।' : 'आपके रकबे (>10 एकड़) हेतु "टोकन तुंहर हाथ" में अधिकतम 3 टोकन तक जारी हो सकते हैं।')}
                  </Typography>
                </Box>
              </Box>

              {/* Receipt Footer Notice */}
              <Box sx={{ bgcolor: '#f1f8e9', px: 2, py: 1, borderTop: '1px solid #dcedc8', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem', fontWeight: 700 }}>
                  {isChhattisgarhi
                    ? 'समिति म धान तौल के बाद MSP पइसा तुरंत अउ अंतर राशि सीधा बैंक खाता म जमा होथे।'
                    : 'समिति में धान तौल उपरांत MSP राशि तुरंत व अंतर राशि सीधे बैंक खाते में जमा होती है।'}
                </Typography>
              </Box>
            </Paper>

            {/* Quick Action Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={() => { stopSpeech(); setOpenTokenGuide(true); }}
              sx={{
                bgcolor: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.86rem',
                borderRadius: '14px',
                py: 1.1,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                '&:hover': { bgcolor: '#1e40af' }
              }}
            >
              {isChhattisgarhi ? '🎯 टोकन तुंहर हाथ: नियम, बोरी अऊ ऑनलाइन गाइड देखव ➔' : '🎯 टोकन तुंहर हाथ: पात्रता, बोरी व ऑनलाइन टोकन गाइड देखें ➔'}
            </Button>
          </Card>
        </Box>
      )}

      {/* TAB 2: GOVERNMENT SCHEMES & PORTALS */}
      {subTab === 2 && (
        schemesList.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              my: 2,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: '#f8fafc',
              border: '1.5px dashed #cbd5e1'
            }}
          >
            <PolicyIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
              {isChhattisgarhi ? 'कोनो सरकारी योजना के जानकारी नइये' : 'कोई सरकारी योजना डेटा उपलब्ध नहीं है'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 440, mx: 'auto', mb: 2 }}>
              {isChhattisgarhi
                ? 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत बिना जांचे कोनो योजना जानकारी नइ दिखाय जाय। नवा योजना लोड करे बर इंटरनेट कनेक्ट कर फेर लोड करव।'
                : 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत बिना सत्यापन के कोई भी योजना जानकारी नहीं दिखाई जाती। नवीनतम सरकारी योजनाएं लोड करने हेतु इंटरनेट कनेक्ट कर पुनः लोड करें।'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={loadFromMongo}
              sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: 2 }}
            >
              {isChhattisgarhi ? 'फेर लोड करव (Retry)' : 'पुनः लोड करें (Retry)'}
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {schemesList.map((scheme) => (
              <Grid item xs={12} md={6} key={scheme.id}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: 3.5,
                    border: '1.2px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    '&:hover': { boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }
                  }}
                >
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip
                            label={scheme.badge}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem', mb: 0.5 }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.98rem', lineHeight: 1.25 }}>
                            {scheme.title}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
                          onClick={() => speakText(`${scheme.title}. ${scheme.summary}`)}
                          sx={{ color: '#2e7d32', fontSize: '0.72rem', p: 0.5 }}
                        >
                          {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
                        </Button>
                      </Box>

                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.84rem', mb: 1.5, lineHeight: 1.5 }}>
                        {scheme.summary}
                      </Typography>

                      <Box sx={{ mb: 1.5, pl: 0.5 }}>
                        {scheme.keyPoints.map((pt, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 15, color: '#16a34a', mt: 0.2 }} />
                            <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.78rem', lineHeight: 1.4 }}>
                              {pt}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Divider sx={{ my: 1.2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<LaunchIcon sx={{ fontSize: 15 }} />}
                          href={scheme.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            bgcolor: '#1b7a2d',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            borderRadius: 2.5,
                            '&:hover': { bgcolor: '#125420' }
                          }}
                        >
                          {scheme.linkText}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      {/* Soil IoT Sensor Modal */}
      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        onApplyToCalculator={(data) => {
          setSoilSensorData(data);
          notify.success('स्मार्ट मिट्टी सेंसर की रीडिंग खाद कैलकुलेटर में लागू की गई!');
        }}
      />

      {/* CG Paddy Token Tuhar Hath & Bardana Guide Modal */}
      <TokenGuideModal
        open={openTokenGuide}
        onClose={() => setOpenTokenGuide(false)}
        initialAcres={pAcresNum || 1.0}
      />
    </Box>
  );
};
