import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const AdminFarmersModule = ({
  farmers,
  farmerSearch,
  setFarmerSearch,
  farmerDistrictFilter,
  setFarmerDistrictFilter,
  handleFilterFarmers,
}) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      {/* Filter Strip */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 280 }}>
          <TextField
            placeholder="किसान का नाम, गांव या फसल से खोजें..."
            value={farmerSearch}
            onChange={(e) => setFarmerSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>जिला फिल्टर</InputLabel>
            <Select
              value={farmerDistrictFilter}
              label="जिला फिल्टर"
              onChange={(e) => setFarmerDistrictFilter(e.target.value)}
            >
              <MenuItem value="all">समस्त जिले</MenuItem>
              <MenuItem value="रायपुर">रायपुर</MenuItem>
              <MenuItem value="दुर्ग">दुर्ग</MenuItem>
              <MenuItem value="बिलासपुर">बिलासपुर</MenuItem>
              <MenuItem value="राजनांदगांव">राजनांदगांव</MenuItem>
              <MenuItem value="जांजगीर-चांपा">जांजगीर-चांपा</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button variant="contained" onClick={handleFilterFarmers} sx={{ bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2 }}>
          फ़िल्टर लागू करें
        </Button>
      </Box>

      {/* Farmers Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2.5 }}>
        <Table size="medium">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>किसान का नाम व संपर्क</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>ज़िला व गांव</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>कुल रकबा</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>मुख्य फसल व अवस्था</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>KCC ऋण स्थिति</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#334155' }}>स्थिति</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {farmers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  कोई किसान रिकॉर्ड नहीं मिला।
                </TableCell>
              </TableRow>
            ) : (
              farmers.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {f.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {f.phone ? `📱 ${f.phone}` : 'फोन उपलब्ध नहीं'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {f.district}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {f.village || 'ग्राम पंचायत'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${f.acres} एकड़`} size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534' }}>
                      {f.crop}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {f.stage || 'कल्ले फूटने की अवस्था'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: f.kccApproved ? '#16a34a' : '#ea580c' }}>
                      {f.kccApproved ? '₹1,50,000 स्वीकृत' : 'लंबित'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                      label="सत्यापित"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

