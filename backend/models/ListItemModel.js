import mongoose from 'mongoose';

const listItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['framework', 'position', 'organization'], // The types of lists we have
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
});

// Ensure that for each type, the name is unique
listItemSchema.index({ name: 1, type: 1 }, { unique: true });

const ListItem = mongoose.model('ListItem', listItemSchema);
export default ListItem;