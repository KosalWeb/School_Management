import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/UserModel.js';
import connectDB from '../config/db.js';

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const superAdmin = new User({
            name: 'Super Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: process.env.ROLE,
        });

        await superAdmin.save();

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();