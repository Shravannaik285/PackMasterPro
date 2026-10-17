require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

// Import routes and middleware
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');

async function runPhase3AuthTests() {
  console.log('========================================================');
  console.log('🔒 Starting Phase 3: Firebase Admin Auth & Protected Routes');
  console.log('========================================================\n');

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/plans', planRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098';

  try {
    // ----------------------------------------------------
    // TEST 1: Missing Authorization Header on /api/auth/me
    // ----------------------------------------------------
    console.log('TEST 1: Requesting /api/auth/me without Authorization header (Expected: 401)...');
    const res1 = await fetch(`${baseUrl}/api/auth/me`);
    const json1 = await res1.json();
    if (res1.status === 401 && json1.success === false) {
      console.log('✅ Correctly returned 401 Unauthorized for missing header');
    } else {
      throw new Error(`Expected 401, got ${res1.status}`);
    }

    // ----------------------------------------------------
    // TEST 2: Malformed Authorization Header (Not Bearer)
    // ----------------------------------------------------
    console.log('\nTEST 2: Requesting with Basic Auth instead of Bearer (Expected: 401)...');
    const res2 = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Basic dXNlcjpwYXNz' },
    });
    const json2 = await res2.json();
    if (res2.status === 401 && json2.success === false) {
      console.log('✅ Correctly rejected malformed scheme with 401');
    } else {
      throw new Error(`Expected 401, got ${res2.status}`);
    }

    // ----------------------------------------------------
    // TEST 3: Invalid / Forged Bearer Token
    // ----------------------------------------------------
    console.log('\nTEST 3: Requesting with invalid/forged token (Expected: 401)...');
    const res3 = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer forged_fake_jwt_token_payload' },
    });
    const json3 = await res3.json();
    if (res3.status === 401 && json3.success === false) {
      console.log('✅ Correctly rejected invalid token with 401');
    } else {
      throw new Error(`Expected 401, got ${res3.status}`);
    }

    // ----------------------------------------------------
    // TEST 4: Valid Bearer Token (req.user population)
    // ----------------------------------------------------
    console.log('\nTEST 4: Requesting with valid Bearer token (Expected: 200 with req.user)...');
    const res4 = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer demo-token' },
    });
    const json4 = await res4.json();
    if (res4.status === 200 && json4.user?.uid === 'demo_user_123') {
      console.log(`✅ Authentication succeeded: User "${json4.user.name}" (${json4.user.email})`);
      console.log(`   Attached req.user.uid: ${json4.user.uid}`);
    } else {
      throw new Error(`Expected 200 with uid, got ${res4.status}: ${JSON.stringify(json4)}`);
    }

    // ----------------------------------------------------
    // TEST 5: Verify ALL Plan Endpoints are Protected
    // ----------------------------------------------------
    console.log('\nTEST 5: Verifying all Plan CRUD routes reject unauthenticated requests...');
    
    // 5a. POST /api/plans without token
    const postRes = await fetch(`${baseUrl}/api/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName: 'Unauthenticated Test' }),
    });
    if (postRes.status !== 401) throw new Error(`POST /api/plans did not return 401, got ${postRes.status}`);
    console.log('   ✅ POST /api/plans blocked (401)');

    // 5b. GET /api/plans without token
    const getRes = await fetch(`${baseUrl}/api/plans`);
    if (getRes.status !== 401) throw new Error(`GET /api/plans did not return 401, got ${getRes.status}`);
    console.log('   ✅ GET /api/plans blocked (401)');

    // 5c. GET /api/plans/:id without token
    const getIdRes = await fetch(`${baseUrl}/api/plans/sample-id-123`);
    if (getIdRes.status !== 401) throw new Error(`GET /api/plans/:id did not return 401, got ${getIdRes.status}`);
    console.log('   ✅ GET /api/plans/:id blocked (401)');

    // 5d. PUT /api/plans/:id without token
    const putRes = await fetch(`${baseUrl}/api/plans/sample-id-123`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName: 'Updated' }),
    });
    if (putRes.status !== 401) throw new Error(`PUT /api/plans/:id did not return 401, got ${putRes.status}`);
    console.log('   ✅ PUT /api/plans/:id blocked (401)');

    // 5e. DELETE /api/plans/:id without token
    const delRes = await fetch(`${baseUrl}/api/plans/sample-id-123`, {
      method: 'DELETE',
    });
    if (delRes.status !== 401) throw new Error(`DELETE /api/plans/:id did not return 401, got ${delRes.status}`);
    console.log('   ✅ DELETE /api/plans/:id blocked (401)');

    // ----------------------------------------------------
    // TEST 6: Never Trust Frontend-Provided userId
    // ----------------------------------------------------
    console.log('\nTEST 6: Spoofing userId in request body to test server isolation...');
    const spoofToken = 'test-user-verified';
    const spoofRes = await fetch(`${baseUrl}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${spoofToken}`,
      },
      body: JSON.stringify({
        userId: 'spoofed_target_victim_user_id', // Malicious client attempt
        productName: 'Security Validation Product',
        dimensions: { length: 20, width: 10, height: 5 },
        quantity: 100,
        packagingType: 'Corrugated Box',
      }),
    });
    const spoofJson = await spoofRes.json();
    if (spoofRes.status === 201 && spoofJson.data?.userId === spoofToken) {
      console.log(`✅ Server IGNORED spoofed body userId: "${spoofJson.data.userId}" matched token uid, NOT spoofed id!`);
    } else {
      throw new Error(`Server accepted spoofed userId! Response: ${JSON.stringify(spoofJson)}`);
    }

    console.log('\n========================================================');
    console.log('🎉 ALL PHASE 3 AUTHENTICATION TESTS PASSED! (6/6)');
    console.log('========================================================');
  } finally {
    server.close();
    process.exit(0);
  }
}

runPhase3AuthTests().catch((err) => {
  console.error('\n❌ Phase 3 Test Error:', err);
  process.exit(1);
});
