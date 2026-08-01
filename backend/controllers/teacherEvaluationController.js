import TeacherEvaluation from '../models/TeacherEvaluationModel.js';

export const getEvaluations = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role !== 'superadmin') filter.school = req.user.school;
        if (req.query.school) filter.school = req.query.school;
        if (req.query.teacher) filter.teacher = req.query.teacher;
        const items = await TeacherEvaluation.find(filter)
            .populate('teacher', 'fullNameKh')
            .populate('evaluator', 'name')
            .sort({ date: -1 });
        res.json(items);
    } catch { res.status(500).json({ message: 'Server Error' }); }
};

export const createEvaluation = async (req, res) => {
    try {
        const school = req.user.role === 'superadmin' ? req.body.school : req.user.school;
        const item = await TeacherEvaluation.create({ ...req.body, school, evaluator: req.user._id });
        const populated = await item.populate(['teacher', 'evaluator']);
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
};

export const updateEvaluation = async (req, res) => {
    try {
        const item = await TeacherEvaluation.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        Object.assign(item, req.body);
        const updated = await item.save();
        const populated = await updated.populate(['teacher', 'evaluator']);
        res.json(populated);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
};

export const deleteEvaluation = async (req, res) => {
    try {
        const item = await TeacherEvaluation.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch { res.status(500).json({ message: 'Server Error' }); }
};
