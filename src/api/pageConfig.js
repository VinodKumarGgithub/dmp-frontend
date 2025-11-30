import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Create a new page config
 */
export function useCreatePageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const res = await axiosInstance.post('/pages', data);
        showSuccess('Page config created successfully!');
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Update page config
 */
export function useUpdatePageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageKey, data }) => {
      try {
        const res = await axiosInstance.put(`/pages/${pageKey}`, data);
        showSuccess('Page config updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        queryClient.invalidateQueries({ queryKey: ['pages', pageKey] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Delete page config
 */
export function useDeletePageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageKey) => {
      try {
        const res = await axiosInstance.delete(`/pages/${pageKey}`);
        showSuccess('Page config deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Get list of tables and views from tenant database
 */
export function useTables(options = {}) {
  return useQuery({
    queryKey: ['db', 'tables'],
    queryFn: async () => {
      const res = await axiosInstance.get('/pages/db/tables');
      return res.data?.data || res.data || [];
    },
    enabled: options.enabled !== false,
    ...options,
  });
}

/**
 * Get columns from a specific table or view
 */
export function useTableColumns(tableName, options = {}) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'columns'],
    queryFn: async () => {
      if (!tableName) return [];
      const res = await axiosInstance.get(`/pages/db/tables/${tableName}/columns`);
      return res.data?.data || res.data || [];
    },
    enabled: !!tableName && (options.enabled !== false),
    ...options,
  });
}

/**
 * Get index information for a specific table
 */
export function useTableIndexes(tableName, options = {}) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'indexes'],
    queryFn: async () => {
      if (!tableName) return {};
      const res = await axiosInstance.get(`/pages/db/tables/${tableName}/indexes`);
      return res.data?.data || res.data || {};
    },
    enabled: !!tableName && (options.enabled !== false),
    ...options,
  });
}

/**
 * Get parameters from a specific stored procedure
 */
export function useProcedureParameters(procedureName, options = {}) {
  return useQuery({
    queryKey: ['db', 'procedures', procedureName, 'parameters'],
    queryFn: async () => {
      if (!procedureName) return [];
      const res = await axiosInstance.get(`/pages/db/procedures/${procedureName}/parameters`);
      return res.data?.data || res.data || [];
    },
    enabled: !!procedureName && (options.enabled !== false),
    ...options,
  });
}

/**
 * Detect columns for a given p_sql query
 */
export async function detectColumns(pageKey, pSql) {
  try {
    const targetKey = pageKey || 'detect';
    const res = await axiosInstance.post(`/pages/${targetKey}/detect-columns`, {
      p_sql: pSql
    });
    return res.data?.data || res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * Detect columns with metadata analysis for CUSTOM_QUERY
 * Returns columns, recommendations, and performance feedback
 */
export async function detectColumnsEnhanced(pageKey, customQuery) {
  try {
    const targetKey = pageKey || 'detect';
    const res = await axiosInstance.post(`/pages/${targetKey}/detect-columns-enhanced`, {
      custom_query: customQuery
    });
    return res.data?.data || res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * Test a p_sql query (for validation and preview)
 */
export async function testQuery(pageKey, pSql, customQuery, queryParams = {}) {
  try {
    const body = {
      queryParams
    };
    
    if (customQuery) {
      body.custom_query = customQuery;
    } else {
      body.p_sql = pSql;
    }
    
    const res = await axiosInstance.post(`/pages/${pageKey}/test-query`, body);
    return res.data?.data || res.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

