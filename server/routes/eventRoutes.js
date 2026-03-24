const express = require('express');
const router = express.Router();
const { createEvent, getEvents, updateEvent, cancelEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getEvents);

router.use(protect);

router.post('/', authorize('admin', 'placement_cell', 'clubs_coordinator', 'iecc'), createEvent);
router.put('/:id', authorize('admin', 'placement_cell', 'clubs_coordinator', 'iecc'), updateEvent);
router.patch('/:id/cancel', authorize('admin', 'placement_cell', 'clubs_coordinator', 'iecc'), cancelEvent);

module.exports = router;
