/**
 * Utility to load Google Fonts dynamically
 */

// Popular Google Fonts that work well with Ant Design
// Recommended fonts are marked with recommended: true
export const AVAILABLE_FONTS = [
  // Recommended/Popular Fonts
  { name: 'Inter', value: 'Inter', category: 'Sans Serif', recommended: true, description: 'Modern, clean, highly legible' },
  { name: 'Roboto', value: 'Roboto', category: 'Sans Serif', recommended: true, description: 'Google\'s signature font' },
  { name: 'Open Sans', value: 'Open Sans', category: 'Sans Serif', recommended: true, description: 'Friendly and open' },
  { name: 'Poppins', value: 'Poppins', category: 'Sans Serif', recommended: true, description: 'Geometric and modern' },
  { name: 'Montserrat', value: 'Montserrat', category: 'Sans Serif', recommended: true, description: 'Elegant and professional' },
  
  // Sans Serif Fonts
  { name: 'Lato', value: 'Lato', category: 'Sans Serif', description: 'Warm and stable' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro', category: 'Sans Serif', description: 'Adobe\'s open source font' },
  { name: 'Nunito', value: 'Nunito', category: 'Sans Serif', description: 'Rounded and friendly' },
  { name: 'Raleway', value: 'Raleway', category: 'Sans Serif', description: 'Elegant sans-serif' },
  { name: 'Ubuntu', value: 'Ubuntu', category: 'Sans Serif', description: 'Humanist sans-serif' },
  { name: 'Work Sans', value: 'Work Sans', category: 'Sans Serif', description: 'Optimized for screens' },
  { name: 'Noto Sans', value: 'Noto Sans', category: 'Sans Serif', description: 'Google\'s universal font' },
  { name: 'DM Sans', value: 'DM Sans', category: 'Sans Serif', description: 'Low-contrast, readable' },
  { name: 'Manrope', value: 'Manrope', category: 'Sans Serif', description: 'Open-source, modern' },
  { name: 'Outfit', value: 'Outfit', category: 'Sans Serif', description: 'Contemporary and versatile' },
  
  // Serif Fonts
  { name: 'Playfair Display', value: 'Playfair Display', category: 'Serif', recommended: true, description: 'Elegant display serif' },
  { name: 'Merriweather', value: 'Merriweather', category: 'Serif', recommended: true, description: 'Designed for screens' },
  { name: 'Lora', value: 'Lora', category: 'Serif', description: 'Well-balanced serif' },
  { name: 'PT Serif', value: 'PT Serif', category: 'Serif', description: 'Russian typeface' },
  { name: 'Crimson Text', value: 'Crimson Text', category: 'Serif', description: 'Book font for digital' },
  { name: 'Libre Baskerville', value: 'Libre Baskerville', category: 'Serif', description: 'Classic book font' },
  
  // Monospace Fonts
  { name: 'Roboto Mono', value: 'Roboto Mono', category: 'Monospace', recommended: true, description: 'Monospace version of Roboto' },
  { name: 'Source Code Pro', value: 'Source Code Pro', category: 'Monospace', description: 'Adobe\'s coding font' },
  { name: 'Fira Code', value: 'Fira Code', category: 'Monospace', description: 'Programming ligatures' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono', category: 'Monospace', description: 'Developer-friendly' },
  
  // Display Fonts
  { name: 'Oswald', value: 'Oswald', category: 'Display', description: 'Condensed sans-serif' },
  { name: 'Bebas Neue', value: 'Bebas Neue', category: 'Display', description: 'Bold display font' },
];

// Default font (system font stack that works without loading)
export const DEFAULT_FONT = 'Inter';

/**
 * Load a Google Font dynamically
 * @param {string} fontFamily - Font family name
 */
export function loadGoogleFont(fontFamily) {
  if (!fontFamily || fontFamily === DEFAULT_FONT) {
    // For default font, we can use system fonts or load Inter
    fontFamily = 'Inter';
  }

  // Check if font is already loaded
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) {
    return; // Font already loaded
  }

  // Create link element to load Google Font
  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontFamily
  )}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

/**
 * Apply font family to the document and Ant Design
 * @param {string} fontFamily - Font family name
 */
export function applyFontFamily(fontFamily) {
  if (!fontFamily) {
    fontFamily = DEFAULT_FONT;
  }

  // Load the font if it's a Google Font
  loadGoogleFont(fontFamily);

  // Apply to document root
  document.documentElement.style.setProperty('--app-font-family', fontFamily);
  document.body.style.fontFamily = `"${fontFamily}", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;

  // Also apply to Ant Design CSS variables if needed
  const style = document.createElement('style');
  style.id = 'antd-font-override';
  style.textContent = `
    :root {
      --ant-font-family: "${fontFamily}", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    body, .ant-typography, .ant-btn, .ant-input, .ant-select-selector, .ant-menu-item, .ant-card-head-title {
      font-family: "${fontFamily}", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }
  `;
  
  // Remove old style if exists
  const oldStyle = document.getElementById('antd-font-override');
  if (oldStyle) {
    oldStyle.remove();
  }
  
  document.head.appendChild(style);
}

/**
 * Get font display name
 * @param {string} fontValue - Font value
 * @returns {string} Display name
 */
export function getFontDisplayName(fontValue) {
  const font = AVAILABLE_FONTS.find((f) => f.value === fontValue);
  return font ? font.name : fontValue;
}

/**
 * Get recommended fonts
 * @returns {Array} Array of recommended fonts
 */
export function getRecommendedFonts() {
  return AVAILABLE_FONTS.filter((font) => font.recommended);
}

/**
 * Group fonts by category
 * @returns {Object} Object with category as key and fonts array as value
 */
export function getFontsByCategory() {
  const grouped = {};
  AVAILABLE_FONTS.forEach((font) => {
    if (!grouped[font.category]) {
      grouped[font.category] = [];
    }
    grouped[font.category].push(font);
  });
  return grouped;
}

