import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  MenuItem
} from '@mui/material';
import PinDropIcon from '@mui/icons-material/PinDrop';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const SmartAuthCard = ({
  authMode = 'register',
  setAuthMode = () => {},
  loginForm = {},
  setLoginForm = () => {},
  loginLoading = false,
  handleQuickLoginSubmit = () => {},
  handlePincodeChange = () => {},
  pincodeLoading = false,
  pincodeVillages = [],
  pincodeInfo = null,
  customVillageMode = false,
  setCustomVillageMode = () => {},
  isChhattisgarhi = false,
  inModal = false
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Segmented Tabs */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: inModal ? '#f1f5f9' : '#f0fdf4',
          p: 0.5,
          borderRadius: 3,
          mb: 2,
          border: '1px solid #dcfce7'
        }}
      >
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('register')}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: '0.78rem', sm: '0.84rem' },
            py: 0.9,
            bgcolor: authMode === 'register' ? '#1b5e20' : 'transparent',
            color: authMode === 'register' ? '#ffffff' : '#334155',
            boxShadow: authMode === 'register' ? '0 3px 10px rgba(27,94,32,0.25)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: authMode === 'register' ? '#125420' : '#e2e8f0'
            }
          }}
        >
          {isChhattisgarhi ? '🌾 नवा किसान पंजीयन' : '🌾 नया किसान पंजीयन'}
        </Button>
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('login')}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: '0.78rem', sm: '0.84rem' },
            py: 0.9,
            bgcolor: authMode === 'login' ? '#1b5e20' : 'transparent',
            color: authMode === 'login' ? '#ffffff' : '#334155',
            boxShadow: authMode === 'login' ? '0 3px 10px rgba(27,94,32,0.25)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: authMode === 'login' ? '#125420' : '#e2e8f0'
            }
          }}
        >
          🔑 सीधा लॉगिन
        </Button>
      </Box>

      {authMode === 'register' ? (
        /* REGISTER MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: '#ecfdf5',
              borderRadius: 2,
              border: '1px solid #a7f3d0'
            }}
          >
            <PinDropIcon sx={{ color: '#059669', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>
              {isChhattisgarhi ? '⚡ <strong>सुविधा:</strong> 6-अंक पिन कोड डारते ही तुंहर इलाका के सबो गांव के सूची तुरंत आ जही।' : '⚡ <strong>स्मार्ट सुविधा:</strong> 6-अंक पिन कोड डालते ही आपके क्षेत्र के सभी गांव की सूची तुरंत आ जाएगी।'}
            </Typography>
          </Box>

          {/* 1. Mobile Number */}
          <TextField
            label={isChhattisgarhi ? 'मोबाइल नंबर (10 अंक) *' : 'मोबाइल नंबर (10 अंक) *'}
            placeholder="98765 43210"
            fullWidth
            size="small"
            value={loginForm.phone}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#334155',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              )
            }}
            helperText={loginForm.phone.length === 10 ? (isChhattisgarhi ? '✓ सुरक्छित किसान पहचान' : '✓ सुरक्षित किसान पहचान') : (isChhattisgarhi ? '10 अंक के फोन नंबर लिखव' : '10 अंकों का फोन नंबर दर्ज करें')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 2. Farmer Name */}
          <TextField
            label={isChhattisgarhi ? 'किसान के नाम (ऐच्छिक)' : 'किसान का नाम (वैकल्पिक)'}
            placeholder={isChhattisgarhi ? 'उदा. रामेश्वर साहू' : 'उदा. रामेश्वर साहू'}
            fullWidth
            size="small"
            value={loginForm.name}
            onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 3. Postal PIN Code */}
          <TextField
            label={isChhattisgarhi ? 'डाक पिन कोड (6 अंक) *' : 'डाक पिन कोड (6 अंक) *'}
            placeholder="उदा. 493441 या 492001"
            fullWidth
            size="small"
            value={loginForm.pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {pincodeLoading ? (
                    <CircularProgress size={18} sx={{ color: '#2e7d32' }} />
                  ) : pincodeInfo ? (
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  ) : (
                    <PinDropIcon sx={{ color: '#64748b', fontSize: 20 }} />
                  )}
                </InputAdornment>
              )
            }}
            helperText={
              pincodeLoading ? (
                isChhattisgarhi ? '🔍 डाक विभाग ले गांव खोजत हन...' : '🔍 डाक विभाग से गांव खोज रहे हैं...'
              ) : pincodeInfo ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 700 }}>
                  ✓ {pincodeInfo.block ? pincodeInfo.block + ', ' : ''}{pincodeInfo.district || ''} ({pincodeVillages.length} {isChhattisgarhi ? 'गांव मिलिस' : 'गांव उपलब्ध'})
                </Box>
              ) : (
                isChhattisgarhi ? 'पिन कोड डारतेच गांव के सूची अपने-आप खुल जाही' : 'पिन कोड डालते ही गांव सूची स्वतः खुलेगी'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: pincodeInfo ? '#f0fdf4' : 'inherit'
              }
            }}
          />

          {/* 4. Village Selection */}
          {pincodeVillages.length > 0 && !customVillageMode ? (
            <TextField
              select
              label={isChhattisgarhi ? 'अपन गांव चुनव *' : 'अपना गांव चुनें *'}
              fullWidth
              size="small"
              value={loginForm.village || (pincodeVillages[0] || '')}
              onChange={(e) => {
                if (e.target.value === '__CUSTOM__') {
                  setCustomVillageMode(true);
                  setLoginForm({ ...loginForm, village: '' });
                } else {
                  setLoginForm({ ...loginForm, village: e.target.value });
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                  <Typography component="span" variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    📍 {isChhattisgarhi ? 'पिन कोड ले खोजे गे' : 'पिन कोड द्वारा खोजे गए'} {pincodeVillages.length} {isChhattisgarhi ? 'गांव' : 'गांव'}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setCustomVillageMode(true);
                      setLoginForm({ ...loginForm, village: '' });
                    }}
                    sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1565c0', fontWeight: 700 }}
                  >
                    {isChhattisgarhi ? '✏️ दूसरा गांव लिखव' : '✏️ दूसरा गांव लिखें'}
                  </Button>
                </Box>
              }
            >
              {pincodeVillages.map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: '0.85rem' }}>
                  🏡 {v}
                </MenuItem>
              ))}
              <MenuItem value="__CUSTOM__" sx={{ fontSize: '0.82rem', color: '#1565c0', fontWeight: 700, borderTop: '1px dashed #cbd5e1' }}>
                {isChhattisgarhi ? '✏️ सूची म नइये? नवा नाम लिखव...' : '✏️ सूची में नहीं है? नया नाम लिखें...'}
              </MenuItem>
            </TextField>
          ) : (
            <TextField
              label={isChhattisgarhi ? 'गांव / ब्लॉक के नाम *' : 'गांव / ब्लॉक का नाम *'}
              placeholder="उदा. आरंग"
              fullWidth
              size="small"
              value={loginForm.village}
              onChange={(e) => setLoginForm({ ...loginForm, village: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText={
                pincodeVillages.length > 0 ? (
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                    <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
                      {isChhattisgarhi ? 'हाथ ले नाम लिखव' : 'हाथ से नाम दर्ज करें'}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setCustomVillageMode(false)}
                      sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1b5e20', fontWeight: 700 }}
                    >
                      {isChhattisgarhi ? '📋 पिन कोड सूची देखव' : '📋 पिन कोड सूची देखें'} ({pincodeVillages.length})
                    </Button>
                  </Box>
                ) : (isChhattisgarhi ? 'पिन कोड डारहू त सूची अपने-आप आ जाही या नाम लिखव' : 'पिन कोड डालें तो सूची अपने आप आ जाएगी या नाम लिखें')
              }
            />
          )}

          {/* 5. Security PIN */}
          <TextField
            label={isChhattisgarhi ? 'सुरक्छा पिन (4 अंक) *' : 'सुरक्षा पिन (4 अंक) *'}
            placeholder="1234"
            type="password"
            fullWidth
            size="small"
            value={loginForm.pin}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            helperText={isChhattisgarhi ? 'डिफ़ॉल्ट 1234 • साझा फोन म तुंहर डेटा सुरक्छित रहिही' : 'डिफ़ॉल्ट 1234 • साझा फोन पर आपका डेटा सुरक्षित रहेगा'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || loginForm.phone.length < 10}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)' }
            }}
          >
            {loginLoading ? <CircularProgress size={20} color="inherit" /> : (isChhattisgarhi ? '🚀 किसान खाता बनाव अऊ शुरू करव' : '🚀 किसान खाता बनाएं और शुरू करें')}
          </Button>
        </Box>
      ) : (
        /* LOGIN MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: '#eff6ff',
              borderRadius: 2,
              border: '1px solid #bfdbfe'
            }}
          >
            <LockOpenIcon sx={{ color: '#1d4ed8', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>
              🔑 <strong>{isChhattisgarhi ? 'तुरंत लॉगिन:' : 'त्वरित लॉगिन:'}</strong> {isChhattisgarhi ? 'पहिलहीं ले पंजीकृत किसान सीधा मोबाइल अऊ 4-अंक पिन डारके तुरंत प्रवेश करव।' : 'पहले से पंजीकृत किसान सीधे मोबाइल व 4-अंक पिन डालकर तुरंत प्रवेश करें।'}
            </Typography>
          </Box>

          <TextField
            label={isChhattisgarhi ? 'पंजीकृत मोबाइल नंबर (10 अंक) *' : 'पंजीकृत मोबाइल नंबर (10 अंक) *'}
            placeholder="98765 43210"
            fullWidth
            size="small"
            autoFocus
            value={loginForm.phone}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#334155',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              )
            }}
            helperText={isChhattisgarhi ? 'जे नंबर ले पहिले पंजीयन करे रहेव' : 'जिस नंबर से पहले पंजीयन किया था'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label={isChhattisgarhi ? 'सुरक्छा पिन (4 अंक) *' : 'सुरक्षा पिन (4 अंक) *'}
            placeholder="1234"
            type="password"
            fullWidth
            size="small"
            value={loginForm.pin}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            helperText={isChhattisgarhi ? 'डिफ़ॉल्ट पिन 1234 (यदि नइ बदले रहेव)' : 'डिफ़ॉल्ट पिन 1234 (यदि नहीं बदला था)'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || loginForm.phone.length < 10 || loginForm.pin.length < 4}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)' }
            }}
          >
            {loginLoading ? <CircularProgress size={20} color="inherit" /> : (isChhattisgarhi ? '🔑 किसान खाता म प्रवेश करव' : '🔑 किसान खाते में प्रवेश करें')}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 0.5 }}>
            <Button
              size="small"
              onClick={() => setAuthMode('register')}
              sx={{ color: '#166534', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
            >
              {isChhattisgarhi ? '🌾 नवां किसान खाता खोलना चाहत हव? इहां पंजीयन करव' : '🌾 नया किसान खाता खोलना चाहते हैं? यहां पंजीयन करें'}
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.5, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
        <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
          {isChhattisgarhi ? 'कोनो कागजात नई चाही • 100% सुरक्छित डेटा • किसान कॉल सेंटर: 1800-180-1551' : 'शून्य-कागजात • 100% सुरक्षित डेटा • टोल-फ्री: 1800-180-1551'}
        </Typography>
      </Box>
    </Box>
  );
};

