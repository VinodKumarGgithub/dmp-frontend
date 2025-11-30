/**
 * Top Pages Usage Bar Chart Component
 * DRY principle: Reusable bar chart for top pages
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import ChartContainer from './ChartContainer';
import { formatChartNumber } from '../../utils/chartUtils';

/**
 * TopPagesChart - Displays top pages usage as horizontal bar chart
 * @param {Array} data - Chart data (from transformTopPages)
 * @param {object} colors - Color theme object
 * @param {number} height - Chart height
 * @param {number} yAxisWidth - Y-axis width
 */
export default function TopPagesChart({ 
  data = [], 
  colors = {},
  height = 300,
  yAxisWidth = 150,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const viewsColor = colors.views || '#1890ff';
  const usersColor = colors.users || '#13c2c2';

  return (
    <ChartContainer title="Top Pages Usage" height={height}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={yAxisWidth}
          tick={{ fontSize: 12 }}
        />
        <Tooltip formatter={formatChartNumber} />
        <Legend />
        <Bar dataKey="views" fill={viewsColor} name="Total Views" />
        <Bar dataKey="users" fill={usersColor} name="Unique Users" />
      </BarChart>
    </ChartContainer>
  );
}

