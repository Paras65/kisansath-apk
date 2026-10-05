import mongoose from 'mongoose';

const machineryRentalSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    rate: { type: String, required: true },
    operatorIncluded: { type: Boolean, default: true },
    contactName: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export const MachineryRental = mongoose.model('MachineryRental', machineryRentalSchema);
export default MachineryRental;
