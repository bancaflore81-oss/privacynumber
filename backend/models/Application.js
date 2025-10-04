const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  icon: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['social', 'messaging', 'marketplace', 'exchange', 'gaming', 'other'],
    default: 'other',
    index: true
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
  description: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#007bff'
  },
  metadata: {
    founded: Number,
    headquarters: String,
    parentCompany: String,
    userCount: Number
  }
}, {
  timestamps: true
});

// Indexes
applicationSchema.index({ isActive: 1, priority: -1 });
applicationSchema.index({ category: 1, isActive: 1 });
applicationSchema.index({ name: 1 });

// Static method to get active applications
applicationSchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ priority: -1, name: 1 });
};

// Static method to get applications by category
applicationSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ priority: -1, name: 1 });
};

// Static method to get popular applications
applicationSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true }).sort({ priority: -1 }).limit(limit);
};

module.exports = mongoose.model('Application', applicationSchema);
