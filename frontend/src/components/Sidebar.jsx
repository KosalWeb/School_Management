import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaChalkboardTeacher, FaUserGraduate, FaSchool, FaBook, FaUniversity, FaChartBar, FaTimes, FaCheckCircle, FaClipboardList, FaCalendarAlt, FaAward, FaPenAlt, FaChevronDown, FaChevronRight, FaCog, FaUserCheck, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_NAV = {
  dashboard: {
    label: 'ផ្ទាំងគ្រប់គ្រង',
    icon: FaTachometerAlt,
    items: [
      { to: '/', label: 'ផ្ទាំងគ្រប់គ្រង', icon: FaTachometerAlt, roles: ['*'] },
    ],
  },
  management: {
    label: 'ការគ្រប់គ្រង',
    icon: FaCog,
    items: [
      { to: '/schools', label: 'គ្រប់គ្រងសាលា', icon: FaUniversity, roles: ['superadmin', 'school-admin'] },
      { to: '/teachers', label: 'គ្រូបង្រៀន', icon: FaChalkboardTeacher, roles: ['superadmin', 'school-admin'] },
      { to: '/subjects', label: 'មុខវិជ្ជា', icon: FaBook, roles: ['superadmin', 'school-admin'] },
      { to: '/classes', label: 'ថ្នាក់រៀន', icon: FaSchool, roles: ['*'] },
      { to: '/students', label: 'សិស្ស', icon: FaUserGraduate, roles: ['*'] },
    ],
  },
  attendance: {
    label: 'វត្តមាន',
    icon: FaUserCheck,
    items: [
      { to: '/attendance', label: 'វត្តមានគ្រូ', icon: FaCheckCircle, roles: ['*'] },
      { to: '/student-attendance', label: 'វត្តមានសិស្ស', icon: FaClipboardList, roles: ['*'] },
    ],
  },
  scores: {
    label: 'ពិន្ទុសិស្ស',
    icon: FaPenAlt,
    items: [
      { to: '/student-score', label: 'បញ្ចូលពិន្ទុ', icon: FaPenAlt, roles: ['superadmin', 'school-admin'] },
      { to: '/student-score-list', label: 'បញ្ជីពិន្ទុ', icon: FaClipboardList, roles: ['superadmin', 'school-admin'] },
      { to: '/honor-table', label: 'តារាងកិត្តិយស', icon: FaAward, roles: ['*'] },
    ],
  },
  reports: {
    label: 'របាយការណ៍',
    icon: FaChartBar,
    items: [
      { to: '/reports', label: 'របាយការណ៍', icon: FaChartBar, roles: ['superadmin', 'school-admin'] },
      { to: '/teacher-attendance-report', label: 'របាយការណ៍វត្តមានគ្រូ', icon: FaCalendarAlt, roles: ['superadmin', 'school-admin'] },
      { to: '/student-attendance-report', label: 'របាយការណ៍វត្តមានសិស្ស', icon: FaClipboardList, roles: ['superadmin', 'school-admin'] },
    ],
  },
};

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user } = useAuth();
    const [expanded, setExpanded] = useState(null);

    const toggle = (key) => setExpanded((prev) => prev === key ? null : key);

    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-3 text-gray-200 hover:bg-sidebar-hover rounded-md transition-colors duration-150 ${isActive ? 'bg-sidebar-hover border-l-2 border-accent' : 'border-l-2 border-transparent'}`;

    if (!user) return null;

    const handleLinkClick = () => {
        if (window.innerWidth < 768) setIsOpen(false);
    };

    const hasAccess = (roles) => roles.includes('*') || roles.includes(user.role);

    const SectionToggle = ({ label, icon: Icon, expanded: isExpanded, onToggle }) => (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
        >
            <span className="flex items-center gap-2">
                <Icon className="text-gray-500" size={12} />
                {label}
            </span>
            {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
        </button>
    );

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />
            <div
                className={`w-64 bg-sidebar text-white flex flex-col fixed inset-y-0 left-0 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
            >
                <div className="flex items-center p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <FaSchool className="text-accent text-xl" />
                        <span className="text-lg font-bold">School Management</span>
                    </div>
                </div>

                <nav className="flex-1 px-2 py-4 overflow-y-auto">
                    {Object.entries(SIDEBAR_NAV).map(([key, section]) => (
                        hasAccess(section.items.flatMap(i => i.roles)) && (
                            <div key={key}>
                                <SectionToggle label={section.label} icon={section.icon} expanded={expanded === key} onToggle={() => toggle(key)} />
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded === key ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    {section.items.filter(item => hasAccess(item.roles)).map((item) => (
                                        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClasses} onClick={handleLinkClick}>
                                            <item.icon className="mr-3" size={14} /> {item.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
