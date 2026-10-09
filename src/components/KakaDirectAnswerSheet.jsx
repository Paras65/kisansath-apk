import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MicIcon from '@mui/icons-material/Mic';
import { speakText, stopSpeech } from '../utils/speech';
import { openNativeWhatsApp } from '../utils/capacitorUtils';
import { notify } from '../services/notificationService';

/**
 * 👴🏻 KakaDirectAnswerSheet — काका का सीधा जवाब बॉटमशीट
 * 
 * Revolutionary Conversational AI Experience for Rural & Illiterate Farmers:
 * - Zero Navigation Shock: Never throws user into unfamiliar tabs or scrolls
 * - Direct bold visual answers (bags, rupees, quintals, medicines, weather)
 * - Multi-turn Slot-filling prompt with 1-tap quick chips & voice continuation
 * - 1-Tap WhatsApp sharing for village groups & family
 * - Optional deep-link if farmer explicitly chooses to inspect full table
 */
export const KakaDirectAnswerSheet = ({
  open,
  onClose,
  answer, // Structured answer object from queryKakaBrain
  isSpeaking,
  onSuggestionClick,
  onStartVoice,
  onDeepLink,
  isChhattisgarhi = false,
}) => {
  if (!answer) return null;

  const spokenText = isChhattisgarhi ? (answer.spokenCg || answer.spokenHi) : (answer.spokenHi || answer.spokenCg);
  const headline = isChhattisgarhi ? (answer.headlineCg || answer.headline) : answer.headline;
  const advisory = isChhattisgarhi ? (answer.advisoryTextCg || answer.advisoryText) : answer.advisoryText;

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    } else if (spokenText) {
      speakText(spokenText);
    }
  };

  const handleWhatsAppShare = () => {
    const textToShare = answer.whatsappShareText || `${headline}\n\n${advisory || ''}\n\n🌾 किसान साथी ऐप द्वारा प्रमाणित`;
    openNativeWhatsApp(textToShare);
    notify.success(isChhattisgarhi ? 'व्हाट्सएप म शेयर करे बर तैयार' : 'व्हाट्सएप पर साझा करने हेतु तैयार');
  };

  return (
    <Dialog
      open={Boolean(open && answer)}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      sx={{
        zIndex: 1400,
        '& .MuiDialog-container': {
          alignItems: { xs: 'flex-end', sm: 'center' },
          justifyContent: 'center',
        },
      }}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: '450px' },
          maxHeight: { xs: '85vh', sm: '80vh' },
          borderRadius: { xs: '24px 24px 0 0', sm: '24px' },
          boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        },
      }}
    >
      {/* 1. Header: Pull Handle & Clean Persona Bar */}
      <Box sx={{ pt: 1.2, pb: 1, px: 2, bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <Box sx={{ width: 36, height: 4, bgcolor: '#cbd5e1', borderRadius: 2, mx: 'auto', mb: 1.2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              component="img"
              src={isSpeaking ? '/icons/kaka-speaking.png' : '/icons/kaka-idle.png'}
              onError={(e) => { e.currentTarget.src = isSpeaking ? '/icons/kaka-speaking-cg.png' : '/icons/kaka-idle-cg.png'; }}
              alt="बहिरा काका"
              sx={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                bgcolor: '#f8fafc',
                border: isSpeaking ? '2px solid #eab308' : '1.5px solid #e2e8f0',
                objectFit: 'cover',
                transition: 'all 0.2s ease',
              }}
            />
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.2 }}>
                👴🏻 {isChhattisgarhi ? 'काका के सीधा जवाब' : 'काका का सीधा जवाब'}
              </Typography>
              <Typography variant="caption" sx={{ color: isSpeaking ? '#ca8a04' : '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>
                {isSpeaking ? (isChhattisgarhi ? '📢 काका बोलत हे...' : '📢 काका बोल रहे हैं...') : (isChhattisgarhi ? 'उत्तर तैयार हे' : 'उत्तर तैयार है')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleToggleSpeech}
              sx={{
                bgcolor: isSpeaking ? '#fee2e2' : '#f0fdf4',
                color: isSpeaking ? '#dc2626' : '#16a34a',
                p: 0.8,
                '&:hover': { bgcolor: isSpeaking ? '#fecaca' : '#dcfce7' },
              }}
              aria-label={isSpeaking ? 'रोकें' : 'सुनें'}
            >
              {isSpeaking ? <StopIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: '#64748b', p: 0.8 }} aria-label="close">
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* 2. Main Content Body - Neat & Breathable */}
      <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#ffffff' }}>
        {/* Answer Hero: Clean Question & Headline */}
        <Box sx={{ mb: 2 }}>
          {answer.queryEcho && (
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', fontWeight: 600, display: 'block', mb: 0.3 }}>
              🗣️ "{answer.queryEcho}"
            </Typography>
          )}
          <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.35 }}>
            {answer.icon ? `${answer.icon} ` : ''}{headline}
          </Typography>
        </Box>

        {/* AI Agricultural Expert Loading State */}
        {answer.isLoadingAiExpert ? (
          <Box
            sx={{
              py: 3.5,
              px: 2,
              mb: 2,
              borderRadius: 3,
              bgcolor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 1.5,
            }}
          >
            <CircularProgress size={38} sx={{ color: '#16a34a' }} thickness={4} />
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', mb: 0.3 }}>
                {headline || (isChhattisgarhi ? 'काका सोचत हे…' : 'काका सोच रहे हैं…')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 500 }}>
                {advisory || (isChhattisgarhi ? 'वैज्ञानिक सलाह लोड होवत हे...' : 'वैज्ञानिक सलाह लोड हो रही है...')}
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {/* Structured KPI Stats Panel - Neat, Clean, Borderless */}
            {answer.cards && answer.cards.length > 0 && (
              <Box
                sx={{
                  p: 1.8,
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: answer.cards.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                  gap: 1.5,
                }}
              >
                {answer.cards.map((card, idx) => (
                  <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{card.icon}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.74rem' }}>
                        {card.label}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900, color: card.color || '#0f172a', fontSize: '1.2rem', lineHeight: 1.2 }}>
                      {card.value}
                    </Typography>
                    {card.sub && (
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 600 }}>
                        {card.sub}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Advisory / Practical Recommendation */}
            {advisory && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2.5,
                  bgcolor: '#fffbeb',
                  border: '1px solid #fef08a',
                }}
              >
                <Typography sx={{ color: '#854d0e', fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.45 }}>
                  💡 {advisory}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Missing Slot Prompt (Multi-turn Slot Collector - Only when needed) */}
        {answer.needsClarification && (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 2.5, bgcolor: '#eff6ff', border: '1px dashed #93c5fd' }}>
            <Typography sx={{ fontWeight: 700, color: '#1e40af', fontSize: '0.82rem', mb: 1 }}>
              ❓ {isChhattisgarhi ? 'नीचे छूव या बोलव:' : 'नीचे चुनें या बोलें:'}
            </Typography>

            {answer.slotSuggestions && answer.slotSuggestions.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.2 }}>
                {answer.slotSuggestions.map((suggestion, sIdx) => (
                  <Chip
                    key={sIdx}
                    label={suggestion}
                    onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      py: 1.8,
                      bgcolor: '#ffffff',
                      border: '1px solid #3b82f6',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#dbeafe' },
                    }}
                  />
                ))}
              </Box>
            )}

            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<MicIcon sx={{ fontSize: 18 }} />}
              onClick={onStartVoice}
              sx={{
                color: '#1d4ed8',
                borderColor: '#93c5fd',
                fontWeight: 700,
                fontSize: '0.8rem',
                borderRadius: 2,
                py: 0.7,
                textTransform: 'none',
              }}
            >
              {isChhattisgarhi ? '🎤 मुँह ले बोलके बताव' : '🎤 बोलकर बताएं'}
            </Button>
          </Box>
        )}

        {/* 3. Action Bar: Clean, Single Primary Action + Quiet Secondary Links */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<WhatsAppIcon sx={{ fontSize: 20 }} />}
            onClick={handleWhatsAppShare}
            sx={{
              bgcolor: '#16a34a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: '#15803d', boxShadow: 'none' },
            }}
          >
            {isChhattisgarhi ? 'व्हाट्सएप म शेयर करव' : 'व्हाट्सएप पर साझा करें'}
          </Button>

          {/* Optional Deep Link (Clean text button) */}
          {answer.deepLink && (
            <Button
              fullWidth
              variant="text"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onClose();
                if (onDeepLink) onDeepLink(answer.deepLink);
              }}
              sx={{
                color: '#166534',
                fontWeight: 700,
                fontSize: '0.8rem',
                py: 0.5,
                textTransform: 'none',
              }}
            >
              {answer.deepLink.label || (isChhattisgarhi ? 'विस्तार से देखव →' : 'विस्तार से देखें →')}
            </Button>
          )}

          <Button
            fullWidth
            onClick={onClose}
            sx={{
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.78rem',
              py: 0.4,
              textTransform: 'none',
              '&:hover': { color: '#64748b' },
            }}
          >
            {isChhattisgarhi ? '✕ बंद करव' : '✕ बंद करें'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
