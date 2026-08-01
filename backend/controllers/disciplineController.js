import Discipline from '../models/DisciplineModel.js';

export const getDisciplines = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role !== 'superadmin') filter.school = req.user.school;
        if (req.query.school) filter.school = req.query.school;
        if (req.query.student) filter.student = req.query.student;
        if (req.query.status) filter.status = req.query.status;
        const items = await Discipline.find(filter)
            .populate('student', 'fullNameKh studentId')
            .sort({ date: -1 });
        res.json(items);
    } catch (error) { console.error('Get disciplines error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const createDiscipline = async (req, res) => {
    try {
        const school = req.body.school || req.user.school;
        if (!school) {
            return res.status(400).json({ message: 'Invalid data' });
        }
        const item = await Discipline.create({ ...req.body, school, createdBy: req.user._id });
        const populated = await item.populate('student', 'fullNameKh studentId');
        res.status(201).json(populated);
    } catch (error) {
        console.error('Create discipline error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const updateDiscipline = async (req, res) => {
    try {
        const item = await Discipline.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        const { student, date, type, description, action, status } = req.body;
        if (student !== undefined) item.student = student;
        if (date !== undefined) item.date = date;
        if (type !== undefined) item.type = type;
        if (description !== undefined) item.description = description;
        if (action !== undefined) item.action = action;
        if (status !== undefined) item.status = status;
        const updated = await item.save();
        const populated = await updated.populate('student', 'fullNameKh studentId');
        res.json(populated);
    } catch (error) {
        console.error('Update discipline error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const deleteDiscipline = async (req, res) => {
    try {
        const item = await Discipline.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (error) { console.error('Delete discipline error:', error); res.status(500).json({ message: 'Server Error' }); }
};
