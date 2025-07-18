// src/components/ChartCard.jsx
import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto'; // Using auto for easier registration
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    DEFAULT_ACTUAL_COLOR, DEFAULT_FORECAST_COLOR, NETWORK_ACTUAL_COLOR, NETWORK_FORECAST_COLOR,
    BACKGROUND_AREA_COLOR, BACKGROUND_AREA_OPACITY
} from '../constants';
import { calculateYTD, calculateGapPercent, formatSubtitleNumber } from '../utils/chartUtils';

Chart.register(ChartDataLabels); // Register once globally

function ChartCard({
    entityData, titleText, subtitleHTML, isNetwork, scaleMin, scaleMax,
    minBgData, maxBgData, isPercentageData, isActualVisible, isForecastVisible, chartRatioClass,
    onDoubleClick
}) {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null); // To store Chart.js instance

    useEffect(() => {
        if (!canvasRef.current || !entityData) return;

        const ctx = canvasRef.current.getContext('2d');
        const { actual: actualData, forecast: forecastData } = entityData;
        const weeks = Math.max(
            actualData ? actualData.length : 0,
            forecastData ? forecastData.length : 0
        );
        const chartLabels = Array.from({ length: weeks }, (_, i) => `S${(i + 1).toString().padStart(2, '0')}`);

        const datasets = [];

        if (!isNetwork && minBgData && maxBgData) {
            datasets.push({
                type: 'line',
                data: minBgData,
                borderColor: 'transparent',
                pointRadius: 0,
                order: 4,
                spanGaps: true // Allow gaps in background data
            });
            datasets.push({
                type: 'line',
                data: maxBgData,
                borderColor: 'transparent',
                backgroundColor: BACKGROUND_AREA_COLOR + BACKGROUND_AREA_OPACITY,
                pointRadius: 0,
                fill: { target: '-1' }, // Fill between this dataset and the previous one (minBgData)
                order: 3,
                spanGaps: true
            });
        }

        datasets.push({
            type: 'line',
            label: 'Prévisionnel',
            data: forecastData,
            borderColor: isNetwork ? NETWORK_FORECAST_COLOR : DEFAULT_FORECAST_COLOR,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1.5,
            order: 2,
            hidden: !isForecastVisible,
        });
        datasets.push({
            type: 'line',
            label: 'Réalisé',
            data: actualData,
            borderColor: isNetwork ? NETWORK_ACTUAL_COLOR : DEFAULT_ACTUAL_COLOR,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1.5,
            order: 1,
            hidden: !isActualVisible,
        });

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
                    min: isNetwork ? (isPercentageData ? 0 : undefined) : scaleMin,
                    max: isNetwork ? undefined : scaleMax,
                    grace: '5%',
                    ticks: {
                        font: { size: 8 }, padding: 3,
                        stepSize: isNetwork ? undefined : (isPercentageData ? 10 : 5000), // Adjust step size for percentages
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
                legend: { display: false },
                datalabels: { display: false }, // Data labels are only for modal chart
                tooltip: {
                    enabled: true, mode: 'index', intersect: false, position: 'nearest',
                    callbacks: {
                        title: (tooltipItems) => tooltipItems[0]?.label || '',
                        label: (tooltipItem) => null, // Hide default label
                        afterBody: (tooltipItems) => {
                            const dataIndex = tooltipItems[0]?.dataIndex;
                            if (dataIndex === undefined) return [];

                            const currentActual = actualData[dataIndex];
                            const currentForecast = forecastData[dataIndex];
                            const formatValue = (val) => (val === null || val === undefined) ? 'N/A' : (isPercentageData ? val.toFixed(1) + '%' : val.toLocaleString());

                            let lines = [];
                            if (currentActual !== null && currentForecast !== null) {
                                const actualYTD = calculateYTD(actualData, dataIndex);
                                const forecastYTD = calculateYTD(forecastData, dataIndex);

                                if (isActualVisible) lines.push(`Wk Act : ${formatValue(currentActual)}`);
                                if (isForecastVisible) lines.push(`Wk Prev.: ${formatValue(currentForecast)}`);
                                if (isActualVisible && isForecastVisible) lines.push(`Delta Wk: ${calculateGapPercent(currentActual, currentForecast)}`);
                                lines.push('---');
                                if (isActualVisible) lines.push(`YTD Act.: ${formatSubtitleNumber(actualYTD)}`);
                                if (isForecastVisible) lines.push(`YTD Prév.: ${formatSubtitleNumber(forecastYTD)}`);
                                if (isActualVisible && isForecastVisible) lines.push(`Delta YTD: ${calculateGapPercent(actualYTD, forecastYTD)}`);
                            } else {
                                if (isActualVisible && currentActual !== null) lines.push(`Actuel: ${formatValue(currentActual)}`);
                                if (isForecastVisible && currentForecast !== null) lines.push(`Prévision: ${formatValue(currentForecast)}`);
                            }
                            return lines;
                        }
                    }
                }
            }
        };

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy(); // Destroy previous instance
        }
        chartInstanceRef.current = new Chart(ctx, { type: 'line', data: { labels: chartLabels, datasets: datasets }, options: options });

        // Cleanup on component unmount
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [entityData, isActualVisible, isForecastVisible, chartRatioClass, isNetwork, scaleMin, scaleMax, minBgData, maxBgData, isPercentageData]); // Re-run effect if these props change

    // Double click to open modal, passing the current chart instance data
    const handleDoubleClick = () => {
        if (chartInstanceRef.current) {
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