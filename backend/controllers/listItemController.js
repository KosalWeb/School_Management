import ListItem from '../models/ListItemModel.js';

// @desc    Get all items for a specific list type
// @route   GET /api/list-items?type=framework
export const getListItems = async (req, res) => {
    try {
        const { type } = req.query;
        if (!type) {
            return res.status(400).json({ message: 'Please specify a list type.' });
        }
        const items = await ListItem.find({ type }).sort({ name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new list item
// @route   POST /api/list-items
export const createListItem = async (req, res) => {
    try {
        const { name, type, description } = req.body;
        if (!name || !type) {
            return res.status(400).json({ message: 'Name and type are required.' });
        }
        const newItem = new ListItem({ name, type, description });
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: 'Error creating item. It may already exist.', error: error.message });
    }
};

// @desc    Update a list item
// @route   PUT /api/list-items/:id
export const updateListItem = async (req, res) => {
    try {
        const item = await ListItem.findById(req.params.id);
        if (item) {
            item.name = req.body.name || item.name;
            item.description = req.body.description || item.description;
            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating item.', error: error.message });
    }
};

// @desc    Delete a list item
// @route   DELETE /api/list-items/:id
export const deleteListItem = async (req, res) => {
    try {
        const item = await ListItem.findById(req.params.id);
        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item deleted successfully' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};