import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSchool, FaChalkboardTeacher, FaUserGraduate, FaUniversity, FaBook, FaChartBar, FaCheckCircle, FaClipboardList, FaCalendarAlt, FaAward, FaPenAlt, FaCog, FaUsers } from 'react-icons/fa';

const ROUTES = [
    { path: '/', label: 'ផ្ទាំងគ្រប់គ្រង', icon: FaSchool },
    { path: '/schools', label: 'គ្រប់គ្រងសាលា', icon: FaUniversity },
    { path: '/teachers', label: 'គ្រូបង្រៀន', icon: FaChalkboardTeacher },
    { path: '/subjects', label: 'មុខវិជ្ជា', icon: FaBook },
    { path: '/classes', label: 'ថ្នាក់រៀន', icon: FaSchool },
    { path: '/students', label: 'សិស្ស', icon: FaUserGraduate },
    { path: '/attendance', label: 'វត្តមានគ្រូ', icon: FaCheckCircle },
    { path: '/student-attendance', label: 'វត្តមានសិស្ស', icon: FaClipboardList },
    { path: '/student-score', label: 'បញ្ចូលពិន្ទុ', icon: FaPenAlt },
    { path: '/student-score-list', label: 'បញ្ជីពិន្ទុ', icon: FaClipboardList },
    { path: '/honor-table', label: 'តារាងកិត្តិយស', icon: FaAward },
    { path: '/reports', label: 'របាយការណ៍', icon: FaChartBar },
    { path: '/teacher-attendance-report', label: 'របាយការណ៍វត្តមានគ្រូ', icon: FaCalendarAlt },
    { path: '/student-attendance-report', label: 'របាយការណ៍វត្តមានសិស្ស', icon: FaClipboardList },
    { path: '/users', label: 'អ្នកប្រើប្រាស់', icon: FaUsers },
    { path: '/settings', label: 'ការកំណត់', icon: FaCog },
];

const QuickSearch = ({ open, onClose }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const filtered = ROUTES.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (open) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            navigate(filtered[selectedIndex].path);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [filtered, selectedIndex, navigate, onClose]);

    const select = (path) => {
        navigate(path);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onKeyDown={handleKeyDown}>
                <div className="flex items-center px-4 border-b">
                    <FaSearch className="text-gray-400 mr-3" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        placeholder="ស្វែងរកទំព័រ..."
                        className="flex-1 py-4 outline-none text-gray-700"
                    />
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400">គ្មានលទ្ធផល</div>
                    ) : (
                        filtered.map((r, i) => (
                            <button
                                key={r.path}
                                onClick={() => select(r.path)}
                                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${i === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <r.icon className="mr-3 text-gray-400" size={16} />
                                {r.label}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickSearch;
