import React, { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { TableSkeleton } from './common/Skeleton';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const DAYS = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

const Timetable = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [entries, setEntries] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editEntry, setEditEntry] = useState(null);
    const [form, setForm] = useState({ subject: '', teacher: '', startTime: '', endTime: '', room: '' });
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/classes'),
            api.get('/subjects'),
            api.get('/teachers'),
        ]).then(([c, s, t]) => {
            setClasses(c.data);
            setSubjects(s.data);
            setTeachers(t.data);
        }).catch(() => showErrorToast('មិនអាចទាញយកទិន្នន័យបានទេ'))
        .finally(() => setIsLoading(false));
    }, []);

    const fetchTimetable = useCallback(async () => {
        if (!selectedClass) { setEntries([]); return; }
        try {
            const { data } = await api.get(`/timetable/grid/${selectedClass}`);
            setEntries(data);
        } catch {
            showErrorToast('មិនអាចទាញយកកាលវិភាគបានទេ');
        }
    }, [selectedClass]);

    useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

    const timeSlots = [...new Set(entries.map(e => `${e.startTime}-${e.endTime}`))].sort();

    const grid = {};
    entries.forEach(e => {
        const key = `${e.startTime}-${e.endTime}`;
        if (!grid[key]) grid[key] = {};
        grid[key][e.dayOfWeek] = e;
    });

    const openAdd = (day) => {
        setSelectedDay(day);
        setEditEntry(null);
        setForm({ subject: '', teacher: '', startTime: '', endTime: '', room: '' });
        setShowModal(true);
    };

    const openEdit = (entry) => {
        setSelectedDay(entry.dayOfWeek);
        setEditEntry(entry);
        setForm({ subject: entry.subject?._id || '', teacher: entry.teacher?._id || '', startTime: entry.startTime, endTime: entry.endTime, room: entry.room || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.subject || !form.teacher || !form.startTime || !form.endTime) {
            showErrorToast('សូមបំពេញព័ត៌មានទាំងអស់');
            return;
        }
        try {
            const payload = { ...form, class: selectedClass, dayOfWeek: selectedDay };
            if (editEntry) {
                await api.put(`/timetable/${editEntry._id}`, payload);
                showSuccessToast('បានកែសម្រួលកាលវិភាគ');
            } else {
                await api.post('/timetable', payload);
                showSuccessToast('បានបន្ថែមកាលវិភាគ');
            }
            setShowModal(false);
            fetchTimetable();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'ប្រតិបត្តិការបរាជ័យ');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'លុបកាលវិភាគនេះ?',
            onConfirm: async () => {
                try {
                    await api.delete(`/timetable/${id}`);
                    showSuccessToast('បានលុបដោយជោគជ័យ');
                    fetchTimetable();
                } catch {
                    showErrorToast('មិនអាចលុបបានទេ');
                }
            },
        });
    };

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={5} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">កាលវិភាគបង្រៀន</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">ជ្រើសរើសថ្នាក់</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="p-2 border rounded w-full max-w-xs">
                    <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                    {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.className} ({c.classCode})</option>
                    ))}
                </select>
            </div>

            {selectedClass && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow-md border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-3 px-4 border-b text-left font-semibold text-gray-700 w-32">ម៉ោង</th>
                                {DAYS.map((day, i) => (
                                    <th key={i} className="py-3 px-4 border-b text-center font-semibold text-gray-700">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {timeSlots.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">គ្មានទិន្នន័យ</td>
                                </tr>
                            ) : timeSlots.map(slot => {
                                const [start, end] = slot.split('-');
                                return (
                                    <tr key={slot}>
                                        <td className="py-2 px-4 border-b font-medium text-sm text-gray-600">{start} - {end}</td>
                                        {[0, 1, 2, 3, 4, 5].map(day => {
                                            const entry = grid[slot]?.[day];
                                            return (
                                                <td key={day} className="py-1 px-1 border-b text-center align-top">
                                                    {entry ? (
                                                        <div className="bg-blue-50 border border-blue-200 rounded p-1 text-xs group relative">
                                                            <div className="font-medium text-blue-800">{entry.subject?.subjectName}</div>
                                                            <div className="text-blue-600">{entry.teacher?.fullNameKh}</div>
                                                            {entry.room && <div className="text-gray-500">បន្ទប់ {entry.room}</div>}
                                                            <div className="absolute top-0 right-0 hidden group-hover:flex gap-1 p-1">
                                                                <button onClick={() => openEdit(entry)} className="text-blue-500 hover:text-blue-700"><FaEdit size={12} /></button>
                                                                <button onClick={() => handleDelete(entry._id)} className="text-red-500 hover:text-red-700"><FaTrash size={12} /></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => openAdd(day)} className="w-full py-3 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                                            <FaPlus size={14} className="mx-auto" />
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{editEntry ? 'កែសម្រួលកាលវិភាគ' : 'បន្ថែមកាលវិភាគ'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">ថ្ងៃ: {DAYS[selectedDay]} | ម៉ោង: {form.startTime || '--'}</p>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">មុខវិជ្ជា *</label>
                                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full p-2 border rounded" required>
                                    <option value="">-- ជ្រើសរើស --</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">គ្រូបង្រៀន *</label>
                                <select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} className="w-full p-2 border rounded" required>
                                    <option value="">-- ជ្រើសរើស --</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.fullNameKh}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">ម៉ោងចាប់ផ្ដើម *</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ម៉ោងបញ្ចប់ *</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full p-2 border rounded" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">បន្ទប់</label>
                                <input type="text" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="w-full p-2 border rounded" placeholder="ឧ. A101" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                                    {editEntry ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែម'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timetable;
