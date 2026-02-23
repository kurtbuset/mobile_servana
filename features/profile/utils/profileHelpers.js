/**
 * Format profile data for API submission
 */
export const formatProfileData = (formData) => {
  return {
    prof_firstname: formData.firstName,
    prof_middlename: formData.middleName || '',
    prof_lastname: formData.lastName,
    prof_address: formData.address || '',
    prof_street_address: formData.streetAddress || '',
    prof_region_info: formData.regionInfo || '',
    prof_postal_code: formData.postalCode || '',
    prof_date_of_birth: formData.birthdate || null,
  };
};

/**
 * Extract profile form data from profile object
 */
export const extractProfileFormData = (profile) => {
  if (!profile) return {};

  return {
    firstName: profile.prof_firstname || '',
    middleName: profile.prof_middlename || '',
    lastName: profile.prof_lastname || '',
    address: profile.prof_address || '',
    streetAddress: profile.prof_street_address || '',
    regionInfo: profile.prof_region_info || '',
    postalCode: profile.prof_postal_code || '',
    birthdate: profile.prof_date_of_birth || '',
  };
};

/**
 * Get full name from profile
 */
export const getFullName = (profile) => {
  if (!profile) return '';
  
  const parts = [
    profile.prof_firstname,
    profile.prof_middlename,
    profile.prof_lastname,
  ].filter(Boolean);

  return parts.join(' ');
};

/**
 * Get initials from profile
 */
export const getInitials = (profile) => {
  if (!profile) return '?';

  const firstName = profile.prof_firstname || '';
  const lastName = profile.prof_lastname || '';

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  return '?';
};

export default {
  formatProfileData,
  extractProfileFormData,
  getFullName,
  getInitials,
};
