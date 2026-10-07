import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  Divider,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CampaignIcon from '@mui/icons-material/Campaign';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import ScienceIcon from '@mui/icons-material/Science';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AndroidIcon from '@mui/icons-material/Android';
import GetAppIcon from '@mui/icons-material/GetApp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import SyncIcon from '@mui/icons-material/Sync';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';
import PinDropIcon from '@mui/icons-material/PinDrop';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { speakText, stopSpeech } from '../utils/speech';
import { useLanguage } from '../utils/i18n';
import { appConfig } from '../config/appConfig';
import { fetchLiveWeather } from '../services/weatherService';
import {
  getActiveFarmer,
  loginFarmer,
  logoutFarmer,
  getFarmerPlots
} from '../services/farmerService';
import { notify } from '../services/notificationService';
import { CROP_LIFECYCLE_RULES, analyzePlotLifecycle } from '../utils/cropLifecycleEngine';
import { isNativePlatform } from '../utils/capacitorUtils';
import { shareOnWhatsApp } from '../utils/shareUtils';
import { checkForAppUpdate } from '../services/updateService';
import { getPublicBroadcasts } from '../services/adminService';
import SensorsIcon from '@mui/icons-material/Sensors';
import { MeraKhetModal } from './MeraKhetModal';
import { FieldGpsTrackerModal } from './FieldGpsTrackerModal';
import { SoilIotSensorModal } from './SoilIotSensorModal';
import { MotorControllerModal } from './MotorControllerModal';
import { DeviceHubModal } from './DeviceHubModal';
import { ShareModal } from './ShareModal';
import { getMandiRates, getCachedModuleData } from '../services/apiService';
import { fetchVillagesByPincode } from '../services/pincodeService';

export const getLifecycleSteps = (isChhattisgarhi = false) => [
  {
    step: 1,
    title: isChhattisgarhi ? 'खेत तैयारी अऊ माटी सेहत' : 'खेत तैयारी व मृदा स्वास्थ्य',
    short: isChhattisgarhi ? 'माटी जांच अऊ घाम म गहिर जुताई' : 'मृदा परीक्षण व ग्रीष्मकालीन गहरी जुताई',
    tag: isChhattisgarhi ? 'खेत तैयारी' : 'खेत तैयारी',
    color: '#5d4037',
    desc: isChhattisgarhi
      ? 'घाम के दिन म नागर ले गहिर जुताई करव ताकि कीड़ा-मकोड़ा के अंडा अऊ खरपतवार जल के मर जावय। सड़े गोबर खाद 4-5 ट्राली प्रति एकड़ डारव अऊ नजदीकी केवीके म माटी के जांच जरूर करवाव (आदर्श pH: 6.0-7.0)।'
      : 'गर्मियों में गहरी जुताई करें ताकि हानिकारक कीटों के अंडे व खरपतवार नष्ट हो जाएं। गोबर की सड़ी खाद 4-5 टन प्रति एकड़ डालें और नजदीकी कृषि विज्ञान केंद्र से मिट्टी की जांच कराएं (आदर्श pH: 6.0-7.0)।',
    voice: isChhattisgarhi
      ? 'पहिला चरण: खेत तैयारी अऊ माटी सेहत। खेत के गहिर जुताई करव। 4 ले 5 ट्राली गोबर खाद प्रति एकड़ डारव अऊ माटी के पीएच टेस्ट करवाव।'
      : 'पहला चरण: खेत तैयारी और मृदा स्वास्थ्य। खेत की गहरी जुताई करें। 4 से 5 टन गोबर खाद प्रति एकड़ डालें और मिट्टी का पीएच टेस्ट कराएं।'
  },
  {
    step: 2,
    title: isChhattisgarhi ? 'बीज चुनाव अऊ बीजोपचार' : 'बीज चयन व बीजोपचार',
    short: isChhattisgarhi ? 'प्रमाणित बीज अऊ फफूंदनाशक उपचार' : 'प्रमाणित रोगरोधी बीज व फफूंदनाशी उपचार',
    tag: isChhattisgarhi ? 'बीजोपचार' : 'बीजोपचार',
    color: '#2e7d32',
    desc: isChhattisgarhi
      ? 'प्रमाणित किस्म (जैसे सरना, महामाया, एचएमटी) के बीज चुनव। बोए ले पहिली बीजोपचार जरूर करव: 1 किलो बीज म 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिला के 24 घंटा रखव। एकर ले उकठा अऊ झुलसा रोग नइ लगय।'
      : 'प्रमाणित किस्मों (जैसे धान में सरना, महामाया, एचएमटी) का चुनाव करें। बुआई से पूर्व बीजोपचार अवश्य करें: 1 कि.ग्रा. बीज में 2 ग्राम कार्बेन्डाजिम या 5 ग्राम ट्राइकोडर्मा मिलाकर 24 घंटे रखें। इससे उकठा व झुलसा रोग नहीं लगता।',
    voice: isChhattisgarhi
      ? 'दूसरा चरण: बीज चुनाव अऊ बीजोपचार। हमेशा प्रमाणित बीज चुनव अऊ बोए ले पहिली ट्राइकोडर्मा या बाविस्टिन ले बीजोपचार जरूर करव।'
      : 'दूसरा चरण: बीज चयन और बीजोपचार। हमेशा प्रमाणित बीज का उपयोग करें और बुआई से पहले ट्राइकोडर्मा या बाविस्टिन से बीजोपचार जरूर करें।'
  },
  {
    step: 3,
    title: isChhattisgarhi ? 'संतुलित पोषण अऊ खाद हिसाब' : 'संतुलित पोषण व खाद प्रबंधन',
    short: isChhattisgarhi ? 'यूरिया, डीएपी अऊ पोटाश के सही बेरा' : 'यूरिया, डीएपी व पोटाश का सही समय',
    tag: isChhattisgarhi ? 'खाद प्रबंधन' : 'खाद प्रबंधन',
    color: '#00796b',
    desc: isChhattisgarhi
      ? 'बोवाई के बेरा पूरा डीएपी अऊ पोटाश डारव। यूरिया ला तीन बराबर भाग म बांट के देवव (बोवाई, कल्ला फूटत 25 दिन म, अऊ बाली निकलत ले पहिली 45 दिन म)। जिंक सल्फेट ला कभू भी डीएपी संग मिला के झन डारव।'
      : 'बुआई के समय पूरी डीएपी और पोटाश डालें। यूरिया को तीन बराबर भागों में बांटकर दें (बुआई, कल्ले फूटने पर 25 दिन बाद, और बालियां आने से पहले 45 दिन बाद)। जिंक सल्फेट कभी भी डीएपी के साथ मिलाकर न डालें।',
    voice: isChhattisgarhi
      ? 'तीसरा चरण: पोषण अऊ खाद हिसाब। डीएपी अऊ पोटाश बोवाई के बेरा डारव। यूरिया ला तीन भाग म देवव। जिंक अऊ डीएपी ला कभू मिला के झन डारव।'
      : 'तीसरा चरण: पोषण और खाद प्रबंधन। डीएपी और पोटाश बुआई के समय डालें। यूरिया को तीन भागों में दें। जिंक और डीएपी को कभी मिलाकर न डालें।'
  },
  {
    step: 4,
    title: isChhattisgarhi ? 'फसल रक्षा अऊ रोग निदान' : 'फसल सुरक्षा व रोग निदान',
    short: isChhattisgarhi ? 'कीड़ा अऊ बीमारी के सही समय म रोकथाम' : 'कीट व बीमारी का समय पर नियंत्रण',
    tag: isChhattisgarhi ? 'फसल रक्षा' : 'फसल सुरक्षा',
    color: '#c62828',
    desc: isChhattisgarhi
      ? 'खेत म रोज निगरानी करव। गाभा कीट (तना छेदक) बर फेरोमोन ट्रैप लगाव। भूरा माहू दिखे ले खेत के पानी 2 दिन निकाल देवव अऊ नीम तेल या पाइमेट्रोज़िन के छिड़काव तना म करव। पत्ती म धब्बा दिखे ले ट्राइसाइक्लाजोल छिड़कव।'
      : 'खेत में नियमित निगरानी करें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं। भूरा माहू होने पर खेत का पानी 2 दिन निकालें और नीम तेल या पाइमेट्रोज़िन का छिड़काव तनों पर करें। पत्तियों पर धब्बे दिखने पर ट्राईसाइक्लाजोल का छिड़काव करें।',
    voice: isChhattisgarhi
      ? 'चौथा चरण: फसल रक्षा अऊ रोग निदान। पत्ती अऊ तना के रोज निरिक्षण करव। लक्षण दिखते ही फसल डॉक्टर टैब म फोटो जांच के सही दवाई छिड़कव।'
      : 'चौथा चरण: फसल सुरक्षा और रोग निदान। पत्तियों और तनों का नियमित निरीक्षण करें। लक्षण दिखते ही फसल डॉक्टर टैब में फोटो या लक्षण जांचकर सही दवा छिड़कें।'
  },
  {
    step: 5,
    title: isChhattisgarhi ? 'कटाई, सुखाई अऊ मिझाई' : 'कटाई, सुखाना व थ्रेशिंग',
    short: isChhattisgarhi ? '14-17% नमी म कटाई अऊ सुरक्षित रखाई' : '14-17% नमी पर कटाई व सुरक्षित भंडारण',
    tag: isChhattisgarhi ? 'कटाई' : 'कटाई',
    color: '#f57f17',
    desc: isChhattisgarhi
      ? 'जब बाली के 85-90% दाना पियर (सुनहरा) हो जावय तब कटाई करव। कटाई के बाद फसल ला घाम म बने सुखाव। खरीदी केंद्र ले जाए ले पहिली अनाज म नमी 14-17% ले जादा नइ होना चाही ताकि तौल म कटौती झन होवय।'
      : 'जब बालियों के 85-90% दाने सुनहरे हो जाएं तब कटाई करें। कटाई के बाद फसल को धूप में अच्छी तरह सुखाएं। उपार्जन केंद्र ले जाने से पहले अनाज में नमी 14-17% से अधिक नहीं होनी चाहिए ताकि वजन में कटौती न हो।',
    voice: isChhattisgarhi
      ? 'पांचवां चरण: कटाई अऊ सुखाई। जब 85 ले 90 प्रतिशत दाना सुनहरा हो जावय तब कटाई करव अऊ अनाज ला सुखा के नमी 14 ले 17 प्रतिशत तक लाव।'
      : 'पांचवां चरण: कटाई और सुखाना। जब 85 से 90 प्रतिशत दाने सुनहरे हो जाएं तब कटाई करें और अनाज को सुखाकर नमी 14 से 17 प्रतिशत तक लाएं।'
  },
  {
    step: 6,
    title: isChhattisgarhi ? `मंडी भाव अऊ ₹${appConfig.paddyScheme.totalRate} धान खरीदी` : `मंडी भाव व ₹${appConfig.paddyScheme.totalRate} बिक्री`,
    short: isChhattisgarhi ? 'टोकन तुंहर हाथ अऊ कृषक उन्नति योजना' : 'टोकन तुंहर हाथ व कृषक उन्नति योजना',
    tag: isChhattisgarhi ? 'बिक्री ₹3,100' : 'बिक्री ₹3,100',
    color: '#1565c0',
    desc: isChhattisgarhi
      ? `${appConfig.stateName} कृषक उन्नति योजना म ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} प्रति क्विंटल के भुगतान होथे (प्रति एकड़ ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल)। टोकन तुंहर हाथ ऐप ले घर बैठे टोकन कटाव, उपार्जन केंद्र म तौल कराव अऊ सीधा बैंक खाता म पइसा पाव।`
      : `${appConfig.stateName} कृषक उन्नति योजना के तहत ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')} प्रति क्विंटल का भुगतान होता है (प्रति एकड़ ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल)। टोकन तुंहर हाथ ऐप से घर बैठे टोकन काटें, उपार्जन केंद्र में तौल कराएं और सीधे बैंक खाते में भुगतान प्राप्त करें।`,
    voice: isChhattisgarhi
      ? `छठवां चरण: मंडी भाव अऊ सरकारी खरीदी। ${appConfig.stateName} सरकार के कृषक उन्नति योजना म ${appConfig.paddyScheme.totalRate} रुपया प्रति क्विंटल के भाव ले टोकन तुंहर हाथ द्वारा आसानी ले धान बेचव।`
      : `छठा चरण: मंडी भाव और सरकारी बिक्री। ${appConfig.stateName} सरकार की कृषक उन्नति योजना में ${appConfig.paddyScheme.totalRate} रुपये प्रति क्विंटल के भाव से टोकन तुंहर हाथ द्वारा आसानी से धान बेचें।`
  }
];

export const LIFECYCLE_STEPS = getLifecycleSteps(false);

export const HomeTab = ({ onNavigate, selectedDistrict }) => {
  const { isChhattisgarhi, t } = useLanguage();
  const lifecycleSteps = getLifecycleSteps(isChhattisgarhi);
  const [expandedStep, setExpandedStep] = useState(1);
  const [openMeraKhet, setOpenMeraKhet] = useState(false);
  const [openGpsTracker, setOpenGpsTracker] = useState(false);
  const [openSoilIot, setOpenSoilIot] = useState(false);
  const [openMotorModal, setOpenMotorModal] = useState(false);
  const [openDeviceHub, setOpenDeviceHub] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [activeFarmer, setActiveFarmer] = useState(getActiveFarmer());
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);

  // Fetch active department broadcasts
  useEffect(() => {
    let isMounted = true;
    getPublicBroadcasts(selectedDistrict).then((data) => {
      if (isMounted && Array.isArray(data)) {
        setActiveBroadcasts(data);
      }
    });
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  // Refresh active farmer session when Mera Khet modal is closed or session event fires
  useEffect(() => {
    const handleSessionChanged = (e) => {
      setActiveFarmer(e.detail || getActiveFarmer());
    };
    window.addEventListener('kisan_farmer_session_changed', handleSessionChanged);
    return () => {
      window.removeEventListener('kisan_farmer_session_changed', handleSessionChanged);
    };
  }, []);

  useEffect(() => {
    setActiveFarmer(getActiveFarmer());
  }, [openMeraKhet]);

  // Load registered plots for active farmer
  const [farmerPlots, setFarmerPlots] = useState([]);
  useEffect(() => {
    if (activeFarmer && activeFarmer.phone) {
      getFarmerPlots(activeFarmer.phone).then((list) => {
        setFarmerPlots(list || []);
      });
    } else {
      setFarmerPlots([]);
    }
  }, [activeFarmer, openMeraKhet]);

  // 1-Click Quick Login Modal & Pending Tool Action State
  const [openQuickLogin, setOpenQuickLogin] = useState(false);
  const [pendingToolAction, setPendingToolAction] = useState(null);
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [loginForm, setLoginForm] = useState({
    phone: '',
    name: '',
    pin: '1234',
    pincode: '',
    village: '',
    district: '',
    block: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeVillages, setPincodeVillages] = useState([]);
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [customVillageMode, setCustomVillageMode] = useState(false);

  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setLoginForm((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetchVillagesByPincode(clean);
        if (res && res.success) {
          const vList = res.villages || [];
          setPincodeVillages(vList);
          setPincodeInfo({ district: res.district, block: res.block, state: res.state, source: res.source });
          setCustomVillageMode(false);
          setLoginForm((prev) => ({
            ...prev,
            village: vList.length > 0 ? vList[0] : prev.village,
            district: res.district || prev.district,
            block: res.block || prev.block
          }));
          notify.success(`📍 ${res.block ? res.block + ', ' : ''}${res.district || ''}: ${vList.length} गांव मिले!`);
        } else {
          setPincodeVillages([]);
          setPincodeInfo(null);
          setCustomVillageMode(true);
          if (res?.error) notify.info(res.error);
        }
      } catch (err) {
        setCustomVillageMode(true);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      if (clean.length < 6) {
        setPincodeVillages([]);
        setPincodeInfo(null);
      }
    }
  };

  // Require Login Gatekeeper for personalized tools
  const handleRequireLogin = (toolAction) => {
    if (activeFarmer) {
      if (toolAction === 'motor') setOpenMotorModal(true);
      else if (toolAction === 'khet') setOpenMeraKhet(true);
      else if (toolAction === 'soil') setOpenSoilIot(true);
      else if (toolAction === 'hub') setOpenDeviceHub(true);
    } else {
      setPendingToolAction(toolAction);
      setOpenQuickLogin(true);
    }
  };

  const handleQuickLoginSubmit = async () => {
    if (!loginForm.phone || loginForm.phone.length < 10) {
      notify.warning('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (authMode === 'login' && (!loginForm.pin || loginForm.pin.length < 4)) {
      notify.warning('कृपया 4 अंकों का सुरक्षा पिन दर्ज करें।');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await loginFarmer({
        phone: loginForm.phone,
        name: authMode === 'register' ? (loginForm.name || 'किसान साथी') : undefined,
        pin: loginForm.pin || '1234',
        village: authMode === 'register' ? (loginForm.village || '') : undefined,
        district: loginForm.district || selectedDistrict,
      });
      if (res.success) {
        setActiveFarmer(res.farmer);
        setOpenQuickLogin(false);
        notify.success(`स्वागत है, ${res.farmer.name || 'किसान साथी'}! आपका खाता सक्रिय हो गया।`);
        if (pendingToolAction === 'motor') setOpenMotorModal(true);
        else if (pendingToolAction === 'khet') setOpenMeraKhet(true);
        else if (pendingToolAction === 'soil') setOpenSoilIot(true);
        else if (pendingToolAction === 'hub') setOpenDeviceHub(true);
        setPendingToolAction(null);
      } else {
        notify.error(res.error || 'लॉगिन विफल रहा।');
      }
    } catch {
      notify.error('लॉगिन में त्रुटि हुई।');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFarmerLogout = () => {
    logoutFarmer();
    setActiveFarmer(null);
    setFarmerPlots([]);
    notify.info('सफलतापूर्वक लॉगआउट। आपका डेटा सुरक्षित है।');
  };

  // Public Instant Crop & Quick Acre Advisor State (Zero Login Required)
  const [selectedCropKey, setSelectedCropKey] = useState('paddy');
  const [quickAcre, setQuickAcre] = useState(2.0);

  const [updateInfo, setUpdateInfo] = useState(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Background check for update on mount
  useEffect(() => {
    let isMounted = true;
    checkForAppUpdate(false).then((info) => {
      if (isMounted && info && info.hasUpdate) {
        setUpdateInfo(info);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    const info = await checkForAppUpdate(true);
    setCheckingUpdate(false);
    setUpdateInfo(info);
    setUpdateDialogOpen(true);
  };

  // Live Weather Fetch (Open-Meteo)
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      const data = await fetchLiveWeather(selectedDistrict);
      if (isMounted) setWeather(data);
    };
    loadWeather();
    return () => { isMounted = false; };
  }, [selectedDistrict]);

  const handleReadAdvisory = () => {
    const text = weather?.sprayAdvisory?.voice || (isChhattisgarhi
      ? `आज के किसानी सलाह: मौसम साफ अऊ बने रहिही। यूरिया खाद अऊ दवाई छिड़काव बर बने समय हे।`
      : `आज की कृषि सलाह: मौसम साफ और अनुकूल रहेगा। यूरिया खाद व कीटनाशक छिड़काव का सही समय है।`);
    speakText(text);
  };

  const handleReadStep = (e, step) => {
    e.stopPropagation();
    speakText(step.voice);
  };

  const [liveMandiRates, setLiveMandiRates] = useState(() => {
    const cached = getCachedModuleData('mandi_rates');
    if (cached && cached.data && Array.isArray(cached.data.rates)) {
      return cached.data.rates.slice(0, 3);
    }
    return [];
  });

  // Fetch Mandi Rates (Zero Static Fallback)
  useEffect(() => {
    let isMounted = true;
    const loadMandi = async () => {
      try {
        const res = await getMandiRates();
        if (isMounted && res && res.rates && res.rates.length > 0) {
          setLiveMandiRates(res.rates.slice(0, 3));
        }
      } catch (e) {
        // quiet
      }
    };
    loadMandi();
    return () => { isMounted = false; };
  }, []);

  // Shared Smart Auth Card (Pincode Auto-Discovery + Segmented Register/Login Tabs)
  const renderSmartAuthCard = (inModal = false) => (
    <Box sx={{ width: '100%' }}>
      {/* Top Segmented Tabs */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: inModal ? '#f1f5f9' : '#f0fdf4',
          p: 0.5,
          borderRadius: 3,
          mb: 2,
          border: '1px solid #dcfce7'
        }}
      >
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('register')}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: '0.78rem', sm: '0.84rem' },
            py: 0.9,
            bgcolor: authMode === 'register' ? '#1b5e20' : 'transparent',
            color: authMode === 'register' ? '#ffffff' : '#334155',
            boxShadow: authMode === 'register' ? '0 3px 10px rgba(27,94,32,0.25)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: authMode === 'register' ? '#125420' : '#e2e8f0'
            }
          }}
        >
          🌾 नया किसान पंजीयन
        </Button>
        <Button
          fullWidth
          size="small"
          onClick={() => setAuthMode('login')}
          sx={{
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: '0.78rem', sm: '0.84rem' },
            py: 0.9,
            bgcolor: authMode === 'login' ? '#1b5e20' : 'transparent',
            color: authMode === 'login' ? '#ffffff' : '#334155',
            boxShadow: authMode === 'login' ? '0 3px 10px rgba(27,94,32,0.25)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: authMode === 'login' ? '#125420' : '#e2e8f0'
            }
          }}
        >
          🔑 सीधा लॉगिन
        </Button>
      </Box>

      {authMode === 'register' ? (
        /* REGISTER MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: '#ecfdf5',
              borderRadius: 2,
              border: '1px solid #a7f3d0'
            }}
          >
            <PinDropIcon sx={{ color: '#059669', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#065f46', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>
              ⚡ <strong>स्मार्ट सुविधा:</strong> 6-अंक पिन कोड डालते ही आपके क्षेत्र के सभी गांव की सूची तुरंत आ जाएगी।
            </Typography>
          </Box>

          {/* 1. Mobile Number */}
          <TextField
            label="मोबाइल नंबर (10 अंक) *"
            placeholder="98765 43210"
            fullWidth
            size="small"
            value={loginForm.phone}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#334155',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              )
            }}
            helperText={loginForm.phone.length === 10 ? '✓ सुरक्षित किसान पहचान' : '10 अंकों का फोन नंबर दर्ज करें'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 2. Farmer Name */}
          <TextField
            label="किसान का नाम (वैकल्पिक)"
            placeholder="उदा. रामेश्वर साहू"
            fullWidth
            size="small"
            value={loginForm.name}
            onChange={(e) => setLoginForm({ ...loginForm, name: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* 3. Postal PIN Code */}
          <TextField
            label="डाक पिन कोड (6 अंक) *"
            placeholder="उदा. 493441 या 492001"
            fullWidth
            size="small"
            value={loginForm.pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {pincodeLoading ? (
                    <CircularProgress size={18} sx={{ color: '#2e7d32' }} />
                  ) : pincodeInfo ? (
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  ) : (
                    <PinDropIcon sx={{ color: '#64748b', fontSize: 20 }} />
                  )}
                </InputAdornment>
              )
            }}
            helperText={
              pincodeLoading ? (
                '🔍 डाक विभाग से गांव खोज रहे हैं...'
              ) : pincodeInfo ? (
                <Box component="span" sx={{ color: '#166534', fontWeight: 700 }}>
                  ✓ {pincodeInfo.block ? pincodeInfo.block + ', ' : ''}{pincodeInfo.district || ''} ({pincodeVillages.length} गांव उपलब्ध)
                </Box>
              ) : (
                'पिन कोड डालते ही गांव सूची स्वतः खुलेगी'
              )
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: pincodeInfo ? '#f0fdf4' : 'inherit'
              }
            }}
          />

          {/* 4. Village Selection */}
          {pincodeVillages.length > 0 && !customVillageMode ? (
            <TextField
              select
              label="अपना गांव चुनें *"
              fullWidth
              size="small"
              value={loginForm.village || (pincodeVillages[0] || '')}
              onChange={(e) => {
                if (e.target.value === '__CUSTOM__') {
                  setCustomVillageMode(true);
                  setLoginForm({ ...loginForm, village: '' });
                } else {
                  setLoginForm({ ...loginForm, village: e.target.value });
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                  <Typography component="span" variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                    📍 पिन कोड द्वारा खोजे गए {pincodeVillages.length} गांव
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setCustomVillageMode(true);
                      setLoginForm({ ...loginForm, village: '' });
                    }}
                    sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1565c0', fontWeight: 700 }}
                  >
                    ✏️ दूसरा गांव लिखें
                  </Button>
                </Box>
              }
            >
              {pincodeVillages.map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: '0.85rem' }}>
                  🏡 {v}
                </MenuItem>
              ))}
              <MenuItem value="__CUSTOM__" sx={{ fontSize: '0.82rem', color: '#1565c0', fontWeight: 700, borderTop: '1px dashed #cbd5e1' }}>
                ✏️ सूची में नहीं है? नया नाम लिखें...
              </MenuItem>
            </TextField>
          ) : (
            <TextField
              label="गांव / ब्लॉक का नाम *"
              placeholder="उदा. आरंग"
              fullWidth
              size="small"
              value={loginForm.village}
              onChange={(e) => setLoginForm({ ...loginForm, village: e.target.value })}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText={
                pincodeVillages.length > 0 ? (
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                    <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
                      हाथ से नाम दर्ज करें
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setCustomVillageMode(false)}
                      sx={{ p: 0, minWidth: 'auto', fontSize: '0.7rem', textTransform: 'none', color: '#1b5e20', fontWeight: 700 }}
                    >
                      📋 पिन कोड सूची देखें ({pincodeVillages.length})
                    </Button>
                  </Box>
                ) : 'पिन कोड डालें तो सूची अपने आप आ जाएगी या नाम लिखें'
              }
            />
          )}

          {/* 5. Security PIN */}
          <TextField
            label="सुरक्षा पिन (4 अंक) *"
            placeholder="1234"
            type="password"
            fullWidth
            size="small"
            value={loginForm.pin}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            helperText="डिफ़ॉल्ट 1234 • साझा फोन पर आपका डेटा सुरक्षित रहेगा"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || loginForm.phone.length < 10}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)' }
            }}
          >
            {loginLoading ? <CircularProgress size={20} color="inherit" /> : '🚀 किसान खाता बनाएं और शुरू करें'}
          </Button>
        </Box>
      ) : (
        /* LOGIN MODE */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              bgcolor: '#eff6ff',
              borderRadius: 2,
              border: '1px solid #bfdbfe'
            }}
          >
            <LockOpenIcon sx={{ color: '#1d4ed8', fontSize: 20, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.3 }}>
              🔑 <strong>त्वरित लॉगिन:</strong> पहले से पंजीकृत किसान सीधे मोबाइल व 4-अंक पिन डालकर तुरंत प्रवेश करें।
            </Typography>
          </Box>

          <TextField
            label="पंजीकृत मोबाइल नंबर (10 अंक) *"
            placeholder="98765 43210"
            fullWidth
            size="small"
            autoFocus
            value={loginForm.phone}
            onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      bgcolor: '#f1f5f9',
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      color: '#334155',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    🇮🇳 +91
                  </Box>
                </InputAdornment>
              )
            }}
            helperText="जिस नंबर से पहले पंजीयन किया था"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <TextField
            label="सुरक्षा पिन (4 अंक) *"
            placeholder="1234"
            type="password"
            fullWidth
            size="small"
            value={loginForm.pin}
            onChange={(e) => setLoginForm({ ...loginForm, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            inputProps={{ inputMode: 'numeric', maxLength: 4 }}
            helperText="डिफ़ॉल्ट पिन 1234 (यदि नहीं बदला था)"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={loginLoading || loginForm.phone.length < 10 || loginForm.pin.length < 4}
            onClick={handleQuickLoginSubmit}
            sx={{
              mt: 0.5,
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.92rem',
              py: 1.1,
              borderRadius: 2.5,
              boxShadow: '0 4px 14px rgba(27,94,32,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #125420 0%, #1b5e20 100%)' }
            }}
          >
            {loginLoading ? <CircularProgress size={20} color="inherit" /> : '🔑 किसान खाते में प्रवेश करें'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 0.5 }}>
            <Button
              size="small"
              onClick={() => setAuthMode('register')}
              sx={{ color: '#166534', fontWeight: 700, fontSize: '0.75rem', textTransform: 'none' }}
            >
              🌾 नया किसान खाता खोलना चाहते हैं? यहां पंजीयन करें
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 1.5, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
        <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
          शून्य-कागजात • 100% सुरक्षित डेटा • टोल-फ्री: 1800-180-1551
        </Typography>
      </Box>
    </Box>
  );

  // 1. Mandi Rates Pulse Card
  const renderMandiPulseCard = () => {
    const paddyCard = {
      crop: isChhattisgarhi ? 'धान (सरना/मोटा)' : 'धान (सरना/मोटा)',
      rate: `₹${appConfig.paddyScheme.totalRate}`,
      type: isChhattisgarhi ? 'सरकारी खरीदी (MSP + बोनस)' : 'सरकारी उपार्जन (MSP + बोनस)',
      badge: `₹${appConfig.paddyScheme.totalRate} ${isChhattisgarhi ? 'गारंटी' : 'गारंटी'}`,
      color: '#1b5e20'
    };

    const liveCards = liveMandiRates.map((item, idx) => ({
      crop: item.crop || (isChhattisgarhi ? 'जिंस' : 'जिंस'),
      rate: `₹${Number(item.modalRate || item.maxRate || 0).toLocaleString('en-IN')}`,
      type: `${item.market || selectedDistrict} ${isChhattisgarhi ? 'मंडी' : 'मंडी'}`,
      badge: item.variety ? item.variety : (isChhattisgarhi ? 'APMC लाइव' : 'APMC लाइव'),
      color: idx === 0 ? '#e65100' : idx === 1 ? '#0288d1' : '#2e7d32'
    }));

    const displayRates = [paddyCard, ...liveCards];

    return (
      <Card
        sx={{
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 1.5, px: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: '#1565c0', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
              {isChhattisgarhi ? 'आज के मुख्य मंडी भाव (Mandi Pulse)' : 'आज के प्रमुख मंडी भाव (Mandi Pulse)'}
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            onClick={() => { stopSpeech(); onNavigate('mandi'); }}
            sx={{ color: '#1565c0', fontWeight: 800, fontSize: '0.72rem', p: 0 }}
          >
            {isChhattisgarhi ? 'सबो 30+ मंडी' : 'सभी 30+ मंडियां'}
          </Button>
        </Box>

        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1}>
            {displayRates.map((item, idx) => (
              <Grid item xs={6} sm={displayRates.length === 1 ? 12 : 3} md={displayRates.length === 1 ? 12 : 6} key={idx}>
                <Box
                  onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    bgcolor: '#fafafa',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#f0f9ff', borderColor: '#bae6fd' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.76rem' }}>
                      {item.crop.split(' ')[0]}
                    </Typography>
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, bgcolor: `${item.color}15`, color: item.color }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: item.color, fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {item.rate}
                    <Typography component="span" variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', ml: 0.2 }}>
                      /क्विं.
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem', display: 'block', mt: 0.2 }}>
                    {item.type.split(' ')[0]}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {liveMandiRates.length === 0 && (
            <Box sx={{ mt: 1, p: 0.8, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                {isChhattisgarhi ? '🛡️ शून्य गलत डेटा नीति: आज के सत्यापित APMC मंडी भाव देखे बर मंडी टैब खोलव।' : '🛡️ शून्य गलत डेटा नीति: आज के सत्यापित APMC मंडी भाव देखने हेतु मंडी टैब खोलें।'}
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    );
  };

  // 2. Platform-Aware Native APK & Share Footer
  const renderApkFooterCard = () => (
    <Card
      sx={{
        p: { xs: 1.8, sm: 2 },
        borderRadius: 3.5,
        background: 'linear-gradient(135deg, #1b5e20 0%, #0d3d12 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 16px rgba(27,94,32,0.2)',
        border: '1px solid #81c784'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AndroidIcon sx={{ fontSize: 28, color: '#ffeb3b' }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>
                {isNativePlatform() ? (isChhattisgarhi ? 'किसान साथी Android App' : 'किसान साथी Android App') : (isChhattisgarhi ? 'किसान साथी Android App (APK)' : 'किसान साथी Android App (APK)')}
              </Typography>
              <Chip
                label={`v${appConfig.appVersion}`}
                size="small"
                sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, height: 18, fontSize: '0.65rem' }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.74rem' }}>
              {isNativePlatform() ? (isChhattisgarhi ? 'नवां संस्करण फोन म चालू हे' : 'नवीनतम संस्करण फोन में सक्रिय है') : (isChhattisgarhi ? '1.5 MB हल्का • बिना इंटरनेट चलही' : '1.5 MB लाइटवेट • बिना इंटरनेट चलेगा')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {isNativePlatform() ? (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<WhatsAppIcon />}
                onClick={() => shareOnWhatsApp()}
                sx={{ bgcolor: '#25D366', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#128C7E' } }}
              >
                व्हाट्सएप
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={checkingUpdate ? <CircularProgress size={12} color="inherit" /> : <SyncIcon />}
                disabled={checkingUpdate}
                onClick={handleManualCheckUpdate}
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.2, fontSize: '0.75rem' }}
              >
                {checkingUpdate ? (isChhattisgarhi ? 'जांचत हन...' : 'जांच...') : (isChhattisgarhi ? 'अपडेट जांचव' : 'अपडेट जांचें')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<GetAppIcon />}
                href={appConfig.apkDownloadUrl}
                target="_blank"
                download
                sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 800, borderRadius: 2, px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#fff' } }}
              >
                {isChhattisgarhi ? 'APK डाउनलोड करव' : 'APK डाउनलोड'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={checkingUpdate ? <CircularProgress size={12} color="inherit" /> : <SyncIcon />}
                disabled={checkingUpdate}
                onClick={handleManualCheckUpdate}
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 800, borderRadius: 2, px: 1.2, fontSize: '0.75rem' }}
              >
                {checkingUpdate ? (isChhattisgarhi ? 'जांचत हन...' : 'जांच...') : (isChhattisgarhi ? 'अपडेट जांचव' : 'अपडेट जांचें')}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Card>
  );

  // 3. Public Crop Advisor & Quick Acre Estimator (100% Free & Open, Zero Login Required)
  const renderPublicCropAdvisor = () => {
    const CROP_BENCHMARKS = {
      paddy: {
        name: 'धान (Paddy)',
        rate: appConfig.paddyScheme.totalRate,
        rateLabel: `₹${appConfig.paddyScheme.totalRate}/क्विं. (समर्थन मूल्य + बोनस)`,
        yieldPerAcre: 21,
        dapPerAcre: 50,
        ureaPerAcre: 90,
        potashPerAcre: 30,
        season: 'खरीफ / रबी धान',
        advisory: 'कल्ले फूटते समय 2-3 सेमी पानी बनाए रखें। तना छेदक के लिए फेरोमोन ट्रैप लगाएं।',
        voice: `धान हेतु ₹${appConfig.paddyScheme.totalRate} समर्थन मूल्य गारंटी है। 21 क्विंटल प्रति एकड़ तक सरकारी खरीद होती है।`
      },
      chana: {
        name: 'चना (Gram)',
        rate: 5440,
        rateLabel: '₹5,440/क्विं. (राष्ट्रीय MSP)',
        yieldPerAcre: 10,
        dapPerAcre: 40,
        ureaPerAcre: 15,
        potashPerAcre: 20,
        season: 'रबी दलहन (दलहन विविधीकरण)',
        advisory: 'चने में अधिक यूरिया न डालें। फूल आते समय कभी सिंचाई न करें, केवल घेंटी बनते समय पानी दें।',
        voice: 'चना समर्थन मूल्य ₹5,440 प्रति क्विंटल है। दलहन फसल में अतिरिक्त यूरिया डालने से बचें।'
      },
      wheat: {
        name: 'गेहूं (Wheat)',
        rate: 2425,
        rateLabel: '₹2,425/क्विं. (राष्ट्रीय MSP)',
        yieldPerAcre: 20,
        dapPerAcre: 50,
        ureaPerAcre: 100,
        potashPerAcre: 25,
        season: 'रबी गेहूं',
        advisory: 'बुआई के 21वें दिन ताज जड़ (CRI) अवस्था में पहली सिंचाई अनिवार्य है। पीला रतुआ पर नजर रखें।',
        voice: 'गेहूं का समर्थन मूल्य ₹2,425 प्रति क्विंटल है। 21वें दिन पहली सिंचाई अवश्य करें।'
      },
      maize: {
        name: 'मक्का (Maize)',
        rate: 2225,
        rateLabel: '₹2,225/क्विं. (राष्ट्रीय MSP)',
        yieldPerAcre: 26,
        dapPerAcre: 45,
        ureaPerAcre: 85,
        potashPerAcre: 20,
        season: 'खरीफ / जायद मक्का',
        advisory: 'फॉल आर्मीवर्म कीट के प्रकोप से बचाव हेतु नीम अर्क या अनुशंसित कीटनाशक का गोभ में छिड़काव करें।',
        voice: 'मक्का का समर्थन मूल्य ₹2,225 प्रति क्विंटल है। भुट्टे बनते समय खेत में नमी रखें।'
      },
      tomato: {
        name: 'टमाटर / सब्जी (Tomato)',
        rate: 1500,
        rateLabel: '₹1,500/क्विं. (मंडी औसत दर)',
        yieldPerAcre: 180,
        dapPerAcre: 60,
        ureaPerAcre: 75,
        potashPerAcre: 50,
        season: 'सब्जी नकदी फसल',
        advisory: 'डैम्पिंग ऑफ व पत्ती मरोड़ रोग से बचाव रखें। नियमित तुड़ाई से 3 दिन पहले रासायनिक कीटनाशक न डालें।',
        voice: 'टमाटर नकदी फसल है। फलों की चमक व वजन बढ़ाने हेतु पोटाश का संतुलित छिड़काव करें।'
      }
    };

    const currentCrop = CROP_BENCHMARKS[selectedCropKey] || CROP_BENCHMARKS.paddy;
    const estYield = Math.round(currentCrop.yieldPerAcre * quickAcre * 10) / 10;
    const estIncome = Math.round(estYield * currentCrop.rate);
    const estDap = Math.round(currentCrop.dapPerAcre * quickAcre);
    const estUrea = Math.round(currentCrop.ureaPerAcre * quickAcre);
    const estPotash = Math.round(currentCrop.potashPerAcre * quickAcre);

    return (
      <Card
        sx={{
          p: { xs: 1.8, sm: 2 },
          borderRadius: 3.5,
          bgcolor: '#ffffff',
          border: '1.2px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          mb: 2.2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalculateIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                {isChhattisgarhi ? '🌾 तुरंत फसल, खाद अऊ आमदनी हिसाब' : '🌾 त्वरित फसल, खाद व आय सलाहकार (Open Calculator)'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                {isChhattisgarhi ? 'शून्य-लॉगिन • केवल फसल अऊ एकड़ चुनव अऊ तुरंत हिसाब पाव' : 'शून्य-लॉगिन • केवल फसल व एकड़ चुनें और तुरंत हिसाब पाएं'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => speakText(isChhattisgarhi
              ? `${currentCrop.name} के हिसाब: ${quickAcre} एकड़ म अनुमानित उपज ${estYield} क्विंटल अऊ आमदनी लगभग ₹${estIncome.toLocaleString('en-IN')} होही।`
              : `${currentCrop.name} का हिसाब: ${quickAcre} एकड़ में अनुमानित पैदावार ${estYield} क्विंटल और आय लगभग ${estIncome} रुपये होगी। ${currentCrop.voice}`)}
            sx={{ bgcolor: '#f1f8e9', color: '#1b5e20' }}
          >
            <VolumeUpIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* 1. Crop Switcher Pills */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: { xs: 'nowrap', sm: 'wrap' }, overflowX: 'auto', pb: 1, mb: 1.2, '::-webkit-scrollbar': { display: 'none' } }}>
          {[
            { key: 'paddy', label: '🌾 धान (Paddy)' },
            { key: 'chana', label: '🌱 चना (Gram)' },
            { key: 'wheat', label: '🌾 गेहूं (Wheat)' },
            { key: 'maize', label: '🌽 मक्का (Maize)' },
            { key: 'tomato', label: isChhattisgarhi ? '🍅 टमाटर / भाजी' : '🍅 टमाटर / सब्जी' },
          ].map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              clickable
              onClick={() => setSelectedCropKey(c.key)}
              sx={{
                fontWeight: 800,
                fontSize: { xs: '0.72rem', sm: '0.76rem' },
                flexShrink: 0,
                bgcolor: selectedCropKey === c.key ? '#1b5e20' : '#f1f5f9',
                color: selectedCropKey === c.key ? '#ffffff' : '#334155',
                border: selectedCropKey === c.key ? '1px solid #1b5e20' : '1px solid #e2e8f0',
                '&:hover': { bgcolor: selectedCropKey === c.key ? '#125420' : '#e2e8f0' }
              }}
            />
          ))}
        </Box>

        {/* 2. Acre Quick Selector - Segmented Balanced Grid */}
        <Box sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2.5, mb: 1.5, border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.76rem' }}>
              🌾 {isChhattisgarhi ? 'रकबा' : 'रकबा'} (Acre): <strong>{quickAcre} {isChhattisgarhi ? 'एकड़' : 'एकड़'}</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, fontSize: '0.72rem' }}>
              {selectedCropKey === 'paddy' ? `₹${appConfig.paddyScheme.totalRate}/क्विं. ${isChhattisgarhi ? 'समर्थन मूल्य' : 'समर्थन मूल्य'}` : (isChhattisgarhi ? 'अनुमानित आमदनी अऊ खाद हिसाब' : 'अनुमानित आय व खाद गणना')}
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: { xs: 0.5, sm: 0.8 } }}>
            {[0.5, 1.0, 2.0, 3.0, 5.0].map((ac) => (
              <Button
                key={ac}
                size="small"
                onClick={() => setQuickAcre(ac)}
                sx={{
                  minWidth: 0,
                  py: 0.5,
                  px: 0.3,
                  borderRadius: 2,
                  fontSize: { xs: '0.7rem', sm: '0.76rem' },
                  fontWeight: quickAcre === ac ? 900 : 700,
                  bgcolor: quickAcre === ac ? '#2e7d32' : '#ffffff',
                  color: quickAcre === ac ? '#ffffff' : '#334155',
                  border: quickAcre === ac ? '1.5px solid #1b5e20' : '1px solid #cbd5e1',
                  boxShadow: quickAcre === ac ? '0 2px 6px rgba(46,125,50,0.22)' : 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: quickAcre === ac ? '#1b5e20' : '#f1f5f9'
                  }
                }}
              >
                {ac} {isChhattisgarhi ? 'एकड़' : 'एकड़'}
              </Button>
            ))}
          </Box>
        </Box>

        {/* 3. Calculations 4-KPI Grid */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#f1f8e9', borderRadius: 2, border: '1px solid #c8e6c9', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                {isChhattisgarhi ? 'सरकारी / मंडी भाव' : 'सरकारी / मंडी दर'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '0.92rem' }}>
                ₹{currentCrop.rate.toLocaleString('en-IN')}<span style={{ fontSize: '0.66rem', fontWeight: 600 }}>/क्विं.</span>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                {isChhattisgarhi ? 'अनुमानित उपज' : 'अनुमानित पैदावार'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#15803d', fontSize: '0.92rem' }}>
                {estYield} {isChhattisgarhi ? 'क्विंटल' : 'क्विंटल'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#b45309', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                {isChhattisgarhi ? 'अनुमानित आमदनी' : 'अनुमानित आय'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#b45309', fontSize: '0.92rem' }}>
                ₹{estIncome.toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.68rem', display: 'block', fontWeight: 700 }}>
                {isChhattisgarhi ? 'खाद जरूरत (DAP/यूरिया)' : 'खाद डोज (DAP/यूरिया)'}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.85rem' }}>
                {estDap}k / {estUrea}k
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 4. Advisory Snippet */}
        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
          <Typography variant="caption" sx={{ color: '#334155', fontSize: '0.74rem', lineHeight: 1.4 }}>
            <strong>{currentCrop.season}:</strong> {currentCrop.advisory}
          </Typography>
        </Box>

        {/* 5. Deep Navigation CTA Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="contained"
            onClick={() => onNavigate('schemes')}
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontSize: '0.74rem', fontWeight: 800, borderRadius: 2, px: 1.5, py: 0.5, flex: 1, '&:hover': { bgcolor: '#1b5e20' } }}
          >
            {isChhattisgarhi ? 'पूरा N:P:K कैलकुलेटर खोलव' : 'विस्तृत N:P:K कैलकुलेटर खोलें'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onNavigate('doctor')}
            sx={{ borderColor: '#d32f2f', color: '#d32f2f', fontSize: '0.74rem', fontWeight: 800, borderRadius: 2, px: 1.5, py: 0.5, flex: 1, '&:hover': { bgcolor: '#ffebee' } }}
          >
            {isChhattisgarhi ? 'फसल बीमारी जांचव (Doctor)' : 'फसल रोग जांचें (Doctor)'}
          </Button>
        </Box>
      </Card>
    );
  };

  // 4A. Traditional Public Gateway Welcome Banner (When !activeFarmer)
  const renderPublicWelcomeBanner = () => (
    <Card
      sx={{
        mb: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3.5,
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(27, 94, 32, 0.16)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              width: 50,
              height: 50,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              flexShrink: 0
            }}
          >
            <AgricultureIcon sx={{ fontSize: 30, color: '#ffeb3b' }} />
          </Box>
          <Box>
            <Chip
              label={isChhattisgarhi ? '🏛️ सार्वजनिक किसान सुविधा मंच (100% खुला)' : '🏛️ सार्वजनिक किसान सुविधा पोर्टल (100% खुला)'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#ffeb3b',
                fontWeight: 800,
                fontSize: '0.68rem',
                height: 22,
                mb: 0.5
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1.1rem', sm: '1.3rem' }, lineHeight: 1.2 }}>
              {isChhattisgarhi ? 'जय जोहार, किसान संगवारी' : 'नमस्ते, किसान साथी'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#dcedc8', fontSize: '0.78rem', display: 'block', mt: 0.3 }}>
              📍 {selectedDistrict} • {isChhattisgarhi ? 'मौसम, मंडी भाव अऊ खाद हिसाब सबो बर मुफ्त अऊ खुला हे' : 'मौसम, मंडी भाव व खाद गणना सभी के लिए निशुल्क व खुली'}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="medium"
          startIcon={<LockOpenIcon sx={{ fontSize: 18 }} />}
          onClick={() => { stopSpeech(); setOpenQuickLogin(true); }}
          sx={{
            bgcolor: '#ffeb3b',
            color: '#1b5e20',
            fontWeight: 900,
            fontSize: '0.82rem',
            borderRadius: 3,
            px: 2.2,
            py: 0.8,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            '&:hover': { bgcolor: '#ffffff' }
          }}
        >
          {isChhattisgarhi ? '🔑 अपन खाता खोलव / लॉगिन (10 सेकंड)' : '🔑 किसान खाता खोलें / लॉगिन (10 सेकंड)'}
        </Button>
      </Box>

      {/* Ticker Notice Inside Hero */}
      <Box
        sx={{
          mt: 1.8,
          pt: 1.2,
          borderTop: '1px solid rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.76rem',
          color: '#f1f8e9',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <CampaignIcon sx={{ fontSize: 18, color: '#ffeb3b' }} />
          <span><strong>{isChhattisgarhi ? 'कृषक उन्नति योजना:' : 'कृषक उन्नति योजना:'}</strong> {isChhattisgarhi ? 'धान ₹3,100 समर्थन मूल्य खरीदी | टोकन तुंहर हाथ' : 'धान ₹3,100 समर्थन मूल्य उपार्जन | टोकन तुंहर हाथ'}</span>
        </Box>
        <Chip
          label={isChhattisgarhi ? 'योजना देखव' : 'योजना देखें'}
          size="small"
          onClick={() => onNavigate('schemes')}
          sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700, height: 20, fontSize: '0.65rem', cursor: 'pointer' }}
        />
      </Box>
    </Card>
  );

  // 4B. Locked Private Services Preview Card (When !activeFarmer)
  const renderLockedPrivateToolsCard = () => (
    <Card
      sx={{
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        mb: 2.5
      }}
    >
      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon sx={{ color: '#059669', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
            {isChhattisgarhi ? '🔒 किसान निजी सेवा मन (1-क्लिक लॉगिन ले तुरंत चालू करव)' : '🔒 किसान निजी सेवाएं (1-क्लिक लॉगिन से तुरंत सक्रिय करें)'}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<LockOpenIcon sx={{ fontSize: 14 }} />}
          onClick={() => setOpenQuickLogin(true)}
          sx={{ bgcolor: '#166534', color: '#fff', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2, px: 1.4, py: 0.4 }}
        >
          {isChhattisgarhi ? 'मुफ्त खाता बनाव' : 'मुफ्त खाता बनाएं'}
        </Button>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.76rem', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
          💡 <strong>{isChhattisgarhi ? 'सार्वजनिक खुला मंच:' : 'सार्वजनिक खुला मंच:'}</strong> {isChhattisgarhi ? 'मौसम अऊ मंडी भाव बिना लॉगिन खुले हे। अपन खेत के रकबा, रोज के काम, बोर मोटर मोबाइल ले चालू/बंद करे अऊ खर्च डायरी बर मोबाइल नंबर ले लॉगिन करव:' : 'मौसम व मंडी भाव बिना लॉगिन खुले हैं। अपने खेत का रकबा, दिन-वार कार्य, ट्यूबवेल मोटर मोबाइल से चालू/बंद करने व खर्च डायरी चलाने हेतु केवल मोबाइल नंबर से लॉगिन करें:'}
        </Typography>

        <Grid container spacing={1.2}>
          {/* Tool 1: Motor */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => handleRequireLogin('motor')}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#e0f2fe', borderColor: '#7dd3fc', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 22 }} />
                <Chip label={isChhattisgarhi ? '🔒 लॉगिन' : '🔒 लॉगिन'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#f1f5f9', color: '#64748b' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.78rem' }}>
                {isChhattisgarhi ? 'ट्यूबवेल मोटर' : 'ट्यूबवेल मोटर'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                {isChhattisgarhi ? 'मोबाइल ले मोटर चालू/बंद' : 'GSM स्टार्टर रिमोट ऑन/ऑफ'}
              </Typography>
            </Box>
          </Grid>

          {/* Tool 2: Mera Khet & Diary */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => handleRequireLogin('khet')}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#f0fdf4', borderColor: '#86efac', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <MenuBookIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
                <Chip label={isChhattisgarhi ? '🔒 लॉगिन' : '🔒 लॉगिन'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#f1f5f9', color: '#64748b' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.78rem' }}>
                {isChhattisgarhi ? 'मोर खेत अऊ डायरी' : 'मेरा खेत व डायरी'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                {isChhattisgarhi ? 'फसल चक्र अऊ खर्च बहीखाता' : 'फसल चक्र व खर्च बहीखाता'}
              </Typography>
            </Box>
          </Grid>

          {/* Tool 3: Soil IoT */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => handleRequireLogin('soil')}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#f0fdfa', borderColor: '#99f6e4', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <ScienceIcon sx={{ color: '#00796b', fontSize: 22 }} />
                <Chip label={isChhattisgarhi ? '🔒 लॉगिन' : '🔒 लॉगिन'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#f1f5f9', color: '#64748b' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.78rem' }}>
                {isChhattisgarhi ? 'माटी सेंसर (IoT)' : 'मिट्टी सेंसर (IoT)'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                {isChhattisgarhi ? 'माटी pH अऊ NPK जांच' : 'pH व NPK प्रोब जांच'}
              </Typography>
            </Box>
          </Grid>

          {/* Tool 4: Field GPS (Always Open!) */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => setOpenGpsTracker(true)}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: '#fefce8',
                border: '1px solid #fef08a',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#fef9c3', borderColor: '#fde047', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <DirectionsWalkIcon sx={{ color: '#d97706', fontSize: 22 }} />
                <Chip label={isChhattisgarhi ? '⚡ खुला' : '⚡ खुला'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#fef3c7', color: '#b45309' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.78rem' }}>
                {isChhattisgarhi ? 'खेत GPS नाप' : 'खेत GPS मापक'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.66rem' }}>
                {isChhattisgarhi ? 'मेड़ म रेंग के नापव' : 'मेड़ों पर चलकर नापें'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );

  // 4C. Official Digital Farmer Passbook Card (When activeFarmer)
  const renderDigitalFarmerPassbookCard = () => (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '2px solid #2e7d32',
        boxShadow: '0 6px 20px rgba(46, 125, 50, 0.14)',
        overflow: 'hidden'
      }}
    >
      {/* Official Header Strip */}
      <Box
        sx={{
          p: 1.4,
          px: 2,
          background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#ffeb3b', fontSize: 24 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: 0.3 }}>
            🏛️ {isChhattisgarhi ? 'किसान पहचान पत्र अऊ पासबुक' : 'किसान पहचान पत्र व पासबुक (Digital Passbook)'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#1b5e20 !important' }} />}
            label={isChhattisgarhi ? 'सत्यापित किसान' : 'प्रमाणित किसान'}
            size="small"
            sx={{ bgcolor: '#ffeb3b', color: '#1b5e20', fontWeight: 900, fontSize: '0.68rem', height: 22 }}
          />
          <Button
            size="small"
            startIcon={<LogoutIcon sx={{ fontSize: 13 }} />}
            onClick={handleFarmerLogout}
            sx={{ color: '#ffcdd2', fontWeight: 800, fontSize: '0.7rem', p: 0.2, minWidth: 'auto', '&:hover': { color: '#ffffff' } }}
          >
            {isChhattisgarhi ? 'लॉगआउट' : 'लॉगआउट'}
          </Button>
        </Box>
      </Box>

      {/* Passbook Details Grid */}
      <Box sx={{ p: { xs: 1.8, sm: 2.2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: '#e8f5e9',
                color: '#1b5e20',
                width: 48,
                height: 48,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                border: '2px solid #a5d6a7'
              }}
            >
              {activeFarmer.name ? activeFarmer.name.charAt(0) : '🌾'}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', fontSize: { xs: '1.1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
                {isChhattisgarhi ? `जय जोहार, ${activeFarmer.name || 'किसान साथी'} जी` : `${activeFarmer.name || 'किसान साथी'}`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                {isChhattisgarhi ? `दर्ज मोबाइल: +91 ${activeFarmer.phone}` : `पंजीकृत मोबाइल: +91 ${activeFarmer.phone}`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AgricultureIcon sx={{ fontSize: 16 }} />}
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{
                bgcolor: '#1b5e20',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.78rem',
                borderRadius: 2.5,
                px: 1.8,
                py: 0.6,
                boxShadow: '0 3px 8px rgba(27,94,32,0.2)',
                '&:hover': { bgcolor: '#14532d' }
              }}
            >
              {isChhattisgarhi ? '🌾 मोर खेत अऊ डायरी' : '🌾 मेरा खेत व डायरी'}
            </Button>
          </Box>
        </Box>

        {/* 4-Item Details Strip */}
        <Grid container spacing={1} sx={{ bgcolor: '#f8fafc', p: 1.2, borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              📍 {isChhattisgarhi ? 'गांव / ब्लॉक' : 'ग्राम / ब्लॉक'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
              {activeFarmer.village || (isChhattisgarhi ? 'दर्ज' : 'पंजीकृत')}, {activeFarmer.district || selectedDistrict}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              🌾 {isChhattisgarhi ? 'कुल दर्ज रकबा' : 'कुल पंजीकृत रकबा'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.86rem' }}>
              {activeFarmer.totalAcres || activeFarmer.totalLandAcres || '3.0'} {isChhattisgarhi ? 'एकड़ जमीन' : 'एकड़ भूमि'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              🌱 {isChhattisgarhi ? 'दर्ज खेत' : 'पंजीकृत खेत'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
              {(farmerPlots || []).length} {isChhattisgarhi ? 'खेत चालू हे' : 'खेत सक्रिय'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
              💰 {isChhattisgarhi ? 'समर्थन मूल्य भाव' : 'समर्थन मूल्य दर'}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.86rem' }}>
              ₹{appConfig.paddyScheme.totalRate}/क्विंटल धान
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );

  // 4D. Live Registered Plots & Daily Farm Tasks Feed (When activeFarmer)
  const renderActivePlotsAndDailyTasksCard = () => (
    <Card
      sx={{
        mb: 2.5,
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #a5d6a7',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          p: 1.5,
          px: 2,
          bgcolor: '#f1f8e9',
          borderBottom: '1px solid #c8e6c9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AgricultureIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.92rem' }}>
            🌱 {isChhattisgarhi ? 'मोर चालू खेत अऊ आज के किसानी काम' : 'मेरे सक्रिय खेत व आज के कृषि कार्य (Live Field Dashboard)'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${(farmerPlots || []).length} ${isChhattisgarhi ? 'खेत चालू हे' : 'खेत सक्रिय'}`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#1b5e20', fontWeight: 800, fontSize: '0.7rem' }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2, px: 1.4, py: 0.3 }}
          >
            {isChhattisgarhi ? '➕ नवां खेत जोड़व' : '➕ नया खेत जोड़ें'}
          </Button>
        </Box>
      </Box>

      {/* Plot Feed Body */}
      <Box sx={{ p: 2 }}>
        {(farmerPlots || []).length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {farmerPlots.map((plot, idx) => {
              const analysis = analyzePlotLifecycle(plot, weather || {});
              return (
                <Paper
                  key={plot.id || idx}
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    bgcolor: '#fafafa',
                    border: '1.2px solid #e0e0e0',
                    transition: 'all 0.18s ease',
                    '&:hover': { bgcolor: '#ffffff', borderColor: '#81c784', boxShadow: '0 3px 12px rgba(0,0,0,0.06)' }
                  }}
                >
                  {/* Plot Header: Crop Name & Stage Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.96rem' }}>
                        🌾 {plot.name || (isChhattisgarhi ? `खेत ${idx + 1}` : `खेत ${idx + 1}`)} ({analysis.cropRule?.name || (isChhattisgarhi ? 'फसल' : 'फसल')})
                      </Typography>
                      {plot.variety && (
                        <Chip label={plot.variety} size="small" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 700, bgcolor: '#e8f5e9', color: '#1b5e20' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Chip
                        label={`⏱️ ${analysis.daysElapsed} ${isChhattisgarhi ? 'दिन होगे' : 'दिन हुए'}`}
                        size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                      />
                      <Chip
                        label={analysis.currentStage?.stageName?.split('(')[0] || (isChhattisgarhi ? 'चालू' : 'सक्रिय')}
                        size="small"
                        sx={{
                          bgcolor: `${analysis.currentStage?.statusColor || '#2e7d32'}18`,
                          color: analysis.currentStage?.statusColor || '#2e7d32',
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          height: 22,
                          border: `1px solid ${analysis.currentStage?.statusColor || '#2e7d32'}40`
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Sowing & Acreage Info */}
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.74rem', display: 'block', mb: 1 }}>
                    {isChhattisgarhi ? 'रकबा:' : 'रकबा:'} <strong>{plot.areaAcres || '1.0'} {isChhattisgarhi ? 'एकड़' : 'एकड़'}</strong> • {isChhattisgarhi ? 'बोवाई तारीख:' : 'बुआई तिथि:'} {plot.sowDate || (isChhattisgarhi ? 'दर्ज नइ हे' : 'दर्ज नहीं')}
                    {plot.khasraNo ? ` • खसरा नं: ${plot.khasraNo}` : ''}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.4 }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.68rem' }}>
                        {isChhattisgarhi ? 'फसल चक्र बढ़वार' : 'फसल चक्र प्रगति'} ({analysis.cropRule?.totalDays || 120} {isChhattisgarhi ? 'दिन चक्र' : 'दिन चक्र'})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.72rem' }}>
                        {analysis.progressPercent}% {isChhattisgarhi ? 'पूरा' : 'पूर्ण'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.progressPercent}
                      sx={{
                        height: 7,
                        borderRadius: 3.5,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': { bgcolor: analysis.currentStage?.statusColor || '#2e7d32', borderRadius: 3.5 }
                      }}
                    />
                  </Box>

                  {/* Today's Recommended Action Box */}
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      bgcolor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      mb: 1.2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.8
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.74rem', display: 'block' }}>
                        {isChhattisgarhi ? "आज के जरूरी किसानी काम (Today's Advisory):" : "आज का आवश्यक कार्य (Today's Advisory):"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#14532d', fontSize: '0.74rem', lineHeight: 1.35, display: 'block' }}>
                        {analysis.currentStage?.task || (isChhattisgarhi ? 'खेत के रोज देखरेख करव अऊ उचित नमी बना के रखव।' : 'खेत की नियमित निगरानी करें और उचित नमी बनाए रखें।')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Weather Alert (if applicable) */}
                  {analysis.weatherAlert && (
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: analysis.weatherAlert.type === 'warning' ? '#fff1f2' : '#eff6ff',
                        border: `1px solid ${analysis.weatherAlert.type === 'warning' ? '#fecdd3' : '#bfdbfe'}`,
                        mb: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8
                      }}
                    >
                      <Typography variant="caption" sx={{ color: analysis.weatherAlert.type === 'warning' ? '#be123c' : '#1d4ed8', fontWeight: 700, fontSize: '0.72rem' }}>
                        {analysis.weatherAlert.title}: {analysis.weatherAlert.message}
                      </Typography>
                    </Box>
                  )}

                  {/* Plot Action Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                      onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
                      sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '0.74rem', p: 0.3 }}
                    >
                      {isChhattisgarhi ? 'खेत के ब्योरा अऊ खर्च डायरी देखव' : 'खेत का विवरण व खर्च डायरी देखें'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<PowerSettingsNewIcon sx={{ fontSize: 14 }} />}
                      onClick={() => setOpenMotorModal(true)}
                      sx={{ color: '#0288d1', fontWeight: 800, fontSize: '0.72rem', p: 0.3 }}
                    >
                      {isChhattisgarhi ? 'मोटर चालू/बंद' : 'मोटर कंट्रोल'}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : (
          /* Empty State */
          <Box sx={{ textAlign: 'center', py: 3, px: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
            <AgricultureIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
              {isChhattisgarhi ? 'अभे कोनो खेत दर्ज नइ हे' : 'आपका कोई खेत अभी पंजीकृत नहीं है'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, maxWidth: 360, mx: 'auto', fontSize: '0.76rem' }}>
              {isChhattisgarhi
                ? 'अपन खेत के रकबा (एकड़) अउ बोआई के तारीख जोड़व। किसान साथी हर अवस्था म सही सलाह देही।'
                : 'अपने खेत का रकबा (एकड़) और बुआई की तारीख जोड़ें। किसान साथी आपके खेत के हर चरण (अंकुरण, खाद, सिंचाई, कटाई) का दैनिक मार्गदर्शन करेगा।'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => { stopSpeech(); setOpenMeraKhet(true); }}
              sx={{ bgcolor: '#1b5e20', color: '#fff', fontWeight: 800, fontSize: '0.78rem', borderRadius: 2.5, px: 2, py: 0.6 }}
            >
              {isChhattisgarhi ? '➕ अपन पहिली खेत जोड़व (1 मिनट)' : '➕ अपना पहला खेत जोड़ें (1 मिनट)'}
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );

  // 4E. Personal Farm Command Center Bar (When activeFarmer)
  const renderPersonalCommandBar = () => (
    <Card
      sx={{
        borderRadius: 3.5,
        bgcolor: '#ffffff',
        border: '1.5px solid #81c784',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        mb: 2.5
      }}
    >
      <Box
        sx={{
          p: 1.4,
          px: 2,
          bgcolor: '#f1f8e9',
          borderBottom: '1px solid #c8e6c9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SensorsIcon sx={{ color: '#1b5e20', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.9rem' }}>
            🌾 {isChhattisgarhi ? 'किसान त्वरित कमांड सेंटर' : 'किसान त्वरित कमांड सेंटर (Personal Farm Tools)'}
          </Typography>
        </Box>
        <Chip label={isChhattisgarhi ? 'सक्रिय' : 'सक्रिय'} size="small" color="success" sx={{ fontWeight: 800, fontSize: '0.66rem', height: 20 }} />
      </Box>

      <Box sx={{ p: 1.8 }}>
        <Grid container spacing={1.2}>
          {/* Tool 1: Tubewell Motor */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => setOpenMotorModal(true)}
              sx={{
                p: 1.4,
                borderRadius: 2.5,
                bgcolor: '#f0f9ff',
                border: '1px solid #bae6fd',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#e0f2fe', borderColor: '#7dd3fc', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: 24 }} />
                <Chip label={isChhattisgarhi ? 'रिमोट' : 'रिमोट'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#e0f2fe', color: '#0288d1' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.8rem' }}>
                {isChhattisgarhi ? 'ट्यूबवेल मोटर' : 'ट्यूबवेल मोटर'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                {isChhattisgarhi ? 'GSM स्टार्टर चालू/बंद' : 'GSM स्टार्टर ऑन/ऑफ'}
              </Typography>
            </Box>
          </Grid>

          {/* Tool 2: Mera Khet & Diary */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => setOpenMeraKhet(true)}
              sx={{
                p: 1.4,
                borderRadius: 2.5,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#dcfce7', borderColor: '#86efac', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <MenuBookIcon sx={{ color: '#16a34a', fontSize: 24 }} />
                <Chip label={isChhattisgarhi ? 'डायरी' : 'डायरी'} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#dcfce7', color: '#15803d' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.8rem' }}>
                {isChhattisgarhi ? 'किसान डायरी' : 'किसान डायरी'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                {isChhattisgarhi ? 'खर्चा अऊ आमदनी बहीखाता' : 'खर्च व आय बहीखाता'}
              </Typography>
            </Box>
          </Grid>

          {/* Tool 3: Field GPS Tracker */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => setOpenGpsTracker(true)}
              sx={{
                p: 1.4,
                borderRadius: 2.5,
                bgcolor: '#fefce8',
                border: '1px solid #fef08a',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#fef9c3', borderColor: '#fde047', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <DirectionsWalkIcon sx={{ color: '#d97706', fontSize: 24 }} />
                <Chip label="GPS" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#fef3c7', color: '#b45309' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.8rem' }}>
                {isChhattisgarhi ? 'खेत GPS नाप-जोख' : 'खेत GPS मापक'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                {isChhattisgarhi ? 'मेड़ म रेंगत नापव' : 'मेड़ों पर चलकर नापें'}
              </Typography>
            </Box>
          </Grid>

          {/* Tool 4: Soil IoT */}
          <Grid item xs={6} sm={3}>
            <Box
              onClick={() => setOpenSoilIot(true)}
              sx={{
                p: 1.4,
                borderRadius: 2.5,
                bgcolor: '#f0fdfa',
                border: '1px solid #99f6e4',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#ccfbf1', borderColor: '#5eead4', transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                <ScienceIcon sx={{ color: '#0d9488', fontSize: 24 }} />
                <Chip label="IoT" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#ccfbf1', color: '#0f766e' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block', fontSize: '0.8rem' }}>
                {isChhattisgarhi ? 'माटी सेंसर (IoT)' : 'मिट्टी सेंसर (IoT)'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                {isChhattisgarhi ? 'लाइव pH अऊ NPK स्तर' : 'लाइव pH व NPK स्तर'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );

  // 5. Unified Agritech Command Center Dashboard (Native Mobile App Flow for Guest & Farmer)
  const renderFarmerDashboard = () => (
    <>
      {/* 1. Top Section: Traditional Distinction (Passbook for Farmer vs Public Portal for Guest) */}
      {activeFarmer ? (
        /* Authenticated Farmer: Official Digital Farmer Passbook */
        renderDigitalFarmerPassbookCard()
      ) : (
        /* Unauthenticated Guest: Official Public Gateway Welcome Banner */
        renderPublicWelcomeBanner()
      )}

      {/* 2. Guest-Only Locked Services Showcase (Only on Public Mode) */}
      {!activeFarmer && renderLockedPrivateToolsCard()}

      {/* 2. App Update Alert Banner (if update ready) */}
      {updateInfo?.hasUpdate && (
        <Paper
          elevation={0}
          sx={{
            p: 1.2,
            px: 1.8,
            mb: 2,
            borderRadius: 3,
            bgcolor: '#e8f5e9',
            border: '1.5px solid #4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SystemUpdateIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.84rem' }}>
                {isChhattisgarhi ? `🎉 नवा अपडेट उपलब्ध हे (v${updateInfo.latestVersion})!` : `🎉 नया अपडेट उपलब्ध है (v${updateInfo.latestVersion})!`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem' }}>
                {isChhattisgarhi ? 'नवा APK इंस्टॉल करव • पुरना डेटा सुरक्षित रहिही' : 'नया APK इंस्टॉल करें • पुराना डेटा सुरक्षित रहेगा'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<GetAppIcon sx={{ fontSize: 14 }} />}
            href={updateInfo.downloadUrl}
            target="_blank"
            download
            sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, fontSize: '0.74rem', borderRadius: 2, px: 1.5, py: 0.5 }}
          >
            {isChhattisgarhi ? 'अभी अपडेट करव' : 'अभी अपडेट करें'}
          </Button>
        </Paper>
      )}

      {/* Responsive 2-Column Agritech Command Center Layout on Desktop */}
      <Grid container spacing={{ xs: 2, md: 2.5, lg: 3 }}>
        {/* Left / Main Column (xs=12, md=8) */}
        <Grid item xs={12} md={8}>
          {/* Official Department Emergency Broadcast Banner */}
          {activeBroadcasts && activeBroadcasts.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2,
                mb: 2,
                borderRadius: 3,
                bgcolor: activeBroadcasts[0].severity === 'urgent' ? '#fff1f2' : activeBroadcasts[0].severity === 'warning' ? '#fffbeb' : '#eff6ff',
                border: `1.5px solid ${activeBroadcasts[0].severity === 'urgent' ? '#fda4af' : activeBroadcasts[0].severity === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CampaignIcon sx={{ color: activeBroadcasts[0].severity === 'urgent' ? '#e11d48' : activeBroadcasts[0].severity === 'warning' ? '#d97706' : '#2563eb', fontSize: 24 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    📢 {activeBroadcasts[0].title}
                  </Typography>
                  <Chip
                    label={activeBroadcasts[0].severity === 'urgent' ? (isChhattisgarhi ? 'अति गंभीर चेतावनी' : 'अति गंभीर चेतावनी') : activeBroadcasts[0].severity === 'warning' ? (isChhattisgarhi ? 'विभागीय चेतावनी' : 'विभागीय चेतावनी') : (isChhattisgarhi ? 'कृषि सलाह' : 'कृषि परामर्श')}
                    size="small"
                    color={activeBroadcasts[0].severity === 'urgent' ? 'error' : activeBroadcasts[0].severity === 'warning' ? 'warning' : 'primary'}
                    sx={{ fontWeight: 800, fontSize: '0.68rem', height: 20 }}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => speakText(`${activeBroadcasts[0].title}। ${activeBroadcasts[0].message}`)}
                  sx={{ bgcolor: 'rgba(0,0,0,0.05)', color: '#0f172a' }}
                >
                  <VolumeUpIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem', lineHeight: 1.4 }}>
                {activeBroadcasts[0].message}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                <span>{isChhattisgarhi ? 'जारीकर्ता:' : 'जारीकर्ता:'} {activeBroadcasts[0].author || (isChhattisgarhi ? 'कृषि विशेषज्ञ' : 'कृषि विशेषज्ञ')}</span>
                <span>{isChhattisgarhi ? 'वैधता:' : 'वैधता:'} {activeBroadcasts[0].validTill || (isChhattisgarhi ? 'सक्रिय' : 'सक्रिय')}</span>
              </Box>
            </Paper>
          )}

          {/* If Logged In: Live Plots Feed & Daily Tasks at Top of Main Column */}
          {activeFarmer && renderActivePlotsAndDailyTasksCard()}

          {/* If Logged In: Personal Quick Command Tools (Mobile only in main column; on desktop shown in right sidebar) */}
          {activeFarmer && (
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.5 }}>
              {renderPersonalCommandBar()}
            </Box>
          )}

          {/* Floating Weather & Spray Card */}
          <Card
            sx={{
              mb: 2.2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3.5,
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            {/* Top Row: Temp, Condition, Spray Badge */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Typography sx={{ fontSize: { xs: '1.9rem', sm: '2.2rem' }, lineHeight: 1 }}>
                  {weather?.conditionIcon || '🌤️'}
                </Typography>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', lineHeight: 1, fontSize: { xs: '1.8rem', sm: '2.125rem' } }}>
                      {weather ? `${weather.temp}°` : '29°'}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>
                      {weather ? weather.conditionText : (isChhattisgarhi ? 'साफ मौसम' : 'साफ मौसम')}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                    📍 {selectedDistrict} {weather?.isLive ? (isChhattisgarhi ? '• लाइव मौसम' : '• लाइव मौसम') : (isChhattisgarhi ? '• सुरक्षित डेटा' : '• सुरक्षित डेटा')}
                  </Typography>
                </Box>
              </Box>

              {/* Spray Safety Badge & Voice button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Chip
                  label={weather?.sprayAdvisory?.badge || (isChhattisgarhi ? 'छिड़काव बर बने हे' : 'छिड़काव अनुकूल')}
                  size="small"
                  sx={{
                    bgcolor: weather?.sprayAdvisory?.canSpray ? '#e8f5e9' : '#fff3e0',
                    color: weather?.sprayAdvisory?.canSpray ? '#1b5e20' : '#e65100',
                    border: weather?.sprayAdvisory?.canSpray ? '1px solid #a5d6a7' : '1px solid #ffcc80',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    height: 26
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleReadAdvisory}
                  sx={{ bgcolor: '#f1f5f9', color: '#1b5e20', p: 0.6 }}
                >
                  <VolumeUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Metrics Strip */}
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              <Grid item xs={4}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    <WaterDropIcon sx={{ fontSize: 13, color: '#0288d1' }} /> {isChhattisgarhi ? 'वर्षा (पानी)' : 'वर्षा'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.rainProbability}%` : '10%'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    <AirIcon sx={{ fontSize: 13, color: '#00897b' }} /> {isChhattisgarhi ? 'हवा के गति' : 'हवा'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.windSpeed} km/h` : '10 km/h'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 2.5, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                    💧 {isChhattisgarhi ? 'उमस (नमी)' : 'आर्द्रता'}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    {weather ? `${weather.humidity}%` : '62%'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Advisory line */}
            <Box sx={{ p: 1.2, bgcolor: '#f1f8e9', borderRadius: 2, display: 'flex', alignItems: 'flex-start', gap: 0.8, mb: 1.5, border: '1px solid #dcedc8' }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
              <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.76rem', lineHeight: 1.35, fontWeight: 600 }}>
                {weather?.sprayAdvisory?.advisory || (isChhattisgarhi ? 'धान म कल्ला अऊ बाली आवत बेरा खेत म 2-3 सेमी पानी राखव। शांत मौसम म कीटनाशक छिड़कव।' : 'धान में कल्ले और बालियां आते समय खेत में 2-3 सेमी जलस्तर रखें। शांत मौसम में कीटनाशक छिड़काव करें।')}
              </Typography>
            </Box>

            {/* Compact 3-Day Forecast Strip */}
            {weather?.forecast3Days && (
              <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: '#2e7d32' }} /> {isChhattisgarhi ? '3 दिन के मौसम अनुमान:' : '3-दिवसीय मौसम अनुमान:'}
                  </Typography>
                </Box>
                <Grid container spacing={1}>
                  {weather.forecast3Days.map((f, idx) => (
                    <Grid item xs={4} key={idx}>
                      <Box sx={{ p: 0.8, bgcolor: idx === 0 ? '#e8f5e9' : '#fafafa', borderRadius: 2, textAlign: 'center', border: idx === 0 ? '1px solid #c8e6c9' : '1px solid #f1f5f9' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: idx === 0 ? '#1b5e20' : '#64748b', fontSize: '0.7rem', display: 'block' }}>
                          {f.day.split(' ')[0]}
                        </Typography>
                        <Typography sx={{ fontSize: '1.1rem', my: 0.2 }}>{f.icon}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem', display: 'block' }}>
                          {f.tempMax}° / {f.tempMin}°
                        </Typography>
                        <Typography variant="caption" sx={{ color: f.rainProb > 40 ? '#d32f2f' : '#0288d1', fontSize: '0.64rem', fontWeight: 700 }}>
                          {isChhattisgarhi ? 'पानी' : 'वर्षा'} {f.rainProb}%
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Card>

          {/* Public Crop Advisor & Quick Acre Estimator (Shown prominently on Public Mode) */}
          {!activeFarmer && renderPublicCropAdvisor()}

          {/* Mandi Rates Pulse (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2.5 }}>
            {renderMandiPulseCard()}
          </Box>

          {/* Unified 8-Tile Modern App Launcher Grid */}
          <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 0.8 }}>
              {isChhattisgarhi ? '⚡ मुख्य कृषि सेवा अऊ स्मार्ट टूल्स' : '⚡ मुख्य कृषि सेवाएं व स्मार्ट टूल्स'}
            </Typography>
            <Chip
              icon={<SensorsIcon sx={{ fontSize: '13px !important', color: '#1b5e20' }} />}
              label={isChhattisgarhi ? '📡 डिवाइस हब' : '📡 डिवाइस हब'}
              clickable
              size="small"
              onClick={() => {
                stopSpeech();
                handleRequireLogin('hub');
              }}
              sx={{
                bgcolor: '#e8f5e9',
                color: '#1b5e20',
                fontWeight: 800,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: '6px',
                border: '1px solid #c8e6c9',
                transition: 'all 0.18s ease',
                '&:hover': { bgcolor: '#c8e6c9' }
              }}
            />
          </Box>

          <Card
            sx={{
              p: { xs: 1.2, sm: 1.8 },
              mb: 3,
              borderRadius: '16px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
            }}
          >
            <Grid container spacing={{ xs: 1, sm: 1.5 }}>
              {[
                {
                  title: isChhattisgarhi ? 'रोग निदान' : 'फसल डॉक्टर',
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
                  action: () => onNavigate('schemes')
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
                  action: () => onNavigate('schemes')
                },
                {
                  title: isChhattisgarhi ? 'खेत GPS' : 'खेत GPS',
                  icon: <DirectionsWalkIcon sx={{ color: '#00897b', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e0f2f1',
                  border: '#b2dfdb',
                  badge: isChhattisgarhi ? 'नाप-जोख' : 'मापक',
                  badgeBg: '#00897b',
                  action: () => setOpenGpsTracker(true)
                },
                {
                  title: isChhattisgarhi ? 'ट्यूबवेल मोटर' : 'ट्यूबवेल मोटर',
                  icon: <PowerSettingsNewIcon sx={{ color: '#0288d1', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e1f5fe',
                  border: '#b3e5fc',
                  badge: activeFarmer ? 'IoT' : '🔒',
                  badgeBg: activeFarmer ? '#0288d1' : '#64748b',
                  action: () => handleRequireLogin('motor')
                },
                {
                  title: isChhattisgarhi ? 'माटी सेंसर' : 'मिट्टी सेंसर',
                  icon: <ScienceIcon sx={{ color: '#2e7d32', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#e8f5e9',
                  border: '#c8e6c9',
                  badge: activeFarmer ? (isChhattisgarhi ? 'सेंसर' : 'सेंसर') : '🔒',
                  badgeBg: activeFarmer ? '#1b5e20' : '#64748b',
                  action: () => handleRequireLogin('soil')
                },
                {
                  title: isChhattisgarhi ? 'किसान डायरी' : 'किसान डायरी',
                  icon: <MenuBookIcon sx={{ color: '#7b1fa2', fontSize: { xs: 24, sm: 26 } }} />,
                  bg: '#f3e5f5',
                  border: '#e1bee7',
                  badge: activeFarmer ? (isChhattisgarhi ? 'खाता' : 'खाता') : '🔒',
                  badgeBg: activeFarmer ? '#7b1fa2' : '#64748b',
                  action: () => handleRequireLogin('khet')
                }
              ].map((tool, idx) => (
                <Grid item xs={3} sm={3} md={3} lg={3} key={idx}>
                  <Box
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
                      '&:hover': {
                        bgcolor: '#f8fafc',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'scale(0.94)'
                      }
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
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap'
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
                        justifyContent: 'center',
                        wordBreak: 'break-word'
                      }}
                    >
                      {tool.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>

          {/* Public Crop Advisor & Quick Acre Estimator (For Logged-in Farmers Reference) */}
          {activeFarmer && renderPublicCropAdvisor()}

          {/* Interactive 6-Stage Agricultural Lifecycle Stepper */}
          <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
              {isChhattisgarhi ? '🌱 फसल ले लेके बिक्री तक (6 चरणीय किसानी यात्रा)' : '🌱 फसल से लेकर बिक्री तक (6 चरणीय कृषि यात्रा)'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
              {isChhattisgarhi ? 'चरण चुनव अऊ जानव' : 'चरण चुनें व जानें'}
            </Typography>
          </Box>

          {/* 6-Stage Progress Stepper Bar (Visual Segmented Pills on md+, Numbered Dots on xs) */}
          <Box sx={{ mb: 1.5 }}>
            {/* Desktop / Tablet Segmented Capsules */}
            <Box sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.8, mb: 1 }}>
              {lifecycleSteps.map((item) => {
                const isActive = item.step === expandedStep;
                return (
                  <Box
                    key={item.step}
                    onClick={() => {
                      stopSpeech();
                      setExpandedStep(item.step);
                    }}
                    sx={{
                      cursor: 'pointer',
                      p: 0.8,
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: isActive ? item.color : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      border: isActive ? `1.5px solid ${item.color}` : '1px solid #e2e8f0',
                      boxShadow: isActive ? `0 3px 10px ${item.color}35` : 'none',
                      transition: 'all 0.18s ease',
                      '&:hover': {
                        bgcolor: isActive ? item.color : '#f8fafc',
                        borderColor: item.color
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', display: 'block', opacity: isActive ? 0.9 : 0.7 }}>
                      {isChhattisgarhi ? 'चरण' : 'चरण'} {item.step}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.74rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.tag}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Mobile Numbered Step Pills (1 to 6) */}
            <Box sx={{ display: { xs: 'grid', sm: 'none' }, gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.6, mb: 1.2 }}>
              {lifecycleSteps.map((item) => {
                const isActive = item.step === expandedStep;
                return (
                  <Box
                    key={item.step}
                    onClick={() => {
                      stopSpeech();
                      setExpandedStep(item.step);
                    }}
                    sx={{
                      cursor: 'pointer',
                      py: 0.6,
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: isActive ? item.color : '#ffffff',
                      color: isActive ? '#ffffff' : item.color,
                      border: `1.5px solid ${item.color}`,
                      boxShadow: isActive ? `0 2px 6px ${item.color}40` : 'none',
                      fontWeight: 900,
                      fontSize: '0.78rem'
                    }}
                  >
                    {item.step}
                  </Box>
                );
              })}
            </Box>

            {/* Dropdown Selector for Complete Detail */}
            <TextField
              select
              fullWidth
              size="small"
              label={isChhattisgarhi ? '🌱 कृषि यात्रा चरण (Current Stage)' : '🌱 कृषि यात्रा चरण (Current Stage)'}
              value={expandedStep}
              onChange={(e) => {
                stopSpeech();
                setExpandedStep(Number(e.target.value));
              }}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 2.5,
                '& .MuiOutlinedInput-root': { borderRadius: 2.5 }
              }}
            >
              {lifecycleSteps.map((item) => (
                <MenuItem key={item.step} value={item.step}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {item.step}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.tag}
                      size="small"
                      sx={{
                        ml: 'auto',
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        bgcolor: `${item.color}15`,
                        color: item.color
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Focused Active Stage Card */}
          {(() => {
            const currentStep = lifecycleSteps.find((s) => s.step === expandedStep) || lifecycleSteps[0];
            return (
              <Card
                sx={{
                  mb: 2.5,
                  p: 2,
                  borderRadius: 3.5,
                  bgcolor: '#ffffff',
                  border: `1.5px solid ${currentStep.color}30`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: currentStep.color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      {currentStep.step}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: currentStep.color, fontSize: '0.92rem' }}>
                        {currentStep.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                        {currentStep.short}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={currentStep.tag}
                    size="small"
                    sx={{ bgcolor: `${currentStep.color}15`, color: currentStep.color, fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.84rem', lineHeight: 1.6, mb: 1.5 }}>
                  {currentStep.desc}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {/* Prev/Next Stepper & Voice Controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Button
                      size="small"
                      disabled={currentStep.step <= 1}
                      onClick={() => {
                        stopSpeech();
                        setExpandedStep((prev) => Math.max(1, prev - 1));
                      }}
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        py: 0.3,
                        px: 1,
                        borderRadius: 2,
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        minWidth: 0,
                        '&.Mui-disabled': { opacity: 0.4 }
                      }}
                    >
                      {isChhattisgarhi ? '⬅️ पिछला' : '⬅️ पिछला'}
                    </Button>
                    <Button
                      size="small"
                      disabled={currentStep.step >= 6}
                      onClick={() => {
                        stopSpeech();
                        setExpandedStep((prev) => Math.min(6, prev + 1));
                      }}
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        py: 0.3,
                        px: 1,
                        borderRadius: 2,
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        minWidth: 0,
                        '&.Mui-disabled': { opacity: 0.4 }
                      }}
                    >
                      {isChhattisgarhi ? 'अगला ➡️' : 'अगला ➡️'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
                      onClick={(e) => handleReadStep(e, currentStep)}
                      sx={{
                        color: currentStep.color,
                        bgcolor: `${currentStep.color}12`,
                        fontWeight: 700,
                        fontSize: '0.74rem',
                        borderRadius: 2,
                        px: 1.2,
                        py: 0.3,
                        '&:hover': { bgcolor: `${currentStep.color}25` }
                      }}
                    >
                      {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
                    </Button>
                  </Box>

                  {/* Deep Navigation Module Buttons */}
                  {currentStep.step === 3 && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { stopSpeech(); onNavigate('schemes'); }}
                      sx={{ color: '#2e7d32', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      {isChhattisgarhi ? 'खाद हिसाब खोलव' : 'खाद कैलकुलेटर खोलें'}
                    </Button>
                  )}
                  {currentStep.step === 4 && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { stopSpeech(); onNavigate('doctor'); }}
                      sx={{ color: '#c62828', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      {isChhattisgarhi ? 'फसल डॉक्टर खोलव' : 'फसल डॉक्टर खोलें'}
                    </Button>
                  )}
                  {currentStep.step === 6 && (
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      onClick={() => { stopSpeech(); onNavigate('mandi'); }}
                      sx={{ color: '#1565c0', fontSize: '0.75rem', fontWeight: 800 }}
                    >
                      {isChhattisgarhi ? 'मंडी भाव देखव' : 'मंडी भाव देखें'}
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })()}

          {/* Platform APK & Share Footer (Mobile Only: xs & sm) */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>
            {renderApkFooterCard()}
          </Box>
        </Grid>

        {/* Right / Sidebar Column (Desktop Command Center: md and up) */}
        <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* 1. Mandi Rates Pulse Widget */}
            {renderMandiPulseCard()}

            {/* 2. Tools Hub & Farmer Command Card */}
            {activeFarmer ? renderPersonalCommandBar() : renderLockedPrivateToolsCard()}

            {/* 3. Platform APK & Share Card */}
            {renderApkFooterCard()}
          </Box>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box sx={{ pb: 1, pt: 0 }} className="fade-in">
      {renderFarmerDashboard()}

      {/* Modals & Dialogs */}
      <MeraKhetModal
        open={openMeraKhet}
        onClose={() => setOpenMeraKhet(false)}
        selectedDistrict={selectedDistrict}
        weatherContext={weather}
      />

      <FieldGpsTrackerModal
        open={openGpsTracker}
        onClose={() => setOpenGpsTracker(false)}
        onSaveArea={() => setOpenMeraKhet(true)}
      />

      <SoilIotSensorModal
        open={openSoilIot}
        onClose={() => setOpenSoilIot(false)}
        onApplyToCalculator={() => onNavigate('schemes')}
      />

      <MotorControllerModal
        open={openMotorModal}
        onClose={() => setOpenMotorModal(false)}
        weatherContext={weather}
      />

      <DeviceHubModal
        open={openDeviceHub}
        onClose={() => setOpenDeviceHub(false)}
        onOpenGpsTracker={() => setOpenGpsTracker(true)}
        onOpenSoilIot={() => setOpenSoilIot(true)}
        onOpenMotorModal={() => setOpenMotorModal(true)}
        onApplySoilToCalc={() => onNavigate('schemes')}
      />

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Quick Farmer Login & Registration Modal (Zero Friction, Public First) */}
      <Dialog
        open={openQuickLogin}
        onClose={() => { if (!loginLoading) setOpenQuickLogin(false); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1b5e20', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockOpenIcon sx={{ color: '#2e7d32' }} />
            <span>{isChhattisgarhi ? 'किसान साथी प्रवेश' : 'किसान साथी प्रवेश'}</span>
          </Box>
          <IconButton size="small" onClick={() => setOpenQuickLogin(false)} disabled={loginLoading}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {renderSmartAuthCard(true)}
        </DialogContent>
      </Dialog>

      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: updateInfo?.hasUpdate ? '#2e7d32' : '#1565c0', display: 'flex', alignItems: 'center', gap: 1 }}>
          {updateInfo?.hasUpdate ? <SystemUpdateIcon /> : <CheckCircleIcon />}
          {updateInfo?.hasUpdate ? (isChhattisgarhi ? 'नवा अपडेट उपलब्ध हे!' : 'नया अपडेट उपलब्ध है!') : (isChhattisgarhi ? 'ऐप पूरा अपडेट हे' : 'ऐप पूरी तरह अपडेटेड है')}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {updateInfo?.hasUpdate ? (
            <Box>
              <Typography variant="body2" sx={{ color: '#263238', fontWeight: 600, mb: 1 }}>
                {isChhattisgarhi
                  ? <>किसान साथी के नवीनतम संस्करण <strong>v{updateInfo.latestVersion}</strong> डाउनलोड बर तैयार हे।</>
                  : <>किसान साथी का नवीनतम संस्करण <strong>v{updateInfo.latestVersion}</strong> डाउनलोड के लिए तैयार है।</>}
              </Typography>
              <Box sx={{ bgcolor: '#f1f8e9', p: 1.5, borderRadius: 2, mb: 1.5, border: '1px solid #c8e6c9' }}>
                <Typography variant="caption" sx={{ color: '#2e7d32', display: 'block' }}>
                  • {isChhattisgarhi ? 'तुंहर अभी के वर्ज़न' : 'आपका वर्तमान वर्ज़न'}: v{updateInfo.currentVersion}
                </Typography>
                <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, display: 'block' }}>
                  • {isChhattisgarhi ? 'नवा उपलब्ध वर्ज़न' : 'नया उपलब्ध वर्ज़न'}: v{updateInfo.latestVersion}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#546e7a', display: 'block', mb: 1 }}>
                * {isChhattisgarhi ? 'नोट: अपडेट करे ले तुंहर पुरना खाता, खेत अऊ किसान डायरी के हिसाब सुरक्षित रहिही।' : 'नोट: अपडेट करने पर आपका पुराना खाता, खेत व किसान डायरी का रिकॉर्ड बिल्कुल सुरक्षित रहेगा।'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1b5e20', mb: 0.5 }}>
                {isChhattisgarhi
                  ? `आप पहिली ले ही नवा संस्करण (v${updateInfo?.currentVersion || appConfig.appVersion}) चलावत हव।`
                  : `आप पहले से ही नवीनतम संस्करण (v${updateInfo?.currentVersion || appConfig.appVersion}) का उपयोग कर रहे हैं।`}
              </Typography>
              <Typography variant="caption" sx={{ color: '#546e7a' }}>
                {isChhattisgarhi ? 'सबो किसानी योजना, मौसम अलर्ट अऊ मंडी भाव नवा स्थिति म हे।' : 'सभी कृषि योजनाएं, मौसम अलर्ट और मंडी भाव नवीनतम स्थिति में हैं।'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          {updateInfo?.hasUpdate ? (
            <>
              <Button onClick={() => setUpdateDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700 }}>
                {isChhattisgarhi ? 'पाछू' : 'बाद में'}
              </Button>
              <Button
                variant="contained"
                startIcon={<GetAppIcon />}
                href={updateInfo.downloadUrl}
                target="_blank"
                download
                sx={{ bgcolor: '#2e7d32', color: '#fff', fontWeight: 800, borderRadius: 2 }}
              >
                {isChhattisgarhi ? 'अपडेट डाउनलोड करव' : 'अपडेट डाउनलोड करें'}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={() => setUpdateDialogOpen(false)}
              sx={{ bgcolor: '#1565c0', color: '#fff', fontWeight: 700, borderRadius: 2, mx: 'auto' }}
            >
              {isChhattisgarhi ? 'बने हे' : 'ठीक है'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
