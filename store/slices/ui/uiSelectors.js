/**
 * UI state selectors
 */

export const selectActiveModal = (state) => state.ui.activeModal;

export const selectModalData = (state) => state.ui.modalData;

export const selectToast = (state) => state.ui.toast;

export const selectToastVisible = (state) => state.ui.toast.visible;

export const selectGlobalLoading = (state) => state.ui.globalLoading;

export const selectLoadingMessage = (state) => state.ui.loadingMessage;

export const selectIsOnline = (state) => state.ui.isOnline;

export default {
  selectActiveModal,
  selectModalData,
  selectToast,
  selectToastVisible,
  selectGlobalLoading,
  selectLoadingMessage,
  selectIsOnline,
};
