const mongoose = require('mongoose');

const deptMentorSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        unique: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeptMentor', deptMentorSchema);
