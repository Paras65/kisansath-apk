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

export const AdminCommunityModule = ({
  qaList,
  handleDeleteQA,
}) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
        💬 किसान चौपाल मंच मॉडरेशन ({qaList.length})
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 3 }}>
        समुदाय में पूछे गए प्रश्नों और मशीनरी रेंटल पोस्ट्स का निरीक्षण करें
      </Typography>

      <Grid container spacing={2}>
        {qaList.map((q) => (
          <Grid item xs={12} md={6} key={q.id}>
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip label={q.crop || 'कृषि चर्चा'} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }} />
                  <IconButton size="small" color="error" onClick={() => handleDeleteQA(q.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  {q.question}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                  पूछा: {q.author} ({q.district}) • {q.answers?.length || 0} उत्तर
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

