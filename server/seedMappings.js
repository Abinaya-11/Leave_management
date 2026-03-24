const mongoose = require('mongoose');
const DeptMentor = require('./models/DeptMentor');
const HostelWarden = require('./models/HostelWarden');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Fetch some faculty members to assign as mentors/wardens
        const faculties = await User.find({ role: 'faculty' }).limit(5);

        if (faculties.length === 0) {
            console.log('No faculty members found. Please register some faculty first.');
            process.exit(1);
        }

        console.log(`Found ${faculties.length} faculty members.`);

        // Clear existing mappings
        await DeptMentor.deleteMany({});
        await HostelWarden.deleteMany({});
        console.log('Cleared existing mappings');

        // Create DeptMentor mappings
        const deptMappings = [
            { department: 'CSBS', faculty: faculties[0]._id },
            { department: 'CSE', faculty: faculties[1 % faculties.length]._id },
            { department: 'IT', faculty: faculties[2 % faculties.length]._id }
        ];

        await DeptMentor.insertMany(deptMappings);
        console.log('Seeded Department Mentors');

        // Create HostelWarden mappings
        const wardenMappings = [
            { hostel_name: 'Ganga', floor: 'Third Floor', faculty: faculties[0]._id },
            { hostel_name: 'Ganga', floor: 'Second Floor', faculty: faculties[1 % faculties.length]._id },
            { hostel_name: 'Yamuna', floor: 'First Floor', faculty: faculties[2 % faculties.length]._id }
        ];

        await HostelWarden.insertMany(wardenMappings);
        console.log('Seeded Hostel Wardens');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seed();
