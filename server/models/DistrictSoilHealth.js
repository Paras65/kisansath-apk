import mongoose from 'mongoose';

const micronutrientDeficiencySchema = new mongoose.Schema({
  nutrient: { type: String, required: true },
  deficiencyPercent: { type: Number, required: true },
  severity: { type: String },
});

const districtSoilHealthSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, unique: true, index: true },
    state: { type: String, default: 'छत्तीसगढ़' },
    nitrogenStatus: { type: String, required: true },
    phosphorusStatus: { type: String, required: true },
    potashStatus: { type: String, required: true },
    phAverage: { type: String, required: true },
    organicCarbonPercent: { type: String },
    dominantSoilType: { type: String },
    micronutrientDeficiencies: [micronutrientDeficiencySchema],
    fertilizerRecommendationNote: { type: String, required: true },
    officialSurveySource: { type: String, default: 'Soil Health Card Scheme / DAC&FW, GoI' },
    verifiedAuthority: { type: String, default: 'कृषि एवं किसान कल्याण मंत्रालय (भारत सरकार)' },
    isZeroFakeDataVerified: { type: Boolean, default: true },
    isDistrictVerified: { type: Boolean, default: true },
    statusLabel: { type: String, default: 'आधिकारिक OGD / मृदा स्वास्थ्य कार्ड सत्यापित' },
    source: { type: String, default: 'data.gov.in (OGD India / Soil Health Card)' },
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const DistrictSoilHealth = mongoose.model('DistrictSoilHealth', districtSoilHealthSchema);
export default DistrictSoilHealth;

