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
        if (!isVisible || !canvasRef.current || !chartData) {
            if (modalChartInstanceRef.current) {
                modalChartInstanceRef.current.destroy();
                modalChartInstanceRef.current = null;
            }
            return;
        }

        const ctx = canvasRef.current.getContext('2d');

        // Filter datasets to only include 'Réalisé' and 'Prévisionnel' for the modal
        const modalDatasets = chartData.datasets.filter(ds =>
            (ds.label === 'Réalisé' && isActualVisible) ||
            (ds.label === 'Prévisionnel' && isForecastVisible)
        ).map(ds => ({ ...ds, hidden: false })); // Ensure they are visible in modal

        let localMax = -Infinity;
        modalDatasets.forEach(ds => { ds.data.forEach(val => { if (val !== null && val > localMax) { localMax = val; } }); });
        if (localMax === -Infinity) localMax = isPercentageData ? 100 : 0;
        if (isPercentageData && localMax <= 100) localMax = 100;

        const modalChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ...chartData.options.scales.x,
                    ticks: { ...chartData.options.scales.x.ticks, font: { size: 12 } }
                },
                y: {
                    min: 0,
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
                    ...chartData.options.plugins.tooltip,
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

        if (modalChartInstanceRef.current) {
            modalChartInstanceRef.current.destroy();
        }
        modalChartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: { labels: chartData.labels, datasets: modalDatasets },
            options: modalChartOptions
        });

        return () => {
            if (modalChartInstanceRef.current) {
                modalChartInstanceRef.current.destroy();
                modalChartInstanceRef.current = null;
            }
        };
    }, [isVisible, chartData, isPercentageData, isActualVisible, isForecastVisible]);

    if (!isVisible) return null;

    return (
        <div className="modal-overlay visible" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>&times;</button>
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