import React, { useState, useEffect, useRef } from 'react';
import { Box, Tooltip } from '@mui/material';
import { playListeningChime, playSuccessChime, playCancelChime } from '../utils/audioFeedback';
import { startShakeDetection, stopShakeDetection } from '../utils/fieldMotionService';
import { subscribeVoiceState } from '../utils/voiceRecognition';

/**
 * Draggable & Adaptive Smart Voice Button (Option 2 + Option 3)
 * - Draggable on mobile (touch) and desktop (mouse)
 * - Normal mode: Friendly green pill (🎤 बोलकर पूछें)
 * - In-Modal / Form mode: Transforms into a compact 48px circular floating bubble
 * - Can be dragged anywhere on screen so it NEVER blocks form inputs or save buttons
 * - Hands-Free Muddy Hands Shake Sensor (खेत मोड)
 * - Zero-Asset Audio Earcons (520Hz Chime & 880Hz Ding)
 */
export const DraggableVoiceButton = ({
  isSpeakingActive,
  isVoiceListening,
  onVoiceClick,
  isChhattisgarhi = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 16, y: 500 };
    return {
      x: Math.max(16, window.innerWidth - 205),
      y: Math.max(76, window.innerHeight - 130)
    };
  }); // { x, y } in px
  const [liveTranscript, setLiveTranscript] = useState('');
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, initialElemX: 0, initialElemY: 0 });
  const hasMovedRef = useRef(false);
  const btnRef = useRef(null);
  const prevListeningRef = useRef(false);

  // Monitor voice transcript state
  useEffect(() => {
    const unsub = subscribeVoiceState(({ listening, transcript }) => {
      setLiveTranscript(transcript || '');
    });
    return () => unsub();
  }, []);

  // Audio Earcons on listening state change
  useEffect(() => {
    if (isVoiceListening && !prevListeningRef.current) {
      playListeningChime();
    } else if (!isVoiceListening && prevListeningRef.current && liveTranscript) {
      playSuccessChime();
    }
    prevListeningRef.current = isVoiceListening;
  }, [isVoiceListening, liveTranscript]);

  // Hands-Free Muddy Hands Shake Sensor (खेत मोड)
  useEffect(() => {
    startShakeDetection(() => {
      if (!isVoiceListening && !isSpeakingActive) {
        if (onVoiceClick) onVoiceClick();
      }
    });
    return () => stopShakeDetection();
  }, [isVoiceListening, isSpeakingActive, onVoiceClick]);

  // Monitor DOM for active modals/dialogs (MUI Dialogs)
  useEffect(() => {
    const checkModal = () => {
      const openDialog = document.querySelector('.MuiDialog-root');
      setIsModalOpen(Boolean(openDialog));
    };

    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Window resize handler (debounced position clamping)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - (isModalOpen ? 56 : 195);
        const maxY = window.innerHeight - 80;
        if (!prev) {
          return {
            x: Math.max(16, maxX),
            y: Math.max(76, maxY - 50),
          };
        }
        return {
          x: Math.min(Math.max(10, prev.x), maxX),
          y: Math.min(Math.max(10, prev.y), maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isModalOpen]);

  // Touch Drag Handlers (Mobile / Android TWA)
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initialElemX: position ? position.x : 0,
      initialElemY: position ? position.y : 0,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startPosRef.current.x;
    const dy = touch.clientY - startPosRef.current.y;

    // Farmers with calloused hands or micro-tremors require a higher threshold (16px)
    // so a normal tap is never misidentified as a drag gesture
    if (Math.hypot(dx, dy) > 16) {
      hasMovedRef.current = true;
    }

    const btnWidth = isModalOpen ? 52 : 185;
    const btnHeight = 48;
    const newX = Math.min(Math.max(10, startPosRef.current.initialElemX + dx), window.innerWidth - btnWidth);
    const newY = Math.min(Math.max(10, startPosRef.current.initialElemY + dy), window.innerHeight - btnHeight);

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    // Snap to nearest side if dragged
    if (hasMovedRef.current && position) {
      const snapToRight = position.x > window.innerWidth / 2;
      const btnWidth = isModalOpen ? 56 : 190;
      const snappedX = snapToRight ? window.innerWidth - btnWidth - 12 : 12;
      setPosition((prev) => ({ ...prev, x: snappedX }));
    }
  };

  // Mouse Drag Handlers (Desktop)
  const handleMouseDown = (e) => {
    // Only left click
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialElemX: position ? position.x : 0,
      initialElemY: position ? position.y : 0,
    };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - startPosRef.current.x;
      const dy = moveEvent.clientY - startPosRef.current.y;
      if (Math.hypot(dx, dy) > 14) {
        hasMovedRef.current = true;
      }
      const btnWidth = isModalOpen ? 52 : 185;
      const btnHeight = 48;
      const newX = Math.min(Math.max(10, startPosRef.current.initialElemX + dx), window.innerWidth - btnWidth);
      const newY = Math.min(Math.max(10, startPosRef.current.initialElemY + dy), window.innerHeight - btnHeight);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    // Suppress click if user was dragging
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onVoiceClick) {
      onVoiceClick();
    }
  };

  // Glassmorphic translucent background & border logic
  const glassBg = isSpeakingActive
    ? 'linear-gradient(135deg, rgba(198, 40, 40, 0.85) 0%, rgba(183, 28, 28, 0.78) 100%)'
    : isVoiceListening
    ? 'linear-gradient(135deg, rgba(21, 101, 192, 0.85) 0%, rgba(13, 71, 161, 0.78) 100%)'
    : 'linear-gradient(135deg, rgba(46, 125, 50, 0.82) 0%, rgba(27, 94, 32, 0.75) 100%)';

  const glassBorder = isModalOpen
    ? '2.5px solid rgba(255, 255, 255, 0.85)'
    : '1.5px solid rgba(255, 255, 255, 0.35)';

  const glassShadow = isVoiceListening
    ? '0 0 0 4px rgba(21, 101, 192, 0.35), 0 8px 32px rgba(21, 101, 192, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
    : isSpeakingActive
    ? '0 8px 32px rgba(198, 40, 40, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
    : isModalOpen
    ? '0 8px 28px rgba(0, 0, 0, 0.35), 0 0 0 3px rgba(255, 255, 255, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
    : '0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(27, 94, 32, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.45)';

  const currentAvatarSrc = isSpeakingActive
    ? '/icons/kaka-speaking.webp'
    : isVoiceListening
    ? '/icons/kaka-listening.webp'
    : '/icons/kaka-idle.webp';

  const emojiFallback = isSpeakingActive ? '🛑' : isVoiceListening ? '👂🏻' : '👴🏻';

  const label = isSpeakingActive
    ? (isChhattisgarhi ? 'काका ला रोको' : 'काका को रोकें')
    : isVoiceListening
    ? (isChhattisgarhi ? 'काका सुनत हे… बोलव!' : 'काका सुन रहे हैं… बोलें!')
    : (isChhattisgarhi ? 'काका ले पूछव' : 'काका से पूछें');

  const tooltipTitle = isModalOpen
    ? (isChhattisgarhi ? '👴🏻 काका (खिसकाए बर पकड़व)' : '👴🏻 काका (खिसकाने के लिए पकड़ें)')
    : (isChhattisgarhi ? '👴🏻 काका ले पूछव (उंगली ले खिसकावव)' : '👴🏻 काका से पूछें (उंगली से खिसकाएं)');

  if (!position) return null;

  return (
    <Tooltip title={tooltipTitle} placement="top" arrow>
      <Box
        ref={btnRef}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        role="button"
        tabIndex={0}
        aria-label={label}
        sx={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 3500, // Stays above modal backdrop if modal is open, but farmer can drag it out of the way!
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.8,
          background: glassBg,
          backdropFilter: 'blur(14px) saturate(180%)',
          WebkitBackdropFilter: 'blur(14px) saturate(180%)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.84rem',
          letterSpacing: '0.3px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          boxShadow: glassShadow,
          px: isModalOpen ? 0 : 1.6,
          py: isModalOpen ? 0 : 0.8,
          width: isModalOpen ? 48 : 'auto',
          height: isModalOpen ? 48 : 44,
          minWidth: isModalOpen ? 48 : 0,
          borderRadius: isModalOpen ? '50%' : '28px',
          border: glassBorder,
          transition: isDraggingRef.current
            ? 'none'
            : 'width 0.25s, height 0.25s, border-radius 0.25s, background 0.2s, box-shadow 0.2s, left 0.15s ease-out',
          animation: isVoiceListening ? 'kisanVoicePulse 1.2s infinite' : 'none',
          '@keyframes kisanVoicePulse': {
            '0%, 100%': { boxShadow: '0 0 0 4px rgba(21,101,192,0.35), 0 8px 32px rgba(21,101,192,0.6)' },
            '50%': { boxShadow: '0 0 0 10px rgba(21,101,192,0.18), 0 10px 36px rgba(21,101,192,0.75)' },
          },
          '&:hover': {
            background: isSpeakingActive
              ? 'linear-gradient(135deg, rgba(183, 28, 28, 0.92) 0%, rgba(136, 14, 79, 0.88) 100%)'
              : isVoiceListening
              ? 'linear-gradient(135deg, rgba(13, 71, 161, 0.92) 0%, rgba(1, 87, 155, 0.88) 100%)'
              : 'linear-gradient(135deg, rgba(46, 125, 50, 0.90) 0%, rgba(27, 94, 32, 0.85) 100%)',
            transform: 'scale(1.03)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.32), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
          },
          '&:active': {
            transform: 'scale(0.97)',
          },
        }}
      >
        {/* Floating Live Speech Transcript Bubble */}
        {(isVoiceListening || (isSpeakingActive && liveTranscript)) && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              right: isModalOpen ? 0 : 'auto',
              left: isModalOpen ? 'auto' : '50%',
              transform: isModalOpen ? 'none' : 'translateX(-50%)',
              bgcolor: isSpeakingActive ? 'rgba(183, 28, 28, 0.95)' : 'rgba(21, 101, 192, 0.95)',
              color: '#ffffff',
              px: 1.5,
              py: 0.6,
              borderRadius: '14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              maxWidth: 220,
              textAlign: 'center',
              whiteSpace: 'normal',
              pointerEvents: 'none',
              zIndex: 3600,
              animation: 'fadeInUp 0.18s ease-out',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '100%',
                left: isModalOpen ? 'auto' : '50%',
                right: isModalOpen ? '16px' : 'auto',
                transform: isModalOpen ? 'none' : 'translateX(-50%)',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: `${isSpeakingActive ? 'rgba(183, 28, 28, 0.95)' : 'rgba(21, 101, 192, 0.95)'} transparent transparent transparent`,
              },
            }}
          >
            {liveTranscript || (isChhattisgarhi ? '👂🏻 काका सुनत हे… बोलव!' : '👂🏻 काका सुन रहे हैं… बोलें!')}
          </Box>
        )}

        {isModalOpen ? (
          // In-Modal Compact 48px Bubble: 3D Avatar filling the bubble
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.7)',
            }}
          >
            <Box
              component="img"
              src={currentAvatarSrc}
              alt="बहिरा काका"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                transform: 'scale(1.22)',
                transformOrigin: 'center 35%',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.kaka-emoji-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <Box
              className="kaka-emoji-fallback"
              sx={{
                display: 'none',
                fontSize: '22px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {emojiFallback}
            </Box>
          </Box>
        ) : (
          // Normal Screen: 3D Avatar Badge + Full Friendly Pill
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: isSpeakingActive
                  ? '2px solid #facc15'
                  : isVoiceListening
                  ? '2px solid #93c5fd'
                  : '1.5px solid rgba(255, 255, 255, 0.85)',
                boxShadow: isSpeakingActive
                  ? '0 0 10px rgba(250, 204, 21, 0.6)'
                  : '0 2px 8px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.1)',
              }}
            >
              <Box
                component="img"
                src={currentAvatarSrc}
                alt="बहिरा काका"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1.22)',
                  transformOrigin: 'center 35%',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.kaka-pill-fallback');
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <Box
                className="kaka-pill-fallback"
                sx={{ display: 'none', fontSize: '18px' }}
              >
                {emojiFallback}
              </Box>
            </Box>
            <span>{label}</span>
            {isSpeakingActive && (
              <Box sx={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px', height: 12, ml: 0.3 }}>
                <Box sx={{ width: 2.5, bgcolor: '#ffffff', borderRadius: 1, animation: 'miniEq 0.6s infinite alternate ease-in-out', '@keyframes miniEq': { '0%': { height: 3 }, '100%': { height: 12 } } }} />
                <Box sx={{ width: 2.5, bgcolor: '#ffffff', borderRadius: 1, animation: 'miniEq 0.45s infinite alternate ease-in-out 0.1s' }} />
                <Box sx={{ width: 2.5, bgcolor: '#ffffff', borderRadius: 1, animation: 'miniEq 0.7s infinite alternate ease-in-out 0.2s' }} />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};
