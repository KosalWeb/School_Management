import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FiPlus, FiEdit, FiTrash2, FiAlertTriangle, FiDatabase } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../context/AuthContext';

// A reusable component to manage a list
const ListItemManager = ({ title, type }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/list-items?type=${type}`);
            setItems(data);
        } catch (error) {
            showErrorToast(`Error fetching ${type}s`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, [type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue) return;

        const action = editingItem
            ? api.put(`/list-items/${editingItem._id}`, { name: inputValue })
            : api.post('/list-items', { name: inputValue, type });

        try {
            await action;
            showSuccessToast(`Successfully ${editingItem ? 'updated' : 'added'} ${type}!`);
            setInputValue('');
            setEditingItem(null);
            fetchItems();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'An error occurred.');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: `Delete this ${type}?`,
            onConfirm: async () => {
                try {
                    await api.delete(`/list-items/${id}`);
                    showSuccessToast('Deleted successfully!');
                    fetchItems();
                } catch (error) {
                    showErrorToast('Could not delete.');
                }
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Add new ${type}...`}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    {editingItem ? 'Update' : <FiPlus />}
                </button>
            </form>
            {loading ? <div className="text-center"><ClipLoader size={30} /></div> : (
                <ul className="space-y-2">
                    {items.map(item => (
                        <li key={item._id} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{item.name}</span>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingItem(item); setInputValue(item.name); }} className="text-blue-600"><FiEdit /></button>
                                <button onClick={() => handleDelete(item._id)} className="text-red-600"><FiTrash2 /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const SettingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deleting, setDeleting] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const handleDeleteAll = () => {
        showConfirmDialog({
            title: 'លុបទិន្នន័យទាំងអស់?',
            text: 'ទិន្នន័យសាលា គ្រូ សិស្ស ថ្នាក់ និងវត្តមានទាំងអស់នឹងត្រូវលុប។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ!',
            onConfirm: async () => {
                try {
                    setDeleting(true);
                    await api.delete('/destroy/all');
                    showSuccessToast('លុបទិន្នន័យទាំងអស់ដោយជោគជ័យ!');
                    navigate('/');
                } catch (error) {
                    showErrorToast(error.response?.data?.message || 'មានបញ្ហាក្នុងការលុបទិន្នន័យ');
                } finally {
                    setDeleting(false);
                }
            },
        });
    };

    const handleSeedData = () => {
        showConfirmDialog({
            title: 'បន្ថែមទិន្នន័យគំរូ?',
            text: 'ទិន្នន័យសាលា គ្រូ សិស្ស ថ្នាក់ មុខវិជ្ជា និងវត្តមានគំរូនឹងត្រូវបានបន្ថែម។ ទិន្នន័យដែលមានស្រាប់នឹងត្រូវលុបចោលជាមុនសិន!',
            onConfirm: async () => {
                try {
                    setSeeding(true);
                    await api.post('/seed/all');
                    showSuccessToast('បន្ថែមទិន្នន័យគំរូដោយជោគជ័យ!');
                    navigate('/');
                } catch (error) {
                    showErrorToast(error.response?.data?.message || 'មានបញ្ហាក្នុងការបន្ថែមទិន្នន័យ');
                } finally {
                    setSeeding(false);
                }
            },
        });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">ការកំណត់ទូទៅ</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <ListItemManager title="ក្របខណ្ឌ" type="framework" />
                <ListItemManager title="មុខតំណែង" type="position" />
                <ListItemManager title="អង្គភាព" type="organization" />
            </div>

            {user?.role === 'superadmin' && (
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-green-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FiDatabase className="text-green-600 text-2xl" />
                            <h2 className="text-xl font-bold text-green-700">ទិន្នន័យគំរូ</h2>
                        </div>
                        <p className="text-gray-600 mb-4">បន្ថែមទិន្នន័យគំរូ (សាលា ៣ គ្រូ ៨ សិស្ស ៣០០ ថ្នាក់ ១៦ មុខវិជ្ជា ៨ និងវត្តមាន ៥ថ្ងៃ) ទៅក្នុងប្រព័ន្ធ។</p>
                        <button
                            onClick={handleSeedData}
                            disabled={seeding}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {seeding ? <ClipLoader size={18} color="#fff" /> : <FiDatabase />}
                            {seeding ? 'កំពុងបន្ថែម...' : 'បន្ថែមទិន្នន័យគំរូ'}
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-red-200">
                        <div className="flex items-center gap-3 mb-4">
                            <FiAlertTriangle className="text-red-600 text-2xl" />
                            <h2 className="text-xl font-bold text-red-700">តំបន់គ្រោះថ្នាក់</h2>
                        </div>
                        <p className="text-gray-600 mb-4">លុបទិន្នន័យសាលា គ្រូ សិស្ស ថ្នាក់ មុខវិជ្ជា និងវត្តមានទាំងអស់ចេញពីប្រព័ន្ធ។</p>
                        <button
                            onClick={handleDeleteAll}
                            disabled={deleting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {deleting ? <ClipLoader size={18} color="#fff" /> : <FiTrash2 />}
                            {deleting ? 'កំពុងលុប...' : 'លុបទិន្នន័យទាំងអស់'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;