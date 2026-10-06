import mongoose from 'mongoose';

const communityQASchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    author: { type: String, required: true },
    crop: { type: String, required: true },
    time: { type: String, default: 'अभी-अभी' },
    question: { type: String, required: true },
    answersCount: { type: Number, default: 0 },
    bestAnswer: { type: String },
    replies: [
      {
        id: { type: String, required: true },
        author: { type: String, required: true },
        role: { type: String, default: 'किसान भाई' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

communityQASchema.index({ createdAt: -1 });

export const CommunityQA = mongoose.model('CommunityQA', communityQASchema);
export default CommunityQA;
