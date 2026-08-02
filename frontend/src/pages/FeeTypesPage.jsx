import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FeeTypes from '../components/FeeTypes';
import FeePayments from '../components/FeePayments';

const TABS = [
    { key: 'types', path: '/fee', label: 'ប្រភេទថ្លៃ' },
    { key: 'payments', path: '/fee?tab=payments', label: 'ការបង់ប្រាក់' },
];

function FeeTypesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        return tabFromQuery === 'payments' ? 'payments' : 'types';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        setActiveKey(tabFromQuery === 'payments' ? 'payments' : 'types');
    }, [location.search]);

    const handleTabChange = (tabKey) => {
        setActiveKey(tabKey);
        navigate(`/fee${tabKey === 'types' ? '' : '?tab=payments'}`);
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

            {activeKey === 'payments' ? <FeePayments /> : <FeeTypes />}
        </div>
    );
}

export default FeeTypesPage;
