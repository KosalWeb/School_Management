import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Report from '../components/Report';
import TeacherAttendanceReport from '../components/TeacherAttendanceReport';
import StudentAttendanceReport from '../components/StudentAttendanceReport';
import ReportCard from '../components/ReportCard';

const TABS = [
    { key: 'reports', path: '/reports', label: 'របាយការណ៍' },
    { key: 'teacher-attendance', path: '/reports?tab=teacher-attendance', label: 'របាយការណ៍វត្តមានគ្រូ' },
    { key: 'student-attendance', path: '/reports?tab=student-attendance', label: 'របាយការណ៍វត្តមានសិស្ស' },
    { key: 'report-card', path: '/reports?tab=report-card', label: 'ប័ណ្ណពិន្ទុសិស្ស' },
];

const ReportPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        if (tabFromQuery === 'teacher-attendance') return 'teacher-attendance';
        if (tabFromQuery === 'student-attendance') return 'student-attendance';
        if (tabFromQuery === 'report-card') return 'report-card';
        return 'reports';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        if (tabFromQuery === 'teacher-attendance') {
            setActiveKey('teacher-attendance');
        } else if (tabFromQuery === 'student-attendance') {
            setActiveKey('student-attendance');
        } else if (tabFromQuery === 'report-card') {
            setActiveKey('report-card');
        } else {
            setActiveKey('reports');
        }
    }, [location.search]);

    const handleTabChange = (tabKey) => {
        setActiveKey(tabKey);
        if (tabKey === 'reports') {
            navigate('/reports');
        } else if (tabKey === 'teacher-attendance') {
            navigate('/reports?tab=teacher-attendance');
        } else if (tabKey === 'student-attendance') {
            navigate('/reports?tab=student-attendance');
        } else {
            navigate('/reports?tab=report-card');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="mb-6 flex flex-wrap gap-1.5">
                {TABS.map((tab) => {
                    const isActive = activeKey === tab.key;
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

            {activeKey === 'teacher-attendance' ? <TeacherAttendanceReport /> : activeKey === 'student-attendance' ? <StudentAttendanceReport /> : activeKey === 'report-card' ? <ReportCard /> : <Report />}
        </div>
    );
};

export default ReportPage;