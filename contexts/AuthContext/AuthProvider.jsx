import React, { createContext, useState, useCallback, useEffect } from "react";
import SecureStorage from "../../utils/secureStorage";
import { isTokenExpired } from "../../utils/tokenValidation";
import { setClient, clearProfile } from "../../store/slices/profile";
import logger from "../../utils/logger";

export const AuthContext = createContext(null);

// Auth helpers — keep storage and Redux in sync
const saveAuthData = async (token, clientData, requiresProfileSetup = false) => {
  await SecureStorage.setToken(token);
  await SecureStorage.setProfile(clientData);
  const { store } = await import("../../store");
  store.dispatch(setClient({ client: clientData, requiresProfileSetup }));
};

const clearAuthData = async () => {
  await SecureStorage.removeToken();
  await SecureStorage.removeProfile();
  const { store } = await import("../../store");
  store.dispatch(clearProfile());
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = await SecureStorage.getToken();
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      if (isTokenExpired(token)) {
        await clearAuthData();
        setIsAuthenticated(false);
        return;
      }

      try {
        const { authAPI } = await import("../../shared/api");
        const validationResponse = await authAPI.validateToken();
        await saveAuthData(token, validationResponse.client);
        setIsAuthenticated(true);
      } catch (backendError) {
        const status = backendError.response?.status;
        if (status === 404 || status === 403) {
          await clearAuthData();
          setIsAuthenticated(false);
        } else {
          // Network error — allow offline access with cached profile
          const profile = await SecureStorage.getProfile();
          if (profile) {
            setIsAuthenticated(true);
          } else {
            await clearAuthData();
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      logger.error("Auth check error:", error);
      try { await clearAuthData(); } catch (_) {}
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (clientData, token, requiresProfileSetup = false) => {
    await saveAuthData(token, clientData, requiresProfileSetup);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await clearAuthData();
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const currentClient = await SecureStorage.getProfile();
    const updatedClient = profileData.prof_id !== undefined
      ? { ...currentClient, prof_id: profileData }
      : { ...currentClient, prof_id: { ...currentClient?.prof_id, ...profileData } };

    await SecureStorage.setProfile(updatedClient);
    const { store } = await import("../../store");
    store.dispatch(setClient({ client: updatedClient }));
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, updateProfile, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
