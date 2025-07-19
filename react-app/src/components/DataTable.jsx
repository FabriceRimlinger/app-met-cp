// src/components/DataTable.jsx
import React from 'react';
import TableFilters from './TableFilters';

function DataTable({ networkData, agencyData, isPercentageData, weeks, selectedTableCEs, onTableFilterChange }) {
    if (!networkData || !agencyData || weeks === 0) {
        return (
            <section id="data-table-section">
                <div id="data-table-container">
                    <p style={{ textAlign: 'center', padding: '10px' }}>Aucune donnée à afficher.</p>
                </div>
            </section>
        );
    }

    const headers = ["Nom", "CE", "Série", ...Array.from({ length: weeks }, (_, i) => `S${(i + 1).toString().padStart(2, '0')}`)];

    // CRITICAL FIX HERE: If selectedTableCEs is empty, agenciesToDisplay should be an empty array.
    const agenciesToDisplay = selectedTableCEs.length > 0
        ? agencyData.filter(agency => selectedTableCEs.includes(agency.ceCode))
        : []; // Change 'agencyData' to '[]' (empty array)

    // The 'allEntities' array correctly ensures networkData is always visible,
    // and then spreads the potentially filtered/empty agenciesToDisplay.
    const allEntities = [networkData, ...agenciesToDisplay];

    const formatValue = (val) => {
        if (val === null || val === undefined) return '';
        return isPercentageData ? val.toFixed(1) + '%' : val.toLocaleString();
    };

    return (
        <section id="data-table-section">
            <div id="data-table-container">
                <TableFilters
                    agencyData={agencyData}
                    selectedTableCEs={selectedTableCEs}
                    onFilterChange={onTableFilterChange}
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
                                    <tr>
                                        <td>{entity.name}</td>
                                        <td>{entity.ceCode || '-'}</td>
                                        <td>Actuel</td>
                                        {entity.actual.map((val, i) => (
                                            <td key={i}>{formatValue(val)}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td>{entity.name}</td>
                                        <td>{entity.ceCode || '-'}</td>
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