const mongoose = require('mongoose');

const numberRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  countryId: {
    type: Number,
    required: true,
    index: true
  },
  applicationId: {
    type: Number,
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['ready', 'close', 'reject', 'used', 'expired'],
    default: 'ready',
    index: true
  },
  smsCode: {
    type: String,
    default: null
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  },
  receivedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    country: String,
    application: String,
    service: String
  },
  smsHistory: [{
    message: String,
    receivedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
numberRequestSchema.index({ userId: 1, createdAt: -1 });
numberRequestSchema.index({ countryId: 1, applicationId: 1 });
numberRequestSchema.index({ status: 1, createdAt: -1 });
numberRequestSchema.index({ phoneNumber: 1, status: 1 });

// Pre-save middleware to generate request ID
numberRequestSchema.pre('save', function(next) {
  if (!this.requestId && this.isNew) {
    this.requestId = require('crypto').randomBytes(16).toString('hex');
  }
  next();
});

// Instance method to check if request is expired
numberRequestSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Instance method to mark as completed
numberRequestSchema.methods.markCompleted = function() {
  this.status = 'used';
  this.completedAt = new Date();
  return this.save();
};

// Instance method to add SMS to history
numberRequestSchema.methods.addSMS = function(message) {
  this.smsHistory.push({
    message,
    receivedAt: new Date()
  });
  this.receivedAt = new Date();
  return this.save();
};

// Static method to get active requests for user
numberRequestSchema.statics.getActiveRequests = function(userId) {
  return this.find({
    userId,
    status: { $in: ['ready', 'close'] },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Static method to cleanup expired requests
numberRequestSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: { $in: ['ready', 'close'] },
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

module.exports = mongoose.model('NumberRequest', numberRequestSchema);
