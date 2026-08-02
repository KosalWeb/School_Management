import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { FaEdit, FaTrash, FaInbox, FaChevronLeft, FaChevronRight, FaFileExcel, FaFilePdf } from 'react-icons/fa';

const GenericTable = ({ columns, data, onEdit, onDelete, summary, emptyMessage = 'គ្មានទិន្នន័យ', pageSize = 10, fileName = 'export', showExport = true }) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [data, pageSize]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(data.length / pageSize)), [data, pageSize]);
    const safePage = Math.min(currentPage, totalPages);

    const paginatedData = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, safePage, pageSize]);

    const isLastPage = safePage === totalPages;

    const renderCell = (item, column, index) => {
        if (column.render) return column.render(item, index);
        if (column.key === 'index') return index + 1;
        if (column.key) return column.key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
        return null;
    };

    const globalIndex = (item, localIndex) => (safePage - 1) * pageSize + localIndex;

    const exportColumns = useMemo(() => columns.filter(col => col.key !== 'actions'), [columns]);

    const getExportValue = (item, column, index) => {
        if (column.exportValue) return column.exportValue(item, index);
        const rendered = column.render ? column.render(item, index) : undefined;
        if (typeof rendered === 'string' || typeof rendered === 'number') return String(rendered);
        if (column.key === 'index') return index + 1;
        if (column.key) {
            const val = column.key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
            if (val === null || val === undefined) return '';
            if (typeof val === 'object') return '';
            return String(val);
        }
        return '';
    };

    const exportRows = useMemo(() =>
        data.map((item, index) =>
            exportColumns.map(col => getExportValue(item, col, index))
        ),
        [data, exportColumns]
    );

    const exportToExcel = () => {
        if (data.length === 0) return;
        const headers = exportColumns.map(col => col.label);
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const exportToPdf = () => {
        if (data.length === 0) return;
        const escapeHtml = (str) =>
            String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const thead = exportColumns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('');
        const tbody = exportRows.map(row =>
            `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
        ).join('');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${escapeHtml(fileName)}</title>
                <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4 landscape; margin: 12mm; }
                    body { font-family: 'Kantumruy Pro', sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.5; }
                    h1 { text-align: center; font-size: 18px; margin: 0 0 15px; color: #1e3a8a; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #cbd5e1; padding: 7px 9px; text-align: left; font-size: 11px; }
                    th { background: #1e40af; color: white; font-weight: 600; }
                    td { color: #1e293b; }
                    tr:nth-child(even) td { background: #f8fafc; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <h1>${escapeHtml(fileName)}</h1>
                <table>
                    <thead><tr>${thead}</tr></thead>
                    <tbody>${tbody}</tbody>
                </table>
                <script>window.print(); window.close();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const renderExportBar = () => {
        if (!showExport || data.length === 0) return null;
        return (
            <div className="flex justify-end gap-2 p-3 border-b">
                <button
                    onClick={exportToExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white bg-green-600 hover:bg-green-700"
                    title="នាំចេញទៅ Excel"
                >
                    <FaFileExcel /> Excel
                </button>
                <button
                    onClick={exportToPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white bg-red-600 hover:bg-red-700"
                    title="នាំចេញទៅ PDF"
                >
                    <FaFilePdf /> PDF
                </button>
            </div>
        );
    };

    const renderPagination = () => {
        if (data.length === 0 || totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const window = 2;
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= safePage - window && i <= safePage + window)) {
                    pages.push(i);
                } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...');
                }
            }
            return pages;
        };

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                    បង្ហាញ {(safePage - 1) * pageSize + (paginatedData.length ? 1 : 0)}-{(safePage - 1) * pageSize + paginatedData.length} នៃ {data.length}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="px-2 py-1 rounded border text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="ទំព័រមុន"
                    >
                        <FaChevronLeft />
                    </button>
                    {getPageNumbers().map((p, i) =>
                        p === '...' ? (
                            <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">...</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`px-3 py-1 rounded border text-sm ${
                                    p === safePage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="px-2 py-1 rounded border text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="ទំព័របន្ទាប់"
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="hidden md:block overflow-x-auto rounded-lg border">
                {renderExportBar()}
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="py-3 px-4 border-b text-left font-semibold text-gray-700 whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 text-center text-gray-400">
                                    <FaInbox className="mx-auto text-4xl mb-3" />
                                    <p>{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, index) => (
                                <tr key={item._id || `row-${globalIndex(item, index)}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    {columns.map((col) => (
                                        <td key={`${col.key}-${item._id || globalIndex(item, index)}`} className="py-2 px-4 border-b">
                                            {renderCell(item, col, globalIndex(item, index))}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {summary && isLastPage && (
                        <tfoot className="bg-gray-100 border-t-2 border-gray-200">
                            <tr className="font-semibold text-gray-800">
                                {columns.map((col) => (
                                    <td key={`summary-${col.key}`} className="py-3 px-4">
                                        {col.key === 'index' ? '' : renderCell(summary, col)}
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    )}
                </table>
                {renderPagination()}
            </div>
            <div className="md:hidden space-y-3">
                {renderExportBar()}
                {data.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <FaInbox className="mx-auto text-4xl mb-3" />
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    paginatedData.map((item, index) => (
                        <div key={item._id || `row-${globalIndex(item, index)}`} className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
                            {columns.map((col) => (
                                <div key={col.key} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-500">{col.label}</span>
                                    <span>{renderCell(item, col, globalIndex(item, index))}</span>
                                </div>
                            ))}
                            {(onEdit || onDelete) && (
                                <div className="flex gap-2 pt-2 border-t">
                                    {onEdit && (
                                        <button onClick={() => onEdit(item)} className="flex-1 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                                            <FaEdit className="inline mr-1" /> កែប្រែ
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button onClick={() => onDelete(item._id)} className="flex-1 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                                            <FaTrash className="inline mr-1" /> លុប
                                        </button>
                                    )}
                                </div>
                            )}
                            {summary && isLastPage && index === paginatedData.length - 1 && (
                                <div className="pt-2 border-t font-semibold text-gray-800">
                                    {columns.map((col) => (
                                        <div key={col.key} className="flex justify-between text-sm">
                                            <span>{col.label}</span>
                                            <span>{col.key === 'index' ? '' : renderCell(summary, col)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {renderPagination()}
            </div>
        </>
    );
};

export default GenericTable;
