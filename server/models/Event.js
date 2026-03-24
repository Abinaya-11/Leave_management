const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true,
        trim: true
    },
    event_type: {
        type: String,
        required: true
    },
    od_type: {
        type: String,
        required: false
    },
    event_details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    organizing_cell: {
        type: String,
        enum: ['Placement Cell', 'IECC', 'Clubs'],
        required: true
    },
    event_organizer: {
        type: String,
        required: true
    },
    event_location: {
        type: String,
        required: true
    },
    event_start_date: {
        type: Date,
        required: true
    },
    event_end_date: {
        type: Date,
        required: true
    },
    event_description: {
        type: String,
        default: ''
    },
    max_participants: {
        type: Number,
        default: null
    },
    event_proof_required: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
