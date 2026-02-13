const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['LEAVE_REQUEST', 'LEAVE_STATUS_UPDATE'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    leaveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leave'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
