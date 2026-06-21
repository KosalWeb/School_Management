import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
    {
        teacherId: { type: String, required: true, unique: true },
        fullNameKh: { type: String, required: true },
        fullNameEn: { type: String, required: true },
        gender: { type: String, required: true, enum: ['ប្រុស', 'ស្រី'] },
        dob: { type: Date },
        phone: { type: String, required: true, unique: true },
        // --- FIX: The email field has been removed ---
        hireDate: { type: Date, default: Date.now },
        address: {
            province: String,
            district: String,
            commune: String,
            village: String,
        },
        profileImage: { type: String, default: '' },
        status: { type: String, required: true, enum: ['សកម្ម', 'អសកម្ម', 'សុំច្បាប់'], default: 'សកម្ម' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        framework: { type: mongoose.Schema.Types.ObjectId, ref: 'ListItem' },
        position: { type: mongoose.Schema.Types.ObjectId, ref: 'ListItem' },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    },
    { timestamps: true }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;