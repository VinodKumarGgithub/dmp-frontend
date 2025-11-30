/**
 * Chart Data Transformation Utilities
 * DRY principle: Centralized data transformation logic
 */

import dayjs from 'dayjs';

/**
 * Transform daily metrics into chart-ready format
 * Groups metrics by date and metric type
 */
export function transformDailyMetrics(dailyMetrics = []) {
  if (!Array.isArray(dailyMetrics) || dailyMetrics.length === 0) {
    return [];
  }

  const grouped = {};
  
  dailyMetrics.forEach((metric) => {
    const date = metric.event_date;
    if (!grouped[date]) {
      grouped[date] = { date };
    }
    grouped[date][metric.metric_type] = metric.total_count || 0;
  });

  return Object.values(grouped).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
}

/**
 * Transform totals into pie chart data
 */
export function transformTotalsToPieData(totals = {}, colors = {}) {
  const data = [
    { name: 'Queries', value: totals.queries || 0, key: 'queries' },
    { name: 'Exports', value: totals.exports || 0, key: 'exports' },
    { name: 'Page Views', value: totals.pageViews || 0, key: 'pageViews' },
    { name: 'Logins', value: totals.logins || 0, key: 'logins' },
  ];

  // Add colors if provided
  return data
    .filter(item => item.value > 0)
    .map(item => ({
      ...item,
      color: colors[item.key] || colors.default || '#8884d8',
    }));
}

/**
 * Transform top pages into chart data
 */
export function transformTopPages(topPages = [], limit = 10) {
  return topPages
    .slice(0, limit)
    .map((page, index) => ({
      name: page.page_key || `Page ${index + 1}`,
      views: page.total_count || 0,
      users: page.unique_users || 0,
      key: page.page_key || `page-${index}`,
    }));
}

/**
 * Format date for chart display
 */
export function formatChartDate(date, format = 'MMM DD') {
  return dayjs(date).format(format);
}

/**
 * Format number for tooltip display
 */
export function formatChartNumber(value) {
  return typeof value === 'number' ? value.toLocaleString() : value;
}

/**
 * Get metric color by type
 * Respects theme colors if provided
 */
export function getMetricColor(metricType, colors = {}) {
  const colorMap = {
    query: colors.query || '#1890ff',
    export: colors.export || '#52c41a',
    page_view: colors.pageView || '#13c2c2',
    login: colors.login || '#faad14',
    // Additional metric types
    views: colors.views || colors.query || '#1890ff',
    users: colors.users || colors.pageView || '#13c2c2',
  };
  return colorMap[metricType] || colors.default || '#8884d8';
}

/**
 * Get theme-aware chart colors
 * Returns colors that work well in both light and dark themes
 * @param {object} token - Ant Design theme token
 */
export function getThemeAwareColors(token = {}) {
  return {
    // Primary colors from theme
    query: token.colorPrimary || '#1890ff',
    export: token.colorSuccess || '#52c41a',
    pageView: token.colorInfo || '#13c2c2',
    login: token.colorWarning || '#faad14',
    views: token.colorPrimary || '#1890ff',
    users: token.colorInfo || '#13c2c2',
    // Chart element colors
    grid: token.colorBorderSecondary || '#f0f0f0',
    text: token.colorText || '#000000',
    textSecondary: token.colorTextSecondary || '#8c8c8c',
    background: token.colorBgContainer || '#ffffff',
    tooltipBg: token.colorBgElevated || '#ffffff',
    tooltipBorder: token.colorBorder || '#d9d9d9',
  };
}

/**
 * Create chart series configuration
 * Future extensible: Easy to add new series types
 * @param {Array} seriesConfig - Array of { dataKey, name, color, ...props }
 * @param {object} colors - Color theme
 * @param {object} defaults - Default props for all series
 */
export function createChartSeries(seriesConfig = [], colors = {}, defaults = {}) {
  return seriesConfig.map((s) => ({
    dataKey: s.dataKey,
    name: s.name || s.dataKey,
    color: s.color || getMetricColor(s.dataKey, colors),
    ...defaults,
    ...s,
  }));
}

/**
 * Get default chart config by type
 * Future extensible: Add new chart type defaults here
 */
export function getDefaultChartConfig(type) {
  const configs = {
    pie: {
      outerRadius: 80,
      showLabel: true,
      cx: '50%',
      cy: '50%',
    },
    horizontalBar: {
      yAxisWidth: 150,
      categoryKey: 'name',
    },
    area: {
      stackId: '1',
      fillOpacity: 0.6,
      categoryKey: 'date',
    },
    line: {
      categoryKey: 'date',
    },
    bar: {
      categoryKey: 'name',
    },
  };
  return configs[type] || {};
}

/**
 * Validate chart configuration
 * Future extensible: Add validation rules for new chart types
 */
export function validateChartConfig(type, config) {
  const validations = {
    pie: {
      required: ['data'],
      seriesCount: { min: 1, max: 1 },
    },
    horizontalBar: {
      required: ['data', 'series'],
      seriesCount: { min: 1 },
    },
    area: {
      required: ['data', 'series'],
      seriesCount: { min: 1 },
    },
    line: {
      required: ['data', 'series'],
      seriesCount: { min: 1 },
    },
    bar: {
      required: ['data', 'series'],
      seriesCount: { min: 1 },
    },
  };

  const validation = validations[type] || validations.line;
  
  // Check required fields
  validation.required.forEach(field => {
    if (!config[field]) {
      console.warn(`Chart config missing required field: ${field} for type: ${type}`);
    }
  });

  // Check series count
  if (validation.seriesCount && config.series) {
    const count = config.series.length;
    if (validation.seriesCount.min && count < validation.seriesCount.min) {
      console.warn(`Chart type ${type} requires at least ${validation.seriesCount.min} series`);
    }
    if (validation.seriesCount.max && count > validation.seriesCount.max) {
      console.warn(`Chart type ${type} supports maximum ${validation.seriesCount.max} series`);
    }
  }

  return true;
}

