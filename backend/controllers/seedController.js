import { seedData } from '../seeders/seedFunction.js';

export const seedAll = async (req, res) => {
    try {
        const result = await seedData();
        res.json({ message: 'Sample data seeded successfully', result });
    } catch (error) {
        console.error('Seed all error:', error);
        res.status(500).json({
            message: error.message || 'Server error while seeding data',
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
        });
    }
};
