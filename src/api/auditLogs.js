import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError } from '../utils/errorHandler';

/**
 * Fetch audit logs with filters
 */
export function useAuditLogs(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.organizationId) params.append('organizationId', filters.organizationId);
      if (filters.pageKey) params.append('pageKey', filters.pageKey);
      if (filters.tenantId) params.append('tenantId', filters.tenantId);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.success !== undefined && filters.success !== null) {
        params.append('success', filters.success);
      }
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.actionType) params.append('actionType', filters.actionType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.pageSize) params.append('pageSize', filters.pageSize);

      const res = await axiosInstance.get(`/api/audit-logs?${params.toString()}`);
      return res.data;
    },
    ...options
  });
}

/**
 * Fetch single audit log by ID
 */
export function useAuditLog(logId, options = {}) {
  return useQuery({
    queryKey: ['auditLog', logId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/audit-logs/${logId}`);
      return res.data;
    },
    enabled: Boolean(logId),
    ...options
  });
}

