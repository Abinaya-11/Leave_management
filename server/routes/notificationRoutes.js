const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// @desc    Get notifications for a user
// @route   GET /api/notifications/:userId
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'name role'); // Optional: populate sender details
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read for a user
// @route   PUT /api/notifications/mark-all-read/:userId
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.params.userId, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

router.get('/:userId', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read/:userId', markAllAsRead);

module.exports = router;
