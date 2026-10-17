/**
 * Automated test script for authMiddleware
 */
async function runTests() {
  const baseUrl = 'http://localhost:5000/api/auth';

  console.log('--- Testing Backend Authentication Endpoints ---');

  // Test 1: Health check
  try {
    const res1 = await fetch(`${baseUrl}/health`);
    const data1 = await res1.json();
    console.log(`Test 1 (Health Check): Status ${res1.status} ->`, data1.message);
  } catch (err) {
    console.error('Test 1 failed to connect:', err.message);
    return;
  }

  // Test 2: Missing Authorization header (Expected: 401)
  try {
    const res2 = await fetch(`${baseUrl}/me`);
    const data2 = await res2.json();
    console.log(`Test 2 (Missing Token): Status ${res2.status} ->`, data2.message);
    if (res2.status === 401) {
      console.log('✅ Correctly rejected with 401');
    } else {
      console.error('❌ Expected 401, got', res2.status);
    }
  } catch (err) {
    console.error('Test 2 error:', err.message);
  }

  // Test 3: Invalid/Malformed Token (Expected: 401)
  try {
    const res3 = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: 'Bearer invalid_garbage_token_12345',
      },
    });
    const data3 = await res3.json();
    console.log(`Test 3 (Invalid Token): Status ${res3.status} ->`, data3.message);
    if (res3.status === 401) {
      console.log('✅ Correctly rejected invalid token with 401');
    } else {
      console.error('❌ Expected 401, got', res3.status);
    }
  } catch (err) {
    console.error('Test 3 error:', err.message);
  }

  // Test 4: Demo Token verification (Expected: 200 with user profile)
  try {
    const res4 = await fetch(`${baseUrl}/me`, {
      headers: {
        Authorization: 'Bearer demo-token',
      },
    });
    const data4 = await res4.json();
    console.log(`Test 4 (Demo Token): Status ${res4.status} -> User:`, data4.user?.name, `(${data4.user?.email})`);
    if (res4.status === 200 && data4.user?.uid) {
      console.log('✅ Successfully authenticated and attached req.user');
    } else {
      console.error('❌ Expected 200, got', res4.status);
    }
  } catch (err) {
    console.error('Test 4 error:', err.message);
  }

  console.log('--- Auth Middleware Tests Completed ---');
}

runTests();
