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
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import KeyIcon from '@mui/icons-material/Key';

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
      {/* ── 1. Luxury Segmented Mode Switcher Tabs ── */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: inModal ? '#f1f5f9' : '#f0fdf4',
          p: 0.7,
          borderRadius: 3.5,
          mb: 2.5,
          border: '1.5px solid',
          borderColor: inModal ? '#e2e8f0' : '#dcfce7',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
        }}
      >
        <Button
          fullWidth
          size="medium"
          onClick={() => setAuthMode('register')}
          startIcon={<span>🌾</span>}
          sx={{
            borderRadius: 2.8,
            fontWeight: 900,
            fontSize: { xs: '0.82rem', sm: '0.88rem' },
            py: 1.1,
            background: authMode === 'register' ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' : 'transparent',
            color: authMode === 'register' ? '#ffffff' : '#64748b',
            boxShadow: authMode === 'register' ? '0 4px 14px rgba(27,94,32,0.3)' : 'none',
            textTransform: 'none',
            letterSpacing: '0.2px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              background: authMode === 'register' ? 'linear-gradient(135deg, #14532d 0%, #1b5e20 100%)' : '#e2e8f0'
            }
          }}
        >
          {isChhattisgarhi ? 'नवा किसान पंजीयन' : 'नया किसान पंजीयन'}
        </Button>
        <Button
          fullWidth
          size="medium"
          onClick={() => setAuthMode('login')}
          startIcon={<KeyIcon sx={{ fontSize: '18px !important' }} />}
          sx={{
            borderRadius: 2.8,
            fontWeight: 900,
            fontSize: { xs: '0.82rem', sm: '0.88rem' },
            py: 1.1,
            background: authMode === 'login' ? 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' : 'transparent',
            color: authMode === 'login' ? '#ffffff' : '#64748b',
            boxShadow: authMode === 'login' ? '0 4px 14px rgba(27,94,32,0.3)' : 'none',
            textTransform: 'none',
            letterSpacing: '0.2px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              background: authMode === 'login' ? 'linear-gradient(135deg, #14532d 0%, #1b5e20 100%)' : '#e2e8f0'
            }
          }}
        >
          {isChhattisgarhi ? 'सीधा लॉगिन' : 'सीधा लॉगिन'}
        </Button>
      </Box>

      {authMode === 'register' ? (
        /* ═══════════════════════════════════════════════════════
           REGISTER MODE (स्मार्ट 1-मिनट नया किसान पंजीयन)
           ═══════════════════════════════════════════════════════ */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          {/* Smart Pincode Auto-Discovery Reassurance Banner */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              p: 1.4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1.5px solid #a7f3d0',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid #86efac'
              }}
            >
              <PinDropIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 900, fontSize: '0.84rem', lineHeight: 1.25 }}>
                {isChhattisgarhi ? '⚡ 1-मिनट नवा किसान खाता (100% सुरक्छित)' : '⚡ 1-मिनट नया किसान खाता (100% सुरक्षित)'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#047857', fontWeight: 700, fontSize: '0.72rem', display: 'block', mt: 0.2 }}>
                {isChhattisgarhi
                  ? '6-अंक डाक पिन कोड डारव — तुंहर गांव के सूची अपने-आप आ जही।'
                  : 'डाक पिन कोड डालते ही आपके क्षेत्र के सभी गांव स्वतः आ जाएंगे।'}
              </Typography>
            </Box>
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
                      px: 1,
                      py: 0.35,
                      borderRadius: 1.5,
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </Box>
                </InputAdornment>
              ),
              endAdornment: (loginForm.phone || '').length === 10 ? (
                <InputAdornment position="end">
                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                </InputAdornment>
              ) : null
            }}
            helperText={
              (loginForm.phone || '').length === 10 ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 800 }}>
                  ✓ {isChhattisgarhi ? '10 अंक मोबाइल नंबर सही हे' : '10 अंकों का मान्य मोबाइल नंबर'}
                </Box>
              ) : (
                isChhattisgarhi ? '10 अंक के किसान मोबाइल नंबर लिखव' : '10 अंकों का किसान मोबाइल नंबर दर्ज करें'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.8,
                bgcolor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                '&:hover fieldset': { borderColor: '#10b981' },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.12)'
                }
              }
            }}
          />

          {/* 2. Farmer Name */}
          <TextField
            label={isChhattisgarhi ? 'किसान के नाम (ऐच्छिक)' : 'किसान का नाम (पहचान हेतु / वैकल्पिक)'}
            placeholder={isChhattisgarhi ? 'उदा. रामेश्वर साहू' : 'उदा. रामेश्वर साहू'}
            fullWidth
            size="small"
            value={loginForm.name || ''}
            onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#64748b', fontSize: 20 }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.8,
                bgcolor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                '&:hover fieldset': { borderColor: '#10b981' },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.12)'
                }
              }
            }}
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
                    <CircularProgress size={20} sx={{ color: '#16a34a' }} />
                  ) : pincodeInfo ? (
                    <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                  ) : (
                    <PinDropIcon sx={{ color: '#64748b', fontSize: 20 }} />
                  )}
                </InputAdornment>
              )
            }}
            helperText={
              pincodeLoading ? (
                isChhattisgarhi ? '🔍 डाक विभाग ले गांव खोजत हन...' : '🔍 डाक विभाग (India Post) से गांव खोज रहे हैं...'
              ) : pincodeInfo ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 800 }}>
                  ✓ {typeof pincodeInfo === 'object' ? `${pincodeInfo.block ? pincodeInfo.block + ', ' : ''}${pincodeInfo.district || ''}` : pincodeInfo} ({(pincodeVillages || []).length} {isChhattisgarhi ? 'गांव मिलिस' : 'गांव उपलब्ध'})
                </Box>
              ) : (
                isChhattisgarhi ? 'पिन कोड डारतेच गांव के सूची अपने-आप खुल जाही' : 'पिन कोड डालते ही गांव सूची स्वतः खुलेगी'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.8,
                bgcolor: pincodeInfo ? '#f0fdf4' : '#ffffff',
                border: '1.5px solid #cbd5e1',
                '&:hover fieldset': { borderColor: '#10b981' },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.12)'
                }
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.8,
                  bgcolor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  '&:hover fieldset': { borderColor: '#10b981' },
                  '&.Mui-focused fieldset': { borderColor: '#16a34a', borderWidth: 2 }
                }
              }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                  <Typography component="span" variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                    📍 {isChhattisgarhi ? 'पिन कोड ले खोजे गे' : 'पिन कोड द्वारा खोजे गए'} {(pincodeVillages || []).length} {isChhattisgarhi ? 'गांव' : 'गांव'}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setCustomVillageMode(true);
                      setLoginForm({ ...loginForm, village: '' });
                    }}
                    sx={{ p: 0, minWidth: 'auto', fontSize: '0.72rem', textTransform: 'none', color: '#0284c7', fontWeight: 800 }}
                  >
                    {isChhattisgarhi ? '✏️ दूसरा गांव लिखव' : '✏️ दूसरा गांव लिखें'}
                  </Button>
                </Box>
              }
            >
              {(pincodeVillages || []).map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: '0.86rem', fontWeight: 600 }}>
                  🏡 {v}
                </MenuItem>
              ))}
              <MenuItem value="__CUSTOM__" sx={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 800, borderTop: '1px dashed #cbd5e1' }}>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.8,
                  bgcolor: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  '&:hover fieldset': { borderColor: '#10b981' },
                  '&.Mui-focused fieldset': { borderColor: '#16a34a', borderWidth: 2 }
                }
              }}
              helperText={
                (pincodeVillages && pincodeVillages.length > 0) ? (
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.3 }}>
                    <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
                      {isChhattisgarhi ? 'हाथ ले नाम लिखव' : 'हाथ से नाम दर्ज करें'}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setCustomVillageMode(false)}
                      sx={{ p: 0, minWidth: 'auto', fontSize: '0.72rem', textTransform: 'none', color: '#16a34a', fontWeight: 800 }}
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
                  {isChhattisgarhi ? 'डिफ़ॉल्ट 1234 • साझा फोन म डेटा सुरक्छित' : 'डिफ़ॉल्ट 1234 • साझा फोन पर डेटा सुरक्षित रहेगा'}
                </Typography>
                {(loginForm.pin || '') !== '1234' && (
                  <Button
                    size="small"
                    onClick={() => setLoginForm({ ...loginForm, pin: '1234' })}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      color: '#b45309',
                      bgcolor: '#fef3c7',
                      px: 0.9,
                      py: 0.2,
                      borderRadius: 1.5,
                      border: '1px solid #fde68a',
                      fontWeight: 900
                    }}
                  >
                    ⚡ {isChhattisgarhi ? '1234 भरव' : '1234 भरें'}
                  </Button>
                )}
              </Box>
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.8,
                bgcolor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                '&:hover fieldset': { borderColor: '#10b981' },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.12)'
                }
              }
            }}
          />

          {/* Primary Submit Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || (loginForm.phone || '').length < 10}
            onClick={handleQuickLoginSubmit}
            startIcon={loginLoading ? null : <RocketLaunchIcon sx={{ fontSize: 20 }} />}
            sx={{
              mt: 0.6,
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #15803d 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.98rem',
              py: 1.35,
              borderRadius: 3.2,
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
              textTransform: 'none',
              letterSpacing: '0.3px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
                boxShadow: '0 10px 28px rgba(22, 163, 74, 0.45)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(1px)'
              }
            }}
          >
            {loginLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isChhattisgarhi ? '🚀 किसान खाता बनाव अऊ शुरू करव' : '🚀 किसान खाता बनाएं और शुरू करें'
            )}
          </Button>

          {/* Switch to Login Link Card */}
          <Box
            sx={{
              textAlign: 'center',
              p: 1.2,
              bgcolor: '#f8fafc',
              borderRadius: 2.8,
              border: '1px solid #e2e8f0',
              mt: 0.2
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
                fontWeight: 900,
                fontSize: '0.82rem',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
              }}
            >
              🔑 {isChhattisgarhi ? 'सीधे मोबाइल व पिन ले लॉगिन करव' : 'सीधे मोबाइल व पिन से लॉगिन करें'} ➔
            </Button>
          </Box>
        </Box>
      ) : (
        /* ═══════════════════════════════════════════════════════
           LOGIN MODE (त्वरित सीधा किसान लॉगिन)
           ═══════════════════════════════════════════════════════ */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Friendly Farmer Reassurance Banner */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              borderRadius: 3,
              border: '1.5px solid #a7f3d0',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1.5px solid #86efac'
              }}
            >
              <LockOpenIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.25 }}>
                {isChhattisgarhi ? '🌾 जोहार किसान साथी! त्वरित लॉगिन' : '🌾 जोहार किसान साथी! त्वरित लॉगिन'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#047857', fontWeight: 700, fontSize: '0.74rem', display: 'block', mt: 0.3 }}>
                {isChhattisgarhi
                  ? 'अपन मोबाइल अऊ 4-अंक पिन डारके तुरंत अपन पासबुक खोलव।'
                  : 'अपना पंजीकृत मोबाइल व 4-अंक पिन डालकर तुरंत पासबुक खोलें।'}
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
                      px: 1,
                      py: 0.35,
                      borderRadius: 1.5,
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </Box>
                </InputAdornment>
              ),
              endAdornment: (loginForm.phone || '').length === 10 ? (
                <InputAdornment position="end">
                  <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 22 }} />
                </InputAdornment>
              ) : null
            }}
            helperText={
              (loginForm.phone || '').length === 10 ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 800 }}>
                  ✓ {isChhattisgarhi ? '10 अंक मोबाइल नंबर मान्य हे' : '10 अंकों का मान्य मोबाइल नंबर'}
                </Box>
              ) : (
                isChhattisgarhi ? 'जे नंबर ले पहिले पंजीयन करे रहेव' : 'जिस नंबर से पहले पंजीयन किया था'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.8,
                bgcolor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                '&:hover fieldset': { borderColor: '#10b981' },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.12)'
                }
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
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      color: '#b45309',
                      bgcolor: '#fef3c7',
                      px: 0.9,
                      py: 0.2,
                      borderRadius: 1.5,
                      border: '1px solid #fde68a',
                      fontWeight: 900
                    }}
                  >
                    ⚡ {isChhattisgarhi ? '1234 भरव' : '1234 भरें'}
                  </Button>
                )}
              </Box>
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.8,
                bgcolor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                '&:hover fieldset': { borderColor: '#10b981' },
                '&.Mui-focused fieldset': {
                  borderColor: '#16a34a',
                  borderWidth: 2,
                  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.12)'
                }
              }
            }}
          />

          {/* Primary Login Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || (loginForm.phone || '').length < 10 || (loginForm.pin || '').length < 4}
            onClick={handleQuickLoginSubmit}
            startIcon={loginLoading ? null : <KeyIcon sx={{ fontSize: 20 }} />}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #15803d 100%)',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.98rem',
              py: 1.35,
              borderRadius: 3.2,
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.35)',
              textTransform: 'none',
              letterSpacing: '0.3px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
                boxShadow: '0 10px 28px rgba(22, 163, 74, 0.45)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(1px)'
              },
              '&:disabled': {
                bgcolor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {loginLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              isChhattisgarhi ? '🔑 किसान खाता म प्रवेश करव' : '🔑 किसान खाते में प्रवेश करें'
            )}
          </Button>

          {/* Switch to Register Link Card */}
          <Box
            sx={{
              textAlign: 'center',
              p: 1.2,
              bgcolor: '#f8fafc',
              borderRadius: 2.8,
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
                fontWeight: 900,
                fontSize: '0.82rem',
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

      {/* ── 3. Official Security & Zero-Paperwork Trust Certificate Footer ── */}
      <Box
        sx={{
          mt: 2.5,
          p: 1.4,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)',
          borderRadius: 3,
          border: '1.5px solid #bbf7d0',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
          <ShieldIcon sx={{ fontSize: 18, color: '#16a34a' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#166534', fontSize: '0.78rem' }}>
            {isChhattisgarhi ? '🔒 100% सुरक्छित • शून्य कागजात गारंटी' : '🔒 100% सुरक्षित • शून्य-कागज़ात गारंटी'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
          <span>✓ कोई खसरा नंबर नहीं चाहिए</span>
          <span>•</span>
          <span>✓ क्लाउड ऑटो सिंक</span>
          <span>•</span>
          <span>📞 टोल-फ्री: 1800-180-1551</span>
        </Box>
      </Box>
    </Box>
  );
};
