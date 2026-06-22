import React from 'react';
import { FiX } from 'react-icons/fi';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <FiX size={20} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-1">School Management</h2>
                <p className="text-sm text-gray-500 mb-4">Version 1.0.0</p>

                <div className="text-sm text-gray-600 space-y-3">
                    <p>School Management is a desktop application for managing schools, teachers, students, classes, attendance, and scores.</p>

                    <hr className="border-gray-200" />

                    <h3 className="font-semibold text-gray-800">MIT License</h3>
                    <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans leading-relaxed">
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
