import { axiosPrivate } from './axiosConfig';
import { API_ROUTES } from '../config/apiRoutes';

export const reportsApi = {
  /**
   * Get dashboard statistics and analytics
   */
  getDashboardStats: async (params = {}) => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.DASHBOARD, { params });
    return response.data;
  },

  /**
   * Get department performance metrics
   */
  getDepartmentPerformance: async (params = {}) => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.DEPARTMENTS, { params });
    return response.data;
  },

  /**
   * Get ward-wise analytics
   */
  getWardAnalytics: async (params = {}) => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.WARDS, { params });
    return response.data;
  },

  /**
   * Get heatmap data for map visualization
   */
  getHeatmapData: async (params = {}) => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.HEATMAP, { params });
    return response.data;
  },

  /**
   * Get monthly trend data
   */
  getMonthlyTrends: async (params = { months: 6 }) => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.TRENDS, { params });
    return response.data;
  },

  /**
   * Get user activity statistics
   */
  getUserActivity: async () => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.USER_ACTIVITY);
    return response.data;
  },

  /**
   * Export complaint data for analysis
   */
  exportComplaints: async (params = {}) => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.EXPORT, { params });
    return response.data;
  },

  /**
   * Get public statistics (no auth required)
   */
  getPublicStats: async () => {
    const response = await axiosPrivate.get(API_ROUTES.REPORTS.PUBLIC);
    return response.data;
  }
};