import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { FaSchool, FaChalkboardTeacher, FaUserGraduate, FaUniversity, FaCheckCircle, FaTimesCircle, FaClock, FaBed } from 'react-icons/fa';
import { StatCardSkeleton } from '../components/common/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 ${color} hover:-translate-y-1 hover:shadow-lg transition-all duration-200`}>
        <div className="mr-4 text-3xl">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    </div>
);

const AttendanceChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">វត្តមានប្រចាំថ្ងៃ (៧ ថ្ងៃចុងក្រោយ)</h2>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" name="វត្តមាន" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" name="អវត្តមាន" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="late" name="យឺត" fill="#eab308" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leave" name="សុំច្បាប់" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchAttendanceByDate(selectedDate);
    }, [selectedDate]);

    const fmt = (d) => d.toISOString().split('T')[0];

    const fetchAttendanceByDate = async (date) => {
        try {
            const res = await api.get(`/attendance/stats?from=${date}&to=${date}`).catch(() => null);
            setAttendance(res?.data || null);
        } catch (error) {
            console.error("Could not fetch attendance", error);
        }
    };

    const fetchStats = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);

            const [statsRes, chartRes] = await Promise.all([
                api.get('/dashboard'),
                api.get(`/attendance/stats?from=${fmt(sevenDaysAgo)}&to=${fmt(today)}`).catch(() => null),
            ]);
            setStats(statsRes.data);

            if (chartRes?.data?.daily) {
                setChartData(chartRes.data.daily.map(d => ({ ...d, date: d._id?.slice(5) || d._id })));
            }

            await fetchAttendanceByDate(selectedDate);
        } catch (error) {
            console.error("Could not fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    const renderSkeleton = () => {
        const count = user?.role === 'superadmin' ? 4 : user?.role === 'school-admin' ? 3 : 2;
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: count }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        );
    };

    const renderDashboard = () => {
        if (loading) return renderSkeleton();
        if (!stats) return renderSkeleton();

        const cards = () => {
            switch (user.role) {
                case 'superadmin':
                    return (
                        <>
                            <StatCard title="សាលាសរុប" value={stats.schoolCount} icon={<FaUniversity className="text-primary-light" />} color="border-primary-light" />
                            <StatCard title="បុគ្គលិកសរុប" value={stats.teacherCount} icon={<FaChalkboardTeacher className="text-green-500" />} color="border-green-500" />
                            <StatCard title="ថ្នាក់សរុប" value={stats.classCount} icon={<FaSchool className="text-purple-500" />} color="border-purple-500" />
                            <StatCard title="សិស្សសរុប" value={stats.studentCount} icon={<FaUserGraduate className="text-cyan-500" />} color="border-cyan-500" />
                        </>
                    );
                case 'school-admin':
                    return (
                        <>
                            <StatCard title="បុគ្គលិកក្នុងសាលា" value={stats.teacherCount} icon={<FaChalkboardTeacher className="text-green-500" />} color="border-green-500" />
                            <StatCard title="ថ្នាក់ក្នុងសាលា" value={stats.classCount} icon={<FaSchool className="text-purple-500" />} color="border-purple-500" />
                            <StatCard title="សិស្សក្នុងសាលា" value={stats.studentCount} icon={<FaUserGraduate className="text-cyan-500" />} color="border-cyan-500" />
                        </>
                    );
                case 'teacher':
                    return (
                        <>
                            <StatCard title="ថ្នាក់របស់ខ្ញុំ" value={stats.classCount} icon={<FaSchool className="text-purple-500" />} color="border-purple-500" />
                            <StatCard title="សិស្សរបស់ខ្ញុំ" value={stats.studentCount} icon={<FaUserGraduate className="text-cyan-500" />} color="border-cyan-500" />
                        </>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards()}
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-xl font-bold text-gray-800">វត្តមាន</h2>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {attendance ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard title="វត្តមាន" value={attendance.present || 0} icon={<FaCheckCircle className="text-green-500" />} color="border-green-500" />
                            <StatCard title="អវត្តមាន" value={attendance.absent || 0} icon={<FaTimesCircle className="text-red-500" />} color="border-red-500" />
                            <StatCard title="យឺត" value={attendance.late || 0} icon={<FaClock className="text-yellow-500" />} color="border-yellow-500" />
                            <StatCard title="សុំច្បាប់" value={attendance.leave || 0} icon={<FaBed className="text-blue-500" />} color="border-blue-500" />
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">គ្មានទិន្នន័យ</p>
                    )}
                </div>

                {chartData && <AttendanceChart data={chartData} />}
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                ទំព័រដើម
            </h1>
            {renderDashboard()}
        </div>
    );
};

export default DashboardPage;
