// src/components/ChartGrid.jsx
import React from 'react';
import ChartCard from './ChartCard';
import {
    calculateYTD, calculateSubtitleDelta, formatSubtitleNumber
} from '../utils/chartUtils';

function ChartGrid({
    networkData, agencyData, isActualVisible, isForecastVisible,
    chartRatioClass, onChartDoubleClick, isPercentageData
}) {
    if (!networkData || !agencyData || agencyData.length === 0) {
        return <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Aucune donnée à afficher.</p>;
    }

    const weeks = Math.max(
        networkData.actual ? networkData.actual.length : 0,
        networkData.forecast ? networkData.forecast.length : 0
    );

    // Calculate min/max for agency charts (background shaded area)
    const minActuals = Array(weeks).fill(null);
    const maxActuals = Array(weeks).fill(null);
    let agencyGlobalMaxValue = -Infinity;
    let agencyGlobalMinValue = Infinity;

    for (let i = 0; i < weeks; i++) {
        let minForWeek = Infinity;
        let maxForWeek = -Infinity;
        let hasActualData = false;
        agencyData.forEach(agency => {
            const actualVal = agency.actual[i];
            if (actualVal !== null) {
                hasActualData = true;
                if (actualVal < minForWeek) minForWeek = actualVal;
                if (actualVal > maxForWeek) maxForWeek = actualVal;
            }
        });
        if (hasActualData) {
            minActuals[i] = minForWeek;
            maxActuals[i] = maxForWeek;
        }

        agencyData.forEach(agency => {
            const actualValForScale = agency.actual[i];
            const forecastValForScale = agency.forecast[i];
            if (actualValForScale !== null) {
                if (actualValForScale > agencyGlobalMaxValue) agencyGlobalMaxValue = actualValForScale;
                if (actualValForScale < agencyGlobalMinValue) agencyGlobalMinValue = actualValForScale;
            }
            if (forecastValForScale !== null) {
                if (forecastValForScale > agencyGlobalMaxValue) agencyGlobalMaxValue = forecastValForScale;
                if (forecastValForScale < agencyGlobalMinValue) agencyGlobalMinValue = forecastValForScale;
            }
        });
    }

    if (agencyGlobalMaxValue === -Infinity) agencyGlobalMaxValue = isPercentageData ? 100 : 0;
    if (agencyGlobalMinValue === Infinity) agencyGlobalMinValue = 0;
    if (isPercentageData) { agencyGlobalMinValue = 0; if (agencyGlobalMaxValue < 0) agencyGlobalMaxValue = 0; if (agencyGlobalMaxValue <= 100) agencyGlobalMaxValue = 100; }

    const agencyScaleMax = agencyGlobalMaxValue;
    const agencyScaleMin = isPercentageData ? 0 : agencyGlobalMinValue;

    const lastActualNetworkIndex = networkData.actual.findLastIndex(v => v !== null);
    const networkActualSum = calculateYTD(networkData.actual, lastActualNetworkIndex);
    const networkForecastSum = calculateYTD(networkData.forecast, lastActualNetworkIndex);
    const networkDelta = calculateSubtitleDelta(networkActualSum, networkForecastSum);
    const networkSubtitle = `YTD actuel: ${formatSubtitleNumber(networkActualSum)} - YTD prév: ${formatSubtitleNumber(networkForecastSum)}<br>Actuel ${networkDelta} vs prév.`;

    return (
        <div className="chart-grid">
            <ChartCard
                key={networkData.id}
                entityData={networkData}
                titleText={networkData.name}
                subtitleHTML={networkSubtitle}
                isNetwork={true}
                scaleMin={null}
                scaleMax={null}
                minBgData={null}
                maxBgData={null}
                isPercentageData={isPercentageData}
                isActualVisible={isActualVisible}
                isForecastVisible={isForecastVisible}
                chartRatioClass={chartRatioClass}
                onDoubleClick={onChartDoubleClick}
            />
            {agencyData.map(agency => {
                const lastActualAgencyIndex = agency.actual.findLastIndex(v => v !== null);
                const agencyActualSum = calculateYTD(agency.actual, lastActualAgencyIndex);
                const agencyForecastSum = calculateYTD(agency.forecast, lastActualAgencyIndex);
                const agencyDelta = calculateSubtitleDelta(agencyActualSum, agencyForecastSum);
                const agencySubtitle = `YTD actuel: ${formatSubtitleNumber(agencyActualSum)} - YTD prév: ${formatSubtitleNumber(agencyForecastSum)}<br>Actuel ${agencyDelta} vs prév.`;
                const agencyTitle = `${agency.ceCode} ${agency.name}`;

                return (
                    <ChartCard
                        key={agency.id}
                        entityData={agency}
                        titleText={agencyTitle}
                        subtitleHTML={agencySubtitle}
                        isNetwork={false}
                        scaleMin={agencyScaleMin}
                        scaleMax={agencyScaleMax}
                        minBgData={minActuals}
                        maxBgData={maxActuals}
                        isPercentageData={isPercentageData}
                        isActualVisible={isActualVisible}
                        isForecastVisible={isForecastVisible}
                        chartRatioClass={chartRatioClass}
                        onDoubleClick={onChartDoubleClick}
                    />
                );
            })}
        </div>
    );
}

export default ChartGrid;