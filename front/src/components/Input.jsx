import React from 'react';

const Input = ({ value, setValue, type = "text", placeholder = "", label = "", error, ...props }) => {
    const handleInputChange = (event) => {
        if (setValue) {
            setValue(event.target.value);
        }
    };

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-slate-700 text-sm font-medium mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors ${
                    error ? 'border-red-500' : 'border-slate-300'
                }`}
                {...props}
            />
            {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
