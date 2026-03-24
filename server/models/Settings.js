const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    maxLeavePerSemester: {
        type: Number,
        default: 15
    },
    totalWorkingDays: {
        type: Number,
        default: 90
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
