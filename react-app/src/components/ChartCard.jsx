// src/components/ChartCard.jsx
import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto'; // Using auto for easier registration
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin
import {
    DEFAULT_ACTUAL_COLOR, DEFAULT_FORECAST_COLOR, NETWORK_ACTUAL_COLOR, NETWORK_FORECAST_COLOR,
    BACKGROUND_AREA_COLOR, BACKGROUND_AREA_OPACITY
} from '../constants'; // Ensure this import path is correct
import { calculateYTD, calculateGapPercent, formatSubtitleNumber } from '../utils/chartUtils'; // Ensure this import path is correct

// Register ChartDataLabels globally once
// This should ideally be done in main.jsx or App.jsx if Chart is used across many components
// but doing it here ensures it's registered when ChartCard is rendered.
Chart.register(ChartDataLabels);

function ChartCard({
    entityData, titleText, subtitleHTML, isNetwork, scaleMin, scaleMax,
    minBgData, maxBgData, isPercentageData, isActualVisible, isForecastVisible, chartRatioClass,
    onDoubleClick // Callback for double-clicking the chart
}) {
    const canvasRef = useRef(null); // Ref to the canvas DOM element
    const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

    useEffect(() => {
        // Define a cleanup function to destroy the chart instance
        const destroyChart = () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };

        // If no canvas or entityData, destroy any existing chart and exit
        if (!canvasRef.current || !entityData) {
            destroyChart();
            return;
        }

        // Destroy any existing chart instance before creating a new one
        destroyChart();

        const ctx = canvasRef.current.getContext('2d');
        const { actual: actualData, forecast: forecastData } = entityData;

        // Determine the number of weeks based on the longest data array
        const weeks = Math.max(
            actualData ? actualData.length : 0,
            forecastData ? forecastData.length : 0
        );
        const chartLabels = Array.from({ length: weeks }, (_, i) => `S${(i + 1).toString().padStart(2, '0')}`);

        const datasets = [];

        // Add the gray shaded area for agency charts (min/max range)
        if (!isNetwork && minBgData && maxBgData) {
            datasets.push({
                type: 'line',
                data: minBgData,
                borderColor: 'transparent',
                pointRadius: 0,
                order: 4, // Render below actual/forecast lines
                spanGaps: true // Allow gaps in the data for this area
            });
            datasets.push({
                type: 'line',
                data: maxBgData,
                borderColor: 'transparent',
                backgroundColor: BACKGROUND_AREA_COLOR + BACKGROUND_AREA_OPACITY,
                pointRadius: 0,
                fill: { target: '-1' }, // Fill between this dataset and the previous one (minBgData)
                order: 3, // Render below actual/forecast lines
                spanGaps: true
            });
        }

        // Add Forecast Data Series
        datasets.push({
            type: 'line',
            label: 'Prévisionnel',
            data: forecastData,
            borderColor: isNetwork ? NETWORK_FORECAST_COLOR : DEFAULT_FORECAST_COLOR,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1.5,
            order: 2,
            hidden: !isForecastVisible, // Control visibility via state
        });

        // Add Actual Data Series
        datasets.push({
            type: 'line',
            label: 'Réalisé',
            data: actualData,
            borderColor: isNetwork ? NETWORK_ACTUAL_COLOR : DEFAULT_ACTUAL_COLOR,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1.5,
            order: 1,
            hidden: !isActualVisible, // Control visibility via state
        });

        // Determine chart aspect ratio based on chartRatioClass prop
        const chartAspectRatio = chartRatioClass === 'ratio-1-1' ? 1 : 16 / 9;

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: chartAspectRatio,
            scales: {
                x: {
                    ticks: { font: { size: 8 }, autoSkip: true, maxRotation: 0, padding: 1 },
                    grid: { display: false }
                },
                y: {
                    min: isNetwork ? (isPercentageData ? 0 : undefined) : scaleMin, // Network chart min can be 0 for percentage, otherwise auto
                    max: isNetwork ? undefined : scaleMax, // Network chart max auto
                    grace: '5%', // Add a little padding to the top of the Y-axis
                    ticks: {
                        font: { size: 8 },
                        padding: 3,
                        stepSize: isNetwork ? undefined : (isPercentageData ? 10 : 5000), // Adjust step size, especially for percentages
                        callback: function(value) {
                            if (isPercentageData) return value.toFixed(0) + '%';
                            if (value === 0) return "0";
                            if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            if (Math.abs(value) >= 1000) return (value / 1000).toFixed(0) + 'k';
                            return value;
                        }
                    },
                    grid: { color: '#eee' }
                }
            },
            plugins: {
                legend: { display: false }, // No legend on small cards
                datalabels: { display: false }, // Data labels only in modal
                tooltip: {
                    enabled: true, // Enable tooltips
                    mode: 'index', // Show tooltips for all data points at the hovered X index
                    intersect: false, // Tooltip shows even if not directly over a point
                    position: 'nearest', // Position tooltip near the cursor
                    callbacks: {
                        title: (tooltipItems) => tooltipItems[0]?.label || '', // Week number as title
                        label: (tooltipItem) => null, // Hide default label
                        afterBody: (tooltipItems) => {
                            const dataIndex = tooltipItems[0]?.dataIndex;
                            if (dataIndex === undefined) return [];

                            const currentActual = actualData[dataIndex];
                            const currentForecast = forecastData[dataIndex];
                            const formatValue = (val) => (val === null || val === undefined) ? 'N/A' : (isPercentageData ? val.toFixed(1) + '%' : val.toLocaleString());

                            let lines = [];
                            // Display weekly values and gap if both are available
                            if (currentActual !== null && currentForecast !== null) {
                                if (isActualVisible) lines.push(`Wk Act : ${formatValue(currentActual)}`);
                                if (isForecastVisible) lines.push(`Wk Prév.: ${formatValue(currentForecast)}`);
                                if (isActualVisible && isForecastVisible) lines.push(`Delta Wk: ${calculateGapPercent(currentActual, currentForecast)}`);
                                lines.push('---'); // Separator
                            } else {
                                // Display only available weekly value if one is null
                                if (isActualVisible && currentActual !== null) lines.push(`Actuel: ${formatValue(currentActual)}`);
                                if (isForecastVisible && currentForecast !== null) lines.push(`Prévision: ${formatValue(currentForecast)}`);
                            }

                            // Always display YTD values and gap if available, even if weekly are null
                            const actualYTD = calculateYTD(actualData, dataIndex);
                            const forecastYTD = calculateYTD(forecastData, dataIndex);
                            if (isActualVisible) lines.push(`YTD Act.: ${formatSubtitleNumber(actualYTD)}`);
                            if (isForecastVisible) lines.push(`YTD Prév.: ${formatSubtitleNumber(forecastYTD)}`);
                            if (isActualVisible && isForecastVisible) lines.push(`Delta YTD: ${calculateGapPercent(actualYTD, forecastYTD)}`);

                            return lines;
                        }
                    }
                }
            }
        };

        // Create the new chart instance
        chartInstanceRef.current = new Chart(ctx, { type: 'line', data: { labels: chartLabels, datasets: datasets }, options: options });

        // Cleanup function that runs when component unmounts or effect re-runs
        return () => {
            destroyChart();
        };
    }, [
        entityData, isActualVisible, isForecastVisible, chartRatioClass,
        isNetwork, scaleMin, scaleMax, minBgData, maxBgData, isPercentageData
    ]); // Dependencies for useEffect

    // Double click handler to show the modal
    const handleDoubleClick = () => {
        if (chartInstanceRef.current && onDoubleClick) {
            onDoubleClick(titleText, subtitleHTML, chartInstanceRef.current);
        }
    };

    return (
        <div
            className="chart-container"
            id={`container-${entityData.id}`}
            data-ce-code={entityData.ceCode ? entityData.ceCode.toUpperCase() : ''}
            onDoubleClick={handleDoubleClick}
        >
            <div className="chart-title">{titleText}</div>
            <div className="chart-subtitle" dangerouslySetInnerHTML={{ __html: subtitleHTML }}></div>
            <div className={`chart-canvas-container ${chartRatioClass}`}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}

export default ChartCard;