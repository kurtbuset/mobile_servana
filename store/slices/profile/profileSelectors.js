/**
 * Profile state selectors
 */

export const selectClient = (state) => state.profile.client;

export const selectProfileData = (state) => state.profile.client?.prof_id;

export const selectProfileLoading = (state) => state.profile.loading;

export const selectProfileError = (state) => state.profile.error;

export const selectUpdateSuccess = (state) => state.profile.updateSuccess;

export default {
  selectClient,
  selectProfileData,
  selectProfileLoading,
  selectProfileError,
  selectUpdateSuccess,
};
