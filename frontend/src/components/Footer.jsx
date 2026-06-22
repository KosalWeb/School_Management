import React, { useState, useEffect } from 'react';

const Footer = () => {
    const [licenseText, setLicenseText] = useState(null);

    useEffect(() => {
        const refresh = () => {
            if (window.electronAPI?.license) {
                window.electronAPI.license.getStatus().then(s => {
                    if (s.status === 'trial') {
                        setLicenseText({ text: `សាកល្បង: ${s.daysLeft} ថ្ងៃ`, cls: 'text-yellow-500' });
                    } else if (s.status === 'active' && s.expiresAt) {
                        const date = new Date(s.expiresAt).toLocaleDateString();
                        if (s.daysLeft <= 7) {
                            setLicenseText({ text: `ផុតកំណត់: ${date} (${s.daysLeft} ថ្ងៃ)`, cls: 'text-red-500' });
                        } else {
                            setLicenseText({ text: `ផុតកំណត់: ${date}`, cls: 'text-green-500' });
                        }
                    } else if (s.status === 'expired') {
                        setLicenseText({ text: s.expiredAt ? 'អាជ្ញាប័ណ្ណផុតកំណត់' : 'សាកល្បងផុតកំណត់', cls: 'text-red-500 font-semibold' });
                    } else {
                        setLicenseText(null);
                    }
                });
            }
        };
        refresh();
        const id = setInterval(refresh, 60000);
        return () => clearInterval(id);
    }, []);

    return (
        <footer className="text-center p-4 bg-white border-t">
            <p className="text-sm text-gray-600">
                © 2025 ប្រព័ន្ធគ្រប់គ្រងសាលារៀន. រក្សាសិទ្ធិគ្រប់យ៉ាង។
                {licenseText && (
                    <span className={`ml-2 text-xs ${licenseText.cls}`}>({licenseText.text})</span>
                )}
            </p>
        </footer>
    );
};

export default Footer;