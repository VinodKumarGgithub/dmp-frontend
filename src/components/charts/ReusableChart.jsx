/**
 * Unified Reusable Chart Component
 * DRY principle: Single component for all chart types
 * Future extensible: Registry pattern for easy addition of new chart types
 */

import {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  Line,
  Area,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, theme as antdTheme } from 'antd';
import { formatChartDate, formatChartNumber, getMetricColor } from '../../utils/chartUtils';

/**
 * Chart Type Registry
 * Future extensible: Add new chart types here without modifying core component
 */
const CHART_REGISTRY = {
  line: {
    Chart: LineChart,
    Series: Line,
    defaultProps: {
      type: 'monotone',
    },
  },
  area: {
    Chart: AreaChart,
    Series: Area,
    defaultProps: {
      type: 'monotone',
      fillOpacity: 0.6,
    },
  },
  bar: {
    Chart: BarChart,
    Series: Bar,
    defaultProps: {},
  },
  horizontalBar: {
    Chart: BarChart,
    Series: Bar,
    defaultProps: {
      layout: 'vertical',
    },
  },
  pie: {
    Chart: PieChart,
    Series: Pie,
    defaultProps: {
      cx: '50%',
      cy: '50%',
      outerRadius: 80,
    },
  },
};

/**
 * Register a new chart type (Future extensible)
 * @param {string} type - Chart type name
 * @param {object} config - Chart configuration { Chart, Series, defaultProps }
 */
export function registerChartType(type, config) {
  CHART_REGISTRY[type] = config;
}

/**
 * Get chart type configuration
 */
function getChartTypeConfig(type) {
  return CHART_REGISTRY[type] || CHART_REGISTRY.line;
}

/**
 * ReusableChart - Unified chart component supporting multiple chart types
 * 
 * @param {string} type - Chart type: 'line' | 'area' | 'bar' | 'horizontalBar' | 'pie'
 * @param {Array} data - Chart data
 * @param {Array} series - Series configuration [{ dataKey, name, color, ...props }]
 * @param {object} config - Chart configuration
 * @param {string} title - Chart title
 * @param {number} height - Chart height
 * @param {object} colors - Color theme
 * @param {function} customRenderer - Custom render function (future extensible)
 * @param {object} cardProps - Additional Card props
 */
export default function ReusableChart({
  type = 'line',
  data = [],
  series = [],
  config = {},
  title,
  height = 300,
  colors = {},
  customRenderer = null,
  ...cardProps
}) {
  // Get theme tokens for theme-aware styling
  const { token } = antdTheme.useToken();
  
  // Don't render if no data
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Theme-aware colors for chart elements
  const themeColors = {
    grid: token.colorBorderSecondary,
    text: token.colorText,
    textSecondary: token.colorTextSecondary,
    background: token.colorBgContainer,
    tooltipBg: token.colorBgElevated,
    tooltipBorder: token.colorBorder,
  };

  // Allow custom renderer for future extensibility
  if (customRenderer && typeof customRenderer === 'function') {
    return (
      <Card title={title} size="small" {...cardProps}>
        <ResponsiveContainer width="100%" height={height}>
          {customRenderer({ data, series, config, colors, type })}
        </ResponsiveContainer>
      </Card>
    );
  }

  // Get chart type configuration
  const chartConfig = getChartTypeConfig(type);
  const ChartComponent = chartConfig.Chart;
  const SeriesComponent = chartConfig.Series;

  // Merge default props with config
  const chartProps = {
    data,
    ...chartConfig.defaultProps,
    ...config.chartProps,
  };

  // Common tooltip configuration
  const tooltipProps = {
    formatter: config.tooltipFormatter || formatChartNumber,
    labelFormatter: config.labelFormatter || ((label) => label),
    ...config.tooltipProps,
  };

  // Render chart based on type
  const renderChart = () => {
    // Pie chart has special rendering
    if (type === 'pie') {
      const firstSeries = series[0] || { dataKey: 'value' };
      return (
        <ChartComponent {...chartProps}>
          <SeriesComponent
            data={data}
            cx={config.cx || chartConfig.defaultProps.cx}
            cy={config.cy || chartConfig.defaultProps.cy}
            labelLine={config.showLabel !== false}
            label={config.showLabel !== false ? ({ name, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%` : false
            }
            outerRadius={config.outerRadius || chartConfig.defaultProps.outerRadius}
            fill="#8884d8"
            dataKey={firstSeries.dataKey}
            {...config.pieProps}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || series[index]?.color || getMetricColor(entry.name || entry.key, colors)} 
              />
            ))}
          </SeriesComponent>
          <Tooltip 
            {...tooltipProps}
            contentStyle={{
              backgroundColor: themeColors.tooltipBg,
              border: `1px solid ${themeColors.tooltipBorder}`,
              borderRadius: token.borderRadius,
              color: themeColors.text,
            }}
            labelStyle={{ color: themeColors.text }}
          />
          {config.showLabel === false && (
            <Legend 
              wrapperStyle={{ color: themeColors.text }}
            />
          )}
        </ChartComponent>
      );
    }

    // Horizontal bar chart
    if (type === 'horizontalBar') {
      return (
        <ChartComponent {...chartProps} layout="vertical">
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={themeColors.grid}
          />
          <XAxis 
            type="number" 
            stroke={themeColors.textSecondary}
            tick={{ fill: themeColors.text }}
            {...config.xAxisProps} 
          />
          <YAxis 
            dataKey={config.categoryKey || 'name'} 
            type="category" 
            width={config.yAxisWidth || 150}
            tick={{ fontSize: 12, fill: themeColors.text }}
            stroke={themeColors.textSecondary}
            {...config.yAxisProps}
          />
          <Tooltip 
            {...tooltipProps}
            contentStyle={{
              backgroundColor: themeColors.tooltipBg,
              border: `1px solid ${themeColors.tooltipBorder}`,
              borderRadius: token.borderRadius,
              color: themeColors.text,
            }}
            labelStyle={{ color: themeColors.text }}
          />
          <Legend 
            wrapperStyle={{ color: themeColors.text }}
          />
          {series.map((s, index) => (
            <SeriesComponent
              key={s.dataKey || index}
              dataKey={s.dataKey}
              fill={s.color || getMetricColor(s.dataKey, colors)}
              name={s.name}
              {...chartConfig.defaultProps}
              {...s.barProps}
              {...s.areaProps}
              {...s.lineProps}
            />
          ))}
        </ChartComponent>
      );
    }

    // Line, Area, and Bar charts
    return (
      <ChartComponent {...chartProps}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={themeColors.grid}
        />
        <XAxis 
          dataKey={config.categoryKey || (type === 'area' || type === 'line' ? 'date' : 'name')}
          tickFormatter={config.xAxisFormatter || (type === 'area' || type === 'line' ? formatChartDate : undefined)}
          stroke={themeColors.textSecondary}
          tick={{ fill: themeColors.text }}
          {...config.xAxisProps}
        />
        <YAxis 
          stroke={themeColors.textSecondary}
          tick={{ fill: themeColors.text }}
          {...config.yAxisProps} 
        />
        <Tooltip 
          {...tooltipProps}
          labelFormatter={config.labelFormatter || (
            (type === 'area' || type === 'line') 
              ? ((date) => formatChartDate(date, 'YYYY-MM-DD'))
              : undefined
          )}
          contentStyle={{
            backgroundColor: themeColors.tooltipBg,
            border: `1px solid ${themeColors.tooltipBorder}`,
            borderRadius: token.borderRadius,
            color: themeColors.text,
          }}
          labelStyle={{ color: themeColors.text }}
        />
        <Legend 
          wrapperStyle={{ color: themeColors.text }}
        />
        {series.map((s, index) => (
          <SeriesComponent
            key={s.dataKey || index}
            dataKey={s.dataKey}
            stroke={s.color || getMetricColor(s.dataKey, colors)}
            fill={s.color || getMetricColor(s.dataKey, colors)}
            name={s.name}
            stackId={s.stackId || config.stackId}
            fillOpacity={s.fillOpacity || chartConfig.defaultProps.fillOpacity}
            {...chartConfig.defaultProps}
            {...s.barProps}
            {...s.areaProps}
            {...s.lineProps}
          />
        ))}
      </ChartComponent>
    );
  };

  return (
    <Card title={title} size="small" {...cardProps}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </Card>
  );
}

