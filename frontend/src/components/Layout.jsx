import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import QuickSearch from './common/QuickSearch';

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
