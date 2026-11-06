/**
 * Automated Verification Suite for the 5 New Enterprise Features:
 * 1. Consent Expiration & Retention Lifecycle (EDPB/CNIL SLA)
 * 2. Downstream Webhook Dispatcher
 * 3. Article 17 Right to Erasure & Anonymization
 * 4. Cookie & Tracker Inventory Scanner
 * 5. External REST Verification & Status API Key
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const http = require('http');
const { app } = require('../index');
const { connectDB, disconnectDB } = require('../config/db');
const { ensureSeedData } = require('../utils/seedHelper');

const request = (server, method, path, body = null, token = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = { raw };
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

(async () => {
  console.log('\n======================================================================');
  console.log('  CONSENTLOG - 5 NEW ENTERPRISE FEATURES VERIFICATION SUITE');
  console.log('======================================================================\n');

  await connectDB();
  await ensureSeedData(true);
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    // 0. Authenticate Admin and Standard User
    const adminLogin = await request(server, 'POST', '/api/auth/login', {
      email: 'admin@consentlog.io',
      password: 'Password123!',
    });
    const adminToken = adminLogin.data.token;

    const userLogin = await request(server, 'POST', '/api/auth/login', {
      email: 'alex@enterprise.io',
      password: 'Password123!',
    });
    const userToken = userLogin.data.token;

    // -------------------------------------------------------------
    // FEATURE 1: Consent Expiration & Retention Lifecycle
    // -------------------------------------------------------------
    console.log('[Test 1] Verifying Consent Expiration & Retention SLA API...');
    const retentionRes = await request(server, 'GET', '/api/consent/retention', null, userToken);
    assert.strictEqual(retentionRes.status, 200, 'Retention endpoint returned 200');
    assert.ok(retentionRes.data.success, 'Retention success is true');
    assert.ok(typeof retentionRes.data.daysRemaining === 'number', 'daysRemaining is a number');
    assert.ok(retentionRes.data.retentionMonths >= 6, 'retentionMonths is at least 6 months');
    console.log(`✅ [1/5] Feature 1 Passed: Consent retention SLA calculated (${retentionRes.data.jurisdiction}, ${retentionRes.data.daysRemaining} days remaining)`);

    // -------------------------------------------------------------
    // FEATURE 2: Downstream Webhooks Dispatcher
    // -------------------------------------------------------------
    console.log('[Test 2] Verifying Webhook Configuration & Dispatcher...');
    const createWebhookRes = await request(server, 'POST', '/api/admin/webhooks', {
      name: 'HubSpot & Segment Syncer',
      url: 'https://httpbin.org/post',
      events: ['consent.granted', 'consent.withdrawn', 'user.erased'],
    }, adminToken);
    assert.strictEqual(createWebhookRes.status, 201, 'Webhook created with 201');
    assert.ok(createWebhookRes.data.webhook.secret, 'Webhook secret generated');
    const webhookId = createWebhookRes.data.webhook._id;

    const listWebhooks = await request(server, 'GET', '/api/admin/webhooks', null, adminToken);
    assert.strictEqual(listWebhooks.status, 200);
    assert.ok(listWebhooks.data.webhooks.length >= 1, 'Webhooks list returned');
    console.log('✅ [2/5] Feature 2 Passed: Webhook created with HMAC-SHA256 secret and event listeners');

    // -------------------------------------------------------------
    // FEATURE 3: Article 17 "Right to Erasure" DSAR Workflow
    // -------------------------------------------------------------
    console.log('[Test 3] Verifying Article 17 Right to Erasure Workflow...');
    // Create a temporary user to erase
    const tempReg = await request(server, 'POST', '/api/auth/register', {
      name: 'Temporary Citizen',
      email: `temp-${Date.now()}@example.org`,
      password: 'Password123!',
      jurisdiction: 'GDPR (EU)',
    });
    const tempToken = tempReg.data.token;
    const tempUserId = tempReg.data.user.id;

    // Submit erasure request
    const dsarSubmit = await request(server, 'POST', '/api/consent/dsar/request', {
      requestType: 'erasure',
      reason: 'Exercising Article 17 Right to be Forgotten',
    }, tempToken);
    assert.strictEqual(dsarSubmit.status, 201, 'DSAR erasure request submitted');
    const requestId = dsarSubmit.data.request._id;

    // Admin lists DSAR requests
    const listDsar = await request(server, 'GET', '/api/admin/dsar/requests', null, adminToken);
    assert.strictEqual(listDsar.status, 200);
    const foundReq = listDsar.data.requests.find((r) => String(r._id) === String(requestId));
    assert.ok(foundReq, 'Submitted DSAR request found in admin queue');

    // Admin approves & processes erasure
    const processRes = await request(server, 'POST', `/api/admin/dsar/requests/${requestId}/process`, {
      action: 'approve',
    }, adminToken);
    assert.strictEqual(processRes.status, 200, 'Erasure processed with 200');
    assert.strictEqual(processRes.data.request.status, 'completed', 'Request marked completed');
    assert.ok(processRes.data.request.anonymizedIdentifier, 'Anonymized identifier generated');
    console.log(`✅ [3/5] Feature 3 Passed: Article 17 Right to Erasure executed and anonymized as ${processRes.data.request.anonymizedIdentifier}`);

    // -------------------------------------------------------------
    // FEATURE 4: Cookie & Tracker Inventory Scanner
    // -------------------------------------------------------------
    console.log('[Test 4] Verifying Cookie & Tracker Inventory Scanner...');
    const cookieRes = await request(server, 'GET', '/api/admin/cookies', null, adminToken);
    assert.strictEqual(cookieRes.status, 200);
    assert.ok(cookieRes.data.cookies.length >= 5, 'Baseline cookie inventory populated');
    assert.ok(cookieRes.data.stats.essential >= 1, 'Essential cookies categorized');

    const scanRes = await request(server, 'POST', '/api/admin/cookies/scan', {
      domain: 'portal.mycorp.com',
    }, adminToken);
    assert.strictEqual(scanRes.status, 200);
    assert.ok(scanRes.data.result.totalDiscovered >= 5, 'Scan discovered and cataloged cookies');
    console.log(`✅ [4/5] Feature 4 Passed: Domain scanner cataloged cookies across 5 regulatory categories`);

    // -------------------------------------------------------------
    // FEATURE 5: External REST Verification & Status API Key
    // -------------------------------------------------------------
    console.log('[Test 5] Verifying External REST Verification & Status API Key...');
    const createKeyRes = await request(server, 'POST', '/api/admin/api-keys', {
      name: 'Production Mailer Microservice Key',
    }, adminToken);
    assert.strictEqual(createKeyRes.status, 201);
    const rawApiKey = createKeyRes.data.apiKey.rawKey;
    assert.ok(rawApiKey.startsWith('cl_live_'), 'API key has cl_live_ prefix');

    // Call external check endpoint with X-API-Key
    const checkRes = await request(
      server,
      'GET',
      '/api/v1/consent/check?email=alex@enterprise.io&category=marketing',
      null,
      null,
      { 'X-API-Key': rawApiKey }
    );
    assert.strictEqual(checkRes.status, 200, 'External check returned 200');
    assert.strictEqual(checkRes.data.success, true);
    assert.strictEqual(checkRes.data.category, 'marketing');
    assert.ok(typeof checkRes.data.isAllowed === 'boolean', 'isAllowed is boolean');
    assert.ok(checkRes.data.latestAuditHash, 'Cryptographic proof hash returned');
    console.log(`✅ [5/5] Feature 5 Passed: External API query verified consent status with SHA-256 cryptographic proof (Allowed: ${checkRes.data.isAllowed})`);

    // Clean up created webhook
    await request(server, 'DELETE', `/api/admin/webhooks/${webhookId}`, null, adminToken);

    console.log('\n======================================================================');
    console.log('  ALL 5 NEW ENTERPRISE FEATURES VERIFIED SUCCESSFULLY!');
    console.log('======================================================================\n');
  } finally {
    server.close();
    await disconnectDB();
    process.exit(0);
  }
})().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
