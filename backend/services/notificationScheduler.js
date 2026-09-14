const cron = require('node-cron');
const RevisionTodo = require('../models/RevisionTodo');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Function to check and generate notifications for todos due today
const triggerDailyCheck = async () => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Find all users who have notifications enabled
    const users = await User.find({
      'notificationSettings.enabled': { $ne: false },
    });

    let generatedCount = 0;

    for (const user of users) {
      // Find pending todos due today or overdue
      const dueTodos = await RevisionTodo.find({
        userId: user._id,
        scheduledDate: { $lte: endOfToday },
        status: 'pending',
      });

      if (dueTodos.length > 0) {
        // Check if user already received a notification today to avoid spamming
        const existingTodayNotif = await Notification.findOne({
          userId: user._id,
          type: 'revision_due',
          createdAt: { $gte: startOfToday, $lte: endOfToday },
        });

        if (!existingTodayNotif) {
          const subjects = [...new Set(dueTodos.map((t) => t.subject))].join(', ');
          const title = `⏰ ${dueTodos.length} Study Revision${dueTodos.length > 1 ? 's' : ''} Due Today!`;
          const message = `Today's forgetting-curve revisions: ${subjects}. Review now to retain 90%+ of what you studied!`;

          await Notification.create({
            userId: user._id,
            title,
            message,
            type: 'revision_due',
            relatedTodoId: dueTodos[0]._id,
          });
          generatedCount++;
        }
      }
    }

    console.log(`[Cron/Notification] Daily revision check completed. Generated ${generatedCount} notifications.`);
    return { success: true, notificationsGenerated: generatedCount };
  } catch (error) {
    console.error('[Cron/Notification] Error running daily check:', error);
    return { success: false, error: error.message };
  }
};

// Initialize the node-cron scheduler (Runs every day at 8:00 AM)
const initScheduler = () => {
  // '0 8 * * *' = Every day at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running daily morning revision notification dispatcher...');
    await triggerDailyCheck();
  });
  console.log('[Cron] Study revision daily reminder scheduler initialized.');
};

module.exports = { initScheduler, triggerDailyCheck };
