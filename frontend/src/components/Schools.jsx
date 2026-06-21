import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GenericTable from './common/GenericTable';
import GenericForm from './common/GenericForm';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Schools = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editSchool, setEditSchool] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState('');
    const navigate = useNavigate();

    const fetchSchools = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/schools');
            const sortedSchools = data.sort((a, b) => {
                const aName = [a.schoolLevel, a.schoolName].filter(Boolean).join(' - ');
                const bName = [b.schoolLevel, b.schoolName].filter(Boolean).join(' - ');
                return aName.localeCompare(bName);
            });
            setSchools(sortedSchools);
        } catch (error) {
            showErrorToast('Could not fetch schools.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSchools(); }, []);

    const handleFormSubmit = async (formData) => {
        try {
            if (editSchool) {
                await api.put(`/schools/${editSchool._id}`, formData);
                showSuccessToast('School updated successfully!');
            } else {
                await api.post('/schools', formData);
                showSuccessToast('School added successfully!');
            }
            setEditSchool(null);
            fetchSchools();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Operation failed.');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'Delete this school?',
            onConfirm: async () => {
                try {
                    await api.delete(`/schools/${id}`);
                    showSuccessToast('School deleted successfully!');
                    fetchSchools();
                } catch (error) {
                    showErrorToast('Could not delete school.');
                }
            },
        });
    };

    const filteredSchools = useMemo(() => {
        if (!selectedLevel) return schools;
        return schools.filter(s => s.schoolLevel === selectedLevel);
    }, [selectedLevel, schools]);

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'schoolCode', label: 'កូដសាលា' },
        {
            key: 'schoolName',
            label: 'ឈ្មោះសាលា',
            render: (item) => [item.schoolLevel, item.schoolName].filter(Boolean).join(' - ')
        },
        { key: 'teacherCount', label: 'ចំនួនគ្រូ' },
        { key: 'classCount', label: 'ចំនួនថ្នាក់' },
        {
            key: 'studentCount',
            label: 'ចំនួនសិស្ស/ស្រី',
            render: (item) => `${item.studentCountTotal || 0} / ${item.studentCountFemale || 0}`
        },
        {
            key: 'actions',
            label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-4">
                    <button
                        onClick={() => navigate(`/teachers?schoolId=${item._id}`)}
                        className="text-green-500 hover:text-green-700"
                        title="មើលបញ្ជីគ្រូបង្រៀន"
                    >
                        គ្រូ
                    </button>
                    <button
                        onClick={() => navigate(`/classes?schoolId=${item._id}`)}
                        className="text-purple-500 hover:text-purple-700"
                        title="មើលបញ្ជីថ្នាក់រៀន"
                    >
                        ថ្នាក់
                    </button>
                    <button
                        onClick={() => navigate(`/students?schoolId=${item._id}`)}
                        className="text-cyan-500 hover:text-cyan-700"
                        title="មើលបញ្ជីសិស្ស"
                    >
                        សិស្ស
                    </button>
                    {user.role === 'superadmin' && (
                        <>
                            <button onClick={() => setEditSchool(item)} className="text-blue-500 hover:text-blue-700" title="កែសម្រួល"><FaEdit /></button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700" title="លុប"><FaTrash /></button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const formFields = [
        { name: 'schoolCode', label: 'កូដសាលា', required: true },
        {
            name: 'schoolLevel',
            label: 'កម្រិតសាលា',
            type: 'select',
            required: true,
            options: [
                { value: 'វិទ្យាល័យ', label: 'វិទ្យាល័យ' },
                { value: 'អនុវិទ្យាល័យ', label: 'អនុវិទ្យាល័យ' },
                { value: 'បឋមសិក្សា', label: 'បឋមសិក្សា' },
            ]
        },
        { name: 'schoolName', label: 'ឈ្មោះសាលា', required: true },
    ];

    if (isLoading) { return <div className="p-4"><TableSkeleton rows={5} columns={7} /></div>; }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">គ្រប់គ្រងឈ្មោះសាលា</h1>
            {user.role === 'superadmin' && (
                <GenericForm
                    fields={formFields}
                    initialData={editSchool || { schoolCode: '', schoolName: '', schoolLevel: '' }}
                    onSubmit={handleFormSubmit}
                    buttonText={editSchool ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមសាលា'}
                />
            )}
            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className='flex-1'>
                        <label htmlFor="levelFilter">ជ្រើសរើសកម្រិតសាលា</label>
                        <select
                            id="levelFilter"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">កម្រិតសាលាទាំងអស់</option>
                            <option value="វិទ្យាល័យ">វិទ្យាល័យ</option>
                            <option value="អនុវិទ្យាល័យ">អនុវិទ្យាល័យ</option>
                            <option value="បឋមសិក្សា">បឋមសិក្សា</option>
                        </select>
                    </div>
                </div>
                <GenericTable columns={columns} data={filteredSchools} />
            </div>
        </div>
    );
};

export default Schools;