const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  flag: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  phoneCode: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  language: {
    type: String,
    default: 'en'
  },
  metadata: {
    population: Number,
    region: String,
    subregion: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, {
  timestamps: true
});

// Indexes
countrySchema.index({ isActive: 1, priority: -1 });
countrySchema.index({ title: 1 });
countrySchema.index({ code: 1 });

// Static method to get active countries
countrySchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ priority: -1, title: 1 });
};

// Static method to get country by code
countrySchema.statics.getByCode = function(code) {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

module.exports = mongoose.model('Country', countrySchema);
