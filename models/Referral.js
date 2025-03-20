const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  candidatePhone: {
    type: String
  },
  resumeUrl: {
    type: String
  },
  position: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'screening', 'interviewing', 'offered', 'hired', 'rejected'],
    default: 'submitted'
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated timestamp on modifications
ReferralSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

ReferralSchema.index({ candidateName: 'text', position: 'text', status: 'text' });

module.exports = mongoose.model('Referral', ReferralSchema);