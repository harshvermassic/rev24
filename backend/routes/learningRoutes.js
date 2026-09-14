const express = require('express');
const router = express.Router();
const {
  createLearningEntry,
  getLearningHistory,
  getLearningEntryById,
  deleteLearningEntry,
} = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.use(protect); // All learning routes are protected

router.route('/')
  .post(createLearningEntry)
  .get(getLearningHistory);

router.route('/:id')
  .get(getLearningEntryById)
  .delete(deleteLearningEntry);

module.exports = router;
