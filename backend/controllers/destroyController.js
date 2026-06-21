import School from '../models/SchoolModel.js';
import Class from '../models/ClassModel.js';
import Subject from '../models/SubjectModel.js';
import Teacher from '../models/TeacherModel.js';
import Student from '../models/StudentModel.js';
import Attendance from '../models/AttendanceModel.js';
import StudentAttendance from '../models/StudentAttendanceModel.js';
import ListItem from '../models/ListItemModel.js';

export const destroyAll = async (req, res) => {
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

        res.json({ message: 'All data destroyed successfully' });
    } catch (error) {
        console.error('Destroy all error:', error);
        res.status(500).json({ message: 'Server error while destroying data' });
    }
};
