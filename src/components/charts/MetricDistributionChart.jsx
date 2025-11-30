/**
 * Metric Distribution Pie Chart Component
 * DRY principle: Reusable pie chart for metric distribution
 */

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from './ChartContainer';
import { formatChartNumber } from '../../utils/chartUtils';

/**
 * MetricDistributionChart - Displays metric distribution as pie chart
 * @param {Array} data - Chart data (from transformTotalsToPieData)
 * @param {number} height - Chart height
 * @param {number} outerRadius - Pie outer radius
 * @param {boolean} showLabel - Show percentage labels
 */
export default function MetricDistributionChart({ 
  data = [], 
  height = 300,
  outerRadius = 80,
  showLabel = true,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const renderLabel = showLabel 
    ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
    : false;

  return (
    <ChartContainer title="Metric Distribution" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={formatChartNumber} />
        {!showLabel && <Legend />}
      </PieChart>
    </ChartContainer>
  );
}

