import ExamSchedule from '../models/ExamScheduleModel.js';

export const getExamSchedules = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role !== 'superadmin') filter.school = req.user.school;
        if (req.query.school) filter.school = req.query.school;
        if (req.query.class) filter.class = req.query.class;
        if (req.query.subject) filter.subject = req.query.subject;
        const items = await ExamSchedule.find(filter)
            .populate('class', 'className')
            .populate('subject', 'subjectName')
            .sort({ date: 1, startTime: 1 });
        res.json(items);
    } catch (error) { console.error('Get exam schedules error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const createExamSchedule = async (req, res) => {
    try {
        const school = req.body.school || req.user.school;
        if (!school) {
            return res.status(400).json({ message: 'Invalid data' });
        }
        const item = await ExamSchedule.create({ ...req.body, school, createdBy: req.user._id });
        const populated = await item.populate(['class', 'subject']);
        res.status(201).json(populated);
    } catch (error) {
        console.error('Create exam schedule error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const updateExamSchedule = async (req, res) => {
    try {
        const item = await ExamSchedule.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        const { name, class: classId, subject, date, startTime, endTime, room, examType } = req.body;
        if (name !== undefined) item.name = name;
        if (classId !== undefined) item.class = classId;
        if (subject !== undefined) item.subject = subject;
        if (date !== undefined) item.date = date;
        if (startTime !== undefined) item.startTime = startTime;
        if (endTime !== undefined) item.endTime = endTime;
        if (room !== undefined) item.room = room;
        if (examType !== undefined) item.examType = examType;
        const updated = await item.save();
        const populated = await updated.populate(['class', 'subject']);
        res.json(populated);
    } catch (error) {
        console.error('Update exam schedule error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const deleteExamSchedule = async (req, res) => {
    try {
        const item = await ExamSchedule.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (error) { console.error('Delete exam schedule error:', error); res.status(500).json({ message: 'Server Error' }); }
};
