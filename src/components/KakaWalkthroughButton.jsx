import React, { useState, useEffect } from 'react';
import { Button, Tooltip, keyframes } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import { speakText, stopSpeech, isSpeaking, subscribeSpeechState } from '../utils/speech';
import { getKakaWalkthrough } from '../services/kakaBrainService';
import { useLanguage } from '../utils/i18n';

const pulseGlow = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 127, 23, 0.5); }
  50% { transform: scale(1.03); box-shadow: 0 0 14px 4px rgba(245, 127, 23, 0.35); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 127, 23, 0); }
`;

/**
 * 👴🏻 काका ले समझव / काका से समझें (1-Tap Vernacular Audio Walkthrough)
 * Allows illiterate or busy farmers to hear an authentic 15-second audio explanation of any screen
 */
export const KakaWalkthroughButton = ({ featureId = 'home', sx = {}, variant = 'outlined' }) => {
  const { isChhattisgarhi } = useLanguage();
  const [isActiveSpeaking, setIsActiveSpeaking] = useState(false);

  useEffect(() => {
    const unsub = subscribeSpeechState((speaking) => {
      setIsActiveSpeaking(speaking);
    });
    return () => unsub();
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isActiveSpeaking) {
      stopSpeech();
      return;
    }
    const explanation = getKakaWalkthrough(featureId, isChhattisgarhi);
    speakText(explanation);
  };

  const label = isActiveSpeaking
    ? (isChhattisgarhi ? '🛑 रोक्व' : '🛑 रोकें')
    : (isChhattisgarhi ? '👴🏻 काका ले समझव' : '👴🏻 काका से समझें');

  return (
    <Tooltip title={isChhattisgarhi ? 'काका के आवाज़ म समझव' : 'काका की आवाज़ में 15 सेकंड में समझें'}>
      <Button
        size="small"
        onClick={handleClick}
        variant={isActiveSpeaking ? 'contained' : variant}
        color={isActiveSpeaking ? 'warning' : 'primary'}
        startIcon={isActiveSpeaking ? <StopIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
        sx={{
          borderRadius: '24px',
          fontWeight: 700,
          fontSize: '0.82rem',
          textTransform: 'none',
          py: 0.4,
          px: 1.4,
          borderColor: isActiveSpeaking ? 'transparent' : 'rgba(46, 125, 50, 0.4)',
          backgroundColor: isActiveSpeaking
            ? '#e65100'
            : 'rgba(255, 255, 255, 0.85)',
          color: isActiveSpeaking ? '#ffffff' : '#1b5e20',
          backdropFilter: 'blur(8px)',
          boxShadow: isActiveSpeaking ? '0 4px 12px rgba(230, 81, 0, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
          animation: isActiveSpeaking ? `${pulseGlow} 1.8s infinite` : 'none',
          '&:hover': {
            backgroundColor: isActiveSpeaking ? '#bf360c' : '#e8f5e9',
          },
          ...sx,
        }}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

