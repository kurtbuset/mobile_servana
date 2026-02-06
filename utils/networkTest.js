import API_URL from '../config/api';

export const testNetworkConnection = async () => {
  console.log(`🔍 Testing connection to: ${API_URL}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Network connection successful');
      return { success: true, message: 'Connection successful' };
    } else {
      console.log('❌ Server responded with error:', response.status);
      return { success: false, message: `Server error: ${response.status}` };
    }
  } catch (error) {
    console.log('❌ Network connection failed:', error.message);
    
    if (error.name === 'AbortError') {
      return { success: false, message: 'Connection timeout - server not reachable' };
    }
    
    return { success: false, message: error.message };
  }
};

export default testNetworkConnection;