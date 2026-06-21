import Subject from '../models/SubjectModel.js';

// Get all subjects (no change)
export const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({}).sort({ subjectCode: 1 });
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create a single subject (no change)
export const createSubject = async (req, res) => {
    try {
        const { subjectCode, subjectName } = req.body;
        const subjectExists = await Subject.findOne({ subjectCode });
        if (subjectExists) {
            return res.status(400).json({ message: `លេខកូដមុខវិជ្ជា '${subjectCode}' មានរួចហើយ` });
        }
        const newSubject = new Subject({ subjectCode, subjectName, createdBy: req.user._id });
        const createdSubject = await newSubject.save();
        res.status(201).json(createdSubject);
    } catch (error) {
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ', errors: error.errors });
    }
};

// --- NEW FUNCTION: Import multiple subjects from Excel ---
export const importSubjects = async (req, res) => {
    const subjects = req.body; // Expect an array of subjects
    let insertedCount = 0;
    let errors = [];

    if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: 'No subjects provided for import.' });
    }

    for (const subject of subjects) {
        try {
            // Check for both subjectCode and subjectName to avoid importing partial data
            if (subject.subjectCode && subject.subjectName) {
                const subjectExists = await Subject.findOne({ subjectCode: subject.subjectCode });
                if (!subjectExists) {
                    const newSubject = new Subject({
                        subjectCode: subject.subjectCode,
                        subjectName: subject.subjectName,
                        createdBy: req.user._id
                    });
                    await newSubject.save();
                    insertedCount++;
                }
            }
        } catch (e) {
            errors.push({ subjectCode: subject.subjectCode, error: e.message });
        }
    }

    res.status(201).json({
        message: `Import complete. Added ${insertedCount} new subjects.`,
        errors: errors
    });
};

// Update a single subject (no change)
export const updateSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (subject) {
            Object.assign(subject, req.body);
            const updatedSubject = await subject.save();
            res.json(updatedSubject);
        } else {
            res.status(404).json({ message: 'រកមិនឃើញមុខវិជ្ជាទេ' });
        }
    } catch (error) {
        res.status(400).json({ message: 'ទិន្នន័យ​មិន​ត្រឹមត្រូវ', errors: error.errors });
    }
};


// Delete a single subject (no change)
export const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (subject) {
            await subject.deleteOne();
            res.json({ message: 'បានលុបមុខវិជ្ជាដោយជោគជ័យ' });
        } else {
            res.status(404).json({ message: 'រកមិនឃើញមុខវិជ្ជាទេ' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- NEW FUNCTION: Delete multiple subjects by their IDs ---
export const deleteMultipleSubjects = async (req, res) => {
    const { ids } = req.body; // Expect an array of IDs

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No subject IDs provided for deletion.' });
    }

    try {
        const result = await Subject.deleteMany({ _id: { $in: ids } });
        res.json({ message: `${result.deletedCount} subjects deleted successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};