import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
        type: { type: String, enum: ['attendance', 'fee', 'exam', 'discipline', 'general'], default: 'general' },
        message: { type: String, required: true },
        channel: { type: String, enum: ['sms', 'email', 'in-app'], default: 'in-app' },
        status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
        sentAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
