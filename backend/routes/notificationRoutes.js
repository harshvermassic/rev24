const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  triggerManualCheck,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect); // All notification routes are protected

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/trigger-check', triggerManualCheck);

module.exports = router;
