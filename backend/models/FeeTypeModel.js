import mongoose from 'mongoose';

const feeTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

feeTypeSchema.index({ name: 1, school: 1 }, { unique: true });

const FeeType = mongoose.model('FeeType', feeTypeSchema);
export default FeeType;
