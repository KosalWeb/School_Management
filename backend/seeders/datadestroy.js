import mongoose from 'mongoose';
import dotenv from 'dotenv';
import School from '../models/SchoolModel.js';
import Class from '../models/ClassModel.js';
import Subject from '../models/SubjectModel.js';
import Teacher from '../models/TeacherModel.js';
import Student from '../models/StudentModel.js';
import Attendance from '../models/AttendanceModel.js';
import StudentAttendance from '../models/StudentAttendanceModel.js';
import ListItem from '../models/ListItemModel.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const destroyData = async () => {
    try {
        await Promise.all([
            School.deleteMany(),
            Class.deleteMany(),
            Subject.deleteMany(),
            Teacher.deleteMany(),
            Student.deleteMany(),
            Attendance.deleteMany(),
            StudentAttendance.deleteMany(),
            ListItem.deleteMany(),
        ]);

        console.log('✅ All data destroyed successfully. User accounts preserved.');
        process.exit();
    } catch (error) {
        console.error('Destroy Error:', error);
        process.exit(1);
    }
};

destroyData();
