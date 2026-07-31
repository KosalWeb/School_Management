import React, { useState, useEffect, useCallback } from 'react';
import GenericTable from './common/GenericTable';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';

const STATUS_MAP = { unpaid: 'មិនទាន់បង់', paid: 'បង់រួច', partial: 'បង់ខ្លះ', overdue: 'ហួសកាលកំណត់' };
const STATUS_COLOR = { unpaid: 'text-yellow-600 bg-yellow-50', paid: 'text-green-600 bg-green-50', partial: 'text-blue-600 bg-blue-50', overdue: 'text-red-600 bg-red-50' };

const FeePayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [feeTypes, setFeeTypes] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ student: '', feeType: '', amount: '', dueDate: '', paidDate: '', paidAmount: '0', status: 'unpaid', receiptNumber: '', note: '' });

    const [filterSchool, setFilterSchool] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        if (user?.role === 'superadmin') {
            api.get('/schools').then(({ data }) => setSchools(data)).catch(() => {});
        }
    }, [user]);

    useEffect(() => {
        api.get('/classes').then(({ data }) => setClasses(data)).catch(() => {});
        api.get('/fee-types').then(({ data }) => setFeeTypes(data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (filterClass) {
            api.get('/students', { params: { class: filterClass } }).then(({ data }) => setStudents(data)).catch(() => {});
        } else {
            setStudents([]);
        }
    }, [filterClass]);

    const fetchPayments = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (filterSchool) params.school = filterSchool;
            if (filterClass) params.class = filterClass;
            if (filterStatus) params.status = filterStatus;
            const { data } = await api.get('/fee-payments', { params });
            setPayments(data);
        } catch {
            showErrorToast('មិនអាចទាញយកទិន្នន័យបានទេ');
        } finally {
            setIsLoading(false);
        }
    }, [filterSchool, filterClass, filterStatus]);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    const openAdd = () => {
        setEditItem(null);
        setForm({ student: '', feeType: '', amount: '', dueDate: '', paidDate: '', paidAmount: '0', status: 'unpaid', receiptNumber: '', note: '' });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            student: item.student?._id || '',
            feeType: item.feeType?._id || '',
            amount: item.amount.toString(),
            dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
            paidDate: item.paidDate ? item.paidDate.split('T')[0] : '',
            paidAmount: (item.paidAmount || 0).toString(),
            status: item.status,
            receiptNumber: item.receiptNumber || '',
            note: item.note || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.student || !form.feeType || !form.amount || !form.dueDate) {
            showErrorToast('សូមបំពេញព័ត៌មានសំខាន់ៗ');
            return;
        }
        const payload = { ...form, amount: Number(form.amount), paidAmount: Number(form.paidAmount) || 0 };
        if (user?.role === 'superadmin' && filterSchool) payload.school = filterSchool;
        try {
            if (editItem) {
                await api.put(`/fee-payments/${editItem._id}`, payload);
                showSuccessToast('បានកែសម្រួល');
            } else {
                await api.post('/fee-payments', payload);
                showSuccessToast('បានបន្ថែម');
            }
            setShowModal(false);
            fetchPayments();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'ប្រតិបត្តិការបរាជ័យ');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'លុបការបង់ប្រាក់នេះ?',
            onConfirm: async () => {
                try {
                    await api.delete(`/fee-payments/${id}`);
                    showSuccessToast('បានលុបដោយជោគជ័យ');
                    fetchPayments();
                } catch {
                    showErrorToast('មិនអាចលុបបានទេ');
                }
            },
        });
    };

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'student', label: 'សិស្ស', render: (item) => item.student?.fullNameKh || '--' },
        { key: 'feeType', label: 'ប្រភេទថ្លៃ', render: (item) => item.feeType?.name || '--' },
        { key: 'amount', label: 'ចំនួន', render: (item) => `${item.amount?.toLocaleString()} រៀល` },
        { key: 'paidAmount', label: 'បង់រួច', render: (item) => `${(item.paidAmount || 0)?.toLocaleString()} រៀល` },
        {
            key: 'status', label: 'ស្ថានភាព',
            render: (item) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLOR[item.status] || 'text-gray-600 bg-gray-50'}`}>
                    {STATUS_MAP[item.status] || item.status}
                </span>
            )
        },
        { key: 'dueDate', label: 'ថ្ងៃផុតកំណត់', render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '--' },
        { key: 'paidDate', label: 'ថ្ងៃបង់ប្រាក់', render: (item) => item.paidDate ? new Date(item.paidDate).toLocaleDateString() : '--' },
        {
            key: 'actions', label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-3">
                    <button onClick={() => openEdit(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </div>
            )
        },
    ];

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={8} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">គ្រប់គ្រងការបង់ប្រាក់</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {user?.role === 'superadmin' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">សាលា</label>
                            <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)} className="w-full p-2 border rounded">
                                <option value="">ទាំងអស់</option>
                                {schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">ថ្នាក់</label>
                        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">ទាំងអស់</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ស្ថានភាព</label>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">ទាំងអស់</option>
                            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <FaPlus /> បន្ថែមការបង់ប្រាក់
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <GenericTable columns={columns} data={payments} />
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{editItem ? 'កែសម្រួល' : 'បន្ថែមការបង់ប្រាក់'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">សិស្ស *</label>
                                <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="w-full p-2 border rounded" required>
                                    <option value="">-- ជ្រើសរើស --</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.fullNameKh} ({s.studentId})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ប្រភេទថ្លៃ *</label>
                                <select value={form.feeType} onChange={e => {
                                    const ft = feeTypes.find(f => f._id === e.target.value);
                                    setForm({ ...form, feeType: e.target.value, amount: ft ? ft.amount.toString() : '' });
                                }} className="w-full p-2 border rounded" required>
                                    <option value="">-- ជ្រើសរើស --</option>
                                    {feeTypes.map(f => <option key={f._id} value={f._id}>{f.name} ({f.amount?.toLocaleString()} រៀល)</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">ចំនួនទឹកប្រាក់ *</label>
                                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">ថ្ងៃផុតកំណត់ *</label>
                                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full p-2 border rounded" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ស្ថានភាព *</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2 border rounded">
                                    {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            {form.status !== 'unpaid' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ថ្ងៃបង់ប្រាក់</label>
                                        <input type="date" value={form.paidDate} onChange={e => setForm({ ...form, paidDate: e.target.value })} className="w-full p-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">ចំនួនបង់ប្រាក់</label>
                                        <input type="number" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} className="w-full p-2 border rounded" />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">លេខបង្កាន់ដៃ</label>
                                    <input type="text" value={form.receiptNumber} onChange={e => setForm({ ...form, receiptNumber: e.target.value })} className="w-full p-2 border rounded" placeholder="ឧ. REC-001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">កំណត់ចំណាំ</label>
                                    <input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full p-2 border rounded" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                                    {editItem ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែម'}
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

export default FeePayments;
