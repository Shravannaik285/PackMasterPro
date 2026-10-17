const mongoose = require('mongoose');

/**
 * PackagingPlan Schema:
 * Stores user packaging plans, dimensions, AI recommendations, quotations, and tracking status.
 *
 * Requirements:
 * - userId (used for strict user isolation)
 * - product details (name, category, dimensions, quantity)
 * - packaging requirements (protection level, cost preference, eco-friendly, custom print)
 * - AI recommendation (recommended type, reasoning, score)
 * - selected packaging (type, material grade)
 * - estimated quotation (unit price, total price, breakdown)
 * - status (Draft, Processing, Completed)
 * - timestamps (createdAt, updatedAt)
 */
const packagingPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    // Product Details
    productDetails: {
      name: { type: String, required: true, trim: true },
      category: { type: String, default: 'General' },
      dimensions: {
        length: { type: Number, required: true }, // cm
        width: { type: Number, required: true },  // cm
        height: { type: Number, required: true }, // cm
      },
      quantity: { type: Number, required: true, min: 1 },
    },
    // Top-level aliases for direct frontend compatibility
    productName: { type: String, trim: true },
    category: { type: String, default: 'General' },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    quantity: { type: Number },

    // Selected Packaging
    selectedPackaging: {
      packagingType: {
        type: String,
        required: true,
        enum: ['Corrugated Box', 'Mailing Box', 'Paper Bag', 'Plastic Packaging', 'Labels'],
        default: 'Corrugated Box',
      },
      materialGrade: {
        type: String,
        default: '5-Ply Corrugated Cardboard',
      },
    },
    packagingType: { type: String, default: 'Corrugated Box' },
    materialGrade: { type: String, default: '5-Ply Corrugated Cardboard' },

    // Packaging Requirements
    packagingRequirements: {
      protectionLevel: {
        type: String,
        enum: ['Standard', 'Medium', 'High'],
        default: 'Medium',
      },
      costPreference: {
        type: String,
        enum: ['Economy', 'Balanced', 'Premium'],
        default: 'Balanced',
      },
      ecoFriendly: { type: Boolean, default: false },
      customPrint: { type: Boolean, default: false },
    },
    requirements: {
      protectionLevel: { type: String, default: 'Medium' },
      costPreference: { type: String, default: 'Balanced' },
      ecoFriendly: { type: Boolean, default: false },
      customPrint: { type: Boolean, default: false },
    },

    // AI Recommendation
    aiRecommendation: {
      recommendedType: { type: String },
      materialGrade: { type: String },
      reasoning: [{ type: String }],
      suitabilityScore: { type: Number, default: 95 },
      summary: { type: String },
    },

    // Estimated Quotation
    estimatedQuotation: {
      unitPrice: { type: Number, required: true },  // in INR (₹)
      totalPrice: { type: Number, required: true }, // in INR (₹)
      breakdown: { type: mongoose.Schema.Types.Mixed },
    },
    pricing: {
      unitPrice: { type: Number },
      totalPrice: { type: Number },
    },

    // Lifecycle / Order Status
    status: {
      type: String,
      enum: ['Draft', 'Processing', 'Completed'],
      default: 'Processing',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure top-level aliases and structured subdocuments remain in sync
packagingPlanSchema.pre('save', function (next) {
  // Sync product details
  if (this.productName && (!this.productDetails || !this.productDetails.name)) {
    this.productDetails = {
      name: this.productName,
      category: this.category || 'General',
      dimensions: this.dimensions || { length: 20, width: 15, height: 8 },
      quantity: this.quantity || 500,
    };
  } else if (this.productDetails && this.productDetails.name) {
    this.productName = this.productDetails.name;
    this.category = this.productDetails.category || this.category;
    this.dimensions = this.productDetails.dimensions || this.dimensions;
    this.quantity = this.productDetails.quantity || this.quantity;
  }

  // Sync selected packaging
  if (this.packagingType && (!this.selectedPackaging || !this.selectedPackaging.packagingType)) {
    this.selectedPackaging = {
      packagingType: this.packagingType,
      materialGrade: this.materialGrade || '5-Ply Corrugated Cardboard',
    };
  } else if (this.selectedPackaging && this.selectedPackaging.packagingType) {
    this.packagingType = this.selectedPackaging.packagingType;
    this.materialGrade = this.selectedPackaging.materialGrade || this.materialGrade;
  }

  // Sync requirements
  if (this.requirements && (!this.packagingRequirements || !this.packagingRequirements.protectionLevel)) {
    this.packagingRequirements = { ...this.requirements };
  } else if (this.packagingRequirements) {
    this.requirements = { ...this.packagingRequirements };
  }

  // Sync pricing / estimated quotation
  if (this.pricing && (!this.estimatedQuotation || !this.estimatedQuotation.unitPrice)) {
    this.estimatedQuotation = {
      unitPrice: this.pricing.unitPrice,
      totalPrice: this.pricing.totalPrice,
      breakdown: this.pricing.breakdown || {},
    };
  } else if (this.estimatedQuotation) {
    this.pricing = {
      unitPrice: this.estimatedQuotation.unitPrice,
      totalPrice: this.estimatedQuotation.totalPrice,
    };
  }

  next();
});

const PackagingPlan = mongoose.models.PackagingPlan || mongoose.model('PackagingPlan', packagingPlanSchema);

module.exports = PackagingPlan;
