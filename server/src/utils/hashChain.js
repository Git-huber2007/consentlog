const crypto = require('crypto');

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Generates a canonical deterministic string representation of an audit event
 * and calculates its SHA-256 cryptographic hash chained to `previousHash`.
 *
 * Canonical fields included in deterministic order:
 * - auditId
 * - sequenceNumber
 * - userId (stringified ObjectId)
 * - preferenceName
 * - previousValue
 * - newValue
 * - action
 * - noticeVersion
 * - source
 * - reason
 * - timestamp (ISO 8601 UTC string)
 * - previousHash
 */
const computeEventHash = ({
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
  timestamp,
  previousHash,
}) => {
  const isoTimestamp =
    timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();

  const canonicalPayload = JSON.stringify({
    auditId: String(auditId),
    sequenceNumber: Number(sequenceNumber),
    userId: String(userId?._id || userId),
    preferenceName: String(preferenceName),
    previousValue: String(previousValue),
    newValue: String(newValue),
    action: String(action),
    noticeVersion: String(noticeVersion),
    source: String(source),
    reason: String(reason || ''),
    timestamp: isoTimestamp,
    previousHash: String(previousHash),
  });

  return crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
};

module.exports = {
  GENESIS_HASH,
  computeEventHash,
};

