import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TeacherAttendance from '../components/TeacherAttendance';
import StudentAttendance from '../components/StudentAttendance';

const TABS = [
    { key: 'teacher', label: 'វត្តមានគ្រូ' },
    { key: 'student', label: 'វត្តមានសិស្ស' },
];

const TeacherAttendancePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        return tabFromQuery === 'student' ? 'student' : 'teacher';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        setActiveTab(tabFromQuery === 'student' ? 'student' : 'teacher');
    }, [location.search]);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        navigate(`/attendance${tabKey === 'teacher' ? '' : '?tab=student'}`);
    };

    return (
        <div className="container mx-auto">
            <div className="mb-6 flex flex-wrap gap-1.5">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 transform ${isActive
                                ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-300 scale-[1.02]'
                                : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
                                }`}
                        >
                            {tab.label}
                            {isActive && (
                                <span className="absolute inset-x-3 -bottom-1 h-1 rounded-full bg-white/90" />
                            )}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'teacher' ? <TeacherAttendance /> : <StudentAttendance />}
        </div>
    );
};

export default TeacherAttendancePage;