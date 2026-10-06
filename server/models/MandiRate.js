import mongoose from 'mongoose';

const mandiRateSchema = new mongoose.Schema(
  {
    mandi: { type: String, required: true, index: true },
    district: { type: String, required: true },
    crop: { type: String, required: true, index: true },
    variety: { type: String },
    minRate: { type: Number, required: true },
    maxRate: { type: Number, required: true },
    modalRate: { type: Number, required: true },
    trend: { type: String },
    unit: { type: String, default: '₹ / क्विंटल' },
    arrival: { type: String },
    date: { type: String, default: 'आज के भाव' },
    isLive: { type: Boolean, default: false },
    source: { type: String, default: 'Agmarknet' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mandiRateSchema.index({ mandi: 1, crop: 1 });

export const MandiRate = mongoose.model('MandiRate', mandiRateSchema);
export default MandiRate;
