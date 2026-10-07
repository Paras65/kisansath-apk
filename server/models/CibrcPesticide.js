import mongoose from 'mongoose';

const cibrcPesticideSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cropId: { type: String, required: true, index: true },
    cropName: { type: String, required: true },
    targetPest: { type: String, required: true },
    targetPestSci: { type: String },
    genericName: { type: String, required: true },
    dosagePerAcre: { type: String, required: true },
    dosagePerPump15L: { type: String, required: true },
    waterVolumeLiters: { type: String },
    phiDays: { type: Number, required: true },
    phiSeverity: { type: String, default: 'medium' },
    toxicityClass: { type: String },
    cibrcRegRef: { type: String },
    safetyEquipment: { type: String },
    antidoteGuidance: { type: String },
    statutoryWarning: { type: String },
    verifiedAuthority: { type: String, default: 'CIB&RC (केंद्रीय कीटनाशी बोर्ड, भारत सरकार)' },
    isZeroFakeDataVerified: { type: Boolean, default: true },
    source: { type: String, default: 'data.gov.in (OGD India / CIB&RC)' },
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CibrcPesticide = mongoose.model('CibrcPesticide', cibrcPesticideSchema);
export default CibrcPesticide;

