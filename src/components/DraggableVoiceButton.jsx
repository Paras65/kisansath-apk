import React, { useState, useEffect, useRef } from 'react';
import { Box, Tooltip } from '@mui/material';

/**
 * Draggable & Adaptive Smart Voice Button (Option 2 + Option 3)
 * - Draggable on mobile (touch) and desktop (mouse)
 * - Normal mode: Friendly green pill (🎤 बोलकर पूछें)
 * - In-Modal / Form mode: Transforms into a compact 48px circular floating bubble
 * - Can be dragged anywhere on screen so it NEVER blocks form inputs or save buttons
 */
export const DraggableVoiceButton = ({
  isSpeakingActive,
  isVoiceListening,
  onVoiceClick,
  isChhattisgarhi = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState(null); // { x, y } in px
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, initialElemX: 0, initialElemY: 0 });
  const hasMovedRef = useRef(false);
  const btnRef = useRef(null);

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

  // Compute default bottom-right position
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const defaultX = Math.max(16, window.innerWidth - (isModalOpen ? 64 : 205));
    const defaultY = Math.max(76, window.innerHeight - 130);

    // If user hasn't dragged, set default
    if (!position) {
      setPosition({ x: defaultX, y: defaultY });
    }

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return { x: defaultX, y: defaultY };
        const maxX = window.innerWidth - (isModalOpen ? 56 : 195);
        const maxY = window.innerHeight - 80;
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

    if (Math.hypot(dx, dy) > 8) {
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
      if (Math.hypot(dx, dy) > 6) {
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

  // Background and appearance logic
  const bg = isSpeakingActive
    ? '#c62828'
    : isVoiceListening
    ? '#1565c0'
    : '#2e7d32';

  const currentAvatarSrc = isSpeakingActive
    ? '/icons/kaka-speaking.png'
    : isVoiceListening
    ? '/icons/kaka-listening.png'
    : '/icons/kaka-idle.png';

  const emojiFallback = isSpeakingActive ? '🛑' : isVoiceListening ? '👂🏻' : '👴🏻';

  const label = isSpeakingActive
    ? (isChhattisgarhi ? 'काका ला रोको' : 'काका को रोकें')
    : isVoiceListening
    ? (isChhattisgarhi ? 'काका सुनत हे… बोलव!' : 'काका सुन रहे हैं… बोलें!')
    : (isChhattisgarhi ? 'बहिरा काका ले पूछव' : 'बहिरा काका से पूछें');

  const tooltipTitle = isModalOpen
    ? (isChhattisgarhi ? '👴🏻 बहिरा काका (खिसकाए बर पकड़व)' : '👴🏻 बहिरा काका (खिसकाने के लिए पकड़ें)')
    : (isChhattisgarhi ? '👴🏻 बहिरा काका ले पूछव (उंगली ले खिसकावव)' : '👴🏻 बहिरा काका से पूछें (उंगली से खिसकाएं)');

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
          bgcolor: bg,
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.84rem',
          letterSpacing: '0.3px',
          boxShadow: isVoiceListening
            ? '0 0 0 4px rgba(21,101,192,0.35), 0 6px 22px rgba(21,101,192,0.6)'
            : isSpeakingActive
            ? '0 6px 22px rgba(198,40,40,0.55)'
            : isModalOpen
            ? '0 8px 24px rgba(0,0,0,0.35), 0 0 0 3px #ffffff'
            : '0 6px 20px rgba(46,125,50,0.45)',
          px: isModalOpen ? 0 : 1.6,
          py: isModalOpen ? 0 : 0.8,
          width: isModalOpen ? 48 : 'auto',
          height: isModalOpen ? 48 : 44,
          minWidth: isModalOpen ? 48 : 0,
          borderRadius: isModalOpen ? '50%' : '28px',
          border: isModalOpen ? '2.5px solid #ffffff' : 'none',
          transition: isDraggingRef.current
            ? 'none'
            : 'width 0.25s, height 0.25s, border-radius 0.25s, background-color 0.2s, box-shadow 0.2s, left 0.15s ease-out',
          animation: isVoiceListening ? 'kisanVoicePulse 1.2s infinite' : 'none',
          '@keyframes kisanVoicePulse': {
            '0%, 100%': { boxShadow: '0 0 0 4px rgba(21,101,192,0.35), 0 6px 22px rgba(21,101,192,0.6)' },
            '50%': { boxShadow: '0 0 0 10px rgba(21,101,192,0.15), 0 8px 28px rgba(21,101,192,0.7)' },
          },
          '&:hover': {
            bgcolor: isSpeakingActive ? '#b71c1c' : isVoiceListening ? '#0d47a1' : '#1b5e20',
            transform: 'scale(1.03)',
          },
          '&:active': {
            transform: 'scale(0.97)',
          },
        }}
      >
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
                border: '2px solid #ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};
