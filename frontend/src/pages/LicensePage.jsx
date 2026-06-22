import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiKey, FiClock, FiCheckCircle, FiAlertTriangle, FiCopy, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

const LicensePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [machineId, setMachineId] = useState('');
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [activating, setActivating] = useState(false);
    const [error, setError] = useState('');
    const [activated, setActivated] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (window.electronAPI?.license) {
            Promise.all([
                window.electronAPI.license.getStatus(),
                window.electronAPI.license.getMachineId(),
            ]).then(([s, mid]) => {
                setStatus(s);
                setMachineId(mid);
            }).finally(() => setLoading(false));
            const unsub = window.electronAPI.license.onStatus(s => {
                setStatus(s);
                if (s.machineId) setMachineId(s.machineId);
            });
            return unsub;
        } else {
            setStatus({ valid: true, status: 'active' });
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status?.status === 'active' && user) {
            navigate('/', { replace: true });
        }
    }, [status, user, navigate]);

    const handleActivate = async () => {
        if (!key.trim() || !expiryDate) return;
        setActivating(true);
        setError('');
        try {
            const ts = new Date(expiryDate).getTime();
            const result = await window.electronAPI.license.activate(key.trim(), ts);
            if (result.success) {
                setActivated(true);
                const s = await window.electronAPI.license.getStatus();
                setStatus(s);
                if (s.status === 'active' && user) navigate('/', { replace: true });
            } else {
                setError(result.message || 'Invalid license key');
            }
        } catch {
            setError('Failed to activate license');
        } finally {
            setActivating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(machineId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    const isExpired = status?.status === 'expired';
    const activeWithExpiry = status?.status === 'active' && status?.expiresAt;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        {activated || activeWithExpiry ? (
                            <FiCheckCircle className="w-8 h-8 text-green-600" />
                        ) : isExpired ? (
                            <FiAlertTriangle className="w-8 h-8 text-red-500" />
                        ) : (
                            <FiClock className="w-8 h-8 text-blue-600" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">School Management</h1>
                    <p className="text-gray-500 mt-1">Version 1.0.0</p>
                </div>

                {activeWithExpiry ? (
                    <div className="text-center">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-green-700 font-medium">License Active</p>
                            <p className="text-sm text-green-600 mt-1">
                                Expires: {new Date(status.expiresAt).toLocaleDateString()}
                                {status.daysLeft > 0 && ` (${status.daysLeft} days remaining)`}
                            </p>
                        </div>
                    </div>
                ) : activated ? (
                    <div className="text-center py-4">
                        <p className="text-green-600 font-medium">License activated successfully!</p>
                        <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
                    </div>
                ) : isExpired && status.expiredAt ? (
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-700 font-medium">License Expired</p>
                            <p className="text-sm text-red-500 mt-1">
                                Expired on: {new Date(status.expiredAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-red-500 mt-1">
                                Please renew your license.
                            </p>
                        </div>
                    </div>
                ) : isExpired ? (
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-700 font-medium">Trial period expired</p>
                            <p className="text-sm text-red-500 mt-1">
                                Please activate the application with a valid license key to continue.
                            </p>
                        </div>
                    </div>
                ) : status?.status === 'trial' ? (
                    <div className="text-center mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-700 font-medium">Trial Period</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{status.daysLeft}</p>
                            <p className="text-sm text-blue-500">days remaining</p>
                        </div>
                    </div>
                ) : null}

                {!activated && !activeWithExpiry && machineId && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Machine ID (send this to get a license key):</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs font-mono bg-white px-2 py-1 rounded border select-all">{machineId}</code>
                            <button onClick={handleCopy} className="text-gray-400 hover:text-gray-600 shrink-0" title="Copy">
                                <FiCopy size={16} />
                            </button>
                        </div>
                        {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
                    </div>
                )}

                {!activated && !activeWithExpiry && (
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiCalendar className="inline mr-1" /> Expiry Date
                        </label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => { setExpiryDate(e.target.value); setError(''); }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                )}

                {!activated && !activeWithExpiry && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiKey className="inline mr-1" /> License Key
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => { setKey(e.target.value); setError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center font-mono uppercase"
                            maxLength={19}
                        />
                        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                        <button
                            onClick={handleActivate}
                            disabled={activating || !key.trim() || !expiryDate}
                            className="w-full mt-4 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {activating ? 'Activating...' : 'Activate License'}
                        </button>
                    </div>
                )}

                {status?.status === 'trial' && (
                    <p className="text-xs text-gray-400 text-center mt-4">
                        You are using a trial version. Send your Machine ID to get a license key.
                    </p>
                )}
            </div>
        </div>
    );
};

export default LicensePage;
