const LearningEntry = require('../models/LearningEntry');
const RevisionTodo = require('../models/RevisionTodo');

// Helper to add days to a date string/object normalized to midday to prevent timezone boundary issues
const addDays = (dateInput, days) => {
  let d;
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      d = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0));
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }
  d.setDate(d.getDate() + days);
  return d;
};

// @route   POST /api/learning
// @desc    Add a learning entry and auto-generate 5 forgetting-curve revision todos
exports.createLearningEntry = async (req, res) => {
  try {
    const { subject, topic, learnedDate, notes, intervals } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and topic',
      });
    }

    const entryDate = learnedDate ? new Date(learnedDate) : new Date();
    const intervalDays = intervals && Array.isArray(intervals) && intervals.length > 0
      ? intervals
      : [1, 3, 7, 14, 30];

    // 1. Create the learning entry
    const learningEntry = await LearningEntry.create({
      userId: req.user._id,
      subject: subject.trim(),
      topic: topic.trim(),
      learnedDate: entryDate,
      notes: notes ? notes.trim() : '',
      intervals: intervalDays,
    });

    // 2. Batch generate 5 RevisionTodo items in one shot
    const todosToCreate = intervalDays.map((interval) => {
      const scheduled = addDays(entryDate, interval);
      return {
        userId: req.user._id,
        learningId: learningEntry._id,
        subject: learningEntry.subject,
        topic: learningEntry.topic,
        intervalDay: interval,
        scheduledDate: scheduled,
        status: 'pending',
        notes: learningEntry.notes,
      };
    });

    const createdTodos = await RevisionTodo.insertMany(todosToCreate);

    return res.status(201).json({
      success: true,
      message: 'Learning entry created and revision todos scheduled successfully',
      learningEntry,
      scheduledTodos: createdTodos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create learning entry',
    });
  }
};

// @route   GET /api/learning
// @desc    Get date-wise learning history with subject & topic filter
exports.getLearningHistory = async (req, res) => {
  try {
    const { search, subject, startDate, endDate } = req.query;
    const query = { userId: req.user._id };

    if (subject && subject !== 'all') {
      query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.learnedDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.learnedDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.learnedDate.$lte = end;
      }
    }

    const entries = await LearningEntry.find(query).sort({ learnedDate: -1, createdAt: -1 });

    // Attach revision summary progress for each entry
    const entriesWithProgress = await Promise.all(
      entries.map(async (entry) => {
        const todos = await RevisionTodo.find({ learningId: entry._id }).select('intervalDay scheduledDate status completedAt');
        const completedCount = todos.filter((t) => t.status === 'done').length;
        return {
          ...entry.toObject(),
          totalRevisions: todos.length,
          completedRevisions: completedCount,
          todos,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: entriesWithProgress.length,
      entries: entriesWithProgress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch learning history',
    });
  }
};

// @route   GET /api/learning/:id
exports.getLearningEntryById = async (req, res) => {
  try {
    const entry = await LearningEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Learning entry not found' });
    }

    const todos = await RevisionTodo.find({ learningId: entry._id }).sort({ intervalDay: 1 });

    return res.status(200).json({
      success: true,
      entry,
      todos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch learning entry',
    });
  }
};

// @route   DELETE /api/learning/:id
exports.deleteLearningEntry = async (req, res) => {
  try {
    const entry = await LearningEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Learning entry not found' });
    }

    // Cascade delete todos associated with this entry
    await RevisionTodo.deleteMany({ learningId: entry._id });

    return res.status(200).json({
      success: true,
      message: 'Learning entry and scheduled revisions deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete learning entry',
    });
  }
};
