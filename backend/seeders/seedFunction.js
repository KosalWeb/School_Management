import User from '../models/UserModel.js';
import School from '../models/SchoolModel.js';
import Class from '../models/ClassModel.js';
import Subject from '../models/SubjectModel.js';
import Teacher from '../models/TeacherModel.js';
import Student from '../models/StudentModel.js';
import Attendance from '../models/AttendanceModel.js';
import StudentAttendance from '../models/StudentAttendanceModel.js';
import ListItem from '../models/ListItemModel.js';
import Discipline from '../models/DisciplineModel.js';
import Event from '../models/EventModel.js';
import ExamSchedule from '../models/ExamScheduleModel.js';
import FeeType from '../models/FeeTypeModel.js';
import FeePayment from '../models/FeePaymentModel.js';
import Notification from '../models/NotificationModel.js';
import StudentScore from '../models/StudentScoreModel.js';
import TeacherEvaluation from '../models/TeacherEvaluationModel.js';
import Timetable from '../models/TimetableModel.js';

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const seedData = async () => {
    // Drop stale indexes that conflict with current schemas
    try {
        await Student.collection.dropIndex('email_1');
    } catch (_) { /* index may not exist */ }

    // Clear existing data (preserve users)
    await Promise.all([
        School.deleteMany(),
        Class.deleteMany(),
        Subject.deleteMany(),
        Teacher.deleteMany(),
        Student.deleteMany(),
        Attendance.deleteMany(),
        StudentAttendance.deleteMany(),
        ListItem.deleteMany(),
        Discipline.deleteMany(),
        Event.deleteMany(),
        ExamSchedule.deleteMany(),
        FeeType.deleteMany(),
        FeePayment.deleteMany(),
        Notification.deleteMany(),
        StudentScore.deleteMany(),
        TeacherEvaluation.deleteMany(),
        Timetable.deleteMany(),
    ]);

    // 1. Find or Create Super Admin
    let superAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!superAdmin) {
        superAdmin = await User.create({
            name: 'Super Admin',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'superadmin',
        });
    }

    // 2. Create ListItems (framework, position, organization)
    const listItems = await ListItem.insertMany([
        { name: 'សាលារៀនគ្រឹះ', type: 'organization', description: 'សាលារៀន' },
        { name: 'មជ្ឈមណ្ឌលសិក្សា', type: 'organization', description: 'មជ្ឈមណ្ឌល' },
        { name: 'គ្រូបង្រៀនកម្រិត១', type: 'position', description: 'គ្រូបង្រៀនកម្រិតទី១' },
        { name: 'គ្រូបង្រៀនកម្រិត២', type: 'position', description: 'គ្រូបង្រៀនកម្រិតទី២' },
        { name: 'គ្រូបង្រៀនកម្រិត៣', type: 'position', description: 'គ្រូបង្រៀនកម្រិតទី៣' },
        { name: 'កម្មវិធីសិក្សាថ្មី', type: 'framework', description: 'កម្មវិធីសិក្សាថ្មីឆ្នាំ២០២៤' },
        { name: 'កម្មវិធីសិក្សាចាស់', type: 'framework', description: 'កម្មវិធីសិក្សាពីមុន' },
    ]);

    const [orgSchool, orgCenter, pos1, pos2, pos3, frameworkNew, frameworkOld] = listItems;

    // 3. Create Schools
    const schools = await School.insertMany([
        {
            schoolCode: 'SCH001',
            schoolName: 'វិទ្យាល័យព្រះស៊ីសុវត្ថិ',
            schoolLevel: 'វិទ្យាល័យ',
            address: { province: 'ភ្នំពេញ', district: 'ដូនពេញ', commune: 'ផ្សារថ្មី', village: 'វត្តភ្នំ' },
            createdBy: superAdmin._id,
        },
        {
            schoolCode: 'SCH002',
            schoolName: 'អនុវិទ្យាល័យទួលទំពូង',
            schoolLevel: 'អនុវិទ្យាល័យ',
            address: { province: 'ភ្នំពេញ', district: 'ចំការមន', commune: 'ទួលទំពូង', village: 'ទួលទំពូងជើង' },
            createdBy: superAdmin._id,
        },
        {
            schoolCode: 'SCH003',
            schoolName: 'បឋមសិក្សាសាលាក្រហម',
            schoolLevel: 'បឋមសិក្សា',
            address: { province: 'តាកែវ', district: 'បាទី', commune: 'ព្រៃរំដួល', village: 'សាលាក្រហម' },
            createdBy: superAdmin._id,
        },
    ]);

    // 4. Find or Create Users for each school
    const schoolUsers = [];
    for (const school of schools) {
        const suffix = school.schoolCode.toLowerCase();
        const userConfigs = [
            { name: `School Admin - ${school.schoolName}`, email: `admin.${suffix}@gmail.com`, role: 'school-admin' },
            { name: `Data Entry - ${school.schoolName}`, email: `data.${suffix}@gmail.com`, role: 'data-entry' },
            { name: `Teacher User - ${school.schoolName}`, email: `teacher.${suffix}@gmail.com`, role: 'teacher' },
        ];
        for (const cfg of userConfigs) {
            let user = await User.findOne({ email: cfg.email });
            if (!user) {
                user = await User.create({ ...cfg, password: '123456', school: school._id });
            }
            schoolUsers.push(user);
        }
    }

    // 5. Create Classes for each school
    const classData = [
        { school: schools[0], grade: 'ទី១០', prefix: 'A' },
        { school: schools[0], grade: 'ទី១០', prefix: 'B' },
        { school: schools[0], grade: 'ទី១១', prefix: 'A' },
        { school: schools[0], grade: 'ទី១១', prefix: 'B' },
        { school: schools[0], grade: 'ទី១២', prefix: 'A' },
        { school: schools[1], grade: 'ទី៧', prefix: 'A' },
        { school: schools[1], grade: 'ទី៧', prefix: 'B' },
        { school: schools[1], grade: 'ទី៨', prefix: 'A' },
        { school: schools[1], grade: 'ទី៨', prefix: 'B' },
        { school: schools[1], grade: 'ទី៩', prefix: 'A' },
        { school: schools[2], grade: 'ទី១', prefix: 'A' },
        { school: schools[2], grade: 'ទី២', prefix: 'A' },
        { school: schools[2], grade: 'ទី៣', prefix: 'A' },
        { school: schools[2], grade: 'ទី៤', prefix: 'A' },
        { school: schools[2], grade: 'ទី៥', prefix: 'A' },
        { school: schools[2], grade: 'ទី៦', prefix: 'A' },
    ];

    const createdClasses = await Class.insertMany(
        classData.map((c, i) => ({
            classCode: `${c.school.schoolCode}-${String(i + 1).padStart(2, '0')}`,
            className: `ថ្នាក់${c.grade} ${c.prefix}`,
            gradeLevel: c.grade,
            roomNumber: `បន្ទប់ ${String(i + 1).padStart(2, '0')}`,
            school: c.school._id,
            createdBy: superAdmin._id,
        }))
    );

    // 6. Create Subjects
    const subjects = await Subject.insertMany([
        { subjectCode: 'MATH', subjectName: 'គណិតវិទ្យា', createdBy: superAdmin._id },
        { subjectCode: 'KHMR', subjectName: 'ភាសាខ្មែរ', createdBy: superAdmin._id },
        { subjectCode: 'ENGL', subjectName: 'ភាសាអង់គ្លេស', createdBy: superAdmin._id },
        { subjectCode: 'PHYS', subjectName: 'រូបវិទ្យា', createdBy: superAdmin._id },
        { subjectCode: 'CHEM', subjectName: 'គីមីវិទ្យា', createdBy: superAdmin._id },
        { subjectCode: 'BIO', subjectName: 'ជីវវិទ្យា', createdBy: superAdmin._id },
        { subjectCode: 'HIST', subjectName: 'ប្រវត្តិវិទ្យា', createdBy: superAdmin._id },
        { subjectCode: 'GEOG', subjectName: 'ភូមិវិទ្យា', createdBy: superAdmin._id },
    ]);

    // 7. Create Teachers
    const teacherData = [
        { tId: 'T001', kh: 'ស៊ីន ចាន់ណា', en: 'Sin Channa', gender: 'ស្រី', phone: '012100001', schoolIdx: 0 },
        { tId: 'T002', kh: 'សុខ សុភ័ក្រ', en: 'Sok Sophak', gender: 'ប្រុស', phone: '012100002', schoolIdx: 0 },
        { tId: 'T003', kh: 'ម៉ៅ វុទ្ធី', en: 'Mao Vuthy', gender: 'ប្រុស', phone: '012100003', schoolIdx: 0 },
        { tId: 'T004', kh: 'ហេង ម៉ាលី', en: 'Heng Mali', gender: 'ស្រី', phone: '012100004', schoolIdx: 1 },
        { tId: 'T005', kh: 'គីម សុភា', en: 'Kim Sophea', gender: 'ស្រី', phone: '012100005', schoolIdx: 1 },
        { tId: 'T006', kh: 'ជា រិទ្ធី', en: 'Chea Rithy', gender: 'ប្រុស', phone: '012100006', schoolIdx: 1 },
        { tId: 'T007', kh: 'វ៉េន ស្រីពៅ', en: 'Ven SreyPov', gender: 'ស្រី', phone: '012100007', schoolIdx: 2 },
        { tId: 'T008', kh: 'ណុប ប៊ុនថន', en: 'Nop Bunthan', gender: 'ប្រុស', phone: '012100008', schoolIdx: 2 },
    ];

    const teachers = await Teacher.insertMany(
        teacherData.map((t) => ({
            teacherId: t.tId,
            fullNameKh: t.kh,
            fullNameEn: t.en,
            gender: t.gender,
            dob: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            phone: t.phone,
            hireDate: new Date(2015 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), 1),
            address: { province: 'ភ្នំពេញ', district: 'ដូនពេញ', commune: 'ផ្សារថ្មី', village: 'វត្តភ្នំ' },
            status: 'សកម្ម',
            createdBy: superAdmin._id,
            framework: frameworkNew._id,
            position: [pos1._id, pos2._id, pos3._id][t.schoolIdx % 3],
            organization: schools[t.schoolIdx]._id,
        }))
    );

    // 8. Create Students (100 per school, distributed across classes)
    const studentNames = [
        { kh: 'ស៊ីន ចាន់ណា', en: 'Sin Channa' },
        { kh: 'សុខ សុភ័ក្រ', en: 'Sok Sophak' },
        { kh: 'ម៉ៅ វុទ្ធី', en: 'Mao Vuthy' },
        { kh: 'ហេង ម៉ាលី', en: 'Heng Mali' },
        { kh: 'គីម សុភា', en: 'Kim Sophea' },
        { kh: 'ជា រិទ្ធី', en: 'Chea Rithy' },
        { kh: 'វ៉េន ស្រីពៅ', en: 'Ven SreyPov' },
        { kh: 'ណុប ប៊ុនថន', en: 'Nop Bunthan' },
        { kh: 'ព្រាប មុន្នី', en: 'Preab Mony' },
        { kh: 'រស់ បញ្ញា', en: 'Ros Pheak' },
        { kh: 'លី សុខុម', en: 'Ly Sokhom' },
        { kh: 'ថោង ម៉ាឡៃ', en: 'Thong Malai' },
        { kh: 'យ៉ត បុប្ផា', en: 'Yot Bopha' },
        { kh: 'សាយ សុវណ្ណ', en: 'Soy Sovann' },
        { kh: 'គង់ ស៊ីថា', en: 'Kong Sitha' },
        { kh: 'សោម ច័ន្ទទីណា', en: 'Som Chendina' },
        { kh: 'ពេជ្រ បញ្ញារ័ត្ន', en: 'Pech Phonarat' },
        { kh: 'អ៊ុច ស្រីល័ក្ខ', en: 'Uch SreyLeak' },
        { kh: 'ដួង វណ្ណា', en: 'Duong Vanna' },
        { kh: 'ហ៊ុន ពិសី', en: 'Hun Pisey' },
        { kh: 'ម៉ែន រ៉ានី', en: 'Mean Rany' },
        { kh: 'ឡុង ធារ៉ា', en: 'Long Theara' },
        { kh: 'គាន សុវណ្ណា', en: 'Kean Sovanna' },
        { kh: 'វ៉ាន់ សុភា', en: 'Van Sophea' },
    ];
    const expandedNames = [];
    for (let rep = 0; rep < 13; rep++) {
        for (const n of studentNames) {
            expandedNames.push({
                kh: rep === 0 ? n.kh : `${n.kh.split(' ')[0]} ${['រិន', 'វុទ្ធី', 'ពិសី', 'សុភា', 'ធារ៉ា', 'ស្រីពៅ', 'ចាន់ណា', 'មុន្នី', 'បញ្ញា', 'រ៉ានី', 'សុខុម', 'ម៉ាឡៃ'][(rep + studentNames.indexOf(n)) % 12]}`,
                en: rep === 0 ? n.en : `${n.en.split(' ')[0]} ${['Rin', 'Vuthy', 'Pisey', 'Sophea', 'Theara', 'SreyPov', 'Channa', 'Mony', 'Pheak', 'Rany', 'Sokhom', 'Malai'][(rep + studentNames.indexOf(n)) % 12]}`,
            });
            if (expandedNames.length >= 310) break;
        }
        if (expandedNames.length >= 310) break;
    }

    const fatherNames = ['ស៊ីន', 'សុខ', 'ម៉ៅ', 'ហេង', 'គីម', 'ជា', 'ព្រាប', 'រស់', 'លី', 'ថោង', 'យ៉ត', 'សាយ', 'គង់', 'សោម', 'ពេជ្រ', 'ដួង', 'ហ៊ុន', 'ម៉ែន', 'ឡុង', 'គាន'];
    const motherNames = ['ចាន់ណា', 'ម៉ាលី', 'បុប្ផា', 'សុវណ្ណ', 'ស៊ីថា', 'ស្រីពៅ', 'ស្រីល័ក្ខ', 'វណ្ណា', 'ពិសី', 'រ៉ានី', 'សុភា', 'ម៉ាឡៃ'];

    const provinceDistricts = [
        { province: 'ភ្នំពេញ', district: 'ដូនពេញ', commune: 'ផ្សារថ្មី', village: 'វត្តភ្នំ' },
        { province: 'ភ្នំពេញ', district: 'ចំការមន', commune: 'ទួលទំពូង', village: 'ទួលទំពូងត្បូង' },
        { province: 'ភ្នំពេញ', district: 'ឫស្សីកែវ', commune: 'ឫស្សីកែវ', village: 'សំរោង' },
        { province: 'តាកែវ', district: 'បាទី', commune: 'ព្រៃរំដួល', village: 'សាលាក្រហម' },
        { province: 'កណ្តាល', district: 'តាខ្មៅ', commune: 'តាខ្មៅ', village: 'ព្រែកតាព្រីង' },
        { province: 'ព្រះសីហនុ', district: 'មិត្តភាព', commune: 'បឹងព្រលឹត', village: 'អូរជុំ' },
    ];

    const statuses = ['សកម្ម', 'សកម្ម', 'សកម្ម', 'សកម្ម', 'សកម្ម', 'សកម្ម', 'ឈប់រៀន', 'จบการศึกษา'];

    const schoolClassMap = {};
    for (const cls of createdClasses) {
        const schoolId = cls.school.toString();
        if (!schoolClassMap[schoolId]) schoolClassMap[schoolId] = [];
        schoolClassMap[schoolId].push(cls);
    }

    const STUDENTS_PER_SCHOOL = 100;
    const students = [];
    let studentCounter = 1;

    for (const schoolId of Object.keys(schoolClassMap)) {
        const schoolClasses = schoolClassMap[schoolId];
        const perClass = Math.floor(STUDENTS_PER_SCHOOL / schoolClasses.length);
        const remainder = STUDENTS_PER_SCHOOL % schoolClasses.length;

        for (let ci = 0; ci < schoolClasses.length; ci++) {
            const cls = schoolClasses[ci];
            const count = perClass + (ci < remainder ? 1 : 0);
            const schoolAddress = provinceDistricts[ci % provinceDistricts.length];

            for (let i = 0; i < count; i++) {
                const nameIdx = (studentCounter - 1) % expandedNames.length;
                const sid = String(studentCounter).padStart(4, '0');
                const name = expandedNames[nameIdx];
                const gender = name.kh.includes('ណា') || name.kh.includes('លី') || name.kh.includes('ពៅ') || name.kh.includes('ល័ក្ខ') || name.kh.includes('ណ្ណ') || name.kh.includes('សី') || name.kh.includes('នី') || name.kh.includes('ប្ផា') ? 'ស្រី' : 'ប្រុស';

                const birthYear = cls.gradeLevel === 'ទី១០' || cls.gradeLevel === 'ទី១១' || cls.gradeLevel === 'ទី១២' ? 2006 + Math.floor(Math.random() * 4) :
                    cls.gradeLevel === 'ទី៧' || cls.gradeLevel === 'ទី៨' || cls.gradeLevel === 'ទី៩' ? 2010 + Math.floor(Math.random() * 3) :
                        2014 + Math.floor(Math.random() * 6);

                const enrollYear = cls.gradeLevel === 'ទី១០' || cls.gradeLevel === 'ទី១១' || cls.gradeLevel === 'ទី១២' ? 2018 + Math.floor(Math.random() * 4) :
                    cls.gradeLevel === 'ទី៧' || cls.gradeLevel === 'ទី៨' || cls.gradeLevel === 'ទី៩' ? 2020 + Math.floor(Math.random() * 3) :
                        2022 + Math.floor(Math.random() * 4);

                students.push({
                    studentId: `STU${sid}`,
                    fullNameKh: name.kh,
                    fullNameEn: name.en,
                    gender,
                    dob: new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                    profileImage: Math.random() < 0.9
                        ? `https://randomuser.me/api/portraits/${gender === 'ស្រី' ? 'women' : 'men'}/${(parseInt(sid) * 13) % 100}.jpg`
                        : 'no-photo.jpg',
                    fatherName: `ឪពុក ${fatherNames[Math.floor(Math.random() * fatherNames.length)]}`,
                    motherName: `ម្តាយ ${motherNames[Math.floor(Math.random() * motherNames.length)]}`,
                    phone: `0${15 + Math.floor(Math.random() * 10)}${sid}`,
                    address: {
                        province: schoolAddress.province,
                        district: schoolAddress.district,
                        commune: schoolAddress.commune,
                        village: schoolAddress.village,
                    },
                    enrollmentDate: new Date(enrollYear, 9, 1),
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    createdBy: superAdmin._id,
                    class: cls._id,
                });
                studentCounter++;
            }
        }
    }
    const createdStudents = await Student.insertMany(students);

    // 9. Create Attendance records for the past 5 days
    const today = new Date();
    const attendanceRecords = [];
    for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const teacher of teachers) {
            const attStatuses = ['present', 'present', 'present', 'present', 'absent', 'late', 'leave'];
            const status = attStatuses[Math.floor(Math.random() * attStatuses.length)];
            const school = schools.find((s) => s._id.equals(teacher.organization));
            if (!school) continue;

            const checkIn = status === 'absent' ? '' : `${7 + Math.floor(Math.random() * 2)}:${Math.random() > 0.5 ? '00' : '30'}`;
            const checkOut = status === 'absent' ? '' : `${16 + Math.floor(Math.random() * 2)}:${Math.random() > 0.5 ? '00' : '30'}`;

            attendanceRecords.push({
                teacher: teacher._id,
                school: school._id,
                date,
                status,
                checkIn,
                checkOut,
                note: status === 'present' ? '' : status === 'absent' ? 'អវត្តមាន' : status === 'late' ? 'យឺត' : 'សុំច្បាប់',
                markedBy: superAdmin._id,
            });
        }
    }
    const createdAttendance = await Attendance.insertMany(attendanceRecords);

    // Group students & classes by school for per-school generation
    const studentBySchool = {};
    const classBySchool = {};
    for (const cls of createdClasses) {
        const schoolId = cls.school.toString();
        if (!classBySchool[schoolId]) classBySchool[schoolId] = [];
        classBySchool[schoolId].push(cls);
    }
    for (const s of createdStudents) {
        const schoolId = createdClasses.find(c => c._id.equals(s.class))?.school?.toString();
        if (!schoolId) continue;
        if (!studentBySchool[schoolId]) studentBySchool[schoolId] = [];
        studentBySchool[schoolId].push(s);
    }

    // 10. Student Attendance for the past 5 school days (drives report cards / reports)
    const studentAttendanceRecords = [];
    for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        for (const student of createdStudents) {
            const schoolId = createdClasses.find(c => c._id.equals(student.class))?.school;
            if (!schoolId) continue;
            const attStatuses = ['present', 'present', 'present', 'present', 'present', 'absent', 'late', 'leave'];
            const status = attStatuses[Math.floor(Math.random() * attStatuses.length)];
            studentAttendanceRecords.push({
                student: student._id,
                school: schoolId,
                date,
                status,
                checkIn: status === 'absent' ? '' : `7:${Math.random() > 0.5 ? '00' : '30'}`,
                checkOut: status === 'absent' ? '' : `1${Math.floor(Math.random() * 3)}:00`,
                note: status === 'present' ? '' : status === 'absent' ? 'អវត្តមាន' : status === 'late' ? 'យឺត' : 'សុំច្បាប់',
                markedBy: superAdmin._id,
            });
        }
    }
    const createdStudentAttendance = await StudentAttendance.insertMany(studentAttendanceRecords);

    // 11. Student Scores (12 months + 2 semesters x all subjects) — drives Honor Table, Score List, Report Card
    const scoreMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const scoreSemesters = ['ឆមាសទី១', 'ឆមាសទី២'];
    const scoreExamTypes = [...scoreMonths, ...scoreSemesters];
    const scoreRecords = [];
    createdStudents.forEach((student, idx) => {
        const ability = 45 + Math.floor(Math.random() * 45);
        const schoolId = createdClasses.find(c => c._id.equals(student.class))?.school;
        for (const subject of subjects) {
            scoreExamTypes.forEach((examType, ei) => {
                const score = Math.max(20, Math.min(100, ability + randInt(-12, 12)));
                const isMonth = ei < scoreMonths.length;
                const date = isMonth
                    ? new Date(today.getFullYear(), ei, randInt(1, 25))
                    : new Date(today.getFullYear(), today.getMonth() - (examType === 'ឆមាសទី១' ? 3 : 0), randInt(1, 25));
                scoreRecords.push({
                    student: student._id,
                    subject: subject._id,
                    class: student.class,
                    school: schoolId,
                    score,
                    examType,
                    date,
                    markedBy: superAdmin._id,
                });
            });
        }
    });
    const createdScores = await StudentScore.insertMany(scoreRecords);

    // 12. Fee Types per school (drives Fee Types page)
    const feeTypeData = [
        { name: 'ថ្លៃសិក្សា', amount: 500000 },
        { name: 'ថ្លៃសម្ភារៈសិក្សា', amount: 50000 },
        { name: 'ថ្លៃប្រឡង', amount: 20000 },
        { name: 'ថ្លៃវិញ្ញាបនបត្រ', amount: 15000 },
    ];
    const feeTypes = [];
    for (const school of schools) {
        for (const ft of feeTypeData) {
            feeTypes.push({ ...ft, school: school._id, createdBy: superAdmin._id });
        }
    }
    const createdFeeTypes = await FeeType.insertMany(feeTypes);

    // 13. Fee Payments (drives Fee Payments page)
    const feePaymentRecords = [];
    let receiptCounter = 1;
    for (const school of schools) {
        const schoolFeeTypes = createdFeeTypes.filter(ft => ft.school.equals(school._id));
        const schoolStudents = studentBySchool[school._id.toString()] || [];
        for (const student of schoolStudents) {
            for (const feeType of schoolFeeTypes) {
                const roll = Math.random();
                const dueDate = new Date(today.getFullYear(), today.getMonth() - randInt(0, 2), randInt(1, 28));
                let status = 'unpaid';
                let paidDate = null;
                let paidAmount = 0;
                let receiptNumber = '';
                if (roll < 0.6) {
                    status = 'paid';
                    paidDate = new Date(dueDate);
                    paidDate.setDate(paidDate.getDate() + randInt(0, 10));
                    paidAmount = feeType.amount;
                    receiptNumber = `RCP-${String(receiptCounter++).padStart(6, '0')}`;
                } else if (roll < 0.75) {
                    status = 'partial';
                    paidDate = new Date(dueDate);
                    paidDate.setDate(paidDate.getDate() + randInt(0, 5));
                    paidAmount = Math.round(feeType.amount / 2);
                    receiptNumber = `RCP-${String(receiptCounter++).padStart(6, '0')}`;
                } else if (roll < 0.85) {
                    status = 'overdue';
                }
                feePaymentRecords.push({
                    student: student._id,
                    feeType: feeType._id,
                    school: school._id,
                    amount: feeType.amount,
                    dueDate,
                    paidDate,
                    paidAmount,
                    status,
                    receiptNumber,
                    createdBy: superAdmin._id,
                });
            }
        }
    }
    const createdFeePayments = await FeePayment.insertMany(feePaymentRecords);

    // 14. Timetable (drives Timetable page)
    const timetableRecords = [];
    const teachersBySchool = {};
    for (const t of teachers) {
        const schoolId = t.organization.toString();
        if (!teachersBySchool[schoolId]) teachersBySchool[schoolId] = [];
        teachersBySchool[schoolId].push(t);
    }
    const periods = [
        { startTime: '7:30', endTime: '9:00' },
        { startTime: '9:10', endTime: '10:40' },
        { startTime: '14:00', endTime: '15:30' },
    ];
    for (const cls of createdClasses) {
        const schoolId = cls.school.toString();
        const schoolTeachers = teachersBySchool[schoolId] || [];
        for (let day = 0; day <= 4; day++) {
            periods.forEach((period, pIdx) => {
                const subject = subjects[(pIdx + day) % subjects.length];
                const teacher = schoolTeachers[(pIdx + day) % schoolTeachers.length];
                timetableRecords.push({
                    school: cls.school,
                    class: cls._id,
                    subject: subject._id,
                    teacher: teacher ? teacher._id : null,
                    dayOfWeek: day,
                    startTime: period.startTime,
                    endTime: period.endTime,
                    room: cls.roomNumber,
                    createdBy: superAdmin._id,
                });
            });
        }
    }
    const createdTimetable = await Timetable.insertMany(timetableRecords);

    // 15. Exam Schedules (drives Exam Schedule page)
    const examScheduleRecords = [];
    const examSubjects = subjects.slice(0, 6);
    for (const cls of createdClasses) {
        const start = new Date(today);
        start.setDate(start.getDate() + randInt(10, 30));
        examSubjects.forEach((subject, idx) => {
            const examDate = new Date(start);
            examDate.setDate(examDate.getDate() + idx);
            examScheduleRecords.push({
                name: `ប្រឡង${subject.subjectName}`,
                class: cls._id,
                subject: subject._id,
                school: cls.school,
                date: examDate,
                startTime: '7:30',
                endTime: '9:30',
                room: cls.roomNumber,
                examType: 'ឆមាសទី២',
                createdBy: superAdmin._id,
            });
        });
    }
    const createdExamSchedules = await ExamSchedule.insertMany(examScheduleRecords);

    // 16. Events (drives Event Calendar page)
    const eventData = [
        { title: 'ពិធីបុណ្យអុំទូក', type: 'holiday', description: 'បិទវិស្សមកាលបុណ្យជាតិ' },
        { title: 'កិច្ចប្រជុំគ្រូបង្រៀន', type: 'meeting', description: 'កិច្ចប្រជុំគ្រូបង្រៀនប្រចាំខែ' },
        { title: 'ព្រឹត្តិការណ៍កីឡា', type: 'sport', description: 'ប្រកួតកីឡាប្រចាំសាលា' },
        { title: 'ប្រឡងឆមាស', type: 'exam', description: 'ប្រឡងបញ្ចប់ឆមាស' },
    ];
    const eventRecords = [];
    schools.forEach((school, si) => {
        eventData.forEach((ev, ei) => {
            const evDate = new Date(today);
            evDate.setDate(evDate.getDate() + ei * 15 + si * 3);
            eventRecords.push({ ...ev, date: evDate, school: school._id, createdBy: superAdmin._id });
        });
    });
    eventRecords.push(
        { title: 'បុណ្យចូលឆ្នាំថ្មី', type: 'holiday', date: new Date(today.getFullYear(), 3, 14), allSchool: true, description: 'បុណ្យចូលឆ្នាំប្រពៃណីខ្មែរ', createdBy: superAdmin._id },
        { title: 'ទិវាជាតិ', type: 'holiday', date: new Date(today.getFullYear(), 8, 24), allSchool: true, description: 'ទិវារំដោះជាតិ', createdBy: superAdmin._id },
        { title: 'ទិវាគ្រូបង្រៀន', type: 'other', date: new Date(today.getFullYear(), 9, 5), allSchool: true, description: 'ទិវាគ្រូបង្រៀនជាតិ', createdBy: superAdmin._id },
    );
    const createdEvents = await Event.insertMany(eventRecords);

    // 17. Teacher Evaluations (drives Teacher Evaluation page)
    const evaluationRecords = [];
    for (const teacher of teachers) {
        for (let i = 0; i < 2; i++) {
            evaluationRecords.push({
                teacher: teacher._id,
                school: teacher.organization,
                evaluator: superAdmin._id,
                date: new Date(today.getFullYear(), today.getMonth() - i, randInt(1, 28)),
                criteria: {
                    teaching: randInt(6, 10),
                    discipline: randInt(6, 10),
                    punctuality: randInt(6, 10),
                    preparation: randInt(6, 10),
                    communication: randInt(6, 10),
                },
                comments: i === 0 ? 'គ្រូបង្រៀនពូកែ' : '',
                status: i === 0 ? 'submitted' : 'draft',
            });
        }
    }
    const createdEvaluations = await TeacherEvaluation.insertMany(evaluationRecords);

    // 18. Discipline Records (drives Discipline Records page)
    const disciplineData = [
        { type: 'behavior', description: 'ប្រព្រឹត្តិអំពើមិនសមរម្យក្នុងថ្នាក់', action: 'ព្រមានដោយផ្ទាល់មាត់' },
        { type: 'absent', description: 'អវត្តមានមិនបានសុំច្បាប់', action: 'ហៅឪពុកម្តាយមកជួប' },
        { type: 'cheating', description: 'ចម្លងក្នុងពេលប្រឡង', action: 'ចាប់ពិន្ទុ ០ នឹងព្រមាន' },
        { type: 'damage', description: 'បំផ្លាញសម្ភារៈសាលា', action: 'សងលុយការខូចខាត' },
        { type: 'other', description: 'រំខានដល់ការសិក្សារបស់គ្នាលីគ្នា', action: 'ណែនាំកែតម្រូវ' },
    ];
    const disciplineRecords = [];
    const disciplineStudents = createdStudents.filter((_, i) => i % 10 === 0).slice(0, 30);
    for (const student of disciplineStudents) {
        const schoolId = createdClasses.find(c => c._id.equals(student.class))?.school;
        const d = disciplineData[randInt(0, disciplineData.length - 1)];
        disciplineRecords.push({
            student: student._id,
            school: schoolId,
            date: new Date(today.getFullYear(), today.getMonth(), randInt(1, 28)),
            type: d.type,
            description: d.description,
            action: d.action,
            status: ['open', 'open', 'resolved', 'dismissed'][randInt(0, 3)],
            createdBy: superAdmin._id,
        });
    }
    const createdDiscipline = await Discipline.insertMany(disciplineRecords);

    // 19. Notifications (drives Notifications page)
    const notificationTypes = [
        { type: 'fee', messages: ['សូមបង់ថ្លៃសិក្សា', 'ថ្លៃសិក្សាជំពាក់នៅសល់'] },
        { type: 'attendance', messages: ['អវត្តមានពីសាលា', 'យឺតពេលចូលរៀន'] },
        { type: 'exam', messages: ['ប្រឡងនៅសប្តាហ៍ក្រោយ', 'មានការប្រឡងបន្ថែម'] },
        { type: 'discipline', messages: ['មានកំណត់ហេតុវិន័យ', 'អាកប្បកិរិយាប្រសើរ'] },
        { type: 'general', messages: ['កម្មវិធីអប់រំថ្មី', 'ជូនដំណឹងអំពីសាលា'] },
    ];
    const notificationRecords = [];
    const notifyStudents = createdStudents.filter((_, i) => i % 6 === 0).slice(0, 40);
    for (const student of notifyStudents) {
        const schoolId = createdClasses.find(c => c._id.equals(student.class))?.school;
        const nt = notificationTypes[randInt(0, notificationTypes.length - 1)];
        notificationRecords.push({
            student: student._id,
            school: schoolId,
            type: nt.type,
            message: nt.messages[randInt(0, nt.messages.length - 1)],
            channel: ['sms', 'email', 'in-app'][randInt(0, 2)],
            status: ['sent', 'sent', 'pending', 'failed'][randInt(0, 3)],
            sentAt: new Date(today.getFullYear(), today.getMonth(), randInt(1, 28)),
            createdBy: superAdmin._id,
        });
    }
    const createdNotifications = await Notification.insertMany(notificationRecords);

    // 20. Assign classes to teacher users (so teacher dashboards & timetables work)
    for (const user of schoolUsers) {
        if (user.role !== 'teacher') continue;
        const schoolClasses = classBySchool[user.school.toString()] || [];
        user.classes = schoolClasses.map(c => c._id);
        await user.save();
    }

    return {
        superAdmin: 1,
        schools: schools.length,
        schoolUsers: schoolUsers.length,
        listItems: listItems.length,
        createdClasses: createdClasses.length,
        subjects: subjects.length,
        teachers: teachers.length,
        createdStudents: createdStudents.length,
        createdAttendance: createdAttendance.length,
        createdStudentAttendance: createdStudentAttendance.length,
        createdScores: createdScores.length,
        createdFeeTypes: createdFeeTypes.length,
        createdFeePayments: createdFeePayments.length,
        createdTimetable: createdTimetable.length,
        createdExamSchedules: createdExamSchedules.length,
        createdEvents: createdEvents.length,
        createdEvaluations: createdEvaluations.length,
        createdDiscipline: createdDiscipline.length,
        createdNotifications: createdNotifications.length,
        studentsPerSchool: Object.values(schoolClassMap).map(cls => cls.length),
    };
};
