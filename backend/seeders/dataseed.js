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
        console.log(`   - ${result.createdAttendance} Teacher Attendance Records`);
        console.log(`   - ${result.createdStudentAttendance} Student Attendance Records`);
        console.log(`   - ${result.createdScores} Student Scores`);
        console.log(`   - ${result.createdFeeTypes} Fee Types`);
        console.log(`   - ${result.createdFeePayments} Fee Payments`);
        console.log(`   - ${result.createdTimetable} Timetable Entries`);
        console.log(`   - ${result.createdExamSchedules} Exam Schedules`);
        console.log(`   - ${result.createdEvents} Events`);
        console.log(`   - ${result.createdEvaluations} Teacher Evaluations`);
        console.log(`   - ${result.createdDiscipline} Discipline Records`);
        console.log(`   - ${result.createdNotifications} Notifications`);
        process.exit();
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
};

run();
