import React, { useState, useEffect } from 'react';
import GenericTable from './common/GenericTable';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaStar } from 'react-icons/fa';

const CRITERIA = [
    { key: 'teaching', label: 'ការបង្រៀន' },
    { key: 'discipline', label: 'វិន័យ' },
    { key: 'punctuality', label: 'ពេលវេលា' },
    { key: 'preparation', label: 'ការរៀបចំ' },
    { key: 'communication', label: 'ទំនាក់ទំនង' },
];

const TeacherEvaluation = () => {
    const [items, setItems] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ teacher: '', teaching: 0, discipline: 0, punctuality: 0, preparation: 0, communication: 0, comments: '', status: 'submitted' });

    useEffect(() => { api.get('/teachers').then(({ data }) => setTeachers(data)).catch(() => {}); }, []);

    const fetch = async () => {
        try { setIsLoading(true); const { data } = await api.get('/teacher-evaluations'); setItems(data); }
        catch { showErrorToast('Failed'); } finally { setIsLoading(false); }
    };
    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setEditItem(null); setForm({ teacher: '', teaching: 0, discipline: 0, punctuality: 0, preparation: 0, communication: 0, comments: '', status: 'submitted' }); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ teacher: item.teacher?._id || '', teaching: item.criteria?.teaching || 0, discipline: item.criteria?.discipline || 0, punctuality: item.criteria?.punctuality || 0, preparation: item.criteria?.preparation || 0, communication: item.criteria?.communication || 0, comments: item.comments || '', status: item.status }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.teacher) { showErrorToast('Please select a teacher'); return; }
        const payload = { teacher: form.teacher, criteria: { teaching: Number(form.teaching), discipline: Number(form.discipline), punctuality: Number(form.punctuality), preparation: Number(form.preparation), communication: Number(form.communication) }, comments: form.comments, status: form.status };
        try {
            if (editItem) { await api.put(`/teacher-evaluations/${editItem._id}`, payload); showSuccessToast('Updated'); }
            else { await api.post('/teacher-evaluations', payload); showSuccessToast('Created'); }
            setShowModal(false); fetch();
        } catch (error) { showErrorToast(error.response?.data?.message || 'Failed'); }
    };

    const handleDelete = (id) => { showConfirmDialog({ title: 'Delete?', onConfirm: async () => { try { await api.delete(`/teacher-evaluations/${id}`); showSuccessToast('Deleted'); fetch(); } catch { showErrorToast('Failed'); } } }); };

    const avg = (item) => { const c = item.criteria; if (!c) return 0; return ((c.teaching + c.discipline + c.punctuality + c.preparation + c.communication) / 5).toFixed(1); };

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'teacher', label: 'គ្រូ', render: (item) => item.teacher?.fullNameKh || '--' },
        { key: 'avg', label: 'មធ្យម', render: (item) => <span className="font-bold text-blue-600">{avg(item)}/10</span> },
        { key: 'status', label: 'ស្ថានភាព', render: (item) => <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'submitted' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>{item.status === 'submitted' ? 'ដាក់ស្នើ' : 'សេចក្តីព្រាង'}</span> },
        { key: 'date', label: 'ថ្ងៃ', render: (item) => item.date ? new Date(item.date).toLocaleDateString() : '--' },
        { key: 'actions', label: 'សកម្មភាព', render: (item) => <div className="flex space-x-3"><button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button><button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button></div> },
    ];

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={6} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">វាយតម្លៃគ្រូបង្រៀន</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><FaPlus /> វាយតម្លៃថ្មី</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md"><GenericTable columns={columns} data={items} /></div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">{editItem ? 'កែសម្រួល' : 'វាយតម្លៃ'} គ្រូ</h2><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="block text-sm font-medium mb-1">គ្រូ *</label><select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} className="w-full p-2 border rounded" required><option value="">--</option>{teachers.map(t => <option key={t._id} value={t._id}>{t.fullNameKh}</option>)}</select></div>
                            {CRITERIA.map(c => (
                                <div key={c.key}>
                                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><FaStar className="text-yellow-400" size={12} /> {c.label} (0-10)</label>
                                    <input type="number" min="0" max="10" step="0.5" value={form[c.key]} onChange={e => setForm({ ...form, [c.key]: e.target.value })} className="w-full p-2 border rounded" />
                                </div>
                            ))}
                            <div><label className="block text-sm font-medium mb-1">មតិយោបល់</label><textarea value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} className="w-full p-2 border rounded" rows={2} /></div>
                            <div><label className="block text-sm font-medium mb-1">ស្ថានភាព</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2 border rounded"><option value="draft">សេចក្តីព្រាង</option><option value="submitted">ដាក់ស្នើ</option></select></div>
                            <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editItem ? 'ធ្វើបច្ចុប្បន្នភាព' : 'រក្សាទុក'}</button><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherEvaluation;
