import React from 'react';

export const Button = ({ color = 'primary', disabled, label, onClick, className = '', type, form }) => {
    const colorClasses = {
        primary: 'bg-slate-900 hover:bg-slate-800 text-white',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-900',
        ghost: 'hover:bg-slate-100 text-slate-900',
    };

    return (
        <button
            type={type || 'button'}
            form={form}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${colorClasses[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {label}
        </button>
    );
};
