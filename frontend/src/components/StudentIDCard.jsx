import React, { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { showErrorToast } from '../utils/alert';
import { FaPrint, FaIdCard, FaSearch } from 'react-icons/fa';

const StudentIDCard = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(false);
    const cardRef = useRef();

    useEffect(() => {
        if (user?.role === 'superadmin') {
            api.get('/schools').then(({ data }) => setSchools(data)).catch(() => {});
        }
    }, [user]);

    const schoolId = user?.role === 'superadmin' ? selectedSchool : user?.school;

    useEffect(() => {
        setSelectedClass('');
        if (schoolId) {
            api.get(`/classes?school=${schoolId}`).then(({ data }) => setClasses(data)).catch(() => setClasses([]));
        } else {
            setClasses([]);
        }
    }, [schoolId]);

    useEffect(() => {
        if (selectedClass) {
            api.get('/students', { params: { class: selectedClass } }).then(({ data }) => setStudents(data)).catch(() => setStudents([]));
        } else { setStudents([]); }
    }, [selectedClass]);

    const fetchStudent = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            const { data } = await api.get('/students', { params: { class: selectedClass } });
            const s = data.find(d => d._id === selectedStudent);
            setStudent(s);
        } catch { showErrorToast('Failed'); } finally { setLoading(false); }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = cardRef.current.innerHTML;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>អត្តសញ្ញាណប័ណ្ណ</title>
            <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: 85.6mm 54mm; margin: 0; }
                body { font-family: 'Kantumruy Pro', sans-serif; margin: 0; padding: 0; }
                .id-card { width: 85.6mm; height: 54mm; padding: 4mm; box-sizing: border-box; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); display: flex; flex-direction: column; justify-content: center; }
                .id-card-inner { background: white; border-radius: 3mm; padding: 3mm; flex: 1; display: flex; gap: 3mm; }
                .photo { width: 22mm; height: 28mm; background: #e2e8f0; border-radius: 2mm; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #94a3b8; flex-shrink: 0; }
                .info { flex: 1; font-size: 8px; display: flex; flex-direction: column; justify-content: center; }
                .info h2 { font-size: 10px; font-weight: 700; color: #1e40af; margin: 0 0 2px; }
                .info .school-name { font-size: 7px; color: #64748b; margin-bottom: 3px; }
                .info .row { display: flex; justify-content: space-between; padding: 1px 0; }
                .info .label { color: #94a3b8; }
                .info .value { font-weight: 600; color: #1e293b; }
                .id-no { font-size: 6px; text-align: center; color: #94a3b8; margin-top: 2px; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ប័ណ្ណសម្គាល់សិស្ស</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {user?.role === 'superadmin' && (
                        <div><label className="block text-sm font-medium mb-1">សាលារៀន</label><select value={selectedSchool} onChange={e => { setSelectedSchool(e.target.value); setSelectedClass(''); setSelectedStudent(''); setStudent(null); }} className="w-full p-2 border rounded"><option value="">-- ជ្រើសរើស --</option>{schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}</select></div>
                    )}
                    <div><label className="block text-sm font-medium mb-1">ថ្នាក់</label><select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); setStudent(null); }} className="w-full p-2 border rounded" disabled={!schoolId}><option value="">--</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1">សិស្ស</label><select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full p-2 border rounded"><option value="">--</option>{students.map(s => <option key={s._id} value={s._id}>{s.fullNameKh} ({s.studentId})</option>)}</select></div>
                    <div><button onClick={fetchStudent} disabled={!selectedStudent || loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><FaSearch /> មើល</button></div>
                    {student && <div><button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"><FaPrint /> បោះពុម្ព</button></div>}
                </div>
            </div>

            {student && (
                <div className="flex justify-center" ref={cardRef}>
                    <div className="id-card" style={{ width: '324px', height: '204px', padding: '4px', boxSizing: 'border-box', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', borderRadius: '4px' }}>
                        <div className="id-card-inner" style={{ background: 'white', borderRadius: '3px', padding: '3px', height: '100%', display: 'flex', gap: '3px' }}>
                            <div className="photo" style={{ width: '80px', height: '110px', background: '#e2e8f0', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#94a3b8', flexShrink: 0 }}>
                                <FaIdCard />
                            </div>
                            <div className="info" style={{ flex: 1, fontSize: '9px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', margin: '0 0 2px' }}>{student.fullNameKh}</h2>
                                <div className="school-name" style={{ fontSize: '7px', color: '#64748b', marginBottom: '2px' }}>School Management</div>
                                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px' }}><span className="label" style={{ color: '#94a3b8' }}>ID:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b' }}>{student.studentId}</span></div>
                                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px' }}><span className="label" style={{ color: '#94a3b8' }}>ភេទ:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b' }}>{student.gender}</span></div>
                                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px' }}><span className="label" style={{ color: '#94a3b8' }}>ថ្នាក់:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b' }}>{student.class?.className || '--'}</span></div>
                                {student.fullNameEn && <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px' }}><span className="label" style={{ color: '#94a3b8' }}>EN:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b', fontSize: '7px' }}>{student.fullNameEn}</span></div>}
                                <div className="id-no" style={{ fontSize: '6px', textAlign: 'center', color: '#94a3b8', marginTop: '1px' }}>ប្រព័ន្ធគ្រប់គ្រងសាលារៀន</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {!student && <div className="text-center py-16 text-gray-400"><FaIdCard className="mx-auto text-5xl mb-4 text-blue-200" /><p>ជ្រើសរើសសិស្ស និងចុច "មើល"</p></div>}
        </div>
    );
};

export default StudentIDCard;
