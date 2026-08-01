import mongoose from 'mongoose';

const evalSchema = new mongoose.Schema(
    {
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, default: Date.now },
        criteria: {
            teaching: { type: Number, min: 0, max: 10, default: 0 },
            discipline: { type: Number, min: 0, max: 10, default: 0 },
            punctuality: { type: Number, min: 0, max: 10, default: 0 },
            preparation: { type: Number, min: 0, max: 10, default: 0 },
            communication: { type: Number, min: 0, max: 10, default: 0 },
        },
        comments: { type: String, default: '' },
        status: { type: String, enum: ['draft', 'submitted'], default: 'draft' }
    },
    { timestamps: true }
);

const TeacherEvaluation = mongoose.model('TeacherEvaluation', evalSchema);
export default TeacherEvaluation;
