import React, { useState } from 'react';
import EventCalendar from '../components/EventCalendar';
import Timetable from '../components/Timetable';
import ExamSchedule from '../components/ExamSchedule';

const TABS = [
    { key: 'event', label: 'ប្រតិទិនព្រឹត្តិការណ៍' },
    { key: 'timetable', label: 'កាលវិភាគបង្រៀន' },
    { key: 'exam', label: 'កាលវិភាគប្រឡង' },
];

function EventCalendarPage() {
    const [activeTab, setActiveTab] = useState('event');

    return (
        <div className="container mx-auto">
            <div className="flex gap-1 mb-6 border-b border-gray-200">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
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

            {activeTab === 'event' && <EventCalendar />}
            {activeTab === 'timetable' && <Timetable />}
            {activeTab === 'exam' && <ExamSchedule />}
        </div>
    );
}

export default EventCalendarPage;
