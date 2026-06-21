import React, { useRef } from 'react';
import { FaCamera } from 'react-icons/fa';

const AvatarUpload = ({ value, onChange, name = 'profileImage' }) => {
    const inputRef = useRef(null);

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => onChange({ target: { name, value: reader.result } });
        reader.readAsDataURL(file);
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {value ? (
                    <img src={value} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                )}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                    <FaCamera className="text-white" />
                </button>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
};

export default AvatarUpload;
