const express = require('express');
const router = express.Router();
const {
  getTodayTodos,
  completeTodo,
  uncompleteTodo,
  getTodoHistory,
} = require('../controllers/todoController');
const { protect } = require('../middleware/auth');

router.use(protect); // All todo routes are protected

router.get('/today', getTodayTodos);
router.get('/history', getTodoHistory);
router.post('/:id/complete', completeTodo);
router.post('/:id/uncomplete', uncompleteTodo);

module.exports = router;
