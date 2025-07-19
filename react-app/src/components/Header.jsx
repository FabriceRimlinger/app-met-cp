// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { REGIONS } from '../constants'; // Ensure this import path is correct

function Header({
    onRefreshData, isActualVisible, onToggleActual, isForecastVisible, onToggleForecast,
    chartRatioClass, onToggleChartRatio, selectedRegion, onSelectRegion
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for AI Studio dropdown visibility
    const [isMobileControlsVisible, setIsMobileControlsVisible] = useState(false); // State for main mobile controls (buttons) visibility
    
    const menuRef = useRef(null); // Ref for AI Studio dropdown menu
    const hamburgerMenuRef = useRef(null); // Ref for AI Studio hamburger icon
    const headerRef = useRef(null); // Ref for the main <header> element

    // Effect to close AI Studio menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside the AI Studio dropdown menu and its toggle button
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

    // Function to toggle the visibility of main mobile controls (buttons)
    const toggleMobileControls = () => {
        setIsMobileControlsVisible(prev => !prev);
        setIsMenuOpen(false); // Close AI Studio menu if main controls are toggled
    };

    // Effect to add/remove a class to the header based on mobile controls visibility
    useEffect(() => {
        if (headerRef.current) {
            if (isMobileControlsVisible) {
                headerRef.current.classList.add('mobile-expanded');
            } else {
                headerRef.current.classList.remove('mobile-expanded');
            }
        }
    }, [isMobileControlsVisible]); // Re-run this effect when isMobileControlsVisible changes

    return (
        <header ref={headerRef} className="top-banner"> {/* Assign ref to the header element */}
            <h1 className="banner-title" onClick={toggleMobileControls}> {/* Click title to toggle main controls */}
                # Colis MET/Semaine
                {/* This button acts as the visual toggle for mobile controls. Hidden on desktop by CSS. */}
                <button className="hamburger-icon-toggle" type="button">☰</button>
            </h1>

            {/* Main controls (Refresh, Actual, Prev, Ratio, Regions) */}
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
                    {/* Map over regions to create filter buttons. 'ALL' is added dynamically and sorted. */}
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

            {/* AI Studio menu (on the right side of the header) */}
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