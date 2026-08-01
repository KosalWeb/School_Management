import Notification from '../models/NotificationModel.js';

export const getNotifications = async (req, res) => {
    try {
        const filter = {};
        if (req.user.role !== 'superadmin') filter.school = req.user.school;
        if (req.query.school) filter.school = req.query.school;
        const items = await Notification.find(filter)
            .populate('student', 'fullNameKh studentId')
            .sort({ sentAt: -1 });
        res.json(items);
    } catch (error) { console.error('Get notifications error:', error); res.status(500).json({ message: 'Server Error' }); }
};

export const sendNotification = async (req, res) => {
    try {
        const school = req.body.school || req.user.school;
        const item = await Notification.create({ ...req.body, school, channel: 'in-app', status: 'sent', sentAt: new Date(), createdBy: req.user._id });
        const populated = await item.populate('student', 'fullNameKh studentId');
        res.status(201).json(populated);
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(400).json({ message: 'Invalid data' });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const item = await Notification.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (error) { console.error('Delete notification error:', error); res.status(500).json({ message: 'Server Error' }); }
};
