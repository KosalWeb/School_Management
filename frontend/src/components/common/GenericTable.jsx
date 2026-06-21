import React from 'react';
import { FaEdit, FaTrash, FaInbox } from 'react-icons/fa';

const GenericTable = ({ columns, data, onEdit, onDelete, summary, emptyMessage = 'គ្មានទិន្នន័យ' }) => {
    const renderCell = (item, column, index) => {
        if (column.render) return column.render(item, index);
        if (column.key === 'index') return index + 1;
        if (column.key) return column.key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
        return null;
    };

    return (
        <>
            <div className="hidden md:block overflow-x-auto rounded-lg border">
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
                            data.map((item, index) => (
                                <tr key={item._id || `row-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    {columns.map((col) => (
                                        <td key={`${col.key}-${item._id || index}`} className="py-2 px-4 border-b">
                                            {renderCell(item, col, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {summary && (
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
            </div>
            <div className="md:hidden space-y-3">
                {data.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <FaInbox className="mx-auto text-4xl mb-3" />
                        <p>{emptyMessage}</p>
                    </div>
                ) : (
                    data.map((item, index) => (
                        <div key={item._id || `row-${index}`} className="bg-white rounded-lg shadow-sm border p-4 space-y-2">
                            {columns.map((col) => (
                                <div key={col.key} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-500">{col.label}</span>
                                    <span>{renderCell(item, col, index)}</span>
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
                            {summary && index === data.length - 1 && (
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
            </div>
        </>
    );
};

export default GenericTable;
