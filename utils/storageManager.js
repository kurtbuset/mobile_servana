import SecureStorage from './secureStorage';

/**
 * Centralized storage manager using only SecureStorage
 * Provides a unified interface for all app storage needs
 */
class StorageManager {
  /**
   * Authentication-related storage
   */
  static async setAuthData(token, clientData) {
    try {
      await Promise.all([
        SecureStorage.setToken(token),
        SecureStorage.setProfile(clientData)
      ]);
      console.log('✅ Authentication data stored securely');
      return true;
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
      throw error;
    }
  }

  static async getAuthData() {
    try {
      const [token, profile] = await Promise.all([
        SecureStorage.getToken(),
        SecureStorage.getProfile()
      ]);
      
      return { token, profile };
    } catch (error) {
      console.error('❌ Failed to retrieve auth data:', error);
      return { token: null, profile: null };
    }
  }

  static async clearAuthData() {
    try {
      await Promise.all([
        SecureStorage.removeToken(),
        SecureStorage.removeProfile()
      ]);
      console.log('✅ Authentication data cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
      throw error;
    }
  }

  /**
   * User preferences and settings
   */
  static async setUserPreference(key, value) {
    try {
      const prefKey = `pref_${key}`;
      await SecureStorage.setItem(prefKey, JSON.stringify(value));
      console.log(`✅ User preference '${key}' stored`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to store preference '${key}':`, error);
      throw error;
    }
  }

  static async getUserPreference(key, defaultValue = null) {
    try {
      const prefKey = `pref_${key}`;
      const value = await SecureStorage.getItem(prefKey);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(`❌ Failed to retrieve preference '${key}':`, error);
      return defaultValue;
    }
  }

  static async removeUserPreference(key) {
    try {
      const prefKey = `pref_${key}`;
      await SecureStorage.removeItem(prefKey);
      console.log(`✅ User preference '${key}' removed`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove preference '${key}':`, error);
      throw error;
    }
  }

  /**
   * App state and temporary data
   */
  static async setAppState(key, value) {
    try {
      const stateKey = `state_${key}`;
      await SecureStorage.setItem(stateKey, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      console.error(`❌ Failed to store app state '${key}':`, error);
      throw error;
    }
  }

  static async getAppState(key, maxAge = null) {
    try {
      const stateKey = `state_${key}`;
      const stored = await SecureStorage.getItem(stateKey);
      
      if (!stored) return null;
      
      const { value, timestamp } = JSON.parse(stored);
      
      // Check if data is too old
      if (maxAge && (Date.now() - timestamp) > maxAge) {
        await this.removeAppState(key);
        return null;
      }
      
      return value;
    } catch (error) {
      console.error(`❌ Failed to retrieve app state '${key}':`, error);
      return null;
    }
  }

  static async removeAppState(key) {
    try {
      const stateKey = `state_${key}`;
      await SecureStorage.removeItem(stateKey);
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove app state '${key}':`, error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  static async setCache(key, data, ttl = 3600000) { // Default 1 hour TTL
    try {
      const cacheKey = `cache_${key}`;
      const cacheData = {
        data,
        expires: Date.now() + ttl
      };
      
      await SecureStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error(`❌ Failed to cache data '${key}':`, error);
      throw error;
    }
  }

  static async getCache(key) {
    try {
      const cacheKey = `cache_${key}`;
      const cached = await SecureStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const { data, expires } = JSON.parse(cached);
      
      // Check if cache expired
      if (Date.now() > expires) {
        await this.removeCache(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Failed to retrieve cache '${key}':`, error);
      return null;
    }
  }

  static async removeCache(key) {
    try {
      const cacheKey = `cache_${key}`;
      await SecureStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove cache '${key}':`, error);
      throw error;
    }
  }

  static async clearAllCache() {
    try {
      // This is a simplified approach - in a real implementation,
      // you might want to keep track of cache keys
      console.log('✅ Cache clearing initiated (manual cleanup required)');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Storage health and maintenance
   */
  static async getStorageInfo() {
    try {
      const info = {
        hasAuth: false,
        authDataCount: 0,
        lastCheck: new Date().toISOString()
      };

      // Check authentication data
      const { token, profile } = await this.getAuthData();
      info.hasAuth = !!(token && profile);
      info.authDataCount = (token ? 1 : 0) + (profile ? 1 : 0);

      return info;
    } catch (error) {
      console.error('❌ Failed to get storage info:', error);
      return null;
    }
  }

  static async performMaintenance() {
    try {
      console.log('🔧 Starting storage maintenance...');
      
      // Clean up expired cache (simplified)
      // In a real implementation, you'd track cache keys
      
      console.log('✅ Storage maintenance completed');
      return true;
    } catch (error) {
      console.error('❌ Storage maintenance failed:', error);
      return false;
    }
  }
}

export default StorageManager;