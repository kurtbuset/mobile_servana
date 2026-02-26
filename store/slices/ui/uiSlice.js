import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal state
  activeModal: null,
  modalData: null,

  // Toast state
  toast: {
    visible: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 3000,
  },

  // Loading overlay
  globalLoading: false,
  loadingMessage: '',

  // Network status
  isOnline: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    showModal: (state, action) => {
      state.activeModal = action.payload.modal;
      state.modalData = action.payload.data || null;
    },
    hideModal: (state) => {
      state.activeModal = null;
      state.modalData = null;
    },

    // Toast actions
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3000,
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },

    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },

    // Network actions
    setNetworkStatus: (state, action) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
  showModal,
  hideModal,
  showToast,
  hideToast,
  setGlobalLoading,
  setNetworkStatus,
} = uiSlice.actions;

export default uiSlice.reducer;
