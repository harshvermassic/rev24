const mongoose = require('mongoose');

const learningEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    learnedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    intervals: {
      type: [Number],
      default: [1, 3, 7, 14, 30],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LearningEntry', learningEntrySchema);
