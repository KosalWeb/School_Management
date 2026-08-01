import Timetable from '../models/TimetableModel.js';
import Class from '../models/ClassModel.js';

export const getTimetable = async (req, res) => {
    try {
        const filter = {};
        if (req.query.class) filter.class = req.query.class;
        if (req.query.teacher) filter.teacher = req.query.teacher;
        if (req.query.dayOfWeek) filter.dayOfWeek = parseInt(req.query.dayOfWeek);
        const user = req.user;
        if (user.role !== 'superadmin') {
            filter.school = user.school;
        }
        if (req.query.school) filter.school = req.query.school;

        const entries = await Timetable.find(filter)
            .populate('subject', 'subjectName subjectCode')
            .populate('teacher', 'fullNameKh')
            .populate('class', 'className')
            .sort({ dayOfWeek: 1, startTime: 1 });
        res.json(entries);
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getTimetableGrid = async (req, res) => {
    try {
        const { classId } = req.params;
        const entries = await Timetable.find({ class: classId })
            .populate('subject', 'subjectName subjectCode')
            .populate('teacher', 'fullNameKh')
            .sort({ dayOfWeek: 1, startTime: 1 });
        res.json(entries);
    } catch (error) {
        console.error('Get timetable grid error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createTimetableEntry = async (req, res) => {
    try {
        const { class: classId, subject, teacher, dayOfWeek, startTime, endTime, room } = req.body;
        let school = req.body.school || req.user.school;
        if (!school && classId) {
            const classDoc = await Class.findById(classId).select('school');
            if (classDoc) school = classDoc.school;
        }
        if (!school) {
            return res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ - សាលារៀនមិនត្រូវបានបញ្ជាក់' });
        }
        const existing = await Timetable.findOne({ school, class: classId, dayOfWeek, startTime });
        if (existing) {
            return res.status(400).json({ message: 'ម៉ោងនេះមានរួចហើយសម្រាប់ថ្ងៃនេះ' });
        }
        const entry = await Timetable.create({
            school, class: classId, subject, teacher, dayOfWeek, startTime, endTime, room: room || '',
            createdBy: req.user._id
        });
        const populated = await entry.populate(['subject', 'teacher', 'class']);
        res.status(201).json(populated);
    } catch (error) {
        console.error('Create timetable error:', error);
        const message = error.name === 'ValidationError'
            ? Object.values(error.errors).map(e => e.message).join(', ')
            : error.code === 11000
                ? 'ម៉ោងនេះមានរួចហើយសម្រាប់ថ្ងៃនេះ'
                : 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ';
        res.status(400).json({ message });
    }
};

export const updateTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        const { subject, teacher, dayOfWeek, startTime, endTime, room } = req.body;
        if (subject !== undefined) entry.subject = subject;
        if (teacher !== undefined) entry.teacher = teacher;
        if (dayOfWeek !== undefined) entry.dayOfWeek = dayOfWeek;
        if (startTime !== undefined) entry.startTime = startTime;
        if (endTime !== undefined) entry.endTime = endTime;
        if (room !== undefined) entry.room = room;
        const updated = await entry.save();
        const populated = await updated.populate(['subject', 'teacher', 'class']);
        res.json(populated);
    } catch (error) {
        console.error('Update timetable error:', error);
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
    }
};

export const deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        await entry.deleteOne();
        res.json({ message: 'បានលុបដោយជោគជ័យ' });
    } catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
