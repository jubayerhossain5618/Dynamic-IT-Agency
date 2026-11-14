const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: [true, 'Service request reference is required'],
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin creator reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Proposed quotation amount is required'],
      min: [1, 'Quotation amount must be greater than zero'],
    },
    currency: {
      type: String,
      default: 'BDT',
      trim: true,
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Estimated delivery days are required'],
      min: [1, 'Estimated delivery days must be at least 1 day'],
    },
    scope: {
      type: String,
      required: [true, 'Project scope is required'],
      trim: true,
    },
    terms: {
      type: String,
      trim: true,
      default: '50% advance payment upon quotation acceptance, remaining 50% upon final project delivery and sign-off.',
    },
    validUntil: {
      type: Date,
      required: [true, 'Quotation expiry date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    customerNote: {
      type: String,
      trim: true,
      default: '',
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

quotationSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Quotation', quotationSchema);
