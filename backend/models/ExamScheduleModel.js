import mongoose from 'mongoose';

const examScheduleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        room: { type: String, default: '' },
        examType: { type: String, default: 'ឆមាសទី១' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
export default ExamSchedule;
