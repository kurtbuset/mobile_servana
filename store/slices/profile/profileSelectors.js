/**
 * Profile state selectors
 */

export const selectClient = (state) => state.profile.client;

export const selectProfileData = (state) => state.profile.client?.prof_id;

export const selectProfileLoading = (state) => state.profile.loading;

export const selectProfileError = (state) => state.profile.error;

export const selectUpdateSuccess = (state) => state.profile.updateSuccess;

export const selectProfilePicture = (state) => 
  state.profile.client?.prof_id?.prof_picture;

export const selectFullName = (state) => {
  const profile = state.profile.client?.prof_id;
  if (!profile) return '';
  
  const parts = [
    profile.prof_firstname,
    profile.prof_middlename,
    profile.prof_lastname,
  ].filter(Boolean);

  return parts.join(' ');
};

export default {
  selectClient,
  selectProfileData,
  selectProfileLoading,
  selectProfileError,
  selectUpdateSuccess,
  selectProfilePicture,
  selectFullName,
};
