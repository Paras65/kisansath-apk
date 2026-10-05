import mongoose from 'mongoose';

const marketListingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    crop: { type: String, required: true },
    quantity: { type: String, required: true },
    expectedPrice: { type: String, required: true },
    farmerName: { type: String, required: true },
    location: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, default: 'आज पोस्ट किया गया' },
  },
  { timestamps: true }
);

marketListingSchema.index({ createdAt: -1 });

export const MarketListing = mongoose.model('MarketListing', marketListingSchema);
export default MarketListing;
