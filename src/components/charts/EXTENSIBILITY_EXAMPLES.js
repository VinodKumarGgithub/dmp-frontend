/**
 * Extensibility Examples
 * 
 * This file demonstrates how to extend the ReusableChart component
 * for future chart types and customizations.
 * 
 * These are examples - not actual implementations.
 */

import { registerChartType } from './ReusableChart';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

// ============================================
// Example 1: Register a new built-in chart type
// ============================================

/**
 * Register Radar Chart Type
 * This allows using type="radar" in ReusableChart
 */
export function registerRadarChart() {
  registerChartType('radar', {
    Chart: RadarChart,
    Series: Radar,
    defaultProps: {
      cx: '50%',
      cy: '50%',
      outerRadius: 80,
    },
  });
}

// Usage:
// registerRadarChart();
// <ReusableChart type="radar" data={data} series={[...]} />

// ============================================
// Example 2: Custom renderer for complex charts
// ============================================

/**
 * Custom Radar Chart Renderer
 * For charts that need special handling
 */
export function customRadarRenderer({ data, series, config, colors }) {
  return (
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis />
      {series.map((s, index) => (
        <Radar
          key={index}
          dataKey={s.dataKey}
          stroke={s.color || colors[s.dataKey]}
          fill={s.color || colors[s.dataKey]}
          fillOpacity={0.6}
        />
      ))}
    </RadarChart>
  );
}

// Usage:
// <ReusableChart
//   type="custom"
//   title="Radar Chart"
//   data={data}
//   customRenderer={customRadarRenderer}
// />

// ============================================
// Example 3: Extend ReusableChart with wrapper
// ============================================

/**
 * Specialized Chart Component
 * Wraps ReusableChart with pre-configured settings
 */
export function RadarChartComponent({ data, title, ...props }) {
  return (
    <ReusableChart
      type="radar"
      title={title}
      data={data}
      series={createChartSeries([
        { dataKey: 'value', name: 'Value' },
      ])}
      config={{
        cx: '50%',
        cy: '50%',
        outerRadius: 80,
      }}
      {...props}
    />
  );
}

// ============================================
// Example 4: Add new transformation utility
// ============================================

/**
 * Transform data for radar chart
 * Add this to chartUtils.js
 */
export function transformRadarData(rawData, subjects) {
  return subjects.map(subject => {
    const dataPoint = { subject };
    rawData.forEach(item => {
      dataPoint[item.category] = item.value;
    });
    return dataPoint;
  });
}

// ============================================
// Example 5: Plugin-style extension
// ============================================

/**
 * Chart Plugin System
 * Allows registering complete chart configurations
 */
const chartPlugins = {};

export function registerChartPlugin(name, plugin) {
  chartPlugins[name] = plugin;
}

export function getChartPlugin(name) {
  return chartPlugins[name];
}

// Usage:
// registerChartPlugin('funnel', {
//   type: 'custom',
//   renderer: FunnelChartRenderer,
//   transformer: transformFunnelData,
//   defaultConfig: { ... },
// });

// ============================================
// Example 6: Theme extension
// ============================================

/**
 * Extended color theme
 * Add to chartUtils.js getMetricColor function
 */
export const extendedColorMap = {
  // Existing
  query: '#1890ff',
  export: '#52c41a',
  page_view: '#13c2c2',
  login: '#faad14',
  
  // New types
  error: '#ff4d4f',
  warning: '#faad14',
  success: '#52c41a',
  info: '#1890ff',
  
  // Custom
  custom1: '#722ed1',
  custom2: '#eb2f96',
};

// ============================================
// Example 7: Validation extension
// ============================================

/**
 * Add validation for new chart type
 * Add to chartUtils.js validateChartConfig function
 */
export const radarChartValidation = {
  radar: {
    required: ['data', 'series'],
    seriesCount: { min: 1, max: 5 },
    dataStructure: {
      requiredFields: ['subject'],
    },
  },
};

// ============================================
// Example 8: Preset configurations
// ============================================

/**
 * Chart Presets
 * Pre-configured chart setups for common use cases
 */
export const chartPresets = {
  dailyTrends: {
    type: 'area',
    config: {
      categoryKey: 'date',
      stackId: '1',
      fillOpacity: 0.6,
    },
    series: [
      { dataKey: 'value', name: 'Value' },
    ],
  },
  
  comparison: {
    type: 'bar',
    config: {
      categoryKey: 'name',
    },
    series: [
      { dataKey: 'value1', name: 'Value 1' },
      { dataKey: 'value2', name: 'Value 2' },
    ],
  },
  
  distribution: {
    type: 'pie',
    config: {
      outerRadius: 80,
      showLabel: true,
    },
    series: [
      { dataKey: 'value' },
    ],
  },
};

// Usage:
// const preset = chartPresets.dailyTrends;
// <ReusableChart
//   type={preset.type}
//   data={data}
//   series={preset.series}
//   config={preset.config}
// />

