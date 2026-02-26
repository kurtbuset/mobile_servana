// API endpoint constants

// OTP Authentication Endpoints
export const OTP_ENDPOINTS = {
  REQUEST_OTP: '/otp/request-otp',
  VERIFY_OTP: '/otp/verify-otp',
};

// Client Account Endpoints
export const AUTH_ENDPOINTS = {
  VALIDATE_TOKEN: '/clientAccount/auth/validate',
  COMPLETE_PROFILE: '/clientAccount/profile/complete',
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
  OTP_ENDPOINTS,
  AUTH_ENDPOINTS,
  PROFILE_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  DEPARTMENT_ENDPOINTS,
};
