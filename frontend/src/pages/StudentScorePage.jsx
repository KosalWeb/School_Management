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
            <div className="mb-6 flex flex-wrap gap-1.5">
                {TABS.map((tab) => {
                    const isActive = activeKey === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => {
                                setActiveKey(tab.key);
                                navigate(tab.path);
                            }}
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

            {activeKey === 'list' && <StudentScoreList />}
            {activeKey === 'result' && <MonthlyResult />}
            {activeKey === 'honor' && <HonorTable />}
            {activeKey === 'input' && <StudentScore />}
        </div>
    );
}

export default StudentScorePage;
