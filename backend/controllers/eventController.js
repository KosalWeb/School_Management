import Event from '../models/EventModel.js';

export const getEvents = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role !== 'superadmin') {
            filter.$or = [{ school: req.user.school }, { allSchool: true }];
        }
        if (req.query.month && req.query.year) {
            const start = new Date(req.query.year, req.query.month - 1, 1);
            const end = new Date(req.query.year, req.query.month, 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        }
        const items = await Event.find(filter).sort({ date: 1 });
        res.json(items);
    } catch (error) { console.error('Get events error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const createEvent = async (req, res) => {
    try {
        const school = req.body.allSchool ? undefined : (req.body.school || req.user.school);
        const item = await Event.create({ ...req.body, school, createdBy: req.user._id });
        res.status(201).json(item);
    } catch (error) {
        console.error('Create event error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const item = await Event.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        const { title, date, endDate, type, description, school, allSchool } = req.body;
        if (title !== undefined) item.title = title;
        if (date !== undefined) item.date = date;
        if (endDate !== undefined) item.endDate = endDate;
        if (type !== undefined) item.type = type;
        if (description !== undefined) item.description = description;
        if (school !== undefined) item.school = school;
        if (allSchool !== undefined) item.allSchool = allSchool;
        const updated = await item.save();
        res.json(updated);
    } catch (error) {
        console.error('Update event error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const item = await Event.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (error) { console.error('Delete event error:', error); res.status(500).json({ message: 'Server Error' }); }
};
