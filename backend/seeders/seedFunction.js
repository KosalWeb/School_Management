import User from '../models/UserModel.js';
import School from '../models/SchoolModel.js';
import Class from '../models/ClassModel.js';
import Subject from '../models/SubjectModel.js';
import Teacher from '../models/TeacherModel.js';
import Student from '../models/StudentModel.js';
import Attendance from '../models/AttendanceModel.js';
import StudentAttendance from '../models/StudentAttendanceModel.js';
import ListItem from '../models/ListItemModel.js';

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
        studentsPerSchool: Object.values(schoolClassMap).map(cls => cls.length),
    };
};
