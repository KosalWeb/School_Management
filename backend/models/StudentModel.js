import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
    {
        studentId: { type: String, required: true, unique: true },
        fullNameKh: { type: String, required: true },
        fullNameEn: { type: String, required: true },
        gender: { type: String, required: true, enum: ['ប្រុស', 'ស្រី'] },
        dob: { type: Date },
        fatherName: { type: String },
        motherName: { type: String },
        phone: { type: String },
        address: {
            province: String,
            district: String,
            commune: String,
            village: String,
        },
        enrollmentDate: { type: Date, default: Date.now },
        profileImage: { type: String, default: 'no-photo.jpg' },
        status: { type: String, required: true, enum: ['សកម្ម', 'ឈប់រៀន', 'จบการศึกษา'], default: 'សកម្ម' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;