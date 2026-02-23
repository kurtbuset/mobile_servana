import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  client: null,
  loading: false,
  error: null,
  updateSuccess: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setClient: (state, action) => {
      state.client = action.payload.client;
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
} = profileSlice.actions;

export default profileSlice.reducer;
