import React from 'react';

const STATUS_COLORS = {
    'សកម្ម': 'bg-green-100 text-green-800',
    'អសកម្ម': 'bg-red-100 text-red-800',
    'សុំច្បាប់': 'bg-yellow-100 text-yellow-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    leave: 'bg-blue-100 text-blue-800',
};

const Badge = ({ value, color }) => {
    const classes = color || STATUS_COLORS[value] || 'bg-gray-100 text-gray-800';
    return (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
            {value}
        </span>
    );
};

export default Badge;
