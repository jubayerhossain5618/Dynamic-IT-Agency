const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    storageType: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local',
    },
  },
  { _id: false }
);

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [160, 'Project title cannot exceed 160 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
      default: '',
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
    preferredDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'under_review',
        'quoted',
        'accepted',
        'rejected',
        'project_created',
      ],
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

serviceRequestSchema.index({ customer: 1, createdAt: -1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
