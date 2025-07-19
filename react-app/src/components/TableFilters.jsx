// src/components/TableFilters.jsx
import React, { useRef } from 'react'; 

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

    // CRITICAL: Correctly determine if 'Tout sélectionner' should be checked
    // It's checked if ALL agencies are selected, AND there are actually agencies to select
    const allChecked = agencyData.length > 0 && selectedTableCEs.length === agencyData.length;
    // It should be indeterminate or unchecked if some are selected but not all
    const someChecked = selectedTableCEs.length > 0 && selectedTableCEs.length < agencyData.length;

    const toggleAllCheckboxRef = useRef(null); // Ref for the toggle all checkbox

    // Use useEffect to set indeterminate state
    useEffect(() => {
        if (toggleAllCheckboxRef.current) {
            toggleAllCheckboxRef.current.indeterminate = someChecked;
        }
    }, [someChecked]);


    return (
        <div id="table-filter-container">
            <label>
                <input
                    type="checkbox"
                    id="toggle-all-ce"
                    ref={toggleAllCheckboxRef} // Assign the ref
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