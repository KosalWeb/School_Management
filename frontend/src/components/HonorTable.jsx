import React, { useState, useRef, useEffect } from 'react';
import api from '../config/api';
import { ClipLoader } from 'react-spinners';
import { FaGripVertical } from 'react-icons/fa';

const MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
const EXAM_TYPES = [...MONTHS, 'ឆមាសទី១', 'ឆមាសទី២'];

const studentAvatar = (name, image) =>
    image && image !== 'no-photo.jpg'
        ? image
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;

const PodiumCard = ({ student, rank, index, dragging, hovering, onPointerDown, setSlotRef }) => {
    return (
        <div
            ref={student ? (el) => setSlotRef(index, el) : null}
            onPointerDown={student ? (e) => onPointerDown(e, index) : undefined}
            style={student ? { touchAction: 'none' } : undefined}
            className={`flex flex-col items-center select-none rounded-xl ${
                student ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            } ${dragging ? 'opacity-40' : ''} ${
                hovering ? 'ring-4 ring-blue-400 ring-offset-2' : ''
            }`}
        >
            {student ? (
                <>
                    <div className="mb-2 flex flex-col items-center px-2">
                        <div className="mb-1 text-2xl font-extrabold text-gray-800 drop-shadow">{rank}</div>
                        <div className="mb-1">
                            <img
                                src={studentAvatar(student.studentName, student.profileImage)}
                                alt={student.studentName}
                                className="w-16 h-20 rounded-lg object-cover shadow-md ring-2 ring-white"
                            />
                        </div>
                        <div className="font-bold text-gray-800 text-sm leading-tight text-center max-w-[160px] truncate">{student.studentName}</div>
                    </div>
                </>
            ) : (
                <div className="w-36 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm h-28 mt-auto">
                    ទំនេរ
                </div>
            )}
        </div>
    );
};

const HonorTable = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [examType, setExamType] = useState(EXAM_TYPES[0]);
    const [honorList, setHonorList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [ghost, setGhost] = useState(null);

    const slotRefs = useRef({});
    const hoverIndexRef = useRef(null);

    const setSlotRef = (index, el) => {
        if (el) slotRefs.current[index] = el;
        else delete slotRefs.current[index];
    };

    const handlePointerDown = (e, index) => {
        e.preventDefault();
        setDragIndex(index);
        setGhost({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        if (dragIndex === null) return;

        const handleMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            setGhost({ x, y });
            let found = null;
            for (const [key, el] of Object.entries(slotRefs.current)) {
                if (!el) continue;
                const r = el.getBoundingClientRect();
                if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                    found = Number(key);
                    break;
                }
            }
            hoverIndexRef.current = found;
            setHoverIndex(found);
        };

        const handleUp = () => {
            const toIndex = hoverIndexRef.current;
            if (toIndex !== null && toIndex !== dragIndex) {
                setHonorList((prev) => {
                    const list = [...prev];
                    if (dragIndex < 0 || toIndex < 0 || dragIndex >= list.length || toIndex >= list.length) return prev;
                    const dragged = list[dragIndex];
                    const target = list[toIndex];
                    const next = [...list];
                    next[dragIndex] = target ? { ...target, rank: dragIndex + 1 } : null;
                    next[toIndex] = dragged ? { ...dragged, rank: toIndex + 1 } : null;
                    return next;
                });
            }
            setDragIndex(null);
            hoverIndexRef.current = null;
            setHoverIndex(null);
            setGhost(null);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        };
    }, [dragIndex]);

    const needsSixth = honorList.length >= 6 && honorList[4].rank === honorList[5].rank;
    const podiumCount = needsSixth ? 6 : 5;

    const renderSlot = (rank) => {
        const index = rank - 1;
        return (
            <PodiumCard
                student={honorList[index]}
                rank={rank}
                index={index}
                dragging={dragIndex === index}
                hovering={hoverIndex === index}
                onPointerDown={handlePointerDown}
                setSlotRef={setSlotRef}
            />
        );
    };

    React.useEffect(() => {
        api.get('/schools').then((res) => setSchools(res.data)).catch(() => {});
    }, []);

    React.useEffect(() => {
        setSelectedClass('');
        if (selectedSchool) {
            api.get(`/classes?school=${selectedSchool}`).then((res) => setClasses(res.data)).catch(() => setClasses([]));
        } else {
            setClasses([]);
        }
    }, [selectedSchool]);

    const handleSearch = async () => {
        if (!selectedClass) return;
        try {
            setIsLoading(true);
            setHasSearched(true);
            const params = new URLSearchParams();
            params.append('classId', selectedClass);
            params.append('examType', examType);
            if (selectedSchool) params.append('schoolId', selectedSchool);

            const res = await api.get(`/student-scores/honor?${params.toString()}`);
            setHonorList(res.data);
        } catch (error) {
            console.error('Could not fetch honor table', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">តារាងកិត្តិយស</h1>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">សាលា</label>
                        <select
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            <option value="">-- ជ្រើសរើស --</option>
                            {schools.map((s) => (
                                <option key={s._id} value={s._id}>{s.schoolName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ថ្នាក់</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            <option value="">-- ជ្រើសរើស --</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>{c.className}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ប្រភេទប្រឡង</label>
                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            style={{ color: '#000', background: '#fff' }}
                        >
                            {EXAM_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={!selectedClass}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            ស្វែងរក
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-8">
                    <ClipLoader size={40} />
                </div>
            )}

            {!isLoading && hasSearched && honorList.length === 0 && (
                <p className="text-center text-gray-500 py-8">មិនមានទិន្នន័យពិន្ទុ</p>
            )}

            {!isLoading && honorList.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-b from-amber-50 to-white p-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-gray-800 text-center">កំពូលកិត្តិយស</h2>
                        <button
                            onClick={handleSearch}
                            className="bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                            title="ប្តូរតាមលំដាប់ពិន្ទុ"
                        >
                            ស្តារឡើងវិញ
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mb-8">អូសសិស្សទៅទីតាំងផ្សេង ដើម្បីប្តូរចំណាត់ថ្នាក់</p>
                    <div className="flex flex-col items-center gap-8">
                        {renderSlot(1)}
                        <div className="flex items-end gap-6">
                            {renderSlot(2)}
                            {renderSlot(3)}
                        </div>
                        <div className="flex items-end gap-6">
                            {renderSlot(4)}
                            {renderSlot(5)}
                            {needsSixth && renderSlot(6)}
                        </div>
                    </div>
                </div>

                    {honorList.length > podiumCount && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600 w-16">ចំណាត់ថ្នាក់</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600 w-14">រូបភាព</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">គោត្តនាម និងនាម</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">លេខសម្គាល់</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">ពិន្ទុមធ្យម</th>
                                        <th className="px-4 py-3 text-center font-medium text-gray-600">មុខវិជ្ជាសរុប</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {honorList.slice(podiumCount).map((h, i) => {
                                        const idx = i + podiumCount;
                                        return (
                                            <tr
                                                key={h.studentId}
                                                ref={(el) => setSlotRef(idx, el)}
                                                onPointerDown={(e) => handlePointerDown(e, idx)}
                                                style={{ touchAction: 'none' }}
                                                className={`select-none cursor-grab active:cursor-grabbing hover:bg-gray-50 ${dragIndex === idx ? 'opacity-40' : ''} ${hoverIndex === idx ? 'bg-blue-50' : ''}`}
                                            >
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 text-gray-400 font-bold">
                                                        <FaGripVertical className="text-gray-300" /> #{h.rank}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <img
                                                        src={studentAvatar(h.studentName, h.profileImage)}
                                                        alt={h.studentName}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">{h.studentName}</td>
                                                <td className="px-4 py-3 text-gray-500">{h.studentCode}</td>
                                                <td className="px-4 py-3 text-center font-bold text-lg">{h.averageScore}</td>
                                                <td className="px-4 py-3 text-center">{h.totalSubjects}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {ghost && dragIndex !== null && honorList[dragIndex] && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%, -50%)' }}
                >
                    <img
                        src={studentAvatar(honorList[dragIndex].studentName, honorList[dragIndex].profileImage)}
                        alt={honorList[dragIndex].studentName}
                        className="w-14 h-14 rounded-full object-cover shadow-lg ring-2 ring-blue-400"
                    />
                </div>
            )}
        </div>
    );
};

export default HonorTable;
