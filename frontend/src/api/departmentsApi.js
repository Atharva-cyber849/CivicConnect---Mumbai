import axiosPrivate from './axiosConfig';
import { API_ROUTES } from '../config/apiRoutes';

export const departmentsApi = {
  /**
   * Get list of all departments
   */
  getAllDepartments: async () => {
    const response = await axiosPrivate.get(API_ROUTES.ADMIN.DEPARTMENTS);
    return response.data;
  },

  /**
   * Get department details by ID
   */
  getDepartmentById: async (id) => {
    const response = await axiosPrivate.get(API_ROUTES.ADMIN.DEPARTMENT_BY_ID(id));
    return response.data;
  },

  /**
   * Create new department
   */
  createDepartment: async (departmentData) => {
    const response = await axiosPrivate.post(API_ROUTES.ADMIN.DEPARTMENTS, departmentData);
    return response.data;
  },

  /**
   * Update department
   */
  updateDepartment: async (id, departmentData) => {
    const response = await axiosPrivate.put(API_ROUTES.ADMIN.DEPARTMENT_BY_ID(id), departmentData);
    return response.data;
  },

  /**
   * Delete department
   */
  deleteDepartment: async (id) => {
    await axiosPrivate.delete(API_ROUTES.ADMIN.DEPARTMENT_BY_ID(id));
  },

  /**
   * Add staff member to department
   */
  addStaffMember: async (departmentId, staffData) => {
    const response = await axiosPrivate.post(
      `${API_ROUTES.ADMIN.DEPARTMENT_BY_ID(departmentId)}add_staff/`,
      staffData
    );
    return response.data;
  },

  /**
   * Remove staff member from department
   */
  removeStaffMember: async (departmentId, userId) => {
    await axiosPrivate.delete(
      `${API_ROUTES.ADMIN.DEPARTMENT_BY_ID(departmentId)}remove_staff/`,
      { data: { user_id: userId } }
    );
  },

  /**
   * Get department statistics
   */
  getDepartmentStats: async (departmentId) => {
    const response = await axiosPrivate.get(
      `${API_ROUTES.ADMIN.DEPARTMENT_BY_ID(departmentId)}statistics/`
    );
    return response.data;
  }
};

export default departmentsApi;