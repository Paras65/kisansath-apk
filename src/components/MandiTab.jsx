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
  MenuItem
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
import { MANDI_RATES } from '../data/kisanData';
import { speakText } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { getMandiRates, getMarketplaceListings, postMarketplaceListing } from '../services/apiService';
import { notify } from '../services/notificationService';
import { validateIndianPhone } from '../services/deviceManagerService';
import { openNativeDialer, openNativeWhatsApp } from '../utils/capacitorUtils';

export const MandiTab = ({ selectedDistrict = 'रायपुर' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [districtFilterOnly, setDistrictFilterOnly] = useState(false);
  const [openSellModal, setOpenSellModal] = useState(false);
  const [mandiRatesList, setMandiRatesList] = useState(MANDI_RATES);

  // Direct buyer listings / farmer listings from MongoDB
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    const loadFromMongo = async () => {
      const liveRates = await getMandiRates();
      if (liveRates && liveRates.length > 0) setMandiRatesList(liveRates);
      const liveListings = await getMarketplaceListings();
      if (liveListings && liveListings.length > 0) setMyListings(liveListings);
    };
    loadFromMongo();
  }, []);

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

  const filteredRates = mandiRatesList.filter((item) => {
    const matchesCrop =
      selectedCropFilter === 'all' || item.crop.toLowerCase().includes(selectedCropFilter.toLowerCase());
    const matchesSearch =
      item.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrictOnly = !districtFilterOnly || item.district.includes(selectedDistrict) || item.mandi.includes(selectedDistrict);
    return matchesCrop && matchesSearch && matchesDistrictOnly;
  }).sort((a, b) => {
    const aMatch = a.district.includes(selectedDistrict) || a.mandi.includes(selectedDistrict);
    const bMatch = b.district.includes(selectedDistrict) || b.mandi.includes(selectedDistrict);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const handleReadMandiRates = (item) => {
    const text = `${item.mandi} में ${item.crop} का मॉडल भाव ₹${item.modalRate} प्रति क्विंटल है। न्यूनतम भाव ₹${item.minRate} और अधिकतम भाव ₹${item.maxRate} है।`;
    speakText(text);
  };

  const avgModalRate = filteredRates.length > 0
    ? Math.round(filteredRates.reduce((acc, curr) => acc + (Number(curr.modalRate) || 0), 0) / filteredRates.length)
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

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {filteredRates.map((rate, idx) => {
          const isPositive = rate.trend.startsWith('+');
          const isNegative = rate.trend.startsWith('-');
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
                            label={rate.date}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', height: 20, fontSize: '0.68rem', fontWeight: 700, borderRadius: '6px' }}
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
                            मॉडल भाव (आज)
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
                          label={`तेजी ${rate.trend} ${rate.unit}`}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                        />
                      ) : isNegative ? (
                        <Chip
                          icon={<TrendingDownIcon sx={{ fontSize: '13px !important', color: '#c62828' }} />}
                          label={`मंदी ${rate.trend} ${rate.unit}`}
                          size="small"
                          sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                        />
                      ) : (
                        <Chip
                          label={`स्थिर ${rate.trend}`}
                          size="small"
                          sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                      आवक: {rate.arrival}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Direct Buyer & Farmer Marketplace */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b5e20' }}>
          🤝 सीधे खेत से फसल बिक्री (Direct Marketplace)
        </Typography>
      </Box>

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
    </Box>
  );
};
