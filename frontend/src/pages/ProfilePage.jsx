import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        // <-- Updated
        return <div>កំពុង​ផ្ទុក​ទិន្នន័យ​អ្នក​ប្រើ...</div>;
    }

    return (
        <div>
            {/* <-- Updated */}
            <h1 className="text-2xl font-bold mb-4">ប្រវត្តិរូប</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-md">
                <div className="flex items-center space-x-4 mb-6">
                    <img
                        className="w-16 h-16 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`}
                        alt="User Avatar"
                    />
                    <div>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>

                <div>
                    {/* <-- Updated */}
                    <h3 className="text-lg font-medium text-gray-800 border-b pb-2 mb-4">ព័ត៌មានលម្អិត</h3>
                    <div className="space-y-3">
                        <div className="flex">
                            {/* <-- Updated */}
                            <strong className="w-24">ឈ្មោះ:</strong>
                            <span className="text-gray-700">{user.name}</span>
                        </div>
                        <div className="flex">
                            {/* <-- Updated */}
                            <strong className="w-24">អ៊ីមែល:</strong>
                            <span className="text-gray-700">{user.email}</span>
                        </div>
                        <div className="flex">
                            {/* <-- Updated */}
                            <strong className="w-24">តួនាទី:</strong>
                            <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800 capitalize">
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;