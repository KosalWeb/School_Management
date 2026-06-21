import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
    {
        subjectCode: { type: String, required: true, unique: true },
        subjectName: { type: String, required: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true,
    }
);

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;