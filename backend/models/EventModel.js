import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        endDate: { type: Date },
        type: { type: String, enum: ['holiday', 'exam', 'meeting', 'sport', 'other'], default: 'other' },
        description: { type: String, default: '' },
        school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
        allSchool: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
