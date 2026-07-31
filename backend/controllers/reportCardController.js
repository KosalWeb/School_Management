import mongoose from 'mongoose';
import Student from '../models/StudentModel.js';
import StudentScore from '../models/StudentScoreModel.js';
import StudentAttendance from '../models/StudentAttendanceModel.js';

export const getReportCard = async (req, res) => {
    try {
        const { studentId, examType } = req.query;
        if (!studentId) return res.status(400).json({ message: 'studentId is required' });

        const student = await Student.findById(studentId)
            .populate('class', 'className gradeLevel')
            .lean();
        if (!student) return res.status(404).json({ message: 'Student not found' });

        const scoreFilter = { student: new mongoose.Types.ObjectId(studentId) };
        if (examType) scoreFilter.examType = examType;

        const scores = await StudentScore.find(scoreFilter)
            .populate('subject', 'subjectName subjectCode')
            .sort({ 'subject.subjectCode': 1 })
            .lean();

        const attendance = await StudentAttendance.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
                    leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
                },
            },
        ]);

        const subjectsByExam = {};
        const uniqueExamTypes = [...new Set(scores.map(s => s.examType))];
        uniqueExamTypes.forEach(et => {
            subjectsByExam[et] = scores.filter(s => s.examType === et).map(s => ({
                subject: s.subject?.subjectName || 'N/A',
                code: s.subject?.subjectCode || '',
                score: s.score,
            }));
        });

        const allScores = scores.map(s => s.score);
        const totalScore = allScores.reduce((a, b) => a + b, 0);
        const average = allScores.length > 0 ? Math.round((totalScore / allScores.length) * 100) / 100 : 0;

        const rankResult = await StudentScore.aggregate([
            { $match: scoreFilter },
            {
                $group: {
                    _id: '$student',
                    avgScore: { $avg: '$score' },
                },
            },
            { $sort: { avgScore: -1 } },
        ]);

        const rank = rankResult.findIndex(r => r._id.toString() === studentId) + 1;

        res.json({
            student: {
                name: student.fullNameKh,
                nameEn: student.fullNameEn,
                studentId: student.studentId,
                gender: student.gender,
                class: student.class?.className || 'N/A',
                gradeLevel: student.class?.gradeLevel || 'N/A',
            },
            scores: subjectsByExam,
            allScores: scores,
            average,
            rank: rank > 0 ? rank : null,
            totalStudents: rankResult.length,
            attendance: attendance[0] || { total: 0, present: 0, absent: 0, late: 0, leave: 0 },
            examTypes: uniqueExamTypes,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
