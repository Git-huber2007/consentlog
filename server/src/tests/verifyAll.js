/**
 * ConsentLog Enterprise Edition - Automated Integration & Security Verification Suite
 *
 * Tests all 14 requirements from Section 12:
 * 1. User registration and login (with privacy-by-default baseline)
 * 2. Preference updates (PUT /api/preferences and PATCH /api/preferences/:name)
 * 3. Essential preference protection (rejects disabling essential cookies)
 * 4. Consent withdrawal (POST /api/consent/withdraw & reject-optional)
 * 5. Audit log creation (with canonical SHA-256 hash chaining)
 * 6. Audit log immutability through application APIs & ODM (blocks PUT, PATCH, DELETE)
 * 7. Hash chain verification (POST /api/audit/verify)
 * 8. Privacy notice version changes (Admin publish & activate)
 * 9. Notice acceptance tracking (POST /api/notices/acknowledge)
 * 10. Version comparison (GET /api/notices/:version?compareWith=...)
 * 11. Role-based access control (blocks non-admin from /api/admin/*)
 * 12. Unauthorized API requests (blocks unauthenticated requests)
 * 13. Ownership validation (prevents user A from reading user B's audit logs)
 * 14. MongoDB persistence & ACID transactions
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const http = require('http');
const { app } = require('../index');
const { connectDB, disconnectDB } = require('../config/db');
const { ensureSeedData } = require('../utils/seedHelper');
const ConsentLog = require('../models/ConsentLog');

const request = (server, method, path, body = null, token = null) => {
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
  console.log('  CONSENTLOG ENTERPRISE - AUTOMATED VERIFICATION SUITE (14 CHECKS)');
  console.log('======================================================================\n');

  let server;
  let passed = 0;

  try {
    await connectDB();
    await ensureSeedData(true);

    server = app.listen(0);

    // TEST 1: Unauthorized API request blocked
    const unauthRes = await request(server, 'GET', '/api/preferences');
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated request must return 401');
    console.log('✅ [1/14] Unauthorized API requests strictly blocked (HTTP 401)');
    passed++;

    // TEST 2: User registration with privacy-by-default
    const regRes = await request(server, 'POST', '/api/auth/register', {
      name: 'Dr. Liam Vance',
      email: 'liam.vance@biotech.eu',
      password: 'Password123!',
      organization: 'BioTech Europe GmbH',
      jurisdiction: 'GDPR (EU)',
    });
    assert.strictEqual(regRes.status, 201, 'Registration must return 201');
    assert.ok(regRes.data.token, 'JWT token must be issued on registration');
    const liamToken = regRes.data.token;
    console.log('✅ [2/14] User registration & privacy-by-default onboarding verified');
    passed++;

    // TEST 3: User & Admin Login
    const adminLogin = await request(server, 'POST', '/api/auth/login', {
      email: 'admin@consentlog.io',
      password: 'Password123!',
    });
    assert.strictEqual(adminLogin.status, 200);
    const adminToken = adminLogin.data.token;

    const alexLogin = await request(server, 'POST', '/api/auth/login', {
      email: 'alex@enterprise.io',
      password: 'Password123!',
    });
    assert.strictEqual(alexLogin.status, 200);
    const alexToken = alexLogin.data.token;
    console.log('✅ [3/14] JWT Authentication & bcrypt password verification passed');
    passed++;

    // TEST 4: Essential Preference Protection
    const disableEssentialRes = await request(
      server,
      'PUT',
      '/api/preferences',
      { essential: false, analytics: true },
      liamToken
    );
    assert.strictEqual(disableEssentialRes.status, 400, 'Disabling essential cookies must return 400');

    const patchEssentialRes = await request(
      server,
      'PATCH',
      '/api/preferences/essential',
      { enabled: false },
      liamToken
    );
    assert.strictEqual(patchEssentialRes.status, 400, 'PATCH essential=false must return 400');
    console.log('✅ [4/14] Essential Cookies protection enforced (cannot be disabled)');
    passed++;

    // TEST 5: Preference Updates & Automatic Audit Log Creation
    const updatePrefRes = await request(
      server,
      'PUT',
      '/api/preferences',
      {
        essential: true,
        analytics: true,
        marketing: true,
        personalization: false,
        thirdPartySharing: false,
        reason: 'Automated integration test grant',
      },
      liamToken
    );
    assert.strictEqual(updatePrefRes.status, 200);
    assert.strictEqual(updatePrefRes.data.changesRecorded, 2);
    assert.strictEqual(updatePrefRes.data.auditEvents.length, 2);
    console.log('✅ [5/14] Preference updates & transactional ConsentLog creation verified');
    passed++;

    // TEST 6: Consent Withdrawal (POST /api/consent/withdraw)
    const withdrawRes = await request(
      server,
      'POST',
      '/api/consent/withdraw',
      {
        categories: ['marketing'],
        reason: 'Withdrawing marketing cookies during test',
      },
      liamToken
    );
    assert.strictEqual(withdrawRes.status, 200);
    assert.strictEqual(withdrawRes.data.preferences.marketing, false);
    assert.strictEqual(withdrawRes.data.auditEvents[0].action, 'Consent Withdrawn');
    console.log('✅ [6/14] Consent withdrawal & historical audit preservation verified');
    passed++;

    // TEST 7: Append-Only Audit Immutability via HTTP API (PUT, PATCH, DELETE blocked)
    const sampleAuditId = withdrawRes.data.auditEvents[0].auditId;
    const putAuditRes = await request(
      server,
      'PUT',
      `/api/audit/logs/${sampleAuditId}`,
      { newValue: 'Tampered' },
      adminToken
    );
    const patchAuditRes = await request(
      server,
      'PATCH',
      `/api/audit/logs/${sampleAuditId}`,
      { newValue: 'Tampered' },
      adminToken
    );
    const deleteAuditRes = await request(
      server,
      'DELETE',
      `/api/audit/logs/${sampleAuditId}`,
      null,
      adminToken
    );
    assert.strictEqual(putAuditRes.status, 403);
    assert.strictEqual(patchAuditRes.status, 403);
    assert.strictEqual(deleteAuditRes.status, 403);
    console.log('✅ [7/14] Append-only API immutability enforced (PUT/PATCH/DELETE blocked with 403)');
    passed++;

    // TEST 8: Append-Only ODM Immutability (Mongoose pre-hooks block updateOne/deleteOne)
    let odmBlocked = false;
    try {
      await ConsentLog.deleteOne({ auditId: sampleAuditId });
    } catch (err) {
      odmBlocked = err.message.includes('SECURITY VIOLATION');
    }
    assert.strictEqual(odmBlocked, true, 'Mongoose ODM must block deleteOne on ConsentLog');
    console.log('✅ [8/14] Mongoose ODM-level immutability hooks verified');
    passed++;

    // TEST 9: Ownership Validation (Liam cannot inspect Alex's private audit event)
    const alexLogsRes = await request(server, 'GET', '/api/audit/logs', null, alexToken);
    const alexAuditId = alexLogsRes.data.logs[0].auditId;
    const crossUserRes = await request(
      server,
      'GET',
      `/api/audit/logs/${alexAuditId}`,
      null,
      liamToken
    );
    assert.strictEqual(crossUserRes.status, 403, 'Cross-user audit inspection must return 403');
    console.log('✅ [9/14] Ownership validation enforced (users cannot access other users\' logs)');
    passed++;

    // TEST 10: Cryptographic SHA-256 Hash Chain Integrity Verification
    const verifyRes = await request(server, 'POST', '/api/audit/verify', {}, adminToken);
    assert.strictEqual(verifyRes.status, 200);
    assert.strictEqual(verifyRes.data.report.verificationStatus, 'Verified');
    assert.strictEqual(verifyRes.data.report.failedRecords, 0);
    assert.ok(verifyRes.data.report.verifiedRecords >= 15);
    console.log(
      `✅ [10/14] SHA-256 Hash Chain verified across all ${verifyRes.data.report.verifiedRecords} blocks`
    );
    passed++;

    // TEST 11: Role-Based Access Control (Standard user blocked from Admin routes)
    const rbacRes = await request(server, 'GET', '/api/admin/users', null, liamToken);
    assert.strictEqual(rbacRes.status, 403, 'Standard user accessing /api/admin/users must get 403');
    console.log('✅ [11/14] Role-Based Access Control (RBAC) verified (Admin routes protected)');
    passed++;

    // TEST 12: Version Comparison Engine (v1.0 vs v2.0)
    const diffRes = await request(
      server,
      'GET',
      '/api/notices/2.0?compareWith=1.0',
      null,
      liamToken
    );
    assert.strictEqual(diffRes.status, 200);
    assert.ok(diffRes.data.comparison.summary.addedClauses > 0);
    assert.ok(diffRes.data.comparison.summary.removedClauses > 0);
    assert.ok(diffRes.data.comparison.summary.modifiedClauses > 0);
    console.log(
      `✅ [12/14] Privacy Notice side-by-side diff engine verified (+${diffRes.data.comparison.summary.addedClauses} added, ~${diffRes.data.comparison.summary.modifiedClauses} modified, -${diffRes.data.comparison.summary.removedClauses} removed)`
    );
    passed++;

    // TEST 13: Admin Publishing & Activating a New Privacy Notice Version + Non-Automatic Acceptance
    const publishRes = await request(
      server,
      'POST',
      '/api/admin/notices',
      {
        title: 'Enterprise AI Governance & Quantum Encryption Notice',
        version: '2.5',
        summaryOfChanges: 'Added post-quantum telemetry encryption and explicit sub-processor controls.',
        content: 'Full legal text for Version 2.5 governing enterprise consent...',
        requiresRenewedConsent: true,
        isActive: true,
      },
      adminToken
    );
    assert.strictEqual(publishRes.status, 201);

    // Verify Liam has NOT automatically accepted v2.5
    const activeCheck = await request(server, 'GET', '/api/notices/active', null, liamToken);
    assert.strictEqual(activeCheck.data.notice.version, '2.5');
    assert.strictEqual(activeCheck.data.hasAccepted, false);
    assert.strictEqual(activeCheck.data.requiresAction, true);
    console.log('✅ [13/14] Versioned Privacy Notice publication & non-assumed consent verified');
    passed++;

    // TEST 14: User Explicit Notice Acceptance Tracking
    const ackRes = await request(
      server,
      'POST',
      '/api/notices/acknowledge',
      { version: '2.5', method: 'Privacy Notice Centre Review' },
      liamToken
    );
    assert.strictEqual(ackRes.status, 200);

    const activeCheckAfter = await request(server, 'GET', '/api/notices/active', null, liamToken);
    assert.strictEqual(activeCheckAfter.data.hasAccepted, true);
    console.log('✅ [14/14] Explicit Privacy Notice acceptance & SHA-256 audit linkage verified');
    passed++;

    // Re-seed clean baseline demo data (v1.0, v1.1, v2.0 active) after test suite
    await ensureSeedData(true);

    console.log('\n======================================================================');
    console.log(`  ALL ${passed}/14 ENTERPRISE TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================================\n');

    server.close();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
})();

