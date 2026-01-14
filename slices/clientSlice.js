import { createSlice } from "@reduxjs/toolkit";

const clientSlice = createSlice({
  name: "client",
  initialState: {
    data: null,
    token: null,
  },
  reducers: {
    setClient: (state, action) => {
      state.data = action.payload.client;
      state.token = action.payload.token;
    },
    clearClient: (state) => {
      state.data = null;
      state.token = null;
    },
  },
});

export const { setClient, clearClient } = clientSlice.actions;
export default clientSlice.reducer;
