import React, { useState, useEffect } from 'react';
import GenericTable from './common/GenericTable';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const TYPE_LABELS = { behavior: 'អាកប្បកិរិយា', absent: 'អវត្តមាន', cheating: 'បោក', damage: 'ខូចខាត', other: 'ផ្សេងៗ' };
const STATUS_COLOR = { open: 'text-red-600 bg-red-50', resolved: 'text-green-600 bg-green-50', dismissed: 'text-gray-600 bg-gray-50' };
const STATUS_LABELS = { open: 'បើក', resolved: 'ដោះស្រាយរួច', dismissed: 'បោះបង់' };

const DisciplineRecords = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [items, setItems] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [form, setForm] = useState({ student: '', type: 'behavior', description: '', action: '', status: 'open', date: new Date().toISOString().split('T')[0] });

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
        if (filterClass) {
            api.get('/students', { params: { class: filterClass } }).then(({ data }) => setStudents(data)).catch(() => setStudents([]));
        } else { setStudents([]); }
    }, [filterClass]);

    const fetch = async () => {
        try { setIsLoading(true); const params = {}; if (filterStatus) params.status = filterStatus; const { data } = await api.get('/disciplines', { params }); setItems(data); }
        catch { showErrorToast('Failed'); } finally { setIsLoading(false); }
    };
    useEffect(() => { fetch(); }, [filterStatus]);

    const openAdd = () => { setEditItem(null); setForm({ student: '', type: 'behavior', description: '', action: '', status: 'open', date: new Date().toISOString().split('T')[0] }); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ student: item.student?._id || '', type: item.type, description: item.description, action: item.action || '', status: item.status, date: item.date?.split('T')[0] || '' }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.student || !form.description) { showErrorToast('Please fill required fields'); return; }
        try {
            const payload = { ...form };
            if (schoolId) payload.school = schoolId;
            if (editItem) { await api.put(`/disciplines/${editItem._id}`, payload); showSuccessToast('Updated'); }
            else { await api.post('/disciplines', payload); showSuccessToast('Created'); }
            setShowModal(false); fetch();
        } catch (error) { showErrorToast(error.response?.data?.message || 'Failed'); }
    };

    const handleDelete = (id) => {
        showConfirmDialog({ title: 'Delete this record?', onConfirm: async () => { try { await api.delete(`/disciplines/${id}`); showSuccessToast('Deleted'); fetch(); } catch { showErrorToast('Failed'); } } });
    };

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'student', label: 'សិស្ស', render: (item) => item.student?.fullNameKh || '--' },
        { key: 'type', label: 'ប្រភេទ', render: (item) => TYPE_LABELS[item.type] || item.type },
        { key: 'description', label: 'បរិយាយ' },
        { key: 'action', label: 'សកម្មភាព' },
        { key: 'date', label: 'កាលបរិច្ឆេទ', render: (item) => item.date ? new Date(item.date).toLocaleDateString() : '--' },
        { key: 'status', label: 'ស្ថានភាព', render: (item) => <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLOR[item.status] || ''}`}>{STATUS_LABELS[item.status]}</span> },
        { key: 'actions', label: 'សកម្មភាព', render: (item) => <div className="flex space-x-3"><button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button><button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button></div> },
    ];

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={7} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">កំណត់ត្រាវិន័យ</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {user?.role === 'superadmin' && (
                        <div><label className="block text-sm font-medium mb-1">សាលារៀន</label><select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="w-full p-2 border rounded"><option value="">ទាំងអស់</option>{schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}</select></div>
                    )}
                    <div><label className="block text-sm font-medium mb-1">ថ្នាក់</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border rounded" disabled={!schoolId}><option value="">ទាំងអស់</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1">ស្ថានភាព</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2 border rounded"><option value="">ទាំងអស់</option><option value="open">បើក</option><option value="resolved">ដោះស្រាយរួច</option><option value="dismissed">បោះបង់</option></select></div>
                    <div className="flex items-end"><button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><FaPlus /> បន្ថែម</button></div>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md"><GenericTable columns={columns} data={items} fileName="DisciplineRecords" /></div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">{editItem ? 'កែសម្រួល' : 'បន្ថែម'} កំណត់ត្រាវិន័យ</h2><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="block text-sm font-medium mb-1">ជ្រើសរើសថ្នាក់</label><select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border rounded"><option value="">--</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">សិស្ស *</label><select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="w-full p-2 border rounded" required><option value="">-- ជ្រើសរើស --</option>{students.map(s => <option key={s._id} value={s._id}>{s.fullNameKh} ({s.studentId})</option>)}</select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">ប្រភេទ *</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded">{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                                <div><label className="block text-sm font-medium mb-1">កាលបរិច្ឆេទ</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border rounded" /></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">បរិយាយ *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={2} required /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">សកម្មភាព</label><input type="text" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} className="w-full p-2 border rounded" placeholder="ឧ. ព្រមាន" /></div>
                                <div><label className="block text-sm font-medium mb-1">ស្ថានភាព</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2 border rounded">{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                            </div>
                            <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editItem ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែម'}</button><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisciplineRecords;
