import { useState, useCallback } from 'react';

/**
 * Custom hook for managing form state
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Form state and methods
 */
export const useFormState = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Update single field value
   */
  const setFieldValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    setIsDirty(true);
  }, []);

  /**
   * Update multiple field values
   */
  const setFieldValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }));
    setIsDirty(true);
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setIsDirty(false);
  }, [initialValues]);

  /**
   * Reset form to new values
   */
  const resetToValues = useCallback((newValues) => {
    setValues(newValues);
    setIsDirty(false);
  }, []);

  /**
   * Get field value
   */
  const getFieldValue = useCallback((fieldName) => {
    return values[fieldName];
  }, [values]);

  return {
    values,
    isDirty,
    setFieldValue,
    setFieldValues,
    resetForm,
    resetToValues,
    getFieldValue,
  };
};

export default useFormState;
