import React, { useState, useEffect } from 'react';
import GenericTable from './common/GenericTable';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const ExamSchedule = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [items, setItems] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterClass, setFilterClass] = useState('');
    const [form, setForm] = useState({ name: '', class: '', subject: '', date: '', startTime: '', endTime: '', room: '', examType: 'ឆមាសទី១' });

    useEffect(() => {
        if (user?.role === 'superadmin') {
            api.get('/schools').then(({ data }) => setSchools(data)).catch(() => {});
        }
    }, [user]);

    const schoolId = user?.role === 'superadmin' ? selectedSchool : user?.school;

    useEffect(() => {
        setFilterClass('');
        if (schoolId) {
            api.get(`/classes?school=${schoolId}`).then(({ data }) => setClasses(data)).catch(() => setClasses([]));
            api.get('/subjects').then(({ data }) => setSubjects(data)).catch(() => setSubjects([]));
        } else {
            setClasses([]); setSubjects([]);
        }
    }, [schoolId]);

    const fetch = async () => {
        try { setIsLoading(true); const params = {}; if (filterClass) params.class = filterClass; if (schoolId) params.school = schoolId; const { data } = await api.get('/exam-schedules', { params }); setItems(data); }
        catch { showErrorToast('Failed'); } finally { setIsLoading(false); }
    };
    useEffect(() => { fetch(); }, [filterClass, schoolId]);

    const openAdd = () => { setEditItem(null); setForm({ name: '', class: '', subject: '', date: '', startTime: '', endTime: '', room: '', examType: 'ឆមាសទី១' }); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ name: item.name, class: item.class?._id || '', subject: item.subject?._id || '', date: item.date?.split('T')[0] || '', startTime: item.startTime, endTime: item.endTime, room: item.room || '', examType: item.examType }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.class || !form.subject || !form.date || !form.startTime || !form.endTime) { showErrorToast('Please fill required fields'); return; }
        try {
            const payload = { ...form };
            if (schoolId) payload.school = schoolId;
            if (editItem) { await api.put(`/exam-schedules/${editItem._id}`, payload); showSuccessToast('Updated'); }
            else { await api.post('/exam-schedules', payload); showSuccessToast('Created'); }
            setShowModal(false); fetch();
        } catch (error) { showErrorToast(error.response?.data?.message || 'Failed'); }
    };

    const handleDelete = (id) => { showConfirmDialog({ title: 'Delete?', onConfirm: async () => { try { await api.delete(`/exam-schedules/${id}`); showSuccessToast('Deleted'); fetch(); } catch { showErrorToast('Failed'); } } }); };

    const columns = [
        { key: 'index', label: 'ល.រ' }, { key: 'name', label: 'ឈ្មោះ' },
        { key: 'class', label: 'ថ្នាក់', render: (item) => item.class?.className || '--' },
        { key: 'subject', label: 'មុខវិជ្ជា', render: (item) => item.subject?.subjectName || '--' },
        { key: 'date', label: 'ថ្ងៃ', render: (item) => item.date ? new Date(item.date).toLocaleDateString() : '--' },
        { key: 'startTime', label: 'ចាប់ផ្ដើម' }, { key: 'endTime', label: 'បញ្ចប់' }, { key: 'room', label: 'បន្ទប់' },
        { key: 'examType', label: 'ប្រភេទ' },
        { key: 'actions', label: 'សកម្មភាព', render: (item) => <div className="flex space-x-3"><button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button><button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button></div> },
    ];

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={9} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">កាលវិភាគប្រឡង</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {user?.role === 'superadmin' && (
                        <div><label className="block text-sm font-medium mb-1">សាលារៀន</label><select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="w-full p-2 border rounded"><option value="">ទាំងអស់</option>{schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}</select></div>
                    )}
                    <div><label className="block text-sm font-medium mb-1">ថ្នាក់</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border rounded" disabled={!schoolId}><option value="">ទាំងអស់</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                    <div className="flex items-end"><button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><FaPlus /> បន្ថែម</button></div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md"><GenericTable columns={columns} data={items} fileName="ExamSchedule" /></div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">{editItem ? 'កែសម្រួល' : 'បន្ថែម'} កាលវិភាគប្រឡង</h2><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">ឈ្មោះ *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" placeholder="ឧ. ប្រឡងឆមាសទី១" required /></div>
                                <div><label className="block text-sm font-medium mb-1">ប្រភេទ</label><select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })} className="w-full p-2 border rounded"><option value="ឆមាសទី១">ឆមាសទី១</option><option value="ឆមាសទី២">ឆមាសទី២</option></select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">ថ្នាក់ *</label><select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} className="w-full p-2 border rounded" required><option value="">--</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                                <div><label className="block text-sm font-medium mb-1">មុខវិជ្ជា *</label><select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full p-2 border rounded" required><option value="">--</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}</select></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">ថ្ងៃ *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border rounded" required /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">ម៉ោងចាប់ផ្ដើម *</label><input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="w-full p-2 border rounded" required /></div>
                                <div><label className="block text-sm font-medium mb-1">ម៉ោងបញ្ចប់ *</label><input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="w-full p-2 border rounded" required /></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">បន្ទប់</label><input type="text" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} className="w-full p-2 border rounded" placeholder="ឧ. A101" /></div>
                            <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editItem ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែម'}</button><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSchedule;
