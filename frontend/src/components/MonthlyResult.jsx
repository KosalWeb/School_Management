import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import { ClipLoader } from 'react-spinners';
import { showErrorToast } from '../utils/alert';
import { FaPrint } from 'react-icons/fa';

const MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

const MonthlyResult = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [allSubjects, setAllSubjects] = useState([]);
    const [month, setMonth] = useState(MONTHS[0]);
    const [students, setStudents] = useState([]);
    const [scoreMap, setScoreMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
        api.get('/subjects').then((res) => setAllSubjects(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        setSelectedClass('');
        if (selectedSchool) {
            api.get(`/classes?school=${selectedSchool}`).then((res) => setClasses(res.data)).catch(() => setClasses([]));
        } else {
            setClasses([]);
        }
    }, [selectedSchool]);

    const handleSearch = async () => {
        if (!selectedClass) return;
        try {
            setIsLoading(true);
            setHasSearched(true);

            const studentsParams = new URLSearchParams();
            if (selectedSchool) studentsParams.append('school', selectedSchool);
            studentsParams.append('class', selectedClass);

            const scoresParams = new URLSearchParams();
            scoresParams.append('classId', selectedClass);
            if (selectedSchool) scoresParams.append('schoolId', selectedSchool);
            scoresParams.append('examType', month);

            const [studentsRes, scoresRes] = await Promise.all([
                api.get(`/students?${studentsParams.toString()}`),
                api.get(`/student-scores?${scoresParams.toString()}`),
            ]);

            setStudents(studentsRes.data);

            const map = {};
            scoresRes.data.forEach((s) => {
                const studentId = s.student?._id;
                const subjectId = s.subject?._id;
                if (studentId && subjectId) {
                    if (!map[studentId]) map[studentId] = {};
                    map[studentId][subjectId] = s.score;
                }
            });
            setScoreMap(map);
        } catch {
            showErrorToast('ទាញយកទិន្នន័យបរាជ័យ');
        } finally {
            setIsLoading(false);
        }
    };

    const studentStats = useMemo(() => {
        const stats = {};
        const rankings = [];
        students.forEach((student) => {
            let total = 0;
            let count = 0;
            allSubjects.forEach((subj) => {
                const score = scoreMap[student._id]?.[subj._id];
                if (score !== undefined) { total += score; count++; }
            });
            const avg = count > 0 ? Math.round((total / count) * 100) / 100 : null;
            stats[student._id] = { total, count, avg };
            rankings.push({ studentId: student._id, avg });
        });

        rankings.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
        let currentRank = 0;
        let previousAvg = null;
        rankings.forEach((r, i) => {
            if (r.avg !== previousAvg) currentRank = i + 1;
            stats[r.studentId].rank = currentRank;
            previousAvg = r.avg;
        });

        return stats;
    }, [students, allSubjects, scoreMap]);

    const hasAnyScore = useMemo(
        () => Object.values(scoreMap).some((subjMap) => Object.keys(subjMap).length > 0),
        [scoreMap]
    );

    const sortedStudents = useMemo(
        () => [...students].sort((a, b) => (studentStats[a._id]?.rank ?? Infinity) - (studentStats[b._id]?.rank ?? Infinity)),
        [students, studentStats]
    );

    const schoolName = schools.find((s) => s._id === selectedSchool)?.schoolName || '';
    const className = classes.find((c) => c._id === selectedClass)?.className || '';
    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    const handlePrint = () => {
        const rows = students
            .map((student, i) => {
                const stats = studentStats[student._id];
                return `
                    <tr>
                        <td class="text-center">${i + 1}</td>
                        <td>${student.fullNameKh}</td>
                        <td class="text-center">${stats?.total ?? '-'}</td>
                        <td class="text-center">${stats?.avg ?? '-'}</td>
                        <td class="text-center">${stats?.rank ?? '-'}</td>
                    </tr>
                `;
            })
            .join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>របាយការណ៍លទ្ធផលប្រចាំខែ</title>
                <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body { font-family: 'Kantumruy Pro', sans-serif; font-size: 11px; color: #1a1a1a; }
                    .header { text-align: center; border-bottom: 3px double #1e40af; padding-bottom: 12px; margin-bottom: 15px; }
                    .header h1 { font-size: 20px; color: #1e40af; margin: 0 0 5px; }
                    .header p { color: #555; margin: 2px 0; font-size: 12px; }
                    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 20px; padding: 10px 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 15px; }
                    .info-row { font-size: 12px; }
                    .info-row span:first-child { color: #64748b; }
                    .info-row span:last-child { font-weight: 600; color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 11px; }
                    th { background: #1e40af; color: white; font-weight: 600; white-space: nowrap; }
                    td { color: #1e293b; }
                    .text-center { text-align: center; }
                    .footer { text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>របាយការណ៍លទ្ធផលប្រចាំខែ</h1>
                    <p>School Management System</p>
                    <p>ឆ្នាំសិក្សា ${academicYear}</p>
                </div>
                <div class="info-grid">
                    <div class="info-row"><span>សាលា: </span><span>${schoolName || '---'}</span></div>
                    <div class="info-row"><span>ថ្នាក់: </span><span>${className || '---'}</span></div>
                    <div class="info-row"><span>ខែ: </span><span>${month}</span></div>
                    <div class="info-row"><span>ចំនួនសិស្ស: </span><span>${students.length}</span></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="text-center">ល.រ</th>
                            <th>គោត្តនាម និងនាម</th>
                            <th class="text-center">សរុប</th>
                            <th class="text-center">មធ្យម</th>
                            <th class="text-center">ចំណាត់ថ្នាក់</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
                <div class="footer">បង្កើតដោយប្រព័ន្ធគ្រប់គ្រងសាលារៀន • ${new Date().toLocaleString()}</div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">របាយការណ៍លទ្ធផលប្រចាំខែ</h1>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">សាលា</label>
                        <select
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            <option value="">ទាំងអស់</option>
                            {schools.map((s) => (
                                <option key={s._id} value={s._id}>{s.schoolName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ថ្នាក់</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            <option value="">-- ជ្រើសរើស --</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>{c.className}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ខែ</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            {MONTHS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={!selectedClass}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            ស្វែងរក
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-8">
                    <ClipLoader size={40} />
                </div>
            )}

            {!isLoading && hasSearched && students.length === 0 && (
                <p className="text-center text-gray-500 py-8">មិនមានទិន្នន័យសិស្ស</p>
            )}

            {!isLoading && students.length > 0 && !hasAnyScore && (
                <p className="text-center text-gray-500 py-8">មិនមានពិន្ទុត្រូវបានបញ្ចូលសម្រាប់ខែនេះ</p>
            )}

            {!isLoading && students.length > 0 && hasAnyScore && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex justify-end p-4 pb-0">
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                            <FaPrint size={14} /> បោះពុម្ពលទ្ធផល
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3 text-left font-medium text-gray-600 border">ល.រ</th>
                                    <th className="px-3 py-3 text-left font-medium text-gray-600 border">គោត្តនាម និងនាម</th>
                                    <th className="px-3 py-3 text-center font-medium text-gray-600 border">សរុប</th>
                                    <th className="px-3 py-3 text-center font-medium text-gray-600 border">មធ្យម</th>
                                    <th className="px-3 py-3 text-center font-medium text-gray-600 border">ចំណាត់ថ្នាក់</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedStudents.map((student, i) => {
                                    const stats = studentStats[student._id];
                                    return (
                                        <tr key={student._id} className="hover:bg-gray-50">
                                            <td className="px-3 py-3 border">{i + 1}</td>
                                            <td className="px-3 py-3 border font-medium">{student.fullNameKh}</td>
                                            <td className="px-3 py-3 border text-center font-bold text-blue-700">{stats?.total ?? '-'}</td>
                                            <td className="px-3 py-3 border text-center font-bold text-blue-700">{stats?.avg ?? '-'}</td>
                                            <td className="px-3 py-3 border text-center font-bold text-gray-700">{stats?.rank ?? '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyResult;
