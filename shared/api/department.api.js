import apiClient from './client';
import { DEPARTMENT_ENDPOINTS } from './endpoints';

/**
 * Get all departments
 */
export const getAllDepartments = async () => {
  const response = await apiClient.get(DEPARTMENT_ENDPOINTS.GET_ALL);
  return response.data;
};

/**
 * Get active departments
 */
export const getActiveDepartments = async () => {
  const response = await apiClient.get(DEPARTMENT_ENDPOINTS.GET_ACTIVE);
  return response.data;
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (departmentId) => {
  const response = await apiClient.get(DEPARTMENT_ENDPOINTS.GET_BY_ID(departmentId));
  return response.data;
};

export default {
  getAllDepartments,
  getActiveDepartments,
  getDepartmentById,
};
