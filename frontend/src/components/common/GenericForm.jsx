import React, { useState, useEffect } from 'react';

import provincesData from '../../data/provinces.json';
import districtsData from '../../data/districts.json';
import communesData from '../../data/communes.json';
import villagesData from '../../data/villages.json';

const GenericForm = ({ fields, initialData, onSubmit, buttonText, onCancel }) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [villages, setVillages] = useState([]);

    useEffect(() => {
        setFormData(initialData);
        if (initialData.address?.province) {
            const provinceCode = initialData.address.province;
            setDistricts(Object.keys(districtsData.districts).filter(code => code.startsWith(provinceCode)).map(code => ({ code, ...districtsData.districts[code] })));
        }
        if (initialData.address?.district) {
            const districtCode = initialData.address.district;
            setCommunes(Object.keys(communesData.communes).filter(code => code.startsWith(districtCode)).map(code => ({ code, ...communesData.communes[code] })));
        }
        if (initialData.address?.commune) {
            const communeCode = initialData.address.commune;
            setVillages(Object.keys(villagesData.villages).filter(code => code.startsWith(communeCode)).map(code => ({ code, ...villagesData.villages[code] })));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: '' }));

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            const newAddress = { ...formData.address, [addressField]: value };
            if (addressField === 'province') {
                setDistricts(Object.keys(districtsData.districts).filter(code => code.startsWith(value)).map(code => ({ code, ...districtsData.districts[code] })));
                setCommunes([]); setVillages([]);
                newAddress.district = ''; newAddress.commune = ''; newAddress.village = '';
            } else if (addressField === 'district') {
                setCommunes(Object.keys(communesData.communes).filter(code => code.startsWith(value)).map(code => ({ code, ...communesData.communes[code] })));
                setVillages([]);
                newAddress.commune = ''; newAddress.village = '';
            } else if (addressField === 'commune') {
                setVillages(Object.keys(villagesData.villages).filter(code => code.startsWith(value)).map(code => ({ code, ...villagesData.villages[code] })));
                newAddress.village = '';
            }
            setFormData(prev => ({ ...prev, address: newAddress }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validate = () => {
        const newErrors = {};
        fields.forEach(field => {
            if (field.required) {
                const value = field.name.startsWith('address.')
                    ? formData.address?.[field.name.split('.')[1]]
                    : formData[field.name];
                if (!value || (typeof value === 'string' && !value.trim())) {
                    newErrors[field.name] = 'សូមបំពេញ';
                }
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!validate()) return;
        onSubmit(formData);
        if (buttonText.toLowerCase().includes('add') || buttonText.toLowerCase().includes('បន្ថែម')) {
            const clearedData = Object.keys(initialData).reduce((acc, key) => {
                acc[key] = (key === 'address') ? {} : '';
                return acc;
            }, {});
            setFormData(clearedData);
            setErrors({});
            setSubmitted(false);
        }
    };

    const renderField = (field) => {
        const value = field.name.startsWith('address.')
            ? formData.address?.[field.name.split('.')[1]] || ''
            : formData[field.name] || '';

        const hasError = submitted && errors[field.name];
        const inputClass = `w-full p-2 border rounded focus:outline-none focus:ring-2 text-gray-900 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 ${hasError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'}`;

        const commonProps = {
            name: field.name,
            value,
            onChange: handleChange,
            required: field.required,
            className: inputClass,
        };

        let input;
        if (field.type === 'select') {
            let options = field.options || [];
            if (field.name === 'address.province') options = Object.keys(provincesData.provinces).map(code => ({ code, ...provincesData.provinces[code] }));
            if (field.name === 'address.district') options = districts;
            if (field.name === 'address.commune') options = communes;
            if (field.name === 'address.village') options = villages;

            input = (
                <select {...commonProps}>
                    <option value="">{field.placeholder || `ជ្រើសរើស${field.label}`}</option>
                    {options.map(opt => (
                        <option key={opt.code || opt.value} value={opt.code || opt.value}>
                            {opt.name?.km || opt.label}
                        </option>
                    ))}
                </select>
            );
        } else {
            input = <input type={field.type || 'text'} {...commonProps} placeholder={field.placeholder || ''} />;
        }

        return (
            <div>
                {input}
                {hasError && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md mb-6 dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {fields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</label>
                        {renderField(field)}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
                    {buttonText}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded transition-colors">
                        បោះបង់
                    </button>
                )}
            </div>
        </form>
    );
};

export default GenericForm;
