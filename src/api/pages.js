import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError } from '../utils/errorHandler';

/**
 * Fetch list of all pages
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether the query should run (default: true)
 */
export function usePages(options = {}) {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const res = await axiosInstance.get('/pages');
      return res.data || res;
    },
    enabled,
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
  });
}

/**
 * Fetch page config by pageKey
 */
export function usePageConfig(pageKey) {
  return useQuery({
    queryKey: ['pages', pageKey, 'config'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pages/${pageKey}/config`);
      return res.data || res;
    },
    enabled: !!pageKey,
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
  });
}

/**
 * Fetch page data by pageKey with query params
 */
export function usePageData(pageKey, queryParams = {}) {
  return useQuery({
    queryKey: ['pages', pageKey, 'data', queryParams],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pages/${pageKey}/data`, {
        params: queryParams,
      });
      return res.data || res;
    },
    enabled: !!pageKey,
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
  });
}

/**
 * Fetch page config and data combined
 */
export function usePage(pageKey, queryParams = {}) {
  return useQuery({
    queryKey: ['pages', pageKey, queryParams],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pages/${pageKey}`, {
        params: queryParams,
      });
      // Axios interceptor returns response.data which is { success: true, message: "...", data: { config, data, total } }
      // Extract the nested data object
      if (res && res.data && typeof res.data === 'object' && 'config' in res.data) {
        return res.data;
      }
      // Fallback: if structure is different, return as-is
      return res.data || res;
    },
    enabled: !!pageKey,
    // Keep previous data while fetching new data (prevents UI flicker)
    placeholderData: (previousData) => previousData,
    // Don't refetch on window focus to prevent unwanted reloads
    refetchOnWindowFocus: false,
    // Cache config separately from data for better performance
    staleTime: (query) => {
      // Config changes less frequently, cache longer
      const isConfigOnly = !queryParams.page && !queryParams.pageSize && !queryParams.search && !queryParams.sortBy;
      return isConfigOnly ? 10 * 60 * 1000 : 2 * 60 * 1000; // 10 min for config, 2 min for data
    },
  });
}

/**
 * Convert JSON data to CSV format
 * CSV uses labels from config (same as Excel) for user-friendly headers
 */
function convertToCSV(data, selectedColumns = [], config = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get columns from first row
  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return '';
  }

  // Get column keys (names/aliases)
  const cols = selectedColumns.length > 0 ? selectedColumns : Object.keys(firstRow);
  if (cols.length === 0) {
    return '';
  }

  // Generate CSV header using labels from config (same as Excel)
  const header = cols.map((colName) => {
    const columnConfig = config?.columns?.find(col => col.name === colName);
    const headerLabel = columnConfig?.label || colName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const escaped = String(headerLabel).replace(/"/g, '""');
    return `"${escaped}"`;
  }).join(',');

  // Generate CSV rows using column names as keys
  const rows = data.map((row) => {
    if (!row || typeof row !== 'object') {
      return cols.map(() => '""').join(',');
    }
    return cols
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
          return '""';
        }
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Convert JSON data to Excel format with formatting (headers, borders, fonts)
 * Uses exceljs for professional Excel file generation
 */
function convertToExcel(data, selectedColumns = [], config = {}) {
  // Dynamic import of exceljs for lightweight loading
  return import('exceljs').then((ExcelJS) => {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Filter data to selected columns if provided
    let filteredData = data;
    if (selectedColumns.length > 0 && data.length > 0) {
      filteredData = data.map(row => {
        const filteredRow = {};
        selectedColumns.forEach(colName => {
          if (row.hasOwnProperty(colName)) {
            filteredRow[colName] = row[colName];
          }
        });
        return filteredRow;
      });
    }

    // Get column definitions with labels from config
    const columnDefs = [];
    const keys = selectedColumns.length > 0 ? selectedColumns : (data.length > 0 ? Object.keys(data[0]) : []);
    
    keys.forEach(colName => {
      const columnConfig = config?.columns?.find(col => col.name === colName);
      const headerLabel = columnConfig?.label || colName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      columnDefs.push({
        header: headerLabel, // Use label for Excel header
        key: colName, // Use column name as key for data access
        width: 15
      });
    });

    // Set column definitions
    worksheet.columns = columnDefs;

    // Add header row styling - only for columns with data
    const headerRow = worksheet.getRow(1);
    headerRow.height = 20;
    
    // Style only header cells that have data (based on column count)
    for (let colIndex = 1; colIndex <= columnDefs.length; colIndex++) {
      const headerCell = headerRow.getCell(colIndex);
      headerCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Standard Excel blue-gray header color
      };
      headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      headerCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }

    // Add data rows
    filteredData.forEach((row, rowIndex) => {
      const excelRow = worksheet.addRow(row);
      
      // Style data rows (borders, left-aligned text)
      excelRow.font = { size: 10 };
      excelRow.alignment = { horizontal: 'left', vertical: 'middle' };
      excelRow.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });

    // Auto-size columns based on content
    worksheet.columns.forEach((column, index) => {
      let maxLength = column.header.length;
      filteredData.forEach(row => {
        const key = keys[index];
        const value = String(row[key] || '');
        if (value.length > maxLength) {
          maxLength = value.length;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50); // Min 10, max 50
    });

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Generate Excel file buffer
    return workbook.xlsx.writeBuffer();
  });
}

/**
 * Download page data as CSV or Excel
 * Backend sends JSON, frontend converts to selected format and downloads
 */
export async function downloadPageData(pageKey, queryParams = {}, selectedColumns = [], format = 'csv', config = {}) {
  try {
    // Build params with selected columns (comma-separated string)
    const params = { ...queryParams, format };
    if (selectedColumns && selectedColumns.length > 0) {
      params.columns = selectedColumns.join(',');
    }
    
    // Fetch JSON data from backend (only selected columns will be returned)
    const response = await axiosInstance.get(`/pages/${pageKey}/download`, {
      params,
      responseType: 'json',
    });

    // Extract data from response
    const responseData = response.data || response;
    const data = responseData.data?.data || responseData.data || [];

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to download');
    }

    // Get filename from page title or fallback to pageKey
    const getFileName = (extension) => {
      const pageName = config?.title || pageKey;
      // Sanitize filename: remove patterns like (_table_) and invalid characters
      let sanitized = pageName
        .replace(/\(_[^)]*_\)/g, '') // Remove patterns like (_table_), (_view_), etc.
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      return `${sanitized}.${extension}`;
    };

    if (format === 'excel') {
      // Convert to Excel
      const excelBuffer = await convertToExcel(data, selectedColumns, config);
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName('xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Convert JSON to CSV (default)
      const csv = convertToCSV(data, selectedColumns, config);

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName('csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return { success: true };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

