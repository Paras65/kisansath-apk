import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Paper,
  Divider,
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
          width: { xs: '100%', sm: '460px' },
          maxHeight: { xs: '88vh', sm: '85vh' },
          borderRadius: { xs: '24px 24px 0 0', sm: '28px' },
          border: '2px solid #2e7d32',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.25)',
          bgcolor: '#ffffff',
          overflow: 'hidden',
        },
      }}
    >
      {/* 1. Header: Bhaira Kaka Persona Badge */}
      <Box
        sx={{
          bgcolor: '#1b5e20',
          color: '#ffffff',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #2e7d32',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            component="img"
            src="/icons/kaka-speaking-cg.png"
            onError={(e) => { e.currentTarget.src = '/icons/kaka-idle-cg.png'; }}
            alt="बहिरा काका"
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: '#ffffff',
              border: '2px solid #facc15',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              objectFit: 'cover',
            }}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#fef08a', lineHeight: 1.2 }}>
              👴🏻 {isChhattisgarhi ? 'बहिरा काका के सीधा जवाब' : 'बहिरा काका का सीधा जवाब'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#bbf7d0', fontSize: '0.72rem', fontWeight: 600 }}>
              {isSpeaking ? (isChhattisgarhi ? '📢 काका बोलत हे...' : '📢 काका बोल रहे हैं...') : (isChhattisgarhi ? '✓ उत्तर तैयार हे' : '✓ उत्तर तैयार है')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <IconButton
            size="small"
            onClick={handleToggleSpeech}
            sx={{
              bgcolor: isSpeaking ? '#ef4444' : '#22c55e',
              color: '#ffffff',
              p: 0.7,
              '&:hover': { bgcolor: isSpeaking ? '#dc2626' : '#16a34a' },
            }}
            aria-label={isSpeaking ? 'रोकें' : 'सुनें'}
          >
            {isSpeaking ? <StopIcon sx={{ fontSize: 20 }} /> : <VolumeUpIcon sx={{ fontSize: 20 }} />}
          </IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: '#ffffff' }} aria-label="close">
            <CloseIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </Box>

      {/* 2. Main Content Body */}
      <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fafbf9' }}>
        {/* User Query Echo */}
        {answer.queryEcho && (
          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
              🗣️ {isChhattisgarhi ? 'तुंहर सवाल:' : 'आपका सवाल:'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0f172a', fontSize: '0.78rem', fontWeight: 800, bgcolor: '#f1f5f9', px: 1, py: 0.3, borderRadius: 1.5 }}>
              "{answer.queryEcho}"
            </Typography>
          </Box>
        )}

        {/* Headline Banner */}
        {headline && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 3,
              bgcolor: '#f0fdf4',
              border: '1.5px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
              {answer.icon || '🌾'}
            </Typography>
            <Typography sx={{ fontWeight: 900, color: '#166534', fontSize: { xs: '0.98rem', sm: '1.05rem' }, lineHeight: 1.3 }}>
              {headline}
            </Typography>
          </Paper>
        )}

        {/* Structured Bold Answer Cards (KPI Grid) */}
        {answer.cards && answer.cards.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: answer.cards.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: 1.2, mb: 2 }}>
            {answer.cards.map((card, idx) => (
              <Paper
                key={idx}
                elevation={0}
                sx={{
                  p: 1.4,
                  borderRadius: 2.5,
                  bgcolor: card.bg || '#ffffff',
                  border: `1.5px solid ${card.border || '#e2e8f0'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{card.icon}</Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>
                    {card.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, color: card.color || '#0f172a', fontSize: '1.15rem', lineHeight: 1.2 }}>
                  {card.value}
                </Typography>
                {card.sub && (
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                    {card.sub}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {/* Spoken Text / Advisory Box */}
        {advisory && (
          <Box
            sx={{
              p: 1.4,
              mb: 2,
              borderRadius: 2.5,
              bgcolor: '#fffbeb',
              border: '1.2px solid #fef08a',
            }}
          >
            <Typography variant="caption" sx={{ color: '#854d0e', fontWeight: 800, fontSize: '0.72rem', display: 'block', mb: 0.3 }}>
              💡 {isChhattisgarhi ? 'काका के सीख / सलाह:' : 'काका की सलाह:'}
            </Typography>
            <Typography sx={{ color: '#713f12', fontWeight: 700, fontSize: '0.84rem', lineHeight: 1.45 }}>
              {advisory}
            </Typography>
          </Box>
        )}

        {/* Missing Slot Prompt (Multi-turn Slot Collector) */}
        {answer.needsClarification && (
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 2.5, bgcolor: '#eff6ff', border: '1.5px dashed #60a5fa' }}>
            <Typography sx={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              ❓ {isChhattisgarhi ? 'काका पूछत हन — नीचे छूव या बोलव:' : 'काका पूछ रहे हैं — नीचे चुनें या बोलें:'}
            </Typography>

            {/* Quick Tap Suggestion Chips */}
            {answer.slotSuggestions && answer.slotSuggestions.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.5 }}>
                {answer.slotSuggestions.map((suggestion, sIdx) => (
                  <Chip
                    key={sIdx}
                    label={suggestion}
                    onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      py: 2,
                      px: 0.5,
                      bgcolor: '#ffffff',
                      border: '1.5px solid #3b82f6',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(59,130,246,0.15)',
                      '&:hover': { bgcolor: '#dbeafe' },
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Tap to Speak continuation */}
            <Button
              fullWidth
              variant="contained"
              startIcon={<MicIcon />}
              onClick={onStartVoice}
              sx={{
                bgcolor: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                borderRadius: 2,
                py: 0.8,
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              {isChhattisgarhi ? '🎤 मुँह ले बोलके बताव' : '🎤 बोलकर बताएं'}
            </Button>
          </Box>
        )}

        {/* Continuous Conversational Follow-up when answer is complete */}
        {!answer.needsClarification && (
          <Box sx={{ p: 1.2, mb: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, fontSize: '0.74rem' }}>
                💬 {isChhattisgarhi ? 'कछु अउ पूछना हे काका ले?' : 'काका से कुछ और पूछना है?'}
              </Typography>
              <Button
                size="small"
                startIcon={<MicIcon sx={{ fontSize: 16 }} />}
                onClick={onStartVoice}
                sx={{
                  color: '#1d4ed8',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  py: 0.3,
                  px: 1,
                  bgcolor: '#dbeafe',
                  borderRadius: 1.5,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#bfdbfe' },
                }}
              >
                {isChhattisgarhi ? 'बोलव' : 'बोलें'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
              {['खाद हिसाब', 'टमाटर भाव', 'आज का मौसम', 'माहू की दवा'].map((chip, cIdx) => (
                <Chip
                  key={cIdx}
                  label={chip}
                  size="small"
                  onClick={() => onSuggestionClick && onSuggestionClick(chip)}
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    bgcolor: '#ffffff',
                    border: '1px solid #94a3b8',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#e2e8f0' },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* 3. Action Bar: WhatsApp Share + Optional Deep Link + Close */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<WhatsAppIcon sx={{ fontSize: 22 }} />}
            onClick={handleWhatsAppShare}
            sx={{
              bgcolor: '#16a34a',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '0.88rem',
              py: 1.1,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              textTransform: 'none',
              '&:hover': { bgcolor: '#15803d' },
            }}
          >
            {isChhattisgarhi ? '📲 व्हाट्सएप म शेयर करव' : '📲 व्हाट्सएप पर शेयर करें'}
          </Button>

          {/* Optional Deep Link Button (Only if user explicitly wants full tab) */}
          {answer.deepLink && (
            <Button
              fullWidth
              variant="outlined"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onClose();
                if (onDeepLink) onDeepLink(answer.deepLink);
              }}
              sx={{
                color: '#1b5e20',
                borderColor: '#a5d6a7',
                fontWeight: 800,
                fontSize: '0.78rem',
                py: 0.7,
                borderRadius: 2.5,
                textTransform: 'none',
                bgcolor: '#f0fdf4',
                '&:hover': { bgcolor: '#dcfce7', borderColor: '#2e7d32' },
              }}
            >
              {answer.deepLink.label || (isChhattisgarhi ? '🔍 पूरा कैलकुलेटर देखव' : '🔍 पूरा कैलकुलेटर देखें')}
            </Button>
          )}

          <Button
            fullWidth
            onClick={onClose}
            sx={{
              color: '#64748b',
              fontWeight: 800,
              fontSize: '0.8rem',
              py: 0.5,
              textTransform: 'none',
            }}
          >
            {isChhattisgarhi ? '✕ समझ गेन (बंद करव)' : '✕ समझ गए (बंद करें)'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
