import React, { useState } from 'react';
import api from '../config/api';
import { ClipLoader } from 'react-spinners';
import { showSuccessToast, showErrorToast } from '../utils/alert';

const MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const EXAM_TYPES = [...MONTHS, 'ឆមាសទី១', 'ឆមាសទី២'];

const StudentScore = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examType, setExamType] = useState(EXAM_TYPES[0]);
    const [students, setStudents] = useState([]);
    const [scores, setScores] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [saving, setSaving] = useState(false);

    React.useEffect(() => {
        api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
        api.get('/subjects').then((res) => setSubjects(res.data)).catch(() => {});
    }, []);

    React.useEffect(() => {
        setSelectedClass('');
        if (selectedSchool) {
            api.get(`/classes?school=${selectedSchool}`).then((res) => setClasses(res.data)).catch(() => setClasses([]));
        } else {
            setClasses([]);
        }
    }, [selectedSchool]);

    const handleSearch = async () => {
        if (!selectedClass || !selectedSubject) return;
        try {
            setIsLoading(true);
            setHasSearched(true);
            const params = new URLSearchParams();
            params.append('class', selectedClass);
            if (selectedSchool) params.append('school', selectedSchool);
            const res = await api.get(`/students?${params.toString()}`);
            setStudents(res.data);

            const scoreParams = new URLSearchParams();
            scoreParams.append('classId', selectedClass);
            scoreParams.append('subjectId', selectedSubject);
            scoreParams.append('examType', examType);
            if (selectedSchool) scoreParams.append('schoolId', selectedSchool);
            const scoreRes = await api.get(`/student-scores?${scoreParams.toString()}`);
            const existingScores = {};
            scoreRes.data.forEach((s) => {
                existingScores[s.student._id] = s.score;
            });
            setScores(existingScores);
        } catch {
            showErrorToast('ទាញយកទិន្នន័យបរាជ័យ');
        } finally {
            setIsLoading(false);
        }
    };

    const handleScoreChange = (studentId, value) => {
        const num = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));
        setScores((prev) => ({ ...prev, [studentId]: num }));
    };

    const handleSave = async () => {
        const scoreEntries = Object.entries(scores)
            .filter(([, score]) => score !== '' && score !== null)
            .map(([studentId, score]) => ({ studentId, score: Number(score) }));

        if (scoreEntries.length === 0) {
            showErrorToast('សូមបញ្ចូលពិន្ទុសិស្ស');
            return;
        }

        try {
            setSaving(true);
            await api.post('/student-scores/batch', {
                scores: scoreEntries,
                classId: selectedClass,
                schoolId: selectedSchool,
                subjectId: selectedSubject,
                examType,
            });
            showSuccessToast('រក្សាទុកពិន្ទុដោយជោគជ័យ');
        } catch {
            showErrorToast('រក្សាទុកបរាជ័យ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">បញ្ចូលពិន្ទុសិស្ស</h1>

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
                            <option value="">-- ជ្រើសរើស --</option>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">មុខវិជ្ជា</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            <option value="">-- ជ្រើសរើស --</option>
                            {subjects.map((s) => (
                                <option key={s._id} value={s._id}>{s.subjectName}</option>
                            ))}
                        </select>
                    </div>
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
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={!selectedClass || !selectedSubject}
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

            {!isLoading && students.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">លេខរៀង</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">គោត្តនាម និងនាម</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">លេខសម្គាល់</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">ពិន្ទុ (0-100)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map((student, i) => (
                                    <tr key={student._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{i + 1}</td>
                                        <td className="px-4 py-3 font-medium">{student.fullNameKh}</td>
                                        <td className="px-4 py-3 text-gray-500">{student.studentId}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={scores[student._id] ?? ''}
                                                onChange={(e) => handleScoreChange(student._id, e.target.value)}
                                                className="w-24 border border-gray-300 rounded px-2 py-1 text-center"
                                                placeholder="0-100"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <ClipLoader size={16} color="white" />}
                            រក្សាទុក
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentScore;
