import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MicIcon from '@mui/icons-material/Mic';
import ClearIcon from '@mui/icons-material/Clear';
import { useLanguage } from '../../utils/i18n';

// Visual Symptom Quick Filter Taxonomy with Chhattisgarhi Dialect Names
export const VISUAL_SYMPTOMS = [
  { id: 'all', label: 'सभी लक्षण', labelCg: 'सबो चिन्हारी', icon: '✨', match: '' },
  { id: 'spot', label: 'नाव/आंख जैसे धब्बे (ब्लास्ट)', labelCg: 'धब्बा (ब्लास्ट)', icon: '🍂', match: 'धब्बे' },
  { id: 'stemborer', label: 'गाभा कीट / मृत गोभ', labelCg: 'भंवरी / गोभ कीट', icon: '🐛', match: 'गोभ' },
  { id: 'bph', label: 'माहू / लाही (तने पर)', labelCg: 'माहू / चेंपा', icon: '🦟', match: 'माहू' },
  { id: 'sheath', label: 'केंचुली जैसे धब्बे (शीथ ब्लाइट)', labelCg: 'केंचुली धब्बा', icon: '🌿', match: 'केंचुली' },
  { id: 'khaira', label: 'खैरा रोग / पीलापन', labelCg: 'खैरा पीलापन', icon: '🟡', match: 'खैरा' },
  { id: 'wilt', label: 'अचानक जड़ सूखना (उकठा)', labelCg: 'उकठा सूखना', icon: '🥀', match: 'पीलापन' },
  { id: 'gandhi', label: 'गांधी कीड़ा / बदबूदार कीट', labelCg: 'गांधी कीड़ा', icon: '🦗', match: 'गांधी' },
  { id: 'armyworm', label: 'पत्तियों में बड़े छेद / इल्ली', labelCg: 'कटरुआ इल्ली', icon: '🐛', match: 'छेद' },
  { id: 'rust', label: 'पीला/भूरा पाउडर (रतुआ)', labelCg: 'हल्दी पाउडर (रतुआ)', icon: '🌾', match: 'पाउडर' },
  { id: 'curl', label: 'पत्तियां मुड़ना (कुकरो)', labelCg: 'पत्ता मरोड़', icon: '🍃', match: 'मुड़ना' },
];

export const CropDoctorDiseaseSelector = ({
  searchQuery,
  setSearchQuery,
  isVoiceListening,
  handleToggleVoiceSearch,
  selectedCrop,
  setSelectedCrop,
  cropsList,
  selectedSymptom,
  setSelectedSymptom,
  filteredDiseases,
  activeDisease,
  onSelectDisease,
  prescriptionRef
}) => {
  const { isChhattisgarhi } = useLanguage();

  return (
    <Box sx={{ mb: 1.5 }}>
      {/* Search Bar with Mic */}
      <TextField
        fullWidth
        size="small"
        placeholder={isChhattisgarhi ? "रोग, चिन्हारी या दवाई बोलव या खोजव (जैसे: गाभा कीट, केंचुली, माहू)..." : "रोग, लक्षण या दवा बोलें या खोजें (जैसे: तना छेदक, शीथ ब्लाइट, माहू)..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ gap: 0.4 }}>
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: '#94a3b8', p: 0.3 }}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
              <Tooltip title={isVoiceListening ? "सुन रहे हैं... (रोकने हेतु दबाएं)" : "बोलकर खोजें (माइक दबाएं)"}>
                <IconButton
                  size="small"
                  onClick={handleToggleVoiceSearch}
                  sx={{
                    color: isVoiceListening ? '#fff' : '#b91c1c',
                    bgcolor: isVoiceListening ? '#b91c1c' : '#fee2e2',
                    p: 0.6,
                    borderRadius: '8px'
                  }}
                >
                  <MicIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
        sx={{
          mb: 1,
          bgcolor: '#fff',
          borderRadius: '12px',
          '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.82rem' }
        }}
      />

      {/* Clean Crop Selection Pill Strip */}
      <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 0.6, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Chip
          label={isChhattisgarhi ? "🌾 सबो फसल" : "🌾 सभी फसलें"}
          clickable
          size="small"
          onClick={() => setSelectedCrop('all')}
          sx={{
            fontWeight: selectedCrop === 'all' ? 800 : 600,
            fontSize: '0.74rem',
            borderRadius: '20px',
            bgcolor: selectedCrop === 'all' ? '#166534' : '#ffffff',
            color: selectedCrop === 'all' ? '#ffffff' : '#475569',
            border: selectedCrop === 'all' ? '1px solid #166534' : '1px solid #e2e8f0',
            flexShrink: 0
          }}
        />
        {cropsList.map((c) => {
          const isSel = selectedCrop === c.id;
          return (
            <Chip
              key={c.id}
              label={c.name}
              clickable
              size="small"
              onClick={() => setSelectedCrop(c.id)}
              sx={{
                fontWeight: isSel ? 800 : 600,
                fontSize: '0.74rem',
                borderRadius: '20px',
                bgcolor: isSel ? '#166534' : '#ffffff',
                color: isSel ? '#ffffff' : '#475569',
                border: isSel ? '1px solid #166534' : '1px solid #e2e8f0',
                flexShrink: 0
              }}
            />
          );
        })}
      </Box>

      {/* Visual Symptom Filter Strip */}
      <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {VISUAL_SYMPTOMS.map((sym) => {
          const isSel = selectedSymptom === sym.id;
          return (
            <Chip
              key={sym.id}
              icon={<span style={{ fontSize: '12px', marginRight: -2 }}>{sym.icon}</span>}
              label={isChhattisgarhi ? sym.labelCg : sym.label}
              clickable
              size="small"
              onClick={() => setSelectedSymptom(sym.id)}
              sx={{
                fontWeight: isSel ? 800 : 600,
                fontSize: '0.72rem',
                borderRadius: '20px',
                bgcolor: isSel ? '#b91c1c' : '#f8fafc',
                color: isSel ? '#ffffff' : '#475569',
                border: isSel ? '1px solid #b91c1c' : '1px solid #e2e8f0',
                flexShrink: 0
              }}
            />
          );
        })}
      </Box>

      {/* Filtered Disease Pills Strip */}
      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1 }}>
        {filteredDiseases.map((d) => {
          const isActive = activeDisease?.id === d.id;
          return (
            <Chip
              key={d.id}
              label={`${d.cropName}: ${d.diseaseName.split('/')[0].trim()}`}
              clickable
              size="small"
              onClick={() => {
                onSelectDisease(d);
                setTimeout(() => {
                  prescriptionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 80);
              }}
              sx={{
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.74rem',
                borderRadius: '8px',
                bgcolor: isActive ? '#dc2626' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: isActive ? '1px solid #dc2626' : '1px solid #e2e8f0'
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

