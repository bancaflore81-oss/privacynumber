const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
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
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    index: true
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  bulkDiscounts: [{
    minQuantity: { type: Number, required: true },
    maxQuantity: { type: Number, required: true },
    discountPercent: { type: Number, required: true }
  }],
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Compound indexes
priceSchema.index({ countryId: 1, applicationId: 1 }, { unique: true });
priceSchema.index({ countryId: 1, isActive: 1 });
priceSchema.index({ applicationId: 1, isActive: 1 });
priceSchema.index({ cost: 1 });
priceSchema.index({ currency: 1, isActive: 1 });

// Static method to get prices for country
priceSchema.statics.getByCountry = function(countryId) {
  return this.find({ countryId, isActive: true }).populate('applicationId', 'name code icon');
};

// Static method to get prices for application
priceSchema.statics.getByApplication = function(applicationId) {
  return this.find({ applicationId, isActive: 1 }).populate('countryId', 'title code flag');
};

// Static method to get price for specific country and application
priceSchema.statics.getPrice = function(countryId, applicationId) {
  return this.findOne({ countryId, applicationId, isActive: true });
};

// Static method to update price
priceSchema.statics.updatePrice = function(countryId, applicationId, cost, updatedBy) {
  return this.findOneAndUpdate(
    { countryId, applicationId },
    { 
      cost, 
      'metadata.lastUpdated': new Date(),
      'metadata.updatedBy': updatedBy
    },
    { upsert: true, new: true }
  );
};

// Instance method to calculate final price with discount
priceSchema.methods.getFinalPrice = function(quantity = 1) {
  let finalPrice = this.cost;
  
  // Apply bulk discount if applicable
  if (this.bulkDiscounts && this.bulkDiscounts.length > 0) {
    const applicableDiscount = this.bulkDiscounts.find(discount => 
      quantity >= discount.minQuantity && quantity <= discount.maxQuantity
    );
    
    if (applicableDiscount) {
      finalPrice = finalPrice * (1 - applicableDiscount.discountPercent / 100);
    }
  }
  
  // Apply general discount
  if (this.discount > 0) {
    finalPrice = finalPrice * (1 - this.discount / 100);
  }
  
  return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Price', priceSchema);
