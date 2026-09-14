const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '🎓',
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: String, // format YYYY-MM-DD to easily track daily streak
      default: null,
    },
    themePreference: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    notificationSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '08:00',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
