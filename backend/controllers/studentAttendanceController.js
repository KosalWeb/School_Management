import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import StudentAttendance from '../models/StudentAttendanceModel.js';
import Student from '../models/StudentModel.js';
import Class from '../models/ClassModel.js';

const toUTCMidnight = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};

export const getStudentAttendance = asyncHandler(async (req, res) => {
    const { date, schoolId } = req.query;
    const { user } = req;

    if (!date) {
        res.status(400);
        throw new Error('Date is required');
    }

    const queryDate = toUTCMidnight(date);

    const schoolFilter = user.role === 'school-admin'
        ? user.school
        : schoolId || null;

    let students = [];
    if (schoolFilter) {
        const classes = await Class.find({ school: schoolFilter }).select('_id');
        const classIds = classes.map(c => c._id);
        students = await Student.find({ class: { $in: classIds } })
            .populate('class', 'className')
            .sort({ fullNameKh: 1 });
    } else {
        students = await Student.find({})
            .populate('class', 'className')
            .sort({ fullNameKh: 1 });
    }

    const attendanceRecords = await StudentAttendance.find({
        date: queryDate,
        ...(schoolFilter ? { school: schoolFilter } : {}),
    }).populate('student', 'fullNameKh studentId');

    const attendanceMap = {};
    attendanceRecords.forEach((rec) => {
        attendanceMap[rec.student._id.toString()] = rec;
    });

    const result = students.map((student) => ({
        student,
        attendance: attendanceMap[student._id.toString()] || null,
    }));

    res.json({
        date: queryDate,
        records: result,
        summary: {
            total: students.length,
            present: attendanceRecords.filter((r) => r.status === 'present').length,
            absent: attendanceRecords.filter((r) => r.status === 'absent').length,
            late: attendanceRecords.filter((r) => r.status === 'late').length,
            leave: attendanceRecords.filter((r) => r.status === 'leave').length,
        },
    });
});

export const saveStudentAttendance = asyncHandler(async (req, res) => {
    const { records } = req.body;
    const { user } = req;

    if (!records || !Array.isArray(records) || records.length === 0) {
        res.status(400);
        throw new Error('Records array is required');
    }

    const results = [];

    for (const record of records) {
        const { student: studentId, date, status, checkIn, checkOut, note } = record;

        if (!studentId || !date || !status) {
            continue;
        }

        const student = await Student.findById(studentId).populate('class', 'school');
        if (!student) {
            continue;
        }

        const queryDate = toUTCMidnight(date);

        const schoolId = student.class?.school || user.school;

        const existing = await StudentAttendance.findOne({
            student: studentId,
            date: queryDate,
        });

        if (existing) {
            existing.status = status;
            existing.checkIn = checkIn ?? existing.checkIn;
            existing.checkOut = checkOut ?? existing.checkOut;
            existing.note = note ?? existing.note;
            await existing.save();
            results.push(existing);
        } else {
            const newRecord = await StudentAttendance.create({
                student: studentId,
                school: schoolId,
                date: queryDate,
                status,
                checkIn: checkIn || '',
                checkOut: checkOut || '',
                note: note || '',
                markedBy: user._id,
            });
            results.push(newRecord);
        }
    }

    res.json({ message: 'Student attendance saved successfully', count: results.length });
});

export const getStudentAttendanceHistory = asyncHandler(async (req, res) => {
    const { studentId, from, to } = req.query;
    const { user } = req;

    const filter = {};

    if (user.role === 'school-admin') {
        filter.school = user.school;
    } else if (req.query.schoolId) {
        filter.school = req.query.schoolId;
    }

    if (studentId) {
        filter.student = studentId;
    }

    if (from && to) {
        filter.date = {
            $gte: toUTCMidnight(from),
            $lte: toUTCMidnight(to),
        };
    } else if (from) {
        filter.date = { $gte: toUTCMidnight(from) };
    } else if (to) {
        filter.date = { $lte: toUTCMidnight(to) };
    }

    const records = await StudentAttendance.find(filter)
        .populate('student', 'fullNameKh studentId fullNameEn')
        .populate('school', 'schoolName')
        .sort({ date: -1, 'student.fullNameKh': 1 });

    res.json(records);
});

export const getStudentAttendanceMatrix = asyncHandler(async (req, res) => {
    const { from, to, schoolId, classId } = req.query;
    const { user } = req;

    const schoolFilter = user.role === 'school-admin' ? user.school : schoolId || null;

    const studentQuery = {};
    if (classId) {
        studentQuery.class = classId;
    } else if (schoolFilter) {
        const classes = await Class.find({ school: schoolFilter }).select('_id').lean();
        const classIds = classes.map((c) => c._id);
        studentQuery.class = { $in: classIds };
    }

    const students = await Student.find(studentQuery)
        .populate('class', 'className')
        .sort({ fullNameKh: 1 })
        .lean();

    const recordFilter = {};
    if (schoolFilter) recordFilter.school = schoolFilter;
    if (from && to) {
        recordFilter.date = {
            $gte: toUTCMidnight(from),
            $lte: toUTCMidnight(to),
        };
    }
    if (classId) {
        const classStudents = await Student.find({ class: classId }).select('_id').lean();
        recordFilter.student = { $in: classStudents.map((s) => s._id) };
    }

    const records = await StudentAttendance.find(recordFilter).sort({ date: 1 }).lean();

    const matrix = {};
    records.forEach((r) => {
        const dateStr = new Date(r.date).toISOString().split('T')[0];
        const key = `${r.student}_${dateStr}`;
        matrix[key] = r.status;
    });

    const dates = [];
    if (from && to) {
        const startD = new Date(from);
        const endD = new Date(to);
        for (let d = new Date(startD); d <= endD; d.setUTCDate(d.getUTCDate() + 1)) {
            dates.push(d.toISOString().split('T')[0]);
        }
    }

    res.json({
        people: students.map((s) => ({
            _id: s._id,
            name: s.fullNameKh,
            code: s.studentId,
            className: s.class?.className || '',
        })),
        dates,
        records: matrix,
    });
});

export const getStudentAttendanceStats = asyncHandler(async (req, res) => {
    const { from, to, schoolId, classId } = req.query;
    const { user } = req;

    const filter = {};

    if (user.role === 'school-admin') {
        filter.school = user.school;
    } else if (schoolId) {
        filter.school = schoolId;
    }

    if (from && to) {
        filter.date = {
            $gte: toUTCMidnight(from),
            $lte: toUTCMidnight(to),
        };
    }

    if (classId) {
        const classStudents = await Student.find({ class: classId }).select('_id').lean();
        filter.student = { $in: classStudents.map((s) => s._id) };
    }
    if (filter.school) filter.school = new mongoose.Types.ObjectId(filter.school);
    if (filter.student?.$in) filter.student.$in = filter.student.$in.map((id) => new mongoose.Types.ObjectId(id));

    const stats = await StudentAttendance.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const result = {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
    };

    stats.forEach((s) => {
        result[s._id] = s.count;
        result.total += s.count;
    });

    const daily = await StudentAttendance.aggregate([
        { $match: filter },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'UTC' } },
                present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
                late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
                leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
                total: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({ ...result, daily });
});
