const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const projectHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: '',
    },
    progress: {
      type: Number,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    quotation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: [true, 'Accepted quotation reference is required'],
      unique: true,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: [true, 'Service request reference is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total project amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Project start date is required'],
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
      required: [true, 'Expected delivery date is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be less than 0%'],
      max: [100, 'Progress cannot exceed 100%'],
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'not_started',
      index: true,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    history: {
      type: [projectHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);
