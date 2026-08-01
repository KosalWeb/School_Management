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

    const { studentId, fullNameKh, fullNameEn, gender, dob, fatherName, motherName, phone, address, enrollmentDate, profileImage, status, class: classId } = req.body;
    if (studentId !== undefined) student.studentId = studentId;
    if (fullNameKh !== undefined) student.fullNameKh = fullNameKh;
    if (fullNameEn !== undefined) student.fullNameEn = fullNameEn;
    if (gender !== undefined) student.gender = gender;
    if (dob !== undefined) student.dob = dob;
    if (fatherName !== undefined) student.fatherName = fatherName;
    if (motherName !== undefined) student.motherName = motherName;
    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (enrollmentDate !== undefined) student.enrollmentDate = enrollmentDate;
    if (profileImage !== undefined) student.profileImage = profileImage;
    if (status !== undefined) student.status = status;
    if (classId !== undefined) student.class = classId;
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

export const importStudents = asyncHandler(async (req, res) => {
    const students = req.body;
    let inserted = 0, errors = [];
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: 'No students provided.' });
    }
    for (const s of students) {
        try {
            if (s.studentId && s.fullNameKh && s.class) {
                const exists = await Student.findOne({ studentId: s.studentId });
                if (!exists) {
                    await Student.create({ ...s, createdBy: req.user._id });
                    inserted++;
                }
            }
        } catch (e) {
            errors.push({ studentId: s.studentId, error: e.message });
        }
    }
    res.json({ message: `Imported ${inserted} students.`, errors });
});

export const promoteStudents = asyncHandler(async (req, res) => {
    const { studentIds, targetClassId } = req.body;
    if (!studentIds?.length || !targetClassId) {
        res.status(400);
        throw new Error('studentIds and targetClassId are required');
    }
    const targetClass = await Class.findById(targetClassId);
    if (!targetClass) {
        res.status(404);
        throw new Error('Target class not found');
    }
    if (req.user.role !== 'superadmin' && targetClass.school.toString() !== req.user.school?.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }
    await Student.updateMany(
        { _id: { $in: studentIds } },
        { $set: { class: targetClassId } }
    );
    res.json({ message: `Promoted ${studentIds.length} students to ${targetClass.className}` });
});