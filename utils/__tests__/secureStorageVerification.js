/**
 * SecureStorage Verification Script for New 30-Day Tokens
 *
 * This script verifies that SecureStorage correctly handles:
 * 1. Storing new 30-day JWT tokens
 * 2. Retrieving tokens
 * 3. Token persistence across app restarts (simulated)
 * 4. Token removal
 * 5. Profile storage alongside tokens
 *
 * Run this manually in the app to verify SecureStorage functionality
 */

import SecureStorage from "../secureStorage";
import TokenValidation from "../tokenValidation";

/**
 * Base64url encode helper
 * Converts object to base64url encoded string
 */
function base64UrlEncode(obj) {
  const str = JSON.stringify(obj);
  // Use btoa for base64 encoding (available in React Native)
  const base64 = btoa(str);
  // Convert to base64url format
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate a test JWT token with 30-day expiry
 * Creates a mock JWT token for testing purposes
 * Format: header.payload.signature (base64url encoded)
 */
function generateTestToken(clientId, expiryDays = 30) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiryDays * 24 * 60 * 60;

  const payload = {
    client_id: clientId,
    client_number: "9123456789",
    type: "client",
    iat: now,
    exp: exp,
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const signature = "mock-signature-for-testing";

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Generate an expired test token
 */
function generateExpiredToken(clientId) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    client_id: clientId,
    client_number: "9123456789",
    type: "client",
    iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const signature = "mock-signature-for-testing";

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Test 1: Store and retrieve a new 30-day token
 */
async function test1_StoreAndRetrieveToken() {
  console.log("\n📝 Test 1: Store and retrieve 30-day token");

  try {
    // Generate a 30-day token
    const testToken = generateTestToken(123, 30);
    console.log("✅ Generated test token");

    // Store token
    await SecureStorage.setToken(testToken);
    console.log("✅ Token stored successfully");

    // Retrieve token
    const retrievedToken = await SecureStorage.getToken();
    console.log("✅ Token retrieved successfully");

    // Verify tokens match
    if (retrievedToken === testToken) {
      console.log("✅ Retrieved token matches stored token");
      return { success: true, message: "Token storage and retrieval works" };
    } else {
      console.error("❌ Retrieved token does not match stored token");
      return { success: false, message: "Token mismatch" };
    }
  } catch (error) {
    console.error("❌ Test 1 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 2: Verify token expiration validation
 */
async function test2_TokenExpirationValidation() {
  console.log("\n📝 Test 2: Token expiration validation");

  try {
    // Test with valid 30-day token
    const validToken = generateTestToken(123, 30);
    await SecureStorage.setToken(validToken);

    const isValid = await TokenValidation.isTokenValid();
    if (!isValid) {
      console.error("❌ Valid 30-day token marked as invalid");
      return { success: false, message: "Valid token validation failed" };
    }
    console.log("✅ Valid 30-day token correctly validated");

    // Test with expired token
    const expiredToken = generateExpiredToken(123);
    await SecureStorage.setToken(expiredToken);

    const isExpired = await TokenValidation.isTokenValid();
    if (isExpired) {
      console.error("❌ Expired token marked as valid");
      return { success: false, message: "Expired token validation failed" };
    }
    console.log("✅ Expired token correctly identified");

    return { success: true, message: "Token expiration validation works" };
  } catch (error) {
    console.error("❌ Test 2 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 3: Token removal and cleanup
 */
async function test3_TokenRemoval() {
  console.log("\n📝 Test 3: Token removal and cleanup");

  try {
    // Store a token
    const testToken = generateTestToken(123, 30);
    await SecureStorage.setToken(testToken);
    console.log("✅ Token stored");

    // Verify token exists
    const tokenExists = await TokenValidation.tokenExists();
    if (!tokenExists) {
      console.error("❌ Token not found after storage");
      return { success: false, message: "Token storage failed" };
    }
    console.log("✅ Token exists confirmed");

    // Remove token
    await SecureStorage.removeToken();
    console.log("✅ Token removed");

    // Verify token is gone
    const tokenStillExists = await TokenValidation.tokenExists();
    if (tokenStillExists) {
      console.error("❌ Token still exists after removal");
      return { success: false, message: "Token removal failed" };
    }
    console.log("✅ Token successfully removed");

    return { success: true, message: "Token removal works" };
  } catch (error) {
    console.error("❌ Test 3 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 4: Profile storage alongside token
 */
async function test4_ProfileStorage() {
  console.log("\n📝 Test 4: Profile storage alongside token");

  try {
    // Store token
    const testToken = generateTestToken(123, 30);
    await SecureStorage.setToken(testToken);
    console.log("✅ Token stored");

    // Store profile
    const testProfile = {
      client_id: 123,
      client_country_code: "+63",
      client_number: "9123456789",
      prof_id: 456,
      prof_firstname: "Juan",
      prof_lastname: "Dela Cruz",
    };

    await SecureStorage.setProfile(testProfile);
    console.log("✅ Profile stored");

    // Retrieve profile
    const retrievedProfile = await SecureStorage.getProfile();
    console.log("✅ Profile retrieved");

    // Verify profile data
    if (
      retrievedProfile.client_id === testProfile.client_id &&
      retrievedProfile.prof_firstname === testProfile.prof_firstname &&
      retrievedProfile.prof_lastname === testProfile.prof_lastname
    ) {
      console.log("✅ Profile data matches");
      return { success: true, message: "Profile storage works" };
    } else {
      console.error("❌ Profile data mismatch");
      return { success: false, message: "Profile data mismatch" };
    }
  } catch (error) {
    console.error("❌ Test 4 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 5: Token expiration date retrieval
 */
async function test5_TokenExpirationDate() {
  console.log("\n📝 Test 5: Token expiration date retrieval");

  try {
    // Store a 30-day token
    const testToken = generateTestToken(123, 30);
    await SecureStorage.setToken(testToken);
    console.log("✅ Token stored");

    // Get expiration date
    const expirationDate = await TokenValidation.getTokenExpiration();

    if (!expirationDate) {
      console.error("❌ Failed to get expiration date");
      return { success: false, message: "Expiration date retrieval failed" };
    }

    console.log("✅ Expiration date retrieved:", expirationDate);

    // Verify expiration is approximately 30 days from now
    const now = new Date();
    const daysUntilExpiry = (expirationDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilExpiry >= 29 && daysUntilExpiry <= 31) {
      console.log(
        `✅ Token expires in ~${Math.round(daysUntilExpiry)} days (expected ~30 days)`,
      );
      return { success: true, message: "Token expiration date is correct" };
    } else {
      console.error(
        `❌ Token expires in ${daysUntilExpiry} days (expected ~30 days)`,
      );
      return { success: false, message: "Incorrect expiration date" };
    }
  } catch (error) {
    console.error("❌ Test 5 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 6: Remove expired token
 */
async function test6_RemoveExpiredToken() {
  console.log("\n📝 Test 6: Remove expired token");

  try {
    // Store an expired token
    const expiredToken = generateExpiredToken(123);
    await SecureStorage.setToken(expiredToken);
    console.log("✅ Expired token stored");

    // Remove expired token
    const wasRemoved = await TokenValidation.removeExpiredToken();

    if (!wasRemoved) {
      console.error("❌ Expired token was not removed");
      return { success: false, message: "Expired token removal failed" };
    }
    console.log("✅ Expired token removed");

    // Verify token is gone
    const tokenExists = await TokenValidation.tokenExists();
    if (tokenExists) {
      console.error("❌ Token still exists after removal");
      return { success: false, message: "Token still exists" };
    }
    console.log("✅ Token successfully removed");

    return { success: true, message: "Expired token removal works" };
  } catch (error) {
    console.error("❌ Test 6 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 7: Client ID extraction from token
 */
async function test7_ClientIdExtraction() {
  console.log("\n📝 Test 7: Client ID extraction from token");

  try {
    const testClientId = 12345;
    const testToken = generateTestToken(testClientId, 30);
    await SecureStorage.setToken(testToken);
    console.log("✅ Token stored");

    // Extract client ID
    const clientId = await TokenValidation.getClientId();

    if (clientId === testClientId) {
      console.log(`✅ Client ID correctly extracted: ${clientId}`);
      return { success: true, message: "Client ID extraction works" };
    } else {
      console.error(
        `❌ Client ID mismatch: expected ${testClientId}, got ${clientId}`,
      );
      return { success: false, message: "Client ID extraction failed" };
    }
  } catch (error) {
    console.error("❌ Test 7 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 8: Get validated token (new method)
 */
async function test8_GetValidatedToken() {
  console.log("\n📝 Test 8: Get validated token (new method)");

  try {
    // Test with valid token
    const validToken = generateTestToken(123, 30);
    await SecureStorage.setToken(validToken);
    console.log("✅ Valid token stored");

    const retrievedValidToken = await SecureStorage.getValidatedToken();
    if (!retrievedValidToken) {
      console.error("❌ Valid token not retrieved");
      return { success: false, message: "Valid token retrieval failed" };
    }
    console.log("✅ Valid token retrieved via getValidatedToken()");

    // Test with expired token
    const expiredToken = generateExpiredToken(123);
    await SecureStorage.setToken(expiredToken);
    console.log("✅ Expired token stored");

    const retrievedExpiredToken = await SecureStorage.getValidatedToken();
    if (retrievedExpiredToken !== null) {
      console.error("❌ Expired token was returned (should be null)");
      return { success: false, message: "Expired token not filtered" };
    }
    console.log("✅ Expired token correctly filtered (returned null)");

    // Verify expired token was removed from storage
    const tokenAfterValidation = await SecureStorage.getToken();
    if (tokenAfterValidation !== null) {
      console.error("❌ Expired token not removed from storage");
      return { success: false, message: "Expired token not cleaned up" };
    }
    console.log("✅ Expired token automatically removed from storage");

    return { success: true, message: "Get validated token works correctly" };
  } catch (error) {
    console.error("❌ Test 8 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Test 9: Token retrieval with empty/invalid values
 */
async function test9_TokenRetrievalEdgeCases() {
  console.log("\n📝 Test 9: Token retrieval edge cases");

  try {
    // Test with empty string
    await SecureStorage.setItem("token", "");
    const emptyToken = await SecureStorage.getToken();
    if (emptyToken !== null) {
      console.error("❌ Empty string token should return null");
      return { success: false, message: "Empty string not handled" };
    }
    console.log("✅ Empty string token returns null");

    // Test with whitespace
    await SecureStorage.setItem("token", "   ");
    const whitespaceToken = await SecureStorage.getToken();
    if (whitespaceToken !== null) {
      console.error("❌ Whitespace token should return null");
      return { success: false, message: "Whitespace not handled" };
    }
    console.log("✅ Whitespace token returns null");

    // Test with no token
    await SecureStorage.removeToken();
    const noToken = await SecureStorage.getToken();
    if (noToken !== null) {
      console.error("❌ Missing token should return null");
      return { success: false, message: "Missing token not handled" };
    }
    console.log("✅ Missing token returns null");

    return { success: true, message: "Edge cases handled correctly" };
  } catch (error) {
    console.error("❌ Test 9 failed:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Run all verification tests
 */
export async function runAllVerificationTests() {
  console.log(
    "🚀 Starting SecureStorage Verification Tests for New 30-Day Tokens\n",
  );
  console.log("=".repeat(60));

  const results = [];

  // Run all tests
  results.push(await test1_StoreAndRetrieveToken());
  results.push(await test2_TokenExpirationValidation());
  results.push(await test3_TokenRemoval());
  results.push(await test4_ProfileStorage());
  results.push(await test5_TokenExpirationDate());
  results.push(await test6_RemoveExpiredToken());
  results.push(await test7_ClientIdExtraction());
  results.push(await test8_GetValidatedToken());
  results.push(await test9_TokenRetrievalEdgeCases());

  // Clean up after tests
  try {
    await SecureStorage.removeToken();
    await SecureStorage.removeProfile();
    console.log("\n🧹 Cleanup completed");
  } catch (error) {
    console.error("⚠️ Cleanup failed:", error);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Results Summary\n");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result, index) => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`Test ${index + 1}: ${status} - ${result.message}`);
  });

  console.log("\n" + "=".repeat(60));
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log("=".repeat(60));

  if (failed === 0) {
    console.log(
      "\n🎉 All tests passed! SecureStorage works correctly with new 30-day tokens.",
    );
    return { success: true, passed, failed, total: results.length };
  } else {
    console.log("\n⚠️ Some tests failed. Please review the errors above.");
    return { success: false, passed, failed, total: results.length };
  }
}

// Export individual tests for manual testing
export {
  test1_StoreAndRetrieveToken,
  test2_TokenExpirationValidation,
  test3_TokenRemoval,
  test4_ProfileStorage,
  test5_TokenExpirationDate,
  test6_RemoveExpiredToken,
  test7_ClientIdExtraction,
  test8_GetValidatedToken,
  test9_TokenRetrievalEdgeCases,
};
