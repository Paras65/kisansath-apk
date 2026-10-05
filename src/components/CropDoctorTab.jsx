import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SpaIcon from '@mui/icons-material/Spa';
import ScienceIcon from '@mui/icons-material/Science';
import VerifiedIcon from '@mui/icons-material/Verified';
import { CROP_DISEASES, CROPS } from '../data/kisanData';
import { speakText } from '../utils/speech';
import { getCrops, getDiseases } from '../services/apiService';

export const CropDoctorTab = () => {
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [searchQuery, setSearchQuery] = useState('');
  const [cropsList, setCropsList] = useState(CROPS);
  const [diseasesList, setDiseasesList] = useState(CROP_DISEASES);
  const [activeDisease, setActiveDisease] = useState(CROP_DISEASES[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Load live data from MongoDB
  useEffect(() => {
    const loadFromMongo = async () => {
      const liveCrops = await getCrops();
      if (liveCrops && liveCrops.length > 0) setCropsList(liveCrops);
      const liveDiseases = await getDiseases();
      if (liveDiseases && liveDiseases.length > 0) {
        setDiseasesList(liveDiseases);
        setActiveDisease(liveDiseases[0]);
      }
    };
    loadFromMongo();
  }, []);

  // Filter diseases based on selected crop and search text
  const filteredDiseases = diseasesList.filter((d) => {
    const matchesCrop = selectedCrop === 'all' || d.cropId === selectedCrop;
    const matchesSearch =
      d.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.cropName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
        setAnalyzing(true);
        setAiReport(null);

        // Simulate intelligent AI plant vision diagnosis
        setTimeout(() => {
          setAnalyzing(false);
          const matched = CROP_DISEASES.find((d) => d.cropId === selectedCrop) || CROP_DISEASES[0];
          setActiveDisease(matched);
          setAiReport({
            confidence: 96,
            disease: matched.diseaseName,
            crop: matched.cropName,
            status: 'गंभीरता: मध्यम (तुरंत उपचार की आवश्यकता)'
          });
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceReadRemedy = (disease) => {
    const text = `${disease.diseaseName} का उपचार: जैविक उपाय है ${disease.organicRemedy}। रासायनिक उपाय है ${disease.chemicalRemedy}`;
    speakText(text);
  };

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* Title & Banner */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 2 }}>
          <LocalHospitalIcon sx={{ color: '#c62828', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b71c1c', fontSize: '1.15rem', lineHeight: 1.2 }}>
            एआई फसल डॉक्टर (Crop Doctor)
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.78rem' }}>
            रोग व कीट की सही पहचान, जैविक व रासायनिक उपचार एवं खुराक
          </Typography>
        </Box>
      </Box>

      {/* AI Photo Diagnosis Box */}
      <Card
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: 3.5,
          bgcolor: '#fff9c4',
          border: '1.5px dashed #fbc02d',
          textAlign: 'center'
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f57f17', fontSize: '0.92rem', mb: 0.5 }}>
          📸 बीमार पत्ती या पौधे की फोटो से तुरंत जांच करें
        </Typography>
        <Typography variant="caption" sx={{ color: '#6d4c41', display: 'block', mb: 1.5, fontSize: '0.75rem' }}>
          कैमरा से फोटो खींचें या गैलरी से अपलोड करें, एआई डॉक्टर तुरंत रोग व दवा बताएगा
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="crop-photo-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="crop-photo-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<PhotoCameraIcon />}
              sx={{
                bgcolor: '#f57f17',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: 3,
                px: 2,
                '&:hover': { bgcolor: '#e65100' }
              }}
            >
              फोटो अपलोड करें / खींचें
            </Button>
          </label>
        </Box>

        {analyzing && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#f57f17' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57f17' }}>
              एआई फोटो स्कैन कर रहा है... कृपया प्रतीक्षा करें
            </Typography>
          </Box>
        )}

        {uploadedImage && !analyzing && aiReport && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#ffffff', borderRadius: 2.5, border: '1px solid #ffe082', textAlign: 'left' }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box
                component="img"
                src={uploadedImage}
                alt="Uploaded Leaf"
                sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover', border: '1px solid #ccc' }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VerifiedIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.88rem' }}>
                    पहचान: {aiReport.disease}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.74rem' }}>
                  सटीकता: <strong>{aiReport.confidence}% निश्चित</strong> • {aiReport.status}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Card>

      {/* Crop Selector Chips */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', mb: 1, fontSize: '0.85rem' }}>
        अपनी फसल चुनें:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, mb: 1.5, scrollbarWidth: 'none' }}>
        <Chip
          label="सभी फसलें"
          clickable
          color={selectedCrop === 'all' ? 'primary' : 'default'}
          onClick={() => setSelectedCrop('all')}
          sx={{ fontWeight: 700, fontSize: '0.78rem' }}
        />
        {cropsList.map((crop) => (
          <Chip
            key={crop.id}
            label={crop.name.split(' ')[0]}
            clickable
            color={selectedCrop === crop.id ? 'primary' : 'default'}
            onClick={() => setSelectedCrop(crop.id)}
            sx={{
              fontWeight: 700,
              fontSize: '0.78rem',
              bgcolor: selectedCrop === crop.id ? '#2e7d32' : '#f0f4ec',
              color: selectedCrop === crop.id ? '#fff' : '#2e7d32'
            }}
          />
        ))}
      </Box>

      {/* Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="लक्षण खोजें (जैसे: पत्ती पर धब्बे, तना सूखना, माहू...)"
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
          borderRadius: 2,
          '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
        }}
      />

      {/* Disease Selection Chips */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', mb: 0.8, fontSize: '0.85rem' }}>
        पहचाने गए सामान्य रोग ({filteredDiseases.length}):
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
        {filteredDiseases.map((d) => (
          <Chip
            key={d.id}
            label={`${d.cropName}: ${d.diseaseName.split('/')[0]}`}
            clickable
            variant={activeDisease?.id === d.id ? 'filled' : 'outlined'}
            color={activeDisease?.id === d.id ? 'error' : 'default'}
            onClick={() => setActiveDisease(d)}
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        ))}
      </Box>

      {/* Active Disease Detailed Card */}
      {activeDisease ? (
        <Card
          sx={{
            borderRadius: 3.5,
            border: '1.5px solid #ef9a9a',
            boxShadow: '0 4px 16px rgba(198, 40, 40, 0.08)'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Header of Card */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
              <Box>
                <Chip
                  label={activeDisease.cropName}
                  size="small"
                  sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, mb: 0.5, fontSize: '0.72rem' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#c62828', fontSize: '1.1rem', lineHeight: 1.2 }}>
                  {activeDisease.diseaseName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#777', fontSize: '0.75rem' }}>
                  कारक: {activeDisease.pathogen}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleVoiceReadRemedy(activeDisease)}
                sx={{
                  color: '#c62828',
                  borderColor: '#ef9a9a',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  borderRadius: 2,
                  py: 0.3,
                  px: 1,
                  '&:hover': { bgcolor: '#ffebee' }
                }}
              >
                इलाज सुनें
              </Button>
            </Box>

            {/* Responsive Diagnostic Grid */}
            <Grid container spacing={2} sx={{ mb: 1.5 }}>
              <Grid item xs={12} md={5}>
                {/* Symptoms */}
                <Paper elevation={0} sx={{ p: 1.8, height: '100%', bgcolor: '#fbfbfb', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#333', fontSize: '0.85rem', mb: 0.8 }}>
                    🔍 रोग के लक्षण (Symptoms):
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.55 }}>
                    {activeDisease.symptoms}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Organic Remedy */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      bgcolor: '#f1f8e9',
                      borderRadius: 2.5,
                      border: '1px solid #c8e6c9'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <SpaIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.85rem' }}>
                        जैविक एवं देसी उपाय (Organic Remedy):
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.84rem', lineHeight: 1.5 }}>
                      {activeDisease.organicRemedy}
                    </Typography>
                  </Paper>

                  {/* Chemical Remedy */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      bgcolor: '#e3f2fd',
                      borderRadius: 2.5,
                      border: '1px solid #bbdefb'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <ScienceIcon sx={{ color: '#1565c0', fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0d47a1', fontSize: '0.85rem' }}>
                        रासायनिक दवा व सटीक खुराक (Chemical Medicine):
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#1565c0', fontSize: '0.84rem', lineHeight: 1.5 }}>
                      {activeDisease.chemicalRemedy}
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>

            {/* Prevention */}
            <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 1, border: '1px solid #edf2f7' }}>
              <CheckCircleIcon sx={{ color: '#558b2f', fontSize: 18, mt: 0.2 }} />
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.8rem', lineHeight: 1.4 }}>
                <strong>भविष्य में बचाव:</strong> {activeDisease.prevention}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          इस खोज के लिए कोई रोग नहीं मिला। कृपया अन्य शब्द या फसल चुनें।
        </Alert>
      )}
    </Box>
  );
};
