import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Timetable from '../components/Timetable';
import ExamSchedule from '../components/ExamSchedule';
import EventCalendar from '../components/EventCalendar';

const TABS = [
    { key: 'timetable', path: '/timetable', label: 'កាលវិភាគបង្រៀន' },
    { key: 'exam', path: '/exam-schedule', label: 'កាលវិភាគប្រឡង' },
    { key: 'event', path: '/event-calendar', label: 'ប្រតិទិនព្រឹត្តិការណ៍' },
];

function TimetablePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState(() => {
        if (location.pathname === '/exam-schedule') return 'exam';
        if (location.pathname === '/event-calendar') return 'event';
        return 'timetable';
    });

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

            {activeKey === 'exam' && <ExamSchedule />}
            {activeKey === 'event' && <EventCalendar />}
            {activeKey === 'timetable' && <Timetable />}
        </div>
    );
}

export default TimetablePage;
