const Notification = require('../models/Notification');
const { triggerDailyCheck } = require('../services/notificationScheduler');

// @route   GET /api/notifications
// @desc    Get user notifications and unread count
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications',
    });
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      notification: notif,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update notification',
    });
  }
};

// @route   PUT /api/notifications/read-all
// @desc    Mark all user notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark all as read',
    });
  }
};

// @route   POST /api/notifications/trigger-check
// @desc    Trigger reminder evaluation immediately (for instant testing)
exports.triggerManualCheck = async (req, res) => {
  try {
    const result = await triggerDailyCheck();
    return res.status(200).json({
      success: true,
      message: 'Daily revision check triggered successfully',
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to trigger check',
    });
  }
};
