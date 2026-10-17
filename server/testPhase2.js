require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

// Import app configuration and routes
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const aiRoutes = require('./routes/aiRoutes');
const connectDB = require('./config/db');

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('🧪 Starting Phase 2 Backend & Database API Tests');
  console.log('====================================================\n');

  // Initialize express app for testing on an ephemeral port
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/ai', aiRoutes);

  // Attempt DB connection
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api/plans';

  const userAToken = 'test-user-alice';
  const userBToken = 'test-user-bob';

  let createdPlanId = null;

  try {
    // ----------------------------------------------------
    // TEST 1: Pricing Quotation Endpoint
    // ----------------------------------------------------
    console.log('TEST 1: Testing POST /api/plans/quote...');
    const quoteRes = await fetch(`${baseUrl}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packagingType: 'Corrugated Box',
        dimensions: { length: 20, width: 15, height: 8 },
        quantity: 500,
        materialGrade: '5-Ply Corrugated Cardboard',
        requirements: { protectionLevel: 'Medium', customPrint: true },
      }),
    });
    const quoteJson = await quoteRes.json();
    if (quoteRes.status === 200 && quoteJson.data?.unitPrice && quoteJson.data?.totalPrice) {
      console.log(`✅ Quote calculated: ₹${quoteJson.data.unitPrice}/unit, Total: ₹${quoteJson.data.totalPrice}`);
    } else {
      throw new Error(`Failed to calculate quote: ${JSON.stringify(quoteJson)}`);
    }

    // ----------------------------------------------------
    // TEST 2: Create Plan (POST /api/plans) for User Alice
    // ----------------------------------------------------
    console.log('\nTEST 2: Testing POST /api/plans for User Alice...');
    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        productName: 'Eco Glass Tumbler',
        category: 'Fragile & Glassware',
        dimensions: { length: 15, width: 15, height: 25 },
        quantity: 600,
        packagingType: 'Corrugated Box',
        materialGrade: '5-Ply Corrugated Cardboard',
        requirements: {
          protectionLevel: 'High',
          ecoFriendly: true,
          customPrint: true,
        },
      }),
    });
    const createJson = await createRes.json();
    if (createRes.status === 201 && createJson.data?._id) {
      createdPlanId = createJson.data._id;
      console.log(`✅ Plan created successfully! ID: ${createdPlanId}`);
      console.log(`   User ID bound: ${createJson.data.userId}`);
      console.log(`   Total price: ₹${createJson.data.pricing?.totalPrice}`);
    } else {
      throw new Error(`Failed to create plan: ${JSON.stringify(createJson)}`);
    }

    // ----------------------------------------------------
    // TEST 3: Get Plans for User Alice (GET /api/plans)
    // ----------------------------------------------------
    console.log('\nTEST 3: Testing GET /api/plans for User Alice...');
    const alicePlansRes = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const alicePlansJson = await alicePlansRes.json();
    if (alicePlansRes.status === 200 && alicePlansJson.data?.length >= 1) {
      console.log(`✅ Alice has ${alicePlansJson.data.length} plan(s).`);
    } else {
      throw new Error(`Alice should have at least 1 plan: ${JSON.stringify(alicePlansJson)}`);
    }

    // ----------------------------------------------------
    // TEST 4: User Isolation Test — User Bob gets 0 plans
    // ----------------------------------------------------
    console.log('\nTEST 4: Testing User Isolation (GET /api/plans for User Bob)...');
    const bobPlansRes = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const bobPlansJson = await bobPlansRes.json();
    if (bobPlansRes.status === 200 && bobPlansJson.data?.length === 0) {
      console.log('✅ User Bob sees 0 plans. User isolation verified!');
    } else {
      throw new Error(`Bob should NOT see Alice's plans! Got: ${JSON.stringify(bobPlansJson)}`);
    }

    // ----------------------------------------------------
    // TEST 5: Get Plan by ID (GET /api/plans/:id)
    // ----------------------------------------------------
    console.log('\nTEST 5: Testing GET /api/plans/:id for User Alice...');
    const getByIdRes = await fetch(`${baseUrl}/${createdPlanId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const getByIdJson = await getByIdRes.json();
    if (getByIdRes.status === 200 && getByIdJson.data?._id === createdPlanId) {
      console.log(`✅ Fetched Alice's plan successfully: ${getByIdJson.data.productName}`);
    } else {
      throw new Error(`Failed to fetch plan by ID: ${JSON.stringify(getByIdJson)}`);
    }

    // ----------------------------------------------------
    // TEST 6: Bob cannot access Alice's plan by ID
    // ----------------------------------------------------
    console.log('\nTEST 6: Testing Bob accessing Alice\'s plan by ID (Security Check)...');
    const bobGetByIdRes = await fetch(`${baseUrl}/${createdPlanId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    if (bobGetByIdRes.status === 404) {
      console.log('✅ Correctly blocked Bob from accessing Alice\'s plan with 404!');
    } else {
      throw new Error(`Bob should get 404, got status ${bobGetByIdRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 7: Bob cannot update Alice's plan
    // ----------------------------------------------------
    console.log('\nTEST 7: Testing Bob updating Alice\'s plan (PUT /api/plans/:id Security Check)...');
    const bobUpdateRes = await fetch(`${baseUrl}/${createdPlanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ productName: 'Hacked Item' }),
    });
    if (bobUpdateRes.status === 404) {
      console.log('✅ Correctly blocked Bob from updating Alice\'s plan with 404!');
    } else {
      throw new Error(`Bob should get 404 on update, got status ${bobUpdateRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 8: Alice updates her plan (PUT /api/plans/:id)
    // ----------------------------------------------------
    console.log('\nTEST 8: Testing Alice updating her plan (PUT /api/plans/:id)...');
    const aliceUpdateRes = await fetch(`${baseUrl}/${createdPlanId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        productName: 'Eco Glass Tumbler (Updated Premium)',
        quantity: 1000,
      }),
    });
    const aliceUpdateJson = await aliceUpdateRes.json();
    if (aliceUpdateRes.status === 200 && aliceUpdateJson.data?.productName.includes('Updated')) {
      console.log(`✅ Plan updated successfully: ${aliceUpdateJson.data.productName}`);
      console.log(`   Updated quantity: ${aliceUpdateJson.data.quantity}`);
      console.log(`   Recalculated total price: ₹${aliceUpdateJson.data.pricing?.totalPrice}`);
    } else {
      throw new Error(`Failed to update plan: ${JSON.stringify(aliceUpdateJson)}`);
    }

    // ----------------------------------------------------
    // TEST 9: Bob cannot delete Alice's plan
    // ----------------------------------------------------
    console.log('\nTEST 9: Testing Bob deleting Alice\'s plan (DELETE /api/plans/:id Security Check)...');
    const bobDeleteRes = await fetch(`${baseUrl}/${createdPlanId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    if (bobDeleteRes.status === 404) {
      console.log('✅ Correctly blocked Bob from deleting Alice\'s plan with 404!');
    } else {
      throw new Error(`Bob should get 404 on delete, got status ${bobDeleteRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 10: Alice deletes her plan (DELETE /api/plans/:id)
    // ----------------------------------------------------
    console.log('\nTEST 10: Testing Alice deleting her plan (DELETE /api/plans/:id)...');
    const aliceDeleteRes = await fetch(`${baseUrl}/${createdPlanId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const aliceDeleteJson = await aliceDeleteRes.json();
    if (aliceDeleteRes.status === 200 && aliceDeleteJson.success) {
      console.log('✅ Plan deleted successfully!');
    } else {
      throw new Error(`Failed to delete plan: ${JSON.stringify(aliceDeleteJson)}`);
    }

    // ----------------------------------------------------
    // TEST 11: Alice verifies plan is gone
    // ----------------------------------------------------
    console.log('\nTEST 11: Verifying Alice has 0 plans after deletion...');
    const verifyRes = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const verifyJson = await verifyRes.json();
    if (verifyRes.status === 200 && verifyJson.data?.length === 0) {
      console.log('✅ Confirmed Alice now has 0 plans.');
    } else {
      throw new Error(`Expected 0 plans after delete, got: ${JSON.stringify(verifyJson)}`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY! (11/11)');
    console.log('====================================================');
  } finally {
    server.close();
    process.exit(0);
  }
}

runPhase2Tests().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
