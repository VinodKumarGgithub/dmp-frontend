/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color string (e.g., '#1890ff')
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
export const hexToRgba = (hex, alpha) => {
  if (!hex || !hex.startsWith('#')) return `rgba(24, 144, 255, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

