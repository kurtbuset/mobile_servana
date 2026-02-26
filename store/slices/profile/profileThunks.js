import { createAsyncThunk } from '@reduxjs/toolkit';
import { profileAPI } from '../../../shared/api';
import { setClient, setProfileError, setUpdateSuccess } from './profileSlice';

/**
 * Update profile thunk
 */
export const updateProfileThunk = createAsyncThunk(
  'profile/update',
  async ({ profileId, profileData }, { dispatch, rejectWithValue }) => {
    try {
      const result = await profileAPI.updateProfile(profileId, profileData);

      // Update state with new profile data
      dispatch(setClient({ client: { prof_id: result.profile } }));
      dispatch(setUpdateSuccess(true));

      // Clear success flag after 3 seconds
      setTimeout(() => {
        dispatch(setUpdateSuccess(false));
      }, 3000);

      return result;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      dispatch(setProfileError(message));
      return rejectWithValue(message);
    }
  }
);

/**
 * Upload profile picture thunk
 */
export const uploadProfilePictureThunk = createAsyncThunk(
  'profile/uploadPicture',
  async ({ profileId, imageData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const result = await profileAPI.uploadProfilePicture(profileId, imageData);

      // Update profile with new picture URL
      const currentClient = getState().profile.client;
      dispatch(setClient({
        client: {
          ...currentClient,
          prof_id: {
            ...currentClient.prof_id,
            prof_picture: result.picture_url,
          },
        },
      }));

      return result;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to upload picture';
      dispatch(setProfileError(message));
      return rejectWithValue(message);
    }
  }
);

export default {
  updateProfileThunk,
  uploadProfilePictureThunk,
};
