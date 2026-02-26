import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  client: null,
  loading: false,
  error: null,
  updateSuccess: false,
  requiresProfileSetup: false, // Flag to indicate if user needs profile setup
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setClient: (state, action) => {
      state.client = action.payload.client;
      // Optionally set requiresProfileSetup flag if provided
      if (action.payload.requiresProfileSetup !== undefined) {
        state.requiresProfileSetup = action.payload.requiresProfileSetup;
      }
    },
    setProfileLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProfileError: (state, action) => {
      state.error = action.payload;
    },
    setUpdateSuccess: (state, action) => {
      state.updateSuccess = action.payload;
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.client?.prof_id) {
        state.client.prof_id[field] = value;
      }
    },
    clearProfile: (state) => {
      state.client = null;
      state.error = null;
      state.updateSuccess = false;
      state.requiresProfileSetup = false;
    },
    setRequiresProfileSetup: (state, action) => {
      state.requiresProfileSetup = action.payload;
    },
  },
});

export const {
  setClient,
  setProfileLoading,
  setProfileError,
  setUpdateSuccess,
  updateProfileField,
  clearProfile,
  setRequiresProfileSetup,
} = profileSlice.actions;

export default profileSlice.reducer;
