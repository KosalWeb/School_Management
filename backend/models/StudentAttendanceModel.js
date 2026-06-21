import mongoose from 'mongoose';

const studentAttendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
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

studentAttendanceSchema.index({ date: 1, school: 1, student: 1 }, { unique: true });

const StudentAttendance = mongoose.model('StudentAttendance', studentAttendanceSchema);
export default StudentAttendance;
