import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Class from '../models/ClassModel.js';

export const getClasses = asyncHandler(async (req, res) => {
    const { school } = req.query;
    const { user } = req;

    const matchStage = {};

    if (user.role === 'teacher') {
        matchStage._id = { $in: user.classes || [] };
    } else if (user.role === 'school-admin' || user.role === 'data-entry') {
        matchStage.school = user.school;
    } else if (user.role === 'superadmin' && school) {
        matchStage.school = new mongoose.Types.ObjectId(school);
    }

    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: 'class',
                as: 'students'
            }
        },
        {
            $lookup: {
                from: 'schools',
                localField: 'school',
                foreignField: '_id',
                as: 'schoolInfo'
            }
        },
        {
            $project: {
                _id: 1, classCode: 1, className: 1, gradeLevel: 1, roomNumber: 1, createdAt: 1,
                school: { $arrayElemAt: ['$schoolInfo', 0] },
                studentCountTotal: { $size: '$students' },
                studentCountFemale: {
                    $size: {
                        $filter: {
                            input: '$students',
                            as: 'student',
                            cond: { $eq: ['$$student.gender', 'ស្រី'] }
                        }
                    }
                }
            }
        },
        { $sort: { 'school.schoolCode': 1, classCode: 1 } }
    ];

    const classesWithCounts = await Class.aggregate(pipeline);
    res.json(classesWithCounts);
});

export const createClass = asyncHandler(async (req, res) => {
    const { classCode, gradeLevel, roomNumber, school } = req.body;
    const schoolId = req.user.role === 'school-admin' ? req.user.school : school;

    if (!schoolId) {
        res.status(400);
        throw new Error('School is required.');
    }

    const className = `${gradeLevel}-${roomNumber}`;
    const classExists = await Class.findOne({ school: schoolId, $or: [{ classCode }, { className }] });

    if (classExists) {
        res.status(400);
        throw new Error('Class code or name already exists for this school.');
    }

    const newClass = await Class.create({
        classCode, className, gradeLevel, roomNumber,
        school: schoolId,
        createdBy: req.user._id,
    });
    res.status(201).json(newClass);
});

export const updateClass = asyncHandler(async (req, res) => {
    const { classCode, gradeLevel, roomNumber, school } = req.body;
    const { user } = req;
    const classId = req.params.id;

    const classToUpdate = await Class.findById(classId);

    if (!classToUpdate) {
        res.status(404);
        throw new Error('Class not found');
    }

    if (user.role === 'school-admin' && classToUpdate.school.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this class.');
    }

    const schoolId = user.role === 'superadmin' ? school : user.school;
    const newClassName = `${gradeLevel || classToUpdate.gradeLevel}-${roomNumber || classToUpdate.roomNumber}`;
    const newClassCode = classCode || classToUpdate.classCode;

    const conflict = await Class.findOne({
        _id: { $ne: classId },
        school: schoolId,
        $or: [{ classCode: newClassCode }, { className: newClassName }]
    });

    if (conflict) {
        res.status(400);
        throw new Error('A class with this code or name already exists for the school.');
    }

    classToUpdate.classCode = newClassCode;
    classToUpdate.gradeLevel = gradeLevel || classToUpdate.gradeLevel;
    classToUpdate.roomNumber = roomNumber || classToUpdate.roomNumber;
    classToUpdate.className = newClassName;
    if (user.role === 'superadmin') {
        classToUpdate.school = school || classToUpdate.school;
    }

    const updatedClass = await classToUpdate.save();

    await updatedClass.populate({
        path: 'school',
        select: 'schoolName schoolLevel'
    });

    res.json(updatedClass);
});

export const deleteClass = asyncHandler(async (req, res) => {
    const classToDelete = await Class.findById(req.params.id);
    if (classToDelete) {
        await classToDelete.deleteOne();
        res.json({ message: 'Class deleted successfully' });
    } else {
        res.status(404);
        throw new Error('Class not found');
    }
});

export const importClasses = asyncHandler(async (req, res) => {
    const classes = req.body;
    let insertedCount = 0;
    const errors = [];

    for (const cls of classes) {
        if (cls.school && cls.classCode && cls.gradeLevel && cls.roomNumber) {
            const className = `${cls.gradeLevel}-${cls.roomNumber}`;
            const classExists = await Class.findOne({
                school: cls.school,
                $or: [{ classCode: cls.classCode }, { className }]
            });

            if (!classExists) {
                const newClass = new Class({
                    ...cls,
                    className: className,
                    createdBy: req.user._id
                });
                await newClass.save();
                insertedCount++;
            } else {
                errors.push(cls.classCode);
            }
        } else {
            errors.push(cls.classCode || 'Unknown');
        }
    }
    const message = `Import complete. Added ${insertedCount} new classes. Skipped ${errors.length} invalid or duplicate entries.`;
    res.status(201).json({ message });
});

export const deleteMultipleClasses = asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400);
        throw new Error('No class IDs provided for deletion.');
    }
    const result = await Class.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} classes deleted successfully.` });
});