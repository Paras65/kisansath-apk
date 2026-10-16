import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  MenuItem,
  IconButton
} from '@mui/material';
import PinDropIcon from '@mui/icons-material/PinDrop';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  const [showPin, setShowPin] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Segmented Tabs */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: inModal ? '#f1f5f9' : '#f0fdf4',
          p: 0.6,
          borderRadius: 3.5,
          mb: 2.2,
          border: '1.5px solid',
          borderColor: inModal ? '#e2e8f0' : '#dcfce7'
        }}
      >
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('register')}
          sx={{
            borderRadius: 2.8,
            fontWeight: 800,
            fontSize: { xs: '0.8rem', sm: '0.86rem' },
            py: 1,
            bgcolor: authMode === 'register' ? '#1b5e20' : 'transparent',
            color: authMode === 'register' ? '#ffffff' : '#475569',
            boxShadow: authMode === 'register' ? '0 4px 12px rgba(27,94,32,0.28)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
            borderRadius: 2.8,
            fontWeight: 800,
            fontSize: { xs: '0.8rem', sm: '0.86rem' },
            py: 1,
            bgcolor: authMode === 'login' ? '#1b5e20' : 'transparent',
            color: authMode === 'login' ? '#ffffff' : '#475569',
            boxShadow: authMode === 'login' ? '0 4px 12px rgba(27,94,32,0.28)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
            value={loginForm.phone || ''}
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
            helperText={(loginForm.phone || '').length === 10 ? (isChhattisgarhi ? '✓ सुरक्छित किसान पहचान' : '✓ सुरक्षित किसान पहचान') : (isChhattisgarhi ? '10 अंक के फोन नंबर लिखव' : '10 अंकों का फोन नंबर दर्ज करें')}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 2. Farmer Name */}
          <TextField
            label={isChhattisgarhi ? 'किसान के नाम (ऐच्छिक)' : 'किसान का नाम (वैकल्पिक)'}
            placeholder={isChhattisgarhi ? 'उदा. रामेश्वर साहू' : 'उदा. रामेश्वर साहू'}
            fullWidth
            size="small"
            value={loginForm.name || ''}
            onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 3. Postal PIN Code */}
          <TextField
            label={isChhattisgarhi ? 'डाक पिन कोड (6 अंक) *' : 'डाक पिन कोड (6 अंक) *'}
            placeholder="उदा. 493441 या 492001"
            fullWidth
            size="small"
            value={loginForm.pincode || ''}
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
                  ✓ {typeof pincodeInfo === 'object' ? `${pincodeInfo.block ? pincodeInfo.block + ', ' : ''}${pincodeInfo.district || ''}` : pincodeInfo} ({(pincodeVillages || []).length} {isChhattisgarhi ? 'गांव मिलिस' : 'गांव उपलब्ध'})
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
          {(pincodeVillages && pincodeVillages.length > 0) && !customVillageMode ? (
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
                    📍 {isChhattisgarhi ? 'पिन कोड ले खोजे गे' : 'पिन कोड द्वारा खोजे गए'} {(pincodeVillages || []).length} {isChhattisgarhi ? 'गांव' : 'गांव'}
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
              {(pincodeVillages || []).map((v) => (
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
              value={loginForm.village || ''}
              onChange={(e) => setLoginForm({ ...loginForm, village: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText={
                (pincodeVillages && pincodeVillages.length > 0) ? (
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
            type={showPin ? 'text' : 'password'}
            fullWidth
            size="small"
            value={loginForm.pin || ''}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPin((prev) => !prev)}
                    edge="end"
                    tabIndex={-1}
                    sx={{ color: '#64748b' }}
                  >
                    {showPin ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
                  {isChhattisgarhi ? 'डिफ़ॉल्ट 1234 • साझा फोन म डेटा सुरक्छित रहिही' : 'डिफ़ॉल्ट 1234 • साझा फोन पर डेटा सुरक्षित रहेगा'}
                </Typography>
                {(loginForm.pin || '') !== '1234' && (
                  <Button
                    size="small"
                    onClick={() => setLoginForm({ ...loginForm, pin: '1234' })}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      fontSize: '0.72rem',
                      textTransform: 'none',
                      color: '#16a34a',
                      fontWeight: 800
                    }}
                  >
                    ⚡ {isChhattisgarhi ? '1234 भरव' : '1234 भरें'}
                  </Button>
                )}
              </Box>
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: '#fff',
                '&:hover fieldset': { borderColor: '#16a34a' },
                '&.Mui-focused fieldset': { borderColor: '#1b5e20', borderWidth: 2 }
              }
            }}
          />

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || (loginForm.phone || '').length < 10}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.8,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.95rem',
              py: 1.25,
              borderRadius: 2.8,
              boxShadow: '0 4px 16px rgba(27,94,32,0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)',
                boxShadow: '0 6px 20px rgba(27,94,32,0.4)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {loginLoading ? <CircularProgress size={22} color="inherit" /> : (isChhattisgarhi ? '🚀 किसान खाता बनाव अऊ शुरू करव' : '🚀 किसान खाता बनाएं और शुरू करें')}
          </Button>

          {/* Switch to Login link */}
          <Box
            sx={{
              textAlign: 'center',
              p: 1.2,
              bgcolor: '#f8fafc',
              borderRadius: 2.5,
              border: '1px solid #e2e8f0',
              mt: 0.5
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mb: 0.3 }}>
              {isChhattisgarhi ? 'पहिलहीं ले खाता हे?' : 'पहले से खाता बना है?'}
            </Typography>
            <Button
              size="small"
              onClick={() => setAuthMode('login')}
              sx={{
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              🔑 {isChhattisgarhi ? 'सीधा लॉगिन करव' : 'सीधे मोबाइल व पिन से लॉगिन करें'} ➔
            </Button>
          </Box>
        </Box>
      ) : (
        /* LOGIN MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Friendly Farmer Reassurance Banner */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
              borderRadius: 3,
              border: '1.5px solid #bbf7d0',
              boxShadow: '0 2px 8px rgba(34, 197, 94, 0.08)'
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#dcfce7',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #86efac'
              }}
            >
              <LockOpenIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.25 }}>
                {isChhattisgarhi ? '🌾 जोहार किसान साथी! सीधा लॉगिन' : '🌾 जोहार किसान साथी! त्वरित लॉगिन'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.72rem', display: 'block', mt: 0.2 }}>
                {isChhattisgarhi ? 'अपन मोबाइल अऊ 4-अंक पिन डारके तुरंत प्रवेश करव।' : 'अपना पंजीकृत मोबाइल व 4-अंक पिन डालकर तुरंत प्रवेश करें।'}
              </Typography>
            </Box>
          </Box>

          {/* 1. Mobile Number */}
          <TextField
            label={isChhattisgarhi ? 'पंजीकृत मोबाइल नंबर (10 अंक) *' : 'पंजीकृत मोबाइल नंबर (10 अंक) *'}
            placeholder="98765 43210"
            fullWidth
            size="small"
            autoFocus
            value={loginForm.phone || ''}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.9,
                      py: 0.3,
                      borderRadius: 1.5,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              ),
              endAdornment: (loginForm.phone || '').length === 10 ? (
                <InputAdornment position="end">
                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                </InputAdornment>
              ) : null
            }}
            helperText={
              (loginForm.phone || '').length === 10 ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 700 }}>
                  ✓ {isChhattisgarhi ? '10 अंक मोबाइल नंबर सही हे' : '10 अंकों का मोबाइल नंबर मान्य'}
                </Box>
              ) : (
                isChhattisgarhi ? 'जे नंबर ले पहिले पंजीयन करे रहेव' : 'जिस नंबर से पहले पंजीयन किया था'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: '#fff',
                '&:hover fieldset': { borderColor: '#16a34a' },
                '&.Mui-focused fieldset': { borderColor: '#1b5e20', borderWidth: 2 }
              }
            }}
          />

          {/* 2. Security PIN */}
          <TextField
            label={isChhattisgarhi ? 'सुरक्छा पिन (4 अंक) *' : 'सुरक्षा पिन (4 अंक) *'}
            placeholder="1234"
            type={showPin ? 'text' : 'password'}
            fullWidth
            size="small"
            value={loginForm.pin || ''}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPin((prev) => !prev)}
                    edge="end"
                    tabIndex={-1}
                    sx={{ color: '#64748b' }}
                  >
                    {showPin ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText={
              <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
                  {isChhattisgarhi ? 'डिफ़ॉल्ट पिन: 1234' : 'डिफ़ॉल्ट पिन: 1234'}
                </Typography>
                {(loginForm.pin || '') !== '1234' && (
                  <Button
                    size="small"
                    onClick={() => setLoginForm({ ...loginForm, pin: '1234' })}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      fontSize: '0.72rem',
                      textTransform: 'none',
                      color: '#16a34a',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.3
                    }}
                  >
                    ⚡ {isChhattisgarhi ? '1234 भरव' : '1234 भरें'}
                  </Button>
                )}
              </Box>
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: '#fff',
                '&:hover fieldset': { borderColor: '#16a34a' },
                '&.Mui-focused fieldset': { borderColor: '#1b5e20', borderWidth: 2 }
              }
            }}
          />

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || (loginForm.phone || '').length < 10 || (loginForm.pin || '').length < 4}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.95rem',
              py: 1.25,
              borderRadius: 2.8,
              boxShadow: '0 4px 16px rgba(27,94,32,0.32)',
              letterSpacing: '0.2px',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)',
                boxShadow: '0 6px 20px rgba(27,94,32,0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {loginLoading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              isChhattisgarhi ? '🔑 किसान खाता म प्रवेश करव' : '🔑 किसान खाते में प्रवेश करें'
            )}
          </Button>

          {/* Switch to Register */}
          <Box
            sx={{
              textAlign: 'center',
              p: 1.2,
              bgcolor: '#f8fafc',
              borderRadius: 2.5,
              border: '1px solid #e2e8f0'
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mb: 0.3 }}>
              {isChhattisgarhi ? 'पहिली बार आय हव?' : 'पहली बार आए हैं?'}
            </Typography>
            <Button
              size="small"
              onClick={() => setAuthMode('register')}
              sx={{
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              🌾 {isChhattisgarhi ? 'नवा किसान खाता बनाव (1 मिनट)' : 'नया किसान खाता बनाएं (केवल 1 मिनट)'} ➔
            </Button>
          </Box>
        </Box>
      )}

      {/* Trust & Safety Footer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mt: 2,
          p: 1,
          bgcolor: '#f8fafc',
          borderRadius: 2.5,
          border: '1px dashed #cbd5e1'
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
          {isChhattisgarhi
            ? '🔒 कोनो कागजात नई चाही • 100% सुरक्छित • किसान कॉल सेंटर: 1800-180-1551'
            : '🔒 शून्य-कागजात • 100% सुरक्षित डेटा • किसान टोल-फ्री: 1800-180-1551'}
        </Typography>
      </Box>
    </Box>
  );
};

