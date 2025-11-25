/**
 * Utility functions for managing column preferences in localStorage
 * Stores per-page column visibility and ordering preferences
 */

const STORAGE_KEY_PREFIX = 'column_preferences_';

/**
 * Get column preferences for a specific page
 * @param {string} pageKey - The page key
 * @returns {Object|null} Column preferences or null if not found
 */
export function getColumnPreferences(pageKey) {
  if (!pageKey) return null;
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${pageKey}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading column preferences:', error);
  }
  
  return null;
}

/**
 * Save column preferences for a specific page
 * @param {string} pageKey - The page key
 * @param {Object} preferences - Column preferences object
 */
export function saveColumnPreferences(pageKey, preferences) {
  if (!pageKey) return;
  
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${pageKey}`, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving column preferences:', error);
  }
}

/**
 * Clear column preferences for a specific page
 * @param {string} pageKey - The page key
 */
export function clearColumnPreferences(pageKey) {
  if (!pageKey) return;
  
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${pageKey}`);
  } catch (error) {
    console.error('Error clearing column preferences:', error);
  }
}

/**
 * Normalize column settings to ensure consistent format
 * @param {Array} columns - Array of column configs
 * @returns {Array} Normalized column settings
 */
export function normalizeColumns(columns) {
  if (!Array.isArray(columns)) return [];
  
  return columns
    .filter(Boolean)
    .map((col, index) => ({
      name: col.name || '',
      label: col.label || col.name || '',
      type: col.type || 'string',
      visible: col.visible !== undefined ? Boolean(col.visible) : true,
      order: col.order !== undefined ? col.order : index,
      width: col.width,
    }))
    .filter(col => col.name);
}

/**
 * Initialize column settings from config with saved preferences
 * @param {Array} configColumns - Columns from page config
 * @param {Object} savedPreferences - Saved preferences from localStorage
 * @returns {Array} Column settings with preferences applied
 */
export function initializeColumnSettings(configColumns, savedPreferences) {
  if (!Array.isArray(configColumns) || configColumns.length === 0) {
    return [];
  }
  
  const savedColumns = savedPreferences?.visibleColumns || [];
  const savedMap = new Map(savedColumns.map(col => [col.name, col]));
  
  // Build settings from config, applying saved preferences
  const settings = configColumns.map((col, index) => {
    const saved = savedMap.get(col.name);
    return {
      name: col.name,
      label: col.label || col.name,
      type: col.type || 'string',
      visible: saved?.visible !== undefined ? saved.visible : index < 5, // First 5 visible by default, but user can show more
      order: saved?.order !== undefined ? saved.order : index,
      width: col.width,
    };
  });
  
  // Sort by order
  return settings.sort((a, b) => a.order - b.order);
}

