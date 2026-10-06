// किसान साथी - Official KCC & Farm Report Generator
// Generates a clean, bank-ready print sheet for Kisan Credit Card (KCC) and Agriculture Verification.
import { appConfig } from '../config/appConfig';

export const generateAndPrintKccReport = ({
  farmerName = 'सम्मानित किसान',
  phone = '',
  village = 'ग्राम',
  district = 'रायपुर',
  items = []
}) => {
  const currentDate = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalAcres = items.reduce((acc, curr) => acc + (parseFloat(curr.areaAcres) || 0), 0).toFixed(1);

  const tableRows = items.map((item, idx) => `
    <tr>
      <td style="border: 1px solid #333; padding: 8px; text-align: center;">${idx + 1}</td>
      <td style="border: 1px solid #333; padding: 8px; font-weight: bold;">${item.cropName || item.crop || 'धान'}</td>
      <td style="border: 1px solid #333; padding: 8px; text-align: center;">${item.areaAcres || '1.0'} एकड़</td>
      <td style="border: 1px solid #333; padding: 8px; text-align: center;">${item.sowDate || '-'}</td>
      <td style="border: 1px solid #333; padding: 8px;">${item.stage || 'वृद्धि अवस्था'}</td>
      <td style="border: 1px solid #333; padding: 8px;">${item.nextAction || item.variety || 'नियमित देखभाल'}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
      <meta charset="UTF-8">
      <title>किसान क्रेडिट कार्ड (KCC) फसल एवं भूमि विवरण - किसान साथी</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.5; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #1b5e20; padding-bottom: 12px; margin-bottom: 20px; }
        .logo-title { font-size: 24px; font-weight: 800; color: #1b5e20; margin: 0; }
        .subtitle { font-size: 14px; color: #555; margin-top: 4px; }
        .doc-badge { display: inline-block; background: #e8f5e9; color: #1b5e20; border: 1.5px solid #2e7d32; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-top: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 14px; }
        .info-box { background: #f9fbf9; border: 1px solid #dcdcdc; padding: 10px 14px; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
        th { background: #2e7d32; color: #ffffff; border: 1px solid #1b5e20; padding: 10px 8px; text-align: center; }
        .summary-box { background: #fefce8; border: 1.5px solid #ca8a04; border-radius: 8px; padding: 12px; margin-bottom: 30px; font-size: 13px; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
        .sign-box { text-align: center; border-top: 1px dashed #444; width: 200px; padding-top: 8px; font-size: 13px; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="logo-title">🌾 किसान साथी (Kisan Saathi)</h1>
        <div class="subtitle">कृषक उन्नति एवं वित्तीय समावेशन सहायता प्रणाली • ${appConfig.stateName || 'छत्तीसगढ़'}</div>
        <div class="doc-badge">किसान क्रेडिट कार्ड (KCC) / बैंक ऋण एवं फसल सत्यापन विवरणी</div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <div><strong>कृषक का नाम:</strong> ${farmerName}</div>
          <div><strong>पंजीकृत मोबाइल:</strong> ${phone || 'उपलब्ध नहीं'}</div>
          <div><strong>दिनांक:</strong> ${currentDate}</div>
        </div>
        <div class="info-box">
          <div><strong>ग्राम / क्षेत्र:</strong> ${village}</div>
          <div><strong>जिला:</strong> ${district}</div>
          <div><strong>कुल दर्ज रकबा:</strong> ${totalAcres} एकड़</div>
        </div>
      </div>

      <h3 style="color: #1b5e20; margin-bottom: 8px;">📋 दर्ज फसलों एवं भू-खंडों का विवरण:</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">क्र.</th>
            <th style="width: 25%;">फसल का नाम</th>
            <th style="width: 15%;">रकबा (एकड़)</th>
            <th style="width: 15%;">बुआई तिथि</th>
            <th style="width: 20%;">वर्तमान अवस्था</th>
            <th style="width: 20%;">आगामी कार्य / किस्म</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="summary-box">
        <strong>📌 सरकारी उपार्जन व साख सीमा संदर्भ (Reference Rates):</strong><br>
        • धान उपार्जन कुल दर: <strong>₹${appConfig.paddyScheme.totalRate.toLocaleString('en-IN')}/क्विंटल</strong> (MSP: ₹${appConfig.paddyScheme.mspRate.toLocaleString('en-IN')} + बोनस: ₹${appConfig.paddyScheme.bonusRate.toLocaleString('en-IN')})<br>
        • अधिकतम उपार्जन सीमा: <strong>${appConfig.paddyScheme.maxQuintalsPerAcre} क्विंटल प्रति एकड़</strong><br>
        • हेल्पलाइन: <strong>1800-180-1551</strong> (टोल-फ्री किसान कॉल सेंटर)
      </div>

      <div class="footer">
        <div style="font-size: 11px; color: #777;">
          * यह रिपोर्ट किसान साथी डिजिटल प्रणाली द्वारा कृषक की स्व-प्रमाणित प्रविष्टि के आधार पर जनरेट की गई है।
        </div>
        <div class="sign-box">
          हस्ताक्षर / अंगूठा कृषक
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  // Tier 0: Direct Native Android PrintManager via AndroidBridge
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.printDocument === 'function') {
    try {
      window.AndroidBridge.printDocument(`Kisan_Saathi_KCC_${farmerName}`, htmlContent);
      return;
    } catch (e) {
      console.warn('[Print] AndroidBridge printDocument fallback:', e);
    }
  }

  // Tier 1: Web Browser Popup Print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // If popup blocked, print current page
    window.print();
  }
};
