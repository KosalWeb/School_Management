import React, { useState, useEffect } from 'react';
import GenericTable from './common/GenericTable';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaTrash, FaPlus, FaTimes, FaPaperPlane } from 'react-icons/fa';

const TYPE_LABELS = { attendance: 'វត្តមាន', fee: 'ថ្លៃសាលា', exam: 'ប្រឡង', discipline: 'វិន័យ', general: 'ទូទៅ' };

const Notifications = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [items, setItems] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterClass, setFilterClass] = useState('');
    const [form, setForm] = useState({ student: '', type: 'general', message: '' });

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
        } else {
            setClasses([]);
        }
    }, [schoolId]);

    useEffect(() => {
        if (filterClass) { api.get('/students', { params: { class: filterClass } }).then(({ data }) => setStudents(data)).catch(() => setStudents([])); }
        else { setStudents([]); }
    }, [filterClass]);

    const fetch = async () => {
        try { setIsLoading(true); const { data } = await api.get('/notifications'); setItems(data); }
        catch { showErrorToast('Failed'); } finally { setIsLoading(false); }
    };
    useEffect(() => { fetch(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.message) { showErrorToast('Please enter a message'); return; }
        try {
            const payload = { ...form };
            if (schoolId) payload.school = schoolId;
            await api.post('/notifications', payload);
            showSuccessToast('Notification sent');
            setShowModal(false); fetch();
        } catch (error) { showErrorToast(error.response?.data?.message || 'Failed'); }
    };

    const handleDelete = (id) => { showConfirmDialog({ title: 'Delete?', onConfirm: async () => { try { await api.delete(`/notifications/${id}`); showSuccessToast('Deleted'); fetch(); } catch { showErrorToast('Failed'); } } }); };

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'type', label: 'ប្រភេទ', render: (item) => TYPE_LABELS[item.type] || item.type },
        { key: 'message', label: 'សារ' },
        { key: 'student', label: 'សិស្ស', render: (item) => item.student?.fullNameKh || 'ទាំងអស់' },
        { key: 'channel', label: 'ឆានែល' },
        { key: 'status', label: 'ស្ថានភាព', render: (item) => <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'sent' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{item.status === 'sent' ? 'បានផ្ញើ' : 'បរាជ័យ'}</span> },
        { key: 'sentAt', label: 'ថ្ងៃ', render: (item) => item.sentAt ? new Date(item.sentAt).toLocaleDateString() : '--' },
        { key: 'actions', label: 'សកម្មភាព', render: (item) => <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button> },
    ];

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={7} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ការជូនដំណឹង</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {user?.role === 'superadmin' && (
                        <div><label className="block text-sm font-medium mb-1">សាលារៀន</label><select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="w-full p-2 border rounded"><option value="">ទាំងអស់</option>{schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}</select></div>
                    )}
                    <div><label className="block text-sm font-medium mb-1">ថ្នាក់</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border rounded" disabled={!schoolId}><option value="">ទាំងអស់</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                    <div className="flex items-end"><button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><FaPlus /> ផ្ញើការជូនដំណឹង</button></div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md"><GenericTable columns={columns} data={items} fileName="Notifications" /></div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">ផ្ញើការជូនដំណឹង</h2><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="block text-sm font-medium mb-1">ថ្នាក់</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border rounded" disabled={!schoolId}><option value="">ទាំងអស់</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">សិស្ស (ទុកចោល = ទាំងអស់)</label><select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="w-full p-2 border rounded"><option value="">-- ទាំងអស់ --</option>{students.map(s => <option key={s._id} value={s._id}>{s.fullNameKh}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">ប្រភេទ</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded">{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">សារ *</label><textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full p-2 border rounded" rows={3} required /></div>
                            <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"><FaPaperPlane /> ផ្ញើ</button><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
