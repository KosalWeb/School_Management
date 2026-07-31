import React, { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { showErrorToast } from '../utils/alert';
import { FaPrint, FaSearch, FaSchool } from 'react-icons/fa';

const ATTENDANCE_LABELS = { present: 'វត្តមាន', absent: 'អវត្តមាន', late: 'យឺត', leave: 'សុំច្បាប់' };

const ReportCard = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        api.get('/classes').then(({ data }) => setClasses(data)).catch(() => {});
    }, []);

    useEffect(() => {
        if (selectedClass) {
            api.get('/students', { params: { class: selectedClass } })
                .then(({ data }) => setStudents(data))
                .catch(() => setStudents([]));
        } else {
            setStudents([]);
        }
    }, [selectedClass]);

    const fetchReport = async () => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            const params = { studentId: selectedStudent };
            if (selectedExam) params.examType = selectedExam;
            const { data } = await api.get('/report-card', { params });
            setData(data);
        } catch {
            showErrorToast('មិនអាចទាញយករបាយការណ៍បានទេ');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = printRef.current.innerHTML;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ប័ណ្ណពិន្ទុ</title>
                <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { font-family: 'Kantumruy Pro', sans-serif; font-size: 13px; color: #1a1a1a; line-height: 1.5; }
                    .print-report-card { max-width: 210mm; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; border-bottom: 3px double #1e40af; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { font-size: 22px; color: #1e40af; margin: 0 0 5px; }
                    .header p { color: #555; margin: 2px 0; font-size: 12px; }
                    .student-info { display: flex; justify-content: space-between; padding: 12px 15px; background: #f8fafc; border-radius: 6px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
                    .info-item { font-size: 13px; }
                    .info-label { color: #64748b; }
                    .info-value { font-weight: 600; color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 12px; }
                    th { background: #1e40af; color: white; font-weight: 600; }
                    td { color: #1e293b; }
                    .text-center { text-align: center; }
                    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                    .summary-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 15px; }
                    .summary-box h3 { font-size: 13px; font-weight: 600; color: #1e40af; margin: 0 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                    .summary-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
                    .summary-row span:last-child { font-weight: 600; }
                    .footer { text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; }
                    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
                    .badge-green { background: #dcfce7; color: #166534; }
                    .badge-blue { background: #dbeafe; color: #1e40af; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="print-report-card">${content}</div>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ប័ណ្ណពិន្ទុសិស្ស</h1>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6 no-print">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">ថ្នាក់</label>
                        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(''); setData(null); }} className="w-full p-2 border rounded">
                            <option value="">-- ជ្រើសរើស --</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">សិស្ស</label>
                        <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">-- ជ្រើសរើស --</option>
                            {students.map(s => <option key={s._id} value={s._id}>{s.fullNameKh} ({s.studentId})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ប្រភេទប្រឡង (ស្រេចចិត្ត)</label>
                        <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">ទាំងអស់</option>
                        </select>
                    </div>
                    <div>
                        <button onClick={fetchReport} disabled={!selectedStudent || loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                            <FaSearch /> {loading ? 'កំពុងផ្ទុក...' : 'មើលប័ណ្ណពិន្ទុ'}
                        </button>
                    </div>
                    {data && (
                        <div>
                            <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                                <FaPrint /> បោះពុម្ព / PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {data && (
                <div ref={printRef}>
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 print-report-card">
                        <div className="header" style={{ textAlign: 'center', borderBottom: '3px double #1e40af', paddingBottom: 15, marginBottom: 20 }}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <FaSchool className="text-3xl text-blue-700" />
                                <h1 style={{ fontSize: 22, color: '#1e40af', margin: 0 }}>ប័ណ្ណពិន្ទុសិស្ស</h1>
                            </div>
                            <p style={{ color: '#555', margin: '2px 0' }}>School Management System</p>
                            <p style={{ color: '#555', margin: '2px 0', fontSize: 12 }}>ឆ្នាំសិក្សា {new Date().getFullYear()}-{new Date().getFullYear() + 1}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', background: '#f8fafc', borderRadius: 6, marginBottom: 20, border: '1px solid #e2e8f0' }}>
                            <div>
                                <div style={{ marginBottom: 4 }}><span style={{ color: '#64748b' }}>ឈ្មោះ: </span><span style={{ fontWeight: 600 }}>{data.student.name}</span></div>
                                <div style={{ marginBottom: 4 }}><span style={{ color: '#64748b' }}>ឈ្មោះឡាតាំង: </span><span style={{ fontWeight: 600 }}>{data.student.nameEn}</span></div>
                                <div><span style={{ color: '#64748b' }}>ភេទ: </span><span style={{ fontWeight: 600 }}>{data.student.gender}</span></div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ marginBottom: 4 }}><span style={{ color: '#64748b' }}>លេខសម្គាល់: </span><span style={{ fontWeight: 600 }}>{data.student.studentId}</span></div>
                                <div style={{ marginBottom: 4 }}><span style={{ color: '#64748b' }}>ថ្នាក់: </span><span style={{ fontWeight: 600 }}>{data.student.class}</span></div>
                                <div><span style={{ color: '#64748b' }}>កម្រិត: </span><span style={{ fontWeight: 600 }}>{data.student.gradeLevel}</span></div>
                            </div>
                        </div>

                        {Object.keys(data.scores).length > 0 ? (
                            Object.entries(data.scores).map(([examType, subjects]) => (
                                <div key={examType} className="mb-4">
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e40af', margin: '0 0 8px', borderBottom: '2px solid #1e40af', paddingBottom: 4 }}>
                                        {examType === 'ឆមាសទី១' || examType === 'ឆមាសទី២' ? `ប្រឡង${examType}` : `ខែ${examType}`}
                                    </h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 15 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', background: '#1e40af', color: 'white', fontWeight: 600, textAlign: 'left' }}>ល.រ</th>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', background: '#1e40af', color: 'white', fontWeight: 600, textAlign: 'left' }}>មុខវិជ្ជា</th>
                                                <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', background: '#1e40af', color: 'white', fontWeight: 600, textAlign: 'center', width: 120 }}>ពិន្ទុ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.map((s, i) => (
                                                <tr key={i}>
                                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center' }}>{i + 1}</td>
                                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>{s.subject}</td>
                                                    <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{s.score}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>គ្មានទិន្នន័យពិន្ទុ</p>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 20 }}>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 15px' }}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 5 }}>សង្ខេបពិន្ទុ</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>ពិន្ទុមធ្យម</span>
                                    <span style={{ fontWeight: 600 }}>{data.average}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>ចំណាត់ថ្នាក់</span>
                                    <span style={{ fontWeight: 600 }}>{data.rank ? `${data.rank}/${data.totalStudents}` : 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>មុខវិជ្ជាសរុប</span>
                                    <span style={{ fontWeight: 600 }}>{data.allScores.length}</span>
                                </div>
                            </div>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 15px' }}>
                                <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', margin: '0 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: 5 }}>សង្ខេបវត្តមាន</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>សរុប</span>
                                    <span style={{ fontWeight: 600 }}>{data.attendance.total} ថ្ងៃ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>វត្តមាន</span>
                                    <span style={{ fontWeight: 600, color: '#166534' }}>{data.attendance.present}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>អវត្តមាន</span>
                                    <span style={{ fontWeight: 600, color: '#dc2626' }}>{data.attendance.absent}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>យឺត</span>
                                    <span style={{ fontWeight: 600, color: '#d97706' }}>{data.attendance.late}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                                    <span style={{ color: '#64748b' }}>សុំច្បាប់</span>
                                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{data.attendance.leave}</span>
                                </div>
                            </div>
                        </div>

                        {data.average >= 50 ? (
                            <div style={{ textAlign: 'center', padding: '10px', background: '#dcfce7', borderRadius: 6, border: '1px solid #86efac', marginBottom: 15 }}>
                                <span style={{ fontWeight: 700, color: '#166534', fontSize: 15 }}>លទ្ធផល: ជាប់</span>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '10px', background: '#fee2e2', borderRadius: 6, border: '1px solid #fca5a5', marginBottom: 15 }}>
                                <span style={{ fontWeight: 700, color: '#991b1b', fontSize: 15 }}>លទ្ធផល: ធ្លាក់</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30, fontSize: 12, color: '#64748b' }}>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ borderTop: '2px solid #94a3b8', width: '80%', margin: '0 auto 5px', paddingTop: 5 }}>ហត្ថលេខាគ្រូបង្រៀន</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ borderTop: '2px solid #94a3b8', width: '80%', margin: '0 auto 5px', paddingTop: 5 }}>ហត្ថលេខានាយក</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ borderTop: '2px solid #94a3b8', width: '80%', margin: '0 auto 5px', paddingTop: 5 }}>ហត្ថលេខាមាតាបិតា</div>
                            </div>
                        </div>

                        <div className="footer" style={{ textAlign: 'center', color: '#94a3b8', fontSize: 10, borderTop: '1px solid #e2e8f0', paddingTop: 10, marginTop: 20 }}>
                            បង្កើតដោយប្រព័ន្ធគ្រប់គ្រងសាលារៀន | {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}

            {!data && !loading && (
                <div className="bg-white rounded-xl shadow-lg p-16 text-center text-gray-400">
                    <FaSchool className="mx-auto text-5xl mb-4 text-blue-200" />
                    <p className="text-lg">សូមជ្រើសរើសសិស្ស និងចុច "មើលប័ណ្ណពិន្ទុ"</p>
                </div>
            )}
        </div>
    );
};

export default ReportCard;
