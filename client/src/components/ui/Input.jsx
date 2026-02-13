import React from 'react';
import './Input.css';

const Input = ({ label, error, type = "text", id, ...props }) => {
    return (
        <div className="input-group">
            <input
                className={`modern-input ${error ? 'has-error' : ''}`}
                type={type}
                id={id}
                {...props}
            />
            {label && (
                <label htmlFor={id} className="form-label" style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--text-main)',
                    marginBottom: '0.5rem'
                }}>
                    {label}
                </label>
            )}
            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

export default Input;
