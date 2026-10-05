import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import ForumIcon from '@mui/icons-material/Forum';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import CallIcon from '@mui/icons-material/Call';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { MACHINERY_RENTALS, COMMUNITY_QA } from '../data/kisanData';
import { speakText } from '../utils/speech';
import { getMachinery, getCommunityQA, postCommunityQuestion } from '../services/apiService';
import { MeraKhetModal } from './MeraKhetModal';

export const ChaupalTab = () => {
  const [subTab, setSubTab] = useState(0);
  const [openAskModal, setOpenAskModal] = useState(false);
  const [openDiaryModal, setOpenDiaryModal] = useState(false);
  const [openMeraKhetModal, setOpenMeraKhetModal] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [machineryList, setMachineryList] = useState(MACHINERY_RENTALS);

  // Community Questions state from MongoDB
  const [questions, setQuestions] = useState(COMMUNITY_QA);

  // Load from MongoDB
  useEffect(() => {
    const loadFromMongo = async () => {
      const liveMachinery = await getMachinery();
      if (liveMachinery && liveMachinery.length > 0) setMachineryList(liveMachinery);
      const liveQA = await getCommunityQA();
      if (liveQA && liveQA.length > 0) setQuestions(liveQA);
    };
    loadFromMongo();
  }, []);

  // Farm diary state
  const [farmDiary, setFarmDiary] = useState(() => {
    const saved = localStorage.getItem('kisan_farm_diary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: 'diary-1',
        cropName: 'धान (सरना)',
        areaAcres: '3.0',
        sowDate: '2026-07-15',
        stage: 'गाभा / बालियां बनते समय',
        nextAction: '10 कि.ग्रा. पोटाश व 30 कि.ग्रा. यूरिया की दूसरी टॉप ड्रेसिंग'
      }
    ];
  });

  // Question Form
  const [newQuestion, setNewQuestion] = useState({
    author: '',
    crop: '',
    questionText: ''
  });

  // Diary Form
  const [newCropEntry, setNewCropEntry] = useState({
    cropName: 'धान (सरना)',
    areaAcres: '2',
    sowDate: new Date().toISOString().split('T')[0]
  });

  const handlePostQuestion = async () => {
    if (!newQuestion.questionText) return;
    const item = {
      id: `qa-${Date.now()}`,
      author: newQuestion.author || 'किसान भाई',
      crop: newQuestion.crop || 'सामान्य',
      time: 'अभी-अभी',
      question: newQuestion.questionText,
      answersCount: 1,
      bestAnswer: 'आपका प्रश्न चौपाल में पोस्ट हो गया है। कृषि विशेषज्ञ और साथी किसान जल्द ही इसका समाधान देंगे।'
    };
    // Post to MongoDB
    await postCommunityQuestion({
      author: item.author,
      crop: item.crop,
      question: item.question
    });
    const updated = [item, ...questions];
    setQuestions(updated);
    setOpenAskModal(false);
    setNewQuestion({ author: '', crop: '', questionText: '' });
    setSnackbarMessage('आपका सवाल किसान चौपाल में साझा कर दिया गया है!');
  };

  const handleSaveDiary = () => {
    if (!newCropEntry.cropName || !newCropEntry.areaAcres) return;
    const entry = {
      id: `diary-${Date.now()}`,
      cropName: newCropEntry.cropName,
      areaAcres: newCropEntry.areaAcres,
      sowDate: newCropEntry.sowDate,
      stage: 'नर्सरी / प्रारंभिक वृद्धि',
      nextAction: '20 दिन बाद: प्रथम यूरिया टॉप ड्रेसिंग (45 कि.ग्रा./एकड़)'
    };
    const updated = [entry, ...farmDiary];
    setFarmDiary(updated);
    localStorage.setItem('kisan_farm_diary', JSON.stringify(updated));
    setOpenDiaryModal(false);
    setSnackbarMessage('आपकी फसल डायरी में सुरक्षित हो गई है!');
  };

  return (
    <Box sx={{ pb: 3, pt: 1, px: { xs: 1.5, sm: 2 } }} className="fade-in">
      {/* Sub Header Tabs */}
      <Paper elevation={0} sx={{ mb: 2, borderRadius: 3, bgcolor: '#f0f4ec', p: 0.5 }}>
        <Tabs
          value={subTab}
          onChange={(e, val) => setSubTab(val)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 2.5,
              textTransform: 'none',
              py: 0.8
            },
            '& .Mui-selected': {
              bgcolor: '#ffffff',
              color: '#1b5e20 !important',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            },
            '& .MuiTabs-indicator': { display: 'none' }
          }}
        >
          <Tab icon={<PrecisionManufacturingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="मशीन रेंटल" />
          <Tab icon={<ForumIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="किसान चौपाल" />
          <Tab icon={<BookmarksIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="मेरी फसल डायरी" />
        </Tabs>
      </Paper>

      {/* SUB-TAB 0: MACHINERY & DRONE RENTAL */}
      {subTab === 0 && (
        <Box>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                🚜 कस्टम हायरिंग व कृषि मशीनरी रेंटल
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                ट्रैक्टर, कंबाइन हार्वेस्टर और कृषि ड्रोन उचित दरों पर
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {machineryList.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: 3.5,
                    border: '1.2px solid #c8e6c9',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(46, 125, 50, 0.05)',
                    '&:hover': { boxShadow: '0 6px 18px rgba(46, 125, 50, 0.12)' }
                  }}
                >
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', mb: 0.5 }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.96rem', lineHeight: 1.25 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                            स्थान: <strong>{item.location}</strong> • संचालक: {item.contactName}
                          </Typography>
                        </Box>

                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b7a2d', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                          {item.rate}
                        </Typography>
                      </Box>

                      {/* Feature chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, my: 1.2 }}>
                        {item.features.map((feat, i) => (
                          <Chip
                            key={i}
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#2e7d32' }} />}
                            label={feat}
                            size="small"
                            sx={{ bgcolor: '#f8fafc', fontSize: '0.72rem', height: 24, border: '1px solid #e2e8f0' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                          {item.operatorIncluded ? '✅ ड्राइवर सहित' : 'केवल मशीन'}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CallIcon />}
                          onClick={() => window.open(`tel:${item.phone}`)}
                          sx={{
                            bgcolor: '#1b7a2d',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            borderRadius: 2.5,
                            py: 0.5,
                            px: 1.5,
                            '&:hover': { bgcolor: '#125420' }
                          }}
                        >
                          कॉल करें: {item.phone}
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* SUB-TAB 1: COMMUNITY Q&A */}
      {subTab === 1 && (
        <Box>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                💬 किसान चौपाल (Community Forum)
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                कृषि विशेषज्ञों व साथी किसानों से सवाल पूछें और अनुभव बांटें
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenAskModal(true)}
              sx={{
                bgcolor: '#2e7d32',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 2,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              सवाल पूछें
            </Button>
          </Box>

          <Grid container spacing={2}>
            {questions.map((q) => (
              <Grid item xs={12} md={6} key={q.id}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: 3.5,
                    border: '1.2px solid #e2e8f0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Chip
                          label={q.crop}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                        />
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                          {q.author} • {q.time}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        startIcon={<VolumeUpIcon sx={{ fontSize: 14 }} />}
                        onClick={() => speakText(`${q.question}. समाधान: ${q.bestAnswer}`)}
                        sx={{ color: '#1b7a2d', fontSize: '0.7rem', p: 0.4 }}
                      >
                        सुनें
                      </Button>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.92rem', mb: 1.2, lineHeight: 1.35 }}>
                      ❓ {q.question}
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: '#f1f8e9',
                        border: '1px solid #c8e6c9',
                        borderRadius: 2.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.4 }}>
                        <QuestionAnswerIcon sx={{ color: '#1b7a2d', fontSize: 15 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.75rem' }}>
                          सर्वश्रेष्ठ समाधान (Expert Answer):
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {q.bestAnswer}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* SUB-TAB 2: FARM DIARY */}
      {subTab === 2 && (
        <Box>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                📖 मेरी फसल डायरी (My Farm Diary)
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                अपनी फसलें दर्ज करें और सिंचाई व खाद का रिमाइंडर पाएं
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenDiaryModal(true)}
              sx={{
                bgcolor: '#2e7d32',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: 2,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              फसल जोड़ें
            </Button>
          </Box>

          {/* Mera Khet Smart Multi-Plot Banner */}
          <Paper
            elevation={1}
            onClick={() => setOpenMeraKhetModal(true)}
            sx={{
              p: 1.8,
              mb: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              border: '1.5px solid #81c784',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <AgricultureIcon sx={{ fontSize: 32, color: '#ffeb3b' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  🌾 मेरा खेत: बहु-फसली स्मार्ट ट्रैकर
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.75rem' }}>
                  धान, चना, सब्जी का अलग-अलग A to Z हिसाब व आज का मौसम-कार्य
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap' }}
            >
              खोलें
            </Button>
          </Paper>

          {farmDiary.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: '#fafafa' }}>
              <EventNoteIcon sx={{ fontSize: 44, color: '#ccc', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#666' }}>
                अभी कोई फसल दर्ज नहीं है
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 2 }}>
                ऊपर दिए गए 'फसल जोड़ें' बटन से अपनी वर्तमान फसल को रिकॉर्ड करें
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {farmDiary.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    borderRadius: 3,
                    border: '1.5px solid #a5d6a7',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Chip
                          label={`${item.areaAcres} एकड़`}
                          size="small"
                          sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.7rem', mb: 0.5 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.2 }}>
                          {item.cropName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.74rem' }}>
                          बुआई तिथि: <strong>{item.sowDate}</strong> • वर्तमान अवस्था: {item.stage}
                        </Typography>
                      </Box>
                    </Box>

                    <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#fffde7', border: '1px solid #fff59d', borderRadius: 2, mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#f57f17', display: 'block', fontSize: '0.74rem' }}>
                        🔔 आगामी कार्य व सिफारिश (Next Step):
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#795548', fontSize: '0.8rem', lineHeight: 1.35 }}>
                        {item.nextAction}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Ask Question Dialog */}
      <Dialog open={openAskModal} onClose={() => setOpenAskModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.1rem' }}>
          ❓ किसान चौपाल में सवाल पूछें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="आपका नाम व गांव"
            value={newQuestion.author}
            onChange={(e) => setNewQuestion({ ...newQuestion, author: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="फसल का नाम (उदा. धान, चना, गेहूं)"
            value={newQuestion.crop}
            onChange={(e) => setNewQuestion({ ...newQuestion, crop: e.target.value })}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="अपना सवाल विस्तार से लिखें"
            value={newQuestion.questionText}
            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
            placeholder="जैसे: धान में बालियां निकलते समय कौन सा कीटनाशक डालना चाहिए?"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAskModal(false)} sx={{ color: '#666' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handlePostQuestion} sx={{ bgcolor: '#2e7d32', borderRadius: 2 }}>
            सवाल भेजें
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Diary Crop Dialog */}
      <Dialog open={openDiaryModal} onClose={() => setOpenDiaryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.1rem' }}>
          🌱 नई फसल दर्ज करें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="फसल व किस्म (उदा. धान सरना, गेहूं लोक-1)"
            value={newCropEntry.cropName}
            onChange={(e) => setNewCropEntry({ ...newCropEntry, cropName: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="रकबा (एकड़ में)"
            type="number"
            value={newCropEntry.areaAcres}
            onChange={(e) => setNewCropEntry({ ...newCropEntry, areaAcres: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="बुआई की तारीख"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newCropEntry.sowDate}
            onChange={(e) => setNewCropEntry({ ...newCropEntry, sowDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDiaryModal(false)} sx={{ color: '#666' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handleSaveDiary} sx={{ bgcolor: '#2e7d32', borderRadius: 2 }}>
            डायरी में जोड़ें
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3500}
        onClose={() => setSnackbarMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: 2.5 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <MeraKhetModal
        open={openMeraKhetModal}
        onClose={() => setOpenMeraKhetModal(false)}
      />
    </Box>
  );
};
