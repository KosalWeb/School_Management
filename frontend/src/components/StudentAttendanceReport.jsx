import React, { useState } from 'react';
import api from '../config/api';
import * as XLSX from 'xlsx';
import { ClipLoader } from 'react-spinners';
import { formatDateDisplay } from '../utils/date';
import { FaCheckCircle, FaTimesCircle, FaClock, FaPlane } from 'react-icons/fa';

const STATUS_LABELS = {
    present: 'វត្តមាន',
    absent: 'អវត្តមាន',
    late: 'យឺត',
    leave: 'ច្បាប់',
};

const STATUS_ICONS = {
    present: <FaCheckCircle className="text-green-500 text-lg" />,
    absent: <FaTimesCircle className="text-red-500 text-lg" />,
    late: <FaClock className="text-yellow-500 text-lg" />,
    leave: <FaPlane className="text-blue-500 text-lg" />,
};

const STATUS_BG = {
    present: 'bg-green-100',
    absent: 'bg-red-100',
    late: 'bg-yellow-100',
    leave: 'bg-blue-100',
    '': '',
};

const StudentAttendanceReport = () => {
    const [view, setView] = useState('summary');
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [stats, setStats] = useState(null);
    const [matrix, setMatrix] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const dailyColumns = [
        { key: '_id', label: 'កាលបរិច្ឆេទ', render: (item) => formatDateDisplay(item._id) },
        { key: 'present', label: 'វត្តមាន' },
        { key: 'absent', label: 'អវត្តមាន' },
        { key: 'late', label: 'យឺត' },
        { key: 'leave', label: 'ច្បាប់' },
        { key: 'total', label: 'សរុប' },
    ];

    React.useEffect(() => {
        api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
    }, []);

    React.useEffect(() => {
        setSelectedClass('');
        if (selectedSchool) {
            api.get(`/classes?school=${selectedSchool}`).then((res) => setClasses(res.data)).catch(() => setClasses([]));
        } else {
            setClasses([]);
        }
    }, [selectedSchool]);

    const handleSearch = async () => {
        if (!fromDate || !toDate) return;
        try {
            setIsLoading(true);
            setHasSearched(true);
            const params = new URLSearchParams();
            params.append('from', fromDate);
            params.append('to', toDate);
            if (selectedSchool) params.append('schoolId', selectedSchool);
            if (selectedClass) params.append('classId', selectedClass);

            if (view === 'summary') {
                const res = await api.get(`/student-attendance/stats?${params.toString()}`);
                setStats(res.data);
            } else {
                const res = await api.get(`/student-attendance/matrix?${params.toString()}`);
                setMatrix(res.data);
            }
        } catch (error) {
            console.error('Could not fetch attendance data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        if (view === 'summary' && stats?.daily?.length) {
            const headers = ['កាលបរិច្ឆេទ', 'វត្តមាន', 'អវត្តមាន', 'យឺត', 'ច្បាប់', 'សរុប'];
            const data = stats.daily.map(d => [
                formatDateDisplay(d._id), d.present, d.absent, d.late, d.leave, d.total
            ]);
            const total = ['សរុប', stats.present, stats.absent, stats.late, stats.leave, stats.total];
            const ws = XLSX.utils.aoa_to_sheet([headers, ...data, [], total]);
            XLSX.utils.book_append_sheet(workbook, ws, 'វត្តមានសិស្ស');
            XLSX.writeFile(workbook, `Student_Attendance_${fromDate}_to_${toDate}.xlsx`);
        } else if (view === 'matrix' && matrix?.dates?.length && matrix?.people?.length) {
            const headers = ['ឈ្មោះ', 'ថ្នាក់', ...matrix.dates.map(d => formatDateDisplay(d))];
            const data = matrix.people.map(p => [
                p.name,
                p.className,
                ...matrix.dates.map(d => STATUS_LABELS[matrix.records[`${p._id}_${d}`]] || ''),
            ]);
            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            XLSX.utils.book_append_sheet(workbook, ws, 'វត្តមានសិស្ស');
            XLSX.writeFile(workbook, `Student_Attendance_Matrix_${fromDate}_to_${toDate}.xlsx`);
        }
    };

    const StatCard = ({ label, count, color }) => (
        <div className={`p-4 rounded-lg border ${color}`}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
    );

    const renderDailyTable = (data, columns) => {
        if (!data || data.length === 0) return <p className="text-gray-500 text-center py-4">គ្មានទិន្នន័យ</p>;
        const totalRow = columns.reduce((acc, col) => {
            if (col.key === '_id') acc[col.key] = 'សរុប';
            else acc[col.key] = data.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
            return acc;
        }, {});
        return (
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50">
                        {columns.map(col => (
                            <th key={col.key} className="border px-3 py-2 text-left text-sm font-medium text-gray-600">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            {columns.map(col => (
                                <td key={col.key} className="border px-3 py-2 text-sm">
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className="bg-gray-100 font-semibold">
                        {columns.map(col => (
                            <td key={col.key} className="border px-3 py-2 text-sm">
                                {col.render ? col.render(totalRow) : totalRow[col.key]}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    };

    const renderSummary = () => {
        if (!stats) return null;
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">វត្តមានសិស្ស</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <StatCard label="សរុប" count={stats.total} color="bg-gray-50 border-gray-300" />
                    <StatCard label="វត្តមាន" count={stats.present} color="bg-green-50 border-green-300" />
                    <StatCard label="អវត្តមាន" count={stats.absent} color="bg-red-50 border-red-300" />
                    <StatCard label="យឺត" count={stats.late} color="bg-yellow-50 border-yellow-300" />
                    <StatCard label="ច្បាប់" count={stats.leave} color="bg-blue-50 border-blue-300" />
                </div>
                <h3 className="font-semibold mb-2">លម្អិតតាមថ្ងៃ</h3>
                {renderDailyTable(stats.daily, dailyColumns)}
            </div>
        );
    };

    const renderMatrixView = () => {
        if (!matrix || !matrix.people?.length || !matrix.dates?.length) {
            return (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">វត្តមានសិស្ស</h2>
                    <p className="text-gray-500 text-center py-4">គ្មានទិន្នន័យ</p>
                </div>
            );
        }
        const { people, dates, records } = matrix;
        return (
            <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">វត្តមានសិស្ស</h2>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border px-2 py-1 sticky left-0 bg-gray-50 text-left font-medium text-gray-600 min-w-[180px]">
                                ឈ្មោះ
                            </th>
                            <th className="border px-2 py-1 text-left font-medium text-gray-600 min-w-[100px]">
                                ថ្នាក់
                            </th>
                            {dates.map(d => (
                                <th key={d} className="border px-1 py-1 text-center font-medium text-gray-600 text-xs min-w-[80px]">
                                    {formatDateDisplay(d)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {people.map((p, i) => (
                            <tr key={p._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border px-2 py-1 sticky left-0 whitespace-nowrap" style={{ background: 'inherit' }}>
                                    {p.name}
                                </td>
                                <td className="border px-2 py-1 whitespace-nowrap text-gray-500">
                                    {p.className}
                                </td>
                                {dates.map(d => {
                                    const status = records[`${p._id}_${d}`] || '';
                                    return (
                                        <td key={d} className={`border px-1 py-1 text-center ${STATUS_BG[status]}`}>
                                            {STATUS_ICONS[status] || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const canExport = hasSearched && (
        (view === 'summary' && stats?.daily?.length) ||
        (view === 'matrix' && matrix?.dates?.length && matrix?.people?.length)
    );

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">របាយការណ៍វត្តមានសិស្ស</h1>
                {canExport && (
                    <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Export to Excel
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">កាលបរិច្ឆេទចាប់ពី</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ដល់</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">សាលា</label>
                        <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="w-full border border-gray-300 rounded-md p-2">
                            <option value="">សាលាទាំងអស់</option>
                            {schools.map(school => (
                                <option key={school._id} value={school._id}>
                                    {[school.schoolLevel, school.schoolName].filter(Boolean).join(' - ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ថ្នាក់</label>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedSchool} className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100">
                            <option value="">ថ្នាក់ទាំងអស់</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>{cls.className}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ប្រភេទ</label>
                        <div className="flex border border-gray-300 rounded-md overflow-hidden">
                            <button onClick={() => setView('summary')} className={`flex-1 px-3 py-2 text-sm ${view === 'summary' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>សង្ខេប</button>
                            <button onClick={() => setView('matrix')} className={`flex-1 px-3 py-2 text-sm ${view === 'matrix' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>តាមឈ្មោះ</button>
                        </div>
                    </div>
                    <div>
                        <button onClick={handleSearch} disabled={!fromDate || !toDate || isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 w-full">
                            {isLoading ? <ClipLoader size={16} color="#fff" /> : 'ស្វែងរក'}
                        </button>
                    </div>
                </div>
            </div>

            {!hasSearched ? (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500">
                    <p>ជ្រើសរើសកាលបរិច្ឆេទ និងចុច ស្វែងរក</p>
                </div>
            ) : isLoading ? (
                <div className="flex justify-center items-center h-64"><ClipLoader size={40} /></div>
            ) : view === 'summary' ? renderSummary() : renderMatrixView()}
        </div>
    );
};

export default StudentAttendanceReport;
