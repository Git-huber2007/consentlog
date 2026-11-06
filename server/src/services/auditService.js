const crypto = require('crypto');
const ConsentLog = require('../models/ConsentLog');
const AuditVerification = require('../models/AuditVerification');
const { GENESIS_HASH, computeEventHash } = require('../utils/hashChain');

// In-process mutex lock to guarantee strictly sequential hash chaining even under concurrent requests
let chainLock = Promise.resolve();

/**
 * Append a single immutable audit event to the cryptographic hash chain.
 * Only authorized backend services can invoke this function.
 */
const appendAuditEvent = async (
  {
    userId,
    preferenceName,
    previousValue,
    newValue,
    action,
    noticeVersion = '2.0',
    source = 'User',
    reason = 'User-initiated preference modification',
    ipAddress = '127.0.0.1',
    userAgent = 'ConsentLog-Enterprise-Client/2.0',
    timestamp = null,
  },
  session = null
) => {
  let release;
  const nextLock = new Promise((resolve) => {
    release = resolve;
  });
  const previousLock = chainLock;
  chainLock = previousLock.then(() => nextLock);

  await previousLock;

  try {
    const query = ConsentLog.findOne().sort({ sequenceNumber: -1 });
    if (session) query.session(session);
    const lastEvent = await query.lean();

    const sequenceNumber = lastEvent ? lastEvent.sequenceNumber + 1 : 1;
    const previousHash = lastEvent ? lastEvent.eventHash : GENESIS_HASH;
    const eventTime = timestamp ? new Date(timestamp) : new Date();
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const auditId = `AUD-${String(sequenceNumber).padStart(6, '0')}-${randomSuffix}`;

    const eventHash = computeEventHash({
      auditId,
      sequenceNumber,
      userId,
      preferenceName,
      previousValue,
      newValue,
      action,
      noticeVersion,
      source,
      reason,
      timestamp: eventTime,
      previousHash,
    });

    const docData = {
      auditId,
      sequenceNumber,
      userId,
      preferenceName,
      previousValue: String(previousValue),
      newValue: String(newValue),
      action,
      noticeVersion,
      source,
      reason,
      ipAddress,
      userAgent,
      timestamp: eventTime,
      previousHash,
      eventHash,
    };

    const [created] = await ConsentLog.create([docData], session ? { session } : {});

    // Asynchronously dispatch webhook event without blocking
    const eventType = action.includes('Withdrawn')
      ? 'consent.withdrawn'
      : action.includes('Accepted')
      ? 'notice.accepted'
      : action.includes('Anonymized')
      ? 'user.erased'
      : 'consent.granted';

    setImmediate(() => {
      try {
        const { dispatchWebhookEvent } = require('./webhookService');
        dispatchWebhookEvent(eventType, {
          auditId,
          sequenceNumber,
          userId,
          preferenceName,
          previousValue: String(previousValue),
          newValue: String(newValue),
          action,
          eventHash,
          timestamp: eventTime,
        }).catch(() => {});
      } catch (e) {}
    });

    return created;
  } finally {
    release();
  }
};

/**
 * Run a full cryptographic SHA-256 hash chain verification across all historical ConsentLog records.
 * Checks:
 * 1. Sequence number continuity (1..N)
 * 2. Previous hash pointer matching the preceding record's eventHash (starting at GENESIS_HASH)
 * 3. Canonical SHA-256 recalculation of every record's payload matching its stored eventHash
 */
const verifyAuditChainIntegrity = async (triggeredBy = 'Administrator') => {
  const startTime = Date.now();
  const records = await ConsentLog.find().sort({ sequenceNumber: 1 }).lean();

  const totalRecords = records.length;
  let verifiedRecords = 0;
  let failedRecords = 0;
  const brokenLinks = [];

  let expectedPreviousHash = GENESIS_HASH;
  let expectedSequence = 1;

  for (const record of records) {
    let recordValid = true;
    const failureReasons = [];

    if (record.sequenceNumber !== expectedSequence) {
      recordValid = false;
      failureReasons.push(
        `Sequence gap detected: expected #${expectedSequence}, found #${record.sequenceNumber}`
      );
    }

    if (record.previousHash !== expectedPreviousHash) {
      recordValid = false;
      failureReasons.push(
        `Chain link broken: previousHash (${record.previousHash.slice(0, 12)}...) does not match prior eventHash (${expectedPreviousHash.slice(0, 12)}...)`
      );
    }

    const recalculatedHash = computeEventHash({
      auditId: record.auditId,
      sequenceNumber: record.sequenceNumber,
      userId: record.userId,
      preferenceName: record.preferenceName,
      previousValue: record.previousValue,
      newValue: record.newValue,
      action: record.action,
      noticeVersion: record.noticeVersion,
      source: record.source,
      reason: record.reason,
      timestamp: record.timestamp,
      previousHash: record.previousHash,
    });

    if (recalculatedHash !== record.eventHash) {
      recordValid = false;
      failureReasons.push(
        `Payload hash mismatch: computed SHA-256 (${recalculatedHash.slice(0, 12)}...) != stored eventHash (${record.eventHash.slice(0, 12)}...)`
      );
    }

    if (recordValid) {
      verifiedRecords += 1;
    } else {
      failedRecords += 1;
      brokenLinks.push({
        auditId: record.auditId,
        sequenceNumber: record.sequenceNumber,
        reason: failureReasons.join(' | '),
        expectedHash: recalculatedHash,
        actualHash: record.eventHash,
      });
    }

    expectedPreviousHash = record.eventHash;
    expectedSequence = record.sequenceNumber + 1;
  }

  const executionTimeMs = Math.max(1, Date.now() - startTime);
  const verificationStatus = failedRecords === 0 ? 'Verified' : 'Verification Failed';
  const headHash = records.length > 0 ? records[records.length - 1].eventHash : GENESIS_HASH;
  const verificationId = `VER-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  const report = await AuditVerification.create({
    verificationId,
    verificationDate: new Date(),
    totalRecords,
    verifiedRecords,
    failedRecords,
    verificationStatus,
    genesisHash: GENESIS_HASH,
    headHash,
    executionTimeMs,
    triggeredBy,
    brokenLinks,
  });

  return report;
};

module.exports = {
  appendAuditEvent,
  verifyAuditChainIntegrity,
};

