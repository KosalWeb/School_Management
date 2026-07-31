import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
    {
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
        dayOfWeek: { type: Number, required: true, enum: [0, 1, 2, 3, 4, 5] },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        room: { type: String, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

timetableSchema.index({ school: 1, class: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
