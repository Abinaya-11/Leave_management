const mongoose = require('mongoose');

const hostelWardenSchema = new mongoose.Schema({
    hostel_name: {
        type: String,
        required: true
    },
    floor: {
        type: String,
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure unique combination of hostel and floor
hostelWardenSchema.index({ hostel_name: 1, floor: 1 }, { unique: true });

module.exports = mongoose.model('HostelWarden', hostelWardenSchema);
