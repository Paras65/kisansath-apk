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
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CallIcon from '@mui/icons-material/Call';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import { MANDI_RATES } from '../data/kisanData';
import { speakText } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { getMandiRates, getMarketplaceListings, postMarketplaceListing } from '../services/apiService';

export const MandiTab = ({ selectedDistrict = 'रायपुर' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');
  const [districtFilterOnly, setDistrictFilterOnly] = useState(false);
  const [openSellModal, setOpenSellModal] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState(false);
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
    if (!formData.crop || !formData.quantity || !formData.phone) return;
    const newEntry = {
      id: `list-${Date.now()}`,
      ...formData,
      date: 'अभी-अभी'
    };
    // Post to MongoDB
    await postMarketplaceListing(newEntry);
    const updated = [newEntry, ...myListings];
    setMyListings(updated);
    setOpenSellModal(false);
    setSuccessSnackbar(true);
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

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* Title & Post button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: 2 }}>
            <StorefrontIcon sx={{ color: '#1565c0', fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0d47a1', fontSize: '1.1rem', lineHeight: 1.2 }}>
              लाइव मंडी भाव व बिक्री
            </Typography>
            <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
              ताजा मंडी दरें एवं खेत से सीधा खरीदार संपर्क
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddCircleIcon />}
          onClick={() => setOpenSellModal(true)}
          sx={{
            bgcolor: '#1565c0',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 2.5,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#0d47a1' }
          }}
        >
          फसल बेचें
        </Button>
      </Box>

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

      {/* Filter Chips with District Priority */}
      <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', pb: 1, mb: 1.5, scrollbarWidth: 'none' }}>
        <Chip
          label={`📍 केवल ${selectedDistrict}`}
          clickable
          color={districtFilterOnly ? 'success' : 'default'}
          variant={districtFilterOnly ? 'filled' : 'outlined'}
          onClick={() => setDistrictFilterOnly(!districtFilterOnly)}
          sx={{ fontWeight: 800, fontSize: '0.75rem', borderColor: '#2e7d32' }}
        />
        <Chip
          label="सभी जिंसें"
          clickable
          color={selectedCropFilter === 'all' ? 'primary' : 'default'}
          onClick={() => setSelectedCropFilter('all')}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          label="धान (Paddy)"
          clickable
          color={selectedCropFilter === 'धान' ? 'primary' : 'default'}
          onClick={() => setSelectedCropFilter('धान')}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          label="चना (Gram)"
          clickable
          color={selectedCropFilter === 'चना' ? 'primary' : 'default'}
          onClick={() => setSelectedCropFilter('चना')}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          label="सोयाबीन"
          clickable
          color={selectedCropFilter === 'सोयाबीन' ? 'primary' : 'default'}
          onClick={() => setSelectedCropFilter('सोयाबीन')}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          label="मक्का"
          clickable
          color={selectedCropFilter === 'मक्का' ? 'primary' : 'default'}
          onClick={() => setSelectedCropFilter('मक्का')}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
        <Chip
          label="मिलेट्स / कोदो"
          clickable
          color={selectedCropFilter === 'कोदो' ? 'primary' : 'default'}
          onClick={() => setSelectedCropFilter('कोदो')}
          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
        />
      </Box>

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
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                className="touch-card"
                sx={{
                  borderRadius: 3.5,
                  border: '1px solid #bbdefb',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(25, 118, 210, 0.05)',
                  '&:hover': { boxShadow: '0 6px 18px rgba(25, 118, 210, 0.12)' }
                }}
              >
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                          <LocationOnIcon sx={{ color: '#1565c0', fontSize: 16 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565c0', fontSize: '0.88rem' }}>
                            {rate.mandi}
                          </Typography>
                          <Chip
                            label={rate.date}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                          />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#222', fontSize: '1rem', lineHeight: 1.2 }}>
                          {rate.crop} <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 500 }}>({rate.variety})</span>
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        startIcon={<VolumeUpIcon sx={{ fontSize: 15 }} />}
                        onClick={() => handleReadMandiRates(rate)}
                        sx={{ color: '#1565c0', fontSize: '0.72rem', p: 0.5 }}
                      >
                        सुनें
                      </Button>
                    </Box>

                    <Grid container spacing={1} sx={{ mt: 0.5, mb: 1.5 }}>
                      <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.68rem' }}>
                            न्यूनतम भाव
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.9rem' }}>
                            ₹{rate.minRate}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>
                            मॉडल भाव (औसत)
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1rem' }}>
                            ₹{rate.modalRate}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={4}>
                        <Paper elevation={0} sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
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
                        <TrendingUpIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#c62828', fontSize: 16 }} />
                      )}
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: isPositive ? '#2e7d32' : '#c62828', fontSize: '0.72rem' }}
                      >
                        {rate.trend} {rate.unit} (पिछले दिन से)
                      </Typography>
                    </Box>

                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
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
          <Grid item xs={12} sm={6} md={4} key={listing.id}>
            <Paper
              elevation={0}
              className="touch-card"
              sx={{
                p: 2,
                borderRadius: 3.5,
                border: '1.5px solid #c8e6c9',
                bgcolor: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.05)'
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8 }}>
                  <Box>
                    <Chip
                      label="विक्रेता (Farmer Listing)"
                      size="small"
                      sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', mb: 0.5 }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.96rem' }}>
                      {listing.crop} - {listing.quantity}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                      किसान: <strong>{listing.farmerName}</strong> • स्थान: {listing.location}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#2e7d32', fontSize: '1.05rem' }}>
                    {listing.expectedPrice}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  {listing.date}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CallIcon />}
                  onClick={() => { window.location.href = `tel:${listing.phone}`; }}
                  sx={{
                    color: '#2e7d32',
                    borderColor: '#81c784',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 2.5,
                    py: 0.4
                  }}
                >
                  संपर्क करें: {listing.phone}
                </Button>
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

      <Snackbar
        open={successSnackbar}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2.5 }}>
          आपकी फसल लिस्टिंग सफलतापूर्वक पोस्ट हो गई है! खरीदार आपसे जल्द संपर्क करेंगे।
        </Alert>
      </Snackbar>
    </Box>
  );
};
