import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export const AdminMarketplaceModule = ({
  listings,
  handleDeleteListing,
}) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            🏪 सीधी खरीद-बिक्री मंडी मॉडरेशन ({listings.length})
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            अनुचित या भ्रामक पोस्ट्स को हटाएं ताकि किसान सुरक्षित व्यापार कर सकें
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {listings.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
              कोई लिस्टिंग उपलब्ध नहीं है।
            </Typography>
          </Grid>
        ) : (
          listings.map((l) => (
            <Grid item xs={12} sm={6} md={4} key={l.id}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip label={l.crop} size="small" sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800 }} />
                    <IconButton size="small" color="error" onClick={() => handleDeleteListing(l.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                    {l.variety || l.crop} • {l.quantity}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1b5e20', my: 0.5 }}>
                    ₹{l.pricePerQuintal || l.price}/क्विंटल
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                    📍 {l.district} • {l.sellerName} ({l.phone})
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Paper>
  );
};

