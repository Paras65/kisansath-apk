import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  time: { type: String },
  dap: { type: String },
  mop: { type: String },
  urea: { type: String },
  zinc: { type: String },
  note: { type: String },
});

const fertilizerDoseSchema = new mongoose.Schema(
  {
    cropId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    ureaTotal: { type: Number, required: true },
    dapTotal: { type: Number, required: true },
    mopTotal: { type: Number, required: true },
    zincSulfate: { type: Number, required: true },
    schedule: [scheduleItemSchema],
  },
  { timestamps: true }
);

export const FertilizerDose = mongoose.model('FertilizerDose', fertilizerDoseSchema);
export default FertilizerDose;
