import Timetable from '../models/TimetableModel.js';

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
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createTimetableEntry = async (req, res) => {
    try {
        const { class: classId, subject, teacher, dayOfWeek, startTime, endTime, room } = req.body;
        const existing = await Timetable.findOne({ class: classId, dayOfWeek, startTime });
        if (existing) {
            return res.status(400).json({ message: 'ម៉ោងនេះមានរួចហើយសម្រាប់ថ្ងៃនេះ' });
        }
        const school = req.user.role === 'superadmin' ? req.body.school : req.user.school;
        const entry = await Timetable.create({
            school, class: classId, subject, teacher, dayOfWeek, startTime, endTime, room: room || '',
            createdBy: req.user._id
        });
        const populated = await entry.populate(['subject', 'teacher', 'class']);
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ', errors: error.errors });
    }
};

export const updateTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        Object.assign(entry, req.body);
        const updated = await entry.save();
        const populated = await updated.populate(['subject', 'teacher', 'class']);
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ', errors: error.errors });
    }
};

export const deleteTimetableEntry = async (req, res) => {
    try {
        const entry = await Timetable.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        await entry.deleteOne();
        res.json({ message: 'បានលុបដោយជោគជ័យ' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
