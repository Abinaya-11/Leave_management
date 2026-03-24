const Settings = require('../models/Settings');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update system settings
// @route   POST /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
    const { maxLeavePerSemester, totalWorkingDays } = req.body;

    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings.maxLeavePerSemester = maxLeavePerSemester || settings.maxLeavePerSemester;
            settings.totalWorkingDays = totalWorkingDays || settings.totalWorkingDays;
            await settings.save();
        } else {
            settings = await Settings.create({ maxLeavePerSemester, totalWorkingDays });
        }
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
