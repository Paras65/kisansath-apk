import mongoose from 'mongoose';

const PlotSchema = new mongoose.Schema({
  plotId: {
    type: String,
    required: true,
  },
  plotName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  cropId: {
    type: String,
    required: true,
    enum: ['paddy', 'wheat', 'chana', 'maize', 'soybean', 'tomato', 'custom'],
  },
  cropName: {
    type: String,
    required: true,
    trim: true,
  },
  areaAcres: {
    type: Number,
    required: true,
    min: 0.1,
    max: 500,
  },
  sowDate: {
    type: String,
    required: true, // YYYY-MM-DD format
  },
  season: {
    type: String,
    enum: ['खरीफ (Kharif)', 'रबी (Rabi)', 'जायद (Zaid)'],
    default: 'खरीफ (Kharif)',
  },
  status: {
    type: String,
    enum: ['active', 'planned', 'harvested'],
    default: 'active',
  },
  completedTasks: {
    type: [String],
    default: [],
  },
  actualYieldQuintals: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
});

const FarmerProfileSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    name: {
      type: String,
      default: 'किसान साथी',
      trim: true,
      maxlength: 100,
    },
    pin: {
      type: String,
      minlength: 4,
      maxlength: 6,
      default: '1234',
    },
    village: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'रायपुर',
    },
    totalLandAcres: {
      type: Number,
      default: 0,
      min: 0,
    },
    plots: {
      type: [PlotSchema],
      validate: [
        (val) => val.length <= 15,
        'एक किसान अधिकतम 15 प्लॉट्स ही जोड़ सकता है (Maximum 15 plots allowed)',
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound and single indexes for scalable multi-tenant querying
FarmerProfileSchema.index({ phone: 1, district: 1 });

const FarmerProfile = mongoose.model('FarmerProfile', FarmerProfileSchema);

export default FarmerProfile;
