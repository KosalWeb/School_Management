import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentScore from '../components/StudentScore';
import StudentScoreList from '../components/StudentScoreList';
import MonthlyResult from '../components/MonthlyResult';
import HonorTable from '../components/HonorTable';

const TABS = [
    { key: 'input', path: '/student-score', label: 'បញ្ចូលពិន្ទុ' },
    { key: 'list', path: '/student-score?tab=list', label: 'បញ្ជីពិន្ទុ' },
    { key: 'result', path: '/student-score?tab=result', label: 'លទ្ធផលប្រចាំខែ' },
    { key: 'honor', path: '/student-score?tab=honor', label: 'តារាងកិត្តិយស' },
];

function StudentScorePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        if (tabFromQuery === 'list') return 'list';
        if (tabFromQuery === 'result') return 'result';
        if (tabFromQuery === 'honor') return 'honor';
        return 'input';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        if (tabFromQuery === 'list') {
            setActiveKey('list');
        } else if (tabFromQuery === 'result') {
            setActiveKey('result');
        } else if (tabFromQuery === 'honor') {
            setActiveKey('honor');
        } else {
            setActiveKey('input');
        }
    }, [location.search]);

    return (
        <div className="container mx-auto">
            <div className="flex gap-1 mb-6 border-b border-gray-200">
                {TABS.map((tab) => {
                    const isActive = activeKey === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveKey(tab.key);
                                navigate(tab.path);
                            }}
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

            {activeKey === 'list' && <StudentScoreList />}
            {activeKey === 'result' && <MonthlyResult />}
            {activeKey === 'honor' && <HonorTable />}
            {activeKey === 'input' && <StudentScore />}
        </div>
    );
}

export default StudentScorePage;
