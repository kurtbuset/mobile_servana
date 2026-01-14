import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import clientReducer from "./slices/clientSlice"; // ← import client slice

export const store = configureStore({
  reducer: {
    user: userReducer,
    client: clientReducer, // ← add client slice here
  },
});
