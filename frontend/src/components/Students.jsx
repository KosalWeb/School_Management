import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { formatDateDisplay } from '../utils/date';
import GenericTable from './common/GenericTable';
import GenericForm from './common/GenericForm';
import { TableSkeleton } from './common/Skeleton';
import Badge from './common/Badge';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Students = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');

    const [selectedSchool, setSelectedSchool] = useState(schoolId || '');
    const [selectedClass, setSelectedClass] = useState(classId || '');

    const canModify = useMemo(() =>
        ['superadmin', 'school-admin', 'teacher', 'data-entry'].includes(user.role),
        [user.role]
    );

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [schoolsRes, classesRes] = await Promise.all([
                    api.get('/schools'),
                    api.get('/classes')
                ]);
                setSchools(schoolsRes.data);
                setClasses(classesRes.data);
            } catch (error) {
                showErrorToast('Could not load filter data.');
            }
        };
        fetchFilterData();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        setHasSearched(true);
        try {
            const params = new URLSearchParams();
            if (selectedSchool) params.append('school', selectedSchool);
            if (selectedClass) params.append('class', selectedClass);

            const { data } = await api.get(`/students?${params.toString()}`);
            setStudents(data);
        } catch (error) {
            setStudents([]);
            showErrorToast('Could not fetch students.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editStudent) {
                await api.put(`/students/${editStudent._id}`, formData);
                showSuccessToast('Student updated successfully!');
            } else {
                await api.post('/students', formData);
                showSuccessToast('Student added successfully!');
            }
            setEditStudent(null);
            fetchStudents();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Operation failed.');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'Delete Student?',
            onConfirm: async () => {
                try {
                    await api.delete(`/students/${id}`);
                    showSuccessToast('Student deleted successfully!');
                    fetchStudents();
                } catch (error) {
                    showErrorToast('Could not delete student.');
                }
            },
        });
    };

    const filteredClasses = useMemo(() => {
        if (!selectedSchool) return classes;
        return classes.filter(c => c.school?._id === selectedSchool);
    }, [selectedSchool, classes]);

    const formFields = useMemo(() => [
        { name: 'studentId', label: 'លេខសម្គាល់សិស្ស', required: true },
        { name: 'fullNameKh', label: 'ឈ្មោះពេញ (ខ្មែរ)', required: true },
        { name: 'fullNameEn', label: 'ឈ្មោះពេញ (ឡាតាំង)', required: true },
        {
            name: 'class',
            label: 'ថ្នាក់រៀន',
            type: 'select',
            required: true,
            options: classes.map(c => ({
                value: c._id,
                label: `${[c.school?.schoolLevel, c.school?.schoolName].filter(Boolean).join(' - ')} / ${c.className}`
            })).sort((a, b) => a.label.localeCompare(b.label)),
            placeholder: 'ជ្រើសរើសថ្នាក់រៀន'
        },
        { name: 'gender', type: 'select', label: 'ភេទ', options: [{ value: 'ប្រុស', label: 'ប្រុស' }, { value: 'ស្រី', label: 'ស្រី' }], required: true },
        { name: 'dob', label: 'ថ្ងៃខែឆ្នាំកំណើត', type: 'date' },
        { name: 'phone', label: 'លេខទូរស័ព្ទ' },
    ], [classes]);

    const columns = useMemo(() => [
        { key: 'index', label: 'ល.រ' },
        { key: 'studentId', label: 'លេខសម្គាល់សិស្ស' },
        { key: 'fullNameKh', label: 'ឈ្មោះពេញ (ខ្មែរ)' },
        { key: 'gender', label: 'ភេទ', render: (item) => <Badge value={item.gender === 'ប្រុស' ? 'ប្រុស' : 'ស្រី'} color={item.gender === 'ប្រុស' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'} /> },
        { key: 'dob', label: 'ថ្ងៃខែឆ្នាំកំណើត', render: (item) => formatDateDisplay(item.dob) },
        { key: 'class.className', label: 'ថ្នាក់រៀន' },
        {
            key: 'actions', label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-3">
                    {canModify && (
                        <>
                            <button onClick={() => setEditStudent(item)} className="text-blue-500 hover:text-blue-700" title="កែសម្រួល"><FaEdit /></button>
                            <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700" title="លុប"><FaTrash /></button>
                        </>
                    )}
                </div>
            )
        }
    ], [canModify]);

    const handleSchoolFilterChange = (e) => {
        const newSchoolId = e.target.value;
        setSelectedSchool(newSchoolId);
        setSelectedClass('');
        navigate(newSchoolId ? `/students?schoolId=${newSchoolId}` : '/students');
    };

    const initialData = { studentId: '', fullNameKh: '', fullNameEn: '', class: selectedClass || '', gender: '', dob: '', phone: '' };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">គ្រប់គ្រងសិស្ស</h1>
            {canModify && (
                <GenericForm
                    key={editStudent ? editStudent._id : 'new-student'}
                    fields={formFields}
                    initialData={editStudent ? { ...editStudent, class: editStudent.class?._id, dob: editStudent.dob ? new Date(editStudent.dob).toISOString().substring(0, 10) : '' } : initialData}
                    onSubmit={handleFormSubmit}
                    buttonText={editStudent ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមសិស្ស'}
                    onCancel={() => setEditStudent(null)}
                />
            )}
            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className='flex-1'>
                        <label htmlFor="schoolFilter" className="block text-sm font-medium text-gray-700">ជ្រើសរើសសាលា</label>
                        <select
                            id="schoolFilter"
                            value={selectedSchool}
                            onChange={handleSchoolFilterChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">សាលាទាំងអស់</option>
                            {schools.map(school => (
                                <option key={school._id} value={school._id}>
                                    {school.schoolLevel} - {school.schoolName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex-1'>
                        <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">ជ្រើសរើសថ្នាក់</label>
                        <select
                            id="classFilter"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            disabled={!selectedSchool && user.role !== 'teacher'}
                        >
                            <option value="">ថ្នាក់ទាំងអស់</option>
                            {filteredClasses.map(c => (
                                <option key={c._id} value={c._id}>{c.className}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchStudents}
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
                    <TableSkeleton rows={5} columns={8} />
                ) : (
                    <GenericTable columns={columns} data={students} />
                )}
            </div>
        </div>
    );
};

export default Students;