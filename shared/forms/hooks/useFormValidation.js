import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation
 * @param {Function} validationSchema - Function that validates form data
 * @returns {Object} Validation state and methods
 */
export const useFormValidation = (validationSchema) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Validate entire form
   */
  const validateForm = useCallback((formData) => {
    const validation = validationSchema(formData);
    setErrors(validation.errors || {});
    return validation.isValid;
  }, [validationSchema]);

  /**
   * Validate single field
   */
  const validateField = useCallback((fieldName, value, formData) => {
    const validation = validationSchema({ ...formData, [fieldName]: value });
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: validation.errors?.[fieldName] || null,
    }));

    return !validation.errors?.[fieldName];
  }, [validationSchema]);

  /**
   * Mark field as touched
   */
  const touchField = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Get error for specific field (only if touched)
   */
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [errors, touched]);

  return {
    errors,
    touched,
    validateForm,
    validateField,
    touchField,
    clearErrors,
    clearFieldError,
    getFieldError,
  };
};

export default useFormValidation;
