import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
        feeType: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeType', required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
        amount: { type: Number, required: true },
        dueDate: { type: Date, required: true },
        paidDate: { type: Date, default: null },
        paidAmount: { type: Number, default: 0 },
        status: { type: String, enum: ['unpaid', 'paid', 'partial', 'overdue'], default: 'unpaid' },
        receiptNumber: { type: String, default: '' },
        note: { type: String, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

feePaymentSchema.index({ student: 1, feeType: 1, dueDate: 1 }, { unique: true });

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);
export default FeePayment;
