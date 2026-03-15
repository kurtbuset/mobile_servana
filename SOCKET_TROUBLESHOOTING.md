# Mobile Socket Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. "websocket error" - Connection Failed

This error occurs when the mobile app cannot establish a websocket connection to the backend.

#### Solutions:

**A. Check Backend URL Configuration**

The app automatically detects your platform and uses the appropriate URL:

- **Android Emulator**: `http://10.0.2.2:5000` (special IP that maps to host machine)
- **iOS Simulator**: `http://192.168.67.240:5000` (your computer's local IP)
- **Real Device**: `http://192.168.67.240:5000` (your computer's local IP)

**To update your local IP:**

1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update both files:
   - `mobile_servana/config/socket.js` (line ~18)
   - `mobile_servana/config/api.js` (line ~15)

**B. Verify Backend is Running**

```bash
# Check if backend container is running
docker ps | grep backend

# Check backend logs
docker logs backend_servana --tail 50

# Restart backend if needed
docker restart backend_servana
```

**C. Test Backend Connectivity**

From your mobile device or emulator, test if you can reach the backend:

```bash
# For Android Emulator (from your computer)
curl http://10.0.2.2:5000/health

# For iOS Simulator or Real Device (from your computer)
curl http://192.168.67.240:5000/health

# Expected response:
# {"status":"OK","message":"Server is running","timestamp":"..."}
```

**D. Check Firewall Settings**

Ensure your firewall allows connections on port 5000:

- Windows: Windows Defender Firewall → Allow an app
- Mac: System Preferences → Security & Privacy → Firewall
- Linux: `sudo ufw allow 5000`

**E. Verify Same Network**

For real devices, ensure your phone and computer are on the same Wi-Fi network.

### 2. Transport Fallback

The socket configuration now uses both websocket and polling:

```javascript
transports: ["websocket", "polling"];
```

This means:

1. First tries websocket (faster, real-time)
2. Falls back to polling if websocket fails (slower but more reliable)

### 3. Connection Timeout

If connection takes too long:

- Increase timeout in `socket.js`: `timeout: 30000` (30 seconds)
- Check network speed
- Restart the app

### 4. Authentication Issues

If you see "User not authenticated":

1. Clear app data and login again
2. Check if token is stored: Look for "🔐 Creating socket with authentication token" in logs
3. Verify token is valid on backend

### 5. Debugging Steps

**Enable detailed logging:**

The socket configuration already includes detailed error logging:

```javascript
socketInstance.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
  console.error("❌ Error type:", error.type);
  console.error("❌ Error description:", error.description);
});
```

**Check logs in:**

- React Native: Metro bundler console
- Android: `adb logcat | grep -i socket`
- iOS: Xcode console

### 6. Platform-Specific Issues

**Android Emulator:**

- Must use `10.0.2.2` instead of `localhost` or `127.0.0.1`
- Ensure emulator has internet access

**iOS Simulator:**

- Can use `localhost` or your computer's IP
- Check iOS simulator network settings

**Real Device:**

- Must be on same Wi-Fi network as computer
- Cannot use `localhost` or `10.0.2.2`
- Use your computer's actual local IP address

## Quick Fix Checklist

- [ ] Backend is running (`docker ps`)
- [ ] Backend health endpoint responds (`curl http://YOUR_IP:5000/health`)
- [ ] Correct IP address in config files
- [ ] Mobile device on same network (for real devices)
- [ ] Firewall allows port 5000
- [ ] App has been restarted after config changes
- [ ] Token is valid (check logs for "🔐 Creating socket")

## Still Having Issues?

1. Check backend logs: `docker logs backend_servana -f`
2. Check mobile logs in Metro bundler
3. Try restarting both backend and mobile app
4. Verify CORS configuration in `backend_servana/config/cors.config.js`
5. Test with Postman or curl to isolate if it's a mobile-specific issue
