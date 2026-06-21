import School from '../models/SchoolModel.js';
import mongoose from 'mongoose';

export const getSchools = async (req, res) => {
    try {
        const pipeline = [
            { $lookup: { from: 'teachers', localField: '_id', foreignField: 'organization', as: 'teachers' } },
            { $lookup: { from: 'classes', localField: '_id', foreignField: 'school', as: 'classes' } },
            {
                $lookup: {
                    from: 'students',
                    let: { class_ids: '$classes._id' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$class', '$$class_ids'] } } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                females: { $sum: { $cond: [{ $eq: ['$gender', 'ស្រី'] }, 1, 0] } }
                            }
                        }
                    ],
                    as: 'studentCounts'
                }
            },
            {
                $addFields: {
                    teacherCount: { $size: '$teachers' },
                    teacherCountFemale: { $size: { $filter: { input: '$teachers', as: 't', cond: { $eq: ['$$t.gender', 'ស្រី'] } } } },
                    classCount: { $size: '$classes' },
                    studentCountTotal: { $ifNull: [{ $arrayElemAt: ['$studentCounts.total', 0] }, 0] },
                    studentCountFemale: { $ifNull: [{ $arrayElemAt: ['$studentCounts.females', 0] }, 0] }
                }
            },
            {
                $project: {
                    schoolCode: 1,
                    schoolName: 1,
                    schoolLevel: 1,
                    address: 1,
                    createdAt: 1,
                    teacherCount: 1,
                    teacherCountFemale: 1,
                    classCount: 1,
                    studentCountTotal: 1,
                    studentCountFemale: 1
                }
            },
            {
                $sort: { schoolCode: 1 }
            }
        ];

        const { user } = req;
        if ((user.role === 'school-admin' || user.role === 'teacher') && user.school) {
            const schoolObjectId = new mongoose.Types.ObjectId(user.school);
            pipeline.unshift({ $match: { _id: schoolObjectId } });
        }

        const schoolsWithCounts = await School.aggregate(pipeline);
        res.json(schoolsWithCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createSchool = async (req, res) => {
    try {
        const { schoolCode, schoolName, schoolLevel, address } = req.body;
        const schoolExists = await School.findOne({ schoolCode });
        if (schoolExists) {
            return res.status(400).json({ message: 'School code already exists.' });
        }
        const newSchool = new School({
            schoolCode, schoolName, schoolLevel, address,
            createdBy: req.user._id,
        });
        const createdSchool = await newSchool.save();
        res.status(201).json(createdSchool);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data.', errors: error.errors });
    }
};

export const updateSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            Object.assign(school, req.body);
            const updatedSchool = await school.save();
            res.json(updatedSchool);
        } else {
            res.status(404).json({ message: 'School not found.' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data.', errors: error.errors });
    }
};

export const deleteSchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (school) {
            await school.deleteOne();
            res.json({ message: 'School deleted successfully' });
        } else {
            res.status(404).json({ message: 'School not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};