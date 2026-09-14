const RevisionTodo = require('../models/RevisionTodo');
const User = require('../models/User');

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @route   GET /api/todos/today
// @desc    Get all pending revision todos due today or overdue
exports.getTodayTodos = async (req, res) => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Pending revisions due today or overdue
    const pendingTodos = await RevisionTodo.find({
      userId: req.user._id,
      scheduledDate: { $lte: endOfToday },
      status: 'pending',
    }).sort({ scheduledDate: 1, subject: 1 });

    // Completed today
    const completedToday = await RevisionTodo.find({
      userId: req.user._id,
      status: 'done',
      completedAt: { $gte: startOfToday, $lte: endOfToday },
    }).sort({ completedAt: -1 });

    // Format pending with overdue flag
    const formattedPending = pendingTodos.map((todo) => {
      const isOverdue = new Date(todo.scheduledDate) < startOfToday;
      const daysOverdue = isOverdue
        ? Math.floor((startOfToday - new Date(todo.scheduledDate)) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...todo.toObject(),
        isOverdue,
        daysOverdue,
      };
    });

    return res.status(200).json({
      success: true,
      pendingCount: formattedPending.length,
      completedTodayCount: completedToday.length,
      streakCount: req.user.streakCount,
      todos: formattedPending,
      completedToday,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch today todos',
    });
  }
};

// @route   POST /api/todos/:id/complete
// @desc    Mark a revision todo as done and update study streak
exports.completeTodo = async (req, res) => {
  try {
    const todo = await RevisionTodo.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Revision todo not found' });
    }

    todo.status = 'done';
    todo.completedAt = new Date();
    await todo.save();

    // Check and update streak
    const user = await User.findById(req.user._id);
    const todayStr = getTodayDateStr();

    if (user.lastCompletedDate !== todayStr) {
      // Check if yesterday was completed for continuous streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (user.lastCompletedDate === yesterdayStr) {
        user.streakCount += 1;
      } else if (!user.lastCompletedDate) {
        user.streakCount = 1;
      } else {
        // missed one or more days, start fresh streak
        user.streakCount = 1;
      }
      user.lastCompletedDate = todayStr;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Revision marked as completed! Keep up the momentum!',
      todo,
      streakCount: user.streakCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete todo',
    });
  }
};

// @route   POST /api/todos/:id/uncomplete
// @desc    Undo completion if marked accidentally
exports.uncompleteTodo = async (req, res) => {
  try {
    const todo = await RevisionTodo.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ success: false, message: 'Revision todo not found' });
    }

    todo.status = 'pending';
    todo.completedAt = null;
    await todo.save();

    return res.status(200).json({
      success: true,
      message: 'Revision marked back as pending',
      todo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update todo',
    });
  }
};

// @route   GET /api/todos/history
// @desc    Get all todos with filters and analytics (retention, on-time rates)
exports.getTodoHistory = async (req, res) => {
  try {
    const { status, subject, search, startDate, endDate, datePreset } = req.query;
    const query = { userId: req.user._id };

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (status && status !== 'all') {
      if (status === 'overdue') {
        query.status = 'pending';
        query.scheduledDate = { $lt: startOfToday };
      } else {
        query.status = status;
      }
    }

    if (subject && subject !== 'all') {
      query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filtering
    const isValidDateStr = (d) => d && d !== 'undefined' && d !== 'null' && !isNaN(new Date(d).getTime());

    if (isValidDateStr(startDate) || isValidDateStr(endDate)) {
      if (!query.scheduledDate) query.scheduledDate = {};
      if (isValidDateStr(startDate)) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.scheduledDate.$gte = start;
      }
      if (isValidDateStr(endDate)) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.scheduledDate.$lte = end;
      }
    } else if (datePreset && datePreset !== 'all') {
      const today = new Date();
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      if (datePreset === 'today') {
        query.scheduledDate = { $gte: startOfToday, $lte: endOfToday };
      } else if (datePreset === 'yesterday') {
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(endOfToday);
        endOfYesterday.setDate(endOfYesterday.getDate() - 1);
        query.scheduledDate = { $gte: startOfYesterday, $lte: endOfYesterday };
      } else if (datePreset === 'this_week') {
        const firstDayOfWeek = new Date(startOfToday);
        const dayOfWeek = firstDayOfWeek.getDay() || 7;
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - (dayOfWeek - 1));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        lastDayOfWeek.setHours(23, 59, 59, 999);
        query.scheduledDate = { $gte: firstDayOfWeek, $lte: lastDayOfWeek };
      } else if (datePreset === 'this_month') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        query.scheduledDate = { $gte: firstDayOfMonth, $lte: lastDayOfMonth };
      }
    }

    const allUserTodos = await RevisionTodo.find({ userId: req.user._id });
    const rawFilteredTodos = await RevisionTodo.find(query).sort({ scheduledDate: -1 });

    const filteredTodos = rawFilteredTodos.map((t) => {
      const isOverdue = t.status === 'pending' && new Date(t.scheduledDate) < startOfToday;
      const daysOverdue = isOverdue
        ? Math.floor((startOfToday - new Date(t.scheduledDate)) / (1000 * 60 * 60 * 24))
        : 0;
      return {
        ...t.toObject(),
        isOverdue,
        daysOverdue,
      };
    });

    // Subject breakdown analytics
    const subjectStatsMap = {};
    let totalDone = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    const now = new Date();

    allUserTodos.forEach((t) => {
      const subj = t.subject || 'General';
      if (!subjectStatsMap[subj]) {
        subjectStatsMap[subj] = { total: 0, completed: 0, pending: 0, overdue: 0 };
      }
      subjectStatsMap[subj].total += 1;

      if (t.status === 'done') {
        totalDone += 1;
        subjectStatsMap[subj].completed += 1;
      } else {
        totalPending += 1;
        subjectStatsMap[subj].pending += 1;
        if (new Date(t.scheduledDate) < now) {
          totalOverdue += 1;
          subjectStatsMap[subj].overdue += 1;
        }
      }
    });

    const subjectBreakdown = Object.keys(subjectStatsMap).map((subj) => {
      const stats = subjectStatsMap[subj];
      const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        subject: subj,
        total: stats.total,
        completed: stats.completed,
        pending: stats.pending,
        overdue: stats.overdue,
        retentionRate: rate,
      };
    });

    const overallRetention = allUserTodos.length > 0
      ? Math.round((totalDone / allUserTodos.length) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalScheduled: allUserTodos.length,
        totalCompleted: totalDone,
        totalPending,
        totalOverdue,
        retentionScore: overallRetention,
      },
      subjectBreakdown,
      todos: filteredTodos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch todo history',
    });
  }
};
