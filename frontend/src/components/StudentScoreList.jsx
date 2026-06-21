import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import { ClipLoader } from 'react-spinners';
import { showErrorToast } from '../utils/alert';

const MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const EXAM_TYPES = [...MONTHS, 'ឆមាសទី១', 'ឆមាសទី២'];

const getMention = (avg) => {
    if (avg == null) return '-';
    if (avg >= 85) return 'ល្អណាស់';
    if (avg >= 70) return 'ល្អ';
    if (avg >= 55) return 'មធ្យម';
    if (avg >= 40) return 'ខ្សោយ';
    return 'ខ្សោយណាស់';
};

const getResult = (avg) => {
    if (avg == null) return '-';
    return avg >= 50 ? 'ជាប់' : 'ធ្លាក់';
};

const StudentScoreList = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [allSubjects, setAllSubjects] = useState([]);
    const [examType, setExamType] = useState(EXAM_TYPES[0]);
    const [students, setStudents] = useState([]);
    const [scoreMap, setScoreMap] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showAllExamTypes, setShowAllExamTypes] = useState(false);

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

            const params = new URLSearchParams();
            if (selectedSchool) params.append('school', selectedSchool);
            params.append('class', selectedClass);

            const scoresParams = new URLSearchParams();
            scoresParams.append('classId', selectedClass);
            if (selectedSchool) scoresParams.append('schoolId', selectedSchool);
            if (!showAllExamTypes) scoresParams.append('examType', examType);

            const [studentsRes, scoresRes] = await Promise.all([
                api.get(`/students?${params.toString()}`),
                api.get(`/student-scores?${scoresParams.toString()}`),
            ]);

            setStudents(studentsRes.data);

            const map = {};
            scoresRes.data.forEach((s) => {
                const studentId = s.student?._id;
                const subjectId = s.subject?._id;
                if (studentId && subjectId) {
                    if (!map[studentId]) map[studentId] = {};
                    if (!map[studentId][subjectId]) map[studentId][subjectId] = {};
                    map[studentId][subjectId][s.examType] = s.score;
                }
            });
            setScoreMap(map);
        } catch {
            showErrorToast('ទាញយកទិន្នន័យបរាជ័យ');
        } finally {
            setIsLoading(false);
        }
    };

    const getScore = (studentId, subjectId) => {
        if (showAllExamTypes) {
            const subjScores = scoreMap[studentId]?.[subjectId] || {};
            return EXAM_TYPES.map((et) => subjScores[et]);
        }
        return scoreMap[studentId]?.[subjectId]?.[examType];
    };

    const studentStats = useMemo(() => {
        const stats = {};
        const rankings = [];
        students.forEach((student) => {
            let total = 0;
            let count = 0;
            allSubjects.forEach((subj) => {
                const score = getScore(student._id, subj._id);
                if (showAllExamTypes && Array.isArray(score)) {
                    score.forEach((s) => {
                        if (s !== undefined) { total += s; count++; }
                    });
                } else if (score !== undefined) {
                    total += score;
                    count++;
                }
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
    }, [students, allSubjects, scoreMap, showAllExamTypes, examType]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">បញ្ជីពិន្ទុសិស្ស</h1>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    {!showAllExamTypes && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ប្រភេទប្រឡង</label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                style={{ color: '#000', background: '#fff' }}
                            >
                                {EXAM_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={!selectedClass}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            ស្វែងរក
                        </button>
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showAllExamTypes}
                                onChange={(e) => setShowAllExamTypes(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">បង្ហាញគ្រប់ប្រភេទ</span>
                        </label>
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

            {!isLoading && students.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-left font-medium text-gray-600 border">ល.រ</th>
<th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-left font-medium text-gray-600 border">លេខសម្គាល់</th>
<th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-left font-medium text-gray-600 border">គោត្តនាម និងនាម</th>
                                    {allSubjects.map((subj) => (
                                        <th
                                            key={subj._id}
                                            colSpan={showAllExamTypes ? EXAM_TYPES.length : 1}
                                            className="px-3 py-3 text-center font-medium text-gray-600 border"
                                        >
                                            {subj.subjectName}
                                        </th>
                                    ))}
                                    <th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-center font-medium text-gray-600 border">សរុប</th>
                                    <th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-center font-medium text-gray-600 border">មធ្យម</th>
                                    <th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-center font-medium text-gray-600 border">កម្រិត</th>
                                    <th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-center font-medium text-gray-600 border">លទ្ធផល</th>
                                    <th rowSpan={showAllExamTypes ? 2 : 1} className="px-3 py-3 text-center font-medium text-gray-600 border">ចំណាត់ថ្នាក់</th>
                                </tr>
                                {showAllExamTypes && (
                                    <tr>
                                        {allSubjects.map((subj) =>
                                            EXAM_TYPES.map((et) => (
                                                <th key={`${subj._id}-${et}`} className="px-2 py-2 text-center font-medium text-gray-500 border text-xs">
                                                    {et}
                                                </th>
                                            ))
                                        )}
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student, i) => {
                                    const stats = studentStats[student._id];
                                    return (
                                        <tr key={student._id} className="hover:bg-gray-50">
<td className="px-3 py-3 border">{i + 1}</td>
<td className="px-3 py-3 border text-gray-500">{student.studentId}</td>
<td className="px-3 py-3 border font-medium">{student.fullNameKh}</td>
                                            {allSubjects.map((subj) => {
                                                const score = getScore(student._id, subj._id);
                                                if (showAllExamTypes && Array.isArray(score)) {
                                                    return score.map((s, si) => (
                                                        <td key={`${subj._id}-${si}`} className={`px-2 py-3 border text-center font-semibold ${s !== undefined ? 'text-gray-800' : 'text-gray-300'}`}>
                                                            {s !== undefined ? s : '-'}
                                                        </td>
                                                    ));
                                                }
                                                return (
                                                    <td key={subj._id} className={`px-3 py-3 border text-center font-semibold ${score !== undefined ? 'text-gray-800' : 'text-gray-300'}`}>
                                                        {score !== undefined ? score : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-3 py-3 border text-center font-bold text-blue-700">{stats?.total ?? '-'}</td>
                                            <td className="px-3 py-3 border text-center font-bold text-blue-700">{stats?.avg ?? '-'}</td>
                                            <td className="px-3 py-3 border text-center font-semibold">{getMention(stats?.avg)}</td>
                                            <td className={`px-3 py-3 border text-center font-bold ${stats?.avg >= 50 ? 'text-green-600' : 'text-red-600'}`}>{getResult(stats?.avg)}</td>
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

export default StudentScoreList;
