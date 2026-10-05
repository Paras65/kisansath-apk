import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    badge: { type: String },
    status: { type: String, default: 'सक्रिय (Active)' },
    summary: { type: String, required: true },
    keyPoints: [{ type: String }],
    linkUrl: { type: String, required: true },
    linkText: { type: String, default: 'पोर्टल खोलें' },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;
