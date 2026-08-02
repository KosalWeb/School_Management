import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Timetable from '../components/Timetable';
import ExamSchedule from '../components/ExamSchedule';
import EventCalendar from '../components/EventCalendar';

const TABS = [
    { key: 'timetable', label: 'កាលវិភាគបង្រៀន' },
    { key: 'exam', label: 'កាលវិភាគប្រឡង' },
    { key: 'event', label: 'ប្រតិទិនព្រឹត្តិការណ៍' },
];

function TimetablePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        if (tabFromQuery === 'exam') return 'exam';
        if (tabFromQuery === 'event') return 'event';
        return 'timetable';
    });

    useEffect(() => {
        const tabFromQuery = new URLSearchParams(location.search).get('tab');
        if (tabFromQuery === 'exam') {
            setActiveKey('exam');
        } else if (tabFromQuery === 'event') {
            setActiveKey('event');
        } else {
            setActiveKey('timetable');
        }
    }, [location.search]);

    const handleTabChange = (tabKey) => {
        setActiveKey(tabKey);
        navigate(`/timetable${tabKey === 'timetable' ? '' : `?tab=${tabKey}`}`);
    };

    return (
        <div className="container mx-auto">
            <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-50 p-1.5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.25)]">
                <div className="flex flex-wrap gap-1.5">
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
            </div>

            {activeKey === 'exam' && <ExamSchedule />}
            {activeKey === 'event' && <EventCalendar />}
            {activeKey === 'timetable' && <Timetable />}
        </div>
    );
}

export default TimetablePage;
