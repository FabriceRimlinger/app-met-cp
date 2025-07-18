// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { REGIONS } from '../constants';

function Header({
    onRefreshData, isActualVisible, onToggleActual, isForecastVisible, onToggleForecast,
    chartRatioClass, onToggleChartRatio, selectedRegion, onSelectRegion
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="top-banner">
            <div className="banner-controls-left">
                <button id="load-data-button" onClick={onRefreshData}>Rafraîchir</button>
                <button
                    className={`toggle-button ${isActualVisible ? 'visible' : ''}`}
                    id="toggle-actual-button"
                    onClick={onToggleActual}
                >
                    Réalisé
                </button>
                <button
                    className={`toggle-button ${isForecastVisible ? 'visible' : ''}`}
                    id="toggle-forecast-button"
                    onClick={onToggleForecast}
                >
                    Prévi
                </button>
                <button id="ratio-toggle-button" onClick={onToggleChartRatio}>
                    {chartRatioClass === 'ratio-16-9' ? 'Ratio 16:9' : 'Ratio 1:1'}
                </button>
                <div id="region-filters" style={{ display: 'flex', gap: '5px', borderLeft: '2px solid #ccc', paddingLeft: '10px', marginLeft: '5px' }}>
                    {Object.keys(REGIONS).concat('ALL').sort().map(region => (
                        <button
                            key={region}
                            className={`region-button ${selectedRegion === region ? 'active' : ''}`}
                            data-region={region}
                            onClick={() => onSelectRegion(region)}
                        >
                            {region}
                        </button>
                    ))}
                </div>
            </div>
            <h1 className="banner-title"># Colis MET (Réalisé vs Prévisionnel Semaine)</h1>
            <div className="banner-controls-right">
                <div className="menu-container">
                    <button ref={hamburgerRef} className="hamburger-icon" id="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        ☰
                    </button>
                    <div ref={menuRef} className={`dropdown-menu ${isMenuOpen ? 'menu-open' : ''}`} id="main-menu">
                        <a href="https://aistudio.google.com/prompts/1KL6NvjEQxaTgHpX1sCBcpubRdbId8ZLg" target="_blank" rel="noopener noreferrer">AI Studio</a>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;