import React from 'react';
import './AnimatedStatsCard.css';

const AnimatedStatsCard = ({ title, value, icon, color, delay = 0 }) => {
    return (
        <div
            className="stats-card scale-in"
            style={{
                '--accent-color': color,
                animationDelay: `${delay}ms`
            }}
        >
            <div className="stats-card-icon">
                {icon}
            </div>
            <div className="stats-card-info">
                <h4 className="stats-card-title">{title}</h4>
                <div className="stats-card-value">{value}</div>
            </div>
            <div className="stats-card-decoration"></div>
        </div>
    );
};

export default AnimatedStatsCard;
