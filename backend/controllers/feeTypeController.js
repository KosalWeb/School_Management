import FeeType from '../models/FeeTypeModel.js';

export const getFeeTypes = async (req, res) => {
    try {
        const filter = {};
        const user = req.user;
        if (user.role !== 'superadmin') filter.school = user.school;
        if (req.query.school) filter.school = req.query.school;
        const types = await FeeType.find(filter).sort({ name: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createFeeType = async (req, res) => {
    try {
        const { name, amount } = req.body;
        const school = req.body.school || req.user.school;
        if (!school) {
            return res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
        }
        const exists = await FeeType.findOne({ name, school });
        if (exists) return res.status(400).json({ message: `ប្រភេទថ្លៃ '${name}' មានរួចហើយ` });
        const feeType = await FeeType.create({ name, amount, school, createdBy: req.user._id });
        res.status(201).json(feeType);
    } catch (error) {
        console.error('Create fee type error:', error);
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
    }
};

export const updateFeeType = async (req, res) => {
    try {
        const feeType = await FeeType.findById(req.params.id);
        if (!feeType) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        const { name, amount } = req.body;
        if (name !== undefined) feeType.name = name;
        if (amount !== undefined) feeType.amount = amount;
        const updated = await feeType.save();
        res.json(updated);
    } catch (error) {
        console.error('Update fee type error:', error);
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ' });
    }
};

export const deleteFeeType = async (req, res) => {
    try {
        const feeType = await FeeType.findById(req.params.id);
        if (!feeType) return res.status(404).json({ message: 'រកមិនឃើញទេ' });
        await feeType.deleteOne();
        res.json({ message: 'បានលុបដោយជោគជ័យ' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
