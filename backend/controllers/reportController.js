import asyncHandler from 'express-async-handler';
import School from '../models/SchoolModel.js';
import Class from '../models/ClassModel.js';
import Teacher from '../models/TeacherModel.js';
import Student from '../models/StudentModel.js';

/**
 * @desc    Get key statistics for a report
 * @route   GET /api/reports/stats
 * @access  Private/Admin
 */
export const getStats = asyncHandler(async (req, res) => {
    // Run all count queries in parallel for efficiency
    const [
        schoolCount,
        classCount,
        teacherCount,
        studentCount,
        maleStudentCount,
        femaleStudentCount
    ] = await Promise.all([
        School.countDocuments(),
        Class.countDocuments(),
        Teacher.countDocuments(),
        Student.countDocuments(),
        Student.countDocuments({ gender: 'ប្រុស' }),
        Student.countDocuments({ gender: 'ស្រី' })
    ]);

    // Send the stats back as a single JSON object
    res.json({
        schools: schoolCount,
        classes: classCount,
        teachers: teacherCount,
        students: {
            total: studentCount,
            male: maleStudentCount,
            female: femaleStudentCount
        }
    });
});