// src/components/TableFilters.jsx
import React from 'react';

function TableFilters({ agencyData, selectedTableCEs, onFilterChange }) {
    const handleToggleAll = (event) => {
        const isChecked = event.target.checked;
        const allCEs = isChecked ? agencyData.map(agency => agency.ceCode) : [];
        onFilterChange(allCEs);
    };

    const handleCEToggle = (event) => {
        const ceCode = event.target.value;
        let newSelectedCEs;
        if (event.target.checked) {
            newSelectedCEs = [...selectedTableCEs, ceCode];
        } else {
            newSelectedCEs = selectedTableCEs.filter(ce => ce !== ceCode);
        }
        onFilterChange(newSelectedCEs);
    };

    const allChecked = selectedTableCEs.length === agencyData.length;

    return (
        <div id="table-filter-container">
            <label>
                <input
                    type="checkbox"
                    id="toggle-all-ce"
                    checked={allChecked}
                    onChange={handleToggleAll}
                />
                <strong>Tout sélectionner</strong>
            </label>
            {agencyData.map(agency => (
                <label key={agency.ceCode}>
                    <input
                        type="checkbox"
                        className="ce-filter-checkbox"
                        value={agency.ceCode}
                        checked={selectedTableCEs.includes(agency.ceCode)}
                        onChange={handleCEToggle}
                    />
                    {agency.ceCode}
                </label>
            ))}
        </div>
    );
}

export default TableFilters;