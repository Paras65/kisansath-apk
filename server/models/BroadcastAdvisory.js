import mongoose from 'mongoose';

const broadcastAdvisorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      enum: ['weather', 'pest', 'mandi', 'scheme', 'general'],
      default: 'general',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'urgent'],
      default: 'info',
    },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    targetDistrict: { type: String, default: 'all' },
    active: { type: Boolean, default: true },
    author: { type: String, default: 'कृषि प्रशासक / विशेषज्ञ' },
    validTill: { type: String, default: '' },
  },
  { timestamps: true }
);

broadcastAdvisorySchema.index({ active: 1, createdAt: -1 });

export const BroadcastAdvisory = mongoose.model('BroadcastAdvisory', broadcastAdvisorySchema);
export default BroadcastAdvisory;
