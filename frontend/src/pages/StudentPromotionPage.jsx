import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentPromotion from '../components/StudentPromotion';
import StudentIDCard from '../components/StudentIDCard';

const TABS = [
    { key: 'promotion', path: '/student-promotion', label: 'ដំឡើងថ្នាក់' },
    { key: 'id-card', path: '/student-promotion?tab=id-card', label: 'ប័ណ្ណសម្គាល់' },
];

function StudentPromotionPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        return tabFromQuery === 'id-card' ? 'id-card' : 'promotion';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        setActiveKey(tabFromQuery === 'id-card' ? 'id-card' : 'promotion');
    }, [location.search]);

    const handleTabChange = (tabKey) => {
        setActiveKey(tabKey);
        navigate(`/student-promotion${tabKey === 'promotion' ? '' : '?tab=id-card'}`);
    };

    return (
        <div className="container mx-auto">
            <div className="flex gap-1 mb-6 border-b border-gray-200">
                {TABS.map((tab) => {
                    const isActive = activeKey === tab.key;
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

            {activeKey === 'id-card' ? <StudentIDCard /> : <StudentPromotion />}
        </div>
    );
}

export default StudentPromotionPage;
