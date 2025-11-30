/**
 * Reusable Chart Container Component
 * DRY principle: Common chart wrapper with consistent styling
 */

import { Card } from 'antd';
import { ResponsiveContainer } from 'recharts';

/**
 * ChartContainer - Wrapper for all charts with consistent styling
 * @param {string} title - Chart title
 * @param {ReactNode} children - Chart component
 * @param {number} height - Chart height (default: 300)
 * @param {string} size - Card size ('small' | 'default')
 * @param {object} cardProps - Additional Card props
 */
export default function ChartContainer({ 
  title, 
  children, 
  height = 300, 
  size = 'small',
  ...cardProps 
}) {
  return (
    <Card title={title} size={size} {...cardProps}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </Card>
  );
}

