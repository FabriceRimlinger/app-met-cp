// src/components/Modal.jsx
import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatSubtitleNumber } from '../utils/chartUtils';

Chart.register(ChartDataLabels);

function Modal({ isVisible, title, subtitleHTML, chartData, isPercentageData, isActualVisible, isForecastVisible, onClose }) {
    const canvasRef = useRef(null);
    const modalChartInstanceRef = useRef(null);

    useEffect(() => {
        // Cleanup function for previous chart instance
        const destroyModalChart = () => {
            if (modalChartInstanceRef.current) {
                modalChartInstanceRef.current.destroy();
                modalChartInstanceRef.current = null;
            }
        };

        // If not visible or essential chartData is missing (like chartData.data or chartData.options), destroy and exit
        if (!isVisible || !canvasRef.current || !chartData || !chartData.data || !chartData.options) {
            destroyModalChart();
            return;
        }

        // Destroy any existing chart instance before creating a new one
        destroyModalChart();

        const ctx = canvasRef.current.getContext('2d');

        // CRITICAL CHANGES HERE: Access data and options correctly from chartData
        const modalDatasets = chartData.data.datasets.filter(ds => // Use chartData.data.datasets
            (ds.label === 'Réalisé' && isActualVisible) ||
            (ds.label === 'Prévisionnel' && isForecastVisible)
        ).map(ds => ({ ...ds, hidden: false })); // Ensure they are visible in modal

        const modalData = { labels: chartData.data.labels, datasets: modalDatasets }; // Use chartData.data.labels

        let localMax = -Infinity;
        modalDatasets.forEach(ds => { ds.data.forEach(val => { if (val !== null && val > localMax) { localMax = val; } }); });
        if (localMax === -Infinity) localMax = isPercentageData ? 100 : 0;
        if (isPercentageData && localMax < 100) localMax = 100; // Ensure max is at least 100 for percentages

        // CRITICAL CHANGES HERE: Access options correctly from chartData.options
        const modalChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    // Copy x-scale options from original chart's config, but adjust font size for modal
                    ...chartData.options.scales.x, // Use chartData.options.scales.x
                    ticks: { ...chartData.options.scales.x.ticks, font: { size: 12 } }
                },
                y: {
                    min: isPercentageData ? 0 : undefined, // Allow auto-scaling for non-percentage data, otherwise 0
                    max: localMax,
                    grace: '5%',
                    ticks: {
                        font: { size: 12 }, padding: 3,
                        callback: (value) => (isPercentageData ? value.toFixed(0) + '%' : formatSubtitleNumber(value))
                    },
                    grid: { color: '#eee' }
                }
            },
            plugins: {
                legend: { display: true, position: 'top', labels: { boxWidth: 20, padding: 15, font: { size: 14 } } },
                tooltip: {
                    // Copy tooltip options from original chart's config, adjust font sizes
                    ...chartData.options.plugins.tooltip, // Use chartData.options.plugins.tooltip
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 }
                },
                datalabels: {
                    display: (context) => {
                        const datasetLabel = context.dataset.label;
                        return (datasetLabel === 'Réalisé' && isActualVisible) || (datasetLabel === 'Prévisionnel' && isForecastVisible);
                    },
                    align: 'top',
                    color: (context) => context.dataset.borderColor,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => (value === null) ? '' : (isPercentageData ? value.toFixed(0) + '%' : Math.round(value / 1000) + 'k')
                }
            }
        };

        modalChartInstanceRef.current = new Chart(newCanvas, { type: 'line', data: modalData, options: modalChartOptions });

        return () => {
            destroyModalChart();
        };
    }, [isVisible, chartData, isPercentageData, isActualVisible, isForecastVisible]); // Depend on chartData (the entire config)

    if (!isVisible) return null;

    return (
        <div className="modal-overlay visible" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>×</button>
                <div className="modal-header">
                    <div className="modal-chart-title">{title}</div>
                    <div className="modal-chart-subtitle" dangerouslySetInnerHTML={{ __html: subtitleHTML }}></div>
                </div>
                <div id="modal-chart-container">
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>
        </div>
    );
}

export default Modal;