import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import QuickSearch from './common/QuickSearch';

const getPageTitle = (pathname, search) => {
    const params = new URLSearchParams(search);
    const tab = params.get('tab');

    const titles = {
        '/': 'ផ្ទាំងគ្រប់គ្រង',
        '/schools': 'គ្រប់គ្រងសាលា',
        '/attendance': 'វត្តមាន',
        '/student-score': 'ពិន្ទុសិស្ស',
        '/student-promotion': 'គ្រប់គ្រងសិស្ស',
        '/discipline': 'វិន័យ',
        '/timetable': 'កាលវិភាគ',
        '/teacher-evaluation': 'វាយតម្លៃ',
        '/notifications': 'ទំនាក់ទំនង',
        '/fee': 'ហិរញ្ញវត្ថុ',
        '/reports': 'របាយការណ៍',
        '/student-attendance': 'វត្តមានសិស្ស',
        '/event-calendar': 'កាលវិភាគ',
        '/exam-schedule': 'កាលវិភាគ',
        '/report-card': 'របាយការណ៍',
    };

    const baseTitle = titles[pathname] || 'School Management';

    if (pathname === '/student-score') {
        if (tab === 'list') return 'ពិន្ទុសិស្ស / បញ្ជីពិន្ទុ';
        if (tab === 'result') return 'ពិន្ទុសិស្ស / លទ្ធផលប្រចាំខែ';
        if (tab === 'honor') return 'ពិន្ទុសិស្ស / តារាងកិត្តិយស';
        return 'ពិន្ទុសិស្ស / បញ្ចូលពិន្ទុ';
    }

    if (pathname === '/schools') {
        if (tab === 'teachers') return 'គ្រប់គ្រងសាលា / គ្រូបង្រៀន';
        if (tab === 'subjects') return 'គ្រប់គ្រងសាលា / មុខវិជ្ជា';
        if (tab === 'classes') return 'គ្រប់គ្រងសាលា / ថ្នាក់រៀន';
        if (tab === 'students') return 'គ្រប់គ្រងសាលា / សិស្ស';
        return 'គ្រប់គ្រងសាលា / សាលារៀន';
    }

    if (pathname === '/reports') {
        if (tab === 'teacher-attendance') return 'របាយការណ៍ / វត្តមានគ្រូ';
        if (tab === 'student-attendance') return 'របាយការណ៍ / វត្តមានសិស្ស';
        if (tab === 'report-card') return 'របាយការណ៍ / ប័ណ្ណពិន្ទុ';
        return 'របាយការណ៍';
    }

    if (pathname === '/timetable') {
        if (tab === 'exam') return 'កាលវិភាគ / ប្រឡង';
        if (tab === 'event') return 'កាលវិភាគ / ព្រឹត្តិការណ៍';
        return 'កាលវិភាគ / បង្រៀន';
    }

    if (pathname === '/attendance') {
        if (tab === 'student') return 'វត្តមាន / វត្តមានសិស្ស';
        return 'វត្តមាន / វត្តមានគ្រូ';
    }

    if (pathname === '/student-promotion') {
        if (tab === 'id-card') return 'គ្រប់គ្រងសិស្ស / ប័ណ្ណសម្គាល់';
        return 'គ្រប់គ្រងសិស្ស / ដំឡើងថ្នាក់';
    }

    if (pathname === '/fee') {
        if (tab === 'payments') return 'ហិរញ្ញវត្ថុ / ការបង់ប្រាក់';
        return 'ហិរញ្ញវត្ថុ / ប្រភេទថ្លៃ';
    }

    return baseTitle;
};

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchOpen, setSearchOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const onQuickSearch = useCallback(() => setSearchOpen(prev => !prev), []);
    const pageTitle = getPageTitle(location.pathname, location.search);

    return (
        <div className="relative flex h-screen bg-gray-100 font-kantumruy">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}
            >
                <Header onMenuButtonClick={() => setSidebarOpen(!sidebarOpen)} onQuickSearch={onQuickSearch} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'px-4 md:px-6' : 'px-0'}`}>
                        <div className="py-8">
                            <div className="mb-6">
                                <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={location.pathname}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Outlet />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <Footer />
                    </div>
                </main>
            </div>

            <QuickSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
};

export default Layout;
