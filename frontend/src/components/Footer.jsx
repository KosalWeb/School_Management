import React, { useState, useEffect } from 'react';

const Footer = () => {
    const [trialDays, setTrialDays] = useState(null);

    useEffect(() => {
        if (window.electronAPI?.license) {
            window.electronAPI.license.getStatus().then(s => {
                if (s.status === 'trial') setTrialDays(s.daysLeft);
            });
        }
    }, []);

    return (
        <footer className="text-center p-4 bg-white border-t">
            <p className="text-sm text-gray-600">
                © 2025 ប្រព័ន្ធគ្រប់គ្រងសាលារៀន. រក្សាសិទ្ធិគ្រប់យ៉ាង។
                {trialDays !== null && (
                    <span className="ml-2 text-yellow-500 text-xs">(Trial: {trialDays} days left)</span>
                )}
            </p>
        </footer>
    );
};

export default Footer;