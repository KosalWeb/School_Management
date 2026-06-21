import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GenericTable from './common/GenericTable';
import GenericForm from './common/GenericForm';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Classes = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editClass, setEditClass] = useState(null);
    const [schools, setSchools] = useState([]);
    const [pageTitle, setPageTitle] = useState('គ្រប់គ្រងថ្នាក់រៀន');
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedSchool, setSelectedSchool] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const schoolIdFromUrl = searchParams.get('schoolId');

    const canModify = user.role === 'superadmin' || user.role === 'school-admin';

    useEffect(() => {
        api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (schoolIdFromUrl) setSelectedSchool(schoolIdFromUrl);
    }, [schoolIdFromUrl]);

    const fetchClassesAndSchools = async () => {
        try {
            setIsLoading(true);
            setHasSearched(true);
            const classUrl = schoolIdFromUrl ? `/classes?school=${schoolIdFromUrl}` : '/classes';

            const [classesRes, schoolsRes] = await Promise.all([
                api.get(classUrl),
                api.get('/schools')
            ]);

            setClasses(classesRes.data);
            setSchools(schoolsRes.data);

            if (schoolIdFromUrl) {
                const school = schoolsRes.data.find(s => s._id === schoolIdFromUrl);
                setPageTitle(school ? `បញ្ជីថ្នាក់រៀន: ${school.schoolName}` : 'បញ្ជីថ្នាក់រៀន');
            } else {
                setPageTitle('គ្រប់គ្រងថ្នាក់រៀន');
            }
        } catch (error) {
            showErrorToast('Could not fetch data.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClasses = useMemo(() => {
        if (!selectedSchool) return classes;
        return classes.filter(c => c.school?._id === selectedSchool);
    }, [selectedSchool, classes]);

    const handleSearch = () => fetchClassesAndSchools();

    const handleSchoolFilterChange = (e) => {
        const val = e.target.value;
        setSelectedSchool(val);
        if (val) {
            navigate(`/classes?schoolId=${val}`, { replace: true });
        } else {
            navigate('/classes', { replace: true });
        }
    };

    const handleFormSubmit = async (formData) => {
        if (!formData.classCode || !formData.gradeLevel || !formData.roomNumber || !formData.school) {
            showErrorToast('Please fill all required fields.');
            return;
        }
        try {
            if (editClass) {
                await api.put(`/classes/${editClass._id}`, formData);
                showSuccessToast('Class updated successfully!');
            } else {
                await api.post('/classes', formData);
                showSuccessToast('Class added successfully!');
            }
            setEditClass(null);
            fetchClassesAndSchools();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Operation failed.');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'Delete this class?',
            onConfirm: async () => {
                try {
                    await api.delete(`/classes/${id}`);
                    showSuccessToast('Class deleted!');
                    fetchClassesAndSchools();
                } catch (error) {
                    showErrorToast('Could not delete class.');
                }
            },
        });
    };

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'classCode', label: 'កូដថ្នាក់' },
        { key: 'className', label: 'ឈ្មោះថ្នាក់' },
        {
            key: 'school',
            label: 'សាលា',
            render: (item) => item.school ? [item.school.schoolLevel, item.school.schoolName].filter(Boolean).join(' - ') : 'N/A'
        },
        { key: 'gradeLevel', label: 'កម្រិតថ្នាក់' },
        {
            key: 'studentCount',
            label: 'ចំនួនសិស្ស/ស្រី',
            render: (item) => `${item.studentCountTotal || 0}/${item.studentCountFemale || 0}`
        },
        {
            key: 'actions',
            label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-3">
                    <button onClick={() => navigate(`/students?classId=${item._id}`)} className="text-cyan-500 hover:text-cyan-700" title="មើលសិស្សក្នុងថ្នាក់នេះ">សិស្ស</button>
                    {canModify && (
                        <>
                            <button onClick={() => setEditClass(item)} className="text-blue-500 hover:text-blue-700" title="កែសម្រួល"><FaEdit /></button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700" title="លុប"><FaTrash /></button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const formFields = useMemo(() => [
        {
            name: 'school',
            label: 'សាលា',
            type: 'select',
            required: true,
            options: schools
                .map(s => ({ value: s._id, label: [s.schoolLevel, s.schoolName].filter(Boolean).join(' - ') }))
                .sort((a, b) => a.label.localeCompare(b.label)),
            placeholder: 'ជ្រើសរើសសាលា',
            disabled: user.role === 'school-admin',
        },
        { name: 'classCode', label: 'កូដថ្នាក់', required: true, placeholder: 'ឧ. C12A1' },
        { name: 'gradeLevel', label: 'កម្រិតថ្នាក់', required: true, placeholder: 'ឧ. ថ្នាក់ទី១២' },
        { name: 'roomNumber', label: 'លេខបន្ទប់', required: true, placeholder: 'ឧ. A1' },
    ], [schools, user.role]);

    const initialDataForForm = useMemo(() => {
        if (editClass) {
            return { ...editClass, school: editClass.school?._id || '' };
        }
        const defaultSchool = user.role === 'school-admin' ? user.school : (schoolIdFromUrl || '');
        return { classCode: '', gradeLevel: '', roomNumber: '', school: defaultSchool };
    }, [editClass, schoolIdFromUrl, user.role, user.school]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                {schoolIdFromUrl && (
                    <button
                        onClick={() => navigate('/classes')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        បង្ហាញថ្នាក់ទាំងអស់
                    </button>
                )}
            </div>

            {canModify && (
                <GenericForm
                    key={editClass ? editClass._id : 'new-class-form'}
                    fields={formFields}
                    initialData={initialDataForForm}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setEditClass(null)}
                    buttonText={editClass ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមថ្នាក់'}
                />
            )}

            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className='flex-1'>
                        <label htmlFor="schoolFilter">ជ្រើសរើសសាលា</label>
                        <select
                            id="schoolFilter"
                            value={selectedSchool}
                            onChange={handleSchoolFilterChange}
                            className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                        >
                            <option value="">សាលាទាំងអស់</option>
                            {schools.map(school => (
                                <option key={school._id} value={school._id}>
                                    {[school.schoolLevel, school.schoolName].filter(Boolean).join(' - ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            ស្វែងរក
                        </button>
                    </div>
                </div>
                {!hasSearched ? (
                    <div className="text-center py-16 text-gray-500">
                        <p>សូមជ្រើសរើសសាលា និងចុច ស្វែងរក</p>
                    </div>
                ) : isLoading ? (
                    <TableSkeleton rows={5} columns={9} />
                ) : (
                    <GenericTable columns={columns} data={filteredClasses} />
                )}
            </div>
        </div>
    );
};

export default Classes;