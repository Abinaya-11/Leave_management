const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Update users with legacy studentType field
        const legacyStudents = await User.find({ role: 'student', studentType: { $exists: true } });
        console.log(`Found ${legacyStudents.length} legacy students with studentType`);

        for (const s of legacyStudents) {
            let type = 'Dayscholar';
            if (s.studentType.toUpperCase() === 'HOSTELLER') type = 'Hosteller';
            s.student_type = type;
            await s.save();
        }

        // 2. Update users with NO student type field at all
        const unknownStudents = await User.find({ role: 'student', student_type: { $exists: false }, studentType: { $exists: false } });
        console.log(`Found ${unknownStudents.length} unknown students with no type`);

        for (const s of unknownStudents) {
            s.student_type = 'Dayscholar'; // Default for existing records
            await s.save();
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
