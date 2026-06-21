import React from 'react';

export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton ${className}`}>&nbsp;</div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
            <thead>
                <tr className="bg-gray-100">
                    {Array.from({ length: columns }).map((_, i) => (
                        <th key={i} className="py-2 px-4 border">
                            <Skeleton className="h-4 w-24" />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, r) => (
                    <tr key={r}>
                        {Array.from({ length: columns }).map((_, c) => (
                            <td key={c} className="py-2 px-4 border">
                                <Skeleton className="h-4 w-full" />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-gray-200">
        <div className="mr-4">
            <Skeleton className="h-10 w-10 rounded" />
        </div>
        <div className="flex-1">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-16" />
        </div>
    </div>
);
