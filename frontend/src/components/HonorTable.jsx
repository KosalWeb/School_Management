import React, { useState } from 'react';
import api from '../config/api';
import { ClipLoader } from 'react-spinners';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

const MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const EXAM_TYPES = [...MONTHS, 'ឆមាសទី១', 'ឆមាសទី២'];

const RANK_ICONS = {
    1: <FaTrophy className="text-yellow-500 text-xl" />,
    2: <FaMedal className="text-gray-400 text-xl" />,
    3: <FaAward className="text-orange-500 text-xl" />,
};

const RANK_BG = {
    1: 'bg-yellow-50',
    2: 'bg-gray-50',
    3: 'bg-orange-50',
};

const HonorTable = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [examType, setExamType] = useState(EXAM_TYPES[0]);
    const [honorList, setHonorList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    React.useEffect(() => {
        api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
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
        if (!selectedClass) return;
        try {
            setIsLoading(true);
            setHasSearched(true);
            const params = new URLSearchParams();
            params.append('classId', selectedClass);
            params.append('examType', examType);
            if (selectedSchool) params.append('schoolId', selectedSchool);

            const res = await api.get(`/student-scores/honor?${params.toString()}`);
            setHonorList(res.data);
        } catch (error) {
            console.error('Could not fetch honor table', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">តារាងកិត្តិយស</h1>

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

            {!isLoading && hasSearched && honorList.length === 0 && (
                <p className="text-center text-gray-500 py-8">មិនមានទិន្នន័យពិន្ទុ</p>
            )}

            {!isLoading && honorList.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600 w-16">ចំណាត់ថ្នាក់</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">គោត្តនាម និងនាម</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">លេខសម្គាល់</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">ពិន្ទុមធ្យម</th>
                                    <th className="px-4 py-3 text-center font-medium text-gray-600">មុខវិជ្ជាសរុប</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {honorList.map((h) => (
                                    <tr key={h.studentId} className={`hover:bg-gray-50 ${RANK_BG[h.rank] || ''}`}>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {RANK_ICONS[h.rank] || <span className="text-gray-400 font-bold">#{h.rank}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{h.studentName}</td>
                                        <td className="px-4 py-3 text-gray-500">{h.studentCode}</td>
                                        <td className="px-4 py-3 text-center font-bold text-lg">{h.averageScore}</td>
                                        <td className="px-4 py-3 text-center">{h.totalSubjects}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HonorTable;
