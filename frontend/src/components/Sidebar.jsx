import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUserGraduate, FaSchool, FaChartBar, FaCheckCircle, FaClipboardList, FaCalendarAlt, FaAward, FaPenAlt, FaUserCheck, FaClock, FaMoneyBillWave, FaArrowUp, FaExclamationTriangle, FaCalendarCheck, FaEnvelope, FaStar, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_ITEMS = [
  { to: '/', label: 'ផ្ទាំងគ្រប់គ្រង', icon: FaTachometerAlt, roles: ['*'] },
  { to: '/schools', label: 'គ្រប់គ្រងសាលា', icon: FaUniversity, roles: ['superadmin', 'school-admin'] },
  { to: '/attendance', label: 'វត្តមានគ្រូ', icon: FaCheckCircle, roles: ['*'] },
  { to: '/student-score', label: 'ពិន្ទុសិស្ស', icon: FaPenAlt, roles: ['superadmin', 'school-admin'] },
  { to: '/student-promotion', label: 'ដំឡើងថ្នាក់', icon: FaArrowUp, roles: ['superadmin', 'school-admin'] },
  { to: '/discipline', label: 'កំណត់ត្រាវិន័យ', icon: FaClipboardList, roles: ['*'] },
  { to: '/timetable', label: 'កាលវិភាគ', icon: FaClock, roles: ['*'] },
  { to: '/teacher-evaluation', label: 'វាយតម្លៃគ្រូ', icon: FaStar, roles: ['superadmin', 'school-admin'] },
  { to: '/notifications', label: 'ការជូនដំណឹង', icon: FaEnvelope, roles: ['*'] },
  { to: '/fee-types', label: 'ប្រភេទថ្លៃ', icon: FaMoneyBillWave, roles: ['superadmin', 'school-admin'] },
  { to: '/reports', label: 'របាយការណ៍', icon: FaChartBar, roles: ['superadmin', 'school-admin'] },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-gray-200 hover:bg-sidebar-hover rounded-md transition-colors duration-150 ${isActive ? 'bg-sidebar-hover border-l-2 border-accent' : 'border-l-2 border-transparent'}`;

  if (!user) return null;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const hasAccess = (roles) => roles.includes('*') || roles.includes(user.role);

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
          {SIDEBAR_ITEMS.filter(item => hasAccess(item.roles)).map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClasses} onClick={handleLinkClick}>
              <item.icon className="mr-3" size={14} /> {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
