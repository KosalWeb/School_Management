import React, { useState, useEffect, useMemo, useRef } from 'react';
import GenericTable from './common/GenericTable';
import GenericForm from './common/GenericForm';
import { TableSkeleton } from './common/Skeleton';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import * as XLSX from 'xlsx';
import { FaPlus, FaFileImport, FaTrash, FaFileExport, FaEdit } from 'react-icons/fa';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editSubject, setEditSubject] = useState(null);
    const fileInputRef = useRef(null);

    const [filterCode, setFilterCode] = useState('');
    const [filterName, setFilterName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchSubjects = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/subjects');
            setSubjects(data);
        } catch (error) {
            showErrorToast('Could not fetch subjects.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleFormSubmit = async (formData) => {
        if (!formData.subjectCode || !formData.subjectName) {
            showErrorToast('Please enter both code and name.');
            return;
        }
        try {
            if (editSubject) {
                await api.put(`/subjects/${editSubject._id}`, formData);
                showSuccessToast('Subject updated!');
            } else {
                await api.post('/subjects', formData);
                showSuccessToast('Subject added!');
            }
            setEditSubject(null);
            fetchSubjects();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Operation failed.');
        }
    };

    const handleDelete = (id) => {
        showConfirmDialog({
            title: 'Delete this subject?',
            onConfirm: async () => {
                try {
                    await api.delete(`/subjects/${id}`);
                    showSuccessToast('Subject deleted!');
                    fetchSubjects();
                } catch (error) {
                    showErrorToast('Could not delete.');
                }
            },
        });
    };

    // --- NEW: Handle "Add New" button click to clear the form ---
    const handleAddNew = () => {
        setEditSubject(null);
    };

    // --- NEW: Handle "Delete All Displayed" button click ---
    const handleDeleteAll = () => {
        if (filteredSubjects.length === 0) {
            showErrorToast("No subjects to delete.");
            return;
        }
        showConfirmDialog({
            title: `Delete ${filteredSubjects.length} subjects?`,
            text: "This will delete all subjects currently visible in the table.",
            onConfirm: async () => {
                const idsToDelete = filteredSubjects.map(s => s._id);
                try {
                    await api.post('/subjects/delete-multiple', { ids: idsToDelete });
                    showSuccessToast('All displayed subjects deleted.');
                    fetchSubjects();
                } catch (error) {
                    showErrorToast('Could not delete subjects.');
                }
            }
        });
    };

    // --- NEW: Handle file selection and parsing for import ---
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    showErrorToast("Excel file is empty or formatted incorrectly.");
                    return;
                }

                const subjectsToImport = json.map(row => ({
                    subjectCode: row.subjectCode || row['លេខកូដ'],
                    subjectName: row.subjectName || row['ឈ្មោះមុខវិជ្ជា']
                })).filter(s => s.subjectCode && s.subjectName);

                if (subjectsToImport.length > 0) {
                    const response = await api.post('/subjects/import', subjectsToImport);
                    showSuccessToast(response.data.message || 'Import successful!');
                    fetchSubjects();
                } else {
                    showErrorToast("No valid data. Ensure columns are 'subjectCode' and 'subjectName'.");
                }
            } catch (error) {
                showErrorToast("Failed to process Excel file.");
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredSubjects.map(({ subjectCode, subjectName }) => ({ 'លេខកូដ': subjectCode, 'ឈ្មោះមុខវិជ្ជា': subjectName })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Subjects");
        XLSX.writeFile(workbook, "SubjectsData.xlsx");
    };

    const filteredSubjects = useMemo(() => {
        return subjects.filter(subject =>
            subject.subjectCode.toLowerCase().includes(filterCode.toLowerCase()) &&
            subject.subjectName.toLowerCase().includes(filterName.toLowerCase())
        );
    }, [subjects, filterCode, filterName]);

    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
    const currentItems = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const columns = [
        { key: 'index', label: 'ល.រ' },
        { key: 'subjectCode', label: 'លេខកូដ' },
        { key: 'subjectName', label: 'ឈ្មោះមុខវិជ្ជា' },
        {
            key: 'actions',
            label: 'សកម្មភាព',
            render: (item) => (
                <div className="flex space-x-3">
                    <button onClick={() => setEditSubject(item)} className="text-blue-500 hover:text-blue-700" title="កែសម្រួល"><FaEdit /></button>
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700" title="លុប"><FaTrash /></button>
                </div>
            )
        }
    ];

    const formFields = [
        { name: 'subjectCode', label: 'លេខកូដ', required: true, placeholder: 'ឧ. MATH-10' },
        { name: 'subjectName', label: 'ឈ្មោះមុខវិជ្ជា', required: true, placeholder: 'ឧ. គណិតវិទ្យា' }
    ];

    if (isLoading) { return <div className="p-4"><TableSkeleton rows={5} columns={5} /></div>; }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">គ្រប់គ្រងមុខវិជ្ជា</h1>

            <GenericForm
                fields={formFields}
                initialData={editSubject || { subjectCode: '', subjectName: '' }}
                onSubmit={handleFormSubmit}
                buttonText={editSubject ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែមមុខវិជ្ជា'}
            />

            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    {/* --- NEW: Button Group for actions --- */}
                    <div className="flex items-center gap-2">
                        <button onClick={() => fileInputRef.current.click()} className="flex items-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-3 rounded">
                            <FaFileImport className="mr-2" /> នាំចូល
                        </button>
                        <button onClick={handleExport} className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded">
                            <FaFileExport className="mr-2" /> នាំចេញ
                        </button>
                        <button onClick={handleDeleteAll} className="flex items-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded">
                            <FaTrash className="mr-2" /> លុបទាំងអស់
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="ស្វែងរកតាមលេខកូដ..." value={filterCode} onChange={e => setFilterCode(e.target.value)} className="p-2 border rounded" />
                        <input type="text" placeholder="ស្វែងរកតាមឈ្មោះ..." value={filterName} onChange={e => setFilterName(e.target.value)} className="p-2 border rounded" />

                    </div>
                </div>

                <GenericTable columns={columns} data={currentItems} />

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-4 space-x-2">
                        <button onClick={() => paginate(1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">ដំបូង</button>
                        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">ថយក្រោយ</button>
                        <span className="px-3 py-1">ទំព័រ {currentPage} នៃ {totalPages}</span>
                        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">បន្ទាប់</button>
                        <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">ចុងក្រោយ</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subjects;