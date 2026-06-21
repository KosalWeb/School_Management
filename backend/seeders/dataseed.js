import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import { seedData } from './seedFunction.js';

dotenv.config();
connectDB();

const run = async () => {
    try {
        const result = await seedData();
        console.log(`\n✅ Sample data seeded successfully!`);
        console.log(`   - ${result.superAdmin} Super Admin`);
        console.log(`   - ${result.schools} Schools (${result.studentsPerSchool.join('/')} classes each)`);
        console.log(`   - ${result.schoolUsers} Users`);
        console.log(`   - ${result.listItems} List Items`);
        console.log(`   - ${result.createdClasses} Classes`);
        console.log(`   - ${result.subjects} Subjects`);
        console.log(`   - ${result.teachers} Teachers`);
        console.log(`   - ${result.createdStudents} Students (100 per school)`);
        console.log(`   - ${result.createdAttendance} Attendance Records`);
        process.exit();
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

run();
