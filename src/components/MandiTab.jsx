import React, { useState, useEffect } from 'react';
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
  IconButton
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
import { speakText } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import {
  getMandiRates,
  refreshLiveMandiRates,
  getOfflineMandiQueries,
  saveOfflineMandiQuery,
  removeOfflineMandiQuery,
  syncOfflineMandiQueries,
  getMarketplaceListings,
  postMarketplaceListing
} from '../services/apiService';
import { notify } from '../services/notificationService';
import { validateIndianPhone } from '../services/deviceManagerService';
import { openNativeDialer, openNativeWhatsApp } from '../utils/capacitorUtils';

export const MandiTab = ({ selectedDistrict = 'रायपुर' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [districtFilterOnly, setDistrictFilterOnly] = useState(false);
  const [openSellModal, setOpenSellModal] = useState(false);

  // Initialize strictly from previously fetched cache or empty (Zero Static Fallback)
  const [mandiRatesList, setMandiRatesList] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_cache_mandi_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        const rates = Array.isArray(parsed) ? parsed : (parsed.rates || []);
        if (rates.length > 0) return rates;
      }
    } catch (e) {}
    return [];
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
    return false;
  });
  const [mandiSource, setMandiSource] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_cache_mandi_payload');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.source || 'Agmarknet (पिछली बार प्राप्त डेटा)';
      }
    } catch (e) {}
    return 'कोई मंडी डेटा उपलब्ध नहीं';
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
        setMandiRatesList(list);
        setIsLiveSource(Boolean(res.isLive));
        setIsOfflineCached(Boolean(res.isOfflineCached));
        if (res.source) setMandiSource(res.source);
        if (res.lastUpdated) setLastSyncTime(res.lastUpdated);
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
    return () => window.removeEventListener('online', handleReconnected);
  }, [selectedDistrict]);

  const handleRefresh = async () => {
    if (!navigator.onLine) {
      notify.warning('इंटरनेट कनेक्शन उपलब्ध नहीं है। प्रदर्शित डेटा मानक संदर्भ भाव (Agmarknet Benchmark) है।');
      return;
    }
    setIsRefreshing(true);
    try {
      const res = await refreshLiveMandiRates();
      if (res && res.rates) {
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

      // Sync any pending offline queries
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

  // New listing form state
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
    // Post to MongoDB
    await postMarketplaceListing(newEntry);
    const updated = [newEntry, ...myListings];
    setMyListings(updated);
    setOpenSellModal(false);
    notify.success('आपकी फसल लिस्टिंग सफलतापूर्वक पोस्ट हो गई है! खरीदार आपसे जल्द संपर्क करेंगे।');
    setFormData({ crop: '', quantity: '', expectedPrice: '', farmerName: '', location: '', phone: '' });
  };

  const filteredRates = (mandiRatesList || []).filter((item) => {
    if (!item) return false;
    const cropStr = String(item.crop || '').toLowerCase();
    const mandiStr = String(item.mandi || '').toLowerCase();
    const districtStr = String(item.district || '').toLowerCase();
    const search = searchQuery.toLowerCase().trim();

    // Bilingual matching for standard crops (e.g. धान matches Paddy, चना matches Gram)
    const filterCrop = selectedCropFilter.toLowerCase();
    const matchesCrop =
      selectedCropFilter === 'all' ||
      cropStr.includes(filterCrop) ||
      (filterCrop.includes('धान') && (cropStr.includes('dhan') || cropStr.includes('paddy') || cropStr.includes('rice'))) ||
      (filterCrop.includes('चना') && (cropStr.includes('chana') || cropStr.includes('gram'))) ||
      (filterCrop.includes('सोयाबीन') && (cropStr.includes('soya') || cropStr.includes('soybean'))) ||
      (filterCrop.includes('मक्का') && (cropStr.includes('makka') || cropStr.includes('maize'))) ||
      (filterCrop.includes('गेहूं') && (cropStr.includes('wheat') || cropStr.includes('gehu')));

    const matchesSearch =
      !search ||
      mandiStr.includes(search) ||
      cropStr.includes(search) ||
      districtStr.includes(search);

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

  const handleReadMandiRates = (item) => {
    if (!item) return;
    const text = `${item.mandi || 'मंडी'} में ${item.crop || 'फसल'} का मॉडल भाव ₹${item.modalRate || 0} प्रति क्विंटल है। न्यूनतम भाव ₹${item.minRate || 0} और अधिकतम भाव ₹${item.maxRate || 0} है।`;
    speakText(text);
  };

  const avgModalRate = filteredRates.length > 0
    ? Math.round(filteredRates.reduce((acc, curr) => acc + (Number(curr?.modalRate) || 0), 0) / filteredRates.length)
    : 0;

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* Title & Post button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
              p: 1.2,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(21, 101, 192, 0.25)'
            }}
          >
            <StorefrontIcon sx={{ color: '#ffffff', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0d47a1', fontSize: '1.15rem', lineHeight: 1.2 }}>
              लाइव मंडी भाव व सीधा बाज़ार
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              ताजा मंडी दरें • भाव ट्रेंड विश्लेषण • खेत से सीधा खरीदार संपर्क
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={isRefreshing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon sx={{ fontSize: 16 }} />}
            disabled={isRefreshing}
            onClick={handleRefresh}
            sx={{
              borderColor: '#1976d2',
              color: '#1565c0',
              fontSize: '0.76rem',
              fontWeight: 800,
              borderRadius: '12px',
              py: 0.7,
              px: 1.4,
              bgcolor: '#fff',
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
              '&:hover': { bgcolor: '#f0f9ff', borderColor: '#0d47a1' }
            }}
          >
            {isRefreshing ? 'भाव जांच रहे...' : '🔄 ताजा भाव'}
          </Button>

          <Badge badgeContent={offlineQueries.filter((q) => q.status === 'pending').length} color="warning">
            <Button
              variant="outlined"
              size="small"
              startIcon={<BookmarkBorderIcon sx={{ fontSize: 16 }} />}
              onClick={() => setOpenOfflineQueryModal(true)}
              sx={{
                borderColor: '#0284c7',
                color: '#0369a1',
                fontSize: '0.76rem',
                fontWeight: 800,
                borderRadius: '12px',
                py: 0.7,
                px: 1.4,
                bgcolor: '#fff',
                textTransform: 'none',
                '&:hover': { bgcolor: '#e0f2fe' }
              }}
            >
              📡 ऑफ़लाइन पूछताछ
            </Button>
          </Badge>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpenSellModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              fontSize: '0.78rem',
              fontWeight: 800,
              borderRadius: '12px',
              py: 0.8,
              px: 1.8,
              boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
              whiteSpace: 'nowrap',
              '&:hover': { background: 'linear-gradient(135deg, #0d47a1 0%, #082d62 100%)' }
            }}
          >
            फसल बेचें ➔
          </Button>
        </Box>
      </Box>

      {/* Modern Live Quick Statistics Strip */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: '12px',
              bgcolor: '#f0f9ff',
              border: '1px solid #bae6fd',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: '#0369a1', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>
              सक्रिय मंडियां
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0284c7' }}>
              {filteredRates.length} मंडियां
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: '12px',
              bgcolor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: '#047857', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>
              औसत मॉडल भाव
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#059669' }}>
              {avgModalRate ? `₹${avgModalRate.toLocaleString('en-IN')}` : '₹--'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: '12px',
              bgcolor: '#fefce8',
              border: '1px solid #fde047',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: '#a16207', fontSize: '0.68rem', fontWeight: 700, display: 'block' }}>
              सरकारी उपार्जन
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#b45309' }}>
              ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्वि.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Government MSP Highlight Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2.5,
          bgcolor: '#e8f5e9',
          border: '1.2px solid #a5d6a7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.85rem' }}>
            🏛️ छत्तीसगढ़ सरकारी उपार्जन दर: धान ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्विंटल
          </Typography>
          <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.74rem', display: 'block' }}>
            (MSP ₹{appConfig.paddyScheme.mspRate.toLocaleString('en-IN')} + कृषक उन्नति बोनस ₹{appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')}) • अधिकतम {appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल/एकड़
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<VolumeUpIcon sx={{ fontSize: 14 }} />}
          onClick={() => speakText(`छत्तीसगढ़ में धान की कुल सरकारी खरीदी दर ₹${appConfig.paddyScheme.totalRate} प्रति क्विंटल है। जिसमें ₹${appConfig.paddyScheme.mspRate} समर्थन मूल्य और ₹${appConfig.paddyScheme.bonusRate} बोनस है।`)}
          sx={{ fontSize: '0.7rem', py: 0.3, px: 1, color: '#1b5e20', borderColor: '#81c784', whiteSpace: 'nowrap' }}
        >
          सुनें
        </Button>
      </Paper>

      {/* Zero-False-Data Policy Provenance Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 1.4,
          mb: 2,
          borderRadius: 2.5,
          bgcolor: isLiveSource ? '#f0fdf4' : isOfflineCached ? '#fefce8' : '#f8fafc',
          border: isLiveSource ? '1.2px solid #86efac' : isOfflineCached ? '1.2px solid #fde047' : '1.2px solid #cbd5e1',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.2
        }}
      >
        <SecurityIcon sx={{ color: isLiveSource ? '#16a34a' : isOfflineCached ? '#ca8a04' : '#1565c0', fontSize: 22, mt: 0.2 }} />
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 0.3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.84rem' }}>
              🛡️ शून्य गलत डेटा नीति (Data Provenance & Transparency)
            </Typography>
            <Chip
              label={
                isLiveSource
                  ? '🟢 आज के लाइव सत्यापित भाव (Agmarknet Live)'
                  : isOfflineCached
                  ? '🟡 ऑफ़लाइन सहेजा गया डेटा (Offline Cache)'
                  : '📋 मानक संदर्भ भाव (Agmarknet Benchmark)'
              }
              size="small"
              sx={{
                bgcolor: isLiveSource ? '#e8f5e9' : isOfflineCached ? '#fef9c3' : '#e0f2fe',
                color: isLiveSource ? '#1b5e20' : isOfflineCached ? '#854d0e' : '#0369a1',
                fontWeight: 800,
                fontSize: '0.68rem',
                height: 22
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', lineHeight: 1.35, display: 'block' }}>
            {isLiveSource
              ? `स्रोतः ${mandiSource} • अंतिम अपडेट: ${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : 'आज'}। सभी दरें APMC मंडी से सत्यापित हैं।`
              : isOfflineCached
              ? `यह डेटा आपके फ़ोन में पहले से सहेजा हुआ है (सिंक: ${lastSyncTime ? new Date(lastSyncTime).toLocaleDateString('hi-IN') : 'पूर्व सिंक'})। लाइव दरें देखने हेतु 'ताजा भाव' बटन दबाएं।`
              : 'प्रदर्शित मंडी दरें Agmarknet एवं छत्तीसगढ़ राज्य कृषि विपणन बोर्ड के नवीनतम दर्ज आंकड़ों पर आधारित हैं। इंटरनेट कनेक्ट होने पर ऊपर दिए गए रीफ्रेश बटन से लाइव अपडेट प्राप्त करें।'}
          </Typography>
        </Box>
      </Paper>

      {/* Saved Offline Queries Strip (When farmer has offline inquiries) */}
      {offlineQueries.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 2.5,
            bgcolor: '#f0fdf4',
            border: '1.2px solid #86efac',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BookmarkBorderIcon sx={{ color: '#16a34a', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.85rem' }}>
                📡 आपकी सहेजी गई ऑफ़लाइन पूछताछ ({offlineQueries.length})
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setOpenOfflineQueryModal(true)}
              sx={{ fontSize: '0.72rem', py: 0.2, px: 1, color: '#166534', fontWeight: 700 }}
            >
              + नई पूछताछ
            </Button>
          </Box>
          <Grid container spacing={1}>
            {offlineQueries.map((query) => (
              <Grid item xs={12} sm={6} key={query.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.2,
                    borderRadius: '10px',
                    bgcolor: '#ffffff',
                    border: query.status === 'resolved' ? '1.5px solid #22c55e' : '1px solid #cbd5e1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
                        {query.crop}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                        ({query.mandi})
                      </Typography>
                      <Chip
                        label={query.status === 'resolved' ? 'सत्यापित' : 'लंबित सिंक'}
                        size="small"
                        color={query.status === 'resolved' ? 'success' : 'default'}
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }}
                      />
                    </Box>
                    {query.status === 'resolved' && query.resolvedRate ? (
                      <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 800, display: 'block', mt: 0.3 }}>
                        ताजा मॉडल भाव: ₹{query.resolvedRate.modalRate}/क्विंटल • आवक: {query.resolvedRate.arrival}
                      </Typography>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.3 }}>
                        ⏳ इंटरनेट कनेक्ट होते ही ताजा भाव स्वतः अपडेट होगा
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {query.status === 'resolved' && query.resolvedRate && (
                      <IconButton
                        size="small"
                        onClick={() => speakText(`${query.crop} का ताजा भाव ₹${query.resolvedRate.modalRate} प्रति क्विंटल है।`)}
                        sx={{ color: '#15803d' }}
                      >
                        <VolumeUpIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleRemoveOfflineQuery(query.id)} sx={{ color: '#94a3b8' }}>
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Zero Horizontal Scroll Commodity Dropdown & District Filter */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="🌾 फसल / जिंस चुनें (Commodity Filter)"
            value={selectedCropFilter}
            onChange={(e) => setSelectedCropFilter(e.target.value)}
            sx={{
              bgcolor: '#fff',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          >
            <MenuItem value="all">🌾 सभी जिंसें (All Commodities)</MenuItem>
            <MenuItem value="धान">🌾 धान (Paddy - ₹3,100 उपार्जन)</MenuItem>
            <MenuItem value="चना">🟤 चना (Gram / Chickpea)</MenuItem>
            <MenuItem value="सोयाबीन">🟡 सोयाबीन (Soybean)</MenuItem>
            <MenuItem value="मक्का">🌽 मक्का (Maize)</MenuItem>
            <MenuItem value="कोदो">🌾 मिलेट्स / कोदो-कुटकी</MenuItem>
            <MenuItem value="गेहूं">🌾 गेहूं (Wheat)</MenuItem>
            <MenuItem value="सरसों">🌻 सरसों / तिलहन</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            size="small"
            variant={districtFilterOnly ? 'contained' : 'outlined'}
            color={districtFilterOnly ? 'success' : 'inherit'}
            onClick={() => setDistrictFilterOnly(!districtFilterOnly)}
            startIcon={<LocationOnIcon sx={{ fontSize: 18 }} />}
            sx={{
              py: 0.9,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: '0.78rem',
              borderColor: districtFilterOnly ? '#2e7d32' : '#cbd5e1',
              bgcolor: districtFilterOnly ? '#2e7d32' : '#fff',
              color: districtFilterOnly ? '#fff' : '#334155',
              textTransform: 'none',
              '&:hover': {
                bgcolor: districtFilterOnly ? '#1b5e20' : '#f8fafc',
                borderColor: '#2e7d32'
              }
            }}
          >
            {districtFilterOnly
              ? `📍 केवल ${selectedDistrict} की दरें (फिल्टर सक्रिय)`
              : `📍 केवल ${selectedDistrict} की दरें देखें`}
          </Button>
        </Grid>
      </Grid>

      {/* Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="मंडी या फसल का नाम खोजें (जैसे: रायपुर, धमतरी, धान...)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#888', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          bgcolor: '#fff',
          '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
        }}
      />

      {/* Mandi Rate Cards */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', mb: 1.5, fontSize: '0.9rem' }}>
        ताजा मंडी भाव दरें ({filteredRates.length}):
      </Typography>

      {filteredRates.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            mb: 4,
            textAlign: 'center',
            borderRadius: '16px',
            bgcolor: '#f8fafc',
            border: '1.5px dashed #cbd5e1'
          }}
        >
          <StorefrontIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
            {mandiRatesList.length === 0 ? 'कोई मंडी भाव डेटा उपलब्ध नहीं है' : 'चयनित फिल्टर के अनुसार कोई मंडी नहीं मिली'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 440, mx: 'auto', mb: 2 }}>
            {mandiRatesList.length === 0
              ? 'शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत कोई भी मनगढ़ंत या कल्पित डेटा नहीं दिखाया जाता है। आज के लाइव भाव लोड करने हेतु इंटरनेट कनेक्ट करके रीफ्रेश करें।'
              : 'कृपया जिंस या मंडी का नाम बदलकर पुनः खोजें या फ़िल्टर साफ़ करें।'}
          </Typography>
          {mandiRatesList.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={isRefreshing ? <CircularProgress size={14} color="inherit" /> : <SyncIcon sx={{ fontSize: 16 }} />}
                disabled={isRefreshing}
                onClick={handleRefresh}
                sx={{ bgcolor: '#1565c0', fontWeight: 800, borderRadius: 2 }}
              >
                ताजा भाव लोड करें
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<BookmarkBorderIcon sx={{ fontSize: 16 }} />}
                onClick={() => setOpenOfflineQueryModal(true)}
                sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 800, borderRadius: 2 }}
              >
                ऑफ़लाइन पूछताछ सहेजें
              </Button>
            </Box>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {filteredRates.map((rate, idx) => {
            const isPositive = rate.trend?.startsWith('+');
            const isNegative = rate.trend?.startsWith('-');
            return (
              <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
                <Card
                  className="touch-card"
                  sx={{
                    width: '100%',
                    borderRadius: '16px',
                    border: '1px solid #bbdefb',
                    bgcolor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(25, 118, 210, 0.05)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 20px rgba(25, 118, 210, 0.12)',
                      borderColor: '#64b5f6'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                            <LocationOnIcon sx={{ color: '#1565c0', fontSize: 16 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565c0', fontSize: '0.9rem' }}>
                              {rate.mandi}
                            </Typography>
                            <Chip
                              label={rate.date || (isLiveSource ? '🟢 आज के भाव' : '📋 संदर्भ भाव')}
                              size="small"
                              sx={{
                                bgcolor: rate.date?.includes('आज') || isLiveSource ? '#e8f5e9' : '#f1f5f9',
                                color: rate.date?.includes('आज') || isLiveSource ? '#1b5e20' : '#475569',
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                borderRadius: '6px'
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.02rem', lineHeight: 1.2 }}>
                            {rate.crop} <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>({rate.variety})</span>
                          </Typography>
                        </Box>

                        <Button
                          size="small"
                          startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
                          onClick={() => handleReadMandiRates(rate)}
                          sx={{ color: '#1565c0', fontSize: '0.72rem', p: 0.5, borderRadius: '8px' }}
                        >
                          सुनें
                        </Button>
                      </Box>

                      <Grid container spacing={1} sx={{ mt: 0.5, mb: 1.5 }}>
                        <Grid item xs={4}>
                          <Paper elevation={0} sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>
                              न्यूनतम भाव
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.9rem' }}>
                              ₹{rate.minRate}
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={4}>
                          <Paper elevation={0} sx={{ p: 1, bgcolor: '#e8f5e9', border: '1.5px solid #a5d6a7', borderRadius: '10px', textAlign: 'center', boxShadow: '0 1px 4px rgba(46,125,50,0.08)' }}>
                            <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, display: 'block', fontSize: '0.68rem' }}>
                              मॉडल भाव
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                              ₹{rate.modalRate}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.62rem', fontWeight: 700 }}>
                              /क्विंटल
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={4}>
                          <Paper elevation={0} sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>
                              अधिकतम भाव
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.9rem' }}>
                              ₹{rate.maxRate}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {isPositive ? (
                          <Chip
                            icon={<TrendingUpIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
                            label={`तेजी ${rate.trend} ${rate.unit || '₹ / क्विंटल'}`}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                          />
                        ) : isNegative ? (
                          <Chip
                            icon={<TrendingDownIcon sx={{ fontSize: '13px !important', color: '#c62828' }} />}
                            label={`मंदी ${rate.trend} ${rate.unit || '₹ / क्विंटल'}`}
                            size="small"
                            sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                          />
                        ) : (
                          <Chip
                            label={`स्थिर ${rate.trend || '0'}`}
                            size="small"
                            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                          />
                        )}
                      </Box>

                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                        आवक: {rate.arrival || 'उपलब्ध'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Direct Buyer & Farmer Marketplace */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b5e20' }}>
          🤝 सीधे खेत से फसल बिक्री (Direct Marketplace)
        </Typography>
      </Box>

      {myListings.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            textAlign: 'center',
            bgcolor: '#f8fafc',
            borderRadius: '16px',
            border: '1.5px dashed #cbd5e1'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
            वर्तमान में कोई फसल बिक्री लिस्टिंग दर्ज नहीं है
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
            अपनी उपज सीधे व्यापारियों और खरीदारों को बेचने के लिए अपनी फसल जोड़ें।
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpenSellModal(true)}
            sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: 2 }}
          >
            अपनी फसल जोड़ें
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {myListings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing.id} sx={{ display: 'flex' }}>
            <Paper
              elevation={0}
              className="touch-card"
              sx={{
                p: 2,
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
                      label="विक्रेता (किसान)"
                      size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', mb: 0.5, borderRadius: '6px' }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem', lineHeight: 1.25 }}>
                      {listing.crop} - {listing.quantity}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                      किसान: <strong>{listing.farmerName}</strong> • स्थान: {listing.location}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.08rem' }}>
                    {listing.expectedPrice}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  {listing.date}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                    onClick={() => {
                      const msg = `नमस्ते ${listing.farmerName} भाई, मैंने किसान साथी ऐप पर आपकी फसल (${listing.crop} - ${listing.quantity}) का विज्ञापन देखा। क्या यह उपलब्ध है?`;
                      openNativeWhatsApp(listing.phone, msg);
                    }}
                    sx={{
                      borderColor: '#25D366',
                      color: '#128C7E',
                      fontWeight: 800,
                      fontSize: '0.73rem',
                      borderRadius: '8px',
                      py: 0.5,
                      px: 1.1,
                      '&:hover': { bgcolor: '#e8f5e9', borderColor: '#128C7E' }
                    }}
                  >
                    व्हाट्सएप
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CallIcon />}
                    onClick={() => { openNativeDialer(listing.phone); }}
                    sx={{
                      bgcolor: '#1b5e20',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.73rem',
                      borderRadius: '8px',
                      py: 0.5,
                      px: 1.3,
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

      {/* Official Government Open Data License (GODL-India) Legal Attribution & Disclaimer */}
      <Box
        sx={{
          mt: 3,
          mb: 2,
          p: 2,
          borderRadius: 2.5,
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            🏛️ वैधानिक अनुपालन व डेटा श्रेय (GODL - India):
          </Typography>
          <Chip
            label="Government Open Data License - India"
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', borderColor: '#bae6fd' }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.73rem', lineHeight: 1.5 }}>
          मंडी आवक एवं दैनिक दरें <strong>data.gov.in</strong> (ओपन गवर्नमेंट डेटा प्लेटफॉर्म इंडिया) तथा विपणन एवं निरीक्षण निदेशालय (DMI / Agmarknet), कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार के अधिकृत डेटासेट से ली गई हैं।
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', lineHeight: 1.4 }}>
          अस्वीकरण (Non-Endorsement Disclaimer): भारत सरकार या डेटा प्रदाता विभाग इस स्वतंत्र किसान-कल्याण ऐप का प्रत्यक्ष प्रायोजन, समर्थन या वारंटी नहीं करता है। सभी आंकड़े किसानों की निष्पक्ष जानकारी हेतु प्रदर्शित हैं।
        </Typography>
      </Box>

      {/* Sell Produce Modal Dialog */}
      <Dialog open={openSellModal} onClose={() => setOpenSellModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1565c0', fontSize: '1.1rem' }}>
          🌾 अपनी फसल बिक्री हेतु जोड़ें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="फसल का नाम व किस्म (जैसे: सुगंधित धान, गेहूं, चना)"
            value={formData.crop}
            onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="मात्रा (जैसे: 25 क्विंटल, 50 बोरी)"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="अपेक्षित भाव (₹ प्रति क्विंटल)"
            value={formData.expectedPrice}
            onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="आपका नाम"
            value={formData.farmerName}
            onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="गांव / तहसील / जिला"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="मोबाइल नंबर (खरीदार संपर्क हेतु)"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSellModal(false)} sx={{ color: '#666' }}>
            रद्द करें
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveListing}
            sx={{ bgcolor: '#1565c0', fontWeight: 700, borderRadius: 2 }}
          >
            लिस्टिंग पोस्ट करें
          </Button>
        </DialogActions>
      </Dialog>

      {/* Offline Mandi Query Modal Dialog (Zero-False-Data Policy) */}
      <Dialog open={openOfflineQueryModal} onClose={() => setOpenOfflineQueryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#0369a1', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookmarkBorderIcon sx={{ color: '#0284c7' }} />
          📡 ऑफ़लाइन भाव पूछताछ सहेजें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.4 }}>
            इंटरनेट न होने पर भी आप जिस फसल व मंडी का ताजा भाव जानना चाहते हैं, उसे यहाँ सहेजें। जैसे ही आपका फ़ोन इंटरनेट से जुड़ेगा, सत्यापित लाइव भाव स्वतः प्राप्त हो जाएगा।
          </Typography>

          <TextField
            select
            fullWidth
            size="small"
            label="फसल चुनें"
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
            label="मंडी समिति चुनें"
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
          <Button onClick={() => setOpenOfflineQueryModal(false)} sx={{ color: '#666' }}>
            रद्द करें
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveOfflineQuery}
            sx={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              fontWeight: 700,
              borderRadius: 2
            }}
          >
            पूछताछ सहेजें
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
