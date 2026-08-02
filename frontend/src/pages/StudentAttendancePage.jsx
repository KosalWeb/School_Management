import React, { useState } from 'react';
import TeacherAttendance from '../components/TeacherAttendance';
import StudentAttendance from '../components/StudentAttendance';

const TABS = [
    { key: 'teacher', label: 'វត្តមានគ្រូ' },
    { key: 'student', label: 'វត្តមានសិស្ស' },
];

const StudentAttendancePage = () => {
    const [activeTab, setActiveTab] = useState('student');

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

            {activeTab === 'teacher' ? <TeacherAttendance /> : <StudentAttendance />}
        </div>
    );
};

export default StudentAttendancePage;
