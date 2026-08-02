import React, { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FaPrint, FaIdCard, FaCheckSquare, FaSquare, FaUser, FaUpload, FaSpinner, FaTimes } from 'react-icons/fa';

const USER_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="28" height="28" fill="#94a3b8"><path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM256 272c39.8 0 72-32.2 72-72s-32.2-72-72-72s-72 32.2-72 72s32.2 72 72 72z"/></svg>';

const StudentIDCard = () => {
    const { user } = useAuth();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [background, setBackground] = useState('');
    const [uploading, setUploading] = useState(false);
    const bgInputRef = useRef(null);

    useEffect(() => {
        api.get('/schools').then(({ data }) => setSchools(data)).catch(() => {});
    }, [user]);

    const schoolId = user?.role === 'superadmin' ? selectedSchool : user?.school;

    useEffect(() => {
        const currentSchool = schools.find(s => s._id === schoolId);
        setBackground(currentSchool?.idCardBackground || '');
    }, [schoolId, schools]);

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

    const allSelected = students.length > 0 && selectedIds.length === students.length;

    const toggleAll = () => setSelectedIds(allSelected ? [] : students.map(s => s._id));
    const toggleStudent = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const handleBackgroundUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file || !schoolId) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            setUploading(true);
            try {
                await api.put(`/schools/${schoolId}`, { idCardBackground: reader.result });
                setBackground(reader.result);
                setSchools(prev => prev.map(s => s._id === schoolId ? { ...s, idCardBackground: reader.result } : s));
            } catch {
                alert('មិនអាចរក្សាទុករូបផ្ទៃខាងក្រោយបានទេ');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBackgroundRemove = async () => {
        if (!schoolId) return;
        setUploading(true);
        try {
            await api.put(`/schools/${schoolId}`, { idCardBackground: '' });
            setBackground('');
            setSchools(prev => prev.map(s => s._id === schoolId ? { ...s, idCardBackground: '' } : s));
        } catch {
            alert('មិនអាចលុបរូបផ្ទៃខាងក្រោយបានទេ');
        } finally {
            setUploading(false);
        }
    };

    const handlePrint = () => {
        const selected = students.filter(s => selectedIds.includes(s._id));
        if (selected.length === 0) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head><title>អត្តសញ្ញាណប័ណ្ណ</title>
            <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: 54mm 85.6mm; margin: 0; }
                body { font-family: 'Kantumruy Pro', sans-serif; margin: 0; padding: 0; }
                .id-card { width: 54mm; height: 85.6mm; padding: 2mm; box-sizing: border-box; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); background-size: contain; background-position: center; background-repeat: no-repeat; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
                .id-card:last-child { page-break-after: auto; }
                .id-card-inner { background: rgba(255, 255, 255, 1); border-radius: 3mm; padding: 3mm; flex: 1; display: flex; flex-direction: column; gap: 2mm; align-items: center; }
                .photo { width: 26mm; height: 33mm; background: #e2e8f0; border-radius: 2mm; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #94a3b8; flex-shrink: 0; overflow: hidden; margin-top: 1mm; }
                .photo img { width: 100%; height: 100%; object-fit: cover; }
                .info { width: 100%; flex: 1; font-size: 8px; display: flex; flex-direction: column; justify-content: center; text-align: center; }
                .info h2 { font-size: 10px; font-weight: 700; color: #1e40af; margin: 0 0 2px; }
                .info .school-name { font-size: 7px; color: #64748b; margin-bottom: 3px; }
                .info .row { display: flex; justify-content: space-between; padding: 1px 0; text-align: left; }
                .info .label { color: #94a3b8; }
                .info .value { font-weight: 600; color: #1e293b; }
                .id-no { font-size: 6px; text-align: center; color: #94a3b8; margin-top: 2px; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
            </head>
            <body>${selected.map(renderCardToString).join('')}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    const renderCardToString = (student) => {
        const bg = background
            ? `background-image:url('${background}'); background-size: contain; background-position: center; background-repeat: no-repeat;`
            : '';
        const inner = `
            <div class="id-card" style="${bg}">
                <div class="id-card-inner">
                    <div class="photo">${student.profileImage && student.profileImage !== 'no-photo.jpg' ? `<img src="${student.profileImage}" alt="${student.fullNameKh}" />` : USER_ICON_SVG}</div>
                    <div class="info">
                        <h2>${student.fullNameKh}</h2>
                        <div class="school-name">School Management</div>
                        <div class="row"><span class="label">ID:</span><span class="value">${student.studentId}</span></div>
                        <div class="row"><span class="label">ភេទ:</span><span class="value">${student.gender}</span></div>
                        <div class="row"><span class="label">ថ្នាក់:</span><span class="value">${student.class?.className || '--'}</span></div>
                        ${student.fullNameEn ? `<div class="row"><span class="label">EN:</span><span class="value">${student.fullNameEn}</span></div>` : ''}
                        <div class="id-no">ប្រព័ន្ធគ្រប់គ្រងសាលារៀន</div>
                    </div>
                </div>
            </div>`;
        return inner;
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ប័ណ្ណសម្គាល់សិស្ស</h1>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {user?.role === 'superadmin' && (
                        <div><label className="block text-sm font-medium mb-1">សាលារៀន</label><select value={selectedSchool} onChange={e => { setSelectedSchool(e.target.value); setSelectedClass(''); setSelectedIds([]); }} className="w-full p-2 border rounded"><option value="">-- ជ្រើសរើស --</option>{schools.map(s => <option key={s._id} value={s._id}>{s.schoolName}</option>)}</select></div>
                    )}
                    <div><label className="block text-sm font-medium mb-1">ថ្នាក់</label><select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedIds([]); }} className="w-full p-2 border rounded" disabled={!schoolId}><option value="">--</option>{classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}</select></div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ផ្ទៃខាងក្រោយប័ណ្ណ</label>
                        <button type="button" onClick={() => bgInputRef.current?.click()} disabled={!schoolId || uploading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                            {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} {background ? 'ប្តូររូបផ្ទៃខាងក្រោយ' : 'ផ្ទុករូបផ្ទៃខាងក្រោយ'}
                        </button>
                        <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                        {background && (
                            <div className="mt-2 relative">
                                <img src={background} alt="background" className="h-16 w-full object-cover rounded border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={handleBackgroundRemove}
                                    disabled={uploading}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                                    title="លុបរូបផ្ទៃខាងក្រោយ"
                                >
                                    <FaTimes size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div><button onClick={handlePrint} disabled={selectedIds.length === 0} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"><FaPrint /> បោះពុម្ព ({selectedIds.length})</button></div>
                </div>
            </div>

            {selectedClass && students.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-gray-700">ជ្រើសរើសសិស្ស</h2>
                        <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                            {allSelected ? <FaCheckSquare /> : <FaSquare />} {allSelected ? 'ឈប់ជ្រើសរើសទាំងអស់' : 'ជ្រើសរើសទាំងអស់'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                        {students.map(s => {
                            const checked = selectedIds.includes(s._id);
                            return (
                                <label key={s._id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${checked ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="checkbox" checked={checked} onChange={() => toggleStudent(s._id)} className="accent-blue-600" />
                                    <span className="text-sm text-gray-700">{s.fullNameKh}</span>
                                    <span className="ml-auto text-xs text-gray-400">{s.studentId}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}

            {selectedIds.length > 0 && (
                <div className="mt-6">
                    <h2 className="font-semibold text-gray-700 mb-3">មើលជាមុន ({selectedIds.length})</h2>
                    <div className="flex flex-wrap gap-4">
                        {students.filter(s => selectedIds.includes(s._id)).map(s => (
                            <div key={s._id} className="id-card" style={{ width: '204px', height: '324px', padding: '8px', boxSizing: 'border-box', background: background ? `url("${background}") center/contain no-repeat` : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', borderRadius: '4px' }}>
                                <div className="id-card-inner" style={{ background: 'rgba(255, 255, 255, 1)', borderRadius: '3px', padding: '4px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <div className="photo" style={{ width: '100px', height: '130px', background: '#e2e8f0', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#94a3b8', flexShrink: 0, overflow: 'hidden', marginTop: '2px' }}>
                                        {s.profileImage && s.profileImage !== 'no-photo.jpg'
                                            ? <img src={s.profileImage} alt={s.fullNameKh} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <FaUser />}
                                    </div>
                                    <div className="info" style={{ width: '100%', flex: 1, fontSize: '9px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                                        <h2 style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', margin: '0 0 2px' }}>{s.fullNameKh}</h2>
                                        <div className="school-name" style={{ fontSize: '7px', color: '#64748b', marginBottom: '2px' }}>School Management</div>
                                        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px', textAlign: 'left' }}><span className="label" style={{ color: '#94a3b8' }}>ID:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b' }}>{s.studentId}</span></div>
                                        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px', textAlign: 'left' }}><span className="label" style={{ color: '#94a3b8' }}>ភេទ:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b' }}>{s.gender}</span></div>
                                        <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px', textAlign: 'left' }}><span className="label" style={{ color: '#94a3b8' }}>ថ្នាក់:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b' }}>{s.class?.className || '--'}</span></div>
                                        {s.fullNameEn && <div className="row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0', fontSize: '8px', textAlign: 'left' }}><span className="label" style={{ color: '#94a3b8' }}>EN:</span><span className="value" style={{ fontWeight: 600, color: '#1e293b', fontSize: '7px' }}>{s.fullNameEn}</span></div>}
                                        <div className="id-no" style={{ fontSize: '6px', textAlign: 'center', color: '#94a3b8', marginTop: '1px' }}>ប្រព័ន្ធគ្រប់គ្រងសាលារៀន</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {selectedClass && students.length === 0 && <div className="text-center py-16 text-gray-400"><FaIdCard className="mx-auto text-5xl mb-4 text-blue-200" /><p>គ្មានសិស្សក្នុងថ្នាក់នេះ</p></div>}
            {!selectedClass && <div className="text-center py-16 text-gray-400"><FaIdCard className="mx-auto text-5xl mb-4 text-blue-200" /><p>ជ្រើសរើសថ្នាក់រៀនដើម្បីបោះពុម្ព</p></div>}
        </div>
    );
};

export default StudentIDCard;
