import mongoose from 'mongoose';

const disciplineSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        date: { type: Date, required: true, default: Date.now },
        type: { type: String, required: true, enum: ['behavior', 'absent', 'cheating', 'damage', 'other'], default: 'behavior' },
        description: { type: String, required: true },
        action: { type: String, default: '' },
        status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

const Discipline = mongoose.model('Discipline', disciplineSchema);
export default Discipline;
