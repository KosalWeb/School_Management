import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { useAuth } from '../context/AuthContext';
import { FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';

const StudentPromotion = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [sourceClass, setSourceClass] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'superadmin') {
            api.get('/schools').then(({ data }) => setSchools(data)).catch(() => {});
        }
    }, [user]);

    const schoolId = user?.role === 'superadmin' ? selectedSchool : user?.school;

    useEffect(() => {
        setSourceClass('');
        setTargetClass('');
        if (schoolId) {
            api.get(`/classes?school=${schoolId}`).then(({ data }) => setClasses(data)).catch(() => setClasses([]));
        } else {
            setClasses([]);
        }
    }, [schoolId]);

    const loadStudents = async () => {
        if (!sourceClass) return;
        try {
            const { data } = await api.get('/students', { params: { class: sourceClass } });
            setStudents(data);
            setSelected([]);
        } catch { showErrorToast('Failed to load students'); }
    };

    useEffect(() => { loadStudents(); }, [sourceClass]);

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const selectAll = () => {
        setSelected(selected.length === students.length ? [] : students.map(s => s._id));
    };

    const handlePromote = () => {
        if (!selected.length || !targetClass) {
            showErrorToast('Please select students and a target class');
            return;
        }
        showConfirmDialog({
            title: `Promote ${selected.length} students?`,
            text: `Move to ${classes.find(c => c._id === targetClass)?.className}?`,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await api.post('/students/promote', { studentIds: selected, targetClassId: targetClass });
                    showSuccessToast(`Promoted ${selected.length} students!`);
                    setSelected([]);
                    loadStudents();
                } catch (error) {
                    showErrorToast(error.response?.data?.message || 'Failed');
                } finally { setLoading(false); }
            },
        });
    };

    const availableTargets = classes.filter(c => c._id !== sourceClass);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ដំឡើងថ្នាក់សិស្ស</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {user?.role === 'superadmin' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">សាលារៀន</label>
                            <select value={selectedSchool} onChange={e => { setSelectedSchool(e.target.value); setSourceClass(''); setTargetClass(''); setStudents([]); }} className="w-full p-2 border rounded">
                                <option value="">-- ជ្រើសរើស --</option>
                                {schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">ថ្នាក់បច្ចុប្បន្ន</label>
                        <select value={sourceClass} onChange={e => setSourceClass(e.target.value)} className="w-full p-2 border rounded" disabled={!schoolId}>
                            <option value="">-- ជ្រើសរើស --</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ថ្នាក់គោលដៅ</label>
                        <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full p-2 border rounded" disabled={!schoolId}>
                            <option value="">-- ជ្រើសរើស --</option>
                            {availableTargets.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div>
                        <button onClick={handlePromote} disabled={!selected.length || !targetClass || loading} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                            <FaArrowRight /> {loading ? 'កំពុងដំណើរការ...' : `ដំឡើង (${selected.length})`}
                        </button>
                    </div>
                </div>
            </div>

            {students.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-3 border-b flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={selected.length === students.length && students.length > 0} onChange={selectAll} className="w-4 h-4" />
                            <span className="text-sm font-medium text-gray-700">ជ្រើសរើសទាំងអស់</span>
                        </label>
                        <span className="text-sm text-gray-500 ml-auto">{students.length} នាក់</span>
                    </div>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-2 px-3 w-10"></th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ល.រ</th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ឈ្មោះ</th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">លេខសម្គាល់</th>
                                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-600">ភេទ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, i) => (
                                <tr key={s._id} className={`border-t hover:bg-gray-50 cursor-pointer ${selected.includes(s._id) ? 'bg-blue-50' : ''}`} onClick={() => toggleSelect(s._id)}>
                                    <td className="py-2 px-3 text-center">
                                        <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)} className="w-4 h-4" />
                                    </td>
                                    <td className="py-2 px-3 text-sm">{i + 1}</td>
                                    <td className="py-2 px-3 text-sm font-medium">{s.fullNameKh}</td>
                                    <td className="py-2 px-3 text-sm text-gray-500">{s.studentId}</td>
                                    <td className="py-2 px-3 text-sm">{s.gender}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {sourceClass && students.length === 0 && (
                <div className="text-center py-16 text-gray-400">គ្មានសិស្សក្នុងថ្នាក់នេះ</div>
            )}
        </div>
    );
};

export default StudentPromotion;
