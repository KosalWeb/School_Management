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
import Discipline from '../models/DisciplineModel.js';
import Event from '../models/EventModel.js';
import ExamSchedule from '../models/ExamScheduleModel.js';
import FeeType from '../models/FeeTypeModel.js';
import FeePayment from '../models/FeePaymentModel.js';
import Notification from '../models/NotificationModel.js';
import StudentScore from '../models/StudentScoreModel.js';
import TeacherEvaluation from '../models/TeacherEvaluationModel.js';
import Timetable from '../models/TimetableModel.js';
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
            Discipline.deleteMany(),
            Event.deleteMany(),
            ExamSchedule.deleteMany(),
            FeeType.deleteMany(),
            FeePayment.deleteMany(),
            Notification.deleteMany(),
            StudentScore.deleteMany(),
            TeacherEvaluation.deleteMany(),
            Timetable.deleteMany(),
        ]);

        console.log('✅ All data destroyed successfully. User accounts preserved.');
        process.exit();
    } catch (error) {
        console.error('Destroy Error:', error);
        process.exit(1);
    }
};

destroyData();
