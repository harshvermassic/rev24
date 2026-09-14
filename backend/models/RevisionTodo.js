const mongoose = require('mongoose');

const revisionTodoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    learningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningEntry',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    intervalDay: {
      type: Number,
      required: true, // 1, 3, 7, 14, 30
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'done', 'missed'],
      default: 'pending',
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying due items per user quickly
revisionTodoSchema.index({ userId: 1, scheduledDate: 1, status: 1 });

module.exports = mongoose.model('RevisionTodo', revisionTodoSchema);
