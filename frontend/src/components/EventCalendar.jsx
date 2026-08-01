import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FaChevronLeft, FaChevronRight, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const TYPE_COLORS = { holiday: 'bg-red-100 text-red-700 border-red-200', exam: 'bg-orange-100 text-orange-700 border-orange-200', meeting: 'bg-blue-100 text-blue-700 border-blue-200', sport: 'bg-green-100 text-green-700 border-green-200', other: 'bg-gray-100 text-gray-700 border-gray-200' };
const TYPE_LABELS = { holiday: 'ថ្ងៃឈប់សម្រាក', exam: 'ប្រឡង', meeting: 'ប្រជុំ', sport: 'កីឡា', other: 'ផ្សេងៗ' };
const MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const DAY_NAMES = ['ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [date, setDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ title: '', date: '', endDate: '', type: 'other', description: '', allSchool: false });

    const year = date.getFullYear();
    const month = date.getMonth();

    useEffect(() => {
        api.get('/events', { params: { month: month + 1, year } }).then(({ data }) => setEvents(data)).catch(() => {});
    }, [month, year]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const getEventsForDay = (day) => events.filter(e => { const d = new Date(e.date); return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year; });

    const prevMonth = () => setDate(new Date(year, month - 1, 1));
    const nextMonth = () => setDate(new Date(year, month + 1, 1));

    const openAdd = (day) => { setEditItem(null); const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; setForm({ title: '', date: d, endDate: '', type: 'other', description: '', allSchool: false }); setShowModal(true); };
    const openEdit = (item) => { setEditItem(item); setForm({ title: item.title, date: item.date?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '', type: item.type, description: item.description || '', allSchool: item.allSchool || false }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.date) { showErrorToast('Please fill required fields'); return; }
        try {
            const userInfo = JSON.parse(localStorage.getItem('user')) || {};
            const payload = { ...form };
            if (userInfo.school) payload.school = userInfo.school;
            if (editItem) { await api.put(`/events/${editItem._id}`, payload); showSuccessToast('Updated'); }
            else { await api.post('/events', payload); showSuccessToast('Created'); }
            setShowModal(false);
        } catch (error) { showErrorToast(error.response?.data?.message || 'Failed'); }
    };

    const handleDelete = (id) => { showConfirmDialog({ title: 'Delete?', onConfirm: async () => { try { await api.delete(`/events/${id}`); showSuccessToast('Deleted'); } catch { showErrorToast('Failed'); } } }); };

    const todayStr = new Date().toDateString();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ប្រតិទិនព្រឹត្តិការណ៍</h1>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded"><FaChevronLeft /></button>
                    <h2 className="text-xl font-bold">{MONTHS[month]} {year}</h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded"><FaChevronRight /></button>
                </div>

                <div className="grid grid-cols-7 bg-gray-100 border-b">
                    {DAY_NAMES.map(d => <div key={d} className="py-2 text-center text-sm font-semibold text-gray-600">{d}</div>)}
                </div>

                <div className="grid grid-cols-7">
                    {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} className="min-h-[90px] bg-gray-50/50 border-b border-r p-1" />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        const isToday = new Date(year, month, day).toDateString() === todayStr;
                        return (
                            <div key={day} className={`min-h-[90px] border-b border-r p-1 hover:bg-blue-50/50 cursor-pointer relative ${isToday ? 'bg-blue-50' : ''}`} onClick={() => openAdd(day)}>
                                <span className={`text-xs font-semibold mb-1 inline-block w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>{day}</span>
                                <div className="space-y-0.5">
                                    {dayEvents.slice(0, 3).map(e => (
                                        <div key={e._id} className={`text-[10px] px-1 py-0.5 rounded border cursor-pointer flex items-center gap-1 ${TYPE_COLORS[e.type] || TYPE_COLORS.other}`} onClick={e => { e.stopPropagation(); openEdit(e); }}>
                                            <span className="truncate">{e.title}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 3} ទៀត</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <span key={k} className={`px-3 py-1 rounded-full text-xs font-medium border ${TYPE_COLORS[k]}`}>{v}</span>)}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">{editItem ? 'កែសម្រួល' : 'បន្ថែម'} ព្រឹត្តិការណ៍</h2><button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="block text-sm font-medium mb-1">ចំណងជើង *</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2 border rounded" required /></div>
                            <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium mb-1">ថ្ងៃចាប់ផ្ដើម *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border rounded" required /></div><div><label className="block text-sm font-medium mb-1">ថ្ងៃបញ្ចប់</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full p-2 border rounded" /></div></div>
                            <div><label className="block text-sm font-medium mb-1">ប្រភេទ</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full p-2 border rounded">{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                            <div><label className="block text-sm font-medium mb-1">បរិយាយ</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border rounded" rows={2} /></div>
                            <div className="flex gap-2 pt-2"><button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editItem ? 'ធ្វើបច្ចុប្បន្នភាព' : 'បន្ថែម'}</button>{editItem && <button type="button" onClick={() => handleDelete(editItem._id)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">លុប</button>}<button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">បោះបង់</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCalendar;
