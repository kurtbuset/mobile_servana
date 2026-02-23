// API endpoint constants
export const AUTH_ENDPOINTS = {
  LOGIN: '/clientAccount/logincl',
  SIGNUP: '/clientAccount/signup',
  VERIFY_OTP: '/clientAccount/verify-otp',
  FORGOT_PASSWORD: '/clientAccount/forgot-password',
  RESET_PASSWORD: '/clientAccount/reset-password',
  CHANGE_PASSWORD: '/clientAccount/change-password',
  LOGOUT: '/clientAccount/logout',
};

export const PROFILE_ENDPOINTS = {
  GET_PROFILE: (id) => `/clientAccount/${id}`,
  UPDATE_PROFILE: (id) => `/clientAccount/${id}`,
  UPLOAD_PICTURE: (id) => `/clientAccount/${id}/picture`,
  DELETE_PICTURE: (id) => `/clientAccount/${id}/picture`,
};

export const MESSAGE_ENDPOINTS = {
  GET_MESSAGES: (groupId) => `/messages/group/${groupId}`,
  SEND_MESSAGE: '/messages/send',
  GET_CHAT_GROUP: (clientId) => `/messages/chat-group/${clientId}`,
  GET_LATEST_CHAT_GROUP: '/messages/latest',
  CREATE_CHAT_GROUP: '/messages/group/create',
  MARK_AS_READ: (messageId) => `/messages/${messageId}/read`,
};

export const DEPARTMENT_ENDPOINTS = {
  GET_ALL: '/departments',
  GET_ACTIVE: '/department/active',
  GET_BY_ID: (id) => `/departments/${id}`,
};

export default {
  AUTH_ENDPOINTS,
  PROFILE_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  DEPARTMENT_ENDPOINTS,
};
