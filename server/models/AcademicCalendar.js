const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true
    },
    event_type: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
