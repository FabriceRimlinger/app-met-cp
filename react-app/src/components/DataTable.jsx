// src/components/DataTable.jsx
import React from 'react';
import TableFilters from './TableFilters'; // Ensure this import path is correct

function DataTable({ networkData, agencyData, isPercentageData, weeks, selectedTableCEs, onTableFilterChange }) {
    // Display a message if no data is available
    if (!networkData || !agencyData || weeks === 0) {
        return (
            <section id="data-table-section">
                <div id="data-table-container">
                    <p style={{ textAlign: 'center', padding: '10px' }}>Aucune donnée à afficher.</p>
                </div>
            </section>
        );
    }

    // Generate table headers for weeks
    const headers = ["Nom", "CE", "Série", ...Array.from({ length: weeks }, (_, i) => `S${(i + 1).toString().padStart(2, '0')}`)];

    // Filter agencies based on selectedTableCEs prop
    const agenciesToDisplay = selectedTableCEs.length > 0
        ? agencyData.filter(agency => selectedTableCEs.includes(agency.ceCode))
        : agencyData;

    // Combine network data and filtered agency data for display
    const allEntities = [networkData, ...agenciesToDisplay];

    // Helper function to format values for table cells
    const formatValue = (val) => {
        if (val === null || val === undefined) return '';
        return isPercentageData ? val.toFixed(1) + '%' : val.toLocaleString();
    };

    return (
        <section id="data-table-section">
            <div id="data-table-container">
                {/* TableFilters component to manage agency selection */}
                <TableFilters
                    agencyData={agencyData}
                    selectedTableCEs={selectedTableCEs}
                    onFilterChange={onTableFilterChange} // Pass the handler from App.jsx
                />
                <div id="table-scroll-wrapper">
                    <table id="data-table">
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allEntities.map(entity => (
                                <React.Fragment key={entity.id}>
                                    {/* Row for Actual Data */}
                                    <tr>
                                        <td>{entity.name}</td>
                                        <td>{entity.ceCode || '-'}</td>
                                        <td>Actuel</td>
                                        {entity.actual.map((val, i) => (
                                            <td key={i}>{formatValue(val)}</td>
                                        ))}
                                    </tr>
                                    {/* Row for Forecast Data */}
                                    <tr>
                                        <td>{entity.name}</td>
                                        <td>{entity.ceCode || '-'}</td>
                                        {/* Apply forecast-data-cell class to the "Série" column cell */}
                                        <td className="forecast-data-cell">Prév.</td>
                                        {entity.forecast.map((val, i) => (
                                            <td key={i} className="forecast-data-cell">{formatValue(val)}</td>
                                        ))}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default DataTable;