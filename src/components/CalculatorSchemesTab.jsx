import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Grid,
  Button,
  Chip,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PolicyIcon from '@mui/icons-material/Policy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import LaunchIcon from '@mui/icons-material/Launch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FERTILIZER_DOSES, SCHEMES, CROPS } from '../data/kisanData';
import { speakText } from '../utils/speech';
import { appConfig } from '../config/appConfig';
import { getFertilizers, getSchemes } from '../services/apiService';
import { CG_SOIL_PROFILES } from '../services/weatherService';

export const CalculatorSchemesTab = () => {
  const [subTab, setSubTab] = useState(0);

  // Dynamic MongoDB state
  const [fertData, setFertData] = useState(FERTILIZER_DOSES);
  const [schemesList, setSchemesList] = useState(SCHEMES);

  // Fertilizer Calculator State
  const [fertCrop, setFertCrop] = useState('paddy');
  const [fertAcres, setFertAcres] = useState(1);
  const [soilType, setSoilType] = useState('सामान्य');

  // Paddy Kharidi Calculator State
  const [paddyAcres, setPaddyAcres] = useState(2.5);

  useEffect(() => {
    const loadFromMongo = async () => {
      const liveFert = await getFertilizers();
      if (liveFert && Object.keys(liveFert).length > 0) setFertData(liveFert);
      const liveSchemes = await getSchemes();
      if (liveSchemes && liveSchemes.length > 0) setSchemesList(liveSchemes);
    };
    loadFromMongo();
  }, []);

  const activeFert = fertData[fertCrop] || fertData.paddy || FERTILIZER_DOSES.paddy;
  const acresNum = parseFloat(fertAcres) || 0;

  const totalUreaKg = Math.round(activeFert.ureaTotal * acresNum);
  const totalDapKg = Math.round(activeFert.dapTotal * acresNum);
  const totalMopKg = Math.round(activeFert.mopTotal * acresNum);
  const totalZincKg = Math.round(activeFert.zincSulfate * acresNum);

  // Bags estimation (Urea 45kg bag, DAP 50kg bag, MOP 50kg bag)
  const ureaBags = (totalUreaKg / 45).toFixed(1);
  const dapBags = (totalDapKg / 50).toFixed(1);
  const mopBags = (totalMopKg / 50).toFixed(1);

  // Paddy Kharidi Math - Fully Environment Driven
  const pAcresNum = parseFloat(paddyAcres) || 0;
  const maxQuintals = (pAcresNum * appConfig.paddyScheme.maxQuintalsPerAcre).toFixed(1);
  const mspRate = appConfig.paddyScheme.mspRate;
  const bonusRate = appConfig.paddyScheme.bonusRate;
  const totalRate = appConfig.paddyScheme.totalRate;
  const totalPaddyAmount = Math.round(maxQuintals * totalRate);
  const mspPart = Math.round(maxQuintals * mspRate);
  const bonusPart = Math.round(maxQuintals * bonusRate);

  const handleReadFertSummary = () => {
    const text = `${acresNum} एकड़ ${activeFert.name} के लिए कुल ${totalUreaKg} किलो यूरिया, ${totalDapKg} किलो डीएपी और ${totalMopKg} किलो पोटाश की आवश्यकता होगी।`;
    speakText(text);
  };

  const handleReadPaddyMath = () => {
    const text = `${pAcresNum} एकड़ रकबे में ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल प्रति एकड़ के हिसाब से आप अधिकतम ${maxQuintals} क्विंटल धान बेच सकते हैं। ₹${totalRate.toLocaleString('en-IN')} प्रति क्विंटल के भाव से आपकी कुल राशि ₹${totalPaddyAmount.toLocaleString('en-IN')} होगी।`;
    speakText(text);
  };

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* Sub Header Tabs */}
      <Paper elevation={0} sx={{ mb: 2, borderRadius: 3, bgcolor: '#f0f4ec', p: 0.5 }}>
        <Tabs
          value={subTab}
          onChange={(e, val) => setSubTab(val)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: 'none',
              py: 0.8
            },
            '& .Mui-selected': {
              bgcolor: '#ffffff',
              color: '#1b5e20 !important',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            },
            '& .MuiTabs-indicator': { display: 'none' }
          }}
        >
          <Tab icon={<CalculateIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="खाद कैलकुलेटर" />
          <Tab icon={<MonetizationOnIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`धान ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}`} />
          <Tab icon={<PolicyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="सरकारी योजनाएं" />
        </Tabs>
      </Paper>

      {/* TAB 0: FERTILIZER CALCULATOR */}
      {subTab === 0 && (
        <Box>
          <Card sx={{ p: 2, mb: 2.5, borderRadius: 3.5, border: '1.5px solid #c8e6c9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1rem' }}>
                🌾 स्मार्ट खाद मात्रा कैलकुलेटर
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                onClick={handleReadFertSummary}
                sx={{ fontSize: '0.72rem', py: 0.3, px: 1, borderRadius: 2 }}
              >
                सुनें
              </Button>
            </Box>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="फसल चुनें"
                  value={fertCrop}
                  onChange={(e) => setFertCrop(e.target.value)}
                >
                  <MenuItem value="paddy">धान (Paddy)</MenuItem>
                  <MenuItem value="wheat">गेहूं (Wheat)</MenuItem>
                  <MenuItem value="chana">चना (Chickpea)</MenuItem>
                  <MenuItem value="maize">मक्का (Maize)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="रकबा (एकड़)"
                  type="number"
                  inputProps={{ min: 0.25, step: 0.25 }}
                  value={fertAcres}
                  onChange={(e) => setFertAcres(e.target.value)}
                />
              </Grid>
              <Grid item xs={6} sm={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="मिट्टी का प्रकार (वैकल्पिक)"
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                >
                  <MenuItem value="सामान्य">सामान्य (मानक दोमट)</MenuItem>
                  <MenuItem value="मटासी">मटासी (पीली-दोमट)</MenuItem>
                  <MenuItem value="डोर्सा">डोर्सा (मध्यम भारी)</MenuItem>
                  <MenuItem value="कन्हार">कन्हार (काली चिकनी)</MenuItem>
                  <MenuItem value="भाठा">भाठा (लाल कंकरीली)</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* Regional Soil Health Advisory Box */}
            {soilType !== 'सामान्य' && CG_SOIL_PROFILES[soilType] && (
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2.5,
                  bgcolor: '#f1f8e9',
                  border: '1.2px solid #aed581',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.2,
                }}
              >
                <Box sx={{ flex: 1 }}>
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
                </Box>
              </Paper>
            )}

            {/* Total Bags Display Cards */}
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, mb: 1.2, display: 'block', fontSize: '0.8rem' }}>
              कुल आवश्यक खाद की मात्रा ({acresNum} एकड़ हेतु):
            </Typography>

            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  className="touch-card"
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: '#e8f5e9',
                    border: '1.2px solid #a5d6a7',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 800, display: 'block', fontSize: '0.78rem' }}>
                    यूरिया (Urea)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.2rem', lineHeight: 1.1, my: 0.3 }}>
                    {totalUreaKg} <span style={{ fontSize: '0.7rem' }}>kg</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#388e3c', fontSize: '0.74rem', fontWeight: 700 }}>
                    ~{ureaBags} बोरी (45kg)
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  className="touch-card"
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: '#e3f2fd',
                    border: '1.2px solid #90caf9',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 800, display: 'block', fontSize: '0.78rem' }}>
                    DAP
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#0d47a1', fontSize: '1.2rem', lineHeight: 1.1, my: 0.3 }}>
                    {totalDapKg} <span style={{ fontSize: '0.7rem' }}>kg</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1976d2', fontSize: '0.74rem', fontWeight: 700 }}>
                    ~{dapBags} बोरी (50kg)
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  className="touch-card"
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: '#fff3e0',
                    border: '1.2px solid #ffcc80',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 800, display: 'block', fontSize: '0.78rem' }}>
                    पोटाश (MOP)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#bf360c', fontSize: '1.2rem', lineHeight: 1.1, my: 0.3 }}>
                    {totalMopKg} <span style={{ fontSize: '0.7rem' }}>kg</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.74rem', fontWeight: 700 }}>
                    ~{mopBags} बोरी (50kg)
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  elevation={0}
                  className="touch-card"
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    bgcolor: '#f3e5f5',
                    border: '1.2px solid #ce93d8',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#6a1b9a', fontWeight: 800, display: 'block', fontSize: '0.78rem' }}>
                    जिंक सल्फेट
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#4a148c', fontSize: '1.2rem', lineHeight: 1.1, my: 0.3 }}>
                    {totalZincKg} <span style={{ fontSize: '0.7rem' }}>kg</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#7b1fa2', fontSize: '0.74rem', fontWeight: 700 }}>
                    21% Zinc
                  </Typography>
                </Paper>
              </Grid>
            </Grid>


            {/* Schedule Accordion / Timeline */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', mb: 1, fontSize: '0.85rem' }}>
              ⏱️ खाद कब और कितनी मात्रा में डालें (समय सारिणी):
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {activeFert.schedule.map((step, idx) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 1.3,
                    bgcolor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip
                      label={`चरण ${idx + 1}`}
                      size="small"
                      sx={{ bgcolor: '#2e7d32', color: '#fff', height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                      {step.stage}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#777', display: 'block', mb: 0.5, fontSize: '0.72rem' }}>
                    समय: {step.time}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                    {step.urea && <Chip label={`यूरिया: ${step.urea}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />}
                    {step.dap && <Chip label={`DAP: ${step.dap}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />}
                    {step.mop && <Chip label={`पोटाश: ${step.mop}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />}
                    {step.zinc && <Chip label={`जिंक: ${step.zinc}`} size="small" variant="outlined" sx={{ fontSize: '0.72rem' }} />}
                  </Box>
                  {step.note && (
                    <Typography variant="caption" sx={{ color: '#d84315', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>
                      ⚠️ सावधानी: {step.note}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Card>
        </Box>
      )}

      {/* TAB 1: PADDY ₹3100 KHARIDI CALCULATOR */}
      {subTab === 1 && (
        <Box>
          <Card
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 3.5,
              border: '2px solid #81c784',
              background: 'linear-gradient(180deg, #ffffff 0%, #f1f8e9 100%)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                  💰 {appConfig.stateName} कृषक उन्नति धान कैलकुलेटर
                </Typography>
                <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.75rem' }}>
                  {appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल प्रति एकड़ सीमा • ₹{appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} प्रति क्विंटल सुनिश्चित मूल्य
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                onClick={handleReadPaddyMath}
                sx={{ fontSize: '0.72rem', py: 0.3, px: 1, borderRadius: 2 }}
              >
                सुनें
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="अपनी जमीन का रकबा डालें (एकड़ में)"
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                value={paddyAcres}
                onChange={(e) => setPaddyAcres(e.target.value)}
                helperText="उदाहरण: 1 एकड़, 2.5 एकड़, 5 एकड़"
              />
            </Box>

            {/* Total Revenue Highlight Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                bgcolor: '#1b5e20',
                color: '#fff',
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                अनुमानित कुल प्राप्त होने वाली राशि
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff176', my: 0.5, fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
                ₹ {totalPaddyAmount.toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#e8f5e9', fontSize: '0.78rem' }}>
                कुल धान उपार्जन क्षमता: <strong>{maxQuintals} क्विंटल</strong> ({pAcresNum} एकड़ × {appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल)
              </Typography>
            </Paper>

            {/* Breakup Grid */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 1.3, bgcolor: '#ffffff', border: '1px solid #c8e6c9', borderRadius: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', fontSize: '0.72rem' }}>
                    न्यूनतम समर्थन मूल्य (MSP हिस्सा @ ₹{appConfig.paddyScheme.mspRate.toLocaleString('en-IN')})
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#2e7d32', fontSize: '1rem' }}>
                    ₹ {mspPart.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888', fontSize: '0.68rem' }}>
                    समिति में तौल के तुरंत बाद
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 1.3, bgcolor: '#ffffff', border: '1px solid #ffe082', borderRadius: 2.5 }}>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', fontSize: '0.72rem' }}>
                    कृषक उन्नति अंतर राशि (बोनस @ ₹{appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')})
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f57f17', fontSize: '1rem' }}>
                    ₹ {bonusPart.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888', fontSize: '0.68rem' }}>
                    डीबीटी द्वारा सीधे खाते में
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Quick Rules */}
            <Box sx={{ p: 1.2, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 2, border: '1px dashed #a5d6a7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                <InfoOutlinedIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1b5e20', fontSize: '0.75rem' }}>
                  महत्वपूर्ण धान खरीदी नियम:
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.72rem', lineHeight: 1.35 }}>
                1. प्रति एकड़ अधिकतम {appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल धान ही लिया जाएगा।<br />
                2. धान में नमी की मात्रा 17% से कम होनी चाहिए।<br />
                3. टोकन तुंहर हाथ मोबाइल ऐप से टोकन काटना अनिवार्य है।
              </Typography>
            </Box>
          </Card>
        </Box>
      )}

      {/* TAB 2: GOVERNMENT SCHEMES & PORTALS */}
      {subTab === 2 && (
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
                        सुनें
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
      )}

    </Box>
  );
};
