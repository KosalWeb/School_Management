import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['present', 'absent', 'late', 'leave'],
            default: 'present',
        },
        checkIn: {
            type: String,
            default: '',
        },
        checkOut: {
            type: String,
            default: '',
        },
        note: {
            type: String,
            default: '',
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

attendanceSchema.index({ date: 1, school: 1, teacher: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
