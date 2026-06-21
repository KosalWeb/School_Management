import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
    {
        // Ensure there is NO 'unique: true' on these two lines
        classCode: { type: String, required: true },
        className: { type: String, required: true },

        gradeLevel: { type: String, required: true },
        roomNumber: { type: String, required: true },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
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

// This ensures classCode is unique PER school
classSchema.index({ school: 1, classCode: 1 }, { unique: true });
// This ensures className is also unique PER school
classSchema.index({ school: 1, className: 1 }, { unique: true });


const Class = mongoose.model('Class', classSchema);
export default Class;