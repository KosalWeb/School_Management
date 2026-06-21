import asyncHandler from 'express-async-handler';
import Teacher from '../models/TeacherModel.js';

/**
 * @desc    Fetch all teachers based on user role
 * @route   GET /api/teachers
 * @access  Private
 */
export const getTeachers = asyncHandler(async (req, res) => {
    const { user } = req;
    const { organization } = req.query;
    let filter = {};

    // If the logged-in user is a school-admin, restrict the query
    // to show only teachers from their assigned school.
    if (user.role === 'school-admin') {
        // We assume 'user.school' holds the ID of the school/organization.
        filter.organization = user.school;
    } else if (organization) {
        // For other roles (like superadmin), allow filtering by any organization.
        filter.organization = organization;
    }

    const teachers = await Teacher.find(filter)
        .populate('framework', 'name')
        .populate('position', 'name')
        .populate('organization')
        .sort({ createdAt: -1 });

    res.json(teachers);
});

/**
 * @desc    Create a new teacher
 * @route   POST /api/teachers
 * @access  Private/Admin
 */
export const createTeacher = asyncHandler(async (req, res) => {
    const {
        teacherId, fullNameKh, fullNameEn, gender, dob, phone,
        position, hireDate, framework, organization, address,
        profileImage, status
    } = req.body;

    const { user } = req;

    // Authorization check: A school-admin can only create teachers for their own school.
    if (user.role === 'school-admin' && organization.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to add teachers to this school.');
    }

    const teacherExists = await Teacher.findOne({ teacherId });
    if (teacherExists) {
        res.status(400);
        throw new Error('Teacher ID already exists');
    }

    const teacherData = {
        teacherId,
        fullNameKh,
        fullNameEn,
        gender,
        dob,
        phone,
        hireDate,
        address,
        profileImage,
        status,
        createdBy: user._id,
        position: position || null,
        framework: framework || null,
        organization: organization || null,
    };

    const teacher = new Teacher(teacherData);
    const createdTeacher = await teacher.save();
    res.status(201).json(createdTeacher);
});

/**
 * @desc    Update a teacher's profile
 * @route   PUT /api/teachers/:id
 * @access  Private/Admin
 */
export const updateTeacher = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    const { user } = req;

    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }

    // Authorization check: A school-admin can only update teachers from their own school.
    if (user.role === 'school-admin' && teacher.organization.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to modify teachers in this school.');
    }

    // Prevent email from being updated if it's in the request body
    if (req.body.email) {
        delete req.body.email;
    }

    Object.assign(teacher, req.body);
    const updatedTeacher = await teacher.save();
    res.json(updatedTeacher);
});

/**
 * @desc    Delete a teacher
 * @route   DELETE /api/teachers/:id
 * @access  Private/Admin
 */
export const deleteTeacher = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findById(req.params.id);
    const { user } = req;

    if (!teacher) {
        res.status(404);
        throw new Error('Teacher not found');
    }

    // Authorization check: A school-admin can only delete teachers from their own school.
    if (user.role === 'school-admin' && teacher.organization.toString() !== user.school.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete teachers in this school.');
    }

    await teacher.deleteOne();
    res.json({ message: 'Teacher removed successfully' });
});