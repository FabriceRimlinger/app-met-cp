// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from './utils/supabase';
import { REGIONS } from './constants';
import Header from './components/Header';
import ChartGrid from './components/ChartGrid';
import DataTable from './components/DataTable';
import Modal from './components/Modal';

function App() {
    const [networkData, setNetworkData] = useState(null);
    const [agencyData, setAgencyData] = useState([]);
    const [weeks, setWeeks] = useState(0);
    const [isPercentageData, setIsPercentageData] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [isActualVisible, setIsActualVisible] = useState(true);
    const [isForecastVisible, setIsForecastVisible] = useState(true);
    const [chartRatioClass, setChartRatioClass] = useState('ratio-16-9');
    const [selectedRegion, setSelectedRegion] = useState('ALL'); // For chart filtering
    const [selectedTableCEs, setSelectedTableCEs] = useState([]); // For table filtering

    // Modal state
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalChartTitle, setModalChartTitle] = useState('');
    const [modalChartSubtitle, setModalChartSubtitle] = useState('');
    const [modalChartData, setModalChartData] = useState(null); // Chart.js config for modal

    const displayError = useCallback((message) => {
        setErrorMessage(message);
        setNetworkData(null);
        setAgencyData([]);
    }, []);

    const clearError = useCallback(() => {
        setErrorMessage('');
    }, []);

    const fetchAndDrawData = useCallback(async () => {
        clearError();
        setErrorMessage('Chargement des données...');
        setNetworkData(null);
        setAgencyData([]);
        setSelectedTableCEs([]); // Reset table filters on refresh

        try {
            let { data, error } = await supabaseClient.from('volume_data').select('EntityType, EntityID, EntityName, CECode, ActualData, ForecastData, is_percentage');
            if (error) { throw error; }
            if (!data || data.length === 0) { displayError("Aucune donnée reçue de la base de données."); return; }

            const newIsPercentageData = data.some(row => row.is_percentage === true);
            setIsPercentageData(newIsPercentageData);

            let maxWeeks = 0;
            data.forEach(row => {
                if (row.ActualData && row.ActualData.length > maxWeeks) maxWeeks = row.ActualData.length;
                if (row.ForecastData && row.ForecastData.length > maxWeeks) maxWeeks = row.ForecastData.length;
            });
            setWeeks(maxWeeks);

            const allParsedData = data.map(row => {
                const parseArray = (arr, totalWeeks) => {
                    let parsed = [];
                    if (Array.isArray(arr)) {
                        parsed = arr.map(val => val === null ? null : Number(val));
                    }
                    while(parsed.length < totalWeeks) { parsed.push(null); }
                    return parsed;
                };
                const actualValues = parseArray(row.ActualData, maxWeeks);
                const forecastValues = parseArray(row.ForecastData, maxWeeks);
                return { type: row.EntityType, id: row.EntityID, name: row.EntityName, ceCode: row.CECode, actual: actualValues, forecast: forecastValues };
            });

            const newNetworkData = allParsedData.find(d => d.type === 'Network');
            const newAgencyData = allParsedData.filter(d => d.type === 'Agency');

            if (!newNetworkData) { displayError("La DB doit contenir une entrée 'Network'."); return; }
            if (newAgencyData.length === 0) { displayError("La DB doit contenir au moins une entrée 'Agency'."); return; }

            newAgencyData.sort((a, b) => (a.ceCode || '').localeCompare(b.ceCode || ''));

            setNetworkData(newNetworkData);
            setAgencyData(newAgencyData);
            // Initialize all checkboxes in the table to checked
            setSelectedTableCEs(newAgencyData.map(a => a.ceCode));

            setErrorMessage(''); // Clear loading message on success

        } catch (error) {
            console.error("Erreur de chargement:", error);
            displayError(`Erreur: ${error.message}`);
        }
    }, [clearError, displayError]);

    useEffect(() => {
        fetchAndDrawData();
    }, [fetchAndDrawData]); // Run once on component mount

    // Handlers for top banner buttons
    const handleToggleActual = () => setIsActualVisible(prev => !prev);
    const handleToggleForecast = () => setIsForecastVisible(prev => !prev);
    const handleToggleChartRatio = () => setChartRatioClass(prev => prev === 'ratio-16-9' ? 'ratio-1-1' : 'ratio-16-9');
    const handleSelectRegion = (region) => {
        setSelectedRegion(region);

        // Update chart visibility based on region selection
        const chartContainers = document.querySelectorAll('.chart-container[data-ce-code]');
        const upperRegion = region.toUpperCase();
        const regionCEs = REGIONS[upperRegion];

        chartContainers.forEach(chart => {
            if (upperRegion === 'ALL' || (regionCEs && regionCEs.includes(chart.dataset.ceCode))) {
                chart.style.display = 'flex';
            } else {
                chart.style.display = 'none';
            }
        });

        // Update table filters based on region selection
        if (region === 'ALL') {
            setSelectedTableCEs(agencyData.map(a => a.ceCode));
        } else {
            setSelectedTableCEs(agencyData.filter(a => regionCEs.includes(a.ceCode)).map(a => a.ceCode));
        }
    };

    // Handler for table filters
    const handleTableFilterChange = (newSelectedCEs) => {
        setSelectedTableCEs(newSelectedCEs);
    };

    // Handler for showing modal
    const showChartModal = (title, subtitleHTML, chartInstance) => {
        setModalChartTitle(title);
        setModalChartSubtitle(subtitleHTML);
        setModalChartData(chartInstance.config.data); // Pass chart data and labels for modal
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setModalChartData(null);
    };

    return (
        <>
            <Header
                onRefreshData={fetchAndDrawData}
                isActualVisible={isActualVisible}
                onToggleActual={handleToggleActual}
                isForecastVisible={isForecastVisible}
                onToggleForecast={handleToggleForecast}
                chartRatioClass={chartRatioClass}
                onToggleChartRatio={handleToggleChartRatio}
                selectedRegion={selectedRegion}
                onSelectRegion={handleSelectRegion}
            />
            <div className="page-content">
                {errorMessage && <div id="error-message">{errorMessage}</div>}
                {networkData && agencyData.length > 0 && (
                    <ChartGrid
                        networkData={networkData}
                        agencyData={agencyData}
                        isActualVisible={isActualVisible}
                        isForecastVisible={isForecastVisible}
                        chartRatioClass={chartRatioClass}
                        onChartDoubleClick={showChartModal}
                        isPercentageData={isPercentageData}
                    />
                )}
                {networkData && agencyData.length > 0 && (
                    <DataTable
                        networkData={networkData}
                        agencyData={agencyData}
                        isPercentageData={isPercentageData}
                        weeks={weeks}
                        selectedTableCEs={selectedTableCEs}
                        onTableFilterChange={handleTableFilterChange}
                    />
                )}
            </div>

            <Modal
                isVisible={isModalVisible}
                title={modalChartTitle}
                subtitleHTML={modalChartSubtitle}
                chartData={modalChartData}
                isPercentageData={isPercentageData}
                isActualVisible={isActualVisible}
                isForecastVisible={isForecastVisible}
                onClose={closeModal}
            />
        </>
    );
}

export default App;