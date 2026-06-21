import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { formatDateDisplay } from '../utils/date';
import {
    FaCheckCircle, FaTimesCircle, FaClock, FaPlane, FaSave,
    FaCalendarDay, FaHistory, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const STATUS_OPTIONS = [
    { value: 'present', label: 'មក', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'absent', label: 'អវត្តមាន', color: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'late', label: 'យឺត', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'leave', label: 'សុំច្បាប់', color: 'bg-blue-100 text-blue-800 border-blue-300' },
];

const STATUS_ICONS = {
    present: <FaCheckCircle className="text-green-500" />,
    absent: <FaTimesCircle className="text-red-500" />,
    late: <FaClock className="text-yellow-500" />,
    leave: <FaPlane className="text-blue-500" />,
};

const StatCard = ({ label, value, icon, colorClass }) => (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${colorClass} p-4 flex items-center gap-3`}>
        <div className="text-2xl">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-CA');
};

const formatDisplay = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('km-KH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getToday = () => formatDate(new Date());

const TeacherAttendance = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, leave: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyRange, setHistoryRange] = useState({ from: '', to: '' });
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (user.role === 'superadmin') {
            api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
        } else if (user.role === 'school-admin') {
            setSelectedSchool(user.school);
        }
    }, [user]);

    const fetchAttendance = useCallback(async () => {
        try {
            setIsLoading(true);
            const params = { date: selectedDate };
            if (selectedSchool) params.schoolId = selectedSchool;
            const { data } = await api.get('/attendance', { params });
            setAttendanceData(data.records || []);
            setSummary(data.summary || { total: 0, present: 0, absent: 0, late: 0, leave: 0 });
        } catch (error) {
            showErrorToast('Could not fetch attendance data.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, selectedSchool]);

    const handleSearch = () => {
        setHasSearched(true);
        fetchAttendance();
    };

    const handleStatusChange = (teacherId, newStatus) => {
        setAttendanceData((prev) =>
            prev.map((entry) => {
                if (entry.teacher._id === teacherId) {
                    const updated = {
                        ...entry,
                        attendance: entry.attendance
                            ? { ...entry.attendance, status: newStatus }
                            : {
                                _id: `temp-${teacherId}`,
                                teacher: teacherId,
                                date: new Date(selectedDate),
                                status: newStatus,
                                checkIn: '',
                                checkOut: '',
                                note: '',
                            },
                    };
                    return updated;
                }
                return entry;
            })
        );
    };

    const handleCheckInChange = (teacherId, value) => {
        setAttendanceData((prev) =>
            prev.map((entry) => {
                if (entry.teacher._id === teacherId) {
                    const updated = {
                        ...entry,
                        attendance: entry.attendance
                            ? { ...entry.attendance, checkIn: value }
                            : {
                                _id: `temp-${teacherId}`,
                                teacher: teacherId,
                                date: new Date(selectedDate),
                                status: 'present',
                                checkIn: value,
                                checkOut: '',
                                note: '',
                            },
                    };
                    return updated;
                }
                return entry;
            })
        );
    };

    const handleCheckOutChange = (teacherId, value) => {
        setAttendanceData((prev) =>
            prev.map((entry) => {
                if (entry.teacher._id === teacherId) {
                    const updated = {
                        ...entry,
                        attendance: entry.attendance
                            ? { ...entry.attendance, checkOut: value }
                            : {
                                _id: `temp-${teacherId}`,
                                teacher: teacherId,
                                date: new Date(selectedDate),
                                status: 'present',
                                checkIn: '',
                                checkOut: value,
                                note: '',
                            },
                    };
                    return updated;
                }
                return entry;
            })
        );
    };

    const handleNoteChange = (teacherId, value) => {
        setAttendanceData((prev) =>
            prev.map((entry) => {
                if (entry.teacher._id === teacherId) {
                    const updated = {
                        ...entry,
                        attendance: entry.attendance
                            ? { ...entry.attendance, note: value }
                            : {
                                _id: `temp-${teacherId}`,
                                teacher: teacherId,
                                date: new Date(selectedDate),
                                status: 'present',
                                checkIn: '',
                                checkOut: '',
                                note: value,
                            },
                    };
                    return updated;
                }
                return entry;
            })
        );
    };

    const handleMarkAll = (status) => {
        showConfirmDialog({
            title: `Mark all as ${status}?`,
            onConfirm: () => {
                setAttendanceData((prev) =>
                    prev.map((entry) => ({
                        ...entry,
                        attendance: entry.attendance
                            ? { ...entry.attendance, status }
                            : {
                                _id: `temp-${entry.teacher._id}`,
                                teacher: entry.teacher._id,
                                date: new Date(selectedDate),
                                status,
                                checkIn: '',
                                checkOut: '',
                                note: '',
                            },
                    }))
                );
            },
        });
    };

    const handleSave = async () => {
        const records = attendanceData
            .filter((entry) => entry.attendance)
            .map((entry) => ({
                teacher: entry.teacher._id,
                date: selectedDate,
                status: entry.attendance.status,
                checkIn: entry.attendance.checkIn || '',
                checkOut: entry.attendance.checkOut || '',
                note: entry.attendance.note || '',
            }));

        if (records.length === 0) {
            showErrorToast('No attendance records to save.');
            return;
        }

        try {
            setIsSaving(true);
            await api.post('/attendance', { records });
            showSuccessToast('Attendance saved successfully!');
            fetchAttendance();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'Failed to save attendance.');
        } finally {
            setIsSaving(false);
        }
    };

    const changeDate = (delta) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        setSelectedDate(formatDate(d));
    };

    const fetchHistory = async () => {
        if (!historyRange.from || !historyRange.to) {
            showErrorToast('Please select both from and to dates.');
            return;
        }
        try {
            setHistoryLoading(true);
            const params = { from: historyRange.from, to: historyRange.to };
            if (selectedSchool) params.schoolId = selectedSchool;
            const { data } = await api.get('/attendance/history', { params });
            setHistoryData(data);
        } catch (error) {
            showErrorToast('Could not fetch history.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const opt = STATUS_OPTIONS.find((s) => s.value === status);
        if (!opt) return null;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${opt.color}`}>
                {STATUS_ICONS[status]} {opt.label}
            </span>
        );
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">វត្តមានគ្រូបង្រៀន</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
                            showHistory
                                ? 'bg-blue-50 text-blue-700 border-blue-300'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <FaHistory /> ប្រវត្តិ
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changeDate(-1)}
                            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-600"
                        >
                            <FaChevronLeft />
                        </button>
                        <div className="relative">
                            <FaCalendarDay className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => changeDate(1)}
                            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-600"
                        >
                            <FaChevronRight />
                        </button>
                        <button
                            onClick={() => setSelectedDate(getToday())}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
                        >
                            ថ្ងៃនេះ
                        </button>
                    </div>

                    {user.role === 'superadmin' && (
                        <div>
                            <select
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">សាលាទាំងអស់</option>
                                {schools.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.schoolLevel || ''} - {s.schoolName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        ស្វែងរក
                    </button>

                    <p className="text-sm text-gray-500 md:ml-auto">
                        {formatDisplay(selectedDate)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="គ្រូសរុប" value={summary.total} icon={<FaCheckCircle className="text-gray-500" />} colorClass="border-gray-500" />
                <StatCard label="មក" value={summary.present} icon={<FaCheckCircle className="text-green-500" />} colorClass="border-green-500" />
                <StatCard label="អវត្តមាន" value={summary.absent} icon={<FaTimesCircle className="text-red-500" />} colorClass="border-red-500" />
                <StatCard label="យឺត" value={summary.late} icon={<FaClock className="text-yellow-500" />} colorClass="border-yellow-500" />
                <StatCard label="សុំច្បាប់" value={summary.leave} icon={<FaPlane className="text-blue-500" />} colorClass="border-blue-500" />
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-semibold text-gray-700">បញ្ជីគ្រូបង្រៀន</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleMarkAll('present')}
                            className="px-3 py-1.5 text-sm rounded-md bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"
                        >
                            មកទាំងអស់
                        </button>
                        <button
                            onClick={() => handleMarkAll('absent')}
                            className="px-3 py-1.5 text-sm rounded-md bg-red-50 text-red-700 border border-red-300 hover:bg-red-100"
                        >
                            អវត្តមានទាំងអស់
                        </button>
                    </div>
                </div>

                {!hasSearched ? (
                    <div className="text-center py-16 text-gray-500">
                        <FaCalendarDay className="mx-auto text-4xl mb-3 text-gray-300" />
                        <p>សូមជ្រើសរើសកាលបរិច្ឆេទ និងចុច ស្វែងរក</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <ClipLoader size={40} />
                    </div>
                ) : attendanceData.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <FaCalendarDay className="mx-auto text-4xl mb-3 text-gray-300" />
                        <p>គ្មានទិន្នន័យគ្រូបង្រៀនសម្រាប់ថ្ងៃនេះទេ។</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                                    <th className="py-3 px-4 border-b">ល.រ</th>
                                    <th className="py-3 px-4 border-b">អត្តលេខ</th>
                                    <th className="py-3 px-4 border-b">គោត្តនាម-នាម (ខ្មែរ)</th>
                                    <th className="py-3 px-4 border-b">ភេទ</th>
                                    <th className="py-3 px-4 border-b">ទូរស័ព្ទ</th>
                                    <th className="py-3 px-4 border-b">ស្ថានភាព</th>
                                    <th className="py-3 px-4 border-b">ចូល</th>
                                    <th className="py-3 px-4 border-b">ចេញ</th>
                                    <th className="py-3 px-4 border-b">កំណត់សម្គាល់</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((entry, index) => {
                                    const t = entry.teacher;
                                    const a = entry.attendance;
                                    const status = a?.status || '';
                                    return (
                                        <tr key={t._id} className="border-b hover:bg-gray-50 text-sm">
                                            <td className="py-3 px-4 text-gray-500">{index + 1}</td>
                                            <td className="py-3 px-4 font-medium">{t.teacherId}</td>
                                            <td className="py-3 px-4">{t.fullNameKh}</td>
                                            <td className="py-3 px-4">{t.gender}</td>
                                            <td className="py-3 px-4">{t.phone}</td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={status}
                                                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                                                    className={`px-2 py-1 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        status === 'present' ? 'border-green-300 bg-green-50' :
                                                        status === 'absent' ? 'border-red-300 bg-red-50' :
                                                        status === 'late' ? 'border-yellow-300 bg-yellow-50' :
                                                        status === 'leave' ? 'border-blue-300 bg-blue-50' :
                                                        'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">-- ជ្រើសរើស --</option>
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="time"
                                                    value={a?.checkIn || ''}
                                                    onChange={(e) => handleCheckInChange(t._id, e.target.value)}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="time"
                                                    value={a?.checkOut || ''}
                                                    onChange={(e) => handleCheckOutChange(t._id, e.target.value)}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="text"
                                                    value={a?.note || ''}
                                                    onChange={(e) => handleNoteChange(t._id, e.target.value)}
                                                    placeholder="..."
                                                    className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading || !hasSearched || attendanceData.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isSaving ? <ClipLoader size={18} color="#fff" /> : <FaSave />}
                        រក្សាទុក
                    </button>
                </div>
            </div>

            {showHistory && (
                <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                    <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                        <FaHistory /> ប្រវត្តិវត្តមាន
                    </h2>
                    <div className="flex flex-col md:flex-row gap-3 items-end">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">ចាប់ពីថ្ងៃ</label>
                            <input
                                type="date"
                                value={historyRange.from}
                                onChange={(e) => setHistoryRange((p) => ({ ...p, from: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">ដល់ថ្ងៃ</label>
                            <input
                                type="date"
                                value={historyRange.to}
                                onChange={(e) => setHistoryRange((p) => ({ ...p, to: e.target.value }))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={fetchHistory}
                            disabled={historyLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {historyLoading ? <ClipLoader size={18} color="#fff" /> : 'ស្វែងរក'}
                        </button>
                    </div>

                    {historyData.length > 0 && (
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full bg-white border">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-sm font-medium text-gray-600">
                                        <th className="py-2 px-3 border-b">ថ្ងៃ</th>
                                        <th className="py-2 px-3 border-b">គ្រូ</th>
                                        <th className="py-2 px-3 border-b">សាលា</th>
                                        <th className="py-2 px-3 border-b">ស្ថានភាព</th>
                                        <th className="py-2 px-3 border-b">ចូល</th>
                                        <th className="py-2 px-3 border-b">ចេញ</th>
                                        <th className="py-2 px-3 border-b">កំណត់សម្គាល់</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map((rec) => (
                                        <tr key={rec._id} className="border-b hover:bg-gray-50 text-sm">
                                            <td className="py-2 px-3">{formatDateDisplay(rec.date)}</td>
                                            <td className="py-2 px-3">{rec.teacher?.fullNameKh || 'N/A'}</td>
                                            <td className="py-2 px-3">{rec.school?.schoolName || 'N/A'}</td>
                                            <td className="py-2 px-3">{getStatusBadge(rec.status)}</td>
                                            <td className="py-2 px-3">{rec.checkIn || '-'}</td>
                                            <td className="py-2 px-3">{rec.checkOut || '-'}</td>
                                            <td className="py-2 px-3 text-gray-500">{rec.note || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!historyLoading && historyRange.from && historyRange.to && historyData.length === 0 && (
                        <p className="text-center text-gray-500 py-8">គ្មានទិន្នន័យ</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherAttendance;
