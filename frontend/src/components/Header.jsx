import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiUserPlus, FiMenu, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';

const ROUTE_LABELS = {
    '/': 'ផ្ទាំងគ្រប់គ្រង',
    '/schools': 'គ្រប់គ្រងសាលា',
    '/teachers': 'គ្រូបង្រៀន',
    '/subjects': 'មុខវិជ្ជា',
    '/classes': 'ថ្នាក់រៀន',
    '/students': 'សិស្ស',
    '/users': 'អ្នកប្រើប្រាស់',
    '/attendance': 'វត្តមានគ្រូ',
    '/student-attendance': 'វត្តមានសិស្ស',
    '/student-score': 'បញ្ចូលពិន្ទុ',
    '/student-score-list': 'បញ្ជីពិន្ទុ',
    '/honor-table': 'តារាងកិត្តិយស',
    '/profile': 'ប្រវត្តិរូប',
    '/settings': 'ការកំណត់',
    '/reports': 'របាយការណ៍',
    '/teacher-attendance-report': 'របាយការណ៍វត្តមានគ្រូ',
    '/student-attendance-report': 'របាយការណ៍វត្តមានសិស្ស',
};

const Breadcrumb = () => {
    const location = useLocation();
    const label = ROUTE_LABELS[location.pathname] || '';
    if (!label) return null;
    return (
        <div className="text-sm text-gray-400 hidden sm:block">
            ផ្ទាំងគ្រប់គ្រង{location.pathname !== '/' && <span className="mx-1">/</span>}
            {location.pathname !== '/' && <span className="text-gray-600 font-medium">{label}</span>}
        </div>
    );
};

const Header = ({ onMenuButtonClick, onQuickSearch }) => {
    const { user, logout } = useAuth();
    const { dark, toggle: toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const pageClickEvent = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) window.addEventListener('click', pageClickEvent);
        return () => window.removeEventListener('click', pageClickEvent);
    }, [dropdownOpen]);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
    };

    return (
        <header className="bg-white border-b px-4 py-3 no-print">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onMenuButtonClick} className="text-gray-600 hover:text-gray-800 transition-colors" aria-label="Toggle sidebar">
                        <FiMenu size={22} />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-700 hidden sm:block">ប្រព័ន្ធគ្រប់គ្រងគ្រូបង្រៀន</h1>
                        <Breadcrumb />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onQuickSearch}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <FiMenu size={14} className="rotate-90" />
                        ស្វែងរក
                        <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">Ctrl+K</kbd>
                    </button>

                    <button onClick={toggleTheme} className="text-gray-500 hover:text-gray-700 transition-colors" aria-label="Toggle theme">
                        {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(prev => !prev)} className="flex items-center space-x-2">
                            <img
                                className="w-8 h-8 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${user?.name}&background=random&color=fff`}
                                alt="user photo"
                            />
                            <span className="text-gray-600 hidden md:block text-sm">{user?.name}</span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FiUser className="mr-2" /> ប្រវត្តិរូប
                                </Link>
                                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FiSettings className="mr-2" /> ការកំណត់
                                </Link>
                                {(user?.role === 'superadmin' || user?.role === 'school-admin') && (
                                    <Link to="/users" onClick={() => setDropdownOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <FiUserPlus className="mr-2" /> បង្កើតអ្នកប្រើប្រាស់
                                    </Link>
                                )}
                                <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <FiLogOut className="mr-2" /> ចាកចេញ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
