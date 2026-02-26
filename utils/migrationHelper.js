import SecureStorage from './secureStorage';

/**
 * Migration utility for SecureStorage operations
 * AsyncStorage has been completely removed for security
 */
class MigrationHelper {
  /**
   * Initialize secure storage for new installations
   */
  static async initializeSecureStorage() {
    try {
      console.log('🔄 Initializing secure storage...');
      
      // Check if already initialized
      const initialized = await SecureStorage.getItem('storage_initialized');
      if (initialized === 'true') {
        console.log('✅ Secure storage already initialized');
        return { success: true, alreadyInitialized: true };
      }

      // Mark as initialized
      await SecureStorage.setItem('storage_initialized', 'true');
      
      console.log('✅ Secure storage initialized successfully');
      
      return {
        success: true,
        alreadyInitialized: false
      };

    } catch (error) {
      console.error('❌ Failed to initialize secure storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify secure storage is working correctly
   */
  static async verifySecureStorage() {
    try {
      const testKey = 'storage_test';
      const testValue = 'test_value_' + Date.now();
      
      // Test write
      await SecureStorage.setItem(testKey, testValue);
      
      // Test read
      const retrievedValue = await SecureStorage.getItem(testKey);
      
      // Test delete
      await SecureStorage.removeItem(testKey);
      
      const isWorking = retrievedValue === testValue;
      
      // console.log(isWorking ? '✅ Secure storage verification passed' : '❌ Secure storage verification failed');
      
      return {
        success: isWorking,
        tested: true
      };
      
    } catch (error) {
      console.error('❌ Secure storage verification failed:', error);
      return {
        success: false,
        error: error.message,
        tested: false
      };
    }
  }

  /**
   * Clean up any test data or temporary storage
   */
  static async cleanupTestData() {
    try {
      const testKeys = ['storage_test', 'temp_data', 'migration_test'];
      
      for (const key of testKeys) {
        try {
          await SecureStorage.removeItem(key);
        } catch (error) {
          // Ignore errors for non-existent keys
          console.log(`Key ${key} not found, skipping cleanup`);
        }
      }
      
      console.log('✅ Test data cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ Failed to cleanup test data:', error);
      return false;
    }
  }

  /**
   * Reset storage initialization status (for testing purposes)
   */
  static async resetInitializationStatus() {
    try {
      await SecureStorage.removeItem('storage_initialized');
      console.log('✅ Storage initialization status reset');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset initialization status:', error);
      return false;
    }
  }

  /**
   * Get storage statistics and health check
   */
  static async getStorageHealth() {
    try {
      const health = {
        initialized: false,
        hasToken: false,
        hasProfile: false,
        lastCheck: new Date().toISOString()
      };

      // Check initialization
      const initialized = await SecureStorage.getItem('storage_initialized');
      health.initialized = initialized === 'true';

      // Check for token
      const token = await SecureStorage.getToken();
      health.hasToken = !!token;

      // Check for profile
      const profile = await SecureStorage.getProfile();
      health.hasProfile = !!profile;

      console.log('📊 Storage health check:', health);
      
      return {
        success: true,
        health
      };
      
    } catch (error) {
      console.error('❌ Storage health check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default MigrationHelper;