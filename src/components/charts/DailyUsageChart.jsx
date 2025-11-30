/**
 * Daily Usage Trends Chart Component
 * DRY principle: Reusable area chart for daily metrics
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from './ChartContainer';
import { formatChartDate, formatChartNumber, getMetricColor } from '../../utils/chartUtils';

/**
 * DailyUsageChart - Displays daily usage trends as stacked area chart
 * @param {Array} data - Chart data (from transformDailyMetrics)
 * @param {object} colors - Color theme object
 * @param {number} height - Chart height
 */
export default function DailyUsageChart({ 
  data = [], 
  colors = {},
  height = 300 
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const metricTypes = [
    { key: 'query', name: 'Queries', dataKey: 'query' },
    { key: 'export', name: 'Exports', dataKey: 'export' },
    { key: 'page_view', name: 'Page Views', dataKey: 'page_view' },
    { key: 'login', name: 'Logins', dataKey: 'login' },
  ];

  return (
    <ChartContainer title="Daily Usage Trends" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatChartDate}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(date) => formatChartDate(date, 'YYYY-MM-DD')}
          formatter={formatChartNumber}
        />
        <Legend />
        {metricTypes.map(({ key, name, dataKey }) => (
          <Area
            key={key}
            type="monotone"
            dataKey={dataKey}
            stackId="1"
            stroke={getMetricColor(key, colors)}
            fill={getMetricColor(key, colors)}
            fillOpacity={0.6}
            name={name}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

