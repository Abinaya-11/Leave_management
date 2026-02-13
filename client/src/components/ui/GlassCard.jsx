import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`glass-panel p-6 ${className}`}
            style={{
                padding: '2rem',
                borderRadius: '1rem',
                ...props.style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
