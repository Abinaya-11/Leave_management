import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`glass-panel p-6 ${className}`}
            style={{
                borderRadius: '16px',
                ...props.style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
