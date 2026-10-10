import React, { useState, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Grid,
  Button,
  Chip,
  Paper
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { speakText, stopSpeech } from '../../utils/speech';
import { appConfig } from '../../config/appConfig';
import { notify } from '../../services/notificationService';
import { useLanguage } from '../../utils/i18n';
import { acreToDismil, dismilToAcre, stepAcre, stepDismil, calculatePaddyProcurement } from '../../utils/unitConverter';

const TokenGuideModal = lazy(() => import('../TokenGuideModal').then((m) => ({ default: m.TokenGuideModal })));

export const DhanMspCalculatorSubTab = () => {
  const { isChhattisgarhi, t } = useLanguage();

  const [paddyUnit, setPaddyUnit] = useState('acre'); // 'acre' | 'dismil'
  const [paddyAcres, setPaddyAcres] = useState(2.5);
  const [openTokenGuide, setOpenTokenGuide] = useState(false);

  // Paddy Kharidi Math - Fully Environment Driven & Bardana Engine
  const pAcresNum = paddyUnit === 'dismil' ? dismilToAcre(paddyAcres) : (parseFloat(paddyAcres) || 0);
  const paddyMath = calculatePaddyProcurement(pAcresNum, appConfig.paddyScheme.maxQuintalsPerAcre);
  const maxQuintals = paddyMath.maxQuintals.toFixed(1);
  const totalPaddyAmount = paddyMath.totalPayout;
  const mspPart = paddyMath.mspCommon;
  const bonusPart = paddyMath.bonusCommon;

  const handleTogglePaddyUnit = (newUnit) => {
    if (newUnit === paddyUnit) return;
    if (newUnit === 'dismil') {
      setPaddyAcres(acreToDismil(paddyAcres));
    } else {
      setPaddyAcres(dismilToAcre(paddyAcres));
    }
    setPaddyUnit(newUnit);
  };

  const handleStepPaddy = (delta) => {
    if (paddyUnit === 'dismil') {
      setPaddyAcres((prev) => stepDismil(prev, delta * 50));
    } else {
      setPaddyAcres((prev) => stepAcre(prev, delta));
    }
  };

  const handleReadPaddyMath = () => {
    const text = isChhattisgarhi
      ? `${pAcresNum} एकड़ (${paddyMath.dismil} डिसमिल) रकबा म 21 क्विंटल प्रति एकड़ हिसाब ले आप अधिकतम ${paddyMath.maxQuintals} क्विंटल धान बेच सकथो। ₹${paddyMath.totalPayout.toLocaleString('en-IN')} के कुल भुगतान मिलही। ${paddyMath.bardanaBags} जूट बारदाना लगही, जेकर ₹${paddyMath.bardanaReimbursement.toLocaleString('en-IN')} प्रतिपूर्ति अलग ले मिलही।`
      : `${pAcresNum} एकड़ रकबे में ${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल प्रति एकड़ के हिसाब से आप अधिकतम ${paddyMath.maxQuintals} क्विंटल धान बेच सकते हैं। ₹${paddyMath.totalPayout.toLocaleString('en-IN')} की कुल राशि बनेगी। कुल ${paddyMath.bardanaBags} बारदाने लगेंगे।`;
    speakText(text);
  };

  const handleSharePaddy = () => {
    notify.info('व्हाट्सएप पर धान हिसाब साझा किया जा रहा है...');
    const text = `🌾 *किसान साथी - सरकारी धान उपार्जन रसीद हिसाब* 🌾
━━━━━━━━━━━━━━━━━━
📍 *राज्य:* ${appConfig.stateName} (कृषक उन्नति योजना)
📐 *दर्ज रकबा:* ${pAcresNum} एकड़ (${paddyMath.dismil} डिसमिल)
⚖️ *अधिकतम धान खरीदी:* ${maxQuintals} क्विंटल (${appConfig.paddyScheme.maxQuintalsPerAcre} क्विं/एकड़)
💰 *कुल बैंक भुगतान (@ ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}):* ₹${totalPaddyAmount.toLocaleString('en-IN')}

📊 *भुगतान विवरण:*
1. समिति MSP (@ ₹${appConfig.paddyScheme.mspRate.toLocaleString('en-IN')}): ₹${mspPart.toLocaleString('en-IN')}
2. अंतर राशि / बोनस DBT (@ ₹${appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')}): ₹${bonusPart.toLocaleString('en-IN')}

🎒 *बारदाना व टोकन:*
• जूट बोरी (40kg मानक): ~${paddyMath.bardanaBags} बोरी
• शासन प्रतिपूर्ति: ₹${paddyMath.bardanaReimbursement.toLocaleString('en-IN')} (₹25/बोरा वापसी)
• टोकन तुंहर हाथ कोटा: अधिकतम ${paddyMath.tokenLimit} टोकन
━━━━━━━━━━━━━━━━━━
📲 किसान साथी ऐप: ${appConfig.webPortalUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Box>
      <Card
        sx={{
          p: { xs: 1.8, sm: 2.5 },
          mb: 2.5,
          borderRadius: '20px',
          border: '1.5px solid #a5d6a7',
          bgcolor: '#ffffff',
          boxShadow: '0 4px 16px rgba(27, 94, 32, 0.06)',
          maxWidth: { xs: '100%', md: 760 },
          mx: 'auto'
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.8, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '1.05rem', lineHeight: 1.2 }}>
              🌾 {appConfig.stateName} {isChhattisgarhi ? 'कृषक उन्नति धान खरीदी हिसाब' : 'कृषक उन्नति धान उपार्जन कैलकुलेटर'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#556958', fontSize: '0.74rem' }}>
              {appConfig.paddyScheme.maxQuintalsPerAcre} {isChhattisgarhi ? `क्विंटल/एकड़ सीमा • ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्विंटल पक्का भाव` : `क्विंटल/एकड़ सीमा • ₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्विंटल सुनिश्चित मूल्य`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VolumeUpIcon sx={{ fontSize: 16 }} />}
              onClick={handleReadPaddyMath}
              sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderRadius: '8px', color: '#1b5e20', borderColor: '#a5d6a7' }}
            >
              {isChhattisgarhi ? 'गोठ सुनव' : 'सुनें'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<WhatsAppIcon sx={{ fontSize: 16, color: '#25D366' }} />}
              onClick={handleSharePaddy}
              sx={{ fontSize: '0.72rem', py: 0.4, px: 1, borderRadius: '8px', color: '#1b5e20', borderColor: '#a5d6a7' }}
            >
              {isChhattisgarhi ? 'शेयर' : 'शेयर'}
            </Button>
          </Box>
        </Box>

        {/* Input Console */}
        <Box sx={{ p: 1.8, bgcolor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.74rem' }}>
              {isChhattisgarhi
                ? (paddyUnit === 'acre' ? 'अपन खेत के रकबा (एकड़ म)' : 'अपन खेत के रकबा (डिसमिल म)')
                : (paddyUnit === 'acre' ? 'अपनी जमीन का रकबा (एकड़ में)' : 'अपनी जमीन का रकबा (डिसमिल में)')}
            </Typography>
            {/* Unit Switcher */}
            <Box sx={{ display: 'inline-flex', bgcolor: '#e2e8f0', p: 0.2, borderRadius: 1.5 }}>
              <Button
                size="small"
                onClick={() => handleTogglePaddyUnit('acre')}
                sx={{
                  py: 0.1,
                  px: 0.8,
                  minWidth: 0,
                  fontSize: '0.66rem',
                  fontWeight: paddyUnit === 'acre' ? 800 : 600,
                  bgcolor: paddyUnit === 'acre' ? '#1b5e20' : 'transparent',
                  color: paddyUnit === 'acre' ? '#fff' : '#475569',
                  borderRadius: 1,
                  textTransform: 'none',
                  lineHeight: 1.2
                }}
              >
                {isChhattisgarhi ? 'एकड़' : 'एकड़'}
              </Button>
              <Button
                size="small"
                onClick={() => handleTogglePaddyUnit('dismil')}
                sx={{
                  py: 0.1,
                  px: 0.8,
                  minWidth: 0,
                  fontSize: '0.66rem',
                  fontWeight: paddyUnit === 'dismil' ? 800 : 600,
                  bgcolor: paddyUnit === 'dismil' ? '#1b5e20' : 'transparent',
                  color: paddyUnit === 'dismil' ? '#fff' : '#475569',
                  borderRadius: 1,
                  textTransform: 'none',
                  lineHeight: 1.2
                }}
              >
                {isChhattisgarhi ? 'डिसमिल' : 'डिसमिल'}
              </Button>
            </Box>
          </Box>

          {/* Steppers */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleStepPaddy(-0.5)}
              aria-label={isChhattisgarhi ? 'रकबा घटाव' : 'रकबा घटाएं'}
              sx={{
                minWidth: 36,
                height: 40,
                p: 0,
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                color: '#1b5e20',
                fontWeight: 900,
                bgcolor: '#ffffff'
              }}
            >
              <RemoveIcon sx={{ fontSize: 18 }} />
            </Button>
            <TextField
              fullWidth
              size="small"
              type="number"
              inputProps={{
                min: paddyUnit === 'dismil' ? 10 : 0.1,
                step: paddyUnit === 'dismil' ? 10 : 0.1,
                inputMode: 'decimal',
                style: { fontSize: '1.05rem', fontWeight: 800, textAlign: 'center' }
              }}
              value={paddyAcres}
              onChange={(e) => setPaddyAcres(e.target.value)}
              helperText={
                paddyUnit === 'acre'
                  ? `≈ ${Math.round(parseFloat(paddyAcres || 0) * 100)} डिसमिल`
                  : `≈ ${(parseFloat(paddyAcres || 0) / 100).toFixed(2)} एकड़`
              }
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#ffffff' }, '& .MuiFormHelperText-root': { textAlign: 'center', mt: 0.3 } }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleStepPaddy(0.5)}
              aria-label={isChhattisgarhi ? 'रकबा बढ़ाव' : 'रकबा बढ़ाएं'}
              sx={{
                minWidth: 36,
                height: 40,
                p: 0,
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                color: '#1b5e20',
                fontWeight: 900,
                bgcolor: '#ffffff'
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>

          {/* Quick Chips */}
          <Box sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.6, display: 'block', fontSize: '0.74rem' }}>
              {isChhattisgarhi ? `⚡ झटपट ${paddyUnit === 'acre' ? 'एकड़' : 'डिसमिल'} चुनव:` : `⚡ त्वरित ${paddyUnit === 'acre' ? 'एकड़' : 'डिसमिल'} चुनें:`}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.8 }}>
              {(paddyUnit === 'acre' ? [1, 2, 2.5, 5, 10] : [50, 100, 200, 250, 500]).map((val) => {
                const isSelected = parseFloat(paddyAcres) === val;
                return (
                  <Button
                    key={val}
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setPaddyAcres(val)}
                    sx={{
                      py: 0.4,
                      px: 0.5,
                      fontSize: { xs: '0.72rem', sm: '0.78rem' },
                      fontWeight: isSelected ? 800 : 600,
                      bgcolor: isSelected ? '#1b5e20' : '#fff',
                      color: isSelected ? '#fff' : '#1b5e20',
                      borderColor: '#a5d6a7',
                      minWidth: 0,
                      borderRadius: '10px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: isSelected ? '#144a19' : '#e8f5e9',
                        borderColor: '#2e7d32'
                      }
                    }}
                  >
                    {val} {paddyUnit === 'acre' ? (isChhattisgarhi ? 'एकड़' : 'एकड़') : (isChhattisgarhi ? 'डिस.' : 'डिस.')}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* UNIFIED DIGITAL PASSBOOK RECEIPT CARD (Integrated Bardana & Reimbursement) */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1.5px solid #a5d6a7',
            bgcolor: '#fafdf9',
            mb: 2.5,
            boxShadow: '0 3px 12px rgba(27, 94, 32, 0.05)'
          }}
        >
          {/* Receipt Header Banner */}
          <Box
            sx={{
              bgcolor: '#1b5e20',
              color: '#ffffff',
              p: { xs: 1.8, sm: 2.2 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#c8e6c9', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>
                {isChhattisgarhi ? 'सरकारी धान खरीदी रसीद हिसाब' : 'सरकारी उपार्जन रसीद अनुमान'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffeb3b', lineHeight: 1.1, mt: 0.3, fontSize: { xs: '1.6rem', sm: '2rem' } }}>
                ₹ {totalPaddyAmount.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Chip
              label={`₹${appConfig.paddyScheme.totalRate}/क्विंटल`}
              sx={{ bgcolor: '#ffb300', color: '#000', fontWeight: 900, fontSize: '0.82rem', height: 28, borderRadius: '8px' }}
            />
          </Box>

          {/* Receipt Breakdown Table */}
          <Box sx={{ p: { xs: 1.8, sm: 2.2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #e8f5e9' }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                {isChhattisgarhi ? 'जम्मा दर्ज रकबा:' : 'कुल दर्ज रकबा:'}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                {pAcresNum} एकड़
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #e8f5e9' }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                {isChhattisgarhi ? `ज्यादा ले ज्यादा धान खरीदी (${appConfig.paddyScheme.maxQuintalsPerAcre} क्विं/एकड़):` : `अधिकतम खरीदी धान (${appConfig.paddyScheme.maxQuintalsPerAcre} क्विं/एकड़):`}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.92rem' }}>
                {maxQuintals} क्विंटल
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #e8f5e9' }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                1. समिति तौल भुगतान (MSP @ ₹{appConfig.paddyScheme.mspRate.toLocaleString('en-IN')}):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.88rem' }}>
                ₹ {mspPart.toLocaleString('en-IN')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1.5px dashed #81c784' }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                2. अंतर राशि / बोनस DBT (@ ₹{appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')}):
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#e65100', fontSize: '0.88rem' }}>
                ₹ {bonusPart.toLocaleString('en-IN')}
              </Typography>
            </Box>

            {/* Total Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '0.95rem' }}>
                {isChhattisgarhi ? 'जम्मा बैंक खाता म भुगतान:' : 'कुल बैंक खाता भुगतान:'}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1b5e20', fontSize: '1.15rem' }}>
                ₹ {totalPaddyAmount.toLocaleString('en-IN')}
              </Typography>
            </Box>

            {/* Inline Integrated Bardana & Token Strip */}
            <Box sx={{ mt: 1.5, p: 1.4, bgcolor: '#fffbf5', borderRadius: '14px', border: '1px solid #ffe082' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                <Inventory2Icon sx={{ color: '#e65100', fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#bf360c', fontSize: '0.82rem' }}>
                  {t('bardana_card_title')}
                </Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#ffffff', p: 1, borderRadius: '10px', border: '1px solid #ffecb3', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#795548', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                      जूट बारदाना (40kg मानक)
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#e65100', lineHeight: 1.2, my: 0.2 }}>
                      ~{paddyMath.bardanaBags} {isChhattisgarhi ? 'बोरा' : 'बोरी'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8d6e63', fontSize: '0.65rem' }}>
                      1 क्विंटल = 2.5 बारदाना
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#ffffff', p: 1, borderRadius: '10px', border: '1px solid #ffecb3', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#795548', display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                      {t('bardana_reimbursement')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#2e7d32', lineHeight: 1.2, my: 0.2 }}>
                      ₹{paddyMath.bardanaReimbursement.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#388e3c', fontSize: '0.65rem' }}>
                      ₹25/बोरा शासन वापसी
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="caption" sx={{ color: '#5d4037', fontSize: '0.72rem', display: 'block', mt: 1 }}>
                📱 <strong>टोकन कोटा:</strong> {isChhattisgarhi
                  ? (pAcresNum <= 10 ? 'तुंहर रकबा (≤10 एकड़) बर "टोकन तुंहर हाथ" म अधिकतम 2 टोकन कटही।' : 'तुंहर रकबा (>10 एकड़) बर "टोकन तुंहर हाथ" म अधिकतम 3 टोकन तक जारी हो सकत हे।')
                  : (pAcresNum <= 10 ? 'आपके रकबे (≤10 एकड़) हेतु "टोकन तुंहर हाथ" में अधिकतम 2 टोकन कटेंगे।' : 'आपके रकबे (>10 एकड़) हेतु "टोकन तुंहर हाथ" में अधिकतम 3 टोकन तक जारी हो सकते हैं।')}
              </Typography>
            </Box>
          </Box>

          {/* Receipt Footer Notice */}
          <Box sx={{ bgcolor: '#f1f8e9', px: 2, py: 1, borderTop: '1px solid #dcedc8', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#2e7d32', fontSize: '0.72rem', fontWeight: 700 }}>
              {isChhattisgarhi
                ? 'समिति म धान तौल के बाद MSP पइसा तुरंत अउ अंतर राशि सीधा बैंक खाता म जमा होथे।'
                : 'समिति में धान तौल उपरांत MSP राशि तुरंत व अंतर राशि सीधे बैंक खाते में जमा होती है।'}
            </Typography>
          </Box>
        </Paper>

        {/* Quick Action Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => { stopSpeech(); setOpenTokenGuide(true); }}
          sx={{
            bgcolor: '#1d4ed8',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.86rem',
            borderRadius: '14px',
            py: 1.1,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
            '&:hover': { bgcolor: '#1e40af' }
          }}
        >
          {isChhattisgarhi ? '🎯 टोकन तुंहर हाथ: नियम, बोरी अऊ ऑनलाइन गाइड देखव ➔' : '🎯 टोकन तुंहर हाथ: पात्रता, बोरी व ऑनलाइन टोकन गाइड देखें ➔'}
        </Button>
      </Card>

      {/* On-Demand Lazy Loaded Modal */}
      <Suspense fallback={null}>
        {openTokenGuide && (
          <TokenGuideModal
            open={openTokenGuide}
            onClose={() => setOpenTokenGuide(false)}
            initialAcres={pAcresNum || 1.0}
          />
        )}
      </Suspense>
    </Box>
  );
};

