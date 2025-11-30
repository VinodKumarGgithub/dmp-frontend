/**
 * Charts Index - Centralized exports (DRY principle)
 * Future extensible: Export new chart types here
 */

// Unified reusable chart component (recommended)
export { default as ReusableChart, registerChartType } from './ReusableChart';

// Chart container wrapper
export { default as ChartContainer } from './ChartContainer';

// Legacy individual chart components (kept for backward compatibility)
export { default as DailyUsageChart } from './DailyUsageChart';
export { default as MetricDistributionChart } from './MetricDistributionChart';
export { default as TopPagesChart } from './TopPagesChart';

