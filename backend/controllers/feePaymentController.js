import FeePayment from '../models/FeePaymentModel.js';

export const getFeePayments = async (req, res) => {
    try {
        const filter = {};
        const user = req.user;
        if (user.role !== 'superadmin') filter.school = user.school;
        if (req.query.school) filter.school = req.query.school;
        if (req.query.student) filter.student = req.query.student;
        if (req.query.feeType) filter.feeType = req.query.feeType;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.class) {
            const Student = (await import('../models/StudentModel.js')).default;
            const students = await Student.find({ class: req.query.class }).select('_id');
            filter.student = { $in: students.map(s => s._id) };
        }
        const payments = await FeePayment.find(filter)
            .populate('student', 'fullNameKh fullNameEn studentId')
            .populate('feeType', 'name amount')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createFeePayment = async (req, res) => {
    try {
        const school = req.body.school || req.user.school;
        if (!school) {
            return res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
        }
        const payment = await FeePayment.create({ ...req.body, school, createdBy: req.user._id });
        const populated = await payment.populate(['student', 'feeType']);
        res.status(201).json(populated);
    } catch (error) {
        console.error('Create fee payment error:', error);
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
    }
};

export const updateFeePayment = async (req, res) => {
    try {
        const payment = await FeePayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        const { student, feeType, amount, dueDate, paidDate, paidAmount, status, receiptNumber, note } = req.body;
        if (student !== undefined) payment.student = student;
        if (feeType !== undefined) payment.feeType = feeType;
        if (amount !== undefined) payment.amount = amount;
        if (dueDate !== undefined) payment.dueDate = dueDate;
        if (paidDate !== undefined) payment.paidDate = paidDate;
        if (paidAmount !== undefined) payment.paidAmount = paidAmount;
        if (status !== undefined) payment.status = status;
        if (receiptNumber !== undefined) payment.receiptNumber = receiptNumber;
        if (note !== undefined) payment.note = note;
        const updated = await payment.save();
        const populated = await updated.populate(['student', 'feeType']);
        res.json(populated);
    } catch (error) {
        console.error('Update fee payment error:', error);
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
    }
};

export const deleteFeePayment = async (req, res) => {
    try {
        const payment = await FeePayment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        await payment.deleteOne();
        res.json({ message: 'បានលុបដោយជោគជ័យ' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
