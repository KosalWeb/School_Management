import asyncHandler from 'express-async-handler';
import School from '../models/SchoolModel.js';
import Teacher from '../models/TeacherModel.js';
import Class from '../models/ClassModel.js';
import Student from '../models/StudentModel.js';

/**
 * @desc    Get dashboard statistics based on user role
 * @route   GET /api/dashboard
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const { user } = req;
    let stats = {};

    if (user.role === 'superadmin') {
        const [schoolCount, teacherCount, classCount, studentCount] = await Promise.all([
            School.countDocuments(),
            Teacher.countDocuments(),
            Class.countDocuments(),
            Student.countDocuments()
        ]);
        stats = { schoolCount, teacherCount, classCount, studentCount };

    } else if (user.role === 'school-admin') {
        const classesInSchool = await Class.find({ school: user.school }).select('_id');
        const classIds = classesInSchool.map(c => c._id);

        const [teacherCount, classCount, studentCount] = await Promise.all([
            Teacher.countDocuments({ organization: user.school }),
            Class.countDocuments({ school: user.school }),
            Student.countDocuments({ class: { $in: classIds } })
        ]);
        stats = { teacherCount, classCount, studentCount };

    } else if (user.role === 'teacher') {
        const classCount = user.classes?.length || 0;
        const studentCount = await Student.countDocuments({ class: { $in: user.classes || [] } });
        stats = { classCount, studentCount };
    }

    res.json(stats);
});