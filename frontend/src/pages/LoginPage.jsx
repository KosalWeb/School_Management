import React, { useState, useEffect } from 'react';
import { FaSchool, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('superadmin@gmail.com');
    const [password, setPassword] = useState('123456');
    const [rememberPassword, setRememberPassword] = useState(false);
    const { login, loading } = useAuth();

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberPassword(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rememberPassword) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', password);
        } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
        }
        login(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-primary-dark">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl dark:bg-gray-800">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                        <FaSchool className="text-white text-2xl" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                        ចូលប្រើប្រព័ន្ធគ្រប់គ្រង
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        ប្រព័ន្ធគ្រប់គ្រងសាលារៀន
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            អ៊ីមែល
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="superadmin@gmail.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            ពាក្យសម្ងាត់
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="••••••"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberPassword}
                            onChange={(e) => setRememberPassword(e.target.checked)}
                            className="h-4 w-4 text-primary focus:ring-primary-light border-gray-300 rounded"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            ចងចាំពាក្យសម្ងាត់
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-60 transition-colors"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : 'ចូលប្រើ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
