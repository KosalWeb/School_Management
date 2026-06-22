import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import LicensePage from '../../pages/LicensePage';

const LicenseGuard = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        if (window.electronAPI?.license) {
            window.electronAPI.license.getStatus().then(setStatus).finally(() => setLoading(false));
            const unsub = window.electronAPI.license.onStatus(setStatus);
            return unsub;
        } else {
            setStatus({ valid: true, status: 'active' });
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!status?.valid) {
        return <LicensePage />;
    }

    return <Outlet />;
};

export default LicenseGuard;
