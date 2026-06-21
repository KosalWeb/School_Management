import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Attendance from '../models/AttendanceModel.js';
import Teacher from '../models/TeacherModel.js';

const toUTCMidnight = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};

export const getAttendance = asyncHandler(async (req, res) => {
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

    const teacherFilter = {};
    if (schoolFilter) {
        teacherFilter.organization = schoolFilter;
    }

    const teachers = await Teacher.find(teacherFilter)
        .populate('organization', 'schoolName schoolLevel')
        .sort({ fullNameKh: 1 });

    const attendanceRecords = await Attendance.find({
        date: queryDate,
        ...(schoolFilter ? { school: schoolFilter } : {}),
    }).populate('teacher', 'fullNameKh teacherId');

    const attendanceMap = {};
    attendanceRecords.forEach((rec) => {
        attendanceMap[rec.teacher._id.toString()] = rec;
    });

    const result = teachers.map((teacher) => ({
        teacher,
        attendance: attendanceMap[teacher._id.toString()] || null,
    }));

    res.json({
        date: queryDate,
        records: result,
        summary: {
            total: teachers.length,
            present: attendanceRecords.filter((r) => r.status === 'present').length,
            absent: attendanceRecords.filter((r) => r.status === 'absent').length,
            late: attendanceRecords.filter((r) => r.status === 'late').length,
            leave: attendanceRecords.filter((r) => r.status === 'leave').length,
        },
    });
});

export const saveAttendance = asyncHandler(async (req, res) => {
    const { records } = req.body;
    const { user } = req;

    if (!records || !Array.isArray(records) || records.length === 0) {
        res.status(400);
        throw new Error('Records array is required');
    }

    const results = [];

    for (const record of records) {
        const { teacher: teacherId, date, status, checkIn, checkOut, note } = record;

        if (!teacherId || !date || !status) {
            continue;
        }

        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            continue;
        }

        const queryDate = toUTCMidnight(date);

        const schoolId = teacher.organization || user.school;

        const existing = await Attendance.findOne({
            teacher: teacherId,
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
            const newRecord = await Attendance.create({
                teacher: teacherId,
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

    res.json({ message: 'Attendance saved successfully', count: results.length });
});

export const getAttendanceHistory = asyncHandler(async (req, res) => {
    const { teacherId, from, to } = req.query;
    const { user } = req;

    const filter = {};

    if (user.role === 'school-admin') {
        filter.school = user.school;
    } else if (req.query.schoolId) {
        filter.school = req.query.schoolId;
    }

    if (teacherId) {
        filter.teacher = teacherId;
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

    const records = await Attendance.find(filter)
        .populate('teacher', 'fullNameKh teacherId fullNameEn')
        .populate('school', 'schoolName')
        .sort({ date: -1, 'teacher.fullNameKh': 1 });

    res.json(records);
});

export const getAttendanceMatrix = asyncHandler(async (req, res) => {
    const { from, to, schoolId } = req.query;
    const { user } = req;

    const schoolFilter = user.role === 'school-admin' ? user.school : schoolId || null;

    const teacherFilter = {};
    if (schoolFilter) teacherFilter.organization = schoolFilter;
    const teachers = await Teacher.find(teacherFilter).sort({ fullNameKh: 1 }).lean();

    const recordFilter = {};
    if (schoolFilter) recordFilter.school = schoolFilter;
    if (from && to) {
        recordFilter.date = {
            $gte: toUTCMidnight(from),
            $lte: toUTCMidnight(to),
        };
    }

    const records = await Attendance.find(recordFilter).sort({ date: 1 }).lean();

    const matrix = {};
    records.forEach((r) => {
        const dateStr = new Date(r.date).toISOString().split('T')[0];
        const key = `${r.teacher}_${dateStr}`;
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
        people: teachers.map((t) => ({ _id: t._id, name: t.fullNameKh, code: t.teacherId })),
        dates,
        records: matrix,
    });
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
    const { from, to, schoolId } = req.query;
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
    if (filter.school) filter.school = new mongoose.Types.ObjectId(filter.school);

    const stats = await Attendance.aggregate([
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

    const daily = await Attendance.aggregate([
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
