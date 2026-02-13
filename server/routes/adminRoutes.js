const express = require('express');
const router = express.Router();
const {
    getStats,
    getUsers,
    toggleBlockUser,
    deleteUser,
    getAnalytics
} = require('../controllers/adminController');

// All routes are prefixed with /api/admin
router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/analytics', getAnalytics);
router.patch('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
