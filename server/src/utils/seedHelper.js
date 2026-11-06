const User = require('../models/User');
const Preference = require('../models/Preference');
const PrivacyNotice = require('../models/PrivacyNotice');
const ConsentRecord = require('../models/ConsentRecord');
const ConsentLog = require('../models/ConsentLog');
const { appendAuditEvent, verifyAuditChainIntegrity } = require('../services/auditService');

const NOTICE_VERSIONS = [
  {
    title: 'Global Enterprise Privacy & Cookie Governance Notice (Foundational)',
    version: '1.0',
    status: 'Archived',
    isActive: false,
    requiresRenewedConsent: false,
    publicationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    effectiveDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
    publishedBy: 'Elena Vance, Chief Privacy Officer',
    summaryOfChanges:
      'Initial foundational release establishing GDPR & CCPA baseline cookie governance and essential session security controls.',
    highlights: [
      'Defines strictly necessary Essential Cookies exemption',
      'Introduces basic opt-in controls for Analytics and Marketing cookies',
      'Establishes 30-day data subject access request SLA',
    ],
    content: `SECTION 1: INTRODUCTION & DATA CONTROLLER SCOPE
ConsentLog Enterprise Edition ("Platform") operates as a centralized privacy and consent management framework. Under Version 1.0, we collect minimal session metadata necessary to authenticate enterprise users and protect against cross-site request forgery.

SECTION 2: COOKIE & TRACKING CATEGORIES
2.1 Essential Cookies: Strictly required for authentication tokens, load balancing, and security monitoring. These cannot be switched off.
2.2 Analytics Cookies: Collect basic page visit counts and session duration to improve application usability.
2.3 Marketing Cookies: Used to measure the effectiveness of product newsletters and enterprise outreach campaigns.

SECTION 3: DATA RETENTION & STORAGE
User preference states are stored in encrypted databases located within primary regional data centers for up to 24 months.

SECTION 4: EXERCISING DATA SUBJECT RIGHTS
Users may update their cookie toggles through their account profile or contact privacy@consentlog.enterprise to request data deletion.`,
    clauses: [
      {
        clauseId: 'CL-01',
        heading: '1. Data Controller & Enterprise Governance Scope',
        body: 'ConsentLog Enterprise operates as a centralized privacy framework collecting minimal session metadata to authenticate users and protect against CSRF attacks under GDPR Art. 6(1)(f).',
        category: 'General',
      },
      {
        clauseId: 'CL-02',
        heading: '2. Strictly Necessary Essential Cookies',
        body: 'Essential cookies are mandatory for JWT session integrity, security rate-limiting, and load balancing. Because the platform cannot function securely without them, they are always active.',
        category: 'Essential',
      },
      {
        clauseId: 'CL-03',
        heading: '3. First-Party Analytics Telemetry',
        body: 'When enabled, Analytics Cookies collect basic page visit counts and aggregate session duration to improve application usability.',
        category: 'Analytics',
      },
      {
        clauseId: 'CL-04',
        heading: '4. Marketing & Campaign Attribution',
        body: 'Marketing cookies track engagement with product newsletters and B2B webinar invitations across standard web properties.',
        category: 'Marketing',
      },
      {
        clauseId: 'CL-05',
        heading: '5. Legacy Data Retention Policy (24 Months)',
        body: 'User preference logs and session records are retained in primary regional data centers for up to 24 months before automated purging.',
        category: 'Security',
      },
    ],
  },
  {
    title: 'Global Enterprise Privacy & Preference Notice (Personalization Expansion)',
    version: '1.1',
    status: 'Archived',
    isActive: false,
    requiresRenewedConsent: true,
    publicationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    effectiveDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    publishedBy: 'Elena Vance, Chief Privacy Officer',
    summaryOfChanges:
      'Added dedicated Personalization preference category, refined Analytics anonymization rules, and introduced granular opt-out tracking.',
    highlights: [
      'Added new Category 4: UI & Regional Personalization preferences',
      'Enhanced Analytics clause with IP truncation and zero-PII telemetry guarantees',
      'Updated Right-to-Withdraw workflow with immediate preference revocation',
    ],
    content: `SECTION 1: INTRODUCTION & DATA CONTROLLER SCOPE
ConsentLog Enterprise Edition ("Platform") operates as a centralized privacy and consent management framework compliant with GDPR, CCPA/CPRA, and ISO/IEC 27701.

SECTION 2: COOKIE & PREFERENCE CATEGORIES
2.1 Essential Cookies: Strictly required for authentication tokens, security rate-limiting, and load balancing. Always active.
2.2 Analytics Cookies: Collects IP-truncated, zero-PII performance metrics and dashboard latency telemetry.
2.3 Marketing Cookies: Used to deliver tailored enterprise compliance briefings and measure campaign attribution.
2.4 Personalization: Stores user interface theme preferences (Light/Dark mode), saved audit filter presets, and regional jurisdiction defaults.

SECTION 3: RIGHT TO WITHDRAW CONSENT
Users may withdraw previously granted consent at any time with a single click in the Interactive Preference Centre.`,
    clauses: [
      {
        clauseId: 'CL-01',
        heading: '1. Data Controller & Enterprise Governance Scope',
        body: 'ConsentLog Enterprise operates as a centralized privacy framework collecting minimal session metadata to authenticate users and protect against CSRF attacks under GDPR Art. 6(1)(f).',
        category: 'General',
      },
      {
        clauseId: 'CL-02',
        heading: '2. Strictly Necessary Essential Cookies',
        body: 'Essential cookies are mandatory for JWT session integrity, security rate-limiting, and load balancing. Because the platform cannot function securely without them, they are always active.',
        category: 'Essential',
      },
      {
        clauseId: 'CL-03',
        heading: '3. Anonymized First-Party Analytics Telemetry',
        body: 'When enabled, Analytics Cookies collect IP-truncated, zero-PII performance telemetry and dashboard latency metrics to optimize enterprise workflows.',
        category: 'Analytics',
      },
      {
        clauseId: 'CL-04',
        heading: '4. Marketing & Campaign Attribution',
        body: 'Marketing cookies track engagement with product newsletters and B2B webinar invitations across standard web properties.',
        category: 'Marketing',
      },
      {
        clauseId: 'CL-06',
        heading: '5. Adaptive UI & Regional Personalization',
        body: 'Personalization preferences persist your chosen theme (Light/Dark mode), custom audit filter presets, and regulatory jurisdiction defaults across sessions.',
        category: 'Personalization',
      },
    ],
  },
  {
    title: 'Global Enterprise Privacy, Sub-Processor & Cryptographic Audit Notice',
    version: '2.0',
    status: 'Active',
    isActive: true,
    requiresRenewedConsent: true,
    publicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    effectiveDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    publishedBy: 'Elena Vance, Chief Privacy Officer',
    summaryOfChanges:
      'Major 2.0 release introducing Third-Party Data Sharing controls, SHA-256 cryptographic hash-chained immutable audit logging, and India DPDP Act 2023 compliance.',
    highlights: [
      'Added Category 5: Third-Party Sub-Processor Data Sharing explicit consent toggle',
      'Mandated SHA-256 cryptographic hash-chained append-only audit trail for every consent event',
      'Aligned cross-border transfer safeguards with EU Standard Contractual Clauses (SCCs) & India DPDP Act 2023',
      'Removed legacy 24-month mutable log clause in favor of immutable regulatory audit retention',
    ],
    content: `SECTION 1: ENTERPRISE PRIVACY GOVERNANCE & MULTI-JURISDICTION SCOPE
ConsentLog Enterprise Edition v2.0 ("Platform") provides cryptographic, tamper-evident consent and preference governance in strict alignment with GDPR (EU) 2016/679, CCPA/CPRA (California), India Digital Personal Data Protection (DPDP) Act 2023, LGPD (Brazil), and ISO/IEC 27701.

SECTION 2: GRANULAR PREFERENCE CATEGORIES
2.1 Essential Cookies (Always Enabled): Required for core security, JWT authentication, CSRF defense, and ACID session consistency.
2.2 Analytics Cookies (Optional): Captures zero-PII, IP-masked telemetry and real-time performance diagnostics.
2.3 Marketing Cookies (Optional): Enables enterprise compliance event invitations, partner co-marketing attribution, and product launch communications.
2.4 Personalization (Optional): Persists adaptive dashboard layouts, dark/light theme selections, and jurisdiction-specific workspace configurations.
2.5 Third-Party Data Sharing (Optional - NEW in v2.0): Controls encrypted transmission of compliance telemetry to audited cloud sub-processors under Standard Contractual Clauses (SCCs).

SECTION 3: APPEND-ONLY CRYPTOGRAPHIC AUDIT LEDGER
Every preference modification—whether granted, customized, or withdrawn—generates a permanent, append-only audit record chained via canonical SHA-256 cryptographic hashing. Neither users nor application services can alter or delete historical audit events.

SECTION 4: EXPLICIT VERSION ACCEPTANCE & RIGHT TO WITHDRAW
Publishing a new Privacy Notice version never implies automatic user consent. Users are transparently notified via the Notice Update Banner, may compare exact clause-level diffs side-by-side, and can withdraw consent at any time with zero friction.`,
    clauses: [
      {
        clauseId: 'CL-01',
        heading: '1. Multi-Jurisdiction Enterprise Governance Scope',
        body: 'ConsentLog Enterprise v2.0 operates under GDPR (EU) 2016/679, CCPA/CPRA, India DPDP Act 2023, and ISO/IEC 27701, enforcing strict privacy-by-default across all user accounts.',
        category: 'General',
      },
      {
        clauseId: 'CL-02',
        heading: '2. Strictly Necessary Essential Cookies',
        body: 'Essential cookies are mandatory for JWT session integrity, security rate-limiting, and load balancing. Because the platform cannot function securely without them, they are always active.',
        category: 'Essential',
      },
      {
        clauseId: 'CL-03',
        heading: '3. Anonymized First-Party Analytics Telemetry',
        body: 'When enabled, Analytics Cookies collect IP-truncated, zero-PII performance telemetry and dashboard latency metrics to optimize enterprise workflows.',
        category: 'Analytics',
      },
      {
        clauseId: 'CL-04',
        heading: '4. Enterprise Marketing & Attribution Controls',
        body: 'Marketing cookies govern delivery of compliance briefings, regulatory summit invitations, and attribution across vetted enterprise channels.',
        category: 'Marketing',
      },
      {
        clauseId: 'CL-06',
        heading: '5. Adaptive UI & Regional Personalization',
        body: 'Personalization preferences persist your chosen theme (Light/Dark mode), custom audit filter presets, and regulatory jurisdiction defaults across sessions.',
        category: 'Personalization',
      },
      {
        clauseId: 'CL-07',
        heading: '6. Third-Party Sub-Processor Data Sharing (New in v2.0)',
        body: 'Explicit opt-in governing encrypted telemetry sharing with SOC2 Type II certified sub-processors under EU Standard Contractual Clauses (SCCs).',
        category: 'ThirdParty',
      },
      {
        clauseId: 'CL-08',
        heading: '7. Tamper-Evident SHA-256 Append-Only Audit Trail',
        body: 'All consent grants, updates, and withdrawals are permanently recorded in an append-only ledger protected by sequential SHA-256 cryptographic hash chaining.',
        category: 'Security',
      },
    ],
  },
];

const ensureSeedData = async (forceReset = false) => {
  if (forceReset) {
    await Promise.all([
      User.deleteMany({}),
      Preference.deleteMany({}),
      PrivacyNotice.deleteMany({}),
      ConsentRecord.deleteMany({}),
    ]);
    // Direct collection drop for ConsentLog only during explicit CLI seed reset
    await ConsentLog.collection.drop().catch(() => {});
  }

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0 && !forceReset) {
    console.log(`[Seed] Database already contains ${existingUsers} users. Skipping initial seed.`);
    return;
  }

  console.log('[Seed] Populating enterprise sample users, versioned notices (v1.0, v1.1, v2.0), preferences, and SHA-256 hash-chained audit history...');

  // 1. Create Privacy Notices v1.0, v1.1, v2.0
  await PrivacyNotice.insertMany(NOTICE_VERSIONS);

  // 2. Create Sample Users (1 Admin + 4 Enterprise Users)
  const adminUser = await User.create({
    name: 'Elena Vance (Chief Privacy Officer)',
    email: 'admin@consentlog.io',
    password: 'Password123!',
    role: 'admin',
    organization: 'ConsentLog Global Governance HQ',
    department: 'Legal & Privacy Engineering',
    jurisdiction: 'GDPR (EU)',
  });

  const alexUser = await User.create({
    name: 'Alex Rivera',
    email: 'alex@enterprise.io',
    password: 'Password123!',
    role: 'user',
    organization: 'FinTech Horizon Ltd',
    department: 'Product Operations',
    jurisdiction: 'GDPR (EU)',
  });

  const priyaUser = await User.create({
    name: 'Priya Nair',
    email: 'priya@cloudscale.in',
    password: 'Password123!',
    role: 'dpo',
    organization: 'CloudScale Technologies India',
    department: 'Data Protection & Governance',
    jurisdiction: 'DPDP (India)',
  });

  const marcusUser = await User.create({
    name: 'Marcus Sterling',
    email: 'marcus@pacifichealth.us',
    password: 'Password123!',
    role: 'auditor',
    organization: 'Pacific Health Systems',
    department: 'Independent Compliance Audit',
    jurisdiction: 'CCPA (California)',
  });

  const sophieUser = await User.create({
    name: 'Sophie Laurent',
    email: 'sophie@eurobank.eu',
    password: 'Password123!',
    role: 'user',
    organization: 'EuroBank Digital SA',
    department: 'Customer Trust',
    jurisdiction: 'GDPR (EU)',
  });

  const liamUser = await User.create({
    name: 'Liam Chen',
    email: 'liam@apexfinancial.com',
    password: 'Password123!',
    role: 'user',
    organization: 'Apex Financial Services',
    department: 'Risk & Quantitative Analytics',
    jurisdiction: 'CCPA (California)',
  });

  const daysAgo = (d, hoursOffset = 0) =>
    new Date(Date.now() - d * 24 * 60 * 60 * 1000 + hoursOffset * 3600 * 1000);

  // 3. Create Preferences for all users
  await Preference.create([
    {
      userId: adminUser._id,
      essential: true,
      analytics: true,
      marketing: false,
      personalization: true,
      thirdPartySharing: false,
      categoryMeta: {
        essential: { lastModified: daysAgo(6), status: 'Always Active' },
        analytics: { lastModified: daysAgo(4), status: 'Granted' },
        marketing: { lastModified: daysAgo(2), status: 'Withdrawn' },
        personalization: { lastModified: daysAgo(4), status: 'Granted' },
        thirdPartySharing: { lastModified: daysAgo(6), status: 'Disabled' },
      },
    },
    {
      userId: alexUser._id,
      essential: true,
      analytics: true,
      marketing: false,
      personalization: true,
      thirdPartySharing: false,
      categoryMeta: {
        essential: { lastModified: daysAgo(5), status: 'Always Active' },
        analytics: { lastModified: daysAgo(3), status: 'Granted' },
        marketing: { lastModified: daysAgo(1), status: 'Withdrawn' },
        personalization: { lastModified: daysAgo(2), status: 'Granted' },
        thirdPartySharing: { lastModified: daysAgo(5), status: 'Disabled' },
      },
    },
    {
      userId: priyaUser._id,
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
      thirdPartySharing: true,
      categoryMeta: {
        essential: { lastModified: daysAgo(4), status: 'Always Active' },
        analytics: { lastModified: daysAgo(2), status: 'Granted' },
        marketing: { lastModified: daysAgo(2), status: 'Granted' },
        personalization: { lastModified: daysAgo(2), status: 'Granted' },
        thirdPartySharing: { lastModified: daysAgo(2), status: 'Granted' },
      },
    },
    {
      userId: marcusUser._id,
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
      thirdPartySharing: false,
      categoryMeta: {
        essential: { lastModified: daysAgo(3), status: 'Always Active' },
        analytics: { lastModified: daysAgo(1), status: 'Withdrawn' },
        marketing: { lastModified: daysAgo(1), status: 'Withdrawn' },
        personalization: { lastModified: daysAgo(3), status: 'Disabled' },
        thirdPartySharing: { lastModified: daysAgo(3), status: 'Disabled' },
      },
    },
    {
      userId: sophieUser._id,
      essential: true,
      analytics: true,
      marketing: false,
      personalization: false,
      thirdPartySharing: false,
      categoryMeta: {
        essential: { lastModified: daysAgo(5), status: 'Always Active' },
        analytics: { lastModified: daysAgo(3), status: 'Granted' },
        marketing: { lastModified: daysAgo(5), status: 'Disabled' },
        personalization: { lastModified: daysAgo(5), status: 'Disabled' },
        thirdPartySharing: { lastModified: daysAgo(5), status: 'Disabled' },
      },
    },
    {
      userId: liamUser._id,
      essential: true,
      analytics: false,
      marketing: true,
      personalization: true,
      thirdPartySharing: false,
      categoryMeta: {
        essential: { lastModified: daysAgo(4), status: 'Always Active' },
        analytics: { lastModified: daysAgo(4), status: 'Disabled' },
        marketing: { lastModified: daysAgo(2), status: 'Granted' },
        personalization: { lastModified: daysAgo(2), status: 'Granted' },
        thirdPartySharing: { lastModified: daysAgo(4), status: 'Disabled' },
      },
    },
  ]);

  // 4. Create ConsentRecords (note: Alex has accepted v1.1 so he sees the v2.0 Notice Renewal Banner until he accepts v2.0!)
  await ConsentRecord.create([
    {
      userId: adminUser._id,
      noticeVersion: '1.0',
      status: 'Accepted',
      preferencesSnapshot: {
        essential: true,
        analytics: true,
        marketing: true,
        personalization: false,
        thirdPartySharing: false,
      },
      acceptedAt: daysAgo(50),
      acknowledgementMethod: 'Onboarding Consent',
    },
    {
      userId: adminUser._id,
      noticeVersion: '2.0',
      status: 'Accepted',
      preferencesSnapshot: {
        essential: true,
        analytics: true,
        marketing: false,
        personalization: true,
        thirdPartySharing: false,
      },
      acceptedAt: daysAgo(4),
      acknowledgementMethod: 'Privacy Notice Centre Review',
    },
    {
      userId: alexUser._id,
      noticeVersion: '1.0',
      status: 'Accepted',
      preferencesSnapshot: {
        essential: true,
        analytics: true,
        marketing: true,
        personalization: false,
        thirdPartySharing: false,
      },
      acceptedAt: daysAgo(40),
      acknowledgementMethod: 'Onboarding Consent',
    },
    {
      userId: alexUser._id,
      noticeVersion: '1.1',
      status: 'Customized',
      preferencesSnapshot: {
        essential: true,
        analytics: true,
        marketing: false,
        personalization: true,
        thirdPartySharing: false,
      },
      acceptedAt: daysAgo(15),
      acknowledgementMethod: 'Preference Centre Save',
    },
    {
      userId: priyaUser._id,
      noticeVersion: '2.0',
      status: 'Accepted',
      preferencesSnapshot: {
        essential: true,
        analytics: true,
        marketing: true,
        personalization: true,
        thirdPartySharing: true,
      },
      acceptedAt: daysAgo(2),
      acknowledgementMethod: 'Explicit Banner Acceptance',
    },
    {
      userId: marcusUser._id,
      noticeVersion: '2.0',
      status: 'Withdrawn',
      preferencesSnapshot: {
        essential: true,
        analytics: false,
        marketing: false,
        personalization: false,
        thirdPartySharing: false,
      },
      acceptedAt: daysAgo(3),
      withdrawnAt: daysAgo(1),
      acknowledgementMethod: 'Withdrawal Action',
    },
    {
      userId: sophieUser._id,
      noticeVersion: '1.1',
      status: 'Accepted',
      preferencesSnapshot: {
        essential: true,
        analytics: true,
        marketing: false,
        personalization: false,
        thirdPartySharing: false,
      },
      acceptedAt: daysAgo(20),
      acknowledgementMethod: 'Onboarding Consent',
    },
  ]);

  // 5. Append chronological SHA-256 hash-chained audit events across the last 7 days
  const sampleEvents = [
    {
      userId: adminUser._id,
      preferenceName: 'Essential Cookies & Privacy Baseline',
      previousValue: 'Unregistered',
      newValue: 'Enabled (Privacy-by-Default)',
      action: 'Initial Registration Defaults',
      noticeVersion: '1.0',
      source: 'Onboarding',
      reason: 'Chief Privacy Officer initialized platform governance account.',
      timestamp: daysAgo(6, 2),
    },
    {
      userId: alexUser._id,
      preferenceName: 'Essential Cookies & Privacy Baseline',
      previousValue: 'Unregistered',
      newValue: 'Enabled (Privacy-by-Default)',
      action: 'Initial Registration Defaults',
      noticeVersion: '1.0',
      source: 'Onboarding',
      reason: 'Alex Rivera registered under GDPR (EU) privacy-by-default baseline.',
      timestamp: daysAgo(6, 4),
    },
    {
      userId: alexUser._id,
      preferenceName: 'Analytics Cookies',
      previousValue: 'Disabled',
      newValue: 'Enabled',
      action: 'Consent Granted',
      noticeVersion: '1.1',
      source: 'User',
      reason: 'Opted into anonymized product performance telemetry.',
      timestamp: daysAgo(5, 3),
    },
    {
      userId: alexUser._id,
      preferenceName: 'Marketing Cookies',
      previousValue: 'Disabled',
      newValue: 'Enabled',
      action: 'Consent Granted',
      noticeVersion: '1.1',
      source: 'User',
      reason: 'Subscribed to enterprise privacy engineering product briefings.',
      timestamp: daysAgo(5, 5),
    },
    {
      userId: adminUser._id,
      preferenceName: 'Active Privacy Notice Policy',
      previousValue: 'v1.1',
      newValue: 'v2.0',
      action: 'System Policy Sync',
      noticeVersion: '2.0',
      source: 'Admin',
      reason: 'Published and activated Privacy Notice v2.0 with Third-Party Data Sharing & SHA-256 Audit Ledger.',
      timestamp: daysAgo(4, 1),
    },
    {
      userId: adminUser._id,
      preferenceName: 'Privacy Notice v2.0',
      previousValue: 'Pending Review',
      newValue: 'Accepted (v2.0)',
      action: 'Notice Accepted',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'CPO formally acknowledged Privacy Notice v2.0.',
      timestamp: daysAgo(4, 2),
    },
    {
      userId: sophieUser._id,
      preferenceName: 'Analytics Cookies',
      previousValue: 'Disabled',
      newValue: 'Enabled',
      action: 'Consent Granted',
      noticeVersion: '1.1',
      source: 'User',
      reason: 'Enabled dashboard analytics telemetry.',
      timestamp: daysAgo(3, 2),
    },
    {
      userId: marcusUser._id,
      preferenceName: 'Analytics Cookies',
      previousValue: 'Disabled',
      newValue: 'Enabled',
      action: 'Consent Granted',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'Initial analytics preference selection.',
      timestamp: daysAgo(3, 5),
    },
    {
      userId: alexUser._id,
      preferenceName: 'Personalization',
      previousValue: 'Disabled',
      newValue: 'Enabled',
      action: 'Consent Granted',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'Enabled dark/light theme and regional filter persistence.',
      timestamp: daysAgo(2, 1),
    },
    {
      userId: priyaUser._id,
      preferenceName: 'All Optional Categories',
      previousValue: 'Disabled',
      newValue: 'Enabled',
      action: 'Bulk Consent Accepted',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'Priya Nair accepted all optional preferences under Notice v2.0.',
      timestamp: daysAgo(2, 4),
    },
    {
      userId: priyaUser._id,
      preferenceName: 'Privacy Notice v2.0',
      previousValue: 'Pending Review',
      newValue: 'Accepted (v2.0)',
      action: 'Notice Accepted',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'Explicitly reviewed and accepted Privacy Notice v2.0.',
      timestamp: daysAgo(2, 5),
    },
    {
      userId: marcusUser._id,
      preferenceName: 'Analytics Cookies',
      previousValue: 'Enabled',
      newValue: 'Disabled',
      action: 'Consent Withdrawn',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'Exercised CCPA/GDPR Right-to-Withdraw for Analytics telemetry.',
      timestamp: daysAgo(1, 2),
    },
    {
      userId: alexUser._id,
      preferenceName: 'Marketing Cookies',
      previousValue: 'Enabled',
      newValue: 'Disabled',
      action: 'Consent Withdrawn',
      noticeVersion: '2.0',
      source: 'User',
      reason: 'User withdrew Marketing Cookies consent in Interactive Preference Centre.',
      timestamp: daysAgo(0, -1),
    },
  ];

  for (const ev of sampleEvents) {
    await appendAuditEvent(ev);
  }

  // 6. Run initial cryptographic hash chain verification so AuditVerification has a live baseline report
  const verificationReport = await verifyAuditChainIntegrity('System Bootstrap Auditor');
  console.log(
    `[Seed] Complete! Verified ${verificationReport.verifiedRecords}/${verificationReport.totalRecords} SHA-256 hash-chained audit records (${verificationReport.verificationStatus}).`
  );
};

module.exports = {
  ensureSeedData,
  NOTICE_VERSIONS,
};

