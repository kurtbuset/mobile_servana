import { createSlice } from "@reduxjs/toolkit";

const clientSlice = createSlice({
  name: "client",
  initialState: {
    data: null,
    // Token removed from Redux for security - use SecureStorage instead
    isAuthenticated: false,
  },
  reducers: {
    setClient: (state, action) => {
      state.data = action.payload.client;
      state.isAuthenticated = true;
      // Token no longer stored in Redux for security
    },
    clearClient: (state) => {
      state.data = null;
      state.isAuthenticated = false;
      // Token cleared from SecureStorage via logout utilities
    },
  },
});

export const { setClient, clearClient } = clientSlice.actions;
export default clientSlice.reducer;
