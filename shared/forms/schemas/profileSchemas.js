import { validateName, validateDateOfBirth } from '../validators';

/**
 * Validate profile form
 */
export const validateProfileForm = (formData) => {
  const errors = {};

  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
  }

  // Validate last name (optional)
  if (formData.lastName && formData.lastName.trim()) {
    const lastNameValidation = validateName(formData.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      errors.lastName = lastNameValidation.error;
    }
  }

  // Validate middle name (optional)
  if (formData.middleName && formData.middleName.trim()) {
    const middleNameValidation = validateName(formData.middleName, 'Middle name');
    if (!middleNameValidation.isValid) {
      errors.middleName = middleNameValidation.error;
    }
  }

  // Validate date of birth
  if (formData.birthdate) {
    const dobValidation = validateDateOfBirth(formData.birthdate);
    if (!dobValidation.isValid) {
      errors.birthdate = dobValidation.error;
    }
  }

  // Validate postal code (optional)
  if (formData.postalCode && formData.postalCode.trim()) {
    if (!/^\d{4,10}$/.test(formData.postalCode)) {
      errors.postalCode = 'Invalid postal code format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate personal information form
 */
export const validatePersonalInfoForm = (formData) => {
  const errors = {};

  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
  }

  // Validate last name
  const lastNameValidation = validateName(formData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
  }

  // Validate date of birth
  const dobValidation = validateDateOfBirth(formData.birthdate);
  if (!dobValidation.isValid) {
    errors.birthdate = dobValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateProfileForm,
  validatePersonalInfoForm,
};
