// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { REGIONS } from '../constants';

function Header({
    onRefreshData, isActualVisible, onToggleActual, isForecastVisible, onToggleForecast,
    chartRatioClass, onToggleChartRatio, selectedRegion, onSelectRegion
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // For AI Studio dropdown
    const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(false); // For main controls toggle
    const menuRef = useRef(null);
    const hamburgerMenuRef = useRef(null); // Ref for AI Studio hamburger

    // Close AI Studio menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Function to toggle mobile controls visibility
    const toggleMobileControls = () => {
        setIsMobileControlsVisible(prev => !prev);
        setIsMenuOpen(false); // Close AI Studio menu if main controls open
    };

    return (
        <header className="top-banner">
            <h1 className="banner-title" onClick={toggleMobileControls}> {/* Click title to toggle controls */}
                # Colis MET (Réalisé vs Prévisionnel Semaine)
                {/* This hamburger acts as the visual toggle for mobile controls. Hidden on desktop by CSS. */}
                <button className="hamburger-icon-toggle" type="button">☰</button>
            </h1>

            {/* Main controls (Rafraîchir, Réalisé, Prévi, Ratio, Regions) */}
            <div className={`banner-controls-left ${isMobileControlsVisible ? 'visible-mobile' : ''}`}>
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
                <div id="region-filters">
                    {/* Add 'ALL' to regions for button generation, then sort them */}
                    {['ALL', ...Object.keys(REGIONS)].sort().map(region => (
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

            {/* AI Studio menu */}
            <div className={`banner-controls-right ${isMobileControlsVisible ? 'visible-mobile' : ''}`}>
                <div className="menu-container">
                    {/* This hamburger is for the AI Studio dropdown menu. Hidden on mobile by CSS. */}
                    <button ref={hamburgerMenuRef} className="hamburger-icon" id="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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