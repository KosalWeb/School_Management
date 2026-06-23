import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../config/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/alert';
import { FiPlus, FiEdit, FiTrash2, FiKey } from 'react-icons/fi';
import Modal from 'react-modal';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '../context/AuthContext';

Modal.setAppElement('#root');

const UsersPage = () => {
    const { user: loggedInUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [passwordModalIsOpen, setPasswordModalIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm();
    const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

    const selectedRole = watch('role');
    const selectedSchool = watch('school');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, schoolsRes] = await Promise.all([api.get('/users'), api.get('/schools')]);
            setUsers(usersRes.data);
            setSchools(schoolsRes.data);
        } catch (error) {
            showErrorToast('Could not fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        const fetchClasses = async () => {
            if (selectedSchool && (selectedRole === 'teacher' || selectedRole === 'data-entry')) {
                try {
                    const { data } = await api.get(`/classes?schoolId=${selectedSchool}`);
                    setClasses(data);
                } catch (error) {
                    showErrorToast('Could not fetch classes for the selected school.');
                    setClasses([]);
                }
            } else {
                setClasses([]);
            }
        };
        fetchClasses();
    }, [selectedSchool, selectedRole]);

    const openEditModal = (user = null) => {
        reset();
        setSelectedUser(user);
        if (user) {
            setValue('name', user.name);
            setValue('email', user.email);
            setValue('role', user.role);
            if (user.school) setValue('school', user.school._id);
            if (user.classes) setValue('classes', user.classes.map(c => c._id));
            if (user.expiredDate) {
                const d = new Date(user.expiredDate);
                setValue('expiredDate', d.toISOString().split('T')[0]);
            }
        } else {
            if (loggedInUser.role === 'school-admin') {
                setValue('school', loggedInUser.school);
            }
        }
        setEditModalIsOpen(true);
    };

    const closeEditModal = () => {
        setEditModalIsOpen(false);
        setSelectedUser(null);
        reset();
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPasswordModalIsOpen(true);
    };

    const closePasswordModal = () => {
        setPasswordModalIsOpen(false);
        setSelectedUser(null);
        resetPassword();
    };

    const onEditSubmit = async (data) => {
        try {
            const action = selectedUser ? api.put(`/users/${selectedUser._id}`, data) : api.post('/users', data);
            await action;
            showSuccessToast(`User ${selectedUser ? 'updated' : 'created'} successfully!`);
            fetchData();
            closeEditModal();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'An error occurred.');
        }
    };

    const onPasswordSubmit = async (data) => {
        try {
            await api.put(`/users/${selectedUser._id}/password`, data);
            showSuccessToast('Password updated successfully!');
            closePasswordModal();
        } catch (error) {
            showErrorToast(error.response?.data?.message || 'An error occurred.');
        }
    };

    const handleDelete = (userId) => {
        showConfirmDialog({
            title: 'Delete this user?',
            text: "You won't be able to revert this!",
            onConfirm: async () => {
                try {
                    await api.delete(`/users/${userId}`);
                    showSuccessToast('User deleted successfully.');
                    fetchData();
                } catch (error) {
                    showErrorToast('Could not delete user.');
                }
            },
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><ClipLoader size={50} /></div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">គ្រប់គ្រងអ្នកប្រើប្រាស់</h1>
                <button onClick={() => openEditModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    <FiPlus className="mr-2" /> បង្កើតអ្នកប្រើប្រាស់
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.school?.schoolName || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.classes?.length > 0 ? user.classes.map(c => c.className).join(', ') : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.expiredDate ? (
                                        <span className={new Date(user.expiredDate) < new Date() ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                            {new Date(user.expiredDate).toLocaleDateString()}
                                            {new Date(user.expiredDate) < new Date() && ' (Expired)'}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Never</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openPasswordModal(user)} className="text-gray-500 hover:text-yellow-600 mr-4"><FiKey /></button>
                                    <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><FiEdit /></button>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={editModalIsOpen} onRequestClose={closeEditModal} className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl outline-none" overlayClassName="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                <h2 className="text-2xl font-bold mb-4">{selectedUser ? 'Edit User' : 'Create New User'}</h2>
                <form onSubmit={handleSubmit(onEditSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 border rounded" />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input type="email" {...register('email', { required: 'Email is required' })} className="w-full px-3 py-2 border rounded" />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    {!selectedUser && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input type="password" {...register('password', { required: 'Password is required' })} className="w-full px-3 py-2 border rounded" />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700">Role</label>
                        <select {...register('role', { required: 'Role is required' })} className="w-full px-3 py-2 border rounded">
                            <option value="data-entry">Data Entry</option>
                            <option value="teacher">Teacher</option>
                            <option value="school-admin">School Admin</option>
                            {loggedInUser.role === 'superadmin' && (
                                <option value="superadmin">Super Admin</option>
                            )}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Account Expiration Date</label>
                        <input type="date" {...register('expiredDate')} className="w-full px-3 py-2 border rounded" />
                        <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
                    </div>
                    {loggedInUser.role === 'superadmin' && (selectedRole === 'school-admin' || selectedRole === 'teacher' || selectedRole === 'data-entry') && (
                        <div className="mb-4">
                            <label className="block text-gray-700">School</label>
                            <select {...register('school', { required: 'School is required' })} className="w-full px-3 py-2 border rounded">
                                <option value="">Select a school</option>
                                {schools.map(school => (
                                    <option key={school._id} value={school._id}>{school.schoolName}</option>
                                ))}
                            </select>
                            {errors.school && <p className="text-red-500 text-sm">{errors.school.message}</p>}
                        </div>
                    )}
                    {(selectedRole === 'teacher' || selectedRole === 'data-entry') && selectedSchool && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Classes</label>
                            {classes.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 border p-2 rounded-md">
                                    {classes.map(cls => (
                                        <label key={cls._id} className="flex items-center space-x-2">
                                            <input type="checkbox" {...register('classes')} value={cls._id} />
                                            <span>{cls.className}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (<p className="text-sm text-gray-500">No classes found for this school.</p>)}
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button type="button" onClick={closeEditModal} className="mr-2 bg-gray-300 px-4 py-2 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={passwordModalIsOpen} onRequestClose={closePasswordModal} className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md outline-none" overlayClassName="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                <p className="mb-4 text-gray-600">Updating password for: <span className="font-semibold">{selectedUser?.name}</span></p>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700">New Password</label>
                        <input
                            type="password"
                            {...registerPassword('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                            className="w-full px-3 py-2 border rounded"
                        />
                        {passwordErrors.password && <p className="text-red-500 text-sm">{passwordErrors.password.message}</p>}
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={closePasswordModal} className="mr-2 bg-gray-300 px-4 py-2 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update Password</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UsersPage;