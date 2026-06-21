import asyncHandler from 'express-async-handler';
import Student from '../models/StudentModel.js';
import Class from '../models/ClassModel.js';

export const getStudents = asyncHandler(async (req, res) => {
    const { user } = req;
    const { school, class: classId } = req.query;
    let filter = {};

    if (user.role === 'teacher') {
        filter.class = { $in: user.classes || [] };
    } else if (user.role === 'school-admin' || user.role === 'data-entry') {
        const classesInSchool = await Class.find({ school: user.school }).select('_id');
        filter.class = { $in: classesInSchool.map(c => c._id) };
    } else if (user.role === 'superadmin') {
        if (classId) {
            filter.class = classId;
        } else if (school) {
            const classesInSchool = await Class.find({ school }).select('_id');
            filter.class = { $in: classesInSchool.map(c => c._id) };
        }
    }

    const students = await Student.find(filter)
        .populate({
            path: 'class',
            select: 'className school',
            populate: { path: 'school' }
        })
        .sort({ studentId: 1 });

    res.json(students);
});

export const createStudent = asyncHandler(async (req, res) => {
    const { studentId, class: classId } = req.body;
    const { user } = req;

    const targetClass = await Class.findById(classId);
    if (!targetClass) {
        res.status(404);
        throw new Error('Class not found.');
    }

    if (user.role === 'teacher' && !user.classes.map(c => c.toString()).includes(targetClass._id.toString())) {
        res.status(403);
        throw new Error('Not authorized to add students to this class.');
    }
    if ((user.role === 'school-admin' || user.role === 'data-entry') && targetClass.school.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to add students to this school.');
    }

    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
        res.status(400);
        throw new Error('Student ID already exists');
    }

    const student = await Student.create({ ...req.body, createdBy: user._id });
    res.status(201).json(student);
});

export const updateStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    const { user } = req;

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const studentClass = await Class.findById(student.class);
    if (user.role === 'teacher' && !user.classes.map(c => c.toString()).includes(student.class.toString())) {
        res.status(403);
        throw new Error('Not authorized to modify this student.');
    }
    if ((user.role === 'school-admin' || user.role === 'data-entry') && studentClass.school.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify students in this school.');
    }

    Object.assign(student, req.body);
    const updatedStudent = await student.save();
    res.json(updatedStudent);
});

export const deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    const { user } = req;

    if (!student) {
        res.status(404);
        throw new Error('Student not found');
    }

    const studentClass = await Class.findById(student.class);
    if (user.role === 'teacher' && !user.classes.map(c => c.toString()).includes(student.class.toString())) {
        res.status(403);
        throw new Error('Not authorized to delete this student.');
    }
    if ((user.role === 'school-admin' || user.role === 'data-entry') && studentClass.school.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete students in this school.');
    }

    await student.deleteOne();
    res.json({ message: 'Student removed successfully' });
});