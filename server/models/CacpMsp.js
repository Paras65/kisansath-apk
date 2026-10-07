import mongoose from 'mongoose';

const cacpMspSchema = new mongoose.Schema(
  {
    cropId: { type: String, required: true, unique: true, index: true },
    cropName: { type: String, required: true },
    season: { type: String, required: true },
    nationalMspPerQuintal: { type: Number, required: true },
    nationalGradeAMsp: { type: Number },
    stateBonusPerQuintal: { type: Number, default: 0 },
    effectiveFarmerPrice: { type: Number, required: true },
    procurementLimitPerAcre: { type: String },
    statutoryNotificationRef: { type: String },
    verifiedAuthority: { type: String, default: 'कृषि लागत एवं मूल्य आयोग (CACP, भारत सरकार)' },
    lastUpdatedYear: { type: String, default: '2024-25' },
    isZeroFakeDataVerified: { type: Boolean, default: true },
    source: { type: String, default: 'data.gov.in (OGD India / CACP MSP)' },
    lastFetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const CacpMsp = mongoose.model('CacpMsp', cacpMspSchema);
export default CacpMsp;

