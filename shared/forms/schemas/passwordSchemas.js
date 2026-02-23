import { validatePassword, validatePasswordMatch } from '../validators';

/**
 * Validate change password form
 */
export const validateChangePasswordForm = (formData) => {
  const errors = {};

  // Validate current password
  if (!formData.currentPassword || !formData.currentPassword.trim()) {
    errors.currentPassword = 'Current password is required';
  }

  // Validate new password
  const newPasswordValidation = validatePassword(formData.newPassword);
  if (!newPasswordValidation.isValid) {
    errors.newPassword = newPasswordValidation.error;
  }

  // Check if new password is different from current
  if (formData.currentPassword === formData.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }

  // Validate password confirmation
  const matchValidation = validatePasswordMatch(
    formData.newPassword,
    formData.confirmPassword
  );
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate reset password form
 */
export const validateResetPasswordForm = (formData) => {
  const errors = {};

  // Validate new password
  const passwordValidation = validatePassword(formData.newPassword);
  if (!passwordValidation.isValid) {
    errors.newPassword = passwordValidation.error;
  }

  // Validate password confirmation
  const matchValidation = validatePasswordMatch(
    formData.newPassword,
    formData.confirmPassword
  );
  if (!matchValidation.isValid) {
    errors.confirmPassword = matchValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateChangePasswordForm,
  validateResetPasswordForm,
};
