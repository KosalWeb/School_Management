import React, { useState, useEffect } from 'react';
import GenericTable from './common/GenericTable';
import GenericForm from './common/GenericForm';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

const FeeTypes = () => {
    const { user } = useAuth();
    const [feeTypes, setFeeTypes] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editItem, setEditItem] = useState(null);
    const [selectedSchool, setSelectedSchool] = useState('');

    useEffect(() => {
        if (user?.role === 'superadmin') {
            api.get('/schools').then(({ data }) => setSchools(data)).catch(() => {});
        }
    }, [user]);

    const fetchFeeTypes = async () => {
        try {
            setIsLoading(true);
            const params = selectedSchool ? { school: selectedSchool } : {};
            const { data } = await api.get('/fee-types', { params });
            setFeeTypes(data);
        } catch {
            showErrorToast('មិនអាចទាញយកទិន្នន័យបានទេ');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchFeeTypes(); }, [selectedSchool]);

    const handleSubmit = async (formData) => {
        if (!formData.name || !formData.amount) {
            showErrorToast('សូមបំពេញព័ត៌មានទាំងអស់');
            return;
        }
        const payload = { ...formData, amount: Number(formData.amount) };
        if (user?.role === 'superadmin' && selectedSchool) payload.school = selectedSchool;
        try {
            if (editItem) {
                await api.put(`/fee-types/${editItem._id}`, payload);
                showSuccessToast('បានកែសម្រួលប្រភេទថ្លៃ');
            } else {
                await api.post('/fee-types', payload);
                showSuccessToast('បានបន្ថែមប្រភេទថ្លៃ');
            }
            setEditItem(null);
            fetchFeeTypes();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'ប្រតិបត្តិការបរាជ័យ');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'លុបប្រភេទថ្លៃនេះ?',
            onConfirm: async () => {
                try {
                    await api.delete(`/fee-types/${id}`);
                    showSuccessToast('បានលុបដោយជោគជ័យ');
                    fetchFeeTypes();
                } catch {
                    showErrorToast('មិនអាចលុបបានទេ');
                }
            },
        });
    };

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'name', label: 'ឈ្មោះ' },
        { key: 'amount', label: 'ចំនួនទឹកប្រាក់', render: (item) => `${item.amount?.toLocaleString()} រៀល` },
        { key: 'school', label: 'សាលា', render: (item) => item.school?.schoolName || '--' },
        {
            key: 'actions', label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-3">
                    <button onClick={() => setEditItem(item)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </div>
            )
        },
    ];

    const formFields = [
        { name: 'name', label: 'ឈ្មោះប្រភេទថ្លៃ', required: true, placeholder: 'ឧ. ថ្លៃសាលា' },
        { name: 'amount', label: 'ចំនួនទឹកប្រាក់ (រៀល)', required: true, type: 'number', placeholder: 'ឧ. 500000' },
    ];

    if (isLoading) return <div className="p-4"><TableSkeleton rows={5} columns={4} /></div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">គ្រប់គ្រងប្រភេទថ្លៃ</h1>

            {user?.role === 'superadmin' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">តម្រងតាមសាលា</label>
                    <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="p-2 border rounded w-full max-w-xs">
                        <option value="">ទាំងអស់</option>
                        {schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}
                    </select>
                </div>
            )}

            <GenericForm
                fields={formFields}
                initialData={editItem || { name: '', amount: '' }}
                onSubmit={handleSubmit}
                buttonText={editItem ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមប្រភេទថ្លៃ'}
            />

            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                <GenericTable columns={columns} data={feeTypes} fileName="FeeTypes" />
            </div>
        </div>
    );
};

export default FeeTypes;
