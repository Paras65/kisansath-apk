import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  MenuItem,
  CircularProgress,
  Badge,
  IconButton,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CallIcon from '@mui/icons-material/Call';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SecurityIcon from '@mui/icons-material/Security';
import SyncIcon from '@mui/icons-material/Sync';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HandshakeIcon from '@mui/icons-material/Handshake';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import { speakText } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { useLanguage } from '../utils/i18n';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';
import { startVoiceRecognition, stopVoiceRecognition, normalizeSpokenQuery } from '../utils/speechRecognition';
import { MANDI_RATES } from '../data/kisanData';
import {
  getMandiRates,
  refreshLiveMandiRates,
  getOfflineMandiQueries,
  saveOfflineMandiQuery,
  removeOfflineMandiQuery,
  syncOfflineMandiQueries,
  getMarketplaceListings,
  postMarketplaceListing,
  getMspBenchmarks
} from '../services/apiService';
import { notify } from '../services/notificationService';
import { validateIndianPhone } from '../services/deviceManagerService';
import { openNativeDialer, openNativeWhatsApp } from '../utils/capacitorUtils';

export const MandiTab = ({ selectedDistrict = 'रायपुर' }) => {
  const { isChhattisgarhi } = useLanguage();

  // Navigation: 'rates' (मंडी भाव दरें) vs 'marketplace' (सीधा किसान बाज़ार)
  const [activeTab, setActiveTab] = useState('rates');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [districtFilterOnly, setDistrictFilterOnly] = useState(false);

  // Collapsible Market Insights Accordion (Replaces the 7 vertically stacked cards)
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  // Modals & MSP Spotlight
  const [openSellModal, setOpenSellModal] = useState(false);
  const [mspBenchmarksList, setMspBenchmarksList] = useState([]);
  const [highlightMspCard, setHighlightMspCard] = useState(false);

  // Voice walkthrough / Kaka action listener
  useEffect(() => {
    const handleKakaAction = (e) => {
      const action = e?.detail;
      if (!action) return;
      if (action.type === 'SHOW_MANDI') {
        setSelectedCropFilter('धान');
        setActiveTab('rates');
        setInsightsExpanded(true);
        setHighlightMspCard(true);
        setTimeout(() => {
          const el = document.getElementById('kaka-mandi-msp-card');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        setTimeout(() => setHighlightMspCard(false), 3500);
      }
    };
    window.addEventListener('kisan_kaka_action', handleKakaAction);
    return () => window.removeEventListener('kisan_kaka_action', handleKakaAction);
  }, []);

  // Initialize from cache or verified offline baseline from kisanData (Zero Empty Screen on cold start)
  const [mandiRatesList, setMandiRatesList] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_cache_mandi_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        const rates = Array.isArray(parsed) ? parsed : (parsed.rates || []);
        if (rates.length > 0) return rates;
      }
    } catch (e) {}
    return Array.isArray(MANDI_RATES) && MANDI_RATES.length > 0 ? MANDI_RATES : [];
  });

  const [isLiveSource, setIsLiveSource] = useState(false);
  const [isOfflineCached, setIsOfflineCached] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_cache_mandi_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        const rates = Array.isArray(parsed) ? parsed : (parsed.rates || []);
        return rates.length > 0;
      }
    } catch (e) {}
    return true; // Initial baseline is offline cached reference
  });

  const [mandiSource, setMandiSource] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_cache_mandi_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.source || 'Agmarknet (पिछली बार प्राप्त डेटा)';
      }
    } catch (e) {}
    return 'Agmarknet मानक संदर्भ भाव (ऑफलाइन बेसलाइन)';
  });

  const [lastSyncTime, setLastSyncTime] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_cache_mandi_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.lastFetchedAt || parsed.lastUpdated || null;
      }
    } catch (e) {}
    return null;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Offline Query Tracker (Zero-False-Data Policy)
  const [offlineQueries, setOfflineQueries] = useState([]);
  const [openOfflineQueryModal, setOpenOfflineQueryModal] = useState(false);
  const [offlineCrop, setOfflineCrop] = useState('धान');
  const [offlineMandi, setOfflineMandi] = useState('रायपुर');

  // Direct buyer listings / farmer listings from MongoDB
  const [myListings, setMyListings] = useState([]);

  const loadMandiData = async (force = false) => {
    try {
      const res = await getMandiRates({ force, district: selectedDistrict });
      if (res) {
        const list = Array.isArray(res) ? res : (res.rates || []);
        if (list.length > 0) {
          setMandiRatesList(list);
          setIsLiveSource(Boolean(res.isLive));
          setIsOfflineCached(Boolean(res.isOfflineCached));
          if (res.source) setMandiSource(res.source);
          if (res.lastUpdated) setLastSyncTime(res.lastUpdated);
        }
      }
    } catch (err) {
      setIsLiveSource(false);
    }
  };

  useEffect(() => {
    loadMandiData();

    const loadMarketplace = async () => {
      const liveListings = await getMarketplaceListings();
      if (liveListings && liveListings.length > 0) setMyListings(liveListings);
    };
    loadMarketplace();

    const loadMsp = async () => {
      try {
        const res = await getMspBenchmarks();
        if (res && res.data) setMspBenchmarksList(res.data);
      } catch (e) {
        console.warn('[MSP Benchmarks Load Error]', e);
      }
    };
    loadMsp();

    // Load saved offline queries
    setOfflineQueries(getOfflineMandiQueries());

    // When connection is restored, auto-sync live rates and offline queries
    const handleReconnected = async () => {
      notify.info('🌐 इंटरनेट पुनः सक्रिय! लाइव मंडी भाव व आपकी पूछताछ सिंक हो रही है...');
      await loadMandiData(true);
      const syncResult = await syncOfflineMandiQueries();
      if (syncResult && syncResult.syncedCount > 0) {
        notify.success(`✅ आपकी ${syncResult.syncedCount} ऑफ़लाइन पूछताछ के लाइव भाव प्राप्त हो गए!`);
        setOfflineQueries(getOfflineMandiQueries());
      }
    };

    window.addEventListener('online', handleReconnected);
    return () => {
      window.removeEventListener('online', handleReconnected);
      stopVoiceRecognition();
    };
  }, [selectedDistrict]);

  const handleRefresh = async () => {
    if (!navigator.onLine) {
      notify.warning('इंटरनेट कनेक्शन उपलब्ध नहीं है। प्रदर्शित डेटा मानक संदर्भ भाव (Agmarknet Benchmark) है।');
      return;
    }
    setIsRefreshing(true);
    try {
      const res = await refreshLiveMandiRates();
      if (res && res.rates && res.rates.length > 0) {
        setMandiRatesList(res.rates);
        setIsLiveSource(Boolean(res.isLive));
        setIsOfflineCached(false);
        setMandiSource(res.source || 'Agmarknet / छत्तीसगढ़ मंडी बोर्ड (लाइव)');
        setLastSyncTime(res.lastUpdated || new Date().toISOString());
        notify.success('Agmarknet लाइव मंडी भाव सफलतापूर्वक अपडेट हुए!');
      } else {
        await loadMandiData(true);
        notify.success('मंडी भाव नवीनतम स्थिति में रीफ्रेश हो गए!');
      }

      const syncResult = await syncOfflineMandiQueries();
      if (syncResult && syncResult.syncedCount > 0) {
        setOfflineQueries(getOfflineMandiQueries());
      }
    } catch (e) {
      notify.error('मंडी भाव रीफ्रेश करने में समस्या आई।');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveOfflineQuery = () => {
    if (!offlineCrop) {
      notify.warning('कृपया फसल चुनें');
      return;
    }
    saveOfflineMandiQuery({
      crop: offlineCrop,
      mandi: offlineMandi || 'सभी प्रमुख मंडियां',
      district: selectedDistrict
    });
    setOfflineQueries(getOfflineMandiQueries());
    notify.success(`📡 "${offlineCrop}" की पूछताछ ऑफ़लाइन सहेज ली गई है। इंटरनेट जुड़ते ही ताजा भाव स्वतः मिल जाएगा।`);
    setOpenOfflineQueryModal(false);
  };

  const handleRemoveOfflineQuery = (id) => {
    const updated = removeOfflineMandiQuery(id);
    setOfflineQueries(updated);
    notify.info('पूछताछ हटा दी गई');
  };

  // Form state for posting produce
  const [formData, setFormData] = useState({
    crop: '',
    quantity: '',
    expectedPrice: '',
    farmerName: '',
    location: '',
    phone: ''
  });

  const handleSaveListing = async () => {
    if (!formData.crop || !formData.quantity || !formData.phone) {
      notify.warning('कृपया फसल, मात्रा और 10-अंकीय मोबाइल नंबर दर्ज करें');
      return;
    }
    const phoneCheck = validateIndianPhone(formData.phone);
    if (!phoneCheck.isValid) {
      notify.warning(phoneCheck.message);
      return;
    }
    const newEntry = {
      id: `list-${Date.now()}`,
      ...formData,
      phone: phoneCheck.cleanPhone,
      date: 'आज'
    };
    await postMarketplaceListing(newEntry);
    setMyListings([newEntry, ...myListings]);
    setOpenSellModal(false);
    notify.success('आपकी फसल लिस्टिंग सफलतापूर्वक पोस्ट हो गई है! खरीदार आपसे जल्द संपर्क करेंगे।');
    setFormData({ crop: '', quantity: '', expectedPrice: '', farmerName: '', location: '', phone: '' });
  };

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

  // Filtered Mandi Rates
  const filteredRates = useMemo(() => {
    return (mandiRatesList || []).filter((item) => {
      if (!item) return false;
      const cropStr = String(item.crop || '').toLowerCase();
      const mandiStr = String(item.mandi || '').toLowerCase();
      const districtStr = String(item.district || '').toLowerCase();
      const search = searchQuery.toLowerCase().trim();
      const normalizedSearch = normalizeSpokenQuery(search);

      // Bilingual matching for standard crops
      const filterCrop = selectedCropFilter.toLowerCase();
      const matchesCrop =
        selectedCropFilter === 'all' ||
        cropStr.includes(filterCrop) ||
        (filterCrop.includes('धान') && (cropStr.includes('dhan') || cropStr.includes('paddy') || cropStr.includes('rice') || cropStr.includes('चांउर') || cropStr.includes('चावल'))) ||
        (filterCrop.includes('चना') && (cropStr.includes('chana') || cropStr.includes('gram') || cropStr.includes('बूट'))) ||
        (filterCrop.includes('सोयाबीन') && (cropStr.includes('soya') || cropStr.includes('soybean'))) ||
        (filterCrop.includes('मक्का') && (cropStr.includes('makka') || cropStr.includes('maize') || cropStr.includes('जुनहरी'))) ||
        (filterCrop.includes('तीवड़ा') && (cropStr.includes('laakh') || cropStr.includes('लाखड़ी') || cropStr.includes('खेसरी'))) ||
        (filterCrop.includes('गेहूं') && (cropStr.includes('wheat') || cropStr.includes('gehu'))) ||
        (filterCrop.includes('सरसों') && (cropStr.includes('mustard') || cropStr.includes('rai') || cropStr.includes('राई')));

      const matchesSearch =
        !search ||
        mandiStr.includes(search) ||
        cropStr.includes(search) ||
        districtStr.includes(search) ||
        (normalizedSearch && (cropStr.includes(normalizedSearch) || mandiStr.includes(normalizedSearch) || districtStr.includes(normalizedSearch)));

      const targetDistrict = selectedDistrict.toLowerCase();
      const matchesDistrictOnly =
        !districtFilterOnly ||
        districtStr.includes(targetDistrict) ||
        mandiStr.includes(targetDistrict);

      return matchesCrop && matchesSearch && matchesDistrictOnly;
    }).sort((a, b) => {
      const aDistrict = String(a?.district || '').toLowerCase();
      const bDistrict = String(b?.district || '').toLowerCase();
      const targetDistrict = selectedDistrict.toLowerCase();
      const aMatch = aDistrict.includes(targetDistrict) || String(a?.mandi || '').toLowerCase().includes(targetDistrict);
      const bMatch = bDistrict.includes(targetDistrict) || String(b?.mandi || '').toLowerCase().includes(targetDistrict);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [mandiRatesList, selectedCropFilter, searchQuery, districtFilterOnly, selectedDistrict]);

  // Inter-mandi comparison items for highest rate discovery
  const comparisonItems = useMemo(() => {
    const map = new Map();
    (filteredRates || []).forEach((r) => {
      const rateNum = Number(r.modalRate || r.maxRate || 0);
      if (rateNum > 0 && !map.has(r.mandi)) {
        map.set(r.mandi, { mandi: r.mandi, modalRate: rateNum, crop: r.crop });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.modalRate - a.modalRate)
      .slice(0, 4);
  }, [filteredRates]);

  const isWeekend = [0, 6].includes(new Date().getDay());

  const handleReadMandiRates = (item) => {
    if (!item) return;
    const perKg = (Number(item.modalRate || 0) / 100).toFixed(1);
    const perBag = Math.round(Number(item.modalRate || 0) * 0.4);
    const text = isChhattisgarhi
      ? `${item.mandi || 'मंडी'} म ${item.crop || 'फसल'} के मुख्य भाव ₹${item.modalRate || 0} प्रति क्विंटल, यानी लगभग ₹${perKg} रुपया किलो अउ ₹${perBag} रुपया प्रति 40 किलो कट्टा हे। न्यूनतम भाव ₹${item.minRate || 0} अउ अधिकतम भाव ₹${item.maxRate || 0} हे।`
      : `${item.mandi || 'मंडी'} में ${item.crop || 'फसल'} का मुख्य मॉडल भाव ₹${item.modalRate || 0} प्रति क्विंटल, यानी लगभग ₹${perKg} रुपये प्रति किलो और ₹${perBag} रुपये प्रति 40 किलो कट्टा है। न्यूनतम भाव ₹${item.minRate || 0} और अधिकतम भाव ₹${item.maxRate || 0} है।`;
    speakText(text);
  };

  // 1-Tap Crop Filter Chips
  const cropPills = [
    { label: isChhattisgarhi ? '🌾 सबो जिंस' : '🌾 सभी फसलें', value: 'all' },
    { label: isChhattisgarhi ? '🌾 धान (चांउर)' : '🌾 धान (Paddy)', value: 'धान' },
    { label: isChhattisgarhi ? '🟤 चना (बूट)' : '🟤 चना (Gram)', value: 'चना' },
    { label: isChhattisgarhi ? '🟡 सोयाबीन' : '🟡 सोयाबीन', value: 'सोयाबीन' },
    { label: isChhattisgarhi ? '🌽 मक्का (जुनहरी)' : '🌽 मक्का', value: 'मक्का' },
    { label: isChhattisgarhi ? '🌾 तीवड़ा (लाखड़ी)' : '🌾 तीवड़ा', value: 'तीवड़ा' },
    { label: isChhattisgarhi ? '🌾 गेहूं' : '🌾 गेहूं', value: 'गेहूं' },
    { label: isChhattisgarhi ? '🌻 सरसों' : '🌻 सरसों', value: 'सरसों' }
  ];

  return (
    <Box sx={{ pb: 2, pt: 0 }} className="fade-in">
      {/* 1. Slim Top Bar Capsule */}
      <Box
        sx={{
          mb: 1.5,
          p: 1.2,
          px: 1.5,
          borderRadius: '16px',
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              width: 38,
              height: 38,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(21, 101, 192, 0.25)',
              color: '#ffffff'
            }}
          >
            <StorefrontIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0d47a1', fontSize: '1rem', lineHeight: 1.15 }}>
              मंडी भाव व सीधा बाज़ार
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mt: 0.2 }}>
              <Chip
                label={
                  isLiveSource
                    ? (isChhattisgarhi ? '🟢 आज के लाइव भाव' : '🟢 Agmarknet लाइव दरें')
                    : isOfflineCached
                    ? (isChhattisgarhi ? '🟡 ऑफ़लाइन सहेजे भाव' : '🟡 ऑफ़लाइन सहेजा डेटा')
                    : (isChhattisgarhi ? '📋 मानक संदर्भ भाव' : '📋 मानक संदर्भ दरें')
                }
                size="small"
                sx={{
                  bgcolor: isLiveSource ? '#ecfdf5' : '#fef9c3',
                  color: isLiveSource ? '#065f46' : '#854d0e',
                  fontWeight: 800,
                  fontSize: '0.66rem',
                  height: 20,
                  border: isLiveSource ? '1px solid #a7f3d0' : '1px solid #fde047'
                }}
              />
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                • {selectedDistrict} APMC
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <KakaWalkthroughButton featureId="mandi" />

          <Button
            variant="outlined"
            size="small"
            startIcon={isRefreshing ? <CircularProgress size={13} color="inherit" /> : <SyncIcon sx={{ fontSize: 15 }} />}
            disabled={isRefreshing}
            onClick={handleRefresh}
            sx={{
              borderColor: '#86efac',
              color: '#166534',
              bgcolor: '#f0fdf4',
              fontSize: '0.74rem',
              fontWeight: 800,
              borderRadius: '10px',
              py: 0.5,
              px: 1.2,
              textTransform: 'none',
              '&:hover': { bgcolor: '#dcfce7', borderColor: '#4ade80' }
            }}
          >
            {isRefreshing ? 'जांच रहे...' : '🔄 रीफ्रेश'}
          </Button>

          <Badge badgeContent={offlineQueries.filter((q) => q.status === 'pending').length} color="warning">
            <IconButton
              size="small"
              onClick={() => setOpenOfflineQueryModal(true)}
              title={isChhattisgarhi ? "ऑफ़लाइन भाव पूछ-ताछ" : "ऑफ़लाइन भाव पूछताछ"}
              sx={{
                bgcolor: '#f0f9ff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                p: 0.6
              }}
            >
              <BookmarkBorderIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* 2. Segmented Pill Navigation Switch */}
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: 0.5,
          borderRadius: '14px',
          bgcolor: '#e2e8f0',
          display: 'flex',
          gap: 0.6
        }}
      >
        <Button
          fullWidth
          size="small"
          onClick={() => setActiveTab('rates')}
          sx={{
            py: 0.8,
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            bgcolor: activeTab === 'rates' ? '#ffffff' : 'transparent',
            color: activeTab === 'rates' ? '#0d47a1' : '#475569',
            boxShadow: activeTab === 'rates' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: activeTab === 'rates' ? '#ffffff' : '#f1f5f9' }
          }}
        >
          🏛️ {isChhattisgarhi ? `मंडी भाव दरें (${filteredRates.length})` : `मंडी भाव दरें (${filteredRates.length})`}
        </Button>

        <Button
          fullWidth
          size="small"
          onClick={() => setActiveTab('marketplace')}
          sx={{
            py: 0.8,
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            bgcolor: activeTab === 'marketplace' ? '#ffffff' : 'transparent',
            color: activeTab === 'marketplace' ? '#166534' : '#475569',
            boxShadow: activeTab === 'marketplace' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: activeTab === 'marketplace' ? '#ffffff' : '#f1f5f9' }
          }}
        >
          🤝 {isChhattisgarhi ? `सीधा किसान बाजार (${myListings.length})` : `सीधा किसान बाज़ार (${myListings.length})`}
        </Button>
      </Paper>

      {/* VIEW 1: MANDI RATES EXPLORER */}
      {activeTab === 'rates' && (
        <Box>
          {/* Unified Sticky Search & 1-Tap Crop Filter Bar */}
          <Paper
            elevation={0}
            sx={{
              position: 'sticky',
              top: { xs: 70, sm: 80 },
              zIndex: 4,
              p: 1.2,
              mb: 1.5,
              borderRadius: '16px',
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            {/* Search Input with Voice Mic & Clear button */}
            <TextField
              fullWidth
              size="small"
              placeholder={isChhattisgarhi ? "फसल या मंडी खोजव या बोलव (धान, चना...)" : "फसल या मंडी खोजें या बोलें (धान, चना...)"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ gap: 0.5 }}>
                    {searchQuery && (
                      <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: '#94a3b8' }}>
                        <ClearIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    )}
                    <Tooltip title={isVoiceListening ? "सुन रहे हैं... (रोकने हेतु दबाएं)" : "बोलकर खोजें (माइक दबाएं)"}>
                      <IconButton
                        size="small"
                        onClick={handleToggleVoiceSearch}
                        sx={{
                          color: isVoiceListening ? '#fff' : '#1976d2',
                          bgcolor: isVoiceListening ? '#ef4444' : '#e0f2fe',
                          transition: 'all 0.2s ease',
                          '&:hover': { bgcolor: isVoiceListening ? '#dc2626' : '#bae6fd' }
                        }}
                      >
                        <MicIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
              sx={{
                bgcolor: '#f8fafc',
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.84rem' }
              }}
            />

            {/* 1-Tap Crop Pills with horizontal scroll */}
            <Box
              sx={{
                display: 'flex',
                gap: 0.8,
                overflowX: 'auto',
                pt: 1,
                pb: 0.2,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' }
              }}
            >
              {cropPills.map((chip) => {
                const isSelected = selectedCropFilter === chip.value;
                return (
                  <Chip
                    key={chip.value}
                    label={chip.label}
                    clickable
                    size="small"
                    onClick={() => {
                      setSelectedCropFilter(chip.value);
                      if (chip.value !== 'all') setSearchQuery('');
                    }}
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.74rem',
                      borderRadius: '14px',
                      bgcolor: isSelected ? '#1565c0' : '#f1f5f9',
                      color: isSelected ? '#fff' : '#334155',
                      border: isSelected ? '1px solid #0d47a1' : '1px solid #e2e8f0',
                      flexShrink: 0,
                      '&:hover': { bgcolor: isSelected ? '#0d47a1' : '#e2e8f0' }
                    }}
                  />
                );
              })}

              <Chip
                label={districtFilterOnly ? `📍 केवल ${selectedDistrict} (सक्रिय)` : `📍 केवल ${selectedDistrict}`}
                clickable
                size="small"
                variant={districtFilterOnly ? 'filled' : 'outlined'}
                onClick={() => setDistrictFilterOnly(!districtFilterOnly)}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: '14px',
                  bgcolor: districtFilterOnly ? '#1b5e20' : '#fff',
                  color: districtFilterOnly ? '#fff' : '#1b5e20',
                  borderColor: '#81c784',
                  flexShrink: 0
                }}
              />
            </Box>
          </Paper>

          {/* Collapsible Market Insights Drawer (Consolidates 7 stacked cards into 1 clean accordion) */}
          <Paper
            elevation={0}
            sx={{
              mb: 1.5,
              borderRadius: '14px',
              bgcolor: '#f0fdf4',
              border: '1.2px solid #a7f3d0',
              overflow: 'hidden'
            }}
          >
            <Box
              onClick={() => setInsightsExpanded(!insightsExpanded)}
              sx={{
                p: 1.1,
                px: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Typography sx={{ fontSize: '1rem' }}>📊</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.82rem' }}>
                  {isChhattisgarhi
                    ? 'सरकारी नीतियां, CACP समर्थन मूल्य अउ मंडी तुलना'
                    : 'सरकारी नीतियां, CACP समर्थन मूल्य व अंतर-मंडी तुलना'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, fontSize: '0.7rem' }}>
                  {insightsExpanded ? (isChhattisgarhi ? 'छिपावव' : 'छिपाएं') : (isChhattisgarhi ? 'देखव' : 'देखें')}
                </Typography>
                {insightsExpanded ? <ExpandLessIcon sx={{ color: '#166534', fontSize: 18 }} /> : <ExpandMoreIcon sx={{ color: '#166534', fontSize: 18 }} />}
              </Box>
            </Box>

            <Collapse in={insightsExpanded}>
              <Box sx={{ p: 1.5, pt: 0.5, borderTop: '1px dashed #a7f3d0', display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Government MSP Highlight Banner */}
                <Paper
                  id="kaka-mandi-msp-card"
                  className={highlightMspCard ? 'kaka-spotlight-pulse' : ''}
                  elevation={0}
                  sx={{
                    p: 1.2,
                    borderRadius: '10px',
                    bgcolor: '#ffffff',
                    border: '1.2px solid #86efac',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.84rem' }}>
                      🏛️ {appConfig.stateName} सरकारी धान खरीदी दर: <strong>₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} / क्विंटल</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem', display: 'block' }}>
                      (MSP ₹{appConfig.paddyScheme.mspRate.toLocaleString('en-IN')} + कृषक उन्नति बोनस ₹{appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')}) • अधिकतम {appConfig.paddyScheme.maxQuintalsPerAcre} क्विं./एकड़
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VolumeUpIcon sx={{ fontSize: 13 }} />}
                    onClick={() => speakText(`छत्तीसगढ़ में धान की कुल सरकारी खरीदी दर ₹${appConfig.paddyScheme.totalRate} प्रति क्विंटल है। जिसमें ₹${appConfig.paddyScheme.mspRate} समर्थन मूल्य और ₹${appConfig.paddyScheme.bonusRate} कृषक उन्नति बोनस है।`)}
                    sx={{ fontSize: '0.68rem', py: 0.2, px: 0.8, color: '#1b5e20', borderColor: '#81c784', whiteSpace: 'nowrap' }}
                  >
                    {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
                  </Button>
                </Paper>

                {/* Central CACP MSP Benchmarks Chips */}
                {mspBenchmarksList && mspBenchmarksList.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                      केन्द्रीय न्यूनतम समर्थन मूल्य (CACP MSP 2024-25):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                      {mspBenchmarksList.map((item) => (
                        <Chip
                          key={item.cropId}
                          label={`${item.cropName.split('(')[0].trim()}: ₹${item.effectiveFarmerPrice.toLocaleString('en-IN')}/क्विं.`}
                          size="small"
                          sx={{
                            bgcolor: item.cropId === 'paddy' ? '#ecfdf5' : '#ffffff',
                            border: `1px solid ${item.cropId === 'paddy' ? '#6ee7b7' : '#cbd5e1'}`,
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 22,
                            color: item.cropId === 'paddy' ? '#065f46' : '#1e293b'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Inter-Mandi Price Comparison Strip */}
                {comparisonItems.length > 1 && (
                  <Box sx={{ pt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                      📈 अंतर-मंडी मूल्य तुलना (कहां मिल रहा सबसे अधिक भाव):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
                      {comparisonItems.map((comp, cIdx) => (
                        <Chip
                          key={cIdx}
                          label={`${comp.mandi}: ₹${comp.modalRate}/क्विं. (₹${(comp.modalRate / 100).toFixed(1)}/किग्रा)`}
                          size="small"
                          sx={{
                            bgcolor: cIdx === 0 ? '#dcfce7' : '#ffffff',
                            color: cIdx === 0 ? '#15803d' : '#334155',
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 22,
                            border: cIdx === 0 ? '1.5px solid #22c55e' : '1px solid #cbd5e1'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Mandi Weekend Notice */}
                {isWeekend && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: '8px',
                      bgcolor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8
                    }}
                  >
                    <InfoOutlinedIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ color: '#1e40af', fontSize: '0.7rem' }}>
                      सप्ताहांत/अवकाश में नीलामी बंद रहती है। स्क्रीन पर अंतिम कार्यदिवस के सत्यापित आधिकारिक भाव प्रदर्शित हैं।
                    </Typography>
                  </Paper>
                )}

                {/* GODL India Attribution & Provenance */}
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', lineHeight: 1.3, display: 'block', pt: 0.3 }}>
                  स्रोतः data.gov.in (Agmarknet) • DMI, कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार • GODL-India अनुपालित • शून्य फर्जी डेटा नीति।
                </Typography>
              </Box>
            </Collapse>
          </Paper>

          {/* Saved Offline Queries Strip */}
          {offlineQueries.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                mb: 1.5,
                borderRadius: '12px',
                bgcolor: '#f0fdf4',
                border: '1.2px solid #86efac'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <BookmarkBorderIcon sx={{ color: '#16a34a', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.8rem' }}>
                    {isChhattisgarhi ? `सहेजे ऑफ़लाइन पूछ-ताछ (${offlineQueries.length})` : `आपकी सहेजी गई ऑफ़लाइन पूछताछ (${offlineQueries.length})`}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => setOpenOfflineQueryModal(true)}
                  sx={{ fontSize: '0.7rem', py: 0.1, px: 0.8, color: '#166534', fontWeight: 700 }}
                >
                  + नई पूछताछ
                </Button>
              </Box>

              <Grid container spacing={0.8}>
                {offlineQueries.map((query) => (
                  <Grid item xs={12} sm={6} key={query.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        borderRadius: '8px',
                        bgcolor: '#ffffff',
                        border: query.status === 'resolved' ? '1.5px solid #22c55e' : '1px solid #cbd5e1',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>
                            {query.crop}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                            ({query.mandi})
                          </Typography>
                          <Chip
                            label={query.status === 'resolved' ? 'सत्यापित' : 'लंबित सिंक'}
                            size="small"
                            color={query.status === 'resolved' ? 'success' : 'default'}
                            sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800 }}
                          />
                        </Box>
                        {query.status === 'resolved' && query.resolvedRate ? (
                          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 800, display: 'block', mt: 0.2 }}>
                            ताजा मॉडल भाव: ₹{query.resolvedRate.modalRate}/क्विंटल
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.2, fontSize: '0.68rem' }}>
                            इंटरनेट जुड़ते ही ताजा भाव स्वतः अपडेट होगा
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        {query.status === 'resolved' && query.resolvedRate && (
                          <IconButton
                            size="small"
                            onClick={() => speakText(`${query.crop} का ताजा भाव ₹${query.resolvedRate.modalRate} प्रति क्विंटल है।`)}
                            sx={{ color: '#15803d', p: 0.4 }}
                          >
                            <VolumeUpIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleRemoveOfflineQuery(query.id)} sx={{ color: '#94a3b8', p: 0.4 }}>
                          <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Mandi Rate Cards Grid */}
          {filteredRates.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                textAlign: 'center',
                borderRadius: '16px',
                bgcolor: '#f8fafc',
                border: '1.5px dashed #cbd5e1'
              }}
            >
              <StorefrontIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                {isChhattisgarhi ? 'चुने गे फिल्टर बर कोनो मंडी नइ मिलिस' : 'चयनित फ़िल्टर के अनुसार कोई मंडी नहीं मिली'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.78rem', maxWidth: 420, mx: 'auto', mb: 2 }}>
                {isChhattisgarhi
                  ? 'कृपा करके जिंस या मंडी के नाव बदल के फेर खोजव या फिल्टर हटावव।'
                  : 'कृपया जिंस या मंडी का नाम बदलकर पुनः खोजें या फ़िल्टर साफ़ करें।'}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => { setSelectedCropFilter('all'); setSearchQuery(''); setDistrictFilterOnly(false); }}
                sx={{ borderRadius: '10px', fontWeight: 800, textTransform: 'none' }}
              >
                सभी फ़िल्टर हटाएं
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {filteredRates.map((rate, idx) => {
                const isPositive = rate.trend?.startsWith('+');
                const isNegative = rate.trend?.startsWith('-');
                const modalNum = Number(rate.modalRate || 0);
                const perKg = (modalNum / 100).toFixed(1);
                const perBag = Math.round(modalNum * 0.4);

                return (
                  <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
                    <Card
                      className="touch-card"
                      sx={{
                        width: '100%',
                        borderRadius: '16px',
                        border: '1px solid #bae6fd',
                        bgcolor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          boxShadow: '0 6px 18px rgba(25, 118, 210, 0.1)',
                          borderColor: '#60a5fa'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.8, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <Box>
                          {/* Card Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                                <Chip
                                  icon={<LocationOnIcon sx={{ fontSize: '13px !important', color: '#0369a1' }} />}
                                  label={rate.mandi}
                                  size="small"
                                  sx={{
                                    bgcolor: '#e0f2fe',
                                    color: '#0369a1',
                                    fontWeight: 800,
                                    fontSize: '0.68rem',
                                    height: 22,
                                    borderRadius: '6px'
                                  }}
                                />
                                <Chip
                                  label={rate.date || (isLiveSource ? '🟢 आज' : '📋 संदर्भ दर')}
                                  size="small"
                                  sx={{
                                    bgcolor: rate.date?.includes('आज') || isLiveSource ? '#ecfdf5' : '#f1f5f9',
                                    color: rate.date?.includes('आज') || isLiveSource ? '#065f46' : '#475569',
                                    height: 20,
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    borderRadius: '6px'
                                  }}
                                />
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.02rem', lineHeight: 1.2 }}>
                                {rate.crop}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                                किस्म: {rate.variety || 'सामान्य'}
                              </Typography>
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() => handleReadMandiRates(rate)}
                              title={isChhattisgarhi ? "भाव सुनव" : "भाव सुनें"}
                              sx={{
                                color: '#166534',
                                bgcolor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '8px',
                                p: 0.6
                              }}
                            >
                              <VolumeUpIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>

                          {/* Hero Modal Rate Box with Per-Kg and 40kg Bag Breakdowns */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.2,
                              mb: 1.2,
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                              border: '1.5px solid #86efac',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 900, display: 'block', fontSize: '0.68rem', letterSpacing: 0.3 }}>
                                ⭐ मुख्य मॉडल भाव
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#14532d', fontSize: '1.35rem', lineHeight: 1 }}>
                                  ₹{rate.modalRate}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 800, fontSize: '0.72rem' }}>
                                  /क्विंटल
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.3 }}>
                              <Chip
                                label={`₹${perKg} / किलो`}
                                size="small"
                                sx={{
                                  bgcolor: '#ffffff',
                                  color: '#166534',
                                  fontWeight: 900,
                                  fontSize: '0.72rem',
                                  height: 22,
                                  border: '1px solid #86efac'
                                }}
                              />
                              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 800, fontSize: '0.68rem' }}>
                                ₹{perBag.toLocaleString('en-IN')} / 40kg कट्टा
                              </Typography>
                            </Box>
                          </Paper>

                          {/* Min - Max Spread Track Strip */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 0.8,
                              px: 1.2,
                              mb: 1,
                              borderRadius: '10px',
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.64rem', display: 'block' }}>
                                कमती (न्यूनतम)
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.84rem' }}>
                                ₹{rate.minRate}
                              </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                              {isPositive ? (
                                <Chip
                                  icon={<TrendingUpIcon sx={{ fontSize: '12px !important', color: '#1b5e20' }} />}
                                  label={`${rate.trend} तेजी`}
                                  size="small"
                                  sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 800, fontSize: '0.66rem', height: 20, border: '1px solid #a7f3d0' }}
                                />
                              ) : isNegative ? (
                                <Chip
                                  icon={<TrendingDownIcon sx={{ fontSize: '12px !important', color: '#c62828' }} />}
                                  label={`${rate.trend} मंदी`}
                                  size="small"
                                  sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 800, fontSize: '0.66rem', height: 20, border: '1px solid #fca5a5' }}
                                />
                              ) : (
                                <Chip
                                  label="समान (स्थिर)"
                                  size="small"
                                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.66rem', height: 20 }}
                                />
                              )}
                            </Box>

                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.64rem', display: 'block' }}>
                                ज्यादा (अधिकतम)
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.84rem' }}>
                                ₹{rate.maxRate}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>

                        {/* Card Footer: Arrival and Govt comparison note */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5, borderTop: '1px solid #f1f5f9' }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                            📦 आवक: <strong>{rate.arrival || 'उपलब्ध'}</strong>
                          </Typography>
                          {rate.crop?.includes('धान') && (
                            <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.68rem', fontWeight: 800 }}>
                              🏛️ सरकारी खरीदी: ₹{appConfig.paddyScheme.totalRate}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* VIEW 2: DIRECT FARMER MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <Box>
          {/* Marketplace Hero CTA */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
              boxShadow: '0 4px 14px rgba(27, 94, 32, 0.2)'
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.2 }}>
                🤝 {isChhattisgarhi ? 'खेत ले सीधा फसल बिक्री (किसान बाज़ार)' : 'खेत से सीधी फसल बिक्री (Direct Marketplace)'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.74rem', display: 'block', mt: 0.2 }}>
                बिचौलिया-मुक्त बिक्री • खरीदार सीधे किसान से फोन या व्हाट्सएप पर संपर्क करेंगे
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenSellModal(true)}
              sx={{
                bgcolor: '#ffffff',
                color: '#1b5e20',
                fontWeight: 900,
                fontSize: '0.78rem',
                borderRadius: '10px',
                py: 0.8,
                px: 1.6,
                textTransform: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                '&:hover': { bgcolor: '#f0fdf4' }
              }}
            >
              + फसल बिक्री जोड़ें
            </Button>
          </Paper>

          {/* Listings Grid */}
          {myListings.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                textAlign: 'center',
                bgcolor: '#f8fafc',
                borderRadius: '16px',
                border: '1.5px dashed #cbd5e1'
              }}
            >
              <HandshakeIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
                {isChhattisgarhi ? 'अभी कोनो फसल बिक्री लिस्टिंग नइये' : 'वर्तमान में कोई फसल बिक्री लिस्टिंग दर्ज नहीं है'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, maxWidth: 400, mx: 'auto' }}>
                {isChhattisgarhi
                  ? 'अपन उपज सीधा व्यापारी अउ खरीदार मन ल बेचे बर अपन फसल जोड़व।'
                  : 'अपनी उपज सीधे व्यापारियों और खरीदारों को बेचने के लिए अपनी फसल जोड़ें।'}
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenSellModal(true)}
                sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: '10px', textTransform: 'none' }}
              >
                अपनी फसल जोड़ें
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {myListings.map((listing) => (
                <Grid item xs={12} sm={6} md={4} key={listing.id} sx={{ display: 'flex' }}>
                  <Paper
                    elevation={0}
                    className="touch-card"
                    sx={{
                      p: 1.8,
                      borderRadius: '16px',
                      border: '1.5px solid #c8e6c9',
                      bgcolor: '#ffffff',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(46, 125, 50, 0.05)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        boxShadow: '0 6px 18px rgba(46, 125, 50, 0.1)',
                        borderColor: '#81c784'
                      }
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                        <Box>
                          <Chip
                            label="🌾 विक्रेता (किसान)"
                            size="small"
                            sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 800, fontSize: '0.66rem', mb: 0.5, borderRadius: '6px' }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.98rem', lineHeight: 1.25 }}>
                            {listing.crop} — {listing.quantity}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                            किसान: <strong>{listing.farmerName}</strong> • {listing.location}
                          </Typography>
                        </Box>

                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.08rem' }}>
                          {listing.expectedPrice}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ pt: 1.2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                        {listing.date}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.8 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<WhatsAppIcon sx={{ color: '#25D366', fontSize: 16 }} />}
                          onClick={() => {
                            const msg = `नमस्ते ${listing.farmerName} भाई, मैंने किसान साथी ऐप पर आपकी फसल (${listing.crop} - ${listing.quantity}) का विज्ञापन देखा। क्या यह उपलब्ध है?`;
                            openNativeWhatsApp(listing.phone, msg);
                          }}
                          sx={{
                            borderColor: '#25D366',
                            color: '#128C7E',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            py: 0.4,
                            px: 1,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#e8f5e9', borderColor: '#128C7E' }
                          }}
                        >
                          व्हाट्सएप
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CallIcon sx={{ fontSize: 15 }} />}
                          onClick={() => { openNativeDialer(listing.phone); }}
                          sx={{
                            bgcolor: '#1b5e20',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            py: 0.4,
                            px: 1.2,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#125420' }
                          }}
                        >
                          कॉल
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Modal 1: Post Produce Listing */}
      <Dialog open={openSellModal} onClose={() => setOpenSellModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1565c0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>🌾 {isChhattisgarhi ? 'अपन फसल बेचे बर जोड़व' : 'अपनी फसल बिक्री हेतु जोड़ें'}</span>
          <IconButton size="small" onClick={() => setOpenSellModal(false)} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? "फसल के नाव अउ किस्म (जैसे: धान, गेहूं, चना)" : "फसल का नाम व किस्म (जैसे: सुगंधित धान, गेहूं, चना)"}
            value={formData.crop}
            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? "कतका हे (जैसे: 25 क्विंटल, 50 बोरी)" : "मात्रा (जैसे: 25 क्विंटल, 50 बोरी)"}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? "अपेक्षित भाव (₹ प्रति क्विंटल)" : "अपेक्षित भाव (₹ प्रति क्विंटल)"}
            value={formData.expectedPrice}
            onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? "तुंहर नाव" : "आपका नाम"}
            value={formData.farmerName}
            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? "गांव / तहसील / जिला" : "गांव / तहसील / जिला"}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? "मोबाइल नंबर (खरीदार संपर्क बर)" : "मोबाइल नंबर (खरीदार संपर्क हेतु)"}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSellModal(false)} sx={{ color: '#666', textTransform: 'none' }}>
            {isChhattisgarhi ? 'रद्द करव' : 'रद्द करें'}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveListing}
            sx={{ bgcolor: '#1565c0', fontWeight: 800, borderRadius: '8px', textTransform: 'none' }}
          >
            {isChhattisgarhi ? 'लिस्टिंग जोड़व' : 'लिस्टिंग पोस्ट करें'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 2: Offline Mandi Inquiry */}
      <Dialog open={openOfflineQueryModal} onClose={() => setOpenOfflineQueryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#0369a1', fontSize: '1.02rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <BookmarkBorderIcon sx={{ color: '#0284c7' }} />
            <span>📡 {isChhattisgarhi ? 'ऑफ़लाइन भाव पूछ-ताछ सहेजव' : 'ऑफ़लाइन भाव पूछताछ सहेजें'}</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenOfflineQueryModal(false)} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, pt: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.4 }}>
            {isChhattisgarhi
              ? 'इंटरनेट नइ रहे म भी जउन फसल अउ मंडी के भाव जानना चाहत हव, वोला इहां सहेजव। फोन इंटरनेट ले जुड़ते ही लाइव भाव स्वतः मिल जाही।'
              : 'इंटरनेट न होने पर भी आप जिस फसल व मंडी का ताजा भाव जानना चाहते हैं, उसे यहाँ सहेजें। फ़ोन इंटरनेट से जुड़ते ही सत्यापित लाइव भाव स्वतः प्राप्त होगा।'}
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label={isChhattisgarhi ? "फसल चुनव" : "फसल चुनें"}
            value={offlineCrop}
            onChange={(e) => setOfflineCrop(e.target.value)}
          >
            <MenuItem value="धान">🌾 धान (सरना / मोटा / सुगंधित)</MenuItem>
            <MenuItem value="चना">🟤 चना (देसी चना)</MenuItem>
            <MenuItem value="सोयाबीन">🟡 सोयाबीन (पीला)</MenuItem>
            <MenuItem value="मक्का">🌽 मक्का (हाइब्रिड)</MenuItem>
            <MenuItem value="कोदो - कुटकी">🌾 कोदो - कुटकी (मिलेट्स)</MenuItem>
            <MenuItem value="गेहूं">🌾 गेहूं (शरबती / लोकवान)</MenuItem>
            <MenuItem value="सरसों">🌻 सरसों / राई</MenuItem>
            <MenuItem value="टमाटर">🍅 टमाटर</MenuItem>
            <MenuItem value="प्याज">🧅 प्याज</MenuItem>
            <MenuItem value="आलू">🥔 आलू</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label={isChhattisgarhi ? "मंडी समिति चुनव" : "मंडी समिति चुनें"}
            value={offlineMandi}
            onChange={(e) => setOfflineMandi(e.target.value)}
          >
            <MenuItem value="रायपुर">रायपुर (Raipur)</MenuItem>
            <MenuItem value="बिलासपुर">बिलासपुर (Bilaspur)</MenuItem>
            <MenuItem value="दुर्ग">दुर्ग (Durg)</MenuItem>
            <MenuItem value="राजनांदगांव">राजनांदगांव (Rajnandgaon)</MenuItem>
            <MenuItem value="धमतरी">धमतरी (Dhamtari)</MenuItem>
            <MenuItem value="कवर्धा">कवर्धा (Kawardha)</MenuItem>
            <MenuItem value="भाटापारा">भाटापारा (Bhatapara)</MenuItem>
            <MenuItem value="जगदलपुर">जगदलपुर (Jagdalpur)</MenuItem>
            <MenuItem value="बेमेतरा">बेमेतरा (Bemetara)</MenuItem>
            <MenuItem value="महासमुंद">महासमुंद (Mahasamund)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenOfflineQueryModal(false)} sx={{ color: '#666', textTransform: 'none' }}>
            {isChhattisgarhi ? 'रद्द करव' : 'रद्द करें'}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOfflineQuery}
            sx={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              fontWeight: 800,
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            {isChhattisgarhi ? 'पूछ-ताछ सहेजव' : 'पूछताछ सहेजें'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
