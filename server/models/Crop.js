import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    scientificName: { type: String },
    season: { type: String },
    durationDays: { type: String },
    msp: { type: String },
    targetYield: { type: String },
    idealPh: { type: String },
    sowingMonth: { type: String },
    harvestMonth: { type: String },
    waterRequirement: { type: String },
    varieties: [{ type: String }],
  },
  { timestamps: true }
);

export const Crop = mongoose.model('Crop', cropSchema);
export default Crop;
