const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total project cost is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      required: [true, 'Paid amount is required'],
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      required: [true, 'Remaining balance is required'],
      min: [0, 'Remaining balance cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Nagad', 'Bank Transfer', 'Cash', 'Card / Other'],
      default: 'Bank Transfer',
    },
    gateway: {
      type: String,
      enum: ['manual', 'bkash', 'nagad'],
      default: 'manual',
    },
    gatewayPaymentId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    gatewayStatus: {
      type: String,
      enum: ['none', 'initiated', 'verified', 'failed', 'cancelled'],
      default: 'none',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    transactionReference: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'failed', 'cancelled', 'refunded'],
      default: 'partial',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ customer: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
