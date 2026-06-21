import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import StudentScore from '../models/StudentScoreModel.js';
import Student from '../models/StudentModel.js';
import Class from '../models/ClassModel.js';

// GET /api/student-scores
export const getStudentScores = asyncHandler(async (req, res) => {
    const { studentId, subjectId, classId, schoolId, examType } = req.query;
    const { user } = req;

    const filter = {};

    if (schoolId) filter.school = new mongoose.Types.ObjectId(schoolId);
    else if (user.role === 'school-admin') filter.school = user.school;

    if (classId) filter.class = new mongoose.Types.ObjectId(classId);
    if (subjectId) filter.subject = new mongoose.Types.ObjectId(subjectId);
    if (studentId) filter.student = new mongoose.Types.ObjectId(studentId);
    if (examType) filter.examType = examType;

    const scores = await StudentScore.find(filter)
        .populate('student', 'fullNameKh studentId')
        .populate('subject', 'subjectName subjectCode')
        .populate('class', 'className')
        .sort({ createdAt: -1 });

    res.json(scores);
});

// POST /api/student-scores/batch
export const batchSaveScores = asyncHandler(async (req, res) => {
    const { scores, classId, schoolId, subjectId, examType } = req.body;
    const { user } = req;

    if (!scores || !Array.isArray(scores) || scores.length === 0) {
        res.status(400);
        throw new Error('No scores provided');
    }

    const effectiveSchoolId = schoolId || (user.role === 'school-admin' ? user.school?.toString() : null);
    if (!effectiveSchoolId) {
        res.status(400);
        throw new Error('School is required');
    }

    const operations = scores.map((s) => ({
        updateOne: {
            filter: {
                student: new mongoose.Types.ObjectId(s.studentId),
                subject: new mongoose.Types.ObjectId(subjectId),
                examType: examType,
            },
            update: {
                $set: {
                    student: new mongoose.Types.ObjectId(s.studentId),
                    subject: new mongoose.Types.ObjectId(subjectId),
                    class: new mongoose.Types.ObjectId(classId),
                    school: new mongoose.Types.ObjectId(effectiveSchoolId),
                    score: s.score,
                    examType: examType,
                    markedBy: user._id,
                },
            },
            upsert: true,
        },
    }));

    await StudentScore.bulkWrite(operations);

    res.json({ message: 'រក្សាទុកពិន្ទុដោយជោគជ័យ' });
});

// GET /api/student-scores/honor
export const getHonorTable = asyncHandler(async (req, res) => {
    const { classId, schoolId, examType, top } = req.query;
    const { user } = req;

    const match = {};

    if (schoolId) match.school = new mongoose.Types.ObjectId(schoolId);
    else if (user.role === 'school-admin') match.school = user.school;

    if (classId) match.class = new mongoose.Types.ObjectId(classId);
    if (examType) match.examType = examType;

    const pipeline = [
        { $match: match },
        {
            $group: {
                _id: '$student',
                averageScore: { $avg: '$score' },
                totalSubjects: { $sum: 1 },
                scores: { $push: { subject: '$subject', score: '$score' } },
            },
        },
        { $sort: { averageScore: -1 } },
    ];

    if (top) {
        pipeline.push({ $limit: parseInt(top, 10) });
    }

    pipeline.push(
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                as: 'student',
            },
        },
        { $unwind: '$student' },
        { $sort: { averageScore: -1 } },
    );

    const results = await StudentScore.aggregate(pipeline);

    const ranked = results.map((r, i) => ({
        rank: i + 1,
        studentId: r.student._id,
        studentName: r.student.fullNameKh,
        studentCode: r.student.studentId,
        averageScore: Math.round(r.averageScore * 100) / 100,
        totalSubjects: r.totalSubjects,
    }));

    res.json(ranked);
});

// DELETE /api/student-scores/:id
export const deleteStudentScore = asyncHandler(async (req, res) => {
    const score = await StudentScore.findById(req.params.id);
    if (!score) {
        res.status(404);
        throw new Error('រកមិនឃើញពិន្ទុទេ');
    }
    await score.deleteOne();
    res.json({ message: 'បានលុបពិន្ទុដោយជោគជ័យ' });
});
