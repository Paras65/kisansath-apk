import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { speakText } from '../../utils/speech';
import { startVoiceRecognition, stopVoiceRecognition } from '../../utils/speechRecognition';
import { chatWithCropDoctor } from '../../services/apiService';
import { notify } from '../../services/notificationService';
import { useLanguage } from '../../utils/i18n';

export const CropDoctorChatBot = ({ activeDisease, selectedDistrict, selectedCrop }) => {
  const { isChhattisgarhi } = useLanguage();

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isChatListening, setIsChatListening] = useState(false);

  // Reset follow-up chat when active disease changes
  useEffect(() => {
    setChatMessages([]);
    setChatInput('');
  }, [activeDisease?.id, activeDisease?.diseaseName]);

  const handleToggleVoiceChat = () => {
    if (isChatListening) {
      stopVoiceRecognition();
      setIsChatListening(false);
    } else {
      startVoiceRecognition({
        onResult: (normalized, raw) => {
          const spoken = normalized || raw;
          setChatInput(spoken);
          setIsChatListening(false);
        },
        onListeningChange: (listening) => {
          setIsChatListening(listening);
        },
        onError: (msg) => {
          notify.info(msg);
          setIsChatListening(false);
        }
      });
    }
  };

  const handleSendChatMessage = async (customText = null) => {
    const textToSend = (customText !== null ? customText : chatInput).trim();
    if (!textToSend || !activeDisease) return;

    const userMsg = { sender: 'user', text: textToSend };
    setChatMessages((prev) => [...prev, userMsg]);
    if (customText === null) setChatInput('');
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-6).map((m) => ({
        role: m.sender === 'doctor' ? 'model' : 'user',
        text: m.text
      }));

      const res = await chatWithCropDoctor({
        question: textToSend,
        cropName: activeDisease.cropName || (selectedCrop === 'paddy' ? 'धान' : selectedCrop),
        diseaseName: activeDisease.diseaseName,
        chemicalRemedy: activeDisease.chemicalRemedy,
        organicRemedy: activeDisease.organicRemedy,
        district: selectedDistrict,
        history
      });

      if (res && res.success) {
        const docMsg = {
          sender: 'doctor',
          text: res.answer,
          voiceAdvice: res.voiceAdvice,
          quickTips: res.quickTips || []
        };
        setChatMessages((prev) => [...prev, docMsg]);
        if (res.voiceAdvice) {
          speakText(res.voiceAdvice);
        }
      } else {
        const errorMsg = {
          sender: 'doctor',
          text: res?.error || 'सलाह प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।',
          isError: true
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'doctor', text: 'नेटवर्क में समस्या आई। कृपया इंटरनेट कनेक्शन जांचें।', isError: true }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!activeDisease) return null;

  return (
    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <ChatIcon sx={{ color: '#1d4ed8', fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
            डॉक्टर से और पूछें (Follow-up Chat)
          </Typography>
        </Box>
        <Chip label="⚡ 100% लाइव AI" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.66rem', height: 20 }} />
      </Box>

      {/* 4 Zero-Typing Quick Question Chips */}
      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 1.2 }}>
        {[
          { label: isChhattisgarhi ? '💊 दूसरी दवाई बताव' : '💊 दूसरी दवा बताएं', text: `${activeDisease.diseaseName} के लिए कोई दूसरी अनुमोदित दवा और 15L पंप खुराक बताएं` },
          { label: isChhattisgarhi ? '🌿 देसी काढ़ा उपाय' : '🌿 देसी काढ़ा उपचार', text: `${activeDisease.diseaseName} की रोकथाम हेतु देसी काढ़ा कैसे तैयार करें?` },
          { label: isChhattisgarhi ? '⏰ स्प्रे के सही बेरा' : '⏰ स्प्रे का सही समय', text: 'इस दवा का छिड़काव सुबह करना चाहिए या शाम को?' },
          { label: isChhattisgarhi ? '🌧️ बारिश हो जाए त?' : '🌧️ बारिश हो जाए तो?', text: 'कीटनाशक छिड़कने के कितने घंटे बाद बारिश होने पर दवा काम करेगी?' }
        ].map((chip, idx) => (
          <Chip
            key={idx}
            label={chip.label}
            clickable
            disabled={chatLoading}
            onClick={() => handleSendChatMessage(chip.text)}
            sx={{
              bgcolor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.72rem',
              borderRadius: '16px',
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#1d4ed8' }
            }}
          />
        ))}
      </Box>

      {/* Chat Message Transcript */}
      {chatMessages.length > 0 && (
        <Box sx={{ maxHeight: 220, overflowY: 'auto', mb: 1.2, p: 1, bgcolor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {chatMessages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                p: 1,
                borderRadius: msg.sender === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                bgcolor: msg.sender === 'user' ? '#1d4ed8' : msg.isError ? '#fee2e2' : '#f0fdf4',
                color: msg.sender === 'user' ? '#ffffff' : msg.isError ? '#991b1b' : '#0f172a',
                border: msg.sender === 'user' ? 'none' : msg.isError ? '1px solid #fecaca' : '1px solid #bbf7d0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', color: msg.sender === 'user' ? '#bfdbfe' : '#166534' }}>
                  {msg.sender === 'user' ? 'आप:' : '👨‍⚕️ कृषि वैज्ञानिक:'}
                </Typography>
                {msg.sender === 'doctor' && !msg.isError && (
                  <IconButton size="small" onClick={() => speakText(msg.voiceAdvice || msg.text)} sx={{ p: 0.2, color: '#16a34a' }}>
                    <VolumeUpIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                {msg.text}
              </Typography>
            </Box>
          ))}
          {chatLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, p: 0.8, bgcolor: '#f8fafc', borderRadius: '8px' }}>
              <CircularProgress size={14} sx={{ color: '#1d4ed8' }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                डॉक्टर सलाह लिख रहे हैं...
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Chat Input Bar */}
      <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={isChhattisgarhi ? "सवाल लिखव या बोलव..." : "सवाल लिखें या बोलें..."}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendChatMessage();
            }
          }}
          disabled={chatLoading}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '10px',
            '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.78rem' }
          }}
        />
        <Tooltip title={isChatListening ? "माइक बंद करें" : "बोलकर सवाल पूछें"}>
          <IconButton
            onClick={handleToggleVoiceChat}
            disabled={chatLoading}
            sx={{
              bgcolor: isChatListening ? '#dc2626' : '#eff6ff',
              color: isChatListening ? '#fff' : '#1d4ed8',
              p: 0.8,
              borderRadius: '10px'
            }}
          >
            <MicIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          disabled={chatLoading || !chatInput.trim()}
          onClick={() => handleSendChatMessage()}
          sx={{
            bgcolor: '#1d4ed8',
            color: '#fff',
            fontWeight: 800,
            px: 1.5,
            py: 0.8,
            borderRadius: '10px',
            minWidth: 'auto',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1e40af', boxShadow: 'none' }
          }}
        >
          <SendIcon sx={{ fontSize: 16 }} />
        </Button>
      </Box>
    </Box>
  );
};

