const Event = require('../models/Event');
const Leave = require('../models/Leave');

// @desc    Create new event
// @route   POST /api/events
// @access  Domain Authority (Placement, IECC, Clubs)
exports.createEvent = async (req, res) => {
    try {
        const { role } = req.user;
        let organizing_cell = '';

        if (role === 'placement_cell') organizing_cell = 'Placement Cell';
        else if (role === 'iecc') organizing_cell = 'IECC';
        else if (role === 'clubs_coordinator') organizing_cell = 'Clubs';
        else {
            return res.status(403).json({ success: false, message: 'Not authorized to create events' });
        }

        const event = new Event({
            ...req.body,
            organizing_cell,
            created_by: req.user.id
        });

        await event.save();
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all events (filtered by cell if requested, or status)
// @route   GET /api/events
exports.getEvents = async (req, res) => {
    try {
        const { cell, status, activeOnly, od_type } = req.query;
        let query = {};

        if (cell) query.organizing_cell = cell;
        if (status) query.status = status;
        if (activeOnly === 'true') query.status = 'Active';
        if (od_type) query.od_type = od_type;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update past events to Inactive
        await Event.updateMany(
            { event_end_date: { $lt: today }, status: 'Active' },
            { $set: { status: 'Inactive' } }
        );

        const events = await Event.find(query).sort({ event_start_date: 1 });
        
        // Add participant count for each event
        const eventsWithCounts = await Promise.all(events.map(async (event) => {
            const count = await Leave.countDocuments({ event_id: event._id, status: { $ne: 'Rejected' } });
            return {
                ...event._doc,
                participants_count: count
            };
        }));

        let returningEvents = eventsWithCounts;
        if (activeOnly === 'true') {
            returningEvents = eventsWithCounts.filter(event => {
                if (event.max_participants && event.participants_count >= event.max_participants) {
                    return false;
                }
                return true;
            });
        }

        res.json({ success: true, data: returningEvents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check ownership/role
        if (event.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Cancel event
// @route   PATCH /api/events/:id/cancel
exports.cancelEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        if (event.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        event.status = 'Cancelled';
        await event.save();
        res.json({ success: true, message: 'Event cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
