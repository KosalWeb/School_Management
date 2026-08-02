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
            <div className="flex gap-1 mb-6 border-b border-gray-200">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-5 py-2.5 rounded-t-lg text-sm font-medium transition-colors border-b-2 -mb-px ${isActive
                                ? 'bg-white text-blue-600 border-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'schools' ? <Schools /> : activeTab === 'teachers' ? <Teachers /> : activeTab === 'subjects' ? <Subjects /> : activeTab === 'classes' ? <Classes /> : <Students />}
        </div>
    );
}

export default SchoolsPage;