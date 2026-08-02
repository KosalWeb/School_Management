import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Schools from '../components/Schools';
import Teachers from '../components/Teachers';
import Subjects from '../components/Subjects';
import Classes from '../components/Classes';
import Students from '../components/Students';

const TABS = [
    { key: 'schools', label: 'សាលារៀន' },
    { key: 'teachers', label: 'គ្រូបង្រៀន' },
    { key: 'subjects', label: 'មុខវិជ្ជា' },
    { key: 'classes', label: 'ថ្នាក់រៀន' },
    { key: 'students', label: 'សិស្ស' },
];

function SchoolsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        return tabFromQuery || 'schools';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        setActiveTab(tabFromQuery || 'schools');
    }, [location.search]);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        navigate(`/schools${tabKey === 'schools' ? '' : `?tab=${tabKey}`}`);
    };

    return (
        <div className="container mx-auto">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-50 p-1.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)]">
                <div className="flex flex-wrap gap-1.5">
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
            </div>

            {activeTab === 'schools' ? <Schools /> : activeTab === 'teachers' ? <Teachers /> : activeTab === 'subjects' ? <Subjects /> : activeTab === 'classes' ? <Classes /> : <Students />}
        </div>
    );
}

export default SchoolsPage;