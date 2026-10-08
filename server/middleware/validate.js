// किसान साथी (Kisan Saathi) - OpenAPI Aligned Request Validation Middleware
// Single Source of Truth for Express API Input Validation, Sanitization, and Security Protection.
// Directly mirrors component schemas in docs/openapi.yaml (Rule 12 & Rule 13 compliant).

import { ApiError, recordAuditLog } from './errorHandler.js';

/**
 * Standard Indian 10-digit phone cleaner & validator.
 * Accepts: "+91 98765 43210", "9876-543210", "9876543210"
 * Returns 10-digit string if valid, or null if invalid.
 */
export const normalizeIndianPhone = (rawPhone) => {
  if (typeof rawPhone !== 'string') return null;
  const digits = rawPhone.replace(/\D/g, '');
  const tenDigits = digits.slice(-10);
  if (/^[6-9]\d{9}$/.test(tenDigits)) {
    return tenDigits;
  }
  return null;
};

/**
 * XSS & NoSQL sanitization helper.
 * Strips HTML tags, trims, and bounds max character length.
 */
export const sanitizeString = (val, maxLen = 200) => {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // Strip full HTML tags (<script>, <b>, etc.)
    .replace(/[<>]/g, '')     // Strip any remaining brackets
    .trim()
    .slice(0, maxLen);
};

/**
 * Prototype pollution inspection.
 * Rejects objects containing __proto__, constructor, or prototype keys.
 */
const hasPrototypePollution = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of Object.getOwnPropertyNames(obj)) {
    if (dangerousKeys.includes(key)) return true;
  }
  for (const key of Object.keys(obj)) {
    if (dangerousKeys.includes(key)) return true;
    if (typeof obj[key] === 'object' && obj[key] !== null && hasPrototypePollution(obj[key])) {
      return true;
    }
  }
  return false;
};

/**
 * Centralized Schema Validation Runner.
 * Validates request payload against OpenAPI component schema definitions.
 */
export const validateBody = (schemaName, schemaRules) => {
  return (req, res, next) => {
    // 1. Prototype pollution guard
    if (hasPrototypePollution(req.body)) {
      recordAuditLog({
        type: 'security',
        severity: 'high',
        statusCode: 400,
        message: 'प्रोटोटाइप पॉल्यूशन पेलोड ब्लॉक किया गया',
        technicalError: 'Prototype pollution attempt detected in req.body',
        req,
      });
      return res.status(400).json({
        success: false,
        status: 400,
        error: 'अमान्य अनुरोध पेलोड (Security Violation)',
        technicalError: 'Forbidden property keys detected',
      });
    }

    const body = req.body || {};

    // 2. Validate required fields
    if (Array.isArray(schemaRules.required)) {
      for (const requiredField of schemaRules.required) {
        const val = body[requiredField];
        if (val === undefined || val === null || val === '') {
          const userMsg = schemaRules.customMessages?.[requiredField] ||
            `आवश्यक फ़ील्ड गायब है: '${requiredField}' भरें।`;
          return res.status(400).json({
            success: false,
            status: 400,
            field: requiredField,
            error: userMsg,
            technicalError: `Missing required field: ${requiredField} in schema ${schemaName}`,
          });
        }
      }
    }

    // 3. Strict additional properties guard (if additionalProperties: false)
    if (schemaRules.additionalProperties === false && schemaRules.properties) {
      const allowedKeys = new Set(Object.keys(schemaRules.properties));
      for (const key of Object.keys(body)) {
        if (!allowedKeys.has(key)) {
          return res.status(400).json({
            success: false,
            status: 400,
            field: key,
            error: `अमान्य फ़ील्ड '${key}' भेजी गई है।`,
            technicalError: `Disallowed property '${key}' in schema ${schemaName}`,
          });
        }
      }
    }

    // 4. Validate and sanitize individual properties
    if (schemaRules.properties) {
      for (const [propName, propDef] of Object.entries(schemaRules.properties)) {
        const val = body[propName];
        if (val === undefined || val === null) continue; // Optional field omitted

        // Check Type: string
        if (propDef.type === 'string') {
          if (typeof val !== 'string') {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' टेक्स्ट (स्ट्रिंग) होनी चाहिए।`,
              technicalError: `Expected string, received ${typeof val}`,
            });
          }

          // Special check: Indian Phone
          if (propDef.format === 'phone' || propName === 'phone') {
            const cleanPhone = normalizeIndianPhone(val);
            if (!cleanPhone) {
              return res.status(400).json({
                success: false,
                status: 400,
                field: propName,
                error: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)।',
                technicalError: `Invalid Indian phone number: '${val}'`,
              });
            }
            body.cleanPhone = cleanPhone; // Attach normalized 10-digit phone
          }

          // String length bounds
          if (propDef.minLength !== undefined && val.trim().length < propDef.minLength) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' में कम से कम ${propDef.minLength} अक्षर होने चाहिए।`,
              technicalError: `String shorter than minLength ${propDef.minLength}`,
            });
          }
          if (propDef.maxLength !== undefined && val.length > propDef.maxLength) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' अधिकतम ${propDef.maxLength} अक्षरों की हो सकती है।`,
              technicalError: `String exceeds maxLength ${propDef.maxLength}`,
            });
          }

          // Enum check
          if (Array.isArray(propDef.enum) && !propDef.enum.includes(val)) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' का मान मान्य विकल्पों में से एक होना चाहिए: [${propDef.enum.join(', ')}]`,
              technicalError: `Value '${val}' not in enum`,
            });
          }

          // Sanitize string unless it's a base64 image or passkey
          if (propDef.format !== 'byte' && propName !== 'image' && propName !== 'passkey') {
            body[propName] = sanitizeString(val, propDef.maxLength || 500);
          }
        }

        // Check Type: number / integer
        if (propDef.type === 'number' || propDef.type === 'integer') {
          const numVal = Number(val);
          if (isNaN(numVal)) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' मान्य संख्या होनी चाहिए।`,
              technicalError: `Expected numeric, received ${val}`,
            });
          }
          if (propDef.type === 'integer' && !Number.isInteger(numVal)) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' पूर्ण संख्या (Integer) होनी चाहिए।`,
              technicalError: `Expected integer, received float ${numVal}`,
            });
          }
          if (propDef.minimum !== undefined && numVal < propDef.minimum) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' कम से कम ${propDef.minimum} होनी चाहिए।`,
              technicalError: `Value ${numVal} below minimum ${propDef.minimum}`,
            });
          }
          if (propDef.maximum !== undefined && numVal > propDef.maximum) {
            return res.status(400).json({
              success: false,
              status: 400,
              field: propName,
              error: `फ़ील्ड '${propName}' अधिकतम ${propDef.maximum} हो सकती है।`,
              technicalError: `Value ${numVal} exceeds maximum ${propDef.maximum}`,
            });
          }
          body[propName] = numVal; // Coerce to clean number
        }

        // Check Type: boolean
        if (propDef.type === 'boolean') {
          body[propName] = Boolean(val);
        }
      }
    }

    next();
  };
};

/**
 * Path Parameter Validators (e.g. :phone, :plotId)
 */
export const validateParams = (paramRules) => {
  return (req, res, next) => {
    for (const [paramName, rule] of Object.entries(paramRules)) {
      const val = req.params[paramName];
      if (!val) {
        return res.status(400).json({
          success: false,
          status: 400,
          field: paramName,
          error: `URL पैरामीटर '${paramName}' अनिवार्य है।`,
        });
      }
      if (rule.format === 'phone' || paramName === 'phone') {
        const cleanPhone = normalizeIndianPhone(val);
        if (!cleanPhone) {
          return res.status(400).json({
            success: false,
            status: 400,
            field: paramName,
            error: 'URL में मान्य 10-अंकों का भारतीय मोबाइल नंबर होना चाहिए।',
          });
        }
        req.params.cleanPhone = cleanPhone;
      }
    }
    next();
  };
};

// ==========================================
// PRE-DEFINED SCHEMAS FROM OPENAPI SPEC
// ==========================================

export const Schemas = {
  FarmerAuthRequest: {
    required: ['phone'],
    additionalProperties: false,
    properties: {
      phone: { type: 'string', format: 'phone' },
      name: { type: 'string', maxLength: 80 },
      pin: { type: 'string', minLength: 4, maxLength: 6 },
      village: { type: 'string', maxLength: 80 },
      district: { type: 'string', maxLength: 80 },
      totalLandAcres: { type: 'number', minimum: 0, maximum: 5000 },
    },
    customMessages: {
      phone: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।',
    },
  },

  CreateMarketListingRequest: {
    required: ['phone'],
    additionalProperties: false,
    properties: {
      crop: { type: 'string', minLength: 2, maxLength: 80 },
      commodity: { type: 'string', maxLength: 80 },
      variety: { type: 'string', maxLength: 50 },
      quantity: { type: 'string', maxLength: 50 },
      quantityQuintals: { type: 'number', minimum: 0.1, maximum: 10000 },
      expectedPrice: { type: 'string', maxLength: 60 },
      pricePerQuintal: { type: 'number', minimum: 1, maximum: 500000 },
      farmerName: { type: 'string', maxLength: 80 },
      sellerName: { type: 'string', maxLength: 80 },
      location: { type: 'string', maxLength: 100 },
      village: { type: 'string', maxLength: 80 },
      district: { type: 'string', maxLength: 80 },
      phone: { type: 'string', format: 'phone' },
    },
  },

  CreateMachineryRentalRequest: {
    required: ['phone'],
    additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 100 },
      equipmentType: { type: 'string', maxLength: 100 },
      category: { type: 'string', maxLength: 50 },
      rate: { type: 'string', minLength: 2, maxLength: 50 },
      ratePerHour: { type: 'number', minimum: 1, maximum: 50000 },
      operatorIncluded: { type: 'boolean' },
      contactName: { type: 'string', maxLength: 60 },
      ownerName: { type: 'string', maxLength: 60 },
      phone: { type: 'string', format: 'phone' },
      location: { type: 'string', maxLength: 100 },
      village: { type: 'string', maxLength: 80 },
      district: { type: 'string', maxLength: 80 },
      features: { type: 'array' },
    },
  },

  CreateCommunityQARequest: {
    required: ['question'],
    additionalProperties: false,
    properties: {
      author: { type: 'string', maxLength: 60 },
      authorName: { type: 'string', maxLength: 60 },
      crop: { type: 'string', maxLength: 60 },
      question: { type: 'string', minLength: 5, maxLength: 500 },
    },
    customMessages: {
      question: 'कृपया कम से कम 5 अक्षरों का कृषि प्रश्न दर्ज करें।',
    },
  },

  CreateCommunityReplyRequest: {
    additionalProperties: false,
    properties: {
      author: { type: 'string', maxLength: 60 },
      authorName: { type: 'string', maxLength: 60 },
      role: { type: 'string', maxLength: 40 },
      text: { type: 'string', minLength: 3, maxLength: 500 },
      reply: { type: 'string', maxLength: 500 },
    },
  },

  SavePlotRequest: {
    required: ['plotName', 'cropName', 'areaAcres'],
    additionalProperties: false,
    properties: {
      plotId: { type: 'string', maxLength: 50 },
      plotName: { type: 'string', minLength: 2, maxLength: 60 },
      cropId: { type: 'string', maxLength: 40 },
      cropName: { type: 'string', minLength: 2, maxLength: 60 },
      areaAcres: { type: 'number', minimum: 0.05, maximum: 1000 },
      sowDate: { type: 'string', maxLength: 30 },
      season: { type: 'string', maxLength: 40 },
      notes: { type: 'string', maxLength: 200 },
    },
  },

  ToggleTaskRequest: {
    required: ['taskId'],
    additionalProperties: false,
    properties: {
      plotId: { type: 'string', maxLength: 50 },
      taskId: { type: 'string', minLength: 2, maxLength: 60 },
    },
  },

  CreateFarmDiaryRequest: {
    required: ['amount', 'description'],
    additionalProperties: false,
    properties: {
      plotId: { type: 'string', maxLength: 50 },
      cropName: { type: 'string', maxLength: 60 },
      areaAcres: { type: 'number', minimum: 0 },
      sowDate: { type: 'string', maxLength: 30 },
      stage: { type: 'string', maxLength: 50 },
      nextAction: { type: 'string', maxLength: 100 },
      type: { type: 'string', enum: ['expense', 'income'] },
      category: { type: 'string', maxLength: 50 },
      amount: { type: 'number', minimum: 0, maximum: 10000000 },
      description: { type: 'string', minLength: 2, maxLength: 200 },
      date: { type: 'string', maxLength: 30 },
    },
  },

  AdminLoginRequest: {
    required: ['passkey'],
    additionalProperties: false,
    properties: {
      passkey: { type: 'string', minLength: 4, maxLength: 128 },
      username: { type: 'string', maxLength: 60 },
    },
  },

  CreateBroadcastRequest: {
    required: ['title', 'message'],
    additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 3, maxLength: 200 },
      message: { type: 'string', minLength: 5, maxLength: 1000 },
      category: { type: 'string', maxLength: 50 },
      severity: { type: 'string', enum: ['info', 'warning', 'emergency', 'urgent'] },
      targetDistrict: { type: 'string', maxLength: 60 },
      author: { type: 'string', maxLength: 100 },
      validTill: { type: 'string', maxLength: 50 },
      active: { type: 'boolean' },
    },
  },

  CropDoctorDiagnoseRequest: {
    additionalProperties: false,
    properties: {
      image: { type: 'string', maxLength: 15000000 },
      symptoms: { type: 'string', maxLength: 500 },
      crop: { type: 'string', maxLength: 60 },
      cropId: { type: 'string', maxLength: 40 },
      district: { type: 'string', maxLength: 40 },
    },
  },

  OfflineMandiQueryRequest: {
    required: ['crop'],
    additionalProperties: false,
    properties: {
      crop: { type: 'string', minLength: 2, maxLength: 50 },
      commodity: { type: 'string', maxLength: 50 },
      mandi: { type: 'string', maxLength: 50 },
      district: { type: 'string', maxLength: 50 },
    },
  },
};
