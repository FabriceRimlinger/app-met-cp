// src/utils/chartUtils.js

export function calculateYTD(dataArray, endIndex) {
    return dataArray.slice(0, endIndex + 1).reduce((sum, val) => sum + (val || 0), 0);
}

export function calculateGapPercent(actual, forecast) {
    if (forecast === null || forecast === 0 || actual === null) {
        return 'N/A';
    }
    const gap = ((actual / forecast) - 1) * 100;
    return gap.toFixed(0) + '%';
}

export function calculateSubtitleDelta(actualSum, forecastSum) {
    if (forecastSum === null || forecastSum === 0 || actualSum === null) {
        return 'N/A';
    }
    const delta = ((actualSum - forecastSum) / forecastSum) * 100;
    const sign = delta >= 0 ? '+' : '';
    return sign + delta.toFixed(2) + '%';
}

export function formatSubtitleNumber(num) {
    if (num === null || isNaN(num)) return 'N/A';
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(0) + 'k';
    } else {
        return num.toLocaleString(undefined, {maximumFractionDigits: 0});
    }
}