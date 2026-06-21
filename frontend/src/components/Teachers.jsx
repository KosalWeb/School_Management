import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { formatDateDisplay } from '../utils/date';
import GenericTable from './common/GenericTable';
import { TableSkeleton } from './common/Skeleton';
import GenericForm from './common/GenericForm';
import Badge from './common/Badge';
import { FaEdit, FaTrash } from 'react-icons/fa';

// --- Assuming you have an authentication context like this ---
// import { useAuth } from '../context/AuthContext'; 

import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import communesData from '../data/communes.json';
import villagesData from '../data/villages.json';

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().substring(0, 10);
};



const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
};

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editTeacher, setEditTeacher] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [frameworks, setFrameworks] = useState([]);
    const [positions, setPositions] = useState([]);
    const [schools, setSchools] = useState([]);
    const [pageTitle, setPageTitle] = useState('គ្រប់គ្រងគ្រូបង្រៀន');

    // --- 1. Get user info from your authentication context ---
    // const { user } = useAuth(); 

    // --- FIX: Use useMemo to prevent re-creation on every render ---
    const user = useMemo(() => ({
        role: 'school-admin',
        school: '60d21b4667d0d8992e610c85'
    }), []); // Empty dependency array means this object is created only once.


    const [selectedSchool, setSelectedSchool] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const schoolId = searchParams.get('schoolId');

    useEffect(() => {
        setSelectedSchool(schoolId || '');
    }, [schoolId]);

    const handleSchoolFilterChange = (e) => {
        const val = e.target.value;
        setSelectedSchool(val);
        if (val) {
            navigate(`/teachers?schoolId=${val}`, { replace: true });
        } else {
            navigate('/teachers', { replace: true });
        }
    };

    const filteredTeachers = useMemo(() => {
        if (!selectedSchool) return teachers;
        return teachers.filter(t => t.organization?._id === selectedSchool);
    }, [selectedSchool, teachers]);

    const fetchData = async (isSearch = false) => {
        try {
            setIsLoading(true);
            if (isSearch) setHasSearched(true);

            const teacherUrl = schoolId ? `/teachers?organization=${schoolId}` : '/teachers';

            const [teachersRes, frameworksRes, positionsRes, schoolsRes] = await Promise.all([
                api.get(teacherUrl),
                api.get('/list-items?type=framework'),
                api.get('/list-items?type=position'),
                api.get('/schools')
            ]);

            const sortedTeachers = teachersRes.data.sort((a, b) => {
                const aName = a.organization ? `${a.organization.schoolLevel || ''} - ${a.organization.schoolName}` : '';
                const bName = b.organization ? `${b.organization.schoolLevel || ''} - ${b.organization.schoolName}` : '';
                return aName.localeCompare(bName);
            });

            setTeachers(sortedTeachers);
            setFrameworks(frameworksRes.data);
            setPositions(positionsRes.data);
            setSchools(schoolsRes.data);

            if (schoolId) {
                const school = schoolsRes.data.find(s => s._id === schoolId);
                setPageTitle(school ? `បញ្ជីគ្រូបង្រៀន: ${school.schoolName}` : 'បញ្ជីគ្រូបង្រៀន');
            } else if (user?.role === 'school-admin') {
                const userSchool = schoolsRes.data.find(s => s._id === user.school);
                setPageTitle(userSchool ? `បញ្ជីគ្រូបង្រៀន: ${userSchool.schoolName}` : 'បញ្ជីគ្រូបង្រៀន');
            }
            else {
                setPageTitle('គ្រប់គ្រងគ្រូបង្រៀន');
            }
        } catch (error) {
            // Check if the error is due to cancellation, and ignore it
            if (error.name !== 'CanceledError') {
                showErrorToast('Could not fetch data.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => fetchData(true);

    const handleFormSubmit = async (formData) => {
        try {
            const dataToSubmit = { ...formData };
            if (dataToSubmit.dob === '') delete dataToSubmit.dob;
            if (dataToSubmit.hireDate === '') delete dataToSubmit.hireDate;

            if (editTeacher) {
                await api.put(`/teachers/${editTeacher._id}`, dataToSubmit);
                showSuccessToast('Teacher updated successfully!');
            } else {
                await api.post('/teachers', dataToSubmit);
                showSuccessToast('Teacher added successfully!');
            }
            setEditTeacher(null);
            fetchData();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Operation failed.');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'Delete Teacher?',
            onConfirm: async () => {
                try {
                    await api.delete(`/teachers/${id}`);
                    showSuccessToast('Teacher deleted successfully!');
                    fetchData();
                } catch (error) {
                    showErrorToast('Could not delete teacher.');
                }
            },
        });
    };

    const getOptions = (dataObj, prefix = '', lengthDiff = 0) => {
        const data = dataObj.provinces || dataObj.districts || dataObj.communes || dataObj.villages || {};
        if (!prefix) {
            return Object.entries(data).map(([code, item]) => ({
                value: code,
                label: item.name?.km || item.name || code
            }));
        }
        return Object.entries(data)
            .filter(([code]) => code.startsWith(prefix) && code.length === prefix.length + lengthDiff)
            .map(([code, item]) => ({
                value: code,
                label: item.name?.km || item.name || code
            }));
    };

    const findCodeByName = (val, dataObj, len) => {
        if (!val || typeof val !== 'string') return val;
        if (val.length === len && !isNaN(val)) return val;
        const data = dataObj.provinces || dataObj.districts || dataObj.communes || dataObj.villages || {};
        const exact = Object.entries(data).find(([_, item]) => item.name?.km === val);
        if (exact) return exact[0];
        const fuzzy = Object.entries(data).find(([_, item]) => val.includes(item.name?.km) || item.name?.km?.includes(val));
        return fuzzy ? fuzzy[0] : val;
    };

    const getAddrPart = (val, dataObj, len) => {
        const data = dataObj.provinces || dataObj.districts || dataObj.communes || dataObj.villages || {};
        if (val && typeof val === 'string' && val.length === len && !isNaN(val)) {
            return data[val]?.name?.km || '';
        } else {
            return val || '';
        }
    };


    const initialData = {
        teacherId: '',
        fullNameKh: '',
        fullNameEn: '',
        gender: '',
        phone: '',
        dob: '',
        hireDate: '',
        profileImage: '',
        status: 'សកម្ម',
        address: { province: '', district: '', commune: '', village: '' },
        position: '',
        framework: '',
        organization: ''
    };

    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        let defaultOrganization = {};

        if (!editTeacher) {
            if (user?.role === 'school-admin') {
                defaultOrganization = { organization: user.school };
            } else if (schoolId) {
                defaultOrganization = { organization: schoolId };
            }
        }

        if (editTeacher) {
            let address = { ...initialData.address, ...(editTeacher.address || {}) };

            address.province = findCodeByName(address.province, provincesData, 2);
            address.district = findCodeByName(address.district, districtsData, 4);
            address.commune = findCodeByName(address.commune, communesData, 6);
            address.village = findCodeByName(address.village, villagesData, 8);

            setFormData({
                ...initialData,
                ...editTeacher,
                dob: formatDateForInput(editTeacher.dob),
                hireDate: formatDateForInput(editTeacher.hireDate),
                address,
                position: editTeacher.position?._id || '',
                framework: editTeacher.framework?._id || '',
                organization: editTeacher.organization?._id || '',
            });
        } else {
            setFormData({ ...initialData, ...defaultOrganization });
        }
    }, [editTeacher, schoolId, user]);


    const formFields = useMemo(() => {
        const fields = [
            { name: 'teacherId', label: 'អត្តលេខ', required: true },
            { name: 'fullNameKh', label: 'គោត្តនាម-នាម (ខ្មែរ)', required: true },
            { name: 'fullNameEn', label: 'Full Name (English)', required: true },
            { name: 'gender', label: 'ភេទ', type: 'select', required: true, options: [{ value: 'ប្រុស', label: 'ប្រុស' }, { value: 'ស្រី', label: 'ស្រី' }], placeholder: 'ជ្រើសរើសភេទ' },
            { name: 'dob', label: 'ថ្ងៃខែឆ្នាំកំណើត', type: 'date' },
            { name: 'hireDate', label: 'ថ្ងៃចូលបម្រើការ', type: 'date' },
            { name: 'phone', label: 'លេខទូរស័ព្ទ', required: true },
            { name: 'profileImage', label: 'Profile Image URL', type: 'text', placeholder: 'https://example.com/image.png' },
            { name: 'status', label: 'ស្ថានភាព', type: 'select', required: true, options: [{ value: 'សកម្ម', label: 'សកម្ម' }, { value: 'អសកម្ម', label: 'អសកម្ម' }, { value: 'សុំច្បាប់', label: 'សុំច្បាប់' },], },
            { name: 'address.province', label: 'ខេត្ត/រាជធានី', type: 'select', options: getOptions(provincesData), placeholder: 'ជ្រើសរើសខេត្ត/រាជធានី' },
            { name: 'address.district', label: 'ស្រុក/ខណ្ឌ', type: 'select', options: formData.address.province ? getOptions(districtsData, formData.address.province, 2) : [], placeholder: 'ជ្រើសរើសស្រុក/ខណ្ឌ' },
            { name: 'address.commune', label: 'ឃុំ/សង្កាត់', type: 'select', options: formData.address.district ? getOptions(communesData, formData.address.district, 2) : [], placeholder: 'ជ្រើសរើសឃុំ/សង្កាត់' },
            { name: 'address.village', label: 'ភូមិ', type: 'select', options: formData.address.commune ? getOptions(villagesData, formData.address.commune, 2) : [], placeholder: 'ជ្រើសរើសភូមិ' },
            { name: 'position', type: 'select', label: 'មុខតំណែង', options: positions.map(p => ({ value: p._id, label: p.name })), placeholder: 'ជ្រើសរើសមុខតំណែង' },
            { name: 'framework', type: 'select', label: 'ក្របខណ្ឌ', options: frameworks.map(f => ({ value: f._id, label: f.name })), placeholder: 'ជ្រើសរើសក្របខណ្ឌ' },
        ];

        fields.push({
            name: 'organization',
            type: 'select',
            label: 'អង្គភាព',
            required: true,
            options: schools
                .map(s => ({
                    value: s._id,
                    label: `${s.schoolLevel || ''} - ${s.schoolName}`
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
            placeholder: 'ជ្រើសរើសអង្គភាព'
        });

        return fields;
    }, [frameworks, positions, schools, user, formData.address.province, formData.address.district, formData.address.commune]);

    const columns = [
        { key: 'index', label: 'ល.រ' },
        {
            key: 'profileImage',
            label: 'រូបភាព',
            render: (item) => (
                item.profileImage ?
                    <img src={item.profileImage} alt="Profile" className="h-10 w-10 object-cover" /> :
                    <div className="h-10 w-10 rounded-full bg-gray-300" />
            )
        },
        { key: 'teacherId', label: 'អត្តលេខ' },
        { key: 'fullNameKh', label: 'គោត្តនាម-នាម (ខ្មែរ)' },
        { key: 'fullNameEn', label: 'Full Name (English)' },
        { key: 'gender', label: 'ភេទ' },
        { key: 'phone', label: 'លេខទូរស័ព្ទ', render: (item) => formatPhoneNumber(item.phone) },
        { key: 'dob', label: 'ថ្ងៃខែឆ្នាំកំណើត', render: (item) => formatDateDisplay(item.dob) },
        { key: 'status', label: 'ស្ថានភាព', render: (item) => <Badge value={item.status} /> },
        { key: 'position.name', label: 'មុខតំណែង', render: (item) => item.position?.name || 'N/A' },
        { key: 'framework.name', label: 'ក្របខណ្ឌ', render: (item) => item.framework?.name || 'N/A' },
        { key: 'organization', label: 'អង្គភាព', render: (item) => item.organization ? [item.organization.schoolLevel, item.organization.schoolName].filter(Boolean).join(' - ') : 'N/A' },
        {
            key: 'address',
            label: 'អាសយដ្ឋាន',
            render: (item) => {
                if (!item.address) return 'N/A';
                const villageName = getAddrPart(item.address.village, villagesData, 8);
                const communeName = getAddrPart(item.address.commune, communesData, 6);
                const districtName = getAddrPart(item.address.district, districtsData, 4);
                const provinceName = getAddrPart(item.address.province, provincesData, 2);
                return [villageName, communeName, districtName, provinceName].filter(Boolean).join(', ');
            }
        },
        { key: 'hireDate', label: 'ថ្ងៃចូលបម្រើការ', render: (item) => formatDateDisplay(item.hireDate) },
        {
            key: 'actions',
            label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-3">
                    <button onClick={() => setEditTeacher(item)} className="text-blue-500 hover:text-blue-700" title="កែសម្រួល"><FaEdit /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700" title="លុប"><FaTrash /></button>
                </div>
            )
        }
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{pageTitle}</h1>
                {schoolId && (
                    <button
                        onClick={() => navigate('/teachers')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        បង្ហាញគ្រូទាំងអស់
                    </button>
                )}
            </div>

            <GenericForm
                fields={formFields}
                initialData={formData}
                onSubmit={handleFormSubmit}
                buttonText={editTeacher ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមគ្រូ'}
                onCancel={() => setEditTeacher(null)}
            />
            <div className="bg-white rounded-lg shadow-md mt-6 overflow-x-auto">
                <div className="flex items-center gap-4 p-4 border-b">
                    <div className='flex-1'>
                        <label htmlFor="schoolFilter" className="block text-sm font-medium text-gray-700 mb-1">ជ្រើសរើសសាលា</label>
                        <select
                            id="schoolFilter"
                            value={selectedSchool}
                            onChange={handleSchoolFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                    <TableSkeleton rows={5} columns={12} />
                ) : (
                    <GenericTable columns={columns} data={filteredTeachers} />
                )}
            </div>
        </div>
    );
};

export default Teachers;