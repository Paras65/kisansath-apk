import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ShieldIcon from '@mui/icons-material/Shield';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { appConfig } from '../../config/appConfig';

export const AdminSidebar = ({
  currentModule,
  setCurrentModule,
  isDesktop,
  setMobileDrawerOpen,
  onExit,
  handleLogout,
  navModules,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1e293b', color: '#ffffff' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box
          sx={{
            p: 0.8,
            bgcolor: 'rgba(56, 189, 248, 0.15)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AgricultureIcon sx={{ color: '#38bdf8', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
            कृषि प्रशासन कक्ष
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            {appConfig.stateName} Agritech Command
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {navModules.map((mod) => {
          const IconComp = mod.icon;
          const isSelected = currentModule === mod.id;
          return (
            <ListItem key={mod.id} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  setCurrentModule(mod.id);
                  if (!isDesktop) setMobileDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.1,
                  px: 1.8,
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  bgcolor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  '&:hover': {
                    bgcolor: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255,255,255,0.04)',
                    color: '#ffffff',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <IconComp sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={mod.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.86rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', bgcolor: '#0f172a' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <ShieldIcon sx={{ color: '#22c55e', fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            सत्र सुरक्षित (15m Auto-Lock)
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={onExit}
          sx={{
            color: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.2)',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 2,
            mb: 1,
            '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)' },
          }}
        >
          🌾 किसान पोर्टल पर जाएं
        </Button>
        <Button
          fullWidth
          variant="contained"
          size="small"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 800,
            borderRadius: 2,
          }}
        >
          लॉगआउट (Logout)
        </Button>
      </Box>
    </Box>
  );
};

