# Reusable Chart Component

A unified, extensible chart component that supports multiple chart types using a registry pattern.

## Features

- **DRY Principle**: Single component for all chart types
- **Future Extensible**: Easy to add new chart types without modifying core code
- **Type-Safe**: Supports line, area, bar, horizontalBar, and pie charts
- **Customizable**: Full control over styling, colors, and configuration
- **Plugin Support**: Register custom chart types at runtime
- **Theme-Aware**: Automatically respects Ant Design theme (light/dark mode)

## Basic Usage

```javascript
import ReusableChart from '../components/charts/ReusableChart';
import { createChartSeries } from '../utils/chartUtils';

<ReusableChart
  type="line"
  title="My Chart"
  data={chartData}
  series={createChartSeries([
    { dataKey: 'value', name: 'Value' },
    { dataKey: 'count', name: 'Count' },
  ])}
  colors={colorTheme}
/>
```

## Supported Chart Types

### Line Chart
```javascript
<ReusableChart
  type="line"
  title="Trends Over Time"
  data={timeSeriesData}
  series={createChartSeries([
    { dataKey: 'sales', name: 'Sales' },
    { dataKey: 'revenue', name: 'Revenue' },
  ])}
  config={{
    categoryKey: 'date',
    xAxisFormatter: (date) => formatDate(date),
  }}
/>
```

### Area Chart
```javascript
<ReusableChart
  type="area"
  title="Stacked Area Chart"
  data={data}
  series={createChartSeries([
    { dataKey: 'query', name: 'Queries' },
    { dataKey: 'export', name: 'Exports' },
  ])}
  config={{
    stackId: '1',
    fillOpacity: 0.6,
  }}
/>
```

### Bar Chart
```javascript
<ReusableChart
  type="bar"
  title="Comparison Chart"
  data={data}
  series={createChartSeries([
    { dataKey: 'value1', name: 'Value 1' },
    { dataKey: 'value2', name: 'Value 2' },
  ])}
  config={{
    categoryKey: 'name',
  }}
/>
```

### Horizontal Bar Chart
```javascript
<ReusableChart
  type="horizontalBar"
  title="Top Items"
  data={data}
  series={createChartSeries([
    { dataKey: 'views', name: 'Views' },
  ])}
  config={{
    categoryKey: 'name',
    yAxisWidth: 150,
  }}
/>
```

### Pie Chart
```javascript
<ReusableChart
  type="pie"
  title="Distribution"
  data={pieData}
  series={[{ dataKey: 'value' }]}
  config={{
    outerRadius: 80,
    showLabel: true,
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `'line'` | Chart type: 'line', 'area', 'bar', 'horizontalBar', 'pie' |
| `data` | `Array` | `[]` | Chart data array |
| `series` | `Array` | `[]` | Series configuration array |
| `config` | `object` | `{}` | Chart configuration object |
| `title` | `string` | - | Chart title |
| `height` | `number` | `300` | Chart height in pixels |
| `colors` | `object` | `{}` | Color theme object |
| `customRenderer` | `function` | `null` | Custom render function for advanced use cases |

## Series Configuration

Each series object can have:
- `dataKey`: Data key to plot
- `name`: Display name
- `color`: Series color
- `stackId`: Stack ID for stacked charts
- `fillOpacity`: Fill opacity (for area charts)
- `barProps`: Additional props for Bar component
- `areaProps`: Additional props for Area component
- `lineProps`: Additional props for Line component

## Config Object

Common config properties:
- `categoryKey`: Key for X-axis/category axis (default: 'date' for line/area, 'name' for bar)
- `xAxisFormatter`: Function to format X-axis labels
- `labelFormatter`: Function to format tooltip labels
- `tooltipFormatter`: Function to format tooltip values
- `stackId`: Stack ID for stacked charts
- `yAxisWidth`: Width of Y-axis (for horizontalBar)
- `outerRadius`: Outer radius (for pie charts)
- `showLabel`: Show labels on pie chart (default: true)
- `xAxisProps`: Additional XAxis props
- `yAxisProps`: Additional YAxis props
- `chartProps`: Additional chart component props

## Future Extensibility

### Adding a New Chart Type

1. **Register the chart type** (recommended for built-in types):

```javascript
import { registerChartType } from '../components/charts/ReusableChart';
import { RadarChart, Radar } from 'recharts';

registerChartType('radar', {
  Chart: RadarChart,
  Series: Radar,
  defaultProps: {
    cx: '50%',
    cy: '50%',
    outerRadius: 80,
  },
});
```

2. **Use custom renderer** (for complex custom charts):

```javascript
<ReusableChart
  type="custom"
  title="Custom Chart"
  data={data}
  customRenderer={({ data, series, config }) => (
    <CustomChartComponent data={data} {...config} />
  )}
/>
```

### Adding Custom Utilities

Add new transformation functions to `utils/chartUtils.js`:

```javascript
export function transformMyData(rawData) {
  // Your transformation logic
  return transformedData;
}
```

### Extending Color Themes

Update `getMetricColor` in `chartUtils.js`:

```javascript
export function getMetricColor(metricType, colors = {}) {
  const colorMap = {
    // ... existing colors
    myNewType: colors.myNewType || '#ff0000',
  };
  return colorMap[metricType] || colors.default || '#8884d8';
}
```

## Examples

See `src/pages/UsageAnalytics.jsx` for real-world usage examples.

## Theme Support

Charts automatically respect the Ant Design theme:

- **Dark Mode**: Grid, text, and tooltips adapt to dark theme
- **Light Mode**: Uses light theme colors
- **Theme Tokens**: Automatically uses `token.colorPrimary`, `token.colorText`, etc.
- **Custom Colors**: Pass theme-aware colors via `colors` prop

```javascript
import { theme as antdTheme } from 'antd';
import { getThemeAwareColors } from '../utils/chartUtils';

const { token } = antdTheme.useToken();
const themeColors = getThemeAwareColors(token);

<ReusableChart
  type="line"
  data={data}
  series={series}
  colors={themeColors}
/>
```

## Performance Tips

1. Use `useMemo` for data transformations
2. Memoize series configurations
3. Use `ResponsiveContainer` for responsive charts
4. Conditionally render charts only when data is available
5. Charts automatically adapt to theme changes

## Migration from Individual Components

Replace:
```javascript
<DailyUsageChart data={data} colors={colors} />
```

With:
```javascript
<ReusableChart
  type="area"
  title="Daily Usage Trends"
  data={data}
  series={createChartSeries([...], colors)}
  config={{...}}
/>
```

