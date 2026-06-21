import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import userRoutes from './routes/userRoutes.js';
import teachersRoutes from './routes/teachersRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import classRoutes from './routes/classRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import listItemRoutes from './routes/listItemRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import studentAttendanceRoutes from './routes/studentAttendanceRoutes.js';
import destroyRoutes from './routes/destroyRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import studentScoreRoutes from './routes/studentScoreRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const possibleDist = [
    path.resolve(__dirname, '..', 'dist'),
    path.resolve(__dirname, '..', 'frontend', 'dist'),
];
const frontendDist = possibleDist.find(d => fs.existsSync(d)) || possibleDist[1];

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/list-items', listItemRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/student-attendance', studentAttendanceRoutes);
app.use('/api/destroy', destroyRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/student-scores', studentScoreRoutes);

// --- Serve built frontend ---
app.use(express.static(frontendDist));

// --- SPA fallback: serve index.html for non-API routes ---
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
});

// --- USE ERROR MIDDLEWARE (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.APP_PORT || process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));