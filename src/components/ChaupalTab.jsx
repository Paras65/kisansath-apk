import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { notify } from '../services/notificationService';
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
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PrintIcon from '@mui/icons-material/Print';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import ClearIcon from '@mui/icons-material/Clear';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import { speakText } from '../utils/speech';
import { useLanguage } from '../utils/i18n';
import { startVoiceRecognition, stopVoiceRecognition, normalizeSpokenQuery } from '../utils/speechRecognition';
import {
  getMachinery,
  postMachinery,
  getCommunityQA,
  postCommunityQuestion,
  postCommunityReply,
  getCachedModuleData
} from '../services/apiService';
import { generateAndPrintKccReport } from '../utils/printReportHelper';
import {
  getActiveFarmer,
  getFarmerDiary,
  saveFarmerDiaryEntry,
  deleteFarmerDiaryEntry
} from '../services/farmerService';
import { MeraKhetModal } from './MeraKhetModal';
import { openNativeDialer, openNativeWhatsApp } from '../utils/capacitorUtils';

export const ChaupalTab = () => {
  const { isChhattisgarhi, t } = useLanguage();
  const [subTab, setSubTab] = useState(0);
  const [openAskModal, setOpenAskModal] = useState(false);
  const [openDiaryModal, setOpenDiaryModal] = useState(false);
  const [openMeraKhetModal, setOpenMeraKhetModal] = useState(false);
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());
  const [isDiaryCloudSynced, setIsDiaryCloudSynced] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Machinery Add Modal state
  const [openAddMachineryModal, setOpenAddMachineryModal] = useState(false);
  const [newMachine, setNewMachine] = useState({
    title: '',
    category: 'जुताई एवं खेत तैयारी',
    rate: '',
    operatorIncluded: true,
    contactName: activeFarmer?.name || '',
    phone: activeFarmer?.phone || '',
    location: activeFarmer?.village ? `${activeFarmer.village}, ${activeFarmer.district || 'छत्तीसगढ़'}` : 'रायपुर',
    features: ''
  });

  // Reply Modal state
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [selectedQuestionForReply, setSelectedQuestionForReply] = useState(null);
  const [replyForm, setReplyForm] = useState({
    author: activeFarmer?.name || '',
    role: 'किसान भाई',
    text: ''
  });

  // Initialize strictly from previously fetched cache or empty (Zero Static Fallback)
  const [machineryList, setMachineryList] = useState(() => {
    const cached = getCachedModuleData('machinery');
    return cached && Array.isArray(cached.data) ? cached.data : [];
  });

  // Community Questions state from cache or empty
  const [questions, setQuestions] = useState(() => {
    const cached = getCachedModuleData('community_qa');
    return cached && Array.isArray(cached.data) ? cached.data : [];
  });

  // Farm diary state - strictly live from cache or empty (Zero Static Dummy)
  const [farmDiary, setFarmDiary] = useState(() => {
    const saved = localStorage.getItem('kisan_farm_diary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Load from MongoDB
  const loadFromMongo = async () => {
    const liveMachinery = await getMachinery();
    if (liveMachinery && Array.isArray(liveMachinery)) setMachineryList(liveMachinery);
    const liveQA = await getCommunityQA();
    if (liveQA && Array.isArray(liveQA)) setQuestions(liveQA);

    // Dynamic Cloud Farm Diary Load
    const currentFarmer = getActiveFarmer();
    setActiveFarmer(currentFarmer);
    if (currentFarmer && currentFarmer.phone) {
      const diaryResult = await getFarmerDiary(currentFarmer.phone);
      if (diaryResult && Array.isArray(diaryResult.data)) {
        setFarmDiary(diaryResult.data);
        setIsDiaryCloudSynced(diaryResult.isCloudSynced);
      }
    }
  };

  useEffect(() => {
    loadFromMongo();
    return () => {
      stopVoiceRecognition();
    };
  }, []);

  // Voice recognition mic toggle for asking question
  const handleToggleVoiceQuestion = () => {
    if (isVoiceListening) {
      stopVoiceRecognition();
      setIsVoiceListening(false);
    } else {
      startVoiceRecognition({
        onResult: (normalized, raw) => {
          setNewQuestion((prev) => ({
            ...prev,
            questionText: raw || normalized
          }));
        },
        onListeningChange: (listening) => {
          setIsVoiceListening(listening);
        },
        onError: (msg) => {
          notify.info(msg);
          setIsVoiceListening(false);
        }
      });
    }
  };

  // Question Form
  const [newQuestion, setNewQuestion] = useState({
    author: activeFarmer?.name || '',
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
    if (!newQuestion.questionText) {
      notify.warning('कृपया अपना सवाल विस्तार से लिखें');
      return;
    }
    const item = {
      id: `qa-${Date.now()}`,
      author: newQuestion.author || activeFarmer?.name || 'किसान भाई',
      crop: newQuestion.crop || 'सामान्य',
      time: 'अभी-अभी',
      question: newQuestion.questionText,
      answersCount: 1,
      bestAnswer: 'आपका प्रश्न चौपाल में दर्ज हो चुका है। कृषि वैज्ञानिक व साथी किसान जल्द समाधान देंगे।',
      replies: [
        {
          id: `rep-${Date.now()}`,
          author: 'किसान साथी सिस्टम',
          role: 'कृषि सलाहकार',
          text: 'आपका प्रश्न चौपाल में दर्ज हो चुका है। कृषि वैज्ञानिक व साथी किसान जल्द समाधान देंगे।',
          createdAt: new Date()
        }
      ]
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
    setNewQuestion({ author: activeFarmer?.name || '', crop: '', questionText: '' });
    notify.success('आपका सवाल किसान चौपाल में साझा कर दिया गया है!');
  };

  const handlePostReply = async () => {
    if (!selectedQuestionForReply) return;
    if (!replyForm.text || replyForm.text.trim().length < 3) {
      notify.warning('कृपया कम से कम 3 अक्षरों का समाधान लिखें');
      return;
    }

    const payload = {
      author: replyForm.author || activeFarmer?.name || 'किसान साथी',
      role: replyForm.role || 'किसान भाई',
      text: replyForm.text.trim()
    };

    const updatedQA = await postCommunityReply(selectedQuestionForReply.id, payload);
    if (updatedQA) {
      setQuestions(questions.map(q => q.id === updatedQA.id ? updatedQA : q));
      setOpenReplyModal(false);
      setReplyForm({ author: activeFarmer?.name || '', role: 'किसान भाई', text: '' });
      notify.success('आपका समाधान चौपाल में दर्ज हो गया है!');
    } else {
      notify.error('समाधान दर्ज करने में समस्या आई।');
    }
  };

  const handlePostMachinery = async () => {
    if (!newMachine.title || !newMachine.rate) {
      notify.warning('कृपया मशीन का नाम और किराया दर दर्ज करें');
      return;
    }
    const cleanPhone = (newMachine.phone || '').replace(/[\s\-\+]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      notify.warning('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें');
      return;
    }

    const payload = {
      title: newMachine.title.trim(),
      category: newMachine.category,
      rate: newMachine.rate.trim(),
      operatorIncluded: Boolean(newMachine.operatorIncluded),
      contactName: newMachine.contactName.trim() || 'मशीन संचालक',
      phone: cleanPhone,
      location: newMachine.location.trim() || 'छत्तीसगढ़',
      features: newMachine.features
        ? newMachine.features.split(',').map(f => f.trim()).filter(Boolean)
        : ['कुशल ऑपरेटर', 'समय पर सेवा']
    };

    const saved = await postMachinery(payload);
    if (saved) {
      setMachineryList([saved, ...machineryList]);
      setOpenAddMachineryModal(false);
      setNewMachine({
        title: '',
        category: 'जुताई एवं खेत तैयारी',
        rate: '',
        operatorIncluded: true,
        contactName: activeFarmer?.name || '',
        phone: activeFarmer?.phone || '',
        location: activeFarmer?.village ? `${activeFarmer.village}, ${activeFarmer.district || 'छत्तीसगढ़'}` : 'रायपुर',
        features: ''
      });
      notify.success('आपकी मशीन किराए हेतु सफलतापूर्वक लिस्ट हो गई है!');
    } else {
      notify.error('मशीनरी लिस्टिंग सहेजने में समस्या आई।');
    }
  };

  const handleSaveDiary = async () => {
    if (!newCropEntry.cropName || !newCropEntry.areaAcres) {
      notify.warning('कृपया फसल का नाम और रकबा दर्ज करें');
      return;
    }
    const entry = {
      id: `diary-${Date.now()}`,
      cropName: newCropEntry.cropName,
      areaAcres: newCropEntry.areaAcres,
      sowDate: newCropEntry.sowDate,
      stage: 'नर्सरी / प्रारंभिक वृद्धि',
      nextAction: '20 दिन बाद: प्रथम यूरिया टॉप ड्रेसिंग (45 कि.ग्रा./एकड़)'
    };

    const currentFarmer = getActiveFarmer();
    const result = await saveFarmerDiaryEntry(currentFarmer?.phone, entry);
    setFarmDiary(result.data);
    setIsDiaryCloudSynced(result.isCloudSynced);
    setOpenDiaryModal(false);
    notify.success(result.isCloudSynced
      ? 'फसल डायरी क्लाउड में सुरक्षित हो गई है!'
      : 'फसल डायरी ऑफ़लाइन सुरक्षित हो गई है!');
  };

  const handleDeleteDiaryEntry = async (entryId) => {
    const currentFarmer = getActiveFarmer();
    const result = await deleteFarmerDiaryEntry(currentFarmer?.phone, entryId);
    setFarmDiary(result.data);
    setIsDiaryCloudSynced(result.isCloudSynced);
    notify.info('डायरी प्रविष्टि हटा दी गई।');
  };

  return (
    <Box sx={{ pb: 1, pt: 0 }} className="fade-in">
      {/* Modern Capsule Tab Switcher */}
      <Box sx={{ mb: 2.5, display: 'flex', gap: 1, p: 0.6, bgcolor: '#f1f5f9', borderRadius: '14px', maxWidth: { xs: '100%', md: 680 }, mx: 'auto' }}>
        {[
          { label: 'मशीनरी रेंटल', icon: <PrecisionManufacturingIcon sx={{ fontSize: 18 }} /> },
          { label: 'किसान चौपाल', icon: <ForumIcon sx={{ fontSize: 18 }} /> },
          { label: 'मेरी फसल डायरी', icon: <BookmarksIcon sx={{ fontSize: 18 }} /> },
        ].map((item, idx) => (
          <Button
            key={idx}
            fullWidth
            onClick={() => setSubTab(idx)}
            startIcon={item.icon}
            sx={{
              py: 0.9,
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: subTab === idx ? '#ffffff' : 'transparent',
              color: subTab === idx ? '#1b5e20' : '#64748b',
              boxShadow: subTab === idx ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: subTab === idx ? '#ffffff' : 'rgba(255,255,255,0.5)',
                color: '#1b5e20'
              }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* SUB-TAB 0: MACHINERY & DRONE RENTAL */}
      {subTab === 0 && (
        <Box>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                🚜 कस्टम हायरिंग व कृषि मशीनरी रेंटल
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                ट्रैक्टर, कंबाइन हार्वेस्टर और कृषि ड्रोन उचित दरों पर
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenAddMachineryModal(true)}
              sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, fontSize: '0.75rem', borderRadius: 2, '&:hover': { bgcolor: '#125420' } }}
            >
              + मशीन किराए पर जोड़ें
            </Button>
          </Box>
          {/* Zero-False-Data Benchmark Notice */}
          <Paper
            elevation={0}
            sx={{
              p: 1.4,
              mb: 2,
              borderRadius: 2.5,
              bgcolor: '#f1f8e9',
              border: '1.2px solid #c8e6c9',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.2
            }}
          >
            <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>🏛️</Typography>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.84rem', mb: 0.2 }}>
                कस्टम हायरिंग सेंटर (CHC) अनुमोदित मानक संदर्भ दरें
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.74rem', lineHeight: 1.35, display: 'block' }}>
                यह दरें छत्तीसगढ़ कृषि अभियांत्रिकी विभाग व स्थानीय कस्टम हायरिंग समितियों द्वारा अनुशंसित मानक रेंटल दरें हैं। ग्राम पंचायत में सरकारी मशीनरी रेंटल व सब्सिडी सहायता हेतु किसान कॉल सेंटर टोल-फ्री <strong>1800-180-1551</strong> पर संपर्क करें।
              </Typography>
            </Box>
          </Paper>

          {machineryList.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                textAlign: 'center',
                borderRadius: '16px',
                bgcolor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                mb: 3
              }}
            >
              <PrecisionManufacturingIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                कोई मशीनरी रेंटल डेटा उपलब्ध नहीं है
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 460, mx: 'auto', mb: 2 }}>
                शून्य गलत डेटा नीति (Zero-False-Data Policy) के तहत कोई फर्जी या अप्रमाणित नंबर नहीं दिखाया जाता। कस्टम हायरिंग सेंटर (CHC) मशीनरी बुकिंग व किराए की जानकारी हेतु किसान कॉल सेंटर पर सीधे संपर्क करें।
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CallIcon />}
                  onClick={() => openNativeDialer('18001801551')}
                  sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: 2 }}
                >
                  📞 किसान कॉल सेंटर (1800-180-1551)
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrecisionManufacturingIcon />}
                  onClick={loadFromMongo}
                  sx={{ fontWeight: 800, borderRadius: 2 }}
                >
                  🔄 पुनः प्रयास करें
                </Button>
              </Box>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {machineryList.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex' }}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: '16px',
                    border: '1.2px solid #c8e6c9',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(46, 125, 50, 0.05)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      boxShadow: '0 8px 20px rgba(46, 125, 50, 0.12)',
                      borderColor: '#81c784'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', mb: 0.5, borderRadius: '6px' }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.98rem', lineHeight: 1.25 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                            स्थान: <strong>{item.location}</strong> • संचालक: {item.contactName}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.05rem', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
                            {item.rate}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 600 }}>
                            किराया दर
                          </Typography>
                        </Box>
                      </Box>

                      {/* Feature chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, my: 1.2 }}>
                        {item.features.map((feat, i) => (
                          <Chip
                            key={i}
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#2e7d32' }} />}
                            label={feat}
                            size="small"
                            sx={{ bgcolor: '#f8fafc', fontSize: '0.72rem', height: 24, border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                          label={item.operatorIncluded ? '✅ चालक सहित' : 'केवल मशीन'}
                          size="small"
                          sx={{ bgcolor: '#f1f8e9', color: '#2e7d32', fontWeight: 800, fontSize: '0.7rem', height: 22, borderRadius: '6px' }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' }, mt: { xs: 0.5, sm: 0 } }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                            onClick={() => {
                              const msg = `नमस्ते, मुझे कस्टम हायरिंग सेंटर से (${item.title} - ${item.rate}) रेंटल हेतु जानकारी व बुकिंग मार्गदर्शन चाहिए।`;
                              openNativeWhatsApp(item.isHelpline ? '' : item.phone, msg);
                            }}
                            sx={{
                              borderColor: '#25D366',
                              color: '#128C7E',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              borderRadius: '10px',
                              minHeight: 38,
                              py: 0.5,
                              px: 1.2,
                              flex: { xs: 1, sm: 'initial' },
                              '&:hover': { bgcolor: '#e8f5e9', borderColor: '#128C7E' }
                            }}
                          >
                            मार्गदर्शन 💬
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CallIcon />}
                            onClick={() => { openNativeDialer(item.phone); }}
                            sx={{
                              bgcolor: '#1b5e20',
                              color: '#ffffff',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              borderRadius: '10px',
                              minHeight: 38,
                              py: 0.5,
                              px: 1.4,
                              flex: { xs: 1, sm: 'initial' },
                              '&:hover': { bgcolor: '#125420' }
                            }}
                          >
                            {item.isHelpline ? '1800-180-1551' : 'कॉल करें 📞'}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        </Box>
      )}

      {/* SUB-TAB 1: COMMUNITY FORUM Q&A */}
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
                bgcolor: '#1b5e20',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 800,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#125420' }
              }}
            >
              सवाल पूछें
            </Button>
          </Box>

          {questions.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                textAlign: 'center',
                borderRadius: '16px',
                bgcolor: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                mb: 3
              }}
            >
              <ForumIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                वर्तमान में कोई चौपाल प्रश्न उपलब्ध नहीं हैं
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', maxWidth: 440, mx: 'auto', mb: 2 }}>
                साथी किसानों व कृषि वैज्ञानिकों से मार्गदर्शन पाने के लिए अपना पहला सवाल पूछें।
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenAskModal(true)}
                sx={{ bgcolor: '#1b5e20', fontWeight: 800, borderRadius: 2 }}
              >
                + पहला सवाल पूछें
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {questions.map((q) => (
              <Grid item xs={12} md={6} key={q.id} sx={{ display: 'flex' }}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: '16px',
                    border: '1.2px solid #e2e8f0',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }
                  }}
                >
                  <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Chip
                            label={q.crop}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', height: 20, borderRadius: '6px' }}
                          />
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem' }}>
                            {q.author} • {q.time}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<VolumeUpIcon sx={{ fontSize: 14 }} />}
                          onClick={() => speakText(`${q.question}. समाधान: ${q.bestAnswer}`)}
                          sx={{ color: '#1b5e20', fontSize: '0.7rem', p: 0.4, borderRadius: '6px' }}
                        >
                          सुनें
                        </Button>
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem', mb: 1.2, lineHeight: 1.35 }}>
                        ❓ {q.question}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 1 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 1.2, sm: 1.5 },
                          bgcolor: '#f1f8e9',
                          border: '1px solid #c8e6c9',
                          borderRadius: '12px',
                          mb: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <QuestionAnswerIcon sx={{ color: '#1b5e20', fontSize: 15 }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.75rem' }}>
                              ताजा समाधान ({q.answersCount || (q.replies?.length ?? 1)} उत्तर):
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontSize: { xs: '0.8rem', sm: '0.84rem' }, lineHeight: 1.45 }}>
                          {q.bestAnswer || (q.replies && q.replies[q.replies.length - 1]?.text) || 'समाधान प्रक्रियाधीन है।'}
                        </Typography>

                        {/* Recent Replies Thread */}
                        {q.replies && q.replies.length > 1 && (
                          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #a5d6a7' }}>
                            {q.replies.slice(-2).map((rep) => (
                              <Box key={rep.id || rep._id} sx={{ mb: 0.5, p: 0.6, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '6px', fontSize: '0.72rem', color: '#1b5e20' }}>
                                <strong>{rep.author}</strong> ({rep.role || 'किसान भाई'}): {rep.text}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Paper>

                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<ReplyIcon sx={{ fontSize: 16 }} />}
                        onClick={() => {
                          setSelectedQuestionForReply(q);
                          setReplyForm({
                            author: activeFarmer?.name || '',
                            role: 'किसान भाई',
                            text: ''
                          });
                          setOpenReplyModal(true);
                        }}
                        sx={{
                          color: '#1b5e20',
                          borderColor: '#a5d6a7',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          borderRadius: 2,
                          py: 0.6,
                          minHeight: 36,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#e8f5e9', borderColor: '#2e7d32' }
                        }}
                      >
                        💬 अपना समाधान / उत्तर लिखें
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        </Box>
      )}

      {/* SUB-TAB 2: FARM DIARY */}
      {subTab === 2 && (
        <Box>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.1 }}>
                  📖 मेरी फसल डायरी (My Farm Diary)
                </Typography>
                {isDiaryCloudSynced ? (
                  <Chip
                    icon={<CloudDoneIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
                    label="क्लाउड सुरक्षित"
                    size="small"
                    sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
                  />
                ) : (
                  <Chip
                    icon={<CloudOffIcon sx={{ fontSize: '13px !important', color: '#64748b' }} />}
                    label="लोकल ऑफ़लाइन"
                    size="small"
                    sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                अपनी फसलें दर्ज करें और सिंचाई व खाद का रिमाइंडर पाएं
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => {
                  const active = getActiveFarmer();
                  generateAndPrintKccReport({
                    farmerName: active?.name || 'सम्मानित कृषक',
                    phone: active?.phone || '',
                    village: active?.village || 'ग्राम',
                    district: active?.district || 'रायपुर',
                    items: farmDiary
                  });
                }}
                sx={{
                  borderColor: '#2e7d32',
                  color: '#1b5e20',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#e8f5e9', borderColor: '#1b5e20' }
                }}
              >
                🖨️ KCC प्रिंट / PDF
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenDiaryModal(true)}
                sx={{
                  bgcolor: '#2e7d32',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
              >
                फसल जोड़ें
              </Button>
            </Box>
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
            <Grid container spacing={2}>
              {farmDiary.map((item) => (
                <Grid item xs={12} sm={6} md={6} key={item.id} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: '1.5px solid #a5d6a7',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      '&:hover': { boxShadow: '0 6px 16px rgba(27,94,32,0.1)' }
                    }}
                  >
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDiaryEntry(item.id)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
                          aria-label="हटाएं"
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>

                      <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#fffde7', border: '1px solid #fff59d', borderRadius: 2, mt: 'auto' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#f57f17', display: 'block', fontSize: '0.74rem' }}>
                          🔔 आगामी कार्य व सिफारिश (Next Step):
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#795548', fontSize: '0.8rem', lineHeight: 1.35 }}>
                          {item.nextAction}
                        </Typography>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Ask Question Dialog with Voice & Zero-Typing */}
      <Dialog open={openAskModal} onClose={() => setOpenAskModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.1rem', pb: 1 }}>
          {isChhattisgarhi ? '❓ किसान चौपाल म सवाल पूछव' : '❓ किसान चौपाल में सवाल पूछें'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          {/* Prominent Voice Input Button */}
          <Button
            fullWidth
            variant={isVoiceListening ? 'contained' : 'outlined'}
            color={isVoiceListening ? 'error' : 'success'}
            onClick={handleToggleVoiceQuestion}
            startIcon={<MicIcon sx={{ fontSize: 22 }} />}
            sx={{
              py: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.84rem',
              boxShadow: isVoiceListening ? '0 0 14px rgba(211, 47, 47, 0.4)' : 'none',
              animation: isVoiceListening ? 'pulse 1.2s infinite' : 'none'
            }}
          >
            {isVoiceListening
              ? (isChhattisgarhi ? '🛑 सुनत हन... बोलव (रोके बर दबावहू)' : '🛑 सुन रहे हैं... बोलें (रोकने हेतु दबाएं)')
              : (isChhattisgarhi ? '🎙️ बोलके सवाल पूछव (माइक छुअहू)' : '🎙️ बोलकर सवाल पूछें (माइक दबाएं)')}
          </Button>

          <TextField
            fullWidth
            size="small"
            label={isChhattisgarhi ? 'तुंहर नाव व गांव' : 'आपका नाम व गांव'}
            value={newQuestion.author}
            onChange={(e) => setNewQuestion({ ...newQuestion, author: e.target.value })}
          />

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
              {isChhattisgarhi ? '🌾 फसल चुनव (1-टैप):' : '🌾 फसल चुनें (1-टैप):'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
              {[
                { label: isChhattisgarhi ? '🌾 धान (चांउर)' : '🌾 धान', val: 'धान' },
                { label: isChhattisgarhi ? '🟤 चना (बूट)' : '🟤 चना', val: 'चना' },
                { label: isChhattisgarhi ? '🌽 मक्का (जुनहरी)' : '🌽 मक्का', val: 'मक्का' },
                { label: isChhattisgarhi ? '🌾 तीवड़ा (लाखड़ी)' : '🌾 तीवड़ा', val: 'तीवड़ा' },
                { label: '🟡 सोयाबीन', val: 'सोयाबीन' },
                { label: '🌾 गेहूं', val: 'गेहूं' }
              ].map((c) => (
                <Chip
                  key={c.val}
                  label={c.label}
                  size="small"
                  clickable
                  onClick={() => setNewQuestion({ ...newQuestion, crop: c.val })}
                  sx={{
                    fontWeight: newQuestion.crop === c.val ? 800 : 600,
                    bgcolor: newQuestion.crop === c.val ? '#1b5e20' : '#f1f5f9',
                    color: newQuestion.crop === c.val ? '#fff' : '#334155',
                    fontSize: '0.74rem'
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label={isChhattisgarhi ? 'तुंहर सवाल (बोलव या लिखव)' : 'अपना सवाल (बोलें या लिखें)'}
            value={newQuestion.questionText}
            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
            placeholder={isChhattisgarhi ? 'उदा. धान म बालियां निकलत बेरा कौन सा दवाई छिड़कना चाही?' : 'जैसे: धान में बालियां निकलते समय कौन सा कीटनाशक डालना चाहिए?'}
            InputProps={{
              endAdornment: newQuestion.questionText ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setNewQuestion({ ...newQuestion, questionText: '' })}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />

          {/* Quick Question Template Chips (Zero-Typing) */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.5 }}>
              ⚡ 1-टैप सामान्य सवाल:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {[
                '🌾 धान म गाभा कीट (तना छेदक) के उपाय का हे?',
                '🍂 पाना म धब्बा (ब्लास्ट) दिखत हे, कौन दवाई छिड़कन?',
                '🧪 यूरिया अउ डीएपी के सही मात्रा कतका हे?',
                '💧 धान म पहिली पानी (सिंचाई) कब देना चाही?'
              ].map((template, idx) => (
                <Chip
                  key={idx}
                  label={template}
                  size="small"
                  clickable
                  onClick={() => setNewQuestion(prev => ({ ...prev, questionText: template }))}
                  sx={{
                    justifyContent: 'flex-start',
                    fontSize: '0.73rem',
                    bgcolor: '#f8fafc',
                    color: '#1e293b',
                    border: '1px solid #e2e8f0',
                    '&:hover': { bgcolor: '#e2e8f0' }
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAskModal(false)} sx={{ color: '#666' }}>{isChhattisgarhi ? 'रद्द करव' : 'रद्द करें'}</Button>
          <Button variant="contained" onClick={handlePostQuestion} sx={{ bgcolor: '#2e7d32', borderRadius: 2, fontWeight: 700 }}>
            {isChhattisgarhi ? 'सवाल भेजव ➔' : 'सवाल भेजें ➔'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Diary Crop Dialog with Zero-Typing Chips */}
      <Dialog open={openDiaryModal} onClose={() => setOpenDiaryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.1rem' }}>
          {isChhattisgarhi ? '🌱 नवा फसल डायरी म जोड़व' : '🌱 नई फसल दर्ज करें'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          {/* Quick Crop Chips */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
              {isChhattisgarhi ? '🌾 फसल चुनव:' : '🌾 फसल चुनें:'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
              {[
                'धान (सरना)',
                'धान (एचएमटी)',
                'चना (बूट)',
                'सोयाबीन',
                'मक्का (जुनहरी)',
                'तीवड़ा (लाखड़ी)'
              ].map((cropName) => (
                <Chip
                  key={cropName}
                  label={cropName}
                  size="small"
                  clickable
                  onClick={() => setNewCropEntry({ ...newCropEntry, cropName })}
                  sx={{
                    fontWeight: newCropEntry.cropName === cropName ? 800 : 600,
                    bgcolor: newCropEntry.cropName === cropName ? '#1b5e20' : '#f1f5f9',
                    color: newCropEntry.cropName === cropName ? '#fff' : '#334155',
                    fontSize: '0.74rem'
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            size="small"
            label="फसल व किस्म (उदा. धान सरना, गेहूं लोक-1)"
            value={newCropEntry.cropName}
            onChange={(e) => setNewCropEntry({ ...newCropEntry, cropName: e.target.value })}
          />

          {/* Quick Area Chips */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
              {isChhattisgarhi ? '📐 रकबा चुनव (एकड़):' : '📐 रकबा चुनें (एकड़):'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              {['1', '2', '2.5', '3', '5'].map((area) => (
                <Chip
                  key={area}
                  label={`${area} एकड़`}
                  size="small"
                  clickable
                  onClick={() => setNewCropEntry({ ...newCropEntry, areaAcres: area })}
                  sx={{
                    fontWeight: newCropEntry.areaAcres === area ? 800 : 600,
                    bgcolor: newCropEntry.areaAcres === area ? '#2e7d32' : '#f1f5f9',
                    color: newCropEntry.areaAcres === area ? '#fff' : '#334155',
                    fontSize: '0.74rem'
                  }}
                />
              ))}
            </Box>
          </Box>

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
          <Button onClick={() => setOpenDiaryModal(false)} sx={{ color: '#666' }}>{isChhattisgarhi ? 'रद्द करव' : 'रद्द करें'}</Button>
          <Button variant="contained" onClick={handleSaveDiary} sx={{ bgcolor: '#2e7d32', borderRadius: 2, fontWeight: 700 }}>
            {isChhattisgarhi ? 'डायरी म जोड़व' : 'डायरी में जोड़ें'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Machinery Listing Dialog */}
      <Dialog open={openAddMachineryModal} onClose={() => setOpenAddMachineryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.1rem' }}>
          🚜 अपनी मशीन किराए पर जोड़ें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="मशीन / यंत्र का नाम *"
            placeholder="उदा. स्वराज 744 FE + रोटावेटर या कृषि ड्रोन"
            value={newMachine.title}
            onChange={(e) => setNewMachine({ ...newMachine, title: e.target.value })}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="यंत्र की श्रेणी *"
            value={newMachine.category}
            onChange={(e) => setNewMachine({ ...newMachine, category: e.target.value })}
          >
            <MenuItem value="जुताई एवं खेत तैयारी">जुताई एवं खेत तैयारी</MenuItem>
            <MenuItem value="कटाई व थ्रेशिंग">कटाई व थ्रेशिंग</MenuItem>
            <MenuItem value="आधुनिक छिड़काव तकनीक">आधुनिक छिड़काव तकनीक (ड्रोन)</MenuItem>
            <MenuItem value="जल संरक्षण एवं लेवलिंग">जल संरक्षण एवं लेवलिंग</MenuItem>
            <MenuItem value="सामान्य मशीनरी">सामान्य मशीनरी</MenuItem>
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="किराया दर *"
            placeholder="उदा. ₹900 - ₹1,100 / घंटा या ₹350 / एकड़"
            value={newMachine.rate}
            onChange={(e) => setNewMachine({ ...newMachine, rate: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="संचालक / मालिक का नाम"
            value={newMachine.contactName}
            onChange={(e) => setNewMachine({ ...newMachine, contactName: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="मोबाइल नंबर (10 अंक) *"
            type="tel"
            value={newMachine.phone}
            onChange={(e) => setNewMachine({ ...newMachine, phone: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="स्थान / ब्लॉक / तहसील"
            value={newMachine.location}
            onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
          />
          <TextField
            fullWidth
            size="small"
            label="विशेषताएं (कॉमा से अलग करें)"
            placeholder="उदा. गहरी जुताई, 10 मिनट में छिड़काव, स्ट्रॉ रीपर"
            value={newMachine.features}
            onChange={(e) => setNewMachine({ ...newMachine, features: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newMachine.operatorIncluded}
                onChange={(e) => setNewMachine({ ...newMachine, operatorIncluded: e.target.checked })}
                color="success"
              />
            }
            label={newMachine.operatorIncluded ? '✅ चालक (ऑपरेटर) सहित' : 'केवल मशीन (स्वयं चलाएं)'}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddMachineryModal(false)} sx={{ color: '#666' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handlePostMachinery} sx={{ bgcolor: '#1b5e20', borderRadius: 2 }}>
            मशीन जोड़ें
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply to Community Question Dialog */}
      <Dialog open={openReplyModal} onClose={() => setOpenReplyModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.1rem' }}>
          💬 चौपाल में समाधान / उत्तर लिखें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
          {selectedQuestionForReply && (
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                सवाल ({selectedQuestionForReply.crop}):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {selectedQuestionForReply.question}
              </Typography>
            </Paper>
          )}
          <TextField
            fullWidth
            size="small"
            label="आपका नाम"
            value={replyForm.author}
            onChange={(e) => setReplyForm({ ...replyForm, author: e.target.value })}
          />
          <TextField
            select
            fullWidth
            size="small"
            label="आपकी भूमिका (Role)"
            value={replyForm.role}
            onChange={(e) => setReplyForm({ ...replyForm, role: e.target.value })}
          >
            <MenuItem value="किसान भाई">किसान भाई (Farmer)</MenuItem>
            <MenuItem value="कृषि वैज्ञानिक / विशेषज्ञ">कृषि वैज्ञानिक / विशेषज्ञ (Scientist)</MenuItem>
            <MenuItem value="समिति प्रबंधक / RAEO">समिति प्रबंधक / RAEO</MenuItem>
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="आपका अनुभव व वैज्ञानिक समाधान *"
            placeholder="विस्तार से उपाय, दवा का नाम, मात्रा व सावधानी लिखें..."
            value={replyForm.text}
            onChange={(e) => setReplyForm({ ...replyForm, text: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenReplyModal(false)} sx={{ color: '#666' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handlePostReply} sx={{ bgcolor: '#1b5e20', borderRadius: 2 }}>
            उत्तर भेजें
          </Button>
        </DialogActions>
      </Dialog>

      <MeraKhetModal
        open={openMeraKhetModal}
        onClose={() => setOpenMeraKhetModal(false)}
      />
    </Box>
  );
};
