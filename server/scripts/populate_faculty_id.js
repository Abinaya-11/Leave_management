const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const populateFacultyIds = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const facultyMembers = await User.find({ role: 'faculty' }).sort({ createdAt: 1 });
        console.log(`Found ${facultyMembers.length} faculty members.`);

        for (let i = 0; i < facultyMembers.length; i++) {
            const faculty = facultyMembers[i];
            if (!faculty.faculty_id) {
                const faculty_id = `FAC${(i + 1).toString().padStart(3, '0')}`;
                faculty.faculty_id = faculty_id;
                await faculty.save();
                console.log(`Updated ${faculty.name} with ID ${faculty_id}`);
            } else {
                console.log(`${faculty.name} already has ID ${faculty.faculty_id}`);
            }
        }

        console.log('Population complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

populateFacultyIds();
