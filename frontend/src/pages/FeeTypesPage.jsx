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

            {activeKey === 'payments' ? <FeePayments /> : <FeeTypes />}
        </div>
    );
}

export default FeeTypesPage;
