// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { REGIONS } from '../constants';

function Header({
    onRefreshData, isActualVisible, onToggleActual, isForecastVisible, onToggleForecast,
    chartRatioClass, onToggleChartRatio, selectedRegion, onSelectRegion
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // For hamburger dropdown menu (AI Studio link)
    const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(false); // New state for mobile controls
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null); // Ref for the AI Studio hamburger
    const bannerControlsLeftRef = useRef(null); // New ref for left controls
    const bannerControlsRightRef = useRef(null); // New ref for right controls (for mobile display)

    // Close AI Studio menu when clicking outside
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

    // Function to toggle mobile controls visibility
    const toggleMobileControls = () => {
        setIsMobileControlsVisible(prev => !prev);
        setIsMenuOpen(false); // Close AI Studio menu if open
    };

    return (
        <header className="top-banner">
            <div ref={bannerControlsLeftRef} className={`banner-controls-left ${isMobileControlsVisible ? 'visible-mobile' : ''}`}>
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
                <div id="region-filters"> {/* No inline style here, controlled by CSS */}
                    {/* Add 'ALL' to regions for button generation */}
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
            <h1 className="banner-title" onClick={toggleMobileControls}> {/* Click title to toggle controls */}
                # Colis MET (Réalisé vs Prévisionnel Semaine)
                {/* Add hamburger icon here for mobile toggle visually */}
                <button className="hamburger-icon" style={{ display: 'none' }}>☰</button> {/* Initially hidden, revealed by CSS media query */}
            </h1>
            <div ref={bannerControlsRightRef} className={`banner-controls-right ${isMobileControlsVisible ? 'visible-mobile' : ''}`}>
                <div className="menu-container">
                    {/* This hamburger is now for the AI Studio dropdown only */}
                    <button className="hamburger-icon" id="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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