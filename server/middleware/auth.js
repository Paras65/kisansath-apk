// किसान साथी - Farmer JWT Authentication & IDOR Authorization Middleware
// Protects farmer profiles and plot modifications (Rule 10 & 13)

import { verifyJwt } from '../utils/jwt.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[CRITICAL SECURITY ERROR] JWT_SECRET is not configured in .env!');
  }
  return secret;
};

export const requireFarmerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'लॉगिन सत्र अमान्य है। कृपया पुनः लॉगिन करें।' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token, getJwtSecret());

  if (!payload || !payload.phone) {
    return res.status(401).json({ error: 'सुरक्षा टोकन अमान्य या समाप्त हो चुका है।' });
  }

  // IDOR Protection: If route specifies a :phone parameter, verify it matches the token
  if (req.params.phone) {
    const routePhone = req.params.phone.replace(/[\s\-\+]/g, '').slice(-10);
    const tokenPhone = payload.phone.replace(/[\s\-\+]/g, '').slice(-10);

    if (routePhone !== tokenPhone) {
      return res.status(403).json({ error: 'अनधिकृत पहुंच: आप केवल अपने खाते का डेटा बदल सकते हैं।' });
    }
  }

  req.farmer = payload;
  next();
};

export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'प्रशासक लॉगिन सत्र अमान्य है। कृपया पुनः लॉगिन करें।' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token, getJwtSecret());

  if (!payload || payload.role !== 'superadmin') {
    return res.status(403).json({ error: 'अनधिकृत पहुंच: केवल सुपर एडमिन ही इस डेटा को देख या बदल सकते हैं।' });
  }

  req.admin = payload;
  next();
};
