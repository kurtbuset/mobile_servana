import { useState } from 'react';
import { departmentAPI } from '../../../shared/api';

/**
 * Hook for loading departments
 */
export const useDepartments = (token) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDepartments = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Use centralized API
      const data = await departmentAPI.getActiveDepartments();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    departments,
    loading,
    loadDepartments,
  };
};

export default useDepartments;
