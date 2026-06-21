import mongoose from 'mongoose';

const studentScoreSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
        class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        score: { type: Number, required: true, min: 0, max: 100 },
        examType: { type: String, required: true, enum: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ', 'ឆមាសទី១', 'ឆមាសទី២'], default: 'មករា' },
        date: { type: Date, default: Date.now },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

studentScoreSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

const StudentScore = mongoose.model('StudentScore', studentScoreSchema);
export default StudentScore;
