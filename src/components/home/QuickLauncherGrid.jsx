import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { stopSpeech } from '../../utils/speech';

export const QuickLauncherGrid = ({
  isChhattisgarhi = false,
  activeFarmer = null,
  onNavigate = () => {},
  onOpenGpsTracker = () => {},
  onOpenMotorModal = () => {},
  onOpenSoilIot = () => {},
  onOpenMeraKhet = () => {}
}) => {
  const tools = [
    {
      title: isChhattisgarhi ? 'कीरा-रोग' : 'फसल डॉक्टर',
      icon: <MedicalServicesIcon sx={{ color: '#d32f2f', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#ffebee',
      border: '#ffcdd2',
      badge: 'AI',
      badgeBg: '#d32f2f',
      action: () => onNavigate('doctor')
    },
    {
      title: isChhattisgarhi ? 'खाद हिसाब' : 'खाद NPK',
      icon: <CalculateIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#e8f5e9',
      border: '#c8e6c9',
      badge: 'NPK',
      badgeBg: '#2e7d32',
      action: () => {
        onNavigate('schemes');
        window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 0 } }));
      }
    },
    {
      title: isChhattisgarhi ? 'मंडी भाव' : 'मंडी भाव',
      icon: <StorefrontIcon sx={{ color: '#1976d2', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#e3f2fd',
      border: '#bbdefb',
      badge: isChhattisgarhi ? 'लाइव' : 'लाइव',
      badgeBg: '#1976d2',
      action: () => onNavigate('mandi')
    },
    {
      title: isChhattisgarhi ? 'धान ₹3,100' : 'धान ₹3,100',
      icon: <MonetizationOnIcon sx={{ color: '#f57f17', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#fff8e1',
      border: '#ffe082',
      badge: isChhattisgarhi ? 'बोनस' : 'बोनस',
      badgeBg: '#e65100',
      action: () => {
        onNavigate('schemes');
        window.dispatchEvent(new CustomEvent('kisan_switch_subtab', { detail: { subTab: 1 } }));
      }
    },
    {
      title: isChhattisgarhi ? 'खेत GPS' : 'खेत GPS',
      icon: <DirectionsWalkIcon sx={{ color: '#00897b', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#e0f2f1',
      border: '#b2dfdb',
      badge: isChhattisgarhi ? 'नाप-जोख' : 'मापक',
      badgeBg: '#00897b',
      action: () => onOpenGpsTracker()
    },
    {
      title: isChhattisgarhi ? 'बोर मोटर' : 'ट्यूबवेल मोटर',
      icon: <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#e1f5fe',
      border: '#b3e5fc',
      badge: activeFarmer ? 'IoT' : '🔒',
      badgeBg: activeFarmer ? '#0288d1' : '#64748b',
      action: () => onOpenMotorModal()
    },
    {
      title: isChhattisgarhi ? 'माटी जांच' : 'मिट्टी सेंसर',
      icon: <ScienceIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#e8f5e9',
      border: '#c8e6c9',
      badge: activeFarmer ? (isChhattisgarhi ? 'सेंसर' : 'सेंसर') : '🔒',
      badgeBg: activeFarmer ? '#1b5e20' : '#64748b',
      action: () => onOpenSoilIot()
    },
    {
      title: isChhattisgarhi ? 'फसल डायरी' : 'किसान डायरी',
      icon: <MenuBookIcon sx={{ color: '#7b1fa2', fontSize: { xs: 24, sm: 26 } }} />,
      bg: '#f3e5f5',
      border: '#e1bee7',
      badge: activeFarmer ? (isChhattisgarhi ? 'खाता' : 'खाता') : '🔒',
      badgeBg: activeFarmer ? '#7b1fa2' : '#64748b',
      action: () => onOpenMeraKhet()
    }
  ];

  return (
    <Card
      sx={{
        p: { xs: 1.2, sm: 1.8 },
        mb: 2.2,
        borderRadius: '16px',
        bgcolor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 1, sm: 1.5 } }}>
        {tools.map((tool, idx) => (
          <Box
            key={idx}
            className="touch-card"
            onClick={() => { stopSpeech(); tool.action(); }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              py: { xs: 0.6, sm: 1 },
              px: 0.3,
              borderRadius: '12px',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': { bgcolor: '#f8fafc', transform: 'translateY(-2px)' },
              '&:active': { transform: 'scale(0.94)' }
            }}
          >
            <Box sx={{ position: 'relative', mb: 0.8 }}>
              <Box
                sx={{
                  bgcolor: tool.bg,
                  width: { xs: 46, sm: 52 },
                  height: { xs: 46, sm: 52 },
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${tool.border}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                {tool.icon}
              </Box>
              {tool.badge && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    bgcolor: tool.badgeBg,
                    color: '#ffffff',
                    fontSize: { xs: '0.54rem', sm: '0.6rem' },
                    fontWeight: 800,
                    px: 0.6,
                    py: 0.1,
                    borderRadius: '6px',
                    border: '1.5px solid #ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    lineHeight: 1.15
                  }}
                >
                  {tool.badge}
                </Box>
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '0.74rem', sm: '0.8rem' },
                color: '#0f172a',
                lineHeight: 1.25,
                textAlign: 'center',
                minHeight: { xs: 28, sm: 30 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {tool.title}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};
