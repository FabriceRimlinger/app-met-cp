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
        const destroyModalChart = () => {
            if (modalChartInstanceRef.current) {
                modalChartInstanceRef.current.destroy();
                modalChartInstanceRef.current = null;
            }
        };

        if (!isVisible || !canvasRef.current || !chartData || !chartData.data || !chartData.options) {
            destroyModalChart();
            return;
        }

        destroyModalChart();

        const ctx = canvasRef.current.getContext('2d');

        const modalDatasets = chartData.data.datasets.filter(ds =>
            (ds.label === 'Actuel' && isActualVisible) ||
            (ds.label === 'Prév.' && isForecastVisible)
        ).map(ds => ({ ...ds, hidden: false }));

        const modalData = { labels: chartData.data.labels, datasets: modalDatasets };

        let localMax = -Infinity;
        modalDatasets.forEach(ds => { ds.data.forEach(val => { if (val !== null && val > localMax) { localMax = val; } }); });
        if (localMax === -Infinity) localMax = isPercentageData ? 100 : 0;
        if (isPercentageData && localMax < 100) localMax = 100;

        const modalChartOptions = {
            responsive: true,
            maintainAspectRatio: false, // Essential for dynamic resizing
            scales: {
                x: {
                    ...chartData.options.scales.x,
                    ticks: { ...chartData.options.scales.x.ticks, font: { size: 10 } }
                },
                y: {
                    min: isPercentageData ? 0 : undefined,
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
                legend: { display: true, position: 'top', labels: { boxWidth: 20, padding: 15, font: { size: 12 } } },
                tooltip: {
                    ...chartData.options.plugins.tooltip,
                    titleFont: { size: 12 },
                    bodyFont: { size: 10 }
                },
                datalabels: {
                    display: (context) => {
                        const datasetLabel = context.dataset.label;
                        return (datasetLabel === 'Actuel' && isActualVisible) || (datasetLabel === 'Prév.' && isForecastVisible);
                    },
                    align: 'top',
                    color: (context) => context.dataset.borderColor,
                    font: { weight: 'bold', size: 10 },
                    formatter: (value) => (value === null) ? '' : (isPercentageData ? value.toFixed(0) + '%' : Math.round(value / 1000) + 'k')
                }
            }
        };

        modalChartInstanceRef.current = new Chart(canvasRef.current, {
            type: 'line',
            data: modalData,
            options: modalChartOptions
        });

        // Add resize listener for the modal chart
        const handleResize = () => {
            if (modalChartInstanceRef.current) {
                modalChartInstanceRef.current.resize(); // Force chart to redraw to new container size
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            destroyModalChart();
            window.removeEventListener('resize', handleResize); // Clean up event listener
        };
    }, [isVisible, chartData, isPercentageData, isActualVisible, isForecastVisible]);

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