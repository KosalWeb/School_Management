import React, { useState, useMemo, useEffect } from 'react';
import api from '../config/api';
import GenericTable from './common/GenericTable';
import * as XLSX from 'xlsx';
import { ClipLoader } from 'react-spinners';

const Report = () => {
    // Original data state
    const [schoolData, setSchoolData] = useState([]);
    const [classData, setClassData] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Centralized global filter state for all tables
    const [globalFilter, setGlobalFilter] = useState({ level: '', schoolName: '', className: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [schoolsRes, classesRes, studentsRes] = await Promise.all([
                api.get('/schools'),
                api.get('/classes'),
                api.get('/students')
            ]);
            setSchoolData(schoolsRes.data);
            setClassData(classesRes.data);
            setStudentData(studentsRes.data);
        } catch (error) {
            console.error('Could not fetch report data', error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Column Definitions ---
    const summaryByLevelColumns = [
        { key: 'schoolLevel', label: 'កម្រិតសាលា' },
        { key: 'schoolCount', label: 'ចំនួនសាលា' },
        { key: 'teacherCount', label: 'ចំនួនគ្រូ (សរុប / ស្រី)', render: (item) => `${item.teacherCount || 0} / ${item.teacherCountFemale || 0}` },
        { key: 'classCount', label: 'ចំនួនថ្នាក់' },
        { key: 'studentCount', label: 'ចំនួនសិស្ស (សរុប / ស្រី)', render: (item) => `${item.studentCountTotal || 0} / ${item.studentCountFemale || 0}` }
    ];

    const schoolReportColumns = [
        { key: 'schoolName', label: 'ឈ្មោះសាលា', render: (item) => [item.schoolLevel, item.schoolName].filter(Boolean).join(' - ') },
        { key: 'teacherCount', label: 'ចំនួនគ្រូ (សរុប / ស្រី)', render: (item) => `${item.teacherCount || 0} / ${item.teacherCountFemale || 0}` },
        { key: 'classCount', label: 'ចំនួនថ្នាក់' },
        { key: 'studentCount', label: 'ចំនួនសិស្ស (សរុប / ស្រី)', render: (item) => `${item.studentCountTotal || 0} / ${item.studentCountFemale || 0}` }
    ];

    const classSummaryColumns = [
        { key: 'schoolName', label: 'ឈ្មោះសាលា', render: (item) => [item.schoolLevel, item.schoolName].filter(Boolean).join(' - ') },
        { key: 'className', label: 'ឈ្មោះថ្នាក់' },
        { key: 'studentCount', label: 'ចំនួនសិស្ស (សរុប / ស្រី)', render: (item) => `${item.studentCountTotal || 0} / ${item.studentCountFemale || 0}` }
    ];

    // --- Base Data Processing ---
    const summaryByLevel = useMemo(() => {
        if (!schoolData || schoolData.length === 0) return [];
        const levelMap = new Map();
        schoolData.forEach(school => {
            const level = school.schoolLevel || 'មិនបានបញ្ជាក់';
            if (!levelMap.has(level)) {
                levelMap.set(level, {
                    schoolLevel: level, schoolCount: 0, teacherCount: 0, teacherCountFemale: 0,
                    classCount: 0, studentCountTotal: 0, studentCountFemale: 0,
                });
            }
            const current = levelMap.get(level);
            current.schoolCount += 1;
            current.teacherCount += school.teacherCount || 0;
            current.teacherCountFemale += school.teacherCountFemale || 0;
            current.classCount += school.classCount || 0;
            current.studentCountTotal += school.studentCountTotal || 0;
            current.studentCountFemale += school.studentCountFemale || 0;
        });
        return Array.from(levelMap.values());
    }, [schoolData]);

    const sortedSchoolData = useMemo(() => {
        if (!schoolData) return [];
        return [...schoolData].sort((a, b) => {
            const levelCompare = (a.schoolLevel || '').localeCompare(b.schoolLevel || '');
            if (levelCompare !== 0) return levelCompare;
            return (a.schoolName || '').localeCompare(b.schoolName || '');
        });
    }, [schoolData]);

    const summaryByClass = useMemo(() => {
        if (!classData || classData.length === 0 || !studentData) return [];
        const classStudentCounts = studentData.reduce((acc, student) => {
            const classId = student.class?._id?.toString();
            if (!classId) return acc;
            if (!acc[classId]) {
                acc[classId] = { studentCountTotal: 0, studentCountFemale: 0 };
            }
            acc[classId].studentCountTotal += 1;
            if (student.gender === 'ស្រី') acc[classId].studentCountFemale += 1;
            return acc;
        }, {});

        const classSummary = classData.map(classItem => ({
            schoolLevel: classItem.school?.schoolLevel || 'មិនបានបញ្ជាក់',
            schoolName: classItem.school?.schoolName || 'មិនបានបញ្ជាក់',
            className: classItem.className || 'មិនបានបញ្ជាក់',
            studentCountTotal: classStudentCounts[classItem._id]?.studentCountTotal || 0,
            studentCountFemale: classStudentCounts[classItem._id]?.studentCountFemale || 0
        }));

        classSummary.sort((a, b) => {
            const levelCompare = (a.schoolLevel.toLowerCase()).localeCompare(b.schoolLevel.toLowerCase());
            if (levelCompare !== 0) return levelCompare;
            const nameCompare = (a.schoolName.toLowerCase()).localeCompare(b.schoolName.toLowerCase());
            if (nameCompare !== 0) return nameCompare;
            return (a.className.toLowerCase()).localeCompare(b.className.toLowerCase());
        });
        return classSummary;
    }, [classData, studentData]);

    // --- Dynamic Dropdown Option Lists for Global Filter ---
    const uniqueSchoolLevels = useMemo(() => {
        const levels = new Set(schoolData.map(item => item.schoolLevel).filter(Boolean));
        return Array.from(levels).sort((a, b) => a.localeCompare(b));
    }, [schoolData]);

    const schoolOptionsForGlobalFilter = useMemo(() => {
        if (!globalFilter.level) return [];
        const relevantSchools = schoolData.filter(school => school.schoolLevel === globalFilter.level);
        const names = new Set(relevantSchools.map(item => item.schoolName).filter(Boolean));
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [schoolData, globalFilter.level]);

    const classOptionsForGlobalFilter = useMemo(() => {
        if (!globalFilter.schoolName) return [];
        let relevantClasses = classData;
        if (globalFilter.level) {
            relevantClasses = relevantClasses.filter(c => c.school?.schoolLevel === globalFilter.level);
        }
        if (globalFilter.schoolName) {
            relevantClasses = relevantClasses.filter(c => c.school?.schoolName === globalFilter.schoolName);
        }
        const names = new Set(relevantClasses.map(item => item.className).filter(Boolean));
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [classData, globalFilter.level, globalFilter.schoolName]);

    // --- Filtering Logic for Each Table (Using Global Filter) ---
    const filteredSummaryByLevel = useMemo(() => {
        if (!globalFilter.level) return summaryByLevel;
        return summaryByLevel.filter(item => item.schoolLevel === globalFilter.level);
    }, [summaryByLevel, globalFilter.level]);

    const filteredSchoolData = useMemo(() => {
        return sortedSchoolData.filter(school => {
            const levelMatch = !globalFilter.level || (school.schoolLevel || '') === globalFilter.level;
            const nameMatch = !globalFilter.schoolName || (school.schoolName || '') === globalFilter.schoolName;
            return levelMatch && nameMatch;
        });
    }, [sortedSchoolData, globalFilter.level, globalFilter.schoolName]);

    const filteredSummaryByClass = useMemo(() => {
        return summaryByClass.filter(item => {
            const levelMatch = !globalFilter.level || (item.schoolLevel || '') === globalFilter.level;
            const schoolNameMatch = !globalFilter.schoolName || (item.schoolName || '') === globalFilter.schoolName;
            const classNameMatch = !globalFilter.className || (item.className || '') === globalFilter.className;
            return levelMatch && schoolNameMatch && classNameMatch;
        });
    }, [summaryByClass, globalFilter.level, globalFilter.schoolName, globalFilter.className]);

    // --- Summary Row Calculations ---
    const grandTotalSummaryForLevelTable = useMemo(() => {
        if (!filteredSummaryByLevel || filteredSummaryByLevel.length === 0) return null;
        const totals = filteredSummaryByLevel.reduce((acc, item) => {
            acc.schoolCount += item.schoolCount || 0;
            acc.teacherCount += item.teacherCount || 0;
            acc.teacherCountFemale += item.teacherCountFemale || 0;
            acc.classCount += item.classCount || 0;
            acc.studentCountTotal += item.studentCountTotal || 0;
            acc.studentCountFemale += item.studentCountFemale || 0;
            return acc;
        }, { schoolCount: 0, teacherCount: 0, teacherCountFemale: 0, classCount: 0, studentCountTotal: 0, studentCountFemale: 0 });
        return { ...totals, schoolLevel: 'សរុបទាំងអស់' };
    }, [filteredSummaryByLevel]);

    const summaryRowForFilteredSchools = useMemo(() => {
        if (!filteredSchoolData || filteredSchoolData.length === 0) return null;
        const totals = filteredSchoolData.reduce((acc, school) => {
            acc.teacherCount += school.teacherCount || 0;
            acc.teacherCountFemale += school.teacherCountFemale || 0;
            acc.classCount += school.classCount || 0;
            acc.studentCountTotal += school.studentCountTotal || 0;
            acc.studentCountFemale += school.studentCountFemale || 0;
            return acc;
        }, { teacherCount: 0, teacherCountFemale: 0, classCount: 0, studentCountTotal: 0, studentCountFemale: 0 });
        return {
            ...totals,
            schoolName: `សរុបទាំងអស់ (សាលា: ${filteredSchoolData.length})`,
        };
    }, [filteredSchoolData]);

    const grandTotalSummaryForClassTable = useMemo(() => {
        if (!filteredSummaryByClass || filteredSummaryByClass.length === 0) return null;
        const totals = filteredSummaryByClass.reduce((acc, classItem) => {
            acc.studentCountTotal += classItem.studentCountTotal || 0;
            acc.studentCountFemale += classItem.studentCountFemale || 0;
            return acc;
        }, { studentCountTotal: 0, studentCountFemale: 0 });
        return {
            ...totals,
            className: `សរុបទាំងអស់ (ថ្នាក់: ${filteredSummaryByClass.length})`,
        };
    }, [filteredSummaryByClass]);

    // --- Excel Export ---
    const handleExcelExport = () => {
        // This function will export the data currently visible in the tables
        // 1. Create the first worksheet: Summary by Level
        const summaryLevelHeaders = ["កម្រិតសាលា", "ចំនួនសាលា", "ចំនួនគ្រូ (សរុប)", "ចំនួនគ្រូ (ស្រី)", "ចំនួនថ្នាក់", "សិស្សសរុប", "សិស្សស្រី"];
        const summaryLevelData = filteredSummaryByLevel.map(item => ([
            item.schoolLevel, item.schoolCount, item.teacherCount, item.teacherCountFemale,
            item.classCount, item.studentCountTotal, item.studentCountFemale
        ]));
        if (grandTotalSummaryForLevelTable) {
            summaryLevelData.push([]);
            summaryLevelData.push([
                grandTotalSummaryForLevelTable.schoolLevel, grandTotalSummaryForLevelTable.schoolCount,
                grandTotalSummaryForLevelTable.teacherCount, grandTotalSummaryForLevelTable.teacherCountFemale,
                grandTotalSummaryForLevelTable.classCount, grandTotalSummaryForLevelTable.studentCountTotal,
                grandTotalSummaryForLevelTable.studentCountFemale,
            ]);
        }
        const worksheet1 = XLSX.utils.aoa_to_sheet([summaryLevelHeaders, ...summaryLevelData]);

        // 2. Create the second worksheet: Detailed Report
        const detailHeaders = ["កម្រិតសាលា", "ឈ្មោះសាលា", "ចំនួនគ្រូ (សរុប)", "ចំនួនគ្រូ (ស្រី)", "ចំនួនថ្នាក់", "សិស្សសរុប", "សិស្សស្រី"];
        const detailData = filteredSchoolData.map(school => ([
            school.schoolLevel, school.schoolName, school.teacherCount || 0, school.teacherCountFemale || 0,
            school.classCount || 0, school.studentCountTotal || 0, school.studentCountFemale || 0
        ]));
        if (summaryRowForFilteredSchools) {
            detailData.push([]);
            detailData.push([
                '', summaryRowForFilteredSchools.schoolName.replace('សរុបទាំងអស់', 'សរុប'),
                summaryRowForFilteredSchools.teacherCount, summaryRowForFilteredSchools.teacherCountFemale,
                summaryRowForFilteredSchools.classCount, summaryRowForFilteredSchools.studentCountTotal,
                summaryRowForFilteredSchools.studentCountFemale
            ]);
        }
        const worksheet2 = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailData]);

        // 3. Create the third worksheet: Summary by Class
        const classSummaryHeaders = ["កម្រិតសាលា", "ឈ្មោះសាលា", "ឈ្មោះថ្នាក់", "សិស្សសរុប", "សិស្សស្រី"];
        const classSummaryData = filteredSummaryByClass.map(item => ([
            item.schoolLevel, item.schoolName, item.className,
            item.studentCountTotal, item.studentCountFemale
        ]));
        if (grandTotalSummaryForClassTable) {
            classSummaryData.push([]);
            classSummaryData.push([
                '', '', grandTotalSummaryForClassTable.className.replace('សរុបទាំងអស់', 'សរុប'),
                grandTotalSummaryForClassTable.studentCountTotal, grandTotalSummaryForClassTable.studentCountFemale
            ]);
        }
        const worksheet3 = XLSX.utils.aoa_to_sheet([classSummaryHeaders, ...classSummaryData]);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet1, "Summary By Level");
        XLSX.utils.book_append_sheet(workbook, worksheet2, "Detailed Report");
        XLSX.utils.book_append_sheet(workbook, worksheet3, "Summary By Class");
        XLSX.writeFile(workbook, "School_Report_Filtered.xlsx");
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><ClipLoader size={40} /></div>;
    }

    return (
        <div className="p-4 space-y-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">របាយការណ៍</h1>
                <button onClick={handleExcelExport} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Export to Excel
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">តម្រងទិន្នន័យសកល</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        value={globalFilter.level}
                        onChange={e => setGlobalFilter({ level: e.target.value, schoolName: '', className: '' })}
                        className="p-2 border rounded-md w-full bg-white"
                    >
                        <option value="">ជ្រើសរើសកម្រិត</option>
                        {uniqueSchoolLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                    <select
                        value={globalFilter.schoolName}
                        onChange={e => setGlobalFilter(prev => ({ ...prev, schoolName: e.target.value, className: '' }))}
                        disabled={!globalFilter.level}
                        className="p-2 border rounded-md w-full bg-white disabled:bg-gray-100"
                    >
                        <option value="">ជ្រើសរើសសាលា</option>
                        {schoolOptionsForGlobalFilter.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <select
                        value={globalFilter.className}
                        onChange={e => setGlobalFilter(prev => ({ ...prev, className: e.target.value }))}
                        disabled={!globalFilter.schoolName}
                        className="p-2 border rounded-md w-full bg-white disabled:bg-gray-100"
                    >
                        <option value="">ជ្រើសរើសថ្នាក់</option>
                        {classOptionsForGlobalFilter.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">របាយការណ៍សរុបតាមកម្រិត</h2>
                <GenericTable
                    columns={summaryByLevelColumns}
                    data={filteredSummaryByLevel}
                    summary={grandTotalSummaryForLevelTable}
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">របាយការណ៍លម្អិតតាមសាលា</h2>
                <GenericTable
                    columns={schoolReportColumns}
                    data={filteredSchoolData}
                    summary={summaryRowForFilteredSchools}
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">របាយការណ៍សរុបតាមថ្នាក់</h2>
                <GenericTable
                    columns={classSummaryColumns}
                    data={filteredSummaryByClass}
                    summary={grandTotalSummaryForClassTable}
                />
            </div>
        </div>
    );
};

export default Report;