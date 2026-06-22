import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const authUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            school: user.school,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, role, school, classes } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role, school, classes });

    if (user) {
        const populatedUser = await User.findById(user._id)
            .populate('school', 'schoolName')
            .populate('classes', 'className')
            .select('-password');

        res.status(201).json({
            ...populatedUser.toObject(),
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const getUsers = async (req, res) => {
    const loggedInUser = req.user;
    const query = {};

    if (loggedInUser.role === 'school-admin') {
        query.school = loggedInUser.school;
        query.role = { $ne: 'superadmin' };
    }

    const users = await User.find(query)
        .populate('school', 'schoolName')
        .populate('classes', 'className')
        .select('-password');
    res.json(users);
};

const updateUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        const newRole = req.body.role || user.role;
        user.role = newRole;

        if (newRole === 'teacher' || newRole === 'data-entry') {
            user.school = req.body.school;
            user.classes = req.body.classes || [];
        } else if (newRole === 'school-admin') {
            user.school = req.body.school;
            user.classes = [];
        } else {
            user.school = undefined;
            user.classes = [];
        }

        const updatedUser = await user.save();

        const populatedUser = await User.findById(updatedUser._id)
            .populate('school', 'schoolName')
            .populate('classes', 'className')
            .select('-password');

        res.json(populatedUser);

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const updateUserPassword = async (req, res) => {
    const user = await User.findById(req.params.id);
    const { password } = req.body;

    if (user) {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        user.password = password;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

const registerSuperadmin = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role: 'superadmin' });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

export { authUser, registerUser, getUsers, updateUser, deleteUser, updateUserPassword, registerSuperadmin };