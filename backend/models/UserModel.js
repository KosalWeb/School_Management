import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            required: true,
            enum: ['superadmin', 'school-admin', 'teacher', 'data-entry'],
            default: 'data-entry',
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: function () {
                return this.role === 'school-admin' || this.role === 'teacher' || this.role === 'data-entry';
            },
        },
        classes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class',
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;