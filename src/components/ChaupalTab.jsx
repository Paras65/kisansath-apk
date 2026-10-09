import React, { useState, useEffect, useMemo } from 'react';
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
  MenuItem,
  FormControlLabel,
  Switch
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
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PrintIcon from '@mui/icons-material/Print';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import ClearIcon from '@mui/icons-material/Clear';
import VerifiedIcon from '@mui/icons-material/Verified';
import { notify } from '../services/notificationService';
import { speakText } from '../utils/speech';
import { useLanguage } from '../utils/i18n';
import { KakaWalkthroughButton } from './KakaWalkthroughButton';
import { startVoiceRecognition, stopVoiceRecognition } from '../utils/speechRecognition';
import { MACHINERY_RENTALS, COMMUNITY_QA } from '../data/kisanData';
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
  const { isChhattisgarhi } = useLanguage();
  const [subTab, setSubTab] = useState(0); // 0: Machinery, 1: Chaupal Q&A, 2: Farm Diary
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());

  // Filters
  const [machineryFilter, setMachineryFilter] = useState('all');
  const [qaCropFilter, setQaCropFilter] = useState('all');

  // Modals
  const [openAskModal, setOpenAskModal] = useState(false);
  const [openDiaryModal, setOpenDiaryModal] = useState(false);
  const [openMeraKhetModal, setOpenMeraKhetModal] = useState(false);
  const [openAddMachineryModal, setOpenAddMachineryModal] = useState(false);
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [selectedQuestionForReply, setSelectedQuestionForReply] = useState(null);

  // Voice state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isDiaryCloudSynced, setIsDiaryCloudSynced] = useState(false);

  // Machinery Add Modal state
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

  // Reply Form state
  const [replyForm, setReplyForm] = useState({
    author: activeFarmer?.name || '',
    role: 'किसान भाई',
    text: ''
  });

  // Question Form state
  const [newQuestion, setNewQuestion] = useState({
    author: activeFarmer?.name || '',
    crop: 'धान',
    questionText: ''
  });

  // Diary Entry state
  const [newCropEntry, setNewCropEntry] = useState({
    cropName: 'धान (सरना)',
    areaAcres: '2',
    sowDate: new Date().toISOString().split('T')[0]
  });

  // Initialize with verified baseline from kisanData.js (Zero Empty Screen Guarantee)
  const [machineryList, setMachineryList] = useState(() => {
    const cached = getCachedModuleData('machinery');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return Array.isArray(MACHINERY_RENTALS) && MACHINERY_RENTALS.length > 0 ? MACHINERY_RENTALS : [];
  });

  const [questions, setQuestions] = useState(() => {
    const cached = getCachedModuleData('community_qa');
    if (cached && Array.isArray(cached.data) && cached.data.length > 0) return cached.data;
    return Array.isArray(COMMUNITY_QA) && COMMUNITY_QA.length > 0 ? COMMUNITY_QA : [];
  });

  const [farmDiary, setFarmDiary] = useState(() => {
    const saved = localStorage.getItem('kisan_farm_diary');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Load from MongoDB / Background Sync
  const loadFromMongo = async () => {
    try {
      const liveMachinery = await getMachinery();
      if (liveMachinery && Array.isArray(liveMachinery) && liveMachinery.length > 0) {
        setMachineryList(liveMachinery);
      }
      const liveQA = await getCommunityQA();
      if (liveQA && Array.isArray(liveQA) && liveQA.length > 0) {
        setQuestions(liveQA);
      }

      const currentFarmer = getActiveFarmer();
      setActiveFarmer(currentFarmer);
      if (currentFarmer && currentFarmer.phone) {
        const diaryResult = await getFarmerDiary(currentFarmer.phone);
        if (diaryResult && Array.isArray(diaryResult.data)) {
          setFarmDiary(diaryResult.data);
          setIsDiaryCloudSynced(diaryResult.isCloudSynced);
        }
      }
    } catch (e) {
      // Gracefully retain baseline
    }
  };

  useEffect(() => {
    loadFromMongo();
    return () => {
      stopVoiceRecognition();
    };
  }, []);

  // Filtered Machinery
  const filteredMachinery = useMemo(() => {
    if (machineryFilter === 'all') return machineryList;
    return (machineryList || []).filter((item) => {
      const cat = String(item.category || '').toLowerCase();
      const title = String(item.title || '').toLowerCase();
      const target = machineryFilter.toLowerCase();
      return cat.includes(target) || title.includes(target);
    });
  }, [machineryList, machineryFilter]);

  // Filtered Chaupal Questions
  const filteredQuestions = useMemo(() => {
    if (qaCropFilter === 'all') return questions;
    return (questions || []).filter((q) => {
      const crop = String(q.crop || '').toLowerCase();
      const question = String(q.question || '').toLowerCase();
      const target = qaCropFilter.toLowerCase();
      return crop.includes(target) || question.includes(target);
    });
  }, [questions, qaCropFilter]);

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

  const handlePostQuestion = async () => {
    if (!newQuestion.questionText) {
      notify.warning('कृपया अपना सवाल विस्तार से लिखें');
      return;
    }
    const item = {
      id: `qa-${Date.now()}`,
      author: newQuestion.author || activeFarmer?.name || (isChhattisgarhi ? 'किसान संगी' : 'किसान भाई'),
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

    await postCommunityQuestion({
      author: item.author,
      crop: item.crop,
      question: item.question
    });
    setQuestions([item, ...questions]);
    setOpenAskModal(false);
    setNewQuestion({ author: activeFarmer?.name || '', crop: 'धान', questionText: '' });
    notify.success('आपका सवाल किसान चौपाल में साझा कर दिया गया है!');
  };

  const handlePostReply = async () => {
    if (!selectedQuestionForReply) return;
    if (!replyForm.text || replyForm.text.trim().length < 3) {
      notify.warning('कृपया कम से कम 3 अक्षरों का समाधान लिखें');
      return;
    }

    const payload = {
      author: replyForm.author || activeFarmer?.name || (isChhattisgarhi ? 'किसान संगी' : 'किसान साथी'),
      role: replyForm.role || 'किसान भाई',
      text: replyForm.text.trim()
    };

    const updatedQA = await postCommunityReply(selectedQuestionForReply.id, payload);
    if (updatedQA) {
      setQuestions(questions.map((q) => (q.id === updatedQA.id ? updatedQA : q)));
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
        ? newMachine.features.split(',').map((f) => f.trim()).filter(Boolean)
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

  // Machinery Category Filter Chips
  const machineryCategories = [
    { label: isChhattisgarhi ? 'सबो यंत्र' : 'सभी यंत्र (All)', val: 'all' },
    { label: isChhattisgarhi ? '🚜 जुताई व ट्रैक्टर' : '🚜 जुताई व ट्रैक्टर', val: 'जुताई' },
    { label: isChhattisgarhi ? '🌾 कटाई व मिंजाई' : '🌾 कटाई व हार्वेस्टर', val: 'कटाई' },
    { label: isChhattisgarhi ? '🚁 कृषि ड्रोन' : '🚁 कृषि ड्रोन स्प्रेयर', val: 'छिड़काव' },
    { label: isChhattisgarhi ? '💧 लेवलर व सिंचाई' : '💧 लेजर लैंड लेवलर', val: 'लेवलर' }
  ];

  // Chaupal Crop Filter Chips
  const qaCropChips = [
    { label: isChhattisgarhi ? 'सबो सवाल' : 'सभी सवाल (All)', val: 'all' },
    { label: isChhattisgarhi ? '🌾 धान (चांउर)' : '🌾 धान (Paddy)', val: 'धान' },
    { label: isChhattisgarhi ? '🟤 चना (बूट)' : '🟤 चना (Gram)', val: 'चना' },
    { label: '🟡 सोयाबीन', val: 'सोयाबीन' },
    { label: isChhattisgarhi ? '🌽 मक्का (जुनहरी)' : '🌽 मक्का', val: 'मक्का' },
    { label: isChhattisgarhi ? '🏛️ धान उपार्जन' : '🏛️ सरकारी उपार्जन', val: 'उपार्जन' }
  ];

  return (
    <Box sx={{ pb: 2, pt: 0 }} className="fade-in">
      {/* 1. Header Capsule */}
      <Box
        sx={{
          mb: 1.5,
          p: 1.2,
          px: 1.5,
          borderRadius: '16px',
          bgcolor: '#ffffff',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          border: '1px solid #c8e6c9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              width: 38,
              height: 38,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(27, 94, 32, 0.25)',
              color: '#ffffff'
            }}
          >
            <AgricultureIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1rem', lineHeight: 1.15 }}>
              किसान चौपाल व सेवा केंद्र
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
              कस्टम हायरिंग रेंटल • सामुदायिक मंच • फसल डायरी
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <KakaWalkthroughButton featureId={subTab === 0 ? 'machinery' : subTab === 1 ? 'chaupal' : 'diary'} />

          <Button
            variant="outlined"
            size="small"
            startIcon={<CallIcon sx={{ fontSize: 14 }} />}
            onClick={() => openNativeDialer('18001801551')}
            sx={{
              borderColor: '#81c784',
              color: '#1b5e20',
              bgcolor: '#f1f8e9',
              fontSize: '0.72rem',
              fontWeight: 800,
              borderRadius: '10px',
              py: 0.4,
              px: 1.1,
              textTransform: 'none',
              '&:hover': { bgcolor: '#e8f5e9', borderColor: '#4caf50' }
            }}
          >
            1800-180-1551
          </Button>
        </Box>
      </Box>

      {/* 2. Modern 3-Tab Segmented Pill Navigation */}
      <Paper
        elevation={0}
        sx={{
          mb: 1.5,
          p: 0.5,
          borderRadius: '14px',
          bgcolor: '#e2e8f0',
          display: 'flex',
          gap: 0.6
        }}
      >
        {[
          { label: isChhattisgarhi ? `🚜 मशीन किराया (${machineryList.length})` : `🚜 मशीन किराया (${machineryList.length})`, icon: <PrecisionManufacturingIcon sx={{ fontSize: 16 }} /> },
          { label: isChhattisgarhi ? `💬 किसान चौपाल (${questions.length})` : `💬 किसान चौपाल (${questions.length})`, icon: <ForumIcon sx={{ fontSize: 16 }} /> },
          { label: isChhattisgarhi ? '📖 मोर फसल डायरी' : '📖 फसल डायरी', icon: <BookmarksIcon sx={{ fontSize: 16 }} /> }
        ].map((item, idx) => (
          <Button
            key={idx}
            fullWidth
            size="small"
            onClick={() => setSubTab(idx)}
            startIcon={item.icon}
            sx={{
              py: 0.75,
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'none',
              bgcolor: subTab === idx ? '#ffffff' : 'transparent',
              color: subTab === idx ? '#1b5e20' : '#475569',
              boxShadow: subTab === idx ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: subTab === idx ? '#ffffff' : '#f1f5f9' }
            }}
          >
            {item.label}
          </Button>
        ))}
      </Paper>

      {/* ============================================================ */}
      {/* SUB-TAB 0: MACHINERY & DRONE RENTAL */}
      {/* ============================================================ */}
      {subTab === 0 && (
        <Box>
          {/* Action Row & 1-Tap Category Filter Pills */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 0.6,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                py: 0.3
              }}
            >
              {machineryCategories.map((cat) => {
                const isSelected = machineryFilter === cat.val;
                return (
                  <Chip
                    key={cat.val}
                    label={cat.label}
                    clickable
                    size="small"
                    onClick={() => setMachineryFilter(cat.val)}
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.74rem',
                      borderRadius: '14px',
                      bgcolor: isSelected ? '#1b5e20' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #1b5e20' : '1px solid #cbd5e1',
                      flexShrink: 0
                    }}
                  />
                );
              })}
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenAddMachineryModal(true)}
              sx={{
                bgcolor: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.76rem',
                borderRadius: '10px',
                py: 0.6,
                px: 1.4,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#125420' }
              }}
            >
              + मशीन जोड़ें
            </Button>
          </Box>

          {/* Machinery Cards Grid */}
          <Grid container spacing={1.5}>
            {filteredMachinery.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex' }}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: '16px',
                    border: '1.2px solid #c8e6c9',
                    bgcolor: '#ffffff',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(27, 94, 32, 0.04)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      boxShadow: '0 6px 18px rgba(27, 94, 32, 0.1)',
                      borderColor: '#81c784'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.8, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      {/* Top Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.66rem', mb: 0.4, borderRadius: '6px' }}
                          />
                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.98rem', lineHeight: 1.25 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                            📍 {item.location} • {item.contactName}
                          </Typography>
                        </Box>

                        <Paper
                          elevation={0}
                          sx={{
                            p: 0.6,
                            px: 1,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            border: '1px solid #86efac',
                            textAlign: 'right'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#166534', fontSize: '0.94rem', lineHeight: 1.1 }}>
                            {item.rate}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.64rem', fontWeight: 700 }}>
                            किराया दर
                          </Typography>
                        </Paper>
                      </Box>

                      {/* Features Wrap */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.2 }}>
                        {Array.isArray(item.features) && item.features.map((feat, i) => (
                          <Chip
                            key={i}
                            icon={<CheckCircleIcon sx={{ fontSize: '12px !important', color: '#16a34a' }} />}
                            label={feat}
                            size="small"
                            sx={{ bgcolor: '#f8fafc', fontSize: '0.68rem', height: 22, border: '1px solid #e2e8f0', borderRadius: '6px' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Action Row */}
                    <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8 }}>
                      <Chip
                        label={item.operatorIncluded ? '✅ चालक सहित' : 'केवल मशीन'}
                        size="small"
                        sx={{ bgcolor: '#f1f8e9', color: '#2e7d32', fontWeight: 800, fontSize: '0.66rem', height: 22, borderRadius: '6px' }}
                      />

                      <Box sx={{ display: 'flex', gap: 0.8 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<WhatsAppIcon sx={{ color: '#25D366', fontSize: 15 }} />}
                          onClick={() => {
                            const msg = isChhattisgarhi
                              ? `प्रणाम, मोला कस्टम हायरिंग सेंटर ले (${item.title} - ${item.rate}) रेंटल बर जानकारी अउ बुकिंग करना हे।`
                              : `नमस्ते, मुझे कस्टम हायरिंग सेंटर से (${item.title} - ${item.rate}) रेंटल हेतु जानकारी व बुकिंग मार्गदर्शन चाहिए।`;
                            openNativeWhatsApp(item.isHelpline ? '' : item.phone, msg);
                          }}
                          sx={{
                            borderColor: '#25D366',
                            color: '#128C7E',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            borderRadius: '8px',
                            py: 0.4,
                            px: 1,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#e8f5e9', borderColor: '#128C7E' }
                          }}
                        >
                          व्हाट्सएप
                        </Button>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CallIcon sx={{ fontSize: 14 }} />}
                          onClick={() => { openNativeDialer(item.phone); }}
                          sx={{
                            bgcolor: '#1b5e20',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            borderRadius: '8px',
                            py: 0.4,
                            px: 1.2,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#125420' }
                          }}
                        >
                          कॉल करें
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

      {/* ============================================================ */}
      {/* SUB-TAB 1: COMMUNITY FORUM Q&A */}
      {/* ============================================================ */}
      {subTab === 1 && (
        <Box>
          {/* Action Row & 1-Tap Crop Filter Pills */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 0.6,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                py: 0.3
              }}
            >
              {qaCropChips.map((c) => {
                const isSelected = qaCropFilter === c.val;
                return (
                  <Chip
                    key={c.val}
                    label={c.label}
                    clickable
                    size="small"
                    onClick={() => setQaCropFilter(c.val)}
                    sx={{
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.74rem',
                      borderRadius: '14px',
                      bgcolor: isSelected ? '#1b5e20' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #1b5e20' : '1px solid #cbd5e1',
                      flexShrink: 0
                    }}
                  />
                );
              })}
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={() => setOpenAskModal(true)}
              sx={{
                bgcolor: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.76rem',
                borderRadius: '10px',
                py: 0.6,
                px: 1.4,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#125420' }
              }}
            >
              + सवाल पूछें
            </Button>
          </Box>

          {/* Q&A Cards Grid */}
          <Grid container spacing={1.5}>
            {filteredQuestions.map((q) => (
              <Grid item xs={12} md={6} key={q.id} sx={{ display: 'flex' }}>
                <Card
                  className="touch-card"
                  sx={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    bgcolor: '#ffffff',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }
                  }}
                >
                  <CardContent sx={{ p: 1.8, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <Box>
                      {/* Top Bar */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Chip
                            label={q.crop}
                            size="small"
                            sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.68rem', height: 22, borderRadius: '6px' }}
                          />
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                            {q.author} • {q.time}
                          </Typography>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => speakText(`${q.question}. समाधान: ${q.bestAnswer}`)}
                          sx={{ color: '#166534', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', p: 0.5 }}
                        >
                          <VolumeUpIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Box>

                      {/* Question Text */}
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem', mb: 1.2, lineHeight: 1.35 }}>
                        ❓ {q.question}
                      </Typography>

                      {/* Verified Answer Paper */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.2,
                          bgcolor: '#f0fdf4',
                          border: '1.2px solid #bbf7d0',
                          borderRadius: '12px',
                          mb: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                          <VerifiedIcon sx={{ color: '#16a34a', fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.74rem' }}>
                            कृषि वैज्ञानिक समाधान:
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.8rem', lineHeight: 1.45 }}>
                          {q.bestAnswer || (q.replies && q.replies[q.replies.length - 1]?.text) || 'समाधान प्रक्रियाधीन है।'}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Bottom Action */}
                    <Box sx={{ pt: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                        {q.answersCount || (q.replies?.length ?? 1)} उत्तर दर्ज
                      </Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReplyIcon sx={{ fontSize: 15 }} />}
                        onClick={() => {
                          setSelectedQuestionForReply(q);
                          setReplyForm({ author: activeFarmer?.name || '', role: 'किसान भाई', text: '' });
                          setOpenReplyModal(true);
                        }}
                        sx={{
                          color: '#1b5e20',
                          borderColor: '#a5d6a7',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          borderRadius: '8px',
                          py: 0.3,
                          px: 1.2,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#e8f5e9', borderColor: '#2e7d32' }
                        }}
                      >
                        उत्तर लिखें
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ============================================================ */}
      {/* SUB-TAB 2: FARM DIARY & KCC */}
      {/* ============================================================ */}
      {subTab === 2 && (
        <Box>
          {/* Top Banner linking to Mera Khet Multi-Plot Manager */}
          <Paper
            elevation={0}
            onClick={() => setOpenMeraKhetModal(true)}
            sx={{
              p: 1.6,
              mb: 1.5,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.2,
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.2)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <AgricultureIcon sx={{ fontSize: 30, color: '#ffeb3b' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff', fontSize: '0.94rem', lineHeight: 1.2 }}>
                  🌾 मेरा खेत: बहु-फसली स्मार्ट ट्रैकर
                </Typography>
                <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem' }}>
                  धान, चना, सब्जी का अलग-अलग A to Z हिसाब व आज का कार्य
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 900, fontSize: '0.72rem', borderRadius: '8px', textTransform: 'none' }}
            >
              खोलें ➔
            </Button>
          </Paper>

          {/* Action Row */}
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              {isDiaryCloudSynced ? (
                <Chip
                  icon={<CloudDoneIcon sx={{ fontSize: '13px !important', color: '#166534' }} />}
                  label="क्लाउड सुरक्षित"
                  size="small"
                  sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 800, fontSize: '0.66rem', height: 22 }}
                />
              ) : (
                <Chip
                  icon={<CloudOffIcon sx={{ fontSize: '13px !important', color: '#64748b' }} />}
                  label="लोकल ऑफ़लाइन"
                  size="small"
                  sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 800, fontSize: '0.66rem', height: 22 }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.8 }}>
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
                  py: 0.5,
                  px: 1.2,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#e8f5e9' }
                }}
              >
                🖨️ KCC रिपोर्ट / PDF
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleIcon />}
                onClick={() => setOpenDiaryModal(true)}
                sx={{
                  bgcolor: '#2e7d32',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: '10px',
                  py: 0.5,
                  px: 1.4,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
              >
                + फसल जोड़ें
              </Button>
            </Box>
          </Box>

          {/* Farm Diary Cards */}
          {farmDiary.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px', bgcolor: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
              <EventNoteIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>
                वर्तमान में कोई फसल डायरी दर्ज नहीं है
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
                ऊपर दिए गए '+ फसल जोड़ें' बटन से अपनी वर्तमान फसल का हिसाब रिकॉर्ड करें।
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => setOpenDiaryModal(true)}
                sx={{ bgcolor: '#2e7d32', fontWeight: 800, borderRadius: '8px', textTransform: 'none' }}
              >
                फसल जोड़ें
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={1.5}>
              {farmDiary.map((item) => (
                <Grid item xs={12} sm={6} key={item.id} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      width: '100%',
                      borderRadius: '16px',
                      border: '1.5px solid #a5d6a7',
                      bgcolor: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <CardContent sx={{ p: 1.8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Chip
                            label={`${item.areaAcres} एकड़`}
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.68rem', mb: 0.3 }}
                          />
                          <Typography variant="h6" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.02rem', lineHeight: 1.2 }}>
                            {item.cropName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                            बुआई तिथि: <strong>{item.sowDate}</strong> • अवस्था: {item.stage}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDiaryEntry(item.id)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
                        >
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Box>

                      <Paper elevation={0} sx={{ p: 1, bgcolor: '#fffde7', border: '1px solid #fff59d', borderRadius: '10px', mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#b45309', display: 'block', fontSize: '0.7rem' }}>
                          🔔 आगामी कार्य (Next Action):
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350f', fontSize: '0.76rem', lineHeight: 1.35 }}>
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

      {/* Modal 1: Ask Community Question */}
      <Dialog open={openAskModal} onClose={() => setOpenAskModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', pb: 1 }}>
          ❓ {isChhattisgarhi ? 'चौपाल म सवाल पूछव' : 'किसान चौपाल में सवाल पूछें'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, pt: 1 }}>
          <Button
            fullWidth
            variant={isVoiceListening ? 'contained' : 'outlined'}
            color={isVoiceListening ? 'error' : 'success'}
            onClick={handleToggleVoiceQuestion}
            startIcon={<MicIcon sx={{ fontSize: 20 }} />}
            sx={{
              py: 0.8,
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.82rem',
              textTransform: 'none'
            }}
          >
            {isVoiceListening ? '🛑 सुन रहे हैं... (रोकने हेतु दबाएं)' : '🎙️ बोलकर सवाल पूछें (माइक दबाएं)'}
          </Button>

          <TextField
            fullWidth
            size="small"
            label="आपका नाम"
            value={newQuestion.author}
            onChange={(e) => setNewQuestion({ ...newQuestion, author: e.target.value })}
          />

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.4 }}>
              फसल चुनें (1-टैप):
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
              {['धान', 'चना', 'सोयाबीन', 'मक्का', 'गेहूं', 'सामान्य'].map((c) => (
                <Chip
                  key={c}
                  label={c}
                  size="small"
                  clickable
                  onClick={() => setNewQuestion({ ...newQuestion, crop: c })}
                  sx={{
                    fontWeight: newQuestion.crop === c ? 800 : 600,
                    bgcolor: newQuestion.crop === c ? '#1b5e20' : '#f1f5f9',
                    color: newQuestion.crop === c ? '#fff' : '#334155',
                    fontSize: '0.72rem'
                  }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="अपना सवाल (बोलें या लिखें)"
            value={newQuestion.questionText}
            onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
            placeholder="जैसे: धान में बालियां निकलते समय कौन सा कीटनाशक डालना चाहिए?"
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
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAskModal(false)} sx={{ color: '#666', textTransform: 'none' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handlePostQuestion} sx={{ bgcolor: '#2e7d32', borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}>
            सवाल भेजें ➔
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 2: Add Machinery Listing */}
      <Dialog open={openAddMachineryModal} onClose={() => setOpenAddMachineryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem' }}>
          🚜 अपनी मशीन किराए पर जोड़ें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, pt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="मशीन / यंत्र का नाम *"
            placeholder="उदा. महिंद्रा 50 HP + रोटावेटर या कृषि ड्रोन"
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
          <Button onClick={() => setOpenAddMachineryModal(false)} sx={{ color: '#666', textTransform: 'none' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handlePostMachinery} sx={{ bgcolor: '#1b5e20', borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}>
            मशीन जोड़ें
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 3: Reply to Question */}
      <Dialog open={openReplyModal} onClose={() => setOpenReplyModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem' }}>
          💬 चौपाल में समाधान / उत्तर लिखें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, pt: 1 }}>
          {selectedQuestionForReply && (
            <Paper elevation={0} sx={{ p: 1.2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                सवाल ({selectedQuestionForReply.crop}):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a' }}>
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
            <MenuItem value="कृषि वैज्ञानिक / विशेषज्ञ">कृषि वैज्ञानिक / विशेषज्ञ</MenuItem>
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
          <Button onClick={() => setOpenReplyModal(false)} sx={{ color: '#666', textTransform: 'none' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handlePostReply} sx={{ bgcolor: '#1b5e20', borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}>
            उत्तर भेजें
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 4: Add Diary Entry */}
      <Dialog open={openDiaryModal} onClose={() => setOpenDiaryModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem' }}>
          🌱 नई फसल दर्ज करें
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.4, pt: 1 }}>
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
          <Button onClick={() => setOpenDiaryModal(false)} sx={{ color: '#666', textTransform: 'none' }}>रद्द करें</Button>
          <Button variant="contained" onClick={handleSaveDiary} sx={{ bgcolor: '#2e7d32', borderRadius: '8px', fontWeight: 800, textTransform: 'none' }}>
            डायरी में जोड़ें
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
