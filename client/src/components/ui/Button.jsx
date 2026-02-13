import React from 'react';
import './Button.css'; // We'll add specific button styles here

const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    ...props
}) => {
    const baseStyle = "modern-btn";
    const variantStyle = `btn-${variant}`;

    return (
        <button
            className={`${baseStyle} ${variantStyle} ${isLoading ? 'loading' : ''} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="spinner"></span>
            ) : children}
        </button>
    );
};

export default Button;
