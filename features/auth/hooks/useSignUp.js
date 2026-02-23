import { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../../shared/api';
import { setUiLoading as setGlobalLoading } from '../../../store/slices/ui';

/**
 * Custom hook for sign up functionality
 */
export const useSignUp = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendOTP = async (countryCode, phoneNumber) => {
    setLoading(true);
    setError(null);
    dispatch(setGlobalLoading(true));

    try {
      const { data } = await axios.post(`${API_URL}/clientAccount/auth/send-otp`, {
        phone_country_code: countryCode,
        phone_number: phoneNumber,
      });

      console.log('✅ OTP sent:', data.message);
      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Something went wrong. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const signUp = async (signUpData) => {
    setLoading(true);
    setError(null);
    dispatch(setGlobalLoading(true));

    try {
      const response = await axios.post(`${API_URL}/clientAccount/signup`, signUpData);
      console.log('✅ Sign up successful');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
        'Failed to create account. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      dispatch(setGlobalLoading(false));
    }
  };

  const clearError = () => setError(null);

  return {
    sendOTP,
    signUp,
    loading,
    error,
    clearError,
  };
};

export default useSignUp;
