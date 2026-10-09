import mongoose from 'mongoose';

const cropDiseaseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cropId: { type: String, required: true, index: true },
    cropName: { type: String, required: true },
    diseaseName: { type: String, required: true },
    pathogen: { type: String },
    symptomTag: { type: String },
    severity: { type: String, default: 'गंभीर' },
    pumpDose: { type: String },
    symptoms: { type: String, required: true },
    organicRemedy: { type: String, required: true },
    chemicalRemedy: { type: String, required: true },
    prevention: { type: String },
  },
  { timestamps: true }
);

export const CropDisease = mongoose.model('CropDisease', cropDiseaseSchema);
export default CropDisease;
