import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema(
    {
        schoolCode: { type: String, required: true, unique: true },
        schoolName: { type: String, required: true },
        schoolLevel: {
            type: String,
            required: true,
            enum: ['វិទ្យាល័យ', 'អនុវិទ្យាល័យ', 'បឋមសិក្សា']
        },
        address: {
            province: String,
            district: String,
            commune: String,
            village: String,
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

const School = mongoose.model('School', schoolSchema);
export default School;